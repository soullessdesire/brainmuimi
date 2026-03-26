// src/hooks/useMyDocumentRequests.ts
import { useQuery } from '@tanstack/react-query'
import { getDocumentRequestsByUser } from '../services/document-request.service'
import { queryKeys } from '../types'
import type { DocumentRequest } from '../types'

/**
 * Returns all document access requests for the currently logged-in user.
 * Refetches every 15 s so approval changes surface quickly.
 */
export function useMyDocumentRequests(uid: string | undefined) {
  return useQuery<DocumentRequest[]>({
    queryKey:        queryKeys.docRequestsByUser(uid ?? ''),
    queryFn:         () => getDocumentRequestsByUser(uid!),
    enabled:         !!uid,
    staleTime:       1000 * 15,
    refetchInterval: 1000 * 15,
  })
}