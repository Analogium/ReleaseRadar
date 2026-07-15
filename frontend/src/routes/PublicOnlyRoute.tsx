import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

/** Empêche un utilisateur déjà connecté d'accéder à /login ou /register. */
export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
