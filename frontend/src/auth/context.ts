import { createContext } from 'react'
import type { Role } from '@/lib/types'

export interface AuthUser {
  email: string
  role: Role
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  /** Crée un compte désactivé ; n'authentifie pas (l'email doit être vérifié). */
  register: (email: string, password: string, acceptTerms: boolean) => Promise<void>
  /** Redemande un email de confirmation pour un compte non encore vérifié. */
  resendVerification: (email: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
