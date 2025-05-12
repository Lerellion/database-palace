import { Providers } from '@/components/core/providers'
import { PrimaryNav } from '@/components/primary-nav'
import { TopNav } from '@/components/top-nav'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '../styles/globals.css'
import '../styles/themes.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'PostgreSQL Dashboard',
	description: 'A powerful dashboard for managing PostgreSQL databases'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const defaultTheme = 'graphite'

	return (
		<html lang="en" data-theme={defaultTheme} suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<meta name="theme-color" content="#020817" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
			</head>
			<body className={inter.className}>
				<Providers>
					<div className="flex h-screen flex-col bg-background text-foreground">
						<TopNav />
						<div className="flex flex-1">
							<PrimaryNav />
							<main className="flex flex-1 overflow-auto">{children}</main>
						</div>
					</div>
				</Providers>
			</body>
		</html>
	)
}
