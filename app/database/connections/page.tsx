import ConnectionForm from '@/components/database/connection-form'
import ConnectionList from '@/components/database/connection-list'

import { Suspense } from 'react'

export default function DatabaseConnectionsPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-8">Database Connections</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-card rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Add New Connection</h2>
					<Suspense fallback={<div>Loading form...</div>}>
						<ConnectionForm />
					</Suspense>
				</div>

				<div className="bg-card rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Your Connections</h2>
					<Suspense fallback={<div>Loading connections...</div>}>
						<ConnectionList />
					</Suspense>
				</div>
			</div>
		</div>
	)
}
