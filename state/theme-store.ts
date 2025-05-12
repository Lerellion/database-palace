'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColorTheme =
	| 'grey'
	| 'sunset-horizon'
	| 'solar-dusk'
	| 'graphite'
	| 'caffeine'
	| 'caffeine-dark'

type TTheme = {
	colorTheme: ColorTheme
	setColorTheme: (theme: ColorTheme) => void
	isHydrated: boolean
	setHydrated: (state: boolean) => void
}

export const useThemeStore = create<TTheme>()(
	persist(
		set => ({
			colorTheme: 'grey',
			setColorTheme: colorTheme => {
				if (typeof window !== 'undefined') {
					set({ colorTheme })
				}
			},
			isHydrated: false,
			setHydrated: isHydrated => set({ isHydrated })
		}),
		{
			name: 'db-palace-theme-storage',
			onRehydrateStorage: () => state => {
				state?.setHydrated(true)
			},
			skipHydration: true,
			storage: {
				getItem: name => {
					if (typeof window === 'undefined') return null
					return JSON.parse(window.localStorage.getItem(name) || 'null')
				},
				setItem: (name, value) => {
					if (typeof window !== 'undefined') {
						window.localStorage.setItem(name, JSON.stringify(value))
					}
				},
				removeItem: name => {
					if (typeof window !== 'undefined') {
						window.localStorage.removeItem(name)
					}
				}
			}
		}
	)
)
