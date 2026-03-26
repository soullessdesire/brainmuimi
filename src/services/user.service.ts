import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile } from '../types'

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const q    = query(collection(db, 'users'), where('role', '==', 'user'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as UserProfile)
}