'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle, Upload, Table, FileDown } from 'lucide-react'

export function EmptyState() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
				<div className="mb-4 rounded-full bg-muted/20 p-3">
					<Table className="h-10 w-10 text-muted-foreground" />
				</div>
				<h3 className="mb-2 text-lg font-medium">This table is empty</h3>
				<p className="mb-6 text-sm text-muted-foreground">
					Get started by adding your first record or import existing data.
				</p>
				<div className="flex gap-4">
					<Button>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add First Record
					</Button>
					<Button variant="outline">
						<Upload className="mr-2 h-4 w-4" />
						Import Data
					</Button>
					<Button variant="outline">
						<FileDown className="mr-2 h-4 w-4" />
						Download Template
					</Button>
				</div>
				<div className="mt-8 rounded-lg bg-muted/50 p-4">
					<h4 className="mb-2 text-sm font-medium">Quick Tips</h4>
					<ul className="text-sm text-muted-foreground space-y-2">
						<li className="flex items-center">
							<span className="mr-2">•</span>
							Add records manually or import data from CSV/Excel
						</li>
						<li className="flex items-center">
							<span className="mr-2">•</span>
							Use the form to ensure data consistency
						</li>
						<li className="flex items-center">
							<span className="mr-2">•</span>
							All changes are saved automatically
						</li>
						<li className="flex items-center">
							<span className="mr-2">•</span>
							Download a template to see the required format
						</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
