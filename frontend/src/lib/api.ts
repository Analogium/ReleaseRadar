import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearToken, getRefreshToken, getToken, isTokenValid, setTokens } from './token'
import type { AuthResponse } from './types'

/**
 * En dev, VITE_API_URL n'est pas défini : on passe par le proxy Vite (`/api` ->
 * http://localhost:8080, voir vite.config.ts). En prod, définir VITE_API_URL.
 */
const baseURL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({ baseURL })

// Injection du Bearer token sur chaque requête — uniquement s'il est encore valide,
// pour ne jamais envoyer un access token expiré (le 401 déclenchera un refresh).
api.interceptors.request.use((config) => {
  const token = getToken()
  if (isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

// Un seul refresh en vol à la fois : les 401 concurrents partagent la même promesse
// (sinon deux refresh utiliseraient le même refresh token, dont un déjà consommé par rotation).
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('no refresh token')
  // axios "nu" (sans intercepteurs) pour éviter toute récursion sur ce même gestionnaire.
  const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, { refreshToken })
  setTokens(data.token, data.refreshToken)
  return data.token
}

// Access token expiré (401) : on renouvelle via le refresh token puis on rejoue la requête.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { retried?: boolean }) | undefined
    const status = error.response?.status
    // On ne rafraîchit pas sur les endpoints d'auth eux-mêmes (login, refresh, logout…).
    const isAuthCall = (original?.url ?? '').includes('/auth/')

    if (status === 401 && original && !original.retried && !isAuthCall && getRefreshToken()) {
      original.retried = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        clearToken()
        redirectToLogin()
        return Promise.reject(error)
      } finally {
        refreshPromise = null
      }
    }

    // 401 non rattrapable (pas de refresh, refresh déjà tenté) sur une ressource protégée.
    if (status === 401 && !isAuthCall) {
      clearToken()
      redirectToLogin()
    }
    return Promise.reject(error)
  },
)

/** Extrait un message d'erreur lisible d'une erreur axios. */
export function apiErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined
    return data?.error ?? data?.message ?? error.message ?? fallback
  }
  return fallback
}
