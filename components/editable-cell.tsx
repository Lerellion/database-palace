import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Column = {
	name: string
	type: string
	isPrimaryKey?: boolean
	isNotNull?: boolean
}

type EditableCellProps = {
	value: any
	column: Column
	tableName: string
	record: Record<string, any>
	onUpdate: () => void
}

export function EditableCell({
	value: initialValue,
	column,
	tableName,
	record,
	onUpdate
}: EditableCellProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [value, setValue] = useState(initialValue)
	const [loading, setLoading] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isEditing])

	const getInputType = (columnType: string) => {
		switch (columnType.toLowerCase()) {
			case 'integer':
			case 'bigint':
			case 'decimal':
			case 'numeric':
				return 'number'
			case 'timestamp':
			case 'timestamp without time zone':
				return 'datetime-local'
			case 'date':
				return 'date'
			case 'time':
				return 'time'
			case 'boolean':
				return 'boolean'
			default:
				return 'text'
		}
	}

	const formatValue = (val: any, type: string) => {
		if (val === null || val === undefined) return ''

		switch (type.toLowerCase()) {
			case 'timestamp':
			case 'timestamp without time zone':
				return val.slice(0, 16) // Format for datetime-local input
			default:
				return val
		}
	}

	const handleUpdate = async (newValue: any) => {
		if (column.isPrimaryKey) return
		if (newValue === value) {
			setIsEditing(false)
			return
		}

		setLoading(true)
		try {
			const response = await fetch(`/api/data?table=${encodeURIComponent(tableName)}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					data: { [column.name]: newValue },
					where: { id: record.id }
				})
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to update value')
			}

			setValue(newValue)
			onUpdate()
			toast({
				title: 'Value updated',
				description: `Successfully updated ${column.name}`
			})
		} catch (error) {
			console.error('Error updating value:', error)
			setValue(initialValue) // Reset on error
			toast({
				title: 'Error updating value',
				description: error instanceof Error ? error.message : 'Failed to update value',
				variant: 'destructive'
			})
		} finally {
			setLoading(false)
			setIsEditing(false)
		}
	}

	if (column.isPrimaryKey) {
		return <span className="font-mono text-sm">{value}</span>
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-6">
				<Loader2 className="h-4 w-4 animate-spin" />
			</div>
		)
	}

	const inputType = getInputType(column.type)

	if (inputType === 'boolean') {
		return <Switch checked={Boolean(value)} onCheckedChange={handleUpdate} disabled={loading} />
	}

	if (isEditing) {
		return (
			<Input
				ref={inputRef}
				type={inputType}
				value={formatValue(value, column.type)}
				onChange={e => {
					const val =
						e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
					setValue(val)
				}}
				onBlur={() => handleUpdate(value)}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						handleUpdate(value)
					}
					if (e.key === 'Escape') {
						setValue(initialValue)
						setIsEditing(false)
					}
				}}
				className="h-7 px-2 font-mono text-sm"
			/>
		)
	}

	return (
		<div
			className="cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded font-mono text-sm"
			onClick={() => setIsEditing(true)}
		>
			{formatValue(value, column.type)}
		</div>
	)
}
