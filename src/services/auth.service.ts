import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { UserProfile, UserRole, SignupArgs, LoginArgs } from '../types'

// ── Read ──────────────────────────────────────────────────────────
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

// ── Signup ────────────────────────────────────────────────────────
export async function signupUser({ name, email, password }: SignupArgs): Promise<void> {
  // 1. Create Firebase Auth account (password is stored by Firebase Auth, NEVER in Firestore)
  const cred = await createUserWithEmailAndPassword(auth, email, password)

  // 2. Set display name on the Auth profile
  await updateProfile(cred.user, { displayName: name })

  // 3. Write ONLY safe fields to Firestore — password is explicitly excluded
  const firestoreProfile = {
    uid:       cred.user.uid,
    name,
    email,
    role:      'user' as UserRole,
    createdAt: serverTimestamp(),
    // password is intentionally NOT here — Firebase Auth owns it
  }
  await setDoc(doc(db, 'users', cred.user.uid), firestoreProfile)

  // 4. Sign out so user must explicitly log in (also avoids onAuthStateChanged
  //    race where the Firestore write hasn't propagated yet)
  await signOut(auth)
}

// ── Login ─────────────────────────────────────────────────────────
// Only authenticates — AuthContext's onAuthStateChanged loads the profile
export async function loginUser({ email, password }: LoginArgs): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password)
}

// ── Logout ────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await signOut(auth)
}