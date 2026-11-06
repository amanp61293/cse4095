import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute() {
  const { user, loading, error } = useAuth()
  const location = useLocation()

  if (loading) return <main className="mx-auto max-w-lg p-8" role="status">Checking your session...</main>
  if (error) return <main className="mx-auto max-w-lg p-8" role="alert">{error}</main>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  return <Outlet />
}
