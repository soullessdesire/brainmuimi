import React, { useState } from 'react'
import { useQueryClient }  from '@tanstack/react-query'
import {
  useAuth, useDocuments, useAllUsers,
} from '@/hooks'
import { deleteDocument }        from '@/services/document.service'
import { Button }                from '@/components/ui/button'
import { Input }                 from '@/components/ui/input'
import { Badge }                 from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent }     from '@/components/ui/card'
import { Separator }             from '@/components/ui/separator'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Skeleton }              from '@/components/ui/skeleton'
import { Logo }                  from '@/components/logo'
import { Spinner }               from '@/components/spinner'
import { UploadDocumentDialog }  from '@/components/upload-document-dialog'
import { SettingsPanel }         from '@/components/settings-panel'
import {
  FileText, Settings, LogOut,
  Search, RefreshCw,
  UploadCloud, Trash2, Users, Eye,
} from 'lucide-react'
import { cn }          from '@/lib/utils'
import { toast }       from 'sonner'
import { formatPrice } from '@/lib/document'
import { queryKeys, type Document }   from '@/types'

type SidebarTab = 'requests' | 'documents' | 'users' | 'settings'


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
  const [search, setSearch] = useState('')

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
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
                    </TableRow>
                  )
                )}
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
          {sidebar === 'documents' && <DocumentsPanel />}
          {sidebar === 'users'     && <UsersPanel />}
          {sidebar === 'settings'  && <SettingsPanel />}
        </main>
      </div>
    </TooltipProvider>
  )
}