'use client'

import { useState, useEffect } from 'react';
import type { TableName } from '@/lib/services/database';

interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FetchResult<T> {
  data: T[];
  pagination: PaginationResult;
}

export function useTableData<T>({
  tableName,
  page = 1,
  limit = 10,
  orderBy,
  orderDirection = 'asc',
  filters = {},
}: {
  tableName: TableName;
} & PaginationParams) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationResult>({
    page,
    limit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          table: tableName,
          page: page.toString(),
          limit: limit.toString(),
          ...(orderBy && { orderBy }),
          ...(orderDirection && { orderDirection }),
          ...(Object.keys(filters).length > 0 && {
            filters: JSON.stringify(filters),
          }),
        });

        const response = await fetch(`/api/data?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result: FetchResult<T> = await response.json();
        setData(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tableName, page, limit, orderBy, orderDirection, filters]);

  return { data, pagination, loading, error };
} 