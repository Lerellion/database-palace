'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Logo } from '../logo'

const formatCLIText = (text: string) => {
	if (text.startsWith('$')) {
		const parts = text.split(' ')
		return (
			<>
				<span className="text-primary/80">$</span>{' '}
				<span className="text-emerald-400">{parts[1]}</span>{' '}
				{parts.slice(2).map((part, i) => {
					if (part.startsWith('-')) {
						return (
							<span key={i}>
								<span className="text-purple-300">{part.slice(0, 2)}</span>
								<span className="text-yellow-300">{part.slice(2)}</span>{' '}
							</span>
						)
					}
					return (
						<span key={i} className="text-blue-300">
							{part}{' '}
						</span>
					)
				})}
			</>
		)
	}
	return <span className="text-white/60 pl-[13px]">{text}</span>
}

const connectionSteps = [
	'$ psql -h localhost -p 5432 -U admin -d palace_db',
	"Connected to database 'palace_db' (PostgreSQL 15.4)"
] as const

export const Preloader = () => {
	const [isLoading, setIsLoading] = useState(true)
	const [currentStep, setCurrentStep] = useState(0)
	const [showCLI, setShowCLI] = useState(false)

	useEffect(() => {
		const hasVisited = localStorage.getItem('hasVisitedBefore')

		if (hasVisited) {
			setIsLoading(false)
			return
		}

		localStorage.setItem('hasVisitedBefore', 'true')
		const timer = setTimeout(() => {
			setShowCLI(true)
		}, 1000)

		return () => clearTimeout(timer)
	}, [])

	useEffect(() => {
		if (!showCLI) return

		const stepInterval = setInterval(() => {
			setCurrentStep(prev => {
				if (prev < connectionSteps.length - 1) return prev + 1
				clearInterval(stepInterval)
				setTimeout(() => setIsLoading(false), 1200)
				return prev
			})
		}, 800)

		return () => clearInterval(stepInterval)
	}, [showCLI, connectionSteps.length])

	return (
		<AnimatePresence mode="wait">
			{isLoading && (
				<motion.div
					initial={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
					animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
					exit={{
						opacity: 0,
						clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
						transition: {
							opacity: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
							clipPath: { duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 1.15 }
						}
					}}
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111]/95 backdrop-blur-sm"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
							transition: {
								duration: 0.5,
								ease: [0.22, 1, 0.36, 1]
							}
						}}
						exit={{
							opacity: 0,
							scale: 0.9,
							y: -20,
							transition: {
								duration: 0.4,
								ease: [0.76, 0, 0.24, 1]
							}
						}}
						className="relative flex flex-col items-center"
					>
						<motion.div
							className="scale-150 mb-8"
							whileHover={{ scale: 1.6 }}
							transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
						>
							<Logo />
						</motion.div>
						<motion.div
							className="font-mono text-sm w-[500px] bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20 shadow-xl"
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{
								opacity: showCLI ? 1 : 0,
								y: showCLI ? 0 : 20,
								scale: showCLI ? 1 : 0.95
							}}
							transition={{
								duration: 0.6,
								ease: [0.32, 0.72, 0, 1]
							}}
						>
							<motion.div
								className="flex items-center gap-1.5 mb-3 pb-2 border-b border-primary/10"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2, duration: 0.3 }}
							>
								<div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
								<div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
								<div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
							</motion.div>
							<div className="relative h-[4rem] px-3">
								{connectionSteps.map((step, index) => (
									<motion.div
										key={step}
										initial={{ opacity: 0, x: -10, y: 5 }}
										animate={{
											opacity: index <= currentStep ? 1 : 0,
											x: index <= currentStep ? 0 : -10,
											y: index <= currentStep ? 0 : 5
										}}
										transition={{
											duration: 0.4,
											ease: [0.32, 0.72, 0, 1],
											delay: index * 0.15
										}}
										className="text-[13px] font-mono absolute w-full  tracking-tight -translate-x-4"
										style={{ top: `${index * 1.5}rem` }}
									>
										{formatCLIText(step)}
										{index === currentStep && (
											<motion.span
												initial={{ opacity: 0 }}
												animate={{ opacity: [0, 1, 0] }}
												transition={{
													duration: 1,
													ease: 'easeInOut',
													repeat: Infinity
												}}
												className="inline-block ml-1 text-primary"
											>
												▋
											</motion.span>
										)}
									</motion.div>
								))}
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
