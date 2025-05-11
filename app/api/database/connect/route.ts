import { NextResponse } from 'next/server'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { url, sslEnabled, sslCertPath } = body

		if (!url) {
			return NextResponse.json({ error: 'Database URL is required' }, { status: 400 })
		}

		// Validate URL format
		try {
			new URL(url)
		} catch {
			return NextResponse.json({ error: 'Invalid database URL format' }, { status: 400 })
		}

		// Connection configuration
		const config: any = {
			max: 1, // Use minimal pool for testing connection
			idle_timeout: 5, // Short idle timeout
			connect_timeout: 10
		}

		// Add SSL configuration if enabled
		if (sslEnabled) {
			config.ssl = {
				rejectUnauthorized: false,
				ca: sslCertPath ? [require('fs').readFileSync(sslCertPath)] : undefined
			}
		}

		// Test the connection
		const client = postgres(url, config)

		try {
			// Try a simple query to verify connection
			await client`SELECT 1`

			// Store the connection details in the session or environment
			// This is where you'd implement your connection storage logic
			// For example, you could store it in a server-side session or a secure cookie

			return NextResponse.json({
				message: 'Successfully connected to database',
				connected: true
			})
		} finally {
			// Always close the test connection
			await client.end()
		}
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
