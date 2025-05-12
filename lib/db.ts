import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Get database configuration from environment
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error(
		'Database URL not provided. Set POSTGRES_URL or DATABASE_URL in your environment variables.'
	)
}

// Create postgres client
export const client = postgres(databaseUrl, {
	max: 1,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
})

// Create and export database factory function to avoid circular dependencies
export function createDb(schema: any) {
	return drizzle(client, { schema })
}
