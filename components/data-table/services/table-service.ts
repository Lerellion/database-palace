'use client'

import { TableRecord, UpdatePayload } from '../types'

interface ApiError {
  message: string
  code?: string
  details?: unknown
}

export class TableService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    
    if (!response.ok) {
      if (isJson) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.message || `Operation failed: ${response.statusText}`)
      }
      throw new Error(`Operation failed: ${response.statusText}`)
    }

    if (isJson) {
      return response.json()
    }

    return response.text() as Promise<T>
  }

  private static wrapPromise<T>(promise: Promise<T>): Promise<T> {
    let status: 'pending' | 'success' | 'error' = 'pending'
    let result: T
    let error: Error | null = null
    let suspender: Promise<void>

    suspender = promise.then(
      (r: T) => {
        status = 'success'
        result = r
      },
      (e: Error) => {
        status = 'error'
        error = e
      }
    )

    return new Promise((resolve, reject) => {
      suspender.then(() => {
        if (status === 'success') {
          resolve(result)
        } else if (status === 'error' && error) {
          reject(error)
        }
      })
    })
  }

  static async updateRecord(
    tableName: string,
    payload: UpdatePayload,
    suspense = false
  ): Promise<void> {
    try {
      const promise = fetch(
        `/api/data?table=${encodeURIComponent(tableName)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      ).then(response => this.handleResponse<void>(response))

      return suspense ? this.wrapPromise(promise) : promise
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update record')
    }
  }

  static async createRecord(
    tableName: string,
    data: Partial<TableRecord>,
    suspense = false
  ): Promise<void> {
    try {
      const promise = fetch(
        `/api/data?table=${encodeURIComponent(tableName)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        }
      ).then(response => this.handleResponse<void>(response))

      return suspense ? this.wrapPromise(promise) : promise
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create record')
    }
  }

  static async deleteRecord(
    tableName: string,
    id: string | number,
    suspense = false
  ): Promise<void> {
    try {
      const promise = fetch(
        `/api/data?table=${encodeURIComponent(tableName)}&id=${encodeURIComponent(String(id))}`,
        {
          method: 'DELETE',
        }
      ).then(response => this.handleResponse<void>(response))

      return suspense ? this.wrapPromise(promise) : promise
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete record')
    }
  }

  static async getTableData(
    tableName: string,
    suspense = false
  ): Promise<{ columns: any[]; rows: any[] }> {
    try {
      const promise = fetch(
        `/api/data?table=${encodeURIComponent(tableName)}`
      ).then(response => this.handleResponse<{ columns: any[]; rows: any[] }>(response))

      return suspense ? this.wrapPromise(promise) : promise
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch table data')
    }
  }
} 