import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useDocuments } from '@/hooks'
import { Button }     from '@/components/ui/button'
import { Badge }      from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator }  from '@/components/ui/separator'
import { Skeleton }   from '@/components/ui/skeleton'
import { Logo }       from '@/components/logo'
import { PdfViewerDialog } from '@/components/pdf-viewer-dialog'
import { useDocumentRatings } from '@/hooks'
import {
  BookOpen, FileText, HardDrive,
  Star, Phone, Mail, LogIn, LogOut, Eye,
} from 'lucide-react'
import type { Document } from '@/types'
import { SEO } from '@/components/seo'

// ── Average stars display ─────────────────────────────────────────
function StarDisplay({ docId }: { docId: string }) {
  const { data: ratings = [] } = useDocumentRatings(docId)
  if (!ratings.length) return <span className="text-xs text-muted-foreground">No ratings yet</span>
  const avg = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
  return (
    <>
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n => (
          <Star key={n} size={11}
            className={n <= Math.round(avg) ? 'fill-[#4CAF50] text-[#4CAF50]' : 'text-muted-foreground/30'} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{avg.toFixed(1)} ({ratings.length})</span>
    </div>
      </>
  )
}

// ── Document card ─────────────────────────────────────────────────
function DocCard({ doc, onView }: {
  doc:    Document
  uid:    string
  onView: (doc: Document) => void
}) {
  return (
    <Card className="flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden">
      {/* Cover image */}
      {doc.coverPath ? (
        <div className="aspect-[3/2] bg-muted overflow-hidden">
          <CoverImage path={doc.coverPath} title={doc.title} />
        </div>
      ) : (
        <div className="aspect-[3/2] bg-gradient-to-br from-[#4CAF50]/10 to-[#6B2D8B]/10 flex items-center justify-center border-b border-border">
          <BookOpen size={40} className="text-[#4CAF50]/40" />
        </div>
      )}

      <CardHeader className="pb-2">
        <Badge variant="outline" className="w-fit text-[10px] text-accent border-accent/30 mb-1">
          {doc.category}
        </Badge>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }} className="text-lg leading-snug">
          {doc.title}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed line-clamp-2">
          {doc.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2 flex-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
          <span className="flex items-center gap-1"><FileText size={11} /> {doc.pages} pages</span>
          <span className="flex items-center gap-1"><HardDrive size={11} /> {doc.size}</span>
          <span className="flex items-center gap-1.5"><Eye size={11} /> {doc.viewCount ?? 0}</span>
        </div>
        <StarDisplay docId={doc.id} />
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => onView(doc)}
        >
          <BookOpen size={14} /> Read document
        </Button>
      </CardFooter>
    </Card>
  )
}

// ── Cover image helper ────────────────────────────────────────────
function CoverImage({ path, title }: { path: string; title: string }) {
  const [url, setUrl]   = useState<string | null>(null)
  const [err, setErr]   = useState(false)

  React.useEffect(() => {
    import('@/services/document.service').then(m =>
      m.getDocumentDownloadUrl(path).then(setUrl).catch(() => setErr(true))
    )
  }, [path])

  if (err || !url) return (
    <div className="w-full h-full bg-gradient-to-br from-[#4CAF50]/10 to-[#6B2D8B]/10 flex items-center justify-center">
      <BookOpen size={36} className="text-[#4CAF50]/40" />
    </div>
  )
  return <img src={url} alt={title} className="w-full h-full object-cover" />
}

// ── Card skeleton ─────────────────────────────────────────────────
function DocCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <Skeleton className="aspect-[3/2] rounded-none rounded-t-xl" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1"><Skeleton className="h-8 w-full rounded-md" /></CardContent>
      <CardFooter><Skeleton className="h-9 w-full rounded-md" /></CardFooter>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export function PdfPage() {
  const { user, logout }  = useAuth()
  const { data: documents = [], isLoading } = useDocuments()
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)

  const uid = user?.uid ?? 'anonymous'

  return (
          <>
      <SEO title="Document Library" description="Browse and read free educational books by Brian M Muimi — history, science, health, ethics and more." path="/dashboard" />
      <div className="min-h-screen bg-background">

      {/* ── Contact strip ── */}
      <div className="bg-[#4CAF50] text-white text-xs py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 flex-wrap">
          <a href="tel:0743074018" className="flex items-center gap-1.5 hover:text-white/80 transition-colors font-medium">
            <Phone size={12} /> 0743 074 018
          </a>
          <span className="text-white/40">·</span>
          <a href="mailto:brianmuimi2004@gmail.com" className="flex items-center gap-1.5 hover:text-white/80 transition-colors font-medium">
            <Mail size={12} /> brianmuimi2004@gmail.com
          </a>
        </div>
      </div>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-[#4CAF50] text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium text-foreground">{user.name}</p>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => void logout()}>
                  <LogOut size={13} /> Sign out
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <Link to="/login"><LogIn size={13} /> Sign in to rate</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
          <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-4xl font-bold text-foreground tracking-tight mb-2">
            Document Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and read all documents freely. Sign in to leave a rating.
          </p>
        </div>

        {!isLoading && documents.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">No documents available yet. Check back soon.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 delay-100">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <DocCardSkeleton key={i} />)
            : documents.map(doc => (
                <DocCard key={doc.id} doc={doc} uid={uid} onView={setViewingDoc} />
              ))
          }
        </div>
      </main>

      {/* ── PDF viewer ── */}
      {viewingDoc && (
        <PdfViewerDialog
          open={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          doc={viewingDoc}
          uid={uid}
        />
      )}
    </div>
    </>
  )
}