import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConnectionConfig } from './connection-store'

interface HistoryState {
  connections: ConnectionConfig[]
  addConnection: (connection: ConnectionConfig) => void
  removeConnection: (connection: ConnectionConfig) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      connections: [],
      addConnection: (connection) =>
        set((state) => ({
          connections: [
            connection,
            ...state.connections.filter(
              (c) => 
                c.type !== connection.type || 
                (c.type === 'url' ? c.url !== connection.url : 
                  c.fields?.host !== connection.fields?.host ||
                  c.fields?.database !== connection.fields?.database
                )
            )
          ].slice(0, 5), // Keep only last 5 connections
        })),
      removeConnection: (connection) =>
        set((state) => ({
          connections: state.connections.filter(
            (c) => 
              c.type !== connection.type || 
              (c.type === 'url' ? c.url !== connection.url : 
                c.fields?.host !== connection.fields?.host ||
                c.fields?.database !== connection.fields?.database
              )
          ),
        })),
      clearHistory: () => set({ connections: [] }),
    }),
    {
      name: 'connection-history',
    }
  )
) 