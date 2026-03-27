import React, { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button }                  from '@/components/ui/button'
import { Input }                   from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField }               from '@/components/form-field'
import { Spinner }                 from '@/components/spinner'
import { uploadDocument }          from '@/services/document.service'
import { queryKeys }               from '@/types'
import { toast }                   from 'sonner'
import { AlertCircle, UploadCloud, FileText, ImageIcon, X } from 'lucide-react'

interface Props { open: boolean; onClose: () => void }

interface UploadForm {
  title: string; description: string; category: string
  preview: string; price: string; pages: string
}
const INITIAL: UploadForm = { title: '', description: '', category: '', preview: '', price: '0', pages: '' }
const CATEGORIES = ['Business','Finance','Marketing','Leadership','Technology','Legal','Fiction','Non-Fiction','Academic','Other']

const selectCls = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
const textareaCls = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export function UploadDocumentDialog({ open, onClose }: Props) {
  const qc           = useQueryClient()
  const pdfRef       = useRef<HTMLInputElement>(null)
  const coverRef     = useRef<HTMLInputElement>(null)
  const [form, setForm]     = useState<UploadForm>(INITIAL)
  const [pdfFile, setPdfFile]     = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [progress, setProgress]   = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')

  const set = (k: keyof UploadForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError(''); setForm(prev => ({ ...prev, [k]: e.target.value }))
  }

  function handlePdfChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return }
    if (f.size > 50 * 1024 * 1024)    { setError('PDF must be under 50 MB.'); return }
    setError(''); setPdfFile(f)
  }

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Cover must be an image file.'); return }
    if (f.size > 5 * 1024 * 1024)     { setError('Cover image must be under 5 MB.'); return }
    setError(''); setCoverFile(f)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  function handleClose() {
    if (uploading) return
    setForm(INITIAL); setPdfFile(null); setCoverFile(null)
    setCoverPreview(null); setProgress(0); setError(''); onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!pdfFile)           return setError('Please select a PDF file.')
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.category)     return setError('Category is required.')
    if (!form.pages || isNaN(Number(form.pages)) || Number(form.pages) <= 0)
                            return setError('Enter a valid page count.')

    setUploading(true); setProgress(0); setError('')
    try {
      const { task, promise } = uploadDocument({
        file: pdfFile, coverFile: coverFile ?? undefined,
        title: form.title.trim(), description: form.description.trim(),
        category: form.category, preview: form.preview.trim(),
        price: Number(form.price) || 0, pages: Number(form.pages),
      })
      task.on('state_changed', (snap: { bytesTransferred: number; totalBytes: number }) => {
        setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
      })
      await promise
      await qc.invalidateQueries({ queryKey: queryKeys.documents })
      toast.success('Document uploaded successfully.')
      handleClose()
    } catch (err) {
      setError((err as Error).message ?? 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)' }} className="text-xl">
            Upload Document
          </DialogTitle>
          <DialogDescription>Upload a PDF with a cover image and details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* ── Cover image + PDF side by side ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Cover image drop zone */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Cover Image</p>
              <div
                onClick={() => coverRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden aspect-[3/4] flex items-center justify-center
                  ${coverPreview ? 'border-accent/40' : 'border-border hover:border-accent/40 hover:bg-muted/50'}`}
              >
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null) }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                    <ImageIcon size={24} className="text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground">Click to add cover</p>
                    <p className="text-[9px] text-muted-foreground/60">JPG, PNG (max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* PDF drop zone */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">PDF File <span className="text-destructive">*</span></p>
              <div
                onClick={() => pdfRef.current?.click()}
                className={`border-2 border-dashed rounded-lg cursor-pointer transition-colors aspect-[3/4] flex items-center justify-center
                  ${pdfFile ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-accent/40 hover:bg-muted/50'}`}
              >
                <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
                {pdfFile ? (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <FileText size={28} className="text-accent" />
                    <p className="text-xs font-medium text-foreground line-clamp-2">{pdfFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(pdfFile.size / 1_000_000).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                    <UploadCloud size={24} className="text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground">Click to select PDF</p>
                    <p className="text-[9px] text-muted-foreground/60">Max 50 MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-accent h-full rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Title */}
          <FormField label="Title" htmlFor="title">
            <Input id="title" placeholder="e.g. Business Strategy Guide" value={form.title} onChange={set('title')} required />
          </FormField>

          {/* Category / Pages (price hidden from users but kept for admin) */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" htmlFor="category">
              <select id="category" value={form.category} onChange={set('category')} className={selectCls}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Pages" htmlFor="pages">
              <Input id="pages" type="number" min="1" placeholder="120" value={form.pages} onChange={set('pages')} required />
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description" htmlFor="description">
            <textarea id="description" rows={2} placeholder="Brief description…"
              value={form.description} onChange={set('description')} className={textareaCls} />
          </FormField>

          {/* Preview excerpt */}
          <FormField label="Preview excerpt — shown on card" htmlFor="preview">
            <textarea id="preview" rows={2} placeholder="A short teaser from the document…"
              value={form.preview} onChange={set('preview')} className={textareaCls} />
          </FormField>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>Cancel</Button>
            <Button type="submit" variant="outline" disabled={uploading}>
              {uploading
                ? <><Spinner size={14} className="text-accent-foreground" /> Uploading {progress}%…</>
                : <><UploadCloud size={14} /> Upload document</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}