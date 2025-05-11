'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { TableService } from '../services/table-service'
import { Column, TableRecord } from '../types'

interface IUseEditableCellProps {
  initialValue: any
  column: Column
  tableName: string
  record: TableRecord
  onUpdate: () => void
}

interface IUseEditableCellReturn {
  value: any
  isEditing: boolean
  loading: boolean
  setIsEditing: (value: boolean) => void
  setValue: (value: any) => void
  handleUpdate: (newValue: any) => Promise<void>
  resetValue: () => void
}

export function useEditableCell({
  initialValue,
  column,
  tableName,
  record,
  onUpdate,
}: IUseEditableCellProps): IUseEditableCellReturn {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const resetValue = useCallback(() => {
    setValue(initialValue)
    setIsEditing(false)
  }, [initialValue])

  const handleUpdate = async (newValue: any) => {
    if (column.isPrimaryKey) return
    if (newValue === value) {
      setIsEditing(false)
      return
    }

    setLoading(true)
    try {
      await TableService.updateRecord(tableName, {
        data: { [column.name]: newValue },
        where: { id: record.id }
      })

      setValue(newValue)
      onUpdate()
      toast({
        title: "Value updated",
        description: `Successfully updated ${column.name}`,
      })
    } catch (error) {
      console.error('Error updating value:', error)
      setValue(initialValue) // Reset on error
      toast({
        title: "Error updating value",
        description: error instanceof Error ? error.message : "Failed to update value",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsEditing(false)
    }
  }

  return {
    value,
    isEditing,
    loading,
    setIsEditing,
    setValue,
    handleUpdate,
    resetValue,
  }
} 