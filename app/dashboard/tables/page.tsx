'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { PencilIcon, PlusIcon, SearchIcon, TableIcon, TrashIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type TableColumn = {
	name: string
	type: string
	isNullable: boolean
	defaultValue: string | null
	isPrimaryKey: boolean
}

type TTableMetadata = {
	name: string
	rowCount: number
	size: string
	lastAnalyzed: string
	columns: TableColumn[]
}

export default function TablesPage() {
	const [tables, setTables] = useState<TTableMetadata[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedTable, setSelectedTable] = useState<string | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [tableToDelete, setTableToDelete] = useState<string | null>(null)

	useEffect(() => {
		async function fetchTables() {
			try {
				setIsLoading(true)
				setError(null)

				const tablesResponse = await fetch('/api/tables')
				if (!tablesResponse.ok) throw new Error('Failed to fetch tables')
				const tablesData = await tablesResponse.json()

				const tablesWithMetadata = await Promise.all(
					tablesData.tables.map(async (tableName: string) => {
						const dataResponse = await fetch(`/api/data?table=${tableName}&limit=1`)
						if (!dataResponse.ok)
							throw new Error(`Failed to fetch data for ${tableName}`)
						const { pagination } = await dataResponse.json()

						const columnsResponse = await fetch(`/api/tables/${tableName}/columns`)
						if (!columnsResponse.ok)
							throw new Error(`Failed to fetch columns for ${tableName}`)
						const columnsData = await columnsResponse.json()

						const sizeResponse = await fetch(`/api/tables/${tableName}/size`)
						const sizeData = await sizeResponse.json()

						return {
							name: tableName,
							rowCount: pagination.total,
							size: sizeData.size || 'Unknown',
							lastAnalyzed: new Date().toISOString().split('T')[0],
							columns: columnsData.columns
						}
					})
				)

				setTables(tablesWithMetadata)
			} catch (err) {
				console.error('Error fetching tables:', err)
				setError(err instanceof Error ? err.message : 'Failed to fetch tables')
			} finally {
				setIsLoading(false)
			}
		}

		fetchTables()
	}, [])

	const filteredTables = tables.filter(table =>
		table.name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const handleCreateTable = async () => {
		// TODO: Implement table creation dialog
		console.log('Create table')
	}

	const handleViewTable = (tableName: string) => {
		setSelectedTable(tableName)
		// TODO: Navigate to table viewer/editor
		console.log('View table', tableName)
	}

	const handleEditTable = async (tableName: string) => {
		// TODO: Navigate to table structure editor
		console.log('Edit table', tableName)
	}

	const handleDeleteClick = (tableName: string) => {
		setTableToDelete(tableName)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!tableToDelete) return

		try {
			const response = await fetch(`/api/tables/${tableToDelete}`, {
				method: 'DELETE'
			})

			if (!response.ok) throw new Error('Failed to delete table')

			setTables(tables.filter(t => t.name !== tableToDelete))
			setDeleteDialogOpen(false)
			setTableToDelete(null)
		} catch (err) {
			console.error('Error deleting table:', err)
			setError('Failed to delete table')
		}
	}

	return (
		<>
			<div className="p-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">Tables</h1>
					<Button onClick={handleCreateTable}>
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
					) : error ? (
						<div className="text-red-500">{error}</div>
					) : filteredTables.length === 0 ? (
						<div className="text-muted-foreground">No tables found</div>
					) : (
						filteredTables.map(table => (
							<div
								key={table.name}
								className="p-4 border rounded-lg hover:bg-muted/50"
							>
								<div className="flex items-center gap-3">
									<TableIcon className="w-5 h-5 text-muted-foreground" />
									<div className="flex-1">
										<h3 className="font-medium">{table.name}</h3>
										<div className="text-sm text-muted-foreground">
											{table.rowCount.toLocaleString()} rows • {table.size}
										</div>
										<div className="mt-2 text-sm text-muted-foreground">
											{table.columns.length} columns •{' '}
											{table.columns
												.filter(col => col.isPrimaryKey)
												.map(col => col.name)
												.join(', ') || 'No primary key'}
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewTable(table.name)}
										>
											View
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditTable(table.name)}
										>
											<PencilIcon className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="text-red-500 hover:text-red-700"
											onClick={() => handleDeleteClick(table.name)}
										>
											<TrashIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Table</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the table "{tableToDelete}"? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
