/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from 'react'
import { getDocumentDownloadUrl, recordView } from '@/services/document.service'
import { useSubmitRating, useMyRating }       from '@/hooks'
import { Button }  from '@/components/ui/button'
import { Spinner } from '@/components/spinner'
import { Star, X, Send, ChevronLeft, BookOpen } from 'lucide-react'
import { toast }   from 'sonner'
import type { Document } from '@/types'

// ── Star rating input ─────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
        >
          <Star size={22}
            className={`transition-colors ${n <= (hovered || value)
              ? 'fill-[#4CAF50] text-[#4CAF50]'
              : 'text-white/25 fill-transparent'}`}
          />
        </button>
      ))}
    </div>
  )
}

// ── Rating panel ──────────────────────────────────────────────────
function RatingPanel({ docId, uid, onDone }: { docId: string; uid: string; onDone: () => void }) {
  const { data: existing } = useMyRating(docId, uid)
  const mutation = useSubmitRating(docId)
  const [stars,   setStars]   = useState(existing?.stars   ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    if (existing) { setStars(existing.stars); setComment(existing.comment) }
  }, [existing])

  async function handleSubmit() {
    if (!stars) return
    try {
      await mutation.mutateAsync({ uid, stars, comment })
      setSaved(true)
      toast.success('Thank you! Rating saved.')
      setTimeout(onDone, 1400)
    } catch { toast.error('Could not save rating. Please try again.') }
  }

  if (saved) return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n => (
          <Star key={n} size={18}
            className={n <= stars ? 'fill-[#4CAF50] text-[#4CAF50]' : 'text-white/20 fill-transparent'} />
        ))}
      </div>
      <p className="text-sm text-white font-medium">Rating saved! Thank you.</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-sm font-semibold text-white mb-3">Rate this document</p>
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0 space-y-2">
          <StarInput value={stars} onChange={setStars} />
          <textarea
            rows={2}
            placeholder="Leave a comment (optional)…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full text-sm rounded-lg bg-white/8 border border-white/12 text-white placeholder:text-white/30 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4CAF50] resize-none"
          />
        </div>
        <div className="flex gap-2 shrink-0 pt-1">
          <Button variant="ghost" size="sm" onClick={onDone}
            className="text-white/40 hover:text-white hover:bg-white/10 text-xs">
            Skip
          </Button>
          <Button size="sm" disabled={!stars || mutation.isPending}
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white border-0 text-xs"
            onClick={handleSubmit}>
            {mutation.isPending
              ? <Spinner size={13} className="text-white" />
              : <><Send size={12} /> Submit</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Full-page PDF viewer ──────────────────────────────────────────
interface Props {
  open:    boolean
  onClose: () => void
  doc:     Document
  uid:     string
}

export function PdfViewerDialog({ open, onClose, doc, uid }: Props) {
  const [pdfUrl,      setPdfUrl]      = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [showRating,  setShowRating]  = useState(false)
  const [closePending, setClosePending] = useState(false)

  // Load PDF URL
  useEffect(() => {
    if (!open) {
      setPdfUrl(null); setLoading(true)
      setError(false); setShowRating(false); setClosePending(false)
      return
    }
    let cancelled = false
    setLoading(true); setError(false); setPdfUrl(null)

    getDocumentDownloadUrl(doc.storagePath)
      .then((url : string) => {
        if (!cancelled) { setPdfUrl(url); setLoading(false) }
        void recordView(doc.id, uid)
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [open, doc.storagePath, doc.id, uid])

  // Show rating after 15 s
  useEffect(() => {
    if (!open || !pdfUrl) return
    const t = setTimeout(() => setShowRating(true), 15_000)
    return () => clearTimeout(t)
  }, [open, pdfUrl])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, showRating]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    // Offer rating once before closing (signed-in users only)
    if (uid !== 'anonymous' && !closePending && !showRating && pdfUrl) {
      setShowRating(true)
      setClosePending(true)
      return
    }
    onClose()
  }

  function handleRatingDone() {
    setShowRating(false)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#111] overflow-hidden"
      onContextMenu={e => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-3 sm:px-5 h-12 sm:h-14 bg-[#0a0a0a] border-b border-white/8 shrink-0">
        <button onClick={handleClose}
          className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm font-medium shrink-0">
          <ChevronLeft size={18} />
          <span className="hidden sm:inline text-xs">Back</span>
        </button>

        <div className="flex-1 min-w-0 px-2">
          <p className="text-white text-sm font-semibold truncate leading-tight">{doc.title}</p>
          <p className="text-white/35 text-[10px] uppercase tracking-wide hidden sm:block">
            {doc.category} · {doc.pages} pages
          </p>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-white/30 bg-white/5 rounded-full px-3 py-1 shrink-0">
          <BookOpen size={11} />
          <span>Read only</span>
        </div>

        <button onClick={handleClose}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0">
          <X size={16} />
        </button>
      </div>

      {/* ── Viewer area ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#111]">
            <Spinner size={32} className="text-[#4CAF50]" />
            <p className="text-white/40 text-sm">Loading document…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#111]">
            <BookOpen size={48} className="text-white/10" />
            <p className="text-white/50 text-sm text-center px-8">
              Could not load document.<br />
              <span className="text-xs text-white/30">Check your internet connection.</span>
            </p>
            <button onClick={() => { setError(false); setLoading(true) }}
              className="text-xs text-[#4CAF50] hover:text-[#81C784] transition-colors underline underline-offset-2">
              Try again
            </button>
          </div>
        )}

        {/* PDF iframe — NO sandbox, NO hash params (causes Edge block) */}
        {pdfUrl && (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={doc.title}
            /* 
             * DO NOT add sandbox= here — it blocks Edge/Chrome PDF renderer.
             * DO NOT add #toolbar=0 hash — ignored cross-origin in Chromium.
             * Protection is via: CSS user-select:none, contextmenu disabled,
             * and the transparent overlay below that blocks the toolbar area.
             */
            style={{ display: loading ? 'none' : 'block' }}
            onLoad={() => setLoading(false)}
          />
        )}

        {/*
         * Transparent overlay covering top-right corner where the browser
         * PDF toolbar renders its Download/Print buttons (~56px tall, full width).
         * pointer-events:auto so clicks on that area are absorbed.
         */}
        {pdfUrl && !loading && (
          <div
            className="absolute top-0 inset-x-0 h-14 z-10"
            style={{ pointerEvents: 'auto', background: 'transparent' }}
            title=""
          />
        )}
      </div>

      {/* ── Rating panel ── */}
      {showRating && (
        <div className="shrink-0 bg-[#0a0a0a] border-t border-white/8 px-4 sm:px-8 py-4 z-20">
          {uid !== 'anonymous' ? (
            <RatingPanel docId={doc.id} uid={uid} onDone={handleRatingDone} />
          ) : (
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <p className="text-sm text-white/50">
                <a href="/login" className="text-[#4CAF50] hover:underline font-medium">Sign in</a>{' '}
                to rate this document
              </p>
              <button onClick={handleRatingDone} className="text-white/30 hover:text-white p-1">
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}