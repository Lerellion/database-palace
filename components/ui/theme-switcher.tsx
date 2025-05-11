import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useThemeStore, type Theme } from '@/lib/store/theme-store'

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="grey">Grey</SelectItem>
        <SelectItem value="sunset-horizon">Sunset Horizon</SelectItem>
        <SelectItem value="pastel-dream">Pastel Dream</SelectItem>
        <SelectItem value="solar-dusk">Solar Dusk</SelectItem>
      </SelectContent>
    </Select>
  )
} 