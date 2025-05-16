import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  // While checking authentication state, show nothing
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user is authenticated, render the protected content
  return <Outlet />
}

export function PublicRoute() {
  const { user, loading } = useAuth()

  // While checking authentication state, show nothing
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  // If user is authenticated, redirect to home page
  if (user) {
    return <Navigate to="/" replace />
  }

  // If user is not authenticated, render the public route
  return <Outlet />
}
