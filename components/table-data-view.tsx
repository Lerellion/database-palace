'use client'

import { EditableCell } from '@/components/data-table'
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

type Column = {
	name: string
	type: string
	isPrimaryKey?: boolean
	isNotNull?: boolean
}

type TableDataViewProps = {
	tableName: string
}

export function TableDataView({ tableName }: TableDataViewProps) {
	const [columns, setColumns] = useState<Column[]>([])
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true)
				setError(null)

				const response = await fetch(`/api/data?table=${encodeURIComponent(tableName)}`)
				if (!response.ok) {
					throw new Error('Failed to fetch table data')
				}

				const data = await response.json()
				setColumns(data.columns)
				setRows(data.rows)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred')
				console.error('Error fetching table data:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [tableName])

	const handleRefresh = () => {
		setLoading(true)
		fetch(`/api/data?table=${encodeURIComponent(tableName)}`)
			.then(response => response.json())
			.then(data => {
				setColumns(data.columns)
				setRows(data.rows)
			})
			.catch(err => {
				setError(err instanceof Error ? err.message : 'An error occurred')
				console.error('Error refreshing table data:', err)
			})
			.finally(() => setLoading(false))
	}

	if (loading) {
		return <div className="p-4">Loading table data...</div>
	}

	if (error) {
		return (
			<div className="p-4 text-red-500">
				Error: {error}
				<Button onClick={handleRefresh} className="ml-2">
					Retry
				</Button>
			</div>
		)
	}

	if (!columns.length) {
		return <div className="p-4">No columns found in this table.</div>
	}

	return (
		<div className="relative">
			<div className="absolute right-4 top-4">
				<Button onClick={handleRefresh} variant="outline" size="sm">
					Refresh
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map(column => (
							<TableHead key={column.name}>
								{column.name}
								{column.isPrimaryKey && ' 🔑'}
								{column.isNotNull && ' *'}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, rowIndex) => (
						<TableRow key={rowIndex}>
							{columns.map(column => (
								<TableCell key={column.name}>
									<EditableCell
										value={row[column.name]}
										column={column}
										tableName={tableName}
										record={row}
										onUpdate={handleRefresh}
									/>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
