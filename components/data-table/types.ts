export type Column = {
	name: string
	type: string
	isPrimaryKey?: boolean
	isNotNull?: boolean
	defaultValue?: any
	maxLength?: number
	precision?: number
	scale?: number
}

export type TableRecord = {
	[key: string]: any
	id: string | number
}

export type UpdatePayload = {
	data: Partial<TableRecord>
	where: Partial<TableRecord>
}

export type SortDirection = 'asc' | 'desc'

export type SortConfig = {
	column: string | null
	direction: SortDirection
}

export type PaginationConfig = {
	page: number
	limit: number
	total: number
}

export type DataType =
	| 'integer'
	| 'bigint'
	| 'decimal'
	| 'numeric'
	| 'timestamp'
	| 'timestamp without time zone'
	| 'date'
	| 'time'
	| 'boolean'
	| 'text'
