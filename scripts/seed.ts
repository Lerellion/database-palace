import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '../lib/schema/postgres'

type Role = 'admin' | 'user' | 'guest'
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const sampleUsers = [
	{ name: 'John Doe', email: 'john@example.com', role: 'admin' as Role },
	{ name: 'Jane Smith', email: 'jane@example.com', role: 'user' as Role },
	{ name: 'Bob Johnson', email: 'bob@example.com', role: 'user' as Role },
	{ name: 'Alice Williams', email: 'alice@example.com', role: 'guest' as Role },
	{ name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' as Role }
]

const sampleProducts = [
	{
		name: 'Laptop',
		description: 'High-performance laptop',
		price: '1299.99',
		category: 'electronics',
		inStock: 10
	},
	{
		name: 'Smartphone',
		description: 'Latest smartphone model',
		price: '899.99',
		category: 'electronics',
		inStock: 15
	},
	{
		name: 'Headphones',
		description: 'Noise-cancelling headphones',
		price: '249.99',
		category: 'accessories',
		inStock: 20
	},
	{
		name: 'Desk Chair',
		description: 'Ergonomic office chair',
		price: '199.99',
		category: 'furniture',
		inStock: 5
	},
	{
		name: 'Coffee Maker',
		description: 'Automatic coffee maker',
		price: '89.99',
		category: 'appliances',
		inStock: 8
	},
	{
		name: 'Backpack',
		description: 'Durable travel backpack',
		price: '59.99',
		category: 'accessories',
		inStock: 12
	},
	{
		name: 'Monitor',
		description: '27-inch 4K monitor',
		price: '349.99',
		category: 'electronics',
		inStock: 7
	}
]

async function main() {
	// Create postgres client
	const client = postgres(process.env.POSTGRES_URL || process.env.DATABASE_URL || '')
	const db = drizzle(client, { schema })

	try {
		// Clear existing data
		await db.delete(schema.orderItems)
		await db.delete(schema.orders)
		await db.delete(schema.products)
		await db.delete(schema.users)

		console.log('Existing data cleared')

		// Insert users
		const insertedUsers = await db.insert(schema.users).values(sampleUsers).returning()
		console.log(`Inserted ${insertedUsers.length} users`)

		// Insert products
		const insertedProducts = await db.insert(schema.products).values(sampleProducts).returning()
		console.log(`Inserted ${insertedProducts.length} products`)

		// Create some orders
		const orders = [
			{ userId: insertedUsers[0].id, total: '1549.98', status: 'delivered' as OrderStatus },
			{ userId: insertedUsers[1].id, total: '899.99', status: 'shipped' as OrderStatus },
			{ userId: insertedUsers[2].id, total: '309.98', status: 'processing' as OrderStatus }
		]

		const insertedOrders = await db.insert(schema.orders).values(orders).returning()
		console.log(`Inserted ${insertedOrders.length} orders`)

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

		const insertedOrderItems = await db.insert(schema.orderItems).values(orderItems).returning()
		console.log(`Inserted ${insertedOrderItems.length} order items`)

		console.log('Database seeded successfully!')
		return true
	} catch (error) {
		console.error('Error seeding database:', error)
		return false
	} finally {
		await client.end()
	}
}

// Run seeding if this script is executed directly
if (require.main === module) {
	main().then(() => process.exit())
}
