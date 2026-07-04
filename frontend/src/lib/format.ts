/** Formate une date ISO (YYYY-MM-DD) en français court, ex. « 24 oct. 2023 ». */
export function formatReleaseDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Vrai si la date est dans les `days` derniers jours (pour le badge « NEW »). */
export function isRecentRelease(iso: string, days = 30): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  const diff = Date.now() - date.getTime()
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000
}
