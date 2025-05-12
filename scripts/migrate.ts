import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// Get database configuration from environment
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error(
		'Database URL not provided. Set POSTGRES_URL or DATABASE_URL in your environment variables.'
	)
}

// Create a new postgres client for migrations
const migrationClient = postgres(databaseUrl, { max: 1 })

// Create a new drizzle instance
const db = drizzle(migrationClient)

// Run migrations
async function main() {
	console.log('Running migrations...')

	try {
		await migrate(db, { migrationsFolder: 'drizzle' })
		console.log('Migrations completed successfully')
	} catch (error) {
		console.error('Migration failed:', error)
		process.exit(1)
	} finally {
		await migrationClient.end()
	}
}

main()
