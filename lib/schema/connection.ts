import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const connections = sqliteTable('database_connections', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name'),
	type: text('type'),
	host: text('host'),
	port: text('port'),
	username: text('username'),
	password: text('password'),
	database: text('database'),
	connectionString: text('connection_string'),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
})

export type Connection = typeof connections.$inferSelect
export type NewConnection = typeof connections.$inferInsert
