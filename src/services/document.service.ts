import {
  collection, addDoc, getDocs, getDoc,
  doc, deleteDoc, updateDoc, setDoc,
  serverTimestamp, orderBy, query,
  increment, where,
} from 'firebase/firestore'
import {
  ref, uploadBytesResumable, getDownloadURL,
  deleteObject, type UploadTask,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Document, DocumentRating, UploadDocumentArgs } from '@/types'

const COL         = 'documents'
const VIEWS_COL   = 'documentViews'
const RATINGS_COL = 'documentRatings'

// ── Fetch all documents ───────────────────────────────────────────
export async function getAllDocuments(): Promise<Document[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Document))
}

// ── Fetch single document ─────────────────────────────────────────
export async function getDocumentById(id: string): Promise<Document | null> {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Document) : null
}

// ── Get download URL from Storage ────────────────────────────────
export async function getDocumentDownloadUrl(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath))
}

// ── Record a view (idempotent per user per doc) ───────────────────
// Also increments the viewCount on the document itself
export async function recordView(docId: string, uid: string): Promise<void> {
  const viewId  = `${docId}_${uid}`
  const viewRef = doc(db, VIEWS_COL, viewId)
  const existing = await getDoc(viewRef)

  // Write view record if first time
  if (!existing.exists()) {
    await setDoc(viewRef, {
      docId, uid, viewedAt: serverTimestamp(),
    })
    // Increment counter on the document
    await updateDoc(doc(db, COL, docId), { viewCount: increment(1) })
  }
}

// ── Get total unique viewers per document (admin) ─────────────────
export async function getViewCountsForAllDocs(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, VIEWS_COL))
  const counts: Record<string, number> = {}
  snap.docs.forEach(d => {
    const { docId } = d.data() as { docId: string }
    counts[docId] = (counts[docId] ?? 0) + 1
  })
  return counts
}

// ── Ratings ───────────────────────────────────────────────────────
export async function getRatingsForDoc(docId: string): Promise<DocumentRating[]> {
  const snap = await getDocs(
    query(collection(db, RATINGS_COL), where('docId', '==', docId))
  )
  return snap.docs.map(d => d.data() as DocumentRating)
}

export async function getUserRating(docId: string, uid: string): Promise<DocumentRating | null> {
  const ratingId = `${docId}_${uid}`
  const snap     = await getDoc(doc(db, RATINGS_COL, ratingId))
  return snap.exists() ? (snap.data() as DocumentRating) : null
}

export async function submitRating(
  docId: string, uid: string, stars: number, comment: string
): Promise<void> {
  const ratingId = `${docId}_${uid}`
  await setDoc(doc(db, RATINGS_COL, ratingId), {
    docId, uid, stars, comment,
    ratedAt: serverTimestamp(),
  })
}

// ── Upload PDF + optional cover image ────────────────────────────
export function uploadDocument(args: UploadDocumentArgs): {
  task:    UploadTask
  promise: Promise<string>
} {
  const timestamp   = Date.now()
  const safeName    = args.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
  const ext         = args.file.name.split('.').pop() ?? 'pdf'
  const storagePath = `documents/${safeName}_${timestamp}.${ext}`
  const fileRef     = ref(storage, storagePath)

  const task = uploadBytesResumable(fileRef, args.file, {
    contentType: args.file.type || 'application/pdf',
  })

  const promise = new Promise<string>((resolve, reject) => {
    task.on('state_changed', null, reject, async () => {
      try {
        let coverPath = ''

        // Upload cover image if provided
        if (args.coverFile) {
          const coverExt  = args.coverFile.name.split('.').pop() ?? 'jpg'
          coverPath       = `covers/${safeName}_${timestamp}.${coverExt}`
          const coverRef  = ref(storage, coverPath)
          await new Promise<void>((res, rej) => {
            const ct = uploadBytesResumable(coverRef, args.coverFile!, {
              contentType: args.coverFile!.type || 'image/jpeg',
            })
            ct.on('state_changed', null, rej, () => res())
          })
        }

        const sizeLabel = args.file.size > 1_000_000
          ? `${(args.file.size / 1_000_000).toFixed(1)} MB`
          : `${(args.file.size / 1_000).toFixed(0)} KB`

        const docRef = await addDoc(collection(db, COL), {
          title:       args.title,
          description: args.description,
          category:    args.category,
          preview:     args.preview,
          price:       args.price,
          pages:       args.pages,
          size:        sizeLabel,
          storagePath,
          coverPath,
          viewCount:   0,
          createdAt:   serverTimestamp(),
        })
        resolve(docRef.id)
      } catch (err) { reject(err) }
    })
  })

  return { task, promise }
}

// ── Delete document + Storage files ──────────────────────────────
export async function deleteDocument(docId: string, storagePath: string, coverPath?: string): Promise<void> {
  await deleteDoc(doc(db, COL, docId))
  try { await deleteObject(ref(storage, storagePath)) } catch { /* empty */ }
  if (coverPath) {
    try { await deleteObject(ref(storage, coverPath)) } catch { /* empty */ }
  }
}