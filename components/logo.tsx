'use client'

import Link from 'next/link'

const LogoIcon = () => (
	<svg
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="h-8 w-8 transition-all duration-300 group-hover:scale-110"
	>
		{/* Main hexagonal container */}
		<path
			d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
			className="fill-primary/10 stroke-primary"
			strokeWidth="1"
		/>

		{/* Animated data streams */}
		<g className="animate-[slideUp_3s_linear_infinite]">
			<path
				d="M8 18L16 22L24 18"
				className="stroke-primary"
				strokeWidth="1"
				strokeLinecap="round"
			/>
			<path
				d="M8 14L16 18L24 14"
				className="stroke-primary"
				strokeWidth="1"
				strokeLinecap="round"
			/>
			<path
				d="M8 10L16 14L24 10"
				className="stroke-primary"
				strokeWidth="1"
				strokeLinecap="round"
			/>
		</g>

		{/* Accent lines */}
		<path d="M16 2V30" className="stroke-primary/40" strokeWidth="0.75" strokeDasharray="2 2" />
		<path
			d="M4 9L28 9"
			className="stroke-primary/40"
			strokeWidth="0.75"
			strokeDasharray="2 2"
		/>
		<path
			d="M4 23L28 23"
			className="stroke-primary/40"
			strokeWidth="0.75"
			strokeDasharray="2 2"
		/>

		{/* Highlight points */}
		<circle cx="16" cy="2" r="1.5" className="fill-primary" />
		<circle cx="28" cy="9" r="1.5" className="fill-primary" />
		<circle cx="28" cy="23" r="1.5" className="fill-primary" />
		<circle cx="16" cy="30" r="1.5" className="fill-primary" />
		<circle cx="4" cy="23" r="1.5" className="fill-primary" />
		<circle cx="4" cy="9" r="1.5" className="fill-primary" />
	</svg>
)

export function Logo() {
	return (
		<div className="flex items-center justify-center py-4">
			<Link href="/dashboard">
				<div className="group relative flex h-14 w-14 items-center justify-center">
					{/* Animated background gradient */}
					<div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 opacity-90 transition-all duration-300 group-hover:opacity-100" />

					{/* Glowing effect */}
					<div className="absolute inset-0 rounded-xl bg-primary/5 blur-xl transition-all duration-300 group-hover:bg-primary/10" />

					{/* Main icon container */}
					<div className="relative flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-lg border border-primary/20">
						<LogoIcon />
					</div>

					{/* Tooltip */}
					<span className="absolute left-full ml-3 hidden rounded-md bg-popover/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-lg group-hover:block border border-border/50">
						Database Palace
					</span>
				</div>
			</Link>
		</div>
	)
}
