/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useQueryClient } from '@tanstack/react-query'
import { auth } from '../lib/firebase'
import { fetchUserProfile, logoutUser } from '../services/auth.service'
import { queryKeys } from '../types'
import type { AuthUser, AuthContextValue } from '../types'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const qc                    = useQueryClient()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        // Prime the TanStack Query cache + set local state
        const profile = await fetchUserProfile(firebaseUser.uid)
        if (profile) {
          qc.setQueryData(queryKeys.currentUser(firebaseUser.uid), profile)
          setUser({ ...profile, uid: firebaseUser.uid, email: firebaseUser.email ?? profile.email })
        } else {
          await logoutUser()
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [qc])

  const logout = useCallback(async () => {
    await logoutUser()
    qc.clear()
    setUser(null)
  }, [qc])

  // Re-fetch profile from Firestore and sync into state + cache
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return
    const profile = await fetchUserProfile(auth.currentUser.uid)
    if (profile) {
      qc.setQueryData(queryKeys.currentUser(auth.currentUser.uid), profile)
      setUser(prev => prev ? { ...prev, ...profile } : null)
    }
  }, [qc])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}