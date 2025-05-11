"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Database, Table as TableIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export function Sidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const currentTable = searchParams.get("table")

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch("/api/tables")
        if (!response.ok) {
          throw new Error("Failed to fetch tables")
        }
        const data = await response.json()
        setTables(data.tables)
      } catch (error) {
        console.error("Error fetching tables:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  const handleTableSelect = (tableName: string) => {
    router.push(`/?table=${encodeURIComponent(tableName)}`)
  }

  const filteredTables = tables.filter(table => 
    table.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-medium">Tables</h2>
        </div>
      </div>
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filter tables..."
            className="pl-8 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-8.5rem)]">
        <div className="space-y-1 p-2">
          {filteredTables.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2">
              {tables.length === 0 ? "No tables found" : "No matches found"}
            </div>
          ) : (
            filteredTables.map((table) => (
              <Button
                key={table}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-8 px-2 text-sm font-normal",
                  currentTable === table ? 
                    "bg-accent text-accent-foreground" : 
                    "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleTableSelect(table)}
              >
                <TableIcon className="h-4 w-4" />
                {table}
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  )

  return (
    <div className="w-64 border-r border-border bg-sidebar">
      {loading ? (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-medium">Tables</h2>
          </div>
          <div className="text-sm text-muted-foreground">Loading tables...</div>
        </div>
      ) : (
        sidebarContent
      )}
    </div>
  )
} 