import React, { useState, type ChangeEvent, type SubmitEvent } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button }                    from '@/components/ui/button'
import { Input }                     from '@/components/ui/input'
import { Alert, AlertDescription }   from '@/components/ui/alert'
import { Badge }                     from '@/components/ui/badge'
import { Separator }                 from '@/components/ui/separator'
import { FormField }                 from '@/components/form-field'
import { Spinner }                   from '@/components/spinner'
import { useRequestDocAccess }       from '@/hooks'
import { getDocumentDownloadUrl }    from '@/services/document.service'
import { formatPrice }               from '@/lib/document'
import { AlertCircle, CreditCard, FileText, Eye, EyeOff } from 'lucide-react'
import { toast }                     from 'sonner'
import type { Document, AuthUser }   from '@/types'

interface Props {
  open:    boolean
  onClose: () => void
  doc:     Document
  user:    AuthUser
}

// ── Preview pane — loads page 1 of the PDF in an iframe ──────────
function DocPreview({ storagePath }: { storagePath: string }) {
  const [url, setUrl]           = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getDocumentDownloadUrl(storagePath)
      .then(u  => { if (!cancelled) { setUrl(u); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [storagePath])

  if (loading) return (
    <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
      <Spinner size={20} className="text-muted-foreground" />
    </div>
  )

  if (error) return (
    <div className="h-64 flex flex-col items-center justify-center bg-muted rounded-lg gap-2">
      <FileText size={28} className="text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground">Preview unavailable</p>
    </div>
  )

  // Append #page=1&toolbar=0&navpanes=0 to show only the first page
  // without the full PDF toolbar — clean teaser experience
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-muted">
      <iframe
        src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
        className="w-full h-64 pointer-events-none"
        title={`Preview of page 1`}
      />
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 border-t border-border">
        <Eye size={12} className="text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          Page 1 preview only — purchase access to download the full document
        </p>
      </div>
    </div>
  )
}

export function RequestAccessDialog({ open, onClose, doc, user }: Props) {
  const [paymentRef, setPaymentRef] = useState('')
  const [phone, setPhone]           = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const mutation = useRequestDocAccess(user.uid)

  function handleClose() {
    setPaymentRef('')
    setPhone('')
    setShowPreview(false)
    mutation.reset()
    onClose()
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!paymentRef.trim()) return
    if (!phone.trim())      return
    try {
      await mutation.mutateAsync({
        uid:        user.uid,
        userName:   user.name,
        userEmail:  user.email,
        docId:      doc.id,
        paymentRef: paymentRef.trim(),
      })
      toast.success('Access request submitted — pending admin review.')
      handleClose()
    } catch {
      // error displayed inline via mutation.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)' }} className="text-xl">
            Request Access
          </DialogTitle>
          <DialogDescription>
            Submit your payment details for admin verification.
          </DialogDescription>
        </DialogHeader>

        {/* Document summary */}
        <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
          <div className="mt-0.5 p-2 rounded-md bg-background border border-border">
            <FileText size={16} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{doc.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{doc.pages} pages · {doc.size}</p>
          </div>
          <Badge variant="outline" className="text-accent border-accent/40 shrink-0 text-sm font-bold">
            {formatPrice(doc.price)}
          </Badge>
        </div>

        {/* Page 1 preview toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {showPreview
              ? <><EyeOff size={13} /> Hide preview</>
              : <><Eye size={13} /> Preview page 1</>}
          </button>
          {showPreview && (
            <div className="mt-3">
              <DocPreview storagePath={doc.storagePath} />
            </div>
          )}
        </div>

        <Separator />

        {/* Payment instructions */}
        <div className="flex gap-3 rounded-lg border border-accent/25 bg-accent/5 p-4">
          <CreditCard className="text-accent shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-xs font-bold text-accent mb-1">Payment instructions</p>
            <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
              <li>1. Send <strong className="text-foreground">{formatPrice(doc.price)}</strong> via M-Pesa or bank transfer.</li>
              <li>2. Copy your <strong className="text-foreground">transaction / reference ID</strong>.</li>
              <li>3. Fill in the form below — admin will verify and approve access.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="M-Pesa / Phone number used for payment" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 0712 345 678"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </FormField>

          <FormField label="Transaction / Reference ID" htmlFor="paymentRef">
            <Input
              id="paymentRef"
              type="text"
              placeholder="e.g. QJA1B2C3D4"
              value={paymentRef}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentRef(e.target.value)}
              required
            />
          </FormField>

          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{(mutation.error as Error).message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={mutation.isPending || !paymentRef.trim() || !phone.trim()}
            >
              {mutation.isPending
                ? <><Spinner size={14} className="text-accent-foreground" /> Submitting…</>
                : 'Submit request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}