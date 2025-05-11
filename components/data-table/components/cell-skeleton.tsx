import { cn } from 'helpers'

type CellSkeletonProps = {
	className?: string
	type?: 'text' | 'boolean' | 'number' | 'date'
}

export function CellSkeleton({ className, type = 'text' }: CellSkeletonProps) {
	return (
		<div
			className={cn(
				'animate-pulse bg-muted rounded',
				{
					'w-16 h-4': type === 'boolean',
					'w-20 h-4': type === 'number',
					'w-32 h-4': type === 'date',
					'w-full h-4': type === 'text'
				},
				className
			)}
		/>
	)
}
