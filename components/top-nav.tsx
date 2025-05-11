import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Bell, ChevronDown, Search } from 'lucide-react'

import { Logo } from './logo'
import { ThemeSwitcher } from './ui/theme-switcher'

export function TopNav() {
	return (
		<div className="bg-sidebar h-16 py-2 pr-2 w-screen border-b border-border">
			<div className="flex h-full items-center justify-between pl-2">
				<Logo />
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search..."
							className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>
					<ThemeSwitcher />
					<button className="relative rounded-full p hover:bg-accent">
						<Bell className="h-5 w-5 text-muted-foreground" />
						<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
					</button>
					<DropdownMenu>
						<DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
							<div className="h-6 w-6 rounded-full bg-primary" />
							<span>Account</span>
							<ChevronDown className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Profile</DropdownMenuItem>
							<DropdownMenuItem>Settings</DropdownMenuItem>
							<DropdownMenuItem className="text-destructive">
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	)
}
