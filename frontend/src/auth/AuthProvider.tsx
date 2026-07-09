import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { AuthContext, type AuthUser } from './context'
import { api } from '@/lib/api'
import type { AuthResponse } from '@/lib/types'
import {
  clearToken,
  decodeToken,
  getRefreshToken,
  getToken,
  isTokenValid,
  setTokens,
} from '@/lib/token'

/** Identité (email/rôle) lue dans un access token, même expiré (le refresh le renouvellera). */
function userFromClaims(accessToken: string | null): AuthUser | null {
  if (!accessToken) return null
  const claims = decodeToken(accessToken)
  return claims ? { email: claims.sub, role: claims.role ?? 'USER' } : null
}

/** Au démarrage : authentifié si l'access est encore valide, ou si un refresh token existe. */
function bootstrapUser(): AuthUser | null {
  if (!isTokenValid(getToken()) && !getRefreshToken()) return null
  return userFromClaims(getToken())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(bootstrapUser)

  const authenticate = useCallback(async (path: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>(path, { email, password })
    setTokens(data.token, data.refreshToken)
    setUser(userFromClaims(data.token))
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
    // Révocation côté serveur (best-effort), puis purge locale.
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
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
