import { db } from '@/lib/db'
import { connections } from '@/lib/schema/connection'

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const allConnections = await db.select().from(connections)
		return NextResponse.json(allConnections)
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const newConnection = await db.insert(connections).values(body).returning()
		return NextResponse.json(newConnection[0])
	} catch (error) {
		return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
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
		return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
	}
}

export async function DELETE(request: Request) {
	try {
		const { id } = await request.json()
		await db.delete(connections).where(eq(connections.id, id))
		return NextResponse.json({ success: true })
	} catch (error) {
		return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
	}
}
