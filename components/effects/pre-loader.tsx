'use client'

import { Logo } from '@/components/logo'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

type TProps = {
	isLoading: boolean
	onLoadingComplete?: () => void
}

export function PreLoader({ isLoading, onLoadingComplete }: TProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	// Animation variants for the grid items
	const gridVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05
			}
		},
		exit: {
			opacity: 0,
			transition: {
				staggerChildren: 0.03,
				staggerDirection: -1
			}
		}
	}

	const itemVariants = {
		hidden: {
			opacity: 0,
			scale: 0.3
		},
		show: {
			opacity: 1,
			scale: 1,
			transition: {
				type: 'spring',
				damping: 15
			}
		},
		exit: {
			opacity: 0,
			scale: 0.5,
			transition: {
				duration: 0.2
			}
		}
	}

	// Text animation variants
	const textVariants = {
		hidden: {
			opacity: 0,
			y: 20
		},
		show: {
			opacity: 1,
			y: 0,
			transition: {
				delay: 0.5,
				duration: 0.6,
				ease: [0.23, 1, 0.32, 1]
			}
		},
		exit: {
			opacity: 0,
			y: -20,
			transition: {
				duration: 0.2
			}
		}
	}

	useEffect(() => {
		if (!isLoading) return
		const timer = setTimeout(() => {
			onLoadingComplete?.()
		}, 2000)
		return () => clearTimeout(timer)
	}, [isLoading, onLoadingComplete])

	return (
		<AnimatePresence mode="wait">
			{isLoading && (
				<motion.div
					ref={containerRef}
					className="fixed inset-0 z-50 flex flex-col bg-background"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					{/* Logo in top-left corner */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
						className="absolute left-4 top-4"
					>
						<Logo />
					</motion.div>

					{/* Main content centered */}
					<div className="flex flex-1 items-center justify-center">
						<div className="relative flex flex-col items-center">
							{/* Grid Animation */}
							<motion.div
								variants={gridVariants}
								initial="hidden"
								animate="show"
								exit="exit"
								className="relative grid grid-cols-5 gap-1"
							>
								{Array.from({ length: 25 }).map((_, i) => (
									<motion.div
										key={i}
										variants={itemVariants}
										className={`h-4 w-4 rounded-sm bg-primary ${
											i === 12 ? 'bg-primary' : 'bg-primary/20'
										} ${
											[6, 7, 8, 11, 13, 16, 17, 18].includes(i)
												? 'bg-primary/40'
												: ''
										}`}
										style={{
											transformOrigin: i === 12 ? 'center' : 'center'
										}}
									/>
								))}

								{/* Animated overlay */}
								<motion.div
									className="absolute inset-0 grid grid-cols-5 gap-1"
									animate={{
										opacity: [0, 0.5, 0]
									}}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: 'linear'
									}}
								>
									{Array.from({ length: 25 }).map((_, i) => (
										<div
											key={i}
											className={`h-4 w-4 rounded-sm bg-primary/0 ${
												[7, 11, 12, 13, 17].includes(i)
													? 'animate-pulse bg-primary/20'
													: ''
											}`}
										/>
									))}
								</motion.div>
							</motion.div>

							{/* Text */}
							<motion.div
								variants={textVariants}
								initial="hidden"
								animate="show"
								exit="exit"
								className="mt-8 flex flex-col items-center"
							>
								<span className="text-lg font-medium text-primary">
									Database Palace
								</span>
								<span className="mt-2 text-sm text-muted-foreground">
									<motion.span
										animate={{
											opacity: [1, 0.5, 1]
										}}
										transition={{
											duration: 1.5,
											repeat: Infinity,
											ease: 'linear'
										}}
									>
										Initializing
									</motion.span>
								</span>
							</motion.div>

							{/* Progress bar */}
							<motion.div
								className="mt-6 h-0.5 w-32 overflow-hidden bg-primary/20"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<motion.div
									className="h-full bg-primary"
									animate={{
										x: ['-100%', '100%']
									}}
									transition={{
										duration: 1,
										repeat: Infinity,
										ease: 'linear'
									}}
								/>
							</motion.div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
