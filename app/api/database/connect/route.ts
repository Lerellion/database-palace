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
			...(type === 'url' ? { url } : { fields })
		}

		// Test the connection
		await dbService.connect(connectionConfig)

		// Get tables
		const tables = await dbService.getTables(type === 'fields' ? fields.schema : 'public')

		return NextResponse.json({
			message: 'Successfully connected to database',
			connected: true,
			tables
		})
	} catch (error) {
		console.error('Database connection error:', error)
		return NextResponse.json(
			{
				error: 'Failed to connect to database',
				details: error instanceof Error ? error.message : undefined
			},
			{ status: 500 }
		)
	}
}
