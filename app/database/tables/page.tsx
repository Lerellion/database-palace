'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableIcon, PlusIcon, SearchIcon } from "lucide-react"

type TProps = {
  name: string
  rowCount: number
  size: string
  lastAnalyzed: string
}

export default function TablesPage() {
  const [tables, setTables] = useState<TProps[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch tables from the API
    // This is just mock data for now
    setTables([
      {
        name: "users",
        rowCount: 1000,
        size: "1.2 MB",
        lastAnalyzed: "2024-03-10",
      },
      {
        name: "products",
        rowCount: 500,
        size: "800 KB",
        lastAnalyzed: "2024-03-10",
      },
      // Add more mock tables...
    ])
    setIsLoading(false)
  }, [])

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tables</h1>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Table
        </Button>
      </div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          filteredTables.map((table) => (
            <div
              key={table.name}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <TableIcon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-medium">{table.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {table.rowCount.toLocaleString()} rows • {table.size}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 