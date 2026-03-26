import { useState } from 'react'
import { useAuth, useMyDocumentRequests, useDocuments } from '../../hooks'
import { getDocumentDownloadUrl } from '../../services/document.service'
import { Button }             from '../../components/ui/button'
import { Badge }              from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Separator }          from '../../components/ui/separator'
import { Skeleton }           from '../../components/ui/skeleton'
import { Logo }               from '../../components/logo'
import { Spinner }            from '../../components/spinner'
import { RequestAccessDialog } from '../../components/request-access-dialog'
import { formatPrice }        from '../../lib/document'
import {
  Download, Clock, XCircle,
  FileText, HardDrive, ShoppingCart,
  RefreshCw, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Document, DocumentRequest, RequestStatus } from '../../types'
import { Helmet } from "react-helmet-async"

// ── Helpers ───────────────────────────────────────────────────────
function getDocStatus(requests: DocumentRequest[], docId: string): RequestStatus | null {
  return requests.find(r => r.docId === docId)?.status ?? null
}

function DocStatusBadge({ status }: { status: RequestStatus | null }) {
  if (!status) return null
  const map: Record<RequestStatus, { label: string; variant: 'pending' | 'approved' | 'rejected' }> = {
    pending:  { label: 'Pending review', variant: 'pending'  },
    approved: { label: 'Access granted', variant: 'approved' },
    rejected: { label: 'Rejected',       variant: 'rejected' },
  }
  const { label } = map[status]
  return <Badge variant={"ghost"}>{label}</Badge>
}

// ── Document card ─────────────────────────────────────────────────
function DocCard({ doc, status, onRequest }: {
  doc:       Document
  status:    RequestStatus | null
  onRequest: (doc: Document) => void
}) {
  const [downloading, setDownloading] = useState(false)
  const isApproved = status === 'approved'

  async function handleDownload() {
    if (!isApproved || downloading) return
    setDownloading(true)
    try {
      // Fetch a fresh signed URL from Firebase Storage
      const url = await getDocumentDownloadUrl(doc.storagePath)
      const a   = Object.assign(document.createElement('a'), {
        href:     url,
        download: `${doc.title.replace(/\s+/g, '_')}.pdf`,
        target:   '_blank',
        rel:      'noopener noreferrer',
      })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error('Download failed — please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className={`flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${!isApproved ? 'opacity-90' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Badge variant="secondary" className="text-[10px] text-black border-accent/30">
            {doc.category}
          </Badge>
          <DocStatusBadge status={status} />
        </div>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }} className="text-xl leading-snug">
          {doc.title}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed">{doc.description}</CardDescription>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        {/* Preview — blurred until approved */}
        <div className="relative rounded-md bg-muted px-4 py-3 overflow-hidden min-h-[56px]">
          <p className={`text-[11px] text-muted-foreground italic leading-relaxed transition-all duration-300 ${!isApproved ? 'blur-[3px] select-none' : ''}`}>
            "{doc.preview}"
          </p>
          {!isApproved && (
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted to-transparent" />
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><FileText size={11} /> {doc.pages} pages</span>
            <span className="flex items-center gap-1"><HardDrive size={11} /> {doc.size}</span>
          </div>
          <span className="text-sm font-bold text-foreground">{formatPrice(doc.price)}</span>
        </div>
      </CardContent>

      <CardFooter>
        {isApproved ? (
          <Button onClick={handleDownload} disabled={downloading} variant="outline" className="w-full">
            {downloading
              ? <><Spinner size={14} /> Preparing download…</>
              : <><Download size={14} /> Download PDF</>}
          </Button>
        ) : status === 'pending' ? (
          <Button variant="outline" disabled className="w-full gap-2 text-amber-600 border-amber-200 bg-amber-50">
            <Clock size={14} /> Pending review
          </Button>
        ) : status === 'rejected' ? (
          <Button variant="outline" onClick={() => onRequest(doc)} className="w-full gap-2 text-destructive border-destructive/30">
            <XCircle size={14} /> Resubmit request
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onRequest(doc)} className="w-full gap-2">
            <ShoppingCart size={14} /> Request access — {formatPrice(doc.price)}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ── Card skeleton ─────────────────────────────────────────────────
function DocCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <Skeleton className="h-14 w-full rounded-md mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}

// ── Access summary strip ──────────────────────────────────────────
function AccessSummary({ requests }: { requests: DocumentRequest[] }) {
  const approved = requests.filter(r => r.status === 'approved').length
  const pending  = requests.filter(r => r.status === 'pending').length
  if (!requests.length) return null
  return (
    <div className="flex items-center gap-4 bg-muted/50 border border-border rounded-lg px-5 py-3 mb-8 text-xs flex-wrap">
      {approved > 0 && (
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle2 size={13} /> {approved} document{approved > 1 ? 's' : ''} accessible
        </span>
      )}
      {pending > 0 && (
        <span className="flex items-center gap-1.5 text-amber-600 font-medium">
          <Clock size={13} /> {pending} request{pending > 1 ? 's' : ''} pending review
        </span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export function PdfPage() {
  const { user, logout } = useAuth()

  const { data: documents = [], isLoading: docsLoading } = useDocuments()
  const { data: requests = [], isFetching, refetch } = useMyDocumentRequests(user?.uid)

  const [dialogDoc, setDialogDoc] = useState<Document | null>(null)

  return (
    <div className="min-h-screen bg-background">
            <Helmet>
        <title>Kiswahili Books Library | Brian M Muimi</title>
        <meta
          name="description"
          content="Browse and purchase self-authored Kiswahili books and publications by Brian M Muimi. Secure digital downloads available."
        />
        <meta
          name="keywords"
          content="Kiswahili books, Swahili novels, African literature, buy books Kenya"
        />
        <meta property="og:title" content="Kiswahili Books Library" />
        <meta
          property="og:description"
          content="Explore original Kiswahili literature available for secure digital download."
        />
      </Helmet>
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-foreground text-background text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs font-semibold text-foreground">{user?.name}</p>
            </div>
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
              onClick={() => void refetch()} disabled={isFetching}
              title="Refresh access status"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={() => void logout()}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
          <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-4xl font-bold text-foreground tracking-tight mb-2">
            Brian M Muimi Books and Publications
          </h1>
          <p className="text-sm text-muted-foreground">
            Purchase access to individual documents. Each download is priced separately.
          </p>
        </div>

        <AccessSummary requests={requests} />

        {!docsLoading && documents.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <FileText size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">No documents available yet. Check back soon.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 delay-100">
          {docsLoading
            ? Array.from({ length: 6 }).map((_, i) => <DocCardSkeleton key={i} />)
            : documents.map(doc => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  status={getDocStatus(requests, doc.id)}
                  onRequest={setDialogDoc}
                />
              ))
          }
        </div>
      </main>

      {dialogDoc && user && (
        <RequestAccessDialog
          open={!!dialogDoc}
          onClose={() => setDialogDoc(null)}
          doc={dialogDoc}
          user={user}
        />
      )}
    </div>
  )
}