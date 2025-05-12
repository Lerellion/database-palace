import { asc, desc, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { PgColumn } from 'drizzle-orm/pg-core'
import { Pool } from 'pg'
import postgres, { Options } from 'postgres'

import { createDb } from '../db'
import { Connection, connections } from '../schema/connection'
import { ConnectionConfig } from '@/state/'

// Create a default pool for initial connection
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
})

// Export the drizzle instance with the schema
export const db = drizzle(pool)

// Export the pool for raw queries
export const pgPool = pool

export type TableName = keyof typeof connections

type PaginationParams = {
	page?: number
	limit?: number
	orderBy?: string
	orderDirection?: 'asc' | 'desc'
	filters?: Record<string, unknown>
}

type PaginationResult = {
	page: number
	limit: number
	total: number
	totalPages: number
}

type FetchResult<T> = {
	data: T[]
	pagination: PaginationResult
}

function isTableColumn(table: unknown, key: string) {
	return table && typeof table === 'object' && key in table && 'name' in table[key]
}

export async function fetchTableData<T>({
	tableName,
	page = 1,
	limit = 10,
	orderBy,
	orderDirection = 'asc',
	filters = {}
}: {
	tableName: TableName
} & PaginationParams): Promise<FetchResult<T>> {
	const offset = (page - 1) * limit
	const table = connections[tableName]

	if (!table || typeof table !== 'object') {
		throw new Error(`Table ${tableName} not found`)
	}

	try {
		let baseQuery = db.select().from(table)

		for (const [key, value] of Object.entries(filters)) {
			if (value !== undefined && value !== null && isTableColumn(table, key)) {
				const column = table[key] as PgColumn
				baseQuery = baseQuery.where(eq(column, value)) as typeof baseQuery
			}
		}

		if (orderBy && isTableColumn(table, orderBy)) {
			const column = table[orderBy] as PgColumn
			const direction = orderDirection === 'desc' ? desc(column) : asc(column)
			baseQuery = baseQuery.orderBy(direction) as typeof baseQuery
		}

		const query = baseQuery.limit(limit).offset(offset)

		const results = await query

		const [totalCount] = await db.select({ count: sql`count(*)` }).from(table)

		return {
			data: results as T[],
			pagination: {
				page,
				limit,
				total: Number(totalCount?.count || 0),
				totalPages: Math.ceil(Number(totalCount?.count || 0) / limit)
			}
		}
	} catch (error) {
		console.error('Error fetching table data:', error)
		throw error
	}
}

type DatabaseConfig = {
	connectionString: string
	ssl?: {
		rejectUnauthorized: boolean
		ca?: string[]
		key?: string
		cert?: string
	}
	pool?: {
		max?: number
		min?: number
		idleTimeoutMillis?: number
		connectionTimeoutMillis?: number
		maxUses?: number
	}
}

class DatabaseService {
	private pool: Pool | null = null
	private currentConfig: ConnectionConfig | null = null
	private currentSchema: string = 'public'
	private static instance: DatabaseService | null = null

