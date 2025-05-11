'use client'

import { useState } from 'react'

import { PreLoader } from '../components/effects/pre-loader'
import { TableView } from '../components/table-view'

export default function Home() {
	const [isLoading, setIsLoading] = useState(true)

	return (
		<>
			<PreLoader isLoading={isLoading} onLoadingComplete={() => setIsLoading(false)} />
			<TableView />
		</>
	)
}
