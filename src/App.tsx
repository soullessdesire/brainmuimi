import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { AuthProvider, useAuth } from "./context/auth-context"
import { AdminPage as AdminDashboard, PdfPage as Dashboard, LoginPage as Login, SignupPage as Signup, Home } from "./pages"
import { Spinner } from "./components/spinner"


function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Spinner size={24} className="text-accent" />
    </div>
  )
}

function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode
  requireAdmin?: boolean
}) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin"  element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}