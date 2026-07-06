import axios, { AxiosError } from 'axios'
import { clearToken, getToken, isTokenValid } from './token'

/**
 * En dev, VITE_API_URL n'est pas défini : on passe par le proxy Vite (`/api` ->
 * http://localhost:8080, voir vite.config.ts). En prod, définir VITE_API_URL.
 */
const baseURL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({ baseURL })

// Injection du Bearer token sur chaque requête — uniquement s'il est encore valide,
// pour ne jamais envoyer un token expiré (y compris sur /auth/login).
api.interceptors.request.use((config) => {
  const token = getToken()
  if (isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 => token invalide/expiré : on purge et on renvoie vers /login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
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
