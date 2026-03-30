import React, { useState, type ChangeEvent, type FormEvent } from 'react'
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
import { SELLER }                    from '@/lib/seller'
import { AlertCircle, FileText, Eye, EyeOff, Phone, Copy, CheckCheck } from 'lucide-react'
import { toast }                     from 'sonner'
import type { Document, AuthUser }   from '@/types'

interface Props {
  open:    boolean
  onClose: () => void
  doc:     Document
  user:    AuthUser
}

// ── Page 1 preview ────────────────────────────────────────────────
function DocPreview({ storagePath }: { storagePath: string }) {
  const [url, setUrl]         = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true); setError(false)
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
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-muted">
      <iframe
        src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
        className="w-full h-64 pointer-events-none"
        title="Page 1 preview"
      />
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 border-t border-border">
        <Eye size={12} className="text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          Page 1 preview — purchase access to download the full document
        </p>
      </div>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button" onClick={copy}
      className="ml-1 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Copy number"
    >
      {copied ? <CheckCheck size={13} className="text-accent" /> : <Copy size={13} />}
    </button>
  )
}

export function RequestAccessDialog({ open, onClose, doc, user }: Props) {
  const [paymentRef, setPaymentRef] = useState('')
  const [phone, setPhone]           = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const mutation = useRequestDocAccess(user.uid)

  function handleClose() {
    setPaymentRef(''); setPhone(''); setShowPreview(false)
    mutation.reset(); onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!paymentRef.trim() || !phone.trim()) return
    try {
      await mutation.mutateAsync({
        uid: user.uid, userName: user.name, userEmail: user.email,
        docId: doc.id, paymentRef: paymentRef.trim(), phone: phone.trim(),
      })
      toast.success('Access request submitted — pending admin review.')
      handleClose()
    } catch { /* error shown inline */ }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)' }} className="text-xl">
            Request Access
          </DialogTitle>
          <DialogDescription>
            Send payment then submit your details for admin verification.
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

        {/* Preview toggle */}
        <div>
          <button
            type="button" onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {showPreview ? <><EyeOff size={13} /> Hide preview</> : <><Eye size={13} /> Preview page 1</>}
          </button>
          {showPreview && <div className="mt-3"><DocPreview storagePath={doc.storagePath} /></div>}
        </div>

        <Separator />

        {/* ── Payment instructions with seller phone ── */}
        <div className="rounded-lg border border-accent/25 bg-accent/5 p-4 space-y-3">
          <p className="text-xs font-bold text-accent">Payment instructions</p>

          {/* Seller M-Pesa number — prominent */}
          <div className="flex items-center gap-3 bg-background rounded-md border border-border px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Phone size={15} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                Send M-Pesa to
              </p>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold text-foreground tracking-wider">{SELLER.mpesa}</p>
                <CopyButton text={SELLER.mpesa} />
              </div>
              <p className="text-[10px] text-muted-foreground">{SELLER.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount</p>
              <p className="text-base font-bold text-accent">{formatPrice(doc.price)}</p>
            </div>
          </div>

          {SELLER.paybill && (
            <p className="text-xs text-muted-foreground">
              Paybill: <strong className="text-foreground">{SELLER.paybill}</strong>
            </p>
          )}

          <ol className="text-xs text-muted-foreground space-y-1 leading-relaxed list-decimal list-inside">
            <li>Send <strong className="text-foreground">{formatPrice(doc.price)}</strong> to the M-Pesa number above.</li>
            <li>Copy the <strong className="text-foreground">M-Pesa transaction code</strong> you receive via SMS.</li>
            <li>Fill in your phone number and transaction code below, then submit.</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Your M-Pesa phone number" htmlFor="phone">
            <Input
              id="phone" type="tel" required autoFocus
              placeholder="e.g. 0712 345 678"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            />
          </FormField>

          <FormField label="M-Pesa transaction code" htmlFor="paymentRef">
            <Input
              id="paymentRef" type="text" required
              placeholder="e.g. QJA1B2C3D4"
              value={paymentRef}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentRef(e.target.value)}
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
            <Button type="submit" variant="accent"
              disabled={mutation.isPending || !paymentRef.trim() || !phone.trim()}>
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