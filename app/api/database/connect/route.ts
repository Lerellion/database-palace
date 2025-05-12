import { dbService } from '@/lib/services/database'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { type, url, fields } = body

		if (!type || (type === 'url' && !url) || (type === 'fields' && !fields)) {
			return NextResponse.json({ error: 'Invalid connection configuration' }, { status: 400 })
		}

		const connectionConfig = {
			type,
			name: type === 'url' ? 'URL Connection' : `${fields.database} on ${fields.host}`,
			...(type === 'url'
				? { url }
				: { fields: { ...fields, schema: fields.schema || 'public' } })
		}

		// Test the connection
		await dbService.connect(connectionConfig)

		// Get available schemas and tables
		const availableSchemas = await dbService.getAvailableSchemas()
		const currentSchema = dbService.getCurrentSchema()
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
		const { schema } = await request.json()

		if (!schema) {
			return NextResponse.json({ error: 'Schema name is required' }, { status: 400 })
		}

		await dbService.setSchema(schema)
		const tables = await dbService.getTables(schema)

		return NextResponse.json({
			message: 'Successfully changed schema',
			currentSchema: schema,
			tables
		})
	} catch (error) {
		console.error('Schema change error:', error)
		return NextResponse.json(
			{
				error: 'Failed to change schema',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}
