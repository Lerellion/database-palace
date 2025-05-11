'use client'

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { TableService } from "../services/table-service"
import { getInputType, formatValue, parseInputValue, getEnumValues } from "../utils/data-formatting"
import { Column, TableRecord } from "../types"
import { cn } from "@/lib/utils"
import { RecordFormSkeleton } from "./record-form-skeleton"
import { ScrollableContainer } from "./scrollable-container"

type TProps = {
  tableName: string
  columns: Column[]
  initialData?: TableRecord
  onSuccess: () => void
  onCancel: () => void
  suspense?: boolean
}

function RecordFormContent({
  tableName,
  columns,
  initialData,
  onSuccess,
  onCancel
}: TProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    columns.forEach(column => {
      if (column.isPrimaryKey && !initialData) {
        return
      }

      if (column.isNotNull && !formData[column.name] && !column.isPrimaryKey) {
        newErrors[column.name] = `${column.name} is required`
        isValid = false
      }

      const value = formData[column.name]
      if (value !== undefined && value !== null) {
        const inputType = getInputType(column.type)
        
        switch (inputType) {
          case 'number':
            if (isNaN(Number(value))) {
              newErrors[column.name] = `${column.name} must be a valid number`
              isValid = false
            }
            break
          case 'date':
          case 'datetime-local':
            if (value && isNaN(Date.parse(value))) {
              newErrors[column.name] = `${column.name} must be a valid date`
              isValid = false
            }
            break
          case 'enum':
            const enumValues = getEnumValues(column.type)
            if (!enumValues.includes(value)) {
              newErrors[column.name] = `${column.name} must be one of: ${enumValues.join(', ')}`
              isValid = false
            }
            break
        }

        if (column.maxLength && String(value).length > column.maxLength) {
          newErrors[column.name] = `${column.name} cannot exceed ${column.maxLength} characters`
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const formDataToSubmit = { ...formData }
      
      // Only remove primary key if it's empty/null/undefined
      columns.forEach(column => {
        if (column.isPrimaryKey && !formDataToSubmit[column.name]) {
          delete formDataToSubmit[column.name]
        }
      })

      if (initialData) {
        await TableService.updateRecord(tableName, {
          data: formDataToSubmit,
          where: { id: initialData.id }
        })
      } else {
        await TableService.createRecord(tableName, formDataToSubmit)
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

  const handleInputChange = (column: Column, value: any) => {
    const parsedValue = parseInputValue(value, column.type)
    setFormData(prev => ({ ...prev, [column.name]: parsedValue }))
    
    // Clear error when user starts typing
    if (errors[column.name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[column.name]
        return newErrors
      })
    }
  }

  if (loading) {
    return <RecordFormSkeleton columns={columns} />
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollableContainer className="flex-grow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {columns.map((column) => {
            const inputType = getInputType(column.type)
            const value = formatValue(formData[column.name], column.type)
            const error = errors[column.name]

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
                    onCheckedChange={(checked) => handleInputChange(column, checked)}
                    disabled={loading || column.isPrimaryKey}
                  />
                </div>
              )
            }

            if (inputType === 'enum') {
              const enumValues = getEnumValues(column.type)
              return (
                <div key={column.name} className="space-y-2">
                  <Label htmlFor={column.name} className="text-sm">
                    {column.name}
                    {column.isNotNull && <span className="text-destructive ml-1">*</span>}
                    <span className="ml-2 text-xs text-muted-foreground">({column.type})</span>
                  </Label>
                  <Select
                    value={value || ''}
                    onValueChange={(value) => handleInputChange(column, value)}
                    disabled={loading || column.isPrimaryKey}
                  >
                    <SelectTrigger className={cn(
                      "font-mono text-sm",
                      error && "border-destructive"
                    )}>
                      <SelectValue placeholder={`Select ${column.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {enumValues.map((enumValue) => (
                        <SelectItem key={enumValue} value={enumValue}>
                          {enumValue.charAt(0).toUpperCase() + enumValue.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-xs text-destructive mt-1">{error}</p>
                  )}
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
                  onChange={(e) => handleInputChange(column, e.target.value)}
                  disabled={loading || column.isPrimaryKey}
                  required={column.isNotNull}
                  className={cn(
                    "font-mono text-sm",
                    error && "border-destructive"
                  )}
                  placeholder={`Enter ${column.name}`}
                />
                {error && (
                  <p className="text-xs text-destructive mt-1">{error}</p>
                )}
              </div>
            )
          })}
        </form>
      </ScrollableContainer>
      
      <div className="flex justify-end gap-2 pt-4 mt-auto border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {initialData ? 'Update Record' : 'Create Record'}
        </Button>
      </div>
    </div>
  )
}

export function RecordForm(props: TProps) {
  if (props.suspense) {
    return (
      <Suspense fallback={<RecordFormSkeleton columns={props.columns} />}>
        <RecordFormContent {...props} />
      </Suspense>
    )
  }

  return <RecordFormContent {...props} />
} 