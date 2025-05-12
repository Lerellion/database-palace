'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { Column } from '../types'
import { getInputType } from '../utils/data-formatting'
import { FormFieldSkeleton } from './form-field-skeleton'
import { ScrollableContainer } from './scrollable-container'

type RecordFormSkeletonProps = {
	columns: Column[]
}

export function RecordFormSkeleton({ columns }: RecordFormSkeletonProps) {
	return (
		<div className="flex flex-col h-full">
			<ScrollableContainer className="flex-grow">
				<div className="space-y-4">
					{columns.map(column => {
						const inputType = getInputType(column.type)
						return (
							<div key={column.name} className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<FormFieldSkeleton type={inputType} />
							</div>
						)
					})}
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
