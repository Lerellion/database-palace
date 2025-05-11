import { create } from 'zustand'

export type ConnectionType = 'url' | 'fields'

export type ConnectionConfig = {
	type: ConnectionType
	url?: string
	fields?: {
		host: string
		port: string
		database: string
		schema: string
		username: string
		password: string
	}
	name: string
}

type ConnectionState = {
	activeConnection: ConnectionConfig | null
	isConnected: boolean
	tables: string[]
	setActiveConnection: (connection: ConnectionConfig) => void
	setConnectionStatus: (status: boolean) => void
	setTables: (tables: string[]) => void
	disconnect: () => void
}

export const useConnectionStore = create<ConnectionState>(set => ({
	activeConnection: null,
	isConnected: false,
	tables: [],
	setActiveConnection: connection => set({ activeConnection: connection }),
	setConnectionStatus: status => set({ isConnected: status }),
	setTables: tables => set({ tables }),
	disconnect: () => set({ activeConnection: null, isConnected: false, tables: [] })
}))
