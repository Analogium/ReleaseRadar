import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatReleaseDate, isRecentRelease } from './format'

describe('formatReleaseDate', () => {
  it('formats an ISO date to a readable French string', () => {
    const out = formatReleaseDate('2023-10-24')
    expect(out).toMatch(/2023/)
    expect(out).not.toBe('2023-10-24')
  })

  it('returns the input untouched when it is not a date', () => {
    expect(formatReleaseDate('not-a-date')).toBe('not-a-date')
  })
})

describe('isRecentRelease', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('is true within the default 30-day window', () => {
    expect(isRecentRelease('2026-01-10')).toBe(true)
  })

  it('is false for a date older than the window', () => {
    expect(isRecentRelease('2025-06-10')).toBe(false)
  })

  it('is false for a future date', () => {
    expect(isRecentRelease('2026-02-10')).toBe(false)
  })

  it('is false for an invalid date', () => {
    expect(isRecentRelease('nope')).toBe(false)
  })
})
