// Types miroir des DTO du backend (voir ROADMAP.md § Étape 10 — Contrat d'API).

export type ReleaseType = 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION' | 'LIVE' | 'OTHER'

export type Role = 'USER' | 'ADMIN'

/** Rôle de l'artiste dans une sortie (déduit de l'artist-credit MusicBrainz). */
export type ArtistRole = 'PRIMARY' | 'COLLABORATION' | 'FEATURING'

export interface AuthResponse {
  token: string
  refreshToken: string
}

/** Réponse porteuse d'un simple message (inscription, vérification d'email…). */
export interface MessageResponse {
  message: string
}

/** Résultat de recherche MusicBrainz — GET /api/artists/search?q= */
export interface ArtistSearchResult {
  mbid: string
  name: string
  disambiguation: string | null
}

/** Artiste suivi — GET /api/artists, POST /api/artists */
export interface Artist {
  id: string
  mbid: string
  name: string
}

/** Sortie — GET /api/releases */
export interface Release {
  id: string
  mbid: string
  title: string
  type: ReleaseType
  releaseDate: string // ISO date (LocalDate côté backend)
  artistId: string
  artistName: string
  role: ArtistRole
}

/** Utilisateur listé dans l'espace admin — GET /api/admin/users */
export interface AdminUser {
  id: string
  email: string
  role: Role
  followedCount: number
  createdAt: string // ISO date-time
}

/** Claims lues dans le JWT (sub = email, role custom). */
export interface JwtClaims {
  sub: string
  role?: Role
  exp: number
  iat?: number
}
