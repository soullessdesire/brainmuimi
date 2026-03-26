// src/hooks/useRequestDocAccess.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitDocumentRequest } from '../services/document-request.service'
import { queryKeys } from '../types'
import type { RequestAccessArgs } from '../types'

/**
 * Submits a payment-reference-backed access request for a single document.
 * Invalidates the user's request list so the UI updates immediately.
 */
export function useRequestDocAccess(uid: string | undefined) {
  const qc = useQueryClient()

  return useMutation<void, Error, RequestAccessArgs>({
    mutationFn: submitDocumentRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.docRequestsByUser(uid ?? '') })
    },
  })
}