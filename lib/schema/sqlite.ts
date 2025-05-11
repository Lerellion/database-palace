import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Users table
export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username').notNull(),
	first_name: text('first_name').notNull(),
	last_name: text('last_name').notNull(),
	password: text('password').notNull(),
	is_admin: integer('is_admin', { mode: 'boolean' }).default(false),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
	updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
})

// Products table
export const products = sqliteTable('products', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	price: real('price').notNull(),
	category: text('category'),
	inStock: integer('in_stock').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow()
})

// Orders table
export const orders = sqliteTable('orders', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered'] }).default(
		'pending'
	),
	total: real('total').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow()
})

// Order items table
export const orderItems = sqliteTable('order_items', {
	id: integer('id').primaryKey(),
	orderId: integer('order_id')
		.notNull()
		.references(() => orders.id),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id),
	quantity: integer('quantity').notNull(),
	price: real('price').notNull()
})
