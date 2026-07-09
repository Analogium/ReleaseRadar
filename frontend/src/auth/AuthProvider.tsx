import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { AuthContext, type AuthUser } from './context'
import { api } from '@/lib/api'
import type { AuthResponse } from '@/lib/types'
import { clearToken, decodeToken, getToken, isTokenValid, setToken } from '@/lib/token'

/** Reconstruit l'utilisateur courant à partir d'un token (null si absent/expiré). */
function userFromToken(token: string | null): AuthUser | null {
  if (!isTokenValid(token)) return null
  const claims = decodeToken(token)
  return claims ? { email: claims.sub, role: claims.role ?? 'USER' } : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restauration synchrone au démarrage depuis le localStorage.
  const [user, setUser] = useState<AuthUser | null>(() => userFromToken(getToken()))

  const authenticate = useCallback(async (path: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>(path, { email, password })
    setToken(data.token)
    setUser(userFromToken(data.token))
  }, [])

  const login = useCallback(
    (email: string, password: string) => authenticate('/auth/login', email, password),
    [authenticate],
  )

  // L'inscription n'authentifie plus : le compte est créé désactivé et doit être
  // confirmé par email. On ne stocke donc aucun token ici.
  const register = useCallback(async (email: string, password: string) => {
    await api.post('/auth/register', { email, password })
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    await api.post('/auth/resend-verification', { email })
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      resendVerification,
      logout,
    }),
    [user, login, register, resendVerification, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
