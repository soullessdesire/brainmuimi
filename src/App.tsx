import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/context/auth-context'
import {
  AdminPage as AdminDashboard,
  PdfPage    as Dashboard,
  LoginPage  as Login,
  SignupPage  as Signup,
  Home,
  ForgotPasswordPage,
} from '@/pages'
import { Spinner } from '@/components/spinner'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Spinner size={24} className="text-accent" />
    </div>
  )
}

// Admin-only guard
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />
  return <>{children}</>
}

// Redirect logged-in users away from auth pages
function AuthRedirect({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — always accessible */}
          <Route path="/"          element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Auth pages — redirect if already signed in */}
          <Route path="/login"           element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/signup"          element={<AuthRedirect><Signup /></AuthRedirect>} />
          <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />

          {/* Admin only */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}