"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isNotNull?: boolean
}

interface RecordFormProps {
  tableName: string
  columns: Column[]
  initialData?: Record<string, any>
  onSuccess: () => void
  onCancel: () => void
}

export function RecordForm({ tableName, columns, initialData, onSuccess, onCancel }: RecordFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/data?table=${encodeURIComponent(tableName)}`, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData,
          ...(initialData && { where: initialData }),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save record')
      }

      toast({
        title: `Record ${initialData ? 'updated' : 'created'} successfully`,
        description: `The record has been ${initialData ? 'updated' : 'added'} to ${tableName}`,
      })

      onSuccess()
    } catch (error) {
      console.error('Error saving record:', error)
      toast({
        title: "Error saving record",
        description: error instanceof Error ? error.message : "Failed to save record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return ''
    
    switch (type.toLowerCase()) {
      case 'timestamp':
      case 'timestamp without time zone':
        return value.slice(0, 16) // Format for datetime-local input
      default:
        return value
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {columns.map((column) => {
        const inputType = getInputType(column.type)
        const value = formatValue(formData[column.name], column.type)

        if (inputType === 'boolean') {
          return (
            <div key={column.name} className="flex items-center justify-between">
              <Label htmlFor={column.name} className="text-sm">
                {column.name}
                {column.isNotNull && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Switch
                id={column.name}
                checked={formData[column.name] || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, [column.name]: checked }))
                }
                disabled={loading || column.isPrimaryKey}
              />
            </div>
          )
        }

        return (
          <div key={column.name} className="space-y-2">
            <Label htmlFor={column.name} className="text-sm">
              {column.name}
              {column.isNotNull && <span className="text-destructive ml-1">*</span>}
              <span className="ml-2 text-xs text-muted-foreground">({column.type})</span>
            </Label>
            <Input
              id={column.name}
              type={inputType}
              value={value}
              onChange={(e) => {
                const value = e.target.type === 'number' 
                  ? parseFloat(e.target.value) 
                  : e.target.value
                setFormData(prev => ({ ...prev, [column.name]: value }))
              }}
              disabled={loading || column.isPrimaryKey}
              required={column.isNotNull}
              className="font-mono"
              placeholder={`Enter ${column.name}`}
            />
          </div>
        )
      })}
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : initialData ? 'Update Record' : 'Create Record'}
        </Button>
      </div>
    </form>
  )
}
