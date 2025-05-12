import { dbService } from '@/lib/services/database'

import { NextResponse } from 'next/server'

export async function GET() {
	try {
		// Check if we have an active connection
		const isConnected = await dbService.healthCheck()

		if (!isConnected) {
			return NextResponse.json(
				{
					error: 'No active database connection',
					message: 'Please connect to a database first',
					tables: [],
					currentSchema: null
				},
				{ status: 400 }
			)
		}

		// Get the current schema and fetch tables
		const currentSchema = dbService.getCurrentSchema()
		const tables = await dbService.getTables(currentSchema)

		return NextResponse.json({
			tables,
			currentSchema
		})
	} catch (error) {
		console.error('Error fetching tables:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch tables',
				details: error instanceof Error ? error.message : 'Unknown error',
				tables: [],
				currentSchema: null
			},
			{ status: 500 }
		)
	}
}
