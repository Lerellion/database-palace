import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error('Database URL not found in environment variables')
}

const sql = postgres(databaseUrl, { max: 1 })
const db = drizzle(sql)

async function main() {
	console.log('Running migrations...')

	try {
		await migrate(db, {
			migrationsFolder: 'drizzle',
			migrationsTable: 'drizzle_migrations'
		})

		console.log('Migrations completed successfully')
	} catch (error) {
		console.error('Migration failed:', error)
		throw error
	} finally {
		await sql.end()
	}
}

main().catch(err => {
	console.error('Migration failed:', err)
	process.exit(1)
})
