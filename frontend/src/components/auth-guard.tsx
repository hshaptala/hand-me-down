import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard can be used in two ways:
 * 1. To protect routes that require authentication (requireAuth=true) - redirects to login if not authenticated
 * 2. To prevent authenticated users from accessing certain routes (requireAuth=false) - redirects to home if authenticated
 */
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // While checking authentication state, show nothing
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2E7D32] border-t-transparent"></div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If requireAuth is false and user is authenticated, redirect to home
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // If no redirect needed, show children
  return <>{children}</>;
}
