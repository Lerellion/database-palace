import { dbService } from '@/lib/services/database'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { table: string } }) {
	try {
		// Get the table name from params and validate it
		const tableName = await Promise.resolve(params.table)
		if (!tableName) {
			return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
		}

		// Get columns for the specified table
		const columns = await dbService.getTableColumns(tableName)

		return NextResponse.json({ columns })
	} catch (error) {
		console.error('Error fetching table columns:', error)
		return NextResponse.json({ error: 'Failed to fetch table columns' }, { status: 500 })
	}
}
