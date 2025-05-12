'use client'

import { cn } from '@/lib/utils'

import { Skeleton } from '@/components/ui/skeleton'

import { Column } from '../types'
import { getInputType } from '../utils/data-formatting'

type FormFieldSkeletonProps = {
	column?: Column
	type?: 'text' | 'number' | 'date' | 'datetime-local' | 'boolean' | 'enum'
	className?: string
}

export function FormFieldSkeleton({
	column,
	type: explicitType,
	className
}: FormFieldSkeletonProps) {
	// If column is provided, get type from it, otherwise use explicit type
	const inputType = column ? getInputType(column.type) : explicitType

	// Label skeleton for when column info is available
	const LabelSkeleton = () => {
		if (!column) return null
		return (
			<div className="flex items-center gap-1">
				<div
					className="h-4 bg-muted rounded animate-pulse"
					style={{ width: `${column.name.length * 8}px` }}
				/>
				{column.isNotNull && (
					<div className="h-4 w-2 bg-destructive/20 rounded animate-pulse" />
				)}
				<div className="h-4 w-16 bg-muted/50 rounded animate-pulse ml-2" />
			</div>
		)
	}

	// Boolean field skeleton
	if (inputType === 'boolean') {
		if (column) {
			return (
				<div className={cn('flex items-center justify-between py-2', className)}>
					<LabelSkeleton />
					<div className="h-6 w-10 bg-muted rounded-full animate-pulse" />
				</div>
			)
		}
		return <Skeleton className="h-6 w-10 rounded-full" />
	}

	// Enum field skeleton
	if (inputType === 'enum') {
		if (column) {
			return (
				<div className={cn('space-y-2', className)}>
					<LabelSkeleton />
					<div className="h-9 bg-muted rounded animate-pulse w-full" />
				</div>
			)
		}
		return <Skeleton className="h-9 w-full rounded-md" />
	}

	// Input field skeleton with appropriate width based on type
	const getInputWidth = () => {
		switch (inputType) {
			case 'number':
				return 'w-32'
			case 'date':
			case 'datetime-local':
				return 'w-48'
			case 'time':
				return 'w-24'
			default:
				return 'w-full'
		}
	}

	if (column) {
		return (
			<div className={cn('space-y-2', className)}>
				<LabelSkeleton />
				<div className={cn('h-9 bg-muted rounded animate-pulse', getInputWidth())} />
			</div>
		)
	}

	return <Skeleton className={cn('h-9', getInputWidth())} />
}
