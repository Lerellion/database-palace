'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TableView } from '../components/table-view'

function SearchParamsComponent() {
	const searchParams = useSearchParams()
	// Use searchParams here
	return null
}

export default function SyntheticV0PageForDeployment() {
	return (
		<div>
			<Suspense>
				<SearchParamsComponent />
			</Suspense>
			<TableView />
		</div>
	)
}
