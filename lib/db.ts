import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

let neonDb: ReturnType<typeof drizzle> | null = null
let sqliteDb: ReturnType<typeof drizzle> | null = null

export function getNeonDb() {
	if (!neonDb) {
		const connectionString = process.env.DATABASE_URL
		if (!connectionString) {
			throw new Error('DATABASE_URL environment variable is not set')
		}

		const client = postgres(connectionString)
		neonDb = drizzle(client)
	}
	return neonDb
}

export function getSqliteDb() {
	if (!sqliteDb) {
		throw new Error('SQLite database is not initialized')
	}
	return sqliteDb
}

export function initSqliteDb(db: ReturnType<typeof drizzle>) {
	sqliteDb = db
}
