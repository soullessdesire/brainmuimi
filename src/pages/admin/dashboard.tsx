import React, { useState } from 'react'
import { useQueryClient }  from '@tanstack/react-query'
import {
  useAuth, useAllDocumentRequests,
  useUpdateRequestStatus, useDocuments, useAllUsers,
} from '@/hooks'
import { deleteDocument }        from '@/services/document.service'
import { Button }                from '@/components/ui/button'
import { Input }                 from '@/components/ui/input'
import { Badge }                 from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent }     from '@/components/ui/card'
import { Separator }             from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Skeleton }              from '@/components/ui/skeleton'
import { Logo }                  from '@/components/logo'
import { Spinner }               from '@/components/spinner'
import { UploadDocumentDialog }  from '@/components/upload-document-dialog'
import { SettingsPanel }         from '@/components/settings-panel'
import {
  FileText, Settings, LogOut,
  CheckCircle2, XCircle, RotateCcw,
  Search, ChevronDown, ChevronUp, RefreshCw,
  UploadCloud, Trash2, Users, Eye, Phone,
} from 'lucide-react'
import { cn }          from '@/lib/utils'
import { toast }       from 'sonner'
import { formatPrice } from '@/lib/document'
import { queryKeys }   from '@/types'
import type { DocumentRequest, RequestStatus, Document } from '@/types'

type RequestTab = 'all' | 'pending' | 'approved' | 'rejected'
type SidebarTab = 'requests' | 'documents' | 'users' | 'settings'

// ── Helpers ───────────────────────────────────────────────────────
function getCounts(reqs: DocumentRequest[]) {
  return {
    all:      reqs.length,
    pending:  reqs.filter(r => r.status === 'pending').length,
    approved: reqs.filter(r => r.status === 'approved').length,
    rejected: reqs.filter(r => r.status === 'rejected').length,
  }
}

const BADGE_VARIANT: Record<RequestStatus, 'pending' | 'approved' | 'rejected'> = {
  pending: 'pending', approved: 'approved', rejected: 'rejected',
}

function NavItem({ icon, label, active = false, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors select-none',
        active
          ? 'bg-accent/20 text-accent'
          : 'text-white/40 hover:text-white/75 hover:bg-white/5',
      )}
    >
      {icon}{label}
    </div>
  )
}

