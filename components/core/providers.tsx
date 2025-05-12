import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { TooltipProvider } from '../ui/tooltip'

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<TooltipProvider delayDuration={25}>
				<Toaster />
				{children}
			</TooltipProvider>
		</ThemeProvider>
	)
}
