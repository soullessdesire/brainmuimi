import React, { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button }     from '@/components/ui/button'
import { Input }      from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo }       from '@/components/logo'
import { Spinner }    from '@/components/spinner'
import { FormField }  from '@/components/form-field'
import { DecorativePanel } from '@/components/decorative-panel'
import { AlertCircle, MailCheck, ArrowLeft } from 'lucide-react'
import { friendlyAuthError } from '@/lib/firebase-errors'

export function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!email.trim()) return
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        // After reset, redirect back to login
        url: `${window.location.origin}/login`,
      })
      setSent(true)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      // Don't reveal whether email exists — show generic success
      if (code === 'auth/user-not-found') {
        setSent(true) // same UX either way for security
      } else {
        setError(friendlyAuthError(code))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <DecorativePanel />

      <div className="w-full lg:w-[480px] lg:min-w-[480px] bg-background flex flex-col justify-center px-8 py-14 overflow-y-auto">
        <div className="max-w-sm mx-auto w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Logo className="mb-10" />

          {sent ? (
            /* ── Success state ── */
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="pt-8 pb-8 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
                  <MailCheck className="text-accent-foreground" size={26} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)' }}
                    className="text-2xl font-bold text-foreground mb-2">
                    Check your email
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If an account exists for <strong className="text-foreground">{email}</strong>,
                    a password reset link has been sent. Check your inbox and spam folder.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">The link expires in 1 hour.</p>
                <Button asChild className="w-full mt-2">
                  <Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* ── Form ── */
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle style={{ fontFamily: 'var(--font-display)' }}
                  className="text-3xl font-bold tracking-tight text-foreground">
                  Forgot password?
                </CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a reset link.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  <FormField label="Email address" htmlFor="email">
                    <Input
                      id="email" type="email" required autoFocus
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </FormField>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" size="lg" className="w-full mt-1" disabled={loading || !email.trim()}>
                    {loading
                      ? <><Spinner size={15} className="text-primary-foreground" /> Sending…</>
                      : 'Send reset link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={13} /> Back to sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}