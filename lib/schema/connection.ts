import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const connections = pgTable('database_connections', {
	id: integer('id').primaryKey(),
	name: text('name'),
	type: text('type'),
	host: text('host'),
	port: text('port'),
	username: text('username'),
	password: text('password'),
	database: text('database'),
	connectionString: text('connection_string'),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
})

export type Connection = typeof connections.$inferSelect
export type NewConnection = typeof connections.$inferInsert
