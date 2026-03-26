import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from './ui/dialog'
import { Button }                  from './ui/button'
import { Input }                   from './ui/input'
import { Alert, AlertDescription } from './ui/alert'
import { FormField }               from './form-field'
import { Spinner }                 from './spinner'
import { uploadDocument }          from '../services/document.service'
import { queryKeys }               from '../types'
import { toast }                   from 'sonner'
import { AlertCircle, UploadCloud, FileText, X } from 'lucide-react'

interface Props {
  open:    boolean
  onClose: () => void
}

interface UploadForm {
  title:       string
  description: string
  category:    string
  preview:     string
  price:       string
  pages:       string
}

const INITIAL: UploadForm = {
  title: '', description: '', category: '', preview: '', price: '', pages: '',
}

const CATEGORIES = [
  'Business', 'Finance', 'Marketing',
  'Leadership', 'Technology', 'Legal', 'Other',
]

// Shared className that matches shadcn Input exactly
const selectCls =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ' +
  'shadow-sm transition-colors text-foreground ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const textareaCls =
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ' +
  'shadow-sm placeholder:text-muted-foreground resize-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

export function UploadDocumentDialog({ open, onClose }: Props) {
  const qc               = useQueryClient()
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const [form, setForm]  = useState<UploadForm>(INITIAL)
  const [file, setFile]  = useState<File | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const set =
    (key: keyof UploadForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setError('')
      setForm(prev => ({ ...prev, [key]: e.target.value }))
    }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return }
    if (f.size > 50 * 1024 * 1024)    { setError('File must be under 50 MB.'); return }
    setError('')
    setFile(f)
  }

  function handleClose() {
    if (uploading) return
    setForm(INITIAL)
    setFile(null)
    setProgress(0)
    setError('')
    onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file)                                                        return setError('Please select a PDF file.')
    if (!form.title.trim())                                           return setError('Title is required.')
    if (!form.category)                                               return setError('Category is required.')
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) return setError('Enter a valid price.')
    if (!form.pages || isNaN(Number(form.pages)) || Number(form.pages) <= 0) return setError('Enter a valid page count.')

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      const { task, promise } = uploadDocument({
        file,
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        preview:     form.preview.trim(),
        price:       Number(form.price),
        pages:       Number(form.pages),
      })

      task.on('state_changed', (snapshot: { bytesTransferred: number; totalBytes: number }) => {
        setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
      })

      await promise
      await qc.invalidateQueries({ queryKey: queryKeys.documents })
      toast.success('Document uploaded successfully.')
      handleClose()
    } catch (err) {
      setError((err as Error).message ?? 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v: unknown) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)' }} className="text-xl">
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a PDF and fill in its details. It appears in the library immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* ── File drop zone ── */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={[
              'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              file
                ? 'border-accent/50 bg-accent/5'
                : 'border-border hover:border-accent/40 hover:bg-muted/50',
            ].join(' ')}
          >
            <input
              name='file'
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-md bg-accent/10 shrink-0">
                    <FileText size={16} className="text-accent" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1_000_000).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                  className="p-1 rounded hover:bg-muted shrink-0"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={28} className="text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Click to select a PDF{' '}
                  <span className="text-xs text-muted-foreground/60">(max 50 MB)</span>
                </p>
              </div>
            )}
          </div>

          {/* ── Upload progress ── */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Title (full width) ── */}
          <FormField label="Title" htmlFor="title">
            <Input
              id="title"
              placeholder="e.g. Business Strategy Guide"
              value={form.title}
              onChange={set('title')}
              required
            />
          </FormField>

          {/* ── Category / Price / Pages (3-col row) ── */}
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Category" htmlFor="category">
              <select
                id="category"
                value={form.category}
                onChange={set('category')}
                className={selectCls}
              >
                <option value="">Select…</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Price (KES)" htmlFor="price">
              <Input
                id="price"
                type="number"
                min="0"
                placeholder="1500"
                value={form.price}
                onChange={set('price')}
                required
              />
            </FormField>

            <FormField label="Pages" htmlFor="pages">
              <Input
                id="pages"
                type="number"
                min="1"
                placeholder="120"
                value={form.pages}
                onChange={set('pages')}
                required
              />
            </FormField>
          </div>

          {/* ── Description ── */}
          <FormField label="Description" htmlFor="description">
            <textarea
              id="description"
              rows={2}
              placeholder="Brief description of what this document covers…"
              value={form.description}
              onChange={set('description')}
              className={textareaCls}
            />
          </FormField>

          {/* ── Preview excerpt ── */}
          <FormField label="Preview excerpt — shown blurred to non-buyers" htmlFor="preview">
            <textarea
              id="preview"
              rows={2}
              placeholder="A short teaser sentence from inside the document…"
              value={form.preview}
              onChange={set('preview')}
              className={textareaCls}
            />
          </FormField>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={uploading}
            >
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