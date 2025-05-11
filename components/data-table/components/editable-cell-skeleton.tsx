import { CellSkeleton } from './cell-skeleton'
import { Column } from '../types'
import { getInputType } from '../utils/data-formatting'

interface EditableCellSkeletonProps {
	column: Column
}

export function EditableCellSkeleton({ column }: EditableCellSkeletonProps) {
	const inputType = getInputType(column.type)
	let type: 'text' | 'boolean' | 'number' | 'date' = 'text'

	switch (inputType) {
		case 'number':
			type = 'number'
			break
		case 'date':
		case 'datetime-local':
		case 'time':
			type = 'date'
			break
		case 'boolean':
			type = 'boolean'
			break
	}

	return (
		<div className="px-1 py-0.5">
			<CellSkeleton type={type} />
		</div>
	)
}
