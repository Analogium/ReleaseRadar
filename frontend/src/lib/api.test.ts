import { describe, expect, it } from 'vitest'
import { apiErrorMessage } from './api'

describe('apiErrorMessage', () => {
  it('reads the "error" field from an axios error response', () => {
    const err: unknown = {
      isAxiosError: true,
      message: 'req',
      response: { data: { error: 'Boom' } },
    }
    expect(apiErrorMessage(err)).toBe('Boom')
  })

  it('falls back to the "message" field of the response body', () => {
    const err: unknown = {
      isAxiosError: true,
      message: 'req',
      response: { data: { message: 'Detailed message' } },
    }
    expect(apiErrorMessage(err)).toBe('Detailed message')
  })

  it('returns the provided fallback for a non-axios error', () => {
    expect(apiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback')
  })
})
