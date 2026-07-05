/** Fabrique un JWT non signé (header.payload.signature) pour les tests — seul le payload compte. */
function base64url(value: unknown): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function makeToken(payload: Record<string, unknown>): string {
  const header = base64url({ alg: 'HS256', typ: 'JWT' })
  return `${header}.${base64url(payload)}.signature`
}

/** Timestamp (secondes) décalé de `seconds` par rapport à maintenant — pour `exp`. */
export function epochInSeconds(offsetSeconds = 0): number {
  return Math.floor(Date.now() / 1000) + offsetSeconds
}
