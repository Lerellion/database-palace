'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

import { ArrowDown, ArrowUp, Database, Loader2, Plus, Search, TableProperties } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { RecordActions } from './record-actions'
import { RecordForm } from './record-form'

type SortDirection = 'asc' | 'desc'

type Column = {
	name: string
	type: string
	isPrimaryKey?: boolean
	isNotNull?: boolean
}

export function TableView() {
	const searchParams = useSearchParams()
	const tableName = searchParams.get('table')
	const [columns, setColumns] = useState<Column[]>([])
	const [rows, setRows] = useState<Record<string, any>[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [sortColumn, setSortColumn] = useState<string | null>(null)
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
	const [searchQuery, setSearchQuery] = useState('')
	const [filteredRows, setFilteredRows] = useState<Record<string, any>[]>([])
	const [page, setPage] = useState(1)
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const rowsPerPage = 10

	const loadTableData = async () => {
		if (!tableName) return

		setLoading(true)
		setError(null)
		try {
			const response = await fetch(`/api/data?table=${encodeURIComponent(tableName)}`)
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to fetch table data')
			}
			const data = await response.json()

			if (data) {
				setColumns(data.columns || [])
				setRows(data.rows || [])
				setFilteredRows(data.rows || [])
				setSortColumn(null)
				setSortDirection('asc')
				setPage(1)
			}
		} catch (error) {
			console.error(`Failed to fetch data for table ${tableName}:`, error)
			setError(error instanceof Error ? error.message : 'Failed to load table data')
			toast.error('Error loading data', {
				description: error instanceof Error ? error.message : 'Failed to load table data'
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadTableData()
	}, [tableName])

	useEffect(() => {
		let result = [...rows]

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			result = result.filter(row =>
				Object.values(row).some(
					value =>
						value !== null &&
						value !== undefined &&
						String(value).toLowerCase().includes(query)
				)
			)
		}

		// Apply sorting
		if (sortColumn) {
			result.sort((a, b) => {
				const aValue = a[sortColumn]
				const bValue = b[sortColumn]

				// Handle null/undefined values
				if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1
				if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1

				// Compare based on type
				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
				}

				// Default string comparison
				const aString = String(aValue).toLowerCase()
				const bString = String(bValue).toLowerCase()
				return sortDirection === 'asc'
					? aString.localeCompare(bString)
					: bString.localeCompare(aString)
			})
		}

		setFilteredRows(result)
		setPage(1)
	}, [rows, searchQuery, sortColumn, sortDirection])

	const handleSort = (columnName: string) => {
		if (sortColumn === columnName) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortColumn(columnName)
			setSortDirection('asc')
		}
	}

	const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
	const totalPages = Math.ceil(filteredRows.length / rowsPerPage)

	if (!tableName) {
		return (
			<div className="w-full h-screen grid place-items-center">
				<div className="text-center max-w-md mx-auto">
					<div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-muted">
						<Database className="h-10 w-10 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-medium mb-2">Welcome to your Database Explorer</h3>
					<p className="text-sm text-muted-foreground mb-8">
						Select a table from the sidebar to start exploring your data. You can view,
						edit, and analyze your database with ease.
					</p>
					<div className="p-4 rounded-lg border border-border bg-muted text-sm text-muted-foreground">
						<p className="font-mono">Tip: Use keyboard shortcuts</p>
						<div className="mt-2 grid grid-cols-2 gap-2 text-xs">
							<div>⌘ + K</div>
							<div>Quick search</div>
							<div>⌘ + →</div>
							<div>Next table</div>
							<div>⌘ + ←</div>
							<div>Previous table</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="w-full h-screen grid place-items-center">
				<div className="text-center">
					<Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
					<h3 className="mt-2 text-lg font-medium">Loading table data...</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Please wait while we fetch the data
					</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="w-full h-screen grid place-items-center">
				<div className="text-center max-w-md mx-auto">
					<div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
						<span className="text-4xl">⚠️</span>
					</div>
					<h3 className="mt-4 text-lg font-medium">Error loading data</h3>
					<p className="mt-2 text-sm text-muted-foreground">{error}</p>
					<Button variant="outline" className="mt-6" onClick={() => loadTableData()}>
						Try again
					</Button>
				</div>
			</div>
		)
	}

	if (rows.length === 0) {
		return (
			<div className="w-full h-screen grid place-items-center">
				<div className="text-center max-w-md mx-auto">
					<div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-muted">
						<TableProperties className="h-10 w-10 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-medium mb-2">This table is empty</h3>
					<p className="text-sm text-muted-foreground mb-6">
						Time to add some data! Your table is ready and waiting for its first
						records.
					</p>
					<div className="space-y-4">
						<Button className="h-9" onClick={() => setCreateDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add First Record
						</Button>
						<div className="p-4 rounded-lg border border-border bg-muted text-left">
							<p className="text-sm font-medium mb-2">Quick tips:</p>
							<ul className="text-sm text-muted-foreground space-y-2">
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
									Add records manually or import data
								</li>
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
									Use the form to ensure data consistency
								</li>
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
									All changes are saved automatically
								</li>
							</ul>
						</div>
					</div>
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>Create New Record</DialogTitle>
							</DialogHeader>
							<RecordForm
								tableName={tableName}
								columns={columns}
								onSuccess={() => {
									setCreateDialogOpen(false)
									loadTableData()
								}}
								onCancel={() => setCreateDialogOpen(false)}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		)
	}

	return (
		<div className="p-3 space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{filteredRows.length} {filteredRows.length === 1 ? 'record' : 'records'}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Filter records..."
							className="pl-8 h-8 w-[180px] text-sm bg-transparent"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
					<Select
						value={sortColumn || '_none'}
						onValueChange={value => {
							if (value === '_none') {
								setSortColumn(null)
							} else {
								setSortColumn(value)
							}
						}}
					>
						<SelectTrigger className="w-[140px] h-8 text-sm">
							<SelectValue placeholder="Sort by column" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="_none">No sorting</SelectItem>
							{columns.map(column => (
								<SelectItem key={column.name} value={column.name}>
									{column.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{sortColumn && (
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() =>
								setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
							}
						>
							{sortDirection === 'asc' ? (
								<ArrowUp className="h-4 w-4" />
							) : (
								<ArrowDown className="h-4 w-4" />
							)}
						</Button>
					)}
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button className="h-8" variant="default">
								<Plus className="mr-1.5 h-4 w-4" />
								Add Record
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>Create New Record</DialogTitle>
							</DialogHeader>
							<RecordForm
								tableName={tableName}
								columns={columns}
								onSuccess={() => {
									setCreateDialogOpen(false)
									loadTableData()
								}}
								onCancel={() => setCreateDialogOpen(false)}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="rounded-md border border-border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map(column => (
								<TableHead
									key={column.name}
									className="cursor-pointer whitespace-nowrap"
									onClick={() => handleSort(column.name)}
								>
									<div className="flex items-center gap-1.5">
										{column.name}
										{sortColumn === column.name && (
											<span className="text-muted-foreground">
												{sortDirection === 'asc' ? (
													<ArrowUp className="h-3 w-3" />
												) : (
													<ArrowDown className="h-3 w-3" />
												)}
											</span>
										)}
									</div>
								</TableHead>
							))}
							<TableHead className="w-[80px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedRows.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{columns.map(column => (
									<TableCell
										key={column.name}
										className="font-mono text-sm whitespace-nowrap"
									>
										{String(row[column.name] ?? '')}
									</TableCell>
								))}
								<TableCell className="text-right">
									<RecordActions
										tableName={tableName}
										record={row}
										columns={columns}
										onAction={loadTableData}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between border-t border-border pt-3">
					<div className="text-sm text-muted-foreground">
						Showing {(page - 1) * rowsPerPage + 1} to{' '}
						{Math.min(page * rowsPerPage, filteredRows.length)} of {filteredRows.length}{' '}
						records
					</div>
					<div className="flex gap-1.5">
						<Button
							variant="outline"
							className="h-8 px-3"
							onClick={() => setPage(p => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							className="h-8 px-3"
							onClick={() => setPage(p => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
