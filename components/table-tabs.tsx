'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function TableTabsContent({ tabs }: { tabs: string[] }) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const currentTab = searchParams.get('tab') || tabs[0]

	return (
		<div className="flex space-x-4 border-b border-border">
			{tabs.map(tab => (
				<button
					key={tab}
					className={`px-4 py-2 text-sm font-medium ${
						currentTab === tab
							? 'border-b-2 border-primary text-primary'
							: 'text-muted-foreground hover:text-foreground'
					}`}
					onClick={() => {
						const params = new URLSearchParams(searchParams)
						params.set('tab', tab)
						router.push(`?${params.toString()}`)
					}}
				>
					{tab}
				</button>
			))}
		</div>
	)
}

export function TableTabs({ tabs }: { tabs: string[] }) {
	return (
		<Suspense>
			<TableTabsContent tabs={tabs} />
		</Suspense>
	)
}
