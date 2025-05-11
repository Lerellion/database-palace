import { getSqliteDb, getNeonDb } from './db.ts'
import * as sqliteSchema from './schema/sqlite'
import * as pgSchema from './schema/postgres'

// Sample data
const sampleUsers = [
	{ name: 'John Doe', email: 'john@example.com', role: 'admin' },
	{ name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
	{ name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
	{ name: 'Alice Williams', email: 'alice@example.com', role: 'guest' },
	{ name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' }
]

const sampleProducts = [
	{
		name: 'Laptop',
		description: 'High-performance laptop',
		price: 1299.99,
		category: 'electronics',
		inStock: 10
	},
	{
		name: 'Smartphone',
		description: 'Latest smartphone model',
		price: 899.99,
		category: 'electronics',
		inStock: 15
	},
	{
		name: 'Headphones',
		description: 'Noise-cancelling headphones',
		price: 249.99,
		category: 'accessories',
		inStock: 20
	},
	{
		name: 'Desk Chair',
		description: 'Ergonomic office chair',
		price: 199.99,
		category: 'furniture',
		inStock: 5
	},
	{
		name: 'Coffee Maker',
		description: 'Automatic coffee maker',
		price: 89.99,
		category: 'appliances',
		inStock: 8
	},
	{
		name: 'Backpack',
		description: 'Durable travel backpack',
		price: 59.99,
		category: 'accessories',
		inStock: 12
	},
	{
		name: 'Monitor',
		description: '27-inch 4K monitor',
		price: 349.99,
		category: 'electronics',
		inStock: 7
	}
]

// Function to seed SQLite database
export async function seedSqliteDb() {
	const db = getSqliteDb()

	try {
		// Clear existing data
		await db.delete(sqliteSchema.orderItems)
		await db.delete(sqliteSchema.orders)
		await db.delete(sqliteSchema.products)
		await db.delete(sqliteSchema.users)

		console.log('Existing SQLite data cleared')

		// Insert users
		const insertedUsers = await db.insert(sqliteSchema.users).values(sampleUsers).returning()
		console.log(`Inserted ${insertedUsers.length} users into SQLite`)

		// Insert products
		const insertedProducts = await db
			.insert(sqliteSchema.products)
			.values(sampleProducts)
			.returning()
		console.log(`Inserted ${insertedProducts.length} products into SQLite`)

		// Create some orders
		const orders = [
			{ userId: insertedUsers[0].id, total: 1549.98, status: 'delivered' },
			{ userId: insertedUsers[1].id, total: 899.99, status: 'shipped' },
			{ userId: insertedUsers[2].id, total: 309.98, status: 'processing' }
		]

		const insertedOrders = await db.insert(sqliteSchema.orders).values(orders).returning()
		console.log(`Inserted ${insertedOrders.length} orders into SQLite`)

		// Create order items
		const orderItems = [
			{
				orderId: insertedOrders[0].id,
				productId: insertedProducts[0].id,
				quantity: 1,
				price: insertedProducts[0].price
			},
			{
				orderId: insertedOrders[0].id,
				productId: insertedProducts[2].id,
				quantity: 1,
				price: insertedProducts[2].price
			},
			{
				orderId: insertedOrders[1].id,
				productId: insertedProducts[1].id,
				quantity: 1,
				price: insertedProducts[1].price
			},
			{
				orderId: insertedOrders[2].id,
				productId: insertedProducts[2].id,
				quantity: 1,
				price: insertedProducts[2].price
			},
			{
				orderId: insertedOrders[2].id,
				productId: insertedProducts[5].id,
				quantity: 1,
				price: insertedProducts[5].price
			}
		]

		const insertedOrderItems = await db
			.insert(sqliteSchema.orderItems)
			.values(orderItems)
			.returning()
		console.log(`Inserted ${insertedOrderItems.length} order items into SQLite`)

		console.log('SQLite database seeded successfully!')
		return true
	} catch (error) {
		console.error('Error seeding SQLite database:', error)
		return false
	}
}

// Function to seed Neon PostgreSQL database
export async function seedNeonDb() {
	const db = getNeonDb()

	try {
		// Check if the database has the required schema
		try {
			await db.select().from(pgSchema.users).limit(1)
		} catch (error) {
			console.error(
				"Error: Tables don't exist in Neon database. Please run migrations first."
			)
			return false
		}

		// Clear existing data
		await db.delete(pgSchema.orderItems)
		await db.delete(pgSchema.orders)
		await db.delete(pgSchema.products)
		await db.delete(pgSchema.users)

		console.log('Existing Neon data cleared')

		// Insert users
		const insertedUsers = await db.insert(pgSchema.users).values(sampleUsers).returning()
		console.log(`Inserted ${insertedUsers.length} users into Neon`)

		// Insert products
		const insertedProducts = await db
			.insert(pgSchema.products)
			.values(sampleProducts)
			.returning()
		console.log(`Inserted ${insertedProducts.length} products into Neon`)

		// Create some orders
		const orders = [
			{ userId: insertedUsers[0].id, total: 1549.98, status: 'delivered' },
			{ userId: insertedUsers[1].id, total: 899.99, status: 'shipped' },
			{ userId: insertedUsers[2].id, total: 309.98, status: 'processing' }
		]

		const insertedOrders = await db.insert(pgSchema.orders).values(orders).returning()
		console.log(`Inserted ${insertedOrders.length} orders into Neon`)

		// Create order items
		const orderItems = [
			{
				orderId: insertedOrders[0].id,
				productId: insertedProducts[0].id,
				quantity: 1,
				price: insertedProducts[0].price
			},
			{
				orderId: insertedOrders[0].id,
				productId: insertedProducts[2].id,
				quantity: 1,
				price: insertedProducts[2].price
			},
			{
				orderId: insertedOrders[1].id,
				productId: insertedProducts[1].id,
				quantity: 1,
				price: insertedProducts[1].price
			},
			{
				orderId: insertedOrders[2].id,
				productId: insertedProducts[2].id,
				quantity: 1,
				price: insertedProducts[2].price
			},
			{
				orderId: insertedOrders[2].id,
				productId: insertedProducts[5].id,
				quantity: 1,
				price: insertedProducts[5].price
			}
		]

		const insertedOrderItems = await db
			.insert(pgSchema.orderItems)
			.values(orderItems)
			.returning()
		console.log(`Inserted ${insertedOrderItems.length} order items into Neon`)

		console.log('Neon database seeded successfully!')
		return true
	} catch (error) {
		console.error('Error seeding Neon database:', error)
		return false
	}
}

// Main function to seed both databases
export async function seedDatabases() {
	const sqliteSuccess = await seedSqliteDb()
	const neonSuccess = await seedNeonDb()

	return {
		sqlite: sqliteSuccess,
		neon: neonSuccess
	}
}

// If this file is run directly
if (require.main === module) {
	seedDatabases()
		.then(result => {
			console.log('Seeding results:', result)
			process.exit(0)
		})
		.catch(error => {
			console.error('Error during seeding:', error)
			process.exit(1)
		})
}
