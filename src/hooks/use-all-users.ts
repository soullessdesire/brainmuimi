import { useQuery } from '@tanstack/react-query'
import { getAllUsers } from '../services/user.service'
import { queryKeys } from '../types'
import type { UserProfile } from '../types'

/**
 * Fetches all non-admin users for the admin dashboard.
 * Refetches every 10 s so new sign-ups appear automatically.
 */
export function useAllUsers() {
  return useQuery<UserProfile[]>({
    queryKey:        queryKeys.users,
    queryFn:         getAllUsers,
    staleTime:       1000 * 10,
    refetchInterval: 1000 * 10,
  })
}