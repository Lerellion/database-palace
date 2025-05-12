import { Connection } from '@/lib/schema/connection'

import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

import { useEffect, useState } from 'react'

export default function ConnectionList() {
	const [connections, setConnections] = useState<Connection[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchConnections()
	}, [])

	async function fetchConnections() {
		try {
			const response = await fetch('/api/database/connections')
			if (!response.ok) {
				throw new Error('Failed to fetch connections')
			}
			const data = await response.json()
			setConnections(data)
		} catch (error) {
			console.error('Error fetching connections:', error)
		} finally {
			setIsLoading(false)
		}
	}

	async function deleteConnection(id: number) {
		try {
			const response = await fetch('/api/database/connections', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			})

			if (!response.ok) {
				throw new Error('Failed to delete connection')
			}

			await fetchConnections()
		} catch (error) {
			console.error('Error deleting connection:', error)
		}
	}

	if (isLoading) {
		return <div>Loading connections...</div>
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Host</TableHead>
						<TableHead>Database</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{connections.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center">
								No connections found
							</TableCell>
						</TableRow>
					) : (
						connections.map(connection => (
							<TableRow key={connection.id}>
								<TableCell>{connection.name}</TableCell>
								<TableCell>{connection.type}</TableCell>
								<TableCell>{connection.host || 'Local'}</TableCell>
								<TableCell>{connection.database}</TableCell>
								<TableCell>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => deleteConnection(connection.id)}
									>
										Delete
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	)
}
