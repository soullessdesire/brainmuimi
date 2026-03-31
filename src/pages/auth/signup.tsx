import { useState, type SubmitEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/logo'
import { Spinner } from '@/components/spinner'
import { FormField } from '@/components/form-field'
import { DecorativePanel } from '@/components/decorative-panel'
import { signupUser } from '@/services/auth.service'
import { friendlyAuthError } from '@/lib/firebase-errors'
import { AlertCircle, CheckCircle2, BookOpen } from 'lucide-react'
import { SEO } from '@/components/seo'

interface SignupForm {
  name:     string
  email:    string
  password: string
  confirm:  string
}

const INITIAL: SignupForm = { name: '', email: '', password: '', confirm: '' }

export default function SignupPage() {
  const [form, setForm]           = useState<SignupForm>(INITIAL)
  const [formError, setFormError] = useState<string>('')

  const set =
    (key: keyof SignupForm) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormError('')
      setForm(prev => ({ ...prev, [key]: e.target.value }))
    }

  const mutation = useMutation({ mutationFn: signupUser })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    if (form.password !== form.confirm) return setFormError('Passwords do not match.')
    if (form.password.length < 6)       return setFormError('Password must be at least 6 characters.')
    mutation.mutate({ name: form.name, email: form.email, password: form.password })
  }

  const firebaseError = mutation.error
    ? friendlyAuthError((mutation.error as { code?: string }).code ?? '')
    : null
  const displayError = formError || firebaseError

  // ── Success ──────────────────────────────────────────────────────
  if (mutation.isSuccess) return (
    <>
      <SEO title="Create Account" description="Create a free account on Brian M Muimi Books and Publications to rate documents and track your reading." path="/signup" noIndex />
      <div className="flex min-h-screen">
      <DecorativePanel />
      <div className="w-full lg:w-[480px] lg:min-w-[480px] bg-background flex flex-col justify-center px-8 py-14">
        <div className="max-w-sm mx-auto w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Logo className="mb-10" />
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-8 pb-8 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="text-white" size={28} />
              </div>
              <div>
                <h2
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-2xl font-bold text-emerald-800 mb-2"
                >
                  Account created!
                </h2>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  You're all set. Sign in and browse the document library —
                  each document can be purchased individually.
                </p>
              </div>
              <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800 mt-2">
                <Link to="/login">Sign in now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )

  // ── Form ─────────────────────────────────────────────────────────
  return (
          <>
      <SEO title="Create Account" description="Create a free account on Brian M Muimi Books and Publications to rate documents and track your reading." path="/signup" noIndex />
      <div className="flex min-h-screen">
      <DecorativePanel />

      <div className="w-full lg:w-[480px] lg:min-w-[480px] bg-background flex flex-col justify-center px-8 py-12 overflow-y-auto">
        <div className="max-w-sm mx-auto w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Logo className="mb-8" />

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-3xl font-bold tracking-tight"
              >
                Create account
              </CardTitle>
              <CardDescription>Register free — purchase individual documents after signing in</CardDescription>
            </CardHeader>

            <CardContent className="px-0 flex flex-col gap-5">
              {/* Info callout */}
              <div className="flex gap-3 rounded-lg border border-accent/25 bg-accent/5 p-4">
                <BookOpen className="text-accent shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-bold text-accent mb-1">How it works</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Create a free account, browse the library, and purchase access to
                    individual documents — each at its own price. Payment is verified
                    manually by an admin.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <FormField label="Full name" htmlFor="name">
                  <Input id="name" type="text" placeholder="Jane Doe"
                    value={form.name} onChange={set('name')} autoComplete="name" required />
                </FormField>

                <FormField label="Email address" htmlFor="email">
                  <Input id="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={set('email')} autoComplete="email" required />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Password" htmlFor="password">
                    <Input id="password" type="password" placeholder="Min. 6 chars"
                      value={form.password} onChange={set('password')} autoComplete="new-password" required />
                  </FormField>
                  <FormField label="Confirm" htmlFor="confirm">
                    <Input id="confirm" type="password" placeholder="Repeat"
                      value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
                  </FormField>
                </div>

                {displayError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{displayError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" size="lg" className="w-full mt-1" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? <><Spinner size={15} className="text-primary-foreground" /> Creating account…</>
                    : 'Create account'}
                </Button>
              </form>

              <Separator />

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-semibold hover:underline underline-offset-4 text-black">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      </>
  )
}