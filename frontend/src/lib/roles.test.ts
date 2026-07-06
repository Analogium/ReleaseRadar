import { describe, expect, it } from 'vitest'
import { dedupeByMbid, filterReleasesByRole } from './roles'
import type { ArtistRole, Release } from './types'

function rel(mbid: string, role: ArtistRole): Release {
  return {
    id: `${mbid}-${role}`,
    mbid,
    title: 'T',
    type: 'SINGLE',
    releaseDate: '2024-01-01',
    artistId: 'a',
    artistName: 'A',
    role,
  }
}

describe('filterReleasesByRole', () => {
  const list = [rel('1', 'PRIMARY'), rel('2', 'COLLABORATION'), rel('3', 'FEATURING')]

  it('returns everything for the ALL filter', () => {
    expect(filterReleasesByRole(list, 'ALL')).toHaveLength(3)
  })

  it('keeps only releases matching the selected role', () => {
    expect(filterReleasesByRole(list, 'FEATURING').map((r) => r.mbid)).toEqual(['3'])
  })
})

describe('dedupeByMbid', () => {
  it('keeps the first occurrence of each mbid', () => {
    const out = dedupeByMbid([rel('1', 'PRIMARY'), rel('1', 'FEATURING'), rel('2', 'PRIMARY')])
    expect(out.map((r) => r.mbid)).toEqual(['1', '2'])
    expect(out[0].role).toBe('PRIMARY')
  })
})
