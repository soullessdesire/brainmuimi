import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/context/auth-context'
import { Spinner } from '@/components/spinner'

// ── Code-split all pages — each becomes its own JS chunk ──────────
const Home               = lazy(() => import('@/pages').then(m => ({ default: m.Home })))
const PdfPage            = lazy(() => import('@/pages').then(m => ({ default: m.PdfPage })))
const LoginPage          = lazy(() => import('@/pages').then(m => ({ default: m.LoginPage })))
const SignupPage         = lazy(() => import('@/pages/auth/signup'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password').then(m => ({ default: m.ForgotPasswordPage })))
const AdminPage          = lazy(() => import('@/pages/admin/dashboard').then(m => ({ default: m.AdminPage })))

// ── Shared fallback for lazy pages ────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Spinner size={28} className="text-accent" />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Spinner size={24} className="text-accent" />
    </div>
  )
}

// ── Route guards ──────────────────────────────────────────────────
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthRedirect({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"          element={<Home />} />
            <Route path="/dashboard" element={<PdfPage />} />

            {/* Auth — redirect if signed in */}
            <Route path="/login"           element={<AuthRedirect><LoginPage /></AuthRedirect>} />
            <Route path="/signup"          element={<AuthRedirect><SignupPage /></AuthRedirect>} />
            <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />

            {/* Admin only */}
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}