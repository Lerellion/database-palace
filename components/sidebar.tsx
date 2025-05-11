'use client'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import { ChevronRight, Database, Shield } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SidebarContent({ tables }: { tables: string[] }) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const currentTable = searchParams.get('table')

	return (
		<div className="flex h-full">
			<div className="flex h-full w-16 flex-col items-center border-r border-border bg-sidebar py-4">
				<Button variant="ghost" size="icon" className="mb-2">
					<Database className="h-5 w-5" />
				</Button>
				<Button variant="ghost" size="icon">
					<Shield className="h-5 w-5" />
				</Button>
			</div>

			{/* Secondary Sidebar */}
			<div className="w-64 border-r border-border bg-sidebar">
				<div className="flex items-center justify-between border-b border-border p-4">
					<div className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						<span className="font-medium">Tables</span>
					</div>
					<Button variant="ghost" size="icon">
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				<ScrollArea className="h-[calc(100vh-4rem)]">
					<div className="p-2">
						{/* Table list */}
						{tables.map(table => (
							<button
								key={table}
								onClick={() => {
									const params = new URLSearchParams(searchParams)
									params.set('table', table)
									router.push(`?${params.toString()}`)
								}}
								className={cn(
									'flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors duration-200',
									'hover:bg-accent hover:text-accent-foreground',
									currentTable === table
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground'
								)}
							>
								{table}
							</button>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}

export function Sidebar({ tables }: { tables: string[] }) {
	return (
		<Suspense>
			<SidebarContent tables={tables} />
		</Suspense>
	)
}
