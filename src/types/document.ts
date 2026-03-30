import { Timestamp } from "firebase/firestore"
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface DocumentRequest {
  phone: string
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
  id:           string
  title:        string
  description:  string
  category:     string
  preview:      string
  price:        number        // kept for admin reference, not shown to users
  pages:        number
  size:         string
  storagePath:  string        // path to PDF in Firebase Storage
  coverPath:    string        // path to cover image in Firebase Storage (optional)
  coverUrl?:    string        // resolved download URL (populated client-side)
  viewCount:    number        // total views across all users
  createdAt:    Timestamp | null
}
export interface UploadDocumentArgs {
  file:        File
  coverFile?:  File           // optional cover image
  title:       string
  description: string
  category:    string
  preview:     string
  price:       number
  pages:       number
}

export interface DocumentRating {
  docId:    string
  uid:      string
  stars:    number            // 1–5
  comment:  string
  ratedAt:  Timestamp | null
}

export interface DocumentView {
  docId:     string
  uid:       string           // 'anonymous' for non-logged-in users
  viewedAt:  Timestamp | null
}