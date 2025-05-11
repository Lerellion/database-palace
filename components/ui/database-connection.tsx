'use client'

import { useState } from 'react'

import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'
import { Switch } from './switch'
import { toast } from './use-toast'

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

			toast({
				title: 'Connection successful',
				description: 'Successfully connected to the database'
			})

			// Optionally store the connection in localStorage or state management
			localStorage.setItem(
				'dbConnection',
				JSON.stringify({
					...formData,
					timestamp: new Date().toISOString()
				})
			)
		} catch (error) {
			toast({
				title: 'Connection failed',
				description:
					error instanceof Error ? error.message : 'Failed to connect to database',
				variant: 'destructive'
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
