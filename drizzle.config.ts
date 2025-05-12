import type { Config } from 'drizzle-kit'

const config: Config = {
	out: './drizzle',
	schema: ['./lib/schema/*.ts'],
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
	}
}

export default config
