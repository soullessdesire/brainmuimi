import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '../services/user.service'
import { queryKeys } from '../types'
import type { UserProfile } from '../types'

/**
 * Fetches and caches the Firestore profile for a given uid.
 * Refetches every 20 s to surface admin status changes on the pdf page.
 */
export function useUserProfile(uid: string | undefined) {
  return useQuery<UserProfile | null>({
    queryKey:  queryKeys.currentUser(uid ?? ''),
    queryFn:   () => getUserProfile(uid!),
    enabled:   !!uid,
    staleTime: 1000 * 20,
  })
}