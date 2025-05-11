import * as dotenv from 'dotenv'
import type { Config } from 'drizzle-kit'

dotenv.config()

const config: Config = {
	out: './drizzle',
	schema: './lib/schema',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
	}
}

export default config
