import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button }          from '@/components/ui/button'
import { Spinner }         from '@/components/spinner'
import { getDocumentDownloadUrl, recordView } from '@/services/document.service'
import { useSubmitRating, useMyRating }       from '@/hooks'
import { Star, X, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { Document } from '@/types'

// ── Star rating input ─────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={`transition-colors ${
              n <= (hovered || value)
                ? 'fill-[#4CAF50] text-[#4CAF50]'
                : 'text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ── Rating panel shown after user has been viewing ───────────────
function RatingPanel({
  docId, uid, onClose,
}: {
  docId:   string
  uid:     string
  onClose: () => void
}) {
  const { data: existing } = useMyRating(docId, uid)
  const mutation = useSubmitRating(docId)
  const [stars, setStars]     = useState(existing?.stars ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (existing) { setStars(existing.stars); setComment(existing.comment) }
  }, [existing])

  async function handleSubmit() {
    if (!stars) return
    try {
      await mutation.mutateAsync({ uid, stars, comment })
      setSubmitted(true)
      toast.success('Thank you for your rating!')
      setTimeout(onClose, 1500)
    } catch {
      toast.error('Could not save rating. Please try again.')
    }
  }

  if (submitted) return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <Star key={n} size={20} className={n <= stars ? 'fill-[#4CAF50] text-[#4CAF50]' : 'text-muted-foreground/30'} />
        ))}
      </div>
      <p className="text-sm font-medium text-foreground">Rating saved!</p>
    </div>
  )

  return (
    <div className="border-t border-border pt-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Rate this document</p>
      <StarInput value={stars} onChange={setStars} />
      <textarea
        rows={2}
        placeholder="Leave a comment (optional)…"
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Skip</Button>
        <Button
          size="sm" variant="ghost"
          disabled={!stars || mutation.isPending}
          onClick={handleSubmit}
        >
          {mutation.isPending
            ? <><Spinner size={13} className="text-accent-foreground" /> Saving…</>
            : <><Send size={13} /> Submit rating</>}
        </Button>
      </div>
    </div>
  )
}

// ── Main viewer dialog ────────────────────────────────────────────
interface Props {
  open:    boolean
  onClose: () => void
  doc:     Document
  uid:     string   // 'anonymous' if not signed in
}

export function PdfViewerDialog({ open, onClose, doc, uid }: Props) {
  const [pdfUrl, setPdfUrl]       = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [showRating, setShowRating] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true); setError(false); setPdfUrl(null)

    getDocumentDownloadUrl(doc.storagePath)
      .then(url => {
        if (!cancelled) { setPdfUrl(url); setLoading(false) }
        // Record view (fire-and-forget)
        void recordView(doc.id, uid)
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [open, doc.storagePath, doc.id, uid])

  // Show rating prompt after 10 s of viewing
  useEffect(() => {
    if (!open || !pdfUrl) return
    const timer = setTimeout(() => setShowRating(true), 10_000)
    return () => clearTimeout(timer)
  }, [open, pdfUrl])

  function handleClose() {
    setShowRating(true) // always offer rating on close
    // small delay so rating shows before dialog animates out
    setTimeout(() => {
      if (!showRating) onClose()
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent
        className="max-w-4xl w-full h-[92vh] flex flex-col p-0 gap-0 overflow-hidden"
        // Prevent context menu (right-click) on the viewer area
        onContextMenu={e => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <DialogTitle
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-base font-semibold truncate max-w-[80%]"
          >
            {doc.title}
          </DialogTitle>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        {/* PDF Viewer */}
        <div className="flex-1 relative overflow-hidden bg-muted select-none">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size={28} className="text-accent" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <p className="text-sm">Could not load document. Please try again.</p>
              <Button variant="outline" size="sm" onClick={() => { setError(false); setLoading(true) }}>
                Retry
              </Button>
            </div>
          )}
          {pdfUrl && (
            /*
             * toolbar=0  — hides the browser PDF toolbar (download/print buttons)
             * view=FitH  — fits to width
             * We also wrap in a div with pointer-events manipulation to
             * prevent text selection via CSS user-select.
             */
            <iframe
              key={pdfUrl}
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={doc.title}
              // Disable download via sandbox (allow-scripts needed for PDF.js)
              sandbox="allow-scripts allow-same-origin"
              style={{ userSelect: 'none', pointerEvents: loading ? 'none' : 'auto' }}
            />
          )}
          {/* Transparent overlay to catch right-click / drag */}
          <div
            className="absolute inset-0 pointer-events-none select-none"
            style={{ userSelect: 'none' }}
            aria-hidden
          />
        </div>

        {/* Rating footer */}
        {showRating && uid !== 'anonymous' && (
          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 block">
            <RatingPanel docId={doc.id} uid={uid} onClose={onClose} />
          </DialogFooter>
        )}
        {showRating && uid === 'anonymous' && (
          <DialogFooter className="px-5 py-3 border-t border-border shrink-0">
            <p className="text-xs text-muted-foreground w-full text-center">
              <a href="/login" className="text-accent hover:underline">Sign in</a> to rate this document.
            </p>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}