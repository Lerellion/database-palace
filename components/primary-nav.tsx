'use client'

import { cn } from 'helpers'
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
	{ name: 'Dashboard', href: '/dashboard', icon: Grid, disabled: true },
	{ name: 'Tables', href: '/tables', icon: Table, disabled: false },
	{ name: 'Database', href: '/database', icon: Database, disabled: true },
	{ name: 'Auth', href: '/auth', icon: KeyRound, disabled: true },
	{ name: 'Analytics', href: '/analytics', icon: BarChart, disabled: true },
	{ name: 'Functions', href: '/functions', icon: FileCode, disabled: true },
	{ name: 'SQL Editor', href: '/sql', icon: Terminal, disabled: true },
	{ name: 'Settings', href: '/settings', icon: Settings, disabled: true }
]

export function PrimaryNav() {
	const pathname = usePathname()

	return (
		<div className="flex h-screen w-16 flex-col items-center border-r border-border bg-sidebar">
			<nav className="flex flex-1 flex-col gap-4 py-4">
				{navigation.map(item => {
					const Icon = item.icon
					return (
						<div
							key={item.name}
							className={cn(
								'group relative flex h-10 w-10 items-center justify-center rounded-md',
								item.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent',
								!item.disabled && pathname === item.href && 'bg-accent'
							)}
						>
							{item.disabled ? (
								<>
									<Icon className="h-5 w-5 text-muted-foreground" />
									<span className="absolute left-full ml-2 hidden rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground group-hover:block">
										{item.name} (Coming Soon)
									</span>
								</>
							) : (
								<Link
									href={item.href}
									className="flex h-full w-full items-center justify-center"
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
							)}
						</div>
					)
				})}
			</nav>
		</div>
	)
}
