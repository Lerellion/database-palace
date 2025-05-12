import { Skeleton } from '@/components/ui/skeleton'

import { Column } from '../types'

type TProps = {
	column: Column
}

export function EditableCellSkeleton({ column }: TProps) {
	if (column.isPrimaryKey) {
		return (
			<div className="flex items-center space-x-2">
				<Skeleton className="h-4 w-16" />
			</div>
		)
	}

	const inputType = column.type.toLowerCase()
	if (inputType === 'boolean') {
		return <Skeleton className="h-6 w-10 rounded-full" />
	}

	return <Skeleton className="h-7 w-full" />
}
