import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { Preloader } from '../core/pre-loader'
import { TooltipProvider } from '../ui/tooltip'

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<TooltipProvider delayDuration={25}>
				<Preloader />
				<Toaster />
				{children}
			</TooltipProvider>
		</ThemeProvider>
	)
}
