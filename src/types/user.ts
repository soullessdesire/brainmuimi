import { Timestamp } from "firebase/firestore"

export type UserStatus    = 'pending' | 'approved' | 'rejected'
export type UserRole      = 'user' | 'admin'
 

export interface UserProfile {
  uid:       string
  name:      string
  email:     string
  role:      UserRole
  createdAt: Timestamp | null
}