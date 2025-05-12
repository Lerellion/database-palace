import { createDb } from '@/lib/db'
import { connections } from '@/lib/schema/connection'
import { dbService } from '@/lib/services/database'

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Create database instance with connection schema
const db = createDb({ connections })

export async function GET() {
	try {
		const savedConnections = await dbService.getSavedConnections()
		const isConnected = await dbService.healthCheck()
		const currentConnection = dbService.getCurrentConnection()
		const currentSchema = dbService.getCurrentSchema()

		let availableSchemas: string[] = []
		if (isConnected) {
			availableSchemas = await dbService.getAvailableSchemas()
		}

		return NextResponse.json({
			connections: savedConnections,
			isConnected,
			currentConnection,
			currentSchema,
			availableSchemas
		})
	} catch (error) {
		console.error('Error checking database connection:', error)
		return NextResponse.json(
			{
				error: 'Failed to check database connection',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { type, url, fields } = body

		// Validate required fields based on connection type
		if (!type) {
			return NextResponse.json({ error: 'Connection type is required' }, { status: 400 })
		}

		if (type === 'url' && !url) {
			return NextResponse.json(
				{ error: 'URL is required for URL connection type' },
				{ status: 400 }
			)
		}

		if (type === 'fields') {
			const requiredFields = ['host', 'port', 'database', 'username', 'password']
			const missingFields = requiredFields.filter(field => !fields?.[field])

			if (missingFields.length > 0) {
				return NextResponse.json(
					{
						error: `Missing required fields: ${missingFields.join(', ')}`
					},
					{ status: 400 }
				)
			}
		}

		// Create connection config after validation
		const connectionConfig = {
			type,
			name:
				type === 'url'
					? 'URL Connection'
					: `${fields?.database || 'Unknown'} on ${fields?.host || 'Unknown'}`,
			...(type === 'url'
				? { url }
				: { fields: { ...fields, schema: fields?.schema || 'public' } })
		}

		await dbService.connect(connectionConfig)
		const currentSchema = dbService.getCurrentSchema()
		const availableSchemas = await dbService.getAvailableSchemas()
		const tables = await dbService.getTables(currentSchema)

		return NextResponse.json({
			message: 'Successfully connected to database',
			connected: true,
			currentConnection: connectionConfig,
			currentSchema,
			availableSchemas,
			tables
		})
	} catch (error) {
		console.error('Database connection error:', error)
		return NextResponse.json(
			{
				error: 'Failed to connect to database',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export async function PUT(request: Request) {
	try {
		const body = await request.json()
		const { id, ...updateData } = body

		const updatedConnection = await db
			.update(connections)
			.set(updateData)
			.where(eq(connections.id, id))
			.returning()

		return NextResponse.json(updatedConnection[0])
	} catch (error) {
		console.error('Error updating connection:', error)
		return NextResponse.json(
			{
				error: 'Failed to update connection',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export async function DELETE(request: Request) {
	try {
		const { id } = await request.json()
		await db.delete(connections).where(eq(connections.id, id))
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting connection:', error)
		return NextResponse.json(
			{
				error: 'Failed to delete connection',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}
