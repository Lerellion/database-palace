import { getEnumValues as getEnumValuesFromSchema } from '@/lib/schema/enums'

export function getInputType(columnType: string): string {
	const type = columnType.toLowerCase()

	if (
		type.includes('int') ||
		type.includes('decimal') ||
		type.includes('numeric') ||
		type.includes('float')
	) {
		return 'number'
	}

	if (type.includes('timestamp') || type.includes('datetime')) {
		return 'datetime-local'
	}

	if (type.includes('date')) {
		return 'date'
	}

	if (type.includes('time')) {
		return 'time'
	}

	if (type === 'boolean') {
		return 'boolean'
	}

	if (type.startsWith('enum')) {
		return 'enum'
	}

	return 'text'
}

export function formatValue(value: any, type: string): string {
	if (value === null || value === undefined) {
		return ''
	}

	const inputType = getInputType(type)

	switch (inputType) {
		case 'datetime-local':
			return new Date(value).toISOString().slice(0, 16)
		case 'date':
			return new Date(value).toISOString().slice(0, 10)
		case 'time':
			return new Date(value).toISOString().slice(11, 16)
		case 'boolean':
			return value ? 'true' : 'false'
		default:
			return String(value)
	}
}

export function parseInputValue(value: any, type: string): any {
	if (value === '' || value === null || value === undefined) {
		return null
	}

	const inputType = getInputType(type)

	switch (inputType) {
		case 'number':
			return Number(value)
		case 'boolean':
			return Boolean(value)
		case 'datetime-local':
		case 'date':
		case 'time':
			return new Date(value).toISOString()
		default:
			return value
	}
}

// Get enum values based on the column type
export function getEnumValues(type: string): string[] {
	// Extract enum values from type string
	// Example: "enum('active','inactive','pending')" -> ['active', 'inactive', 'pending']
	const match = type.match(/enum\((.*)\)/)
	if (!match) return []

	return match[1]
		.split(',')
		.map(value => value.trim().replace(/'/g, ''))
		.filter(Boolean)
}
