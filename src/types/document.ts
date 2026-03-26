import { Timestamp } from "firebase/firestore"
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface DocumentRequest {
  id:         string
  uid:        string
  userName:   string
  userEmail:  string
  docId:      string
  paymentRef: string
  status:     RequestStatus
  createdAt:  Timestamp | null
}
 
// ── Static document catalogue (no Firestore needed) ───────────────
export interface Document {
  id:          string
  title:       string
  description: string
  category:    string
  preview:     string
  price:       number
  pages:       number
  size:        string
  storagePath: string
  createdAt:   Timestamp | null
}

export interface UploadDocumentArgs {
  file:        File
  title:       string
  description: string
  category:    string
  preview:     string
  price:       number
  pages:       number
}