import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setRequestStatus } from '../services/document-request.service'
import { queryKeys } from '../types'
import type { RequestStatus, DocumentRequest } from '../types'

interface UpdateArgs {
  requestId: string
  status:    RequestStatus
}


export function useUpdateRequestStatus() {
  const qc = useQueryClient()

  return useMutation<void, Error, UpdateArgs>({
    mutationFn: ({ requestId, status }) => setRequestStatus(requestId, status),

    onMutate: async ({ requestId, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.docRequests })
      const previous = qc.getQueryData<DocumentRequest[]>(queryKeys.docRequests)

      qc.setQueryData<DocumentRequest[]>(queryKeys.docRequests, old =>
        old?.map(r => r.id === requestId ? { ...r, status } : r) ?? [],
      )

      return { previous }
    },

    onError: (_err, _vars, context) => {
      const ctx = context as { previous?: DocumentRequest[] }
      if (ctx?.previous) qc.setQueryData(queryKeys.docRequests, ctx.previous)
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.docRequests })
    },
  })
}