import { dbService } from '@/lib/services/database'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ table: string }> | { table: string } }
) {
	try {
		// Check if we have an active connection
		const isConnected = await dbService.healthCheck()

		if (!isConnected) {
			return NextResponse.json(
				{
					error: 'No active database connection',
					message: 'Please connect to a database first',
					columns: [],
					currentSchema: null
				},
				{ status: 400 }
			)
		}

		// Get and validate the table name from params
		const resolvedParams = await Promise.resolve(params)
		const tableName = resolvedParams.table

		if (!tableName) {
			return NextResponse.json(
				{
					error: 'Table name is required',
					columns: []
				},
				{ status: 400 }
			)
		}

		// Get the current schema
		const currentSchema = dbService.getCurrentSchema()

		// Get columns for the specified table
		const columns = await dbService.getTableColumns(tableName, currentSchema)

		return NextResponse.json({
			columns,
			tableName,
			currentSchema
		})
	} catch (error) {
		console.error('Error fetching table columns:', error)
		const resolvedParams = await Promise.resolve(params)
		return NextResponse.json(
			{
				error: 'Failed to fetch table columns',
				details: error instanceof Error ? error.message : 'Unknown error',
				columns: [],
				tableName: resolvedParams.table,
				currentSchema: null
			},
			{ status: 500 }
		)
	}
}
