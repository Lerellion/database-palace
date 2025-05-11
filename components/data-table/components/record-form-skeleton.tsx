'use client'

import { Column } from '../types'
import { FormFieldSkeleton } from './form-field-skeleton'
import { Button } from '@/components/ui/button'
import { ScrollableContainer } from './scrollable-container'

interface RecordFormSkeletonProps {
	columns: Column[]
}

export function RecordFormSkeleton({ columns }: RecordFormSkeletonProps) {
	return (
		<div className="flex flex-col h-full">
			<ScrollableContainer className="flex-grow">
				<div className="space-y-4">
					{columns.map(column => (
						<FormFieldSkeleton key={column.name} column={column} />
					))}
				</div>
			</ScrollableContainer>

			<div className="flex justify-end gap-2 pt-4 mt-auto border-t">
				<Button variant="outline" disabled className="opacity-50">
					Cancel
				</Button>
				<Button disabled className="opacity-50">
					Loading...
				</Button>
			</div>
		</div>
	)
}
