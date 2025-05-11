'use client'

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { Loader2 } from 'lucide-react'
import { Suspense, useEffect, useRef } from 'react'

import { useEditableCell } from '../hooks/use-editable-cell'
import { Column, TableRecord } from '../types'
import { formatValue, getInputType, parseInputValue } from '../utils/data-formatting'
import { EditableCellSkeleton } from './editable-cell-skeleton'

type TProps = {
	value: any
	column: Column
	tableName: string
	record: TableRecord
	onUpdate: () => void
	suspense?: boolean
}

function EditableCellContent({
	value: initialValue,
	column,
	tableName,
	record,
	onUpdate
}: Omit<TProps, 'suspense'>) {
	const inputRef = useRef<HTMLInputElement>(null)
	const { value, isEditing, loading, setIsEditing, setValue, handleUpdate, resetValue } =
		useEditableCell({
			initialValue,
			column,
			tableName,
			record,
			onUpdate
		})

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isEditing])

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
					const newValue = parseInputValue(e.target.value, column.type)
					setValue(newValue)
				}}
				onBlur={() => handleUpdate(value)}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						handleUpdate(value)
					}
					if (e.key === 'Escape') {
						resetValue()
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

export function EditableCell(props: TProps) {
	if (props.suspense) {
		return (
			<Suspense fallback={<EditableCellSkeleton column={props.column} />}>
				<EditableCellContent {...props} />
			</Suspense>
		)
	}

	return <EditableCellContent {...props} />
}
