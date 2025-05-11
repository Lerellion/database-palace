import { NextResponse } from 'next/server'
import { db } from '@/lib/services/database'
import { sql } from 'drizzle-orm'

export async function GET() {
	try {
		// Query to get all user tables from PostgreSQL
		const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `)

		// Extract table names from the result
		const tables = (result as any[]).map(row => row.table_name)

		return NextResponse.json({ tables })
	} catch (error) {
		console.error('Error fetching tables:', error)
		return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
	}
}
