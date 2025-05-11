'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { RecordForm } from './record-form'

interface Column {
	name: string
	type: string
	isPrimaryKey?: boolean
	isNotNull?: boolean
}

interface RecordActionsProps {
	tableName: string
	record: Record<string, any>
	columns: Column[]
	onAction: () => void
}

export function RecordActions({ tableName, record, columns, onAction }: RecordActionsProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleDelete = async () => {
		setLoading(true)
		try {
			const response = await fetch(
				`/api/data?table=${encodeURIComponent(tableName)}&id=${encodeURIComponent(record.id)}`,
				{
					method: 'DELETE'
				}
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to delete record')
			}

			toast({
				title: 'Record deleted',
				description: 'The record has been successfully deleted'
			})

			onAction()
		} catch (error) {
			console.error('Error deleting record:', error)
			toast({
				title: 'Error deleting record',
				description: error instanceof Error ? error.message : 'Failed to delete record',
				variant: 'destructive'
			})
		} finally {
			setLoading(false)
			setDeleteDialogOpen(false)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setEditDialogOpen(true)} className="text-sm">
						<Pencil className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setDeleteDialogOpen(true)}
						className="text-sm text-destructive focus:text-destructive"
					>
						<Trash className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Edit Record</DialogTitle>
					</DialogHeader>
					<RecordForm
						tableName={tableName}
						columns={columns}
						initialData={record}
						onSuccess={() => {
							setEditDialogOpen(false)
							onAction()
						}}
						onCancel={() => setEditDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the record
							from the database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={loading}
							className="bg-destructive hover:bg-destructive/90"
						>
							{loading ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
