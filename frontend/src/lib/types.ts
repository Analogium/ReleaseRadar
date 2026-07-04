// Types miroir des DTO du backend (voir ROADMAP.md § Étape 10 — Contrat d'API).

export type ReleaseType = 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION' | 'LIVE' | 'OTHER'

export interface AuthResponse {
  token: string
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
  artistName: string
}

/** Claims lues dans le JWT (sub = email, role custom). */
export interface JwtClaims {
  sub: string
  role?: string
  exp: number
  iat?: number
}
