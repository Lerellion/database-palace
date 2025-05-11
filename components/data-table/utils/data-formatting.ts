import { getEnumValues as getEnumValuesFromSchema } from '@/lib/schema/enums'

export function getInputType(columnType: string): string {
	const baseType = columnType.toLowerCase().includes('enum') ? 'enum' : columnType.toLowerCase()

	switch (baseType) {
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
		case 'enum':
			return 'enum'
		default:
			return 'text'
	}
}

export function formatValue(value: any, type: string): any {
	if (value === null || value === undefined) return ''

	const baseType = type.toLowerCase().includes('enum') ? 'enum' : type.toLowerCase()

	switch (baseType) {
		case 'timestamp':
		case 'timestamp without time zone':
			return value.slice(0, 16) // Format for datetime-local input
		default:
			return value
	}
}

export function parseInputValue(value: any, type: string): any {
	if (value === '') return null

	const baseType = type.toLowerCase().includes('enum') ? 'enum' : type.toLowerCase()

	switch (baseType) {
		case 'integer':
		case 'bigint':
			return parseInt(value, 10)
		case 'decimal':
		case 'numeric':
			return parseFloat(value)
		case 'boolean':
			return Boolean(value)
		case 'enum':
			return value // Keep enum values as strings
		default:
			return value
	}
}

// Get enum values based on the column type
export function getEnumValues(columnType: string): string[] {
	// Extract the base enum type name from the column type
	const enumType = columnType.toLowerCase().replace('_enum', '')
	return getEnumValuesFromSchema(enumType)
}
