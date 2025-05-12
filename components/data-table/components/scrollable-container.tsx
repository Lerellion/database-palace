'use client'

import { cn } from '@/lib/utils'

import { ReactNode } from 'react'

type TProps = {
	children: ReactNode
	className?: string
}

export function ScrollableContainer({ children, className }: TProps) {
	return (
		<div
			className={cn(
				'overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-background',
				className
			)}
		>
			{children}
		</div>
	)
}
