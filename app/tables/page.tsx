'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { cn } from 'helpers'
import { Database, ExternalLink, PlusIcon, SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type TableData = {
	name: string
	rowCount: number
	size: string
	lastAnalyzed: string
}

type EmptyStateProps = {
	variant: 'no-connection' | 'connecting' | 'no-tables'
	connectionName?: string
	className?: string
}

type ConnectionStatus = 'no-connection' | 'connecting' | 'connected'

function EmptyState({ variant, connectionName, className }: EmptyStateProps) {
	const router = useRouter()

	return (
		<div className={cn('grid place-items-center w-full h-full min-h-[70vh]', className)}>
			<div className="text-center flex flex-col items-center justify-center max-w-md p-8 rounded-xl bg-gradient-to-b from-background to-muted/5 border border-border/30 shadow-sm">
				{variant === 'no-connection' && (
					<>
						<div className="mb-6 rounded-full bg-muted/10 p-6 ring-1 ring-border/20 shadow-inner">
							<Database className="h-10 w-10 text-primary/70" />
						</div>
						<h2 className="text-2xl font-medium mb-3">No Active Connection</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							Connect to a database to view and manage its tables.
						</p>
						<Button
							onClick={() => router.push('/database')}
							size="lg"
							className="flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all duration-200"
						>
							<ExternalLink className="h-4 w-4" />
							Connect to Database
						</Button>
					</>
				)}

				{variant === 'connecting' && (
					<>
						<div className="mb-6 rounded-full bg-primary/10 p-6 ring-1 ring-primary/20">
							<div className="animate-pulse">
								<Database className="h-10 w-10 text-primary/70" />
							</div>
						</div>
						<h2 className="text-2xl font-medium mb-3">Connecting...</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							Establishing connection to {connectionName}
						</p>
						<div className="relative w-52 h-2 bg-muted/30 rounded-full overflow-hidden">
							<div className="absolute top-0 left-0 h-full bg-primary/40 w-1/3 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
						</div>
					</>
				)}

				{variant === 'no-tables' && (
					<>
						<div className="mb-6 rounded-full bg-muted/10 p-6 ring-1 ring-border/20 shadow-inner">
							<Database className="h-10 w-10 text-primary/70" />
						</div>
						<h2 className="text-2xl font-medium mb-3">No Tables Found</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							This database doesn't have any tables yet or you may not have permission
							to view them.
						</p>
						<Button
							onClick={() => router.push('/database')}
							variant="outline"
							size="lg"
							className="flex items-center gap-2 px-6 shadow-sm hover:shadow-md transition-all duration-200"
						>
							<ExternalLink className="h-4 w-4" />
							Change Connection
						</Button>
					</>
				)}
			</div>
		</div>
	)
}

export default function TablesPage() {
	const [tables, setTables] = useState<TableData[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')

	useEffect(() => {
		async function fetchTables() {
			try {
				const response = await fetch('/api/tables')
				const data = await response.json()

				if (!data.tables || data.tables.length === 0) {
					setConnectionStatus('no-connection')
					return
				}

				// Transform the data into the required format
				const formattedTables = data.tables.map((table: string) => ({
					name: table,
					rowCount: 0, // You might want to fetch this separately
					size: 'Calculating...', // You might want to fetch this separately
					lastAnalyzed: new Date().toISOString().split('T')[0]
				}))

				setTables(formattedTables)
				setConnectionStatus('connected')
			} catch (error) {
				console.error('Error fetching tables:', error)
				setConnectionStatus('no-connection')
			} finally {
				setIsLoading(false)
			}
		}

		fetchTables()
	}, [])

	const filteredTables = tables.filter(table =>
		table.name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	if (connectionStatus === 'connecting') {
		return <EmptyState variant="connecting" connectionName="your database" />
	}

	if (connectionStatus === 'no-connection') {
		return <EmptyState variant="no-connection" />
	}

	if (tables.length === 0 && !isLoading) {
		return <EmptyState variant="no-tables" />
	}

	return (
		<div className="p-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Tables</h1>
				<Button>
					<PlusIcon className="w-4 h-4 mr-2" />
					Create Table
				</Button>
			</div>

			<div className="relative mb-6">
				<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<Input
					placeholder="Search tables..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			<div className="grid gap-4">
				{isLoading ? (
					<div>Loading...</div>
				) : (
					filteredTables.map(table => (
						<div
							key={table.name}
							className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
						>
							<div className="flex items-center gap-3">
								<Database className="w-5 h-5 text-muted-foreground" />
								<div className="flex-1">
									<h3 className="font-medium">{table.name}</h3>
									<div className="text-sm text-muted-foreground">
										{table.rowCount.toLocaleString()} rows • {table.size}
									</div>
								</div>
								<Button variant="outline" size="sm">
									View
								</Button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
