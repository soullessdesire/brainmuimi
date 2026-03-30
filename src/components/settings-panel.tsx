import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/components/form-field'
import { Spinner }  from '@/components/spinner'
import { useAuth }  from '@/hooks'
import { SELLER }   from '@/lib/seller'
import { toast }    from 'sonner'
import {
  Lock, Phone, Mail, Building2,
  AlertCircle, CheckCircle2, ShieldCheck,
} from 'lucide-react'

// ── Change password ───────────────────────────────────────────────
function ChangePasswordCard() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setError('')
    setForm(prev => ({ ...prev, [k]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (form.next !== form.confirm) return setError('New passwords do not match.')
    if (form.next.length < 6)       return setError('Password must be at least 6 characters.')
    if (!auth.currentUser)          return setError('Not signed in.')

    setLoading(true)
    try {
      // Re-authenticate first (Firebase requires this for sensitive ops)
      const cred = EmailAuthProvider.credential(
        auth.currentUser.email ?? '',
        form.current,
      )
      await reauthenticateWithCredential(auth.currentUser as User, cred)
      await updatePassword(auth.currentUser as User, form.next)
      toast.success('Password updated successfully.')
      setForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else {
        setError('Failed to update password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-accent" />
          <CardTitle className="text-base">Change Password</CardTitle>
        </div>
        <CardDescription className="text-xs">
          You'll need to enter your current password to confirm the change.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm" noValidate>
          <FormField label="Current password" htmlFor="current">
            <Input id="current" type="password" value={form.current} onChange={set('current')}
              autoComplete="current-password" placeholder="••••••••" required />
          </FormField>
          <FormField label="New password" htmlFor="next">
            <Input id="next" type="password" value={form.next} onChange={set('next')}
              autoComplete="new-password" placeholder="Min. 6 characters" required />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirm">
            <Input id="confirm" type="password" value={form.confirm} onChange={set('confirm')}
              autoComplete="new-password" placeholder="Repeat new password" required />
          </FormField>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" size="sm" className="w-fit" disabled={loading}>
            {loading ? <><Spinner size={14} className="text-primary-foreground" /> Updating…</> : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Seller contact info (read-only view) ──────────────────────────
function ContactInfoCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-accent" />
          <CardTitle className="text-base">Seller Contact Details</CardTitle>
        </div>
        <CardDescription className="text-xs">
          These are shown to buyers in the payment dialog. Edit <code className="text-[11px] bg-muted px-1 rounded">src/lib/seller.ts</code> to update them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { icon: <Building2 size={14} />, label: 'Business name', value: SELLER.name + ' Books and Publications' },
          { icon: <Phone size={14} />,     label: 'M-Pesa number', value: SELLER.mpesa },
          { icon: <Mail size={14} />,      label: 'Contact email', value: SELLER.email },
          { icon: <Mail size={14} />,      label: 'Support email', value: SELLER.supportEmail },
          ...(SELLER.paybill ? [{ icon: <Phone size={14} />, label: 'Paybill / Till', value: SELLER.paybill }] : []),
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground">{value || '—'}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Security overview ─────────────────────────────────────────────
function SecurityCard() {
  const { user } = useAuth()
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
          <CardTitle className="text-base">Account Security</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { label: 'Signed in as',   value: user?.email ?? '—',    ok: true  },
          { label: 'Role',           value: user?.role  ?? '—',    ok: true  },
          { label: 'Auth provider',  value: 'Email / Password',    ok: true  },
          { label: '2-Factor Auth',  value: 'Not enabled',         ok: false },
        ].map(({ label, value, ok }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-1.5">
              {ok
                ? <CheckCircle2 size={13} className="text-accent" />
                : <AlertCircle  size={13} className="text-amber-500" />}
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Main settings panel ───────────────────────────────────────────
export function SettingsPanel() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-card border-b border-border px-8 py-5">
        <h1 style={{ fontFamily: 'var(--font-display)' }}
          className="text-2xl font-bold tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your account, security, and store configuration.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 max-w-2xl">
        <SecurityCard />
        <Separator />
        <ChangePasswordCard />
        <Separator />
        <ContactInfoCard />
      </div>
    </div>
  )
}