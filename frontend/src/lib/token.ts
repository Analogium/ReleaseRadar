import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from './types'

const ACCESS_KEY = 'rr_token'
const REFRESH_KEY = 'rr_refresh'

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(ACCESS_KEY, token)
}

/** Stocke le couple (access, refresh) reçu à la connexion ou au renouvellement. */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

/** Efface les deux tokens (déconnexion ou session invalide). */
export function clearToken(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

/** Décode le JWT sans vérifier la signature (le backend reste seul juge). */
export function decodeToken(token: string): JwtClaims | null {
  try {
    return jwtDecode<JwtClaims>(token)
  } catch {
    return null
  }
}

/** Vrai si un token est présent et non expiré. */
export function isTokenValid(token: string | null): token is string {
  if (!token) return false
  const claims = decodeToken(token)
  if (!claims?.exp) return false
  return claims.exp * 1000 > Date.now()
}
