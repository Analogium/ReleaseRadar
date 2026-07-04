import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from './types'

const STORAGE_KEY = 'rr_token'

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY)
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
