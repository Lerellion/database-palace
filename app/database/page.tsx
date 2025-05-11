"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Power, Link as LinkIcon, Trash2 } from "lucide-react"
import { useConnectionStore, type ConnectionConfig, type ConnectionType } from "@/lib/store/connection-store"
import { useHistoryStore } from "@/lib/store/history-store"
import { dbService } from "@/lib/services/database"
import { toast } from "@/components/ui/use-toast"

export default function DatabasePage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionMethod, setConnectionMethod] = useState<ConnectionType>('url')
  const { setActiveConnection, setConnectionStatus, setTables } = useConnectionStore()
  const { connections, addConnection, removeConnection } = useHistoryStore()
  
  const [formData, setFormData] = useState({
    url: '',
    fields: {
      host: 'localhost',
      port: '5432',
      database: 'postgres',
      schema: 'public',
      username: 'postgres',
      password: '',
    }
  })

  const handleConnect = async (connection?: ConnectionConfig) => {
    const connectionConfig = connection || {
      type: connectionMethod,
      name: connectionMethod === 'url' ? 'URL Connection' : `${formData.fields.database} on ${formData.fields.host}`,
      ...(connectionMethod === 'url' ? { url: formData.url } : { fields: formData.fields })
    }

    setIsConnecting(true)
    try {
      // Try to connect
      await dbService.connect(connectionConfig)
      
      // Get tables for the connected database
      const tables = await dbService.getTables(connectionConfig.fields?.schema || 'public')
      
      // Update stores
      setActiveConnection(connectionConfig)
      setConnectionStatus(true)
      setTables(tables)
      addConnection(connectionConfig)
      
      // Navigate to tables view
      router.push('/tables')
      
      toast({
        title: "Connected successfully",
        description: `Connected to ${connectionConfig.name}`,
      })
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to database",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (connectionMethod === 'url') {
      setFormData(prev => ({ ...prev, url: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        fields: { ...prev.fields, [field]: value }
      }))
    }
  }

  const handleTestConnection = async () => {
    const connectionConfig = {
      type: connectionMethod,
      name: 'Test Connection',
      ...(connectionMethod === 'url' ? { url: formData.url } : { fields: formData.fields })
    }

    try {
      await dbService.connect(connectionConfig)
      await dbService.disconnect()
      toast({
        title: "Test successful",
        description: "Successfully connected to the database",
      })
    } catch (error) {
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "Failed to connect to database",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Database Connection</h1>
          <p className="text-sm text-muted-foreground">
            Connect to your PostgreSQL database
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
          <CardDescription>
            Connect using a URL string or individual fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={connectionMethod} onValueChange={(v) => setConnectionMethod(v as ConnectionType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Connection URL
              </TabsTrigger>
              <TabsTrigger value="fields" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Connection Fields
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Connection URL</Label>
                <Input 
                  id="url" 
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="postgresql://user:password@localhost:5432/database" 
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Format: postgresql://user:password@host:port/database
                </p>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input 
                    id="host" 
                    value={formData.fields.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    placeholder="localhost" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input 
                    id="port" 
                    value={formData.fields.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    placeholder="5432" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input 
                    id="database" 
                    value={formData.fields.database}
                    onChange={(e) => handleInputChange('database', e.target.value)}
                    placeholder="postgres" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schema">Schema</Label>
                  <Input 
                    id="schema" 
                    value={formData.fields.schema}
                    onChange={(e) => handleInputChange('schema', e.target.value)}
                    placeholder="public" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={formData.fields.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="postgres" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={formData.fields.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleTestConnection}
              disabled={isConnecting}
            >
              Test Connection
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => handleConnect()}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {connections.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection History</CardTitle>
                <CardDescription>
                  Recently used database connections
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connections.map((connection, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {connection.type === 'url' 
                          ? connection.url 
                          : `${connection.fields?.username}@${connection.fields?.host}:${connection.fields?.port}/${connection.fields?.database}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeConnection(connection)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleConnect(connection)}
                      disabled={isConnecting}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 