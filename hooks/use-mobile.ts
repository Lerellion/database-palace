import { useEffect, useState } from 'react'

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768) // 768px is the md breakpoint in Tailwind
		}

		checkIsMobile()
		window.addEventListener('resize', checkIsMobile)

		return () => {
			window.removeEventListener('resize', checkIsMobile)
		}
	}, [])

	return isMobile
}
