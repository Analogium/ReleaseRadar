import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken, isTokenValid } from '@/lib/token'

/**
 * Garde de route : redirige vers /login si aucun token valide.
 * NB : sera rebranché sur l'AuthContext à l'étape 10.2.
 */
export default function ProtectedRoute() {
  const location = useLocation()

  if (!isTokenValid(getToken())) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
