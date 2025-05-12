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
	isKey: boolean
}

type TProps = {
	name: string
	columns?: TableColumn[]
	isLoading?: boolean
	error?: string
}

export default function TablesPage() {
	const [tables, setTables] = useState<TProps[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [tableToDelete, setTableToDelete] = useState<string | null>(null)

	useEffect(() => {
		fetchTables()
	}, [])

	const fetchTables = async () => {
		try {
			const response = await fetch('/api/tables')
			const data = await response.json()

			if (data.error) {
				throw new Error(data.error)
			}

			// Initialize tables with basic info
			setTables(data.tables.map((name: string) => ({ name })))
			setIsLoading(false)
		} catch (error) {
			console.error('Error fetching tables:', error)
			setIsLoading(false)
		}
	}

	const fetchTableColumns = async (tableName: string) => {
		const table = tables.find(t => t.name === tableName)
		if (table?.columns || table?.isLoading) return

		// Update loading state
		setTables(prev => prev.map(t => (t.name === tableName ? { ...t, isLoading: true } : t)))

		try {
			const response = await fetch(`/api/tables/${tableName}/columns`)
			const data = await response.json()

			if (data.error) {
				throw new Error(data.error)
			}

			// Update table with columns
			setTables(prev =>
				prev.map(t =>
					t.name === tableName ? { ...t, columns: data.columns, isLoading: false } : t
				)
			)
		} catch (error) {
			console.error(`Error fetching columns for ${tableName}:`, error)
			setTables(prev =>
				prev.map(t =>
					t.name === tableName
						? { ...t, error: 'Failed to fetch columns', isLoading: false }
						: t
				)
			)
		}
	}

	const filteredTables = tables.filter(table =>
		table.name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const handleCreateTable = async () => {
		// TODO: Implement table creation dialog
		console.log('Create table')
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
						<div>Loading tables...</div>
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
											{table.isLoading ? (
												'Loading columns...'
											) : table.error ? (
												<span className="text-red-500">{table.error}</span>
											) : table.columns ? (
												`${table.columns.length} columns`
											) : (
												'Click to view details'
											)}
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => fetchTableColumns(table.name)}
										disabled={table.isLoading}
									>
										{table.columns ? 'View' : 'Load Columns'}
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
								{table.columns && (
									<div className="mt-4 pl-8">
										<div className="text-sm font-medium mb-2">Columns:</div>
										<div className="grid gap-1">
											{table.columns.map((column: TableColumn) => (
												<div
													key={column.name}
													className="text-sm flex items-center gap-2"
												>
													<span
														className={
															column.isKey ? 'font-medium' : ''
														}
													>
														{column.name}
													</span>
													<span className="text-muted-foreground">
														{column.type}
														{!column.isNullable && ' NOT NULL'}
														{column.defaultValue &&
															` DEFAULT ${column.defaultValue}`}
													</span>
													{column.isKey && (
														<span className="text-xs bg-primary/10 text-primary px-1 rounded">
															KEY
														</span>
													)}
												</div>
											))}
										</div>
									</div>
								)}
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
