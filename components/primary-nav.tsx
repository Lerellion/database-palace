'use client'

import { cn } from '@/lib/utils'

import {
	BarChart,
	Database,
	FileCode,
	Grid,
	KeyRound,
	Settings,
	Table,
	Terminal
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
	{ name: 'Dashboard', href: '/', icon: Grid },
	{ name: 'Tables', href: '/tables', icon: Table },
	{ name: 'Database', href: '/database', icon: Database },
	{ name: 'Auth', href: '/auth', icon: KeyRound },
	{ name: 'Analytics', href: '/analytics', icon: BarChart },
	{ name: 'Functions', href: '/functions', icon: FileCode },
	{ name: 'SQL Editor', href: '/sql', icon: Terminal },
	{ name: 'Settings', href: '/settings', icon: Settings }
]

export function PrimaryNav() {
	const pathname = usePathname()

	return (
		<div className="flex h-screen w-16 flex-col items-center border-r border-border bg-sidebar py-4">
			<div className="mb-8">
				<Link href="/">
					<div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
						<Database className="h-6 w-6 text-primary-foreground" />
					</div>
				</Link>
			</div>
			<nav className="flex flex-1 flex-col gap-4">
				{navigation.map(item => {
					const Icon = item.icon
					return (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								'group relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent',
								pathname === item.href && 'bg-accent'
							)}
						>
							<Icon
								className={cn(
									'h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground',
									pathname === item.href && 'text-foreground'
								)}
							/>
							<span className="absolute left-full ml-2 hidden rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground group-hover:block">
								{item.name}
							</span>
						</Link>
					)
				})}
			</nav>
		</div>
	)
}
