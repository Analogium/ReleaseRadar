import type { ArtistRole, Release } from './types'

/** Filtre par rôle utilisé par les onglets (inclut « Tout »). */
export type RoleFilter = 'ALL' | ArtistRole

/** Libellés d'onglet (pluriel). */
export const ROLE_TAB_LABEL: Record<RoleFilter, string> = {
  ALL: 'Tout',
  PRIMARY: 'Solo',
  COLLABORATION: 'Collaborations',
  FEATURING: 'Featurings',
}

/** Libellé court pour le badge sur une carte (vide pour une sortie solo). */
export const ROLE_BADGE_LABEL: Record<ArtistRole, string> = {
  PRIMARY: '',
  COLLABORATION: 'Collab',
  FEATURING: 'Feat.',
}

/** Filtre une liste de sorties selon le rôle sélectionné. */
export function filterReleasesByRole<T extends { role: ArtistRole }>(
  releases: T[],
  filter: RoleFilter,
): T[] {
  return filter === 'ALL' ? releases : releases.filter((r) => r.role === filter)
}

/** Déduplique par `mbid` (une collaboration entre deux artistes suivis n'apparaît qu'une fois). */
export function dedupeByMbid(releases: Release[]): Release[] {
  const seen = new Set<string>()
  return releases.filter((r) => (seen.has(r.mbid) ? false : seen.add(r.mbid)))
}
