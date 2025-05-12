import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
				<p className="text-muted-foreground mb-8">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					href="/"
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
				>
					Return Home
				</Link>
			</div>
		</div>
	)
}

// import Link from 'next/link'

// export default function NotFound() {
// 	return (
// 		<div className="flex min-h-screen flex-col items-center justify-center">
// 			<h2 className="text-2xl font-bold mb-4 text-neutral-200">Page Not Found</h2>
// 			<p className="text-muted-foreground mb-4">Could not find requested resource</p>
// 			<Link
// 				href="/"
// 				className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
// 			>
// 				Return Home
// 			</Link>
// 		</div>
// 	)
// }
