'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { TableService } from '../services/table-service'
import { Column, TableRecord } from '../types'

type TProps = {
	initialValue: any
	column: Column
	tableName: string
	record: TableRecord
	onUpdate: () => void
}

export function useEditableCell({ initialValue, column, tableName, record, onUpdate }: TProps) {
	const [value, setValue] = useState(initialValue)
	const [isEditing, setIsEditing] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleUpdate = async (newValue: any) => {
		if (newValue === initialValue) {
			setIsEditing(false)
			return
		}

		setLoading(true)
		try {
			await TableService.updateRecord(tableName, {
				data: { [column.name]: newValue },
				where: { id: record.id }
			})

			toast.success('Value updated', {
				description: `Successfully updated ${column.name}`
			})

			onUpdate()
			setIsEditing(false)
		} catch (error) {
			console.error('Error updating value:', error)
			toast.error('Error updating value', {
				description: error instanceof Error ? error.message : 'Failed to update value'
			})
			setValue(initialValue)
		} finally {
			setLoading(false)
		}
	}

	const resetValue = () => {
		setValue(initialValue)
		setIsEditing(false)
	}

	return {
		value,
		isEditing,
		loading,
		setIsEditing,
		setValue,
		handleUpdate,
		resetValue
	}
}
