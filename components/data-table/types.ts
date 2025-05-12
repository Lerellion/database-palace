export type Column = {
	name: string
	type: string
	isNotNull: boolean
	isNullable: boolean
	defaultValue: string | null
	isKey: boolean
	isPrimaryKey: boolean
	maxLength?: number
}

export type TableRecord = {
	id: number | string
	[key: string]: any
}

export type PaginationParams = {
	page?: number
	limit?: number
	orderBy?: string
	orderDirection?: 'asc' | 'desc'
	filters?: Record<string, any>
}

export type TableService = {
	createRecord: (tableName: string, data: Record<string, any>) => Promise<any>
	updateRecord: (
		tableName: string,
		params: { data: Record<string, any>; where: Record<string, any> }
	) => Promise<any>
	deleteRecord: (tableName: string, where: Record<string, any>) => Promise<any>
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
