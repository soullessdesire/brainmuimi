import { useState, useEffect, type SubmitEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { loginUser } from '@/services/auth.service'
import { friendlyAuthError } from '@/lib/firebase-errors'
import { useAuth } from '@/context/auth-context'
import { AlertCircle } from 'lucide-react'
import type { LoginArgs } from '@/types'

export function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<LoginArgs>({ email: '', password: '' })

  // Once AuthContext finishes loading the profile after Firebase sign-in,
  // user will be set — navigate based on role at that point.
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, navigate])

  const set =
    (key: keyof LoginArgs) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const mutation = useMutation({ mutationFn: loginUser })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    mutation.mutate(form)
  }

  const errorMsg = mutation.error
    ? friendlyAuthError((mutation.error as { code?: string }).code ?? '')
    : null

  return (
    <div className="flex min-h-screen">
      <DecorativePanel />

      {/* Form panel */}
      <div className="w-full lg:w-[480px] lg:min-w-[480px] bg-background flex flex-col justify-center px-8 py-14 overflow-y-auto">
        <div className="max-w-sm mx-auto w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Logo className="mb-10" />

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-4xl font-bold tracking-tight text-foreground"
              >
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm">
                Sign in to access your documents
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <FormField label="Email address" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    required
                  />
                </FormField>

                <FormField label="Password" htmlFor="password">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                    required
                  />
                </FormField>

                {errorMsg && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full mt-1"
                  // Stay disabled while Firebase is signing in OR while
                  // AuthContext is loading the profile after sign-in
                  disabled={mutation.isPending || mutation.isSuccess}
                  size="lg"
                >
                  {mutation.isPending || mutation.isSuccess
                    ? <><Spinner size={15} className="text-primary-foreground" /> Signing in…</>
                    : 'Sign in'}
                </Button>
              </form>

              <div className="flex justify-end -mt-1"><Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Forgot password?</Link></div>
              <Separator className="my-6" />

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-accent font-semibold hover:underline underline-offset-4">
                  Create one
                </Link>
              </p>

              <div className="mt-5 rounded-lg bg-muted px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Admin access: </span>
                  create a Firestore doc with{' '}
                  <code className="bg-background rounded px-1 py-0.5 text-[11px]">role: "admin"</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}