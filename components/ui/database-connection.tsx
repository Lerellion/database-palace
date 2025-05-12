'use client'

import { Database } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'
import { Switch } from './switch'

type ConnectionFormData = {
	url: string
	sslEnabled: boolean
	sslCertPath?: string
}

export function DatabaseConnection() {
	const [formData, setFormData] = useState<ConnectionFormData>({
		url: '',
		sslEnabled: false
	})
	const [isConnecting, setIsConnecting] = useState(false)
	const [dockerStatus, setDockerStatus] = useState<'checking' | 'running' | 'not-running'>(
		'checking'
	)

	useEffect(() => {
		// Check if Docker PostgreSQL is running
		async function checkDockerStatus() {
			try {
				const response = await fetch('/api/database/connect', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						type: 'fields',
						fields: {
							host: 'localhost',
							port: '5433',
							database: 'database_palace',
							username: 'postgres',
							password: 'postgres'
						}
					})
				})

				setDockerStatus(response.ok ? 'running' : 'not-running')
			} catch {
				setDockerStatus('not-running')
			}
		}

		checkDockerStatus()
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsConnecting(true)

		try {
			const response = await fetch('/api/database/connect', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to connect to database')
			}

			toast.success('Connection successful', {
				description: 'Successfully connected to the database'
			})

			localStorage.setItem(
				'dbConnection',
				JSON.stringify({
					...formData,
					timestamp: new Date().toISOString()
				})
			)
		} catch (error) {
			toast.error('Connection failed', {
				description:
					error instanceof Error ? error.message : 'Failed to connect to database'
			})
		} finally {
			setIsConnecting(false)
		}
	}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle>Database Connection</CardTitle>
				<CardDescription>
					Connect to your PostgreSQL database using a connection URL
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Docker Status Alert */}
				{dockerStatus === 'running' && (
					<Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20">
						<Database className="h-4 w-4 text-emerald-500" />
						<AlertTitle>Docker PostgreSQL Available</AlertTitle>
						<AlertDescription>
							A local Docker PostgreSQL instance is running on port 5433. You can
							connect to it using the Quick Connect option above.
						</AlertDescription>
					</Alert>
				)}
				{dockerStatus === 'not-running' && (
					<Alert className="mb-6 bg-amber-500/10 border-amber-500/20">
						<Database className="h-4 w-4 text-amber-500" />
						<AlertTitle>Docker PostgreSQL Not Found</AlertTitle>
						<AlertDescription>
							Start your Docker PostgreSQL container with:
							<br />
							<code className="text-xs bg-muted p-2 rounded-md block mt-2">
								docker-compose up -d
							</code>
						</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="url">Database URL</Label>
						<Input
							id="url"
							placeholder="postgres://username:password@host:port/database"
							value={formData.url}
							onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Format: postgres://username:password@host:port/database
						</p>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="ssl" className="cursor-pointer">
							Enable SSL
						</Label>
						<Switch
							id="ssl"
							checked={formData.sslEnabled}
							onCheckedChange={checked =>
								setFormData(prev => ({ ...prev, sslEnabled: checked }))
							}
						/>
					</div>

					{formData.sslEnabled && (
						<div className="space-y-2">
							<Label htmlFor="sslCert">SSL Certificate Path (Optional)</Label>
							<Input
								id="sslCert"
								placeholder="/path/to/ca.crt"
								value={formData.sslCertPath || ''}
								onChange={e =>
									setFormData(prev => ({ ...prev, sslCertPath: e.target.value }))
								}
							/>
						</div>
					)}
				</form>
			</CardContent>
			<CardFooter>
				<Button
					type="submit"
					onClick={handleSubmit}
					disabled={isConnecting}
					className="w-full"
				>
					{isConnecting ? 'Connecting...' : 'Connect to Database'}
				</Button>
			</CardFooter>
		</Card>
	)
}
