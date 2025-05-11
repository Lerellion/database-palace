'use client'

import { useConnectionStore } from '@/lib/store/connection-store'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Database, Table as TableIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function TableViewContent() {
	const { isConnected, tables } = useConnectionStore()
	const searchParams = useSearchParams()
	const currentTable = searchParams.get('table')

	if (!isConnected) {
		return (
			<div className="flex h-full items-center justify-center">
				<Card className="w-96 p-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<Database className="h-12 w-12 text-muted-foreground" />
						<div>
							<h2 className="text-lg font-semibold">No Active Connection</h2>
							<p className="text-sm text-muted-foreground">
								Connect to a database to view and manage tables
							</p>
						</div>
						<Button asChild className="w-full">
							<a href="/database">Connect Database</a>
						</Button>
					</div>
				</Card>
			</div>
		)
	}

	if (!tables || tables.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<Card className="w-96 p-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<TableIcon className="h-12 w-12 text-muted-foreground" />
						<div>
							<h2 className="text-lg font-semibold">No Tables Found</h2>
							<p className="text-sm text-muted-foreground">
								The connected database has no tables
							</p>
						</div>
					</div>
				</Card>
			</div>
		)
	}

	if (!currentTable) {
		return (
			<div className="flex h-full items-center justify-center">
				<Card className="w-96 p-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<TableIcon className="h-12 w-12 text-muted-foreground" />
						<div>
							<h2 className="text-lg font-semibold">Select a Table</h2>
							<p className="text-sm text-muted-foreground">
								Choose a table from the sidebar to view its data
							</p>
						</div>
					</div>
				</Card>
			</div>
		)
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-border p-4">
				<div>
					<h1 className="text-lg font-semibold">{currentTable}</h1>
					<p className="text-sm text-muted-foreground">
						View and manage table data
					</p>
				</div>
			</div>

			<Tabs defaultValue="data" className="flex-1">
				<div className="border-b border-border px-4">
					<TabsList>
						<TabsTrigger value="data">Data</TabsTrigger>
						<TabsTrigger value="structure">Structure</TabsTrigger>
						<TabsTrigger value="indexes">Indexes</TabsTrigger>
						<TabsTrigger value="constraints">Constraints</TabsTrigger>
					</TabsList>
				</div>

				<ScrollArea className="h-[calc(100vh-12rem)]">
					<TabsContent value="data" className="p-4">
						{/* Table data content */}
					</TabsContent>

					<TabsContent value="structure" className="p-4">
						{/* Table structure content */}
					</TabsContent>

					<TabsContent value="indexes" className="p-4">
						{/* Table indexes content */}
					</TabsContent>

					<TabsContent value="constraints" className="p-4">
						{/* Table constraints content */}
					</TabsContent>
				</ScrollArea>
			</Tabs>
		</div>
	)
}

export function TableView() {
	return (
		<Suspense>
			<TableViewContent />
		</Suspense>
	)
}
