import { PrimaryNav } from '@/components/primary-nav'
import { Toaster } from '@/components/ui/toaster'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'PostgreSQL Dashboard',
	description: 'A powerful dashboard for managing PostgreSQL databases'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<div className="flex h-screen bg-background text-foreground">
					{/* Primary Navigation - fixed width */}
					<PrimaryNav />

					{/* Main Content Area - includes feature nav + content */}
					<div className="flex-1 flex">{children}</div>
				</div>
				<Toaster />
			</body>
		</html>
	)
}