	private constructor() {}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService()
		}
		return DatabaseService.instance
	}

	private getConnectionConfig(config: ConnectionConfig): DatabaseConfig {
		const connectionString = this.getConnectionString(config)

		// Determine if it's a cloud provider
		const isCloudProvider =
			!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')

		// SSL configuration
		const sslConfig = {
			rejectUnauthorized: process.env.NODE_ENV === 'production',
			ca: process.env.DB_SSL_CA ? [process.env.DB_SSL_CA] : undefined,
			key: process.env.DB_SSL_KEY,
			cert: process.env.DB_SSL_CERT
		}

		// Pool configuration
		const poolConfig = {
			max: parseInt(process.env.DB_POOL_MAX || '20', 10),
			min: parseInt(process.env.DB_POOL_MIN || '5', 10),
			idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
			connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
			maxUses: parseInt(process.env.DB_MAX_USES || '7500', 10)
		}

		return {
			connectionString,
			ssl: isCloudProvider || process.env.DB_SSL_ENABLED === 'true' ? sslConfig : undefined,
			pool: poolConfig
		}
	}

	private getConnectionString(config: ConnectionConfig): string {
		if (config.type === 'url' && config.url) {
			return config.url
		}

		const { host, port, database, username, password } = config.fields!
		return `postgresql://${username}:${password}@${host}:${port}/${database}`
	}

	private async ensureConnection(): Promise<void> {
		if (!this.currentConfig) {
			throw new Error('No connection configuration set. Please connect to a database first.')
		}

		if (!this.pool) {
			await this.connect(this.currentConfig)
		}
	}

	async connect(config: ConnectionConfig): Promise<boolean> {
		try {
			// Close existing pool if it exists
			if (this.pool) {
				await this.disconnect()
			}

			const dbConfig = this.getConnectionConfig(config)

			this.pool = new Pool({
				connectionString: dbConfig.connectionString,
				ssl: dbConfig.ssl,
				...dbConfig.pool
			})

			// Store the current config
			this.currentConfig = config

			// Add error handler after pool creation
			this.pool.on('error', (err, client) => {
				console.error('Unexpected error on idle client', err)
				if (client) client.release(true)
			})

			// Test the connection and set initial schema
			const client = await this.pool.connect()
			try {
				await client.query('SELECT NOW()')
				// Set initial schema from config or default to public
				const initialSchema = config.fields?.schema || 'public'
				await this.setSchema(initialSchema)
				return true
			} finally {
				client.release()
			}
		} catch (error) {
			console.error('Connection error:', error)
			this.pool = null
			this.currentConfig = null
			throw error
		}
	}

	async disconnect(): Promise<void> {
		if (this.pool) {
			await this.pool.end()
			this.pool = null
			this.currentConfig = null
		}
	}

	async getTables(schema: string = 'public'): Promise<string[]> {
		await this.ensureConnection()
		if (!this.pool) throw new Error('Not connected to database')

		try {
			const result = await this.pool.query(
				`
				SELECT table_name 
				FROM information_schema.tables 
				WHERE table_schema = $1 
				AND table_type = 'BASE TABLE'
				ORDER BY table_name
			`,
				[schema]
			)

			return result.rows.map(row => row.table_name)
		} catch (error) {
			console.error('Error fetching tables:', error)
			throw error
		}
	}

	async getTableData(tableName: string, schema: string = 'public'): Promise<any[]> {
		await this.ensureConnection()
		if (!this.pool) throw new Error('Not connected to database')

		try {
			const result = await this.pool.query(`
				SELECT * FROM "${schema}"."${tableName}" 
				LIMIT 100
			`)
			return result.rows
		} catch (error) {
			console.error(`Error fetching data from table ${tableName}:`, error)
			throw error
		}
	}

	async getTableColumns(tableName: string, schema: string = 'public'): Promise<any[]> {
		await this.ensureConnection()
		if (!this.pool) throw new Error('Not connected to database')

		try {
			const result = await this.pool.query(
				`
				SELECT 
					column_name, 
					data_type, 
					is_nullable, 
					column_default,
					(
						SELECT EXISTS (
							SELECT 1 
							FROM information_schema.key_column_usage 
							WHERE table_schema = $1 
							AND table_name = $2 
							AND column_name = columns.column_name
						)
					) as is_key
				FROM information_schema.columns
				WHERE table_schema = $1 
				AND table_name = $2
				ORDER BY ordinal_position
			`,
				[schema, tableName]
			)

			return result.rows.map(row => ({
				name: row.column_name,
				type: row.data_type,
				isNullable: row.is_nullable === 'YES',
				defaultValue: row.column_default,
				isKey: row.is_key
			}))
		} catch (error) {
			console.error(`Error fetching columns for table ${tableName}:`, error)
			throw error
		}
	}

	getCurrentConnection(): ConnectionConfig | null {
		return this.currentConfig
	}

	getCurrentSchema(): string {
		return this.currentSchema
	}

	async setSchema(schema: string): Promise<void> {
		await this.ensureConnection()
		if (!this.pool) throw new Error('Not connected to database')

		try {
			const client = await this.pool.connect()
			try {
				// First check if schema exists
				const schemaExists = await client.query(
					'SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1)',
					[schema]
				)

				if (!schemaExists.rows[0].exists) {
					throw new Error(`Schema "${schema}" does not exist`)
				}

				// Set search_path for the current connection
				await client.query(`SET search_path TO "${schema}"`)
				this.currentSchema = schema
			} finally {
				client.release()
			}
		} catch (error) {
			console.error(`Error setting schema to ${schema}:`, error)
			throw error
		}
	}

	async healthCheck(): Promise<boolean> {
		if (!this.pool || !this.currentConfig) {
			return false
		}

		try {
			const client = await this.pool.connect()
			try {
				await client.query('SELECT 1')
				return true
			} finally {
				client.release()
			}
		} catch (error) {
			console.error('Health check failed:', error)
			return false
		}
	}

	async getAvailableSchemas(): Promise<string[]> {
		await this.ensureConnection()
		if (!this.pool) throw new Error('Not connected to database')

		try {
			const result = await this.pool.query(`
				SELECT schema_name 
				FROM information_schema.schemata 
				WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
				ORDER BY schema_name
			`)
			return result.rows.map(row => row.schema_name)
		} catch (error) {
			console.error('Error fetching schemas:', error)
			throw error
		}
	}

	async getSavedConnections(): Promise<Connection[]> {
		try {
			const result = await db.select().from(connections)
			return result
		} catch (error) {
			console.error('Error fetching saved connections:', error)
			return []
		}
	}
}

// Export a singleton instance
export const dbService = DatabaseService.getInstance()
