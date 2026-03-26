import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import type { Document, UploadDocumentArgs } from '../types'

const COL = 'documents'

// ── Fetch all documents (catalogue) ──────────────────────────────
export async function getAllDocuments(): Promise<Document[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Document))
}

// ── Fetch single document ─────────────────────────────────────────
export async function getDocumentById(id: string): Promise<Document | null> {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Document) : null
}

// ── Get a temporary signed download URL (for approved users) ──────
export async function getDocumentDownloadUrl(storagePath: string): Promise<string> {
  const fileRef = ref(storage, storagePath)
  return getDownloadURL(fileRef)
}

// ── Upload a PDF + write Firestore metadata (admin only) ──────────
// Returns an UploadTask so the UI can track progress,
// and a promise that resolves with the new document id once complete.
export function uploadDocument(args: UploadDocumentArgs): {
  task:     UploadTask
  promise:  Promise<string>
} {
  const ext       = args.file.name.split('.').pop() ?? 'pdf'
  const timestamp = Date.now()
  const safeName  = args.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
  const storagePath = `documents/${safeName}_${timestamp}.${ext}`
  const fileRef   = ref(storage, storagePath)

  const task = uploadBytesResumable(fileRef, args.file, {
    contentType: args.file.type || 'application/pdf',
  })

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      null, // progress handled by caller via task
      reject,
      async () => {
        try {
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
            createdAt:   serverTimestamp(),
          })

          resolve(docRef.id)
        } catch (err) {
          reject(err)
        }
      },
    )
  })

  return { task, promise }
}

// ── Delete a document + its Storage file (admin only) ─────────────
export async function deleteDocument(docId: string, storagePath: string): Promise<void> {
  await deleteDoc(doc(db, COL, docId))
  try {
    await deleteObject(ref(storage, storagePath))
  } catch {
    // Storage file missing is not fatal — Firestore doc is already gone
  }
}