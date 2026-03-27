import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRatingsForDoc, getUserRating, submitRating } from '@/services/document.service'
import { queryKeys } from '@/types'
import type { DocumentRating } from '@/types'

export function useDocumentRatings(docId: string) {
  return useQuery<DocumentRating[]>({
    queryKey: queryKeys.ratings(docId),
    queryFn:  () => getRatingsForDoc(docId),
    staleTime: 1000 * 60,
  })
}

export function useMyRating(docId: string, uid: string | undefined) {
  return useQuery<DocumentRating | null>({
    queryKey: queryKeys.myRating(docId, uid ?? ''),
    queryFn:  () => getUserRating(docId, uid!),
    enabled:  !!uid,
  })
}

export function useSubmitRating(docId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uid, stars, comment }: { uid: string; stars: number; comment: string }) =>
      submitRating(docId, uid, stars, comment),
    onSuccess: (_data, { uid }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.ratings(docId) })
      void qc.invalidateQueries({ queryKey: queryKeys.myRating(docId, uid) })
    },
  })
}