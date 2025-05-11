import { pgEnum } from 'drizzle-orm/pg-core'

// Role enum type and values
export type RoleEnum = 'admin' | 'user' | 'guest'
export const roleEnum = pgEnum('role', ['admin', 'user', 'guest'])
export const ROLE_VALUES: RoleEnum[] = ['admin', 'user', 'guest']

// Order status enum type and values
export type OrderStatusEnum = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export const orderStatusEnum = pgEnum('order_status', [
	'pending',
	'processing',
	'shipped',
	'delivered'
])
export const ORDER_STATUS_VALUES: OrderStatusEnum[] = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled'
]

// Map of enum types to their values
export const ENUM_VALUES: Record<string, string[]> = {
	role: ROLE_VALUES,
	order_status: ORDER_STATUS_VALUES
}

// Helper type for all enum types
export type EnumType = RoleEnum | OrderStatusEnum

// Helper function to get enum values
export function getEnumValues(columnType: string): string[] {
	return ENUM_VALUES[columnType] || []
}
