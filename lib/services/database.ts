import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import { Pool } from 'pg'
import postgres from 'postgres'

import * as schema from '../schema/postgres'
import { ConnectionConfig } from '../store/connection-store'

// Database connection configuration
function getDatabaseConfig() {
	const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

	if (!databaseUrl) {
		throw new Error(
			'Database URL not provided. Set POSTGRES_URL or DATABASE_URL in your environment variables.'
		)
	}

	// Parse the URL to determine if it's a cloud provider
	const isCloudProvider = !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1')

	// SSL configuration
	const sslEnabled = process.env.DB_SSL_ENABLED === 'true' || isCloudProvider
	const sslCA = process.env.DB_SSL_CA

	const config: any = {
		max: 10, // Maximum pool size
		idle_timeout: 20, // Max idle time in seconds
		connect_timeout: 10 // Connection timeout in seconds
	}

	// Add SSL configuration if needed
	if (sslEnabled) {
		config.ssl = {
			rejectUnauthorized: false, // Set to true in production with proper certificates
			ca: sslCA ? [require('fs').readFileSync(sslCA)] : undefined
		}
	}

	return { url: databaseUrl, config }
}

// Get database configuration
const { url: databaseUrl, config } = getDatabaseConfig()

// Create postgres client with configuration
const client = postgres(databaseUrl, config)

// Create drizzle database instance
export const db = drizzle(client, { schema })

export type TableName = keyof typeof schema

type PaginationParams = {
	page?: number
	limit?: number
	orderBy?: string
	orderDirection?: 'asc' | 'desc'
	filters?: Record<string, any>
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

function isTableColumn(table: any, key: string) {
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
	const table = schema[tableName]

	if (!table || typeof table !== 'object') {
		throw new Error(`Table ${tableName} not found`)
	}

	try {
		// Build the query
		let baseQuery = db.select().from(table)

		// Apply filters
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && isTableColumn(table, key)) {
				baseQuery = baseQuery.where(sql`${table[key]} = ${value}`)
			}
		})

		// Apply ordering
		if (orderBy && isTableColumn(table, orderBy)) {
			baseQuery = baseQuery.orderBy(sql`${table[orderBy]}`, sql`${orderDirection}`)
		}

		// Apply pagination
		const query = baseQuery.limit(limit).offset(offset)

		// Execute query
		const results = await query

		// Get total count
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
			maxUses: parseInt(process.env.DB_MAX_USES || '7500', 10) // Close connection after this many uses
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
				...dbConfig.pool,
				// Add connection error handler
				on: {
					error: (err, client) => {
						console.error('Unexpected error on idle client', err)
						if (client) client.release(true) // Force release with error
					}
				}
			})

			// Test the connection
			const client = await this.pool.connect()
			try {
				await client.query('SELECT NOW()')
				return true
			} finally {
				client.release()
			}
		} catch (error) {
			console.error('Connection error:', error)
			this.pool = null
			throw error
		}
	}

	async disconnect(): Promise<void> {
		if (this.pool) {
			await this.pool.end()
			this.pool = null
		}
	}

	async getTables(schema: string = 'public'): Promise<string[]> {
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
		if (!this.pool) throw new Error('Not connected to database')

		try {
			const result = await this.pool.query(
				`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = $1 
        AND table_name = $2
        ORDER BY ordinal_position
      `,
				[schema, tableName]
			)

			return result.rows
		} catch (error) {
			console.error(`Error fetching columns for table ${tableName}:`, error)
			throw error
		}
	}

	// Add new method for health check
	async healthCheck(): Promise<boolean> {
		if (!this.pool) return false

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
}

export const dbService = new DatabaseService()
