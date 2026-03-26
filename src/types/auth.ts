import type { UserProfile } from "./user"

export type AuthUser = UserProfile
 
export interface AuthContextValue {
  user:        AuthUser | null
  loading:     boolean
  logout:      () => Promise<void>
  refreshUser: () => Promise<void>
}
export interface SignupArgs {
  name:     string
  email:    string
  password: string
}
 
export interface LoginArgs {
  email:    string
  password: string
}
 
export interface RequestAccessArgs {
  uid:        string
  userName:   string
  userEmail:  string
  docId:      string
  paymentRef: string
}