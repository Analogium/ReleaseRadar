import { beforeEach, describe, expect, it } from 'vitest'
import { clearToken, decodeToken, getToken, isTokenValid, setToken } from './token'
import { epochInSeconds, makeToken } from '@/test/makeToken'

describe('token storage', () => {
  beforeEach(() => localStorage.clear())

  it('stores, reads and clears the token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('decodeToken', () => {
  it('decodes the JWT payload claims', () => {
    const token = makeToken({ sub: 'a@b.com', role: 'ADMIN', exp: epochInSeconds(3600) })
    expect(decodeToken(token)).toMatchObject({ sub: 'a@b.com', role: 'ADMIN' })
  })

  it('returns null for a malformed token', () => {
    expect(decodeToken('not-a-jwt')).toBeNull()
  })
})

describe('isTokenValid', () => {
  it('is true for a non-expired token', () => {
    expect(isTokenValid(makeToken({ sub: 'x', exp: epochInSeconds(3600) }))).toBe(true)
  })

  it('is false for an expired token', () => {
    expect(isTokenValid(makeToken({ sub: 'x', exp: epochInSeconds(-10) }))).toBe(false)
  })

  it('is false for null or garbage', () => {
    expect(isTokenValid(null)).toBe(false)
    expect(isTokenValid('garbage')).toBe(false)
  })
})
