'use client'

import { cn } from '@/lib/utils'

import {
	Activity,
	Database,
	FileCode,
	Layers,
	Lock,
	Settings,
	Terminal
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

const navigation = [
	{
		name: 'CONNECTION',
		items: [
			{ name: 'Connections', href: '/database/connections', icon: Database },
			{ name: 'Status', href: '/database/status', icon: Activity }
		]
	},
	{
		name: 'DATA',
		items: [
			{ name: 'Tables', href: '/database/tables', icon: Layers },
			{ name: 'Query Builder', href: '/database/query', icon: Terminal }
		]
	},
	{
		name: 'SECURITY',
		items: [
			{ name: 'Access Control', href: '/database/access', icon: Lock },
			{ name: 'Backups', href: '/database/backups', icon: FileCode }
		]
	},
	{
		name: 'SETTINGS',
		items: [{ name: 'Configuration', href: '/database/settings', icon: Settings }]
	}
]

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()

	return (
		<>
			{/* Feature Navigation Sidebar */}
			<div className="w-64 border-r border-border bg-sidebar">
				<div className="p-6">
					<h1 className="text-lg font-semibold">Database Manager</h1>
					<p className="text-sm text-muted-foreground">
						Manage your database connections
					</p>
				</div>
				<nav className="space-y-6 px-4">
					{navigation.map(section => (
						<div key={section.name}>
							<h2 className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground">
								{section.name}
							</h2>
							<div className="space-y-1">
								{section.items.map(item => {
									const Icon = item.icon
									return (
										<Link
											key={item.name}
											href={item.href}
											className={cn(
												'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
												pathname === item.href
													? 'bg-accent text-accent-foreground'
													: 'text-muted-foreground'
											)}
										>
											<Icon className="h-4 w-4" />
											{item.name}
										</Link>
									)
								})}
							</div>
						</div>
					))}
				</nav>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0">{children}</div>
		</>
	)
}
