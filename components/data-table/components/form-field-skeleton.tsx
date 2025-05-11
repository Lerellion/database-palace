'use client'

import { cn } from '@/lib/utils'

import { Column } from '../types'
import { getInputType } from '../utils/data-formatting'

type FormFieldSkeletonProps = {
	column: Column
	className?: string
}

export function FormFieldSkeleton({ column, className }: FormFieldSkeletonProps) {
	const inputType = getInputType(column.type)

	// Label skeleton
	const LabelSkeleton = () => (
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

	// Boolean field skeleton
	if (inputType === 'boolean') {
		return (
			<div className={cn('flex items-center justify-between py-2', className)}>
				<LabelSkeleton />
				<div className="h-6 w-10 bg-muted rounded-full animate-pulse" />
			</div>
		)
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

	return (
		<div className={cn('space-y-2', className)}>
			<LabelSkeleton />
			<div className={cn('h-9 bg-muted rounded animate-pulse', getInputWidth())} />
		</div>
	)
}
