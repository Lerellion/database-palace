'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { motion } from 'framer-motion'
import { cn } from 'helpers'
import { useEffect, useState } from 'react'

import { type ColorTheme, useThemeStore } from '@/state/'

const themes = [
	{
		key: 'grey' as ColorTheme,
		label: 'Grey',
		icon: () => (
			<div className="h-4 w-4 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600" />
		)
	},
	{
		key: 'sunset-horizon' as ColorTheme,
		label: 'Sunset Horizon',
		icon: () => (
			<div className="h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-600" />
		)
	},

	{
		key: 'solar-dusk' as ColorTheme,
		label: 'Solar Dusk',
		icon: () => (
			<div className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-500 to-blue-700" />
		)
	},
	{
		key: 'graphite' as ColorTheme,
		label: 'Graphite',
		icon: () => (
			<div className="h-4 w-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
		)
	},
	{
		key: 'caffeine' as ColorTheme,
		label: 'Caffeine Light',
		icon: () => (
			<div className="h-4 w-4 rounded-full bg-gradient-to-br from-[#ffe0c0] to-[#081a1b]" />
		)
	},
	{
		key: 'caffeine-dark' as ColorTheme,
		label: 'Caffeine Dark',
		icon: () => (
			<div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-600" />
		)
	}
]

type TProps = {
	className?: string
}

export function ThemeSwitcher({ className }: TProps) {
	const { colorTheme, setColorTheme } = useThemeStore()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (typeof window !== 'undefined' && mounted) {
			const root = window.document.documentElement
			root.setAttribute('data-theme', colorTheme)
		}
	}, [colorTheme, mounted])

	if (!mounted) {
		return null
	}

	return (
		<div className="flex gap-2">
			<div
				className={cn(
					'relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
					className
				)}
			>
				{themes.map(({ key, icon: Icon, label }) => {
					const isActive = colorTheme === key
					return (
						<Tooltip key={key}>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="relative h-6 w-6 rounded-full"
									onClick={() => setColorTheme(key)}
									aria-label={label}
								>
									{isActive && (
										<motion.div
											layoutId="activeTheme"
											className="absolute inset-0 rounded-full bg-secondary"
											transition={{ type: 'spring', duration: 0.5 }}
										/>
									)}
									<div className="relative z-10 flex h-full items-center justify-center">
										<Icon />
									</div>
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>{label}</p>
							</TooltipContent>
						</Tooltip>
					)
				})}
			</div>
		</div>
	)
}
