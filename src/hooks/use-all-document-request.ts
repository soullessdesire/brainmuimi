// src/hooks/useAllDocumentRequests.ts
import { useQuery } from '@tanstack/react-query'
import { getAllDocumentRequests } from '../services/document-request.service'
import { queryKeys } from '../types'
import type { DocumentRequest } from '../types'

/**
 * Fetches all document access requests for the admin dashboard.
 * Refetches every 10 s so new requests appear automatically.
 */
export function useAllDocumentRequests() {
  return useQuery<DocumentRequest[]>({
    queryKey:        queryKeys.docRequests,
    queryFn:         getAllDocumentRequests,
    staleTime:       1000 * 10,
    refetchInterval: 1000 * 10,
  })
}