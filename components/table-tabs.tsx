"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface Tab {
  table: string
  active: boolean
}

export function TableTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTable = searchParams.get("table")
  const [tabs, setTabs] = useState<Tab[]>([])

  useEffect(() => {
    if (currentTable && !tabs.some(tab => tab.table === currentTable)) {
      setTabs(prev => [...prev, { table: currentTable, active: true }])
    }
    // Update active state
    setTabs(prev => 
      prev.map(tab => ({
        ...tab,
        active: tab.table === currentTable
      }))
    )
  }, [currentTable])

  const handleTabClick = (tableName: string) => {
    router.push(`/?table=${encodeURIComponent(tableName)}`)
  }

  const handleTabClose = (e: React.MouseEvent, tableName: string) => {
    e.stopPropagation()
    setTabs(prev => prev.filter(tab => tab.table !== tableName))
    if (currentTable === tableName) {
      const remainingTabs = tabs.filter(tab => tab.table !== tableName)
      if (remainingTabs.length > 0) {
        router.push(`/?table=${encodeURIComponent(remainingTabs[remainingTabs.length - 1].table)}`)
      } else {
        router.push('/')
      }
    }
  }

  if (tabs.length === 0) return null

  return (
    <div className="h-10 border-b border-border bg-background">
      <div className="flex h-full px-2">
        {tabs.map((tab) => (
          <button
            key={tab.table}
            onClick={() => handleTabClick(tab.table)}
            className={cn(
              "group relative h-full px-4 text-sm transition-all duration-200",
              "hover:bg-muted/50",
              "focus:outline-none focus:ring-0",
              "flex items-center gap-2",
              tab.active && [
                "bg-background",
                "before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary",
                "before:transition-all before:duration-200"
              ]
            )}
          >
            <span className={cn(
              "text-muted-foreground transition-colors duration-200",
              tab.active && "text-foreground font-medium",
              "group-hover:text-foreground"
            )}>
              {tab.table}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200",
                tab.active && "opacity-100",
                "hover:bg-destructive/10 hover:text-destructive"
              )}
              onClick={(e) => handleTabClose(e, tab.table)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </button>
        ))}
      </div>
    </div>
  )
} 