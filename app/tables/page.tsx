'use client'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

import { Database, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

type TProps = {
	variant: 'no-connection' | 'connecting' | 'no-tables'
	connectionName?: string
	className?: string
}

export function EmptyState({ variant, connectionName, className }: TProps) {
	const router = useRouter()

	return (
		<div className={cn('grid place-items-center w-full h-full min-h-[70vh]', className)}>
			<div className="text-center flex flex-col items-center justify-center max-w-md p-8 rounded-xl bg-gradient-to-b from-background to-muted/5 border border-border/30 shadow-sm">
				{variant === 'no-connection' && (
					<>
						<div className="mb-6 rounded-full bg-muted/10 p-6 ring-1 ring-border/20 shadow-inner">
							<Database className="h-10 w-10 text-primary/70" />
						</div>
						<h2 className="text-2xl font-medium mb-3">No Active Connection</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							Connect to a database to view and manage its tables.
						</p>
						<Button
							onClick={() => router.push('/database')}
							size="lg"
							className="flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all duration-200"
						>
							<ExternalLink className="h-4 w-4" />
							Connect to Database
						</Button>
					</>
				)}

				{variant === 'connecting' && (
					<>
						<div className="mb-6 rounded-full bg-primary/10 p-6 ring-1 ring-primary/20">
							<div className="animate-pulse">
								<Database className="h-10 w-10 text-primary/70" />
							</div>
						</div>
						<h2 className="text-2xl font-medium mb-3">Connecting...</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							Establishing connection to {connectionName}
						</p>
						<div className="relative w-52 h-2 bg-muted/30 rounded-full overflow-hidden">
							<div className="absolute top-0 left-0 h-full bg-primary/40 w-1/3 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
						</div>
					</>
				)}

				{variant === 'no-tables' && (
					<>
						<div className="mb-6 rounded-full bg-muted/10 p-6 ring-1 ring-border/20 shadow-inner">
							<Database className="h-10 w-10 text-primary/70" />
						</div>
						<h2 className="text-2xl font-medium mb-3">No Tables Found</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							This database doesn't have any tables yet or you may not have permission
							to view them.
						</p>
						<Button
							onClick={() => router.push('/database')}
							variant="outline"
							size="lg"
							className="flex items-center gap-2 px-6 shadow-sm hover:shadow-md transition-all duration-200"
						>
							<ExternalLink className="h-4 w-4" />
							Change Connection
						</Button>
					</>
				)}
			</div>
		</div>
	)
}