// ── Expanded request detail — now includes phone ──────────────────
function ExpandedRequestDetail({ req }: { req: DocumentRequest }) {
  const fields = [
    { label: 'Request ID',        value: req.id,           mono: true  },
    { label: 'Firebase UID',      value: req.uid,          mono: true  },
    { label: 'Email',             value: req.userEmail,    mono: false },
    { label: 'Doc ID',            value: req.docId,        mono: true  },
    { label: 'Payment Reference', value: req.paymentRef,   mono: true  },
    {
      label: 'Submitted',
      value: req.createdAt && 'toDate' in req.createdAt
        ? req.createdAt.toDate().toLocaleString() : '—',
      mono: false,
    },
  ]
  return (
    <TableRow className="bg-muted/20 hover:bg-muted/20">
      <TableCell colSpan={7} className="py-4">
        <div className="pl-11 flex flex-wrap gap-x-8 gap-y-3">
          {fields.map(({ label, value, mono }) => (
            <div key={label}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
              {mono
                ? <code className="text-xs font-mono bg-card border border-border px-2 py-0.5 rounded">{value}</code>
                : <p className="text-xs text-foreground">{value}</p>
              }
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}

// ── Requests panel ────────────────────────────────────────────────
function RequestsPanel() {
  const { data: requests = [], isLoading, isFetching, refetch } = useAllDocumentRequests()
  const updateStatus = useUpdateRequestStatus()
  const { data: documents = [] } = useDocuments()

  const [tab, setTab]           = useState<RequestTab>('pending')
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  function getDocTitle(docId: string) {
    return documents.find(d => d.id === docId)?.title ?? docId
  }
  function getDocPrice(docId: string) {
    const d = documents.find(doc => doc.id === docId)
    return d ? formatPrice(d.price) : '—'
  }

  async function handleAction(requestId: string, status: RequestStatus) {
    setActingId(requestId)
    try {
      await updateStatus.mutateAsync({ requestId, status })
      const label = status === 'approved'
        ? 'Access approved'
        : status === 'rejected' ? 'Access rejected' : 'Request revoked'
      toast.success(label)
    } catch {
      toast.error('Action failed — please try again.')
    } finally {
      setActingId(null)
    }
  }

  const counts   = getCounts(requests)
  const filtered = requests.filter(r => {
    const matchTab    = tab === 'all' || r.status === tab
    const q           = search.toLowerCase()
    const matchSearch =
      !q ||
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.paymentRef.toLowerCase().includes(q) ||
      getDocTitle(r.docId).toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-8 py-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)' }}
              className="text-2xl font-bold tracking-tight mb-1">
              Document Access Requests
            </h1>
            <p className="text-xs text-muted-foreground">
              Verify payment references and approve per-document access
            </p>
          </div>
          <div className="flex items-center gap-5">
            {([
              { label: 'Pending',  count: counts.pending,  cls: 'text-amber-600'   },
              { label: 'Approved', count: counts.approved, cls: 'text-emerald-700' },
              { label: 'Rejected', count: counts.rejected, cls: 'text-red-600'     },
            ] as const).map(({ label, count, cls }) => (
              <div key={label} className="text-center min-w-[48px]">
                <p style={{ fontFamily: 'var(--font-display)' }}
                  className={cn('text-3xl font-bold leading-none mb-1', cls)}>
                  {count}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {label}
                </p>
              </div>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => void refetch()} disabled={isFetching}>
                  <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-b border-border px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={tab} onValueChange={v => setTab(v as RequestTab)}>
          <TabsList className="h-8">
            {(['all', 'pending', 'approved', 'rejected'] as RequestTab[]).map(t => (
              <TabsTrigger key={t} value={t} className="text-xs capitalize gap-1.5">
                {t}
                <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                  {counts[t]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search user, phone, ref or document…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground text-sm">
            <Spinner size={20} /> Loading requests…
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
              <Search size={36} className="text-muted-foreground/25 mt-2" />
              <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl">No requests found</p>
              <p className="text-xs text-muted-foreground">
                {tab === 'pending' ? 'No pending requests right now.' : 'Try a different filter.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Payment Reference</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(req => (
                  <React.Fragment key={req.id}>
                    <TableRow
                      className={cn('cursor-pointer', expanded === req.id && 'bg-muted/30')}
                      onClick={() => setExpanded(p => p === req.id ? null : req.id)}
                    >
                      {/* User */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-muted text-[10px] font-semibold">
                              {req.userName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{req.userName}</p>
                            <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Document */}
                      <TableCell>
                        <p className="text-sm font-medium max-w-[160px] truncate">{getDocTitle(req.docId)}</p>
                        <p className="text-xs text-accent font-semibold">{getDocPrice(req.docId)}</p>
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone size={11} />
                          {req.phone || '—'}
                        </span>
                      </TableCell>

                      {/* Payment ref */}
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {req.paymentRef || '—'}
                        </code>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {req.createdAt && 'toDate' in req.createdAt
                            ? req.createdAt.toDate().toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant={BADGE_VARIANT[req.status]}>{req.status}</Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {actingId === req.id ? (
                            <Spinner size={14} className="text-muted-foreground" />
                          ) : (
                            <>
                              {req.status !== 'approved' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm"
                                      className="bg-emerald-700 hover:bg-emerald-800 text-white h-7 px-2.5 text-xs gap-1"
                                      onClick={() => void handleAction(req.id, 'approved')}>
                                      <CheckCircle2 size={12} /> Approve
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Grant access to this document</TooltipContent>
                                </Tooltip>
                              )}
                              {req.status !== 'rejected' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="destructive"
                                      className="h-7 px-2.5 text-xs gap-1"
                                      onClick={() => void handleAction(req.id, 'rejected')}>
                                      <XCircle size={12} /> Reject
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reject this payment reference</TooltipContent>
                                </Tooltip>
                              )}
                              {req.status === 'approved' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="outline"
                                      className="h-7 px-2.5 text-xs gap-1"
                                      onClick={() => void handleAction(req.id, 'pending')}>
                                      <RotateCcw size={12} /> Revoke
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Revoke access</TooltipContent>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* Expand chevron */}
                      <TableCell>
                        {expanded === req.id
                          ? <ChevronUp size={14} className="text-muted-foreground" />
                          : <ChevronDown size={14} className="text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                    {expanded === req.id && <ExpandedRequestDetail req={req} />}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Documents panel ───────────────────────────────────────────────
function DocumentsPanel() {
  const qc = useQueryClient()
  const { data: documents = [], isLoading } = useDocuments()
  const [uploadOpen, setUploadOpen]         = useState(false)
  const [deletingId, setDeletingId]         = useState<string | null>(null)

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    setDeletingId(doc.id)
    try {
      await deleteDocument(doc.id, doc.storagePath)
      await qc.invalidateQueries({ queryKey: queryKeys.documents })
      toast.success('Document deleted.')
    } catch {
      toast.error('Delete failed — please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-card border-b border-border px-8 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)' }}
              className="text-2xl font-bold tracking-tight mb-1">
              Documents
            </h1>
            <p className="text-xs text-muted-foreground">
              {documents.length} document{documents.length !== 1 ? 's' : ''} in the library
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} variant="outline" className="gap-2">
            <UploadCloud size={15} /> Upload document
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <FileText size={40} className="text-muted-foreground/20" />
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-foreground">
              No documents yet
            </p>
            <p className="text-xs text-muted-foreground">Upload your first PDF to get started.</p>
            <Button onClick={() => setUploadOpen(true)} variant="outline" className="gap-2 mt-2">
              <UploadCloud size={14} /> Upload document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <Card key={doc.id} className="flex flex-col gap-0 overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <div className="p-2.5 rounded-lg bg-accent/10 shrink-0 mt-0.5">
                    <FileText size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground leading-snug">{doc.title}</p>
                      <Badge variant="outline" className="text-[10px] text-accent border-accent/30 shrink-0">
                        {doc.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{doc.pages} pages</span>
                        <span>·</span>
                        <span>{doc.size}</span>
                      </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye size={12} />
                      <span>{doc.viewCount ?? 0} view{(doc.viewCount ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                      <span className="text-sm font-bold text-foreground">{formatPrice(doc.price)}</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                  <code className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                    {doc.storagePath}
                  </code>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === doc.id}
                        onClick={() => void handleDelete(doc)}
                      >
                        {deletingId === doc.id ? <Spinner size={13} /> : <Trash2 size={13} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete document</TooltipContent>
                  </Tooltip>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <UploadDocumentDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}

// ── Users panel ───────────────────────────────────────────────────
function UsersPanel() {
  const { data: users = [], isLoading, isFetching, refetch } = useAllUsers()
  const { data: requests = [] } = useAllDocumentRequests()
  const [search, setSearch] = useState('')

  function getUserRequestCounts(uid: string) {
    const userReqs = requests.filter(r => r.uid === uid)
    return {
      total:    userReqs.length,
      approved: userReqs.filter(r => r.status === 'approved').length,
      pending:  userReqs.filter(r => r.status === 'pending').length,
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-card border-b border-border px-8 py-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)' }}
              className="text-2xl font-bold tracking-tight mb-1">
              Users
            </h1>
            <p className="text-xs text-muted-foreground">
              {users.length} registered user{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => void refetch()} disabled={isFetching}>
                <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="bg-card border-b border-border px-8 py-3">
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground text-sm">
            <Spinner size={20} /> Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
              <Users size={36} className="text-muted-foreground/25 mt-2" />
              <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl">No users found</p>
              <p className="text-xs text-muted-foreground">
                {search ? 'Try a different search.' : 'No users have signed up yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => {
                  const counts = getUserRequestCounts(u.uid)
                  return (
                    <TableRow key={u.uid}>
                      {/* User */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-muted text-xs font-semibold">
                              {u.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Joined */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {u.createdAt && 'toDate' in u.createdAt
                            ? u.createdAt.toDate().toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </TableCell>

                      {/* Total requests */}
                      <TableCell>
                        <span className="text-sm font-medium">{counts.total}</span>
                      </TableCell>

                      {/* Approved */}
                      <TableCell>
                        {counts.approved > 0 ? (
                          <Badge variant="approved">{counts.approved}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Pending */}
                      <TableCell>
                        {counts.pending > 0 ? (
                          <Badge variant="pending">{counts.pending}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export function AdminPage() {
  const { user, logout }      = useAuth()
  const [sidebar, setSidebar] = useState<SidebarTab>('requests')

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-foreground px-4 py-7 gap-6">
          <div className="px-2"><Logo /></div>
          <nav className="flex flex-col gap-1 flex-1">
            <NavItem
              icon={<FileText size={15} />} label="Requests"
              active={sidebar === 'requests'} onClick={() => setSidebar('requests')}
            />
            <NavItem
              icon={<UploadCloud size={15} />} label="Documents"
              active={sidebar === 'documents'} onClick={() => setSidebar('documents')}
            />
            <NavItem
              icon={<Users size={15} />} label="Users"
              active={sidebar === 'users'} onClick={() => setSidebar('users')}
            />
            <NavItem icon={<Settings size={15} />} label="Settings" active={sidebar === 'settings'} onClick={() => setSidebar('settings')} />
          </nav>
          <div className="flex flex-col gap-3">
            <Separator className="bg-white/10" />
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-white/35 text-[10px] uppercase tracking-wider">Administrator</p>
              </div>
            </div>
            <Button variant="ghost" size="sm"
              className="w-full text-white/40 hover:text-white/70 hover:bg-white/5 justify-start gap-2"
              onClick={() => void logout()}>
              <LogOut size={14} /> Sign out
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {sidebar === 'requests'  && <RequestsPanel />}
          {sidebar === 'documents' && <DocumentsPanel />}
          {sidebar === 'users'     && <UsersPanel />}
          {sidebar === 'settings'  && <SettingsPanel />}
        </main>
      </div>
    </TooltipProvider>
  )
}