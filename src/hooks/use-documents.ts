import { useQuery } from '@tanstack/react-query'
import { getAllDocuments } from '../services/document.service'
import { queryKeys } from '../types'
import type { Document } from '../types'

/**
 * Fetches the live document catalogue from Firestore.
 * Used by both the user dashboard and the admin page.
 */
export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: queryKeys.documents,
    queryFn:  getAllDocuments,
    staleTime: 1000 * 60, // catalogue changes infrequently
  })
}