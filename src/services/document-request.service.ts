import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { DocumentRequest, RequestAccessArgs, RequestStatus } from '@/types'

const COL = 'documentRequests'

// ── Submit a new access request for one document ──────────────────
export async function submitDocumentRequest(args: RequestAccessArgs): Promise<void> {
  const existing = await getUserDocRequest(args.uid, args.docId)
  if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
    throw new Error(
      existing.status === 'approved'
        ? 'You already have access to this document.'
        : 'You already have a pending request for this document.',
    )
  }

  await addDoc(collection(db, COL), {
    uid:        args.uid,
    userName:   args.userName,
    userEmail:  args.userEmail,
    docId:      args.docId,
    paymentRef: args.paymentRef,
    status:     'pending' as RequestStatus,
    createdAt:  serverTimestamp(),
  })
}

// ── Get all requests (admin) ──────────────────────────────────────
// orderBy createdAt DESC — requires the single-field index in firestore.indexes.json
export async function getAllDocumentRequests(): Promise<DocumentRequest[]> {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentRequest))
}

// ── Get all requests by a specific user ───────────────────────────
// Uses uid filter only — NO orderBy to avoid requiring a composite index.
// Client-side sort is applied instead so this works without index deployment.
export async function getDocumentRequestsByUser(uid: string): Promise<DocumentRequest[]> {
  const snap = await getDocs(
    query(collection(db, COL), where('uid', '==', uid)),
  )
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentRequest))

  // Sort client-side: newest first
  return docs.sort((a, b) => {
    const aTime = a.createdAt && 'toDate' in a.createdAt ? a.createdAt.toDate().getTime() : 0
    const bTime = b.createdAt && 'toDate' in b.createdAt ? b.createdAt.toDate().getTime() : 0
    return bTime - aTime
  })
}

// ── Get a single user+doc request ────────────────────────────────
// Uses two where clauses — requires composite index (uid ASC + docId ASC).
// If the index isn't deployed yet, falls back to filtering client-side.
export async function getUserDocRequest(
  uid: string,
  docId: string,
): Promise<DocumentRequest | null> {
  try {
    const snap = await getDocs(
      query(collection(db, COL), where('uid', '==', uid), where('docId', '==', docId)),
    )
    if (snap.empty) return null
    const d = snap.docs[0]
    return { id: d.id, ...d.data() } as DocumentRequest
  } catch {
    // Composite index not yet deployed — fall back to fetching all user docs
    // and filtering client-side. Remove this fallback once indexes are deployed.
    const all = await getDocumentRequestsByUser(uid)
    return all.find(r => r.docId === docId) ?? null
  }
}

// ── Update request status (admin) ────────────────────────────────
export async function setRequestStatus(
  requestId: string,
  status: RequestStatus,
): Promise<void> {
  await updateDoc(doc(db, COL, requestId), { status })
}