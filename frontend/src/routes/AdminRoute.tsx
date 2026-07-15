import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

/** N'autorise que les administrateurs ; redirige les autres vers le tableau de bord. */
export default function AdminRoute() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
