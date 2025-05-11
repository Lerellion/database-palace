import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'grey' | 'sunset-horizon' | 'pastel-dream' | 'solar-dusk'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'grey',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
) 