import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'
import { epochInSeconds, makeToken } from '@/test/makeToken'

function Probe() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  return (
    <>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
    </>
  )
}

function renderWithToken(token?: string) {
  if (token) localStorage.setItem('rr_token', token)
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => localStorage.clear())

  it('is unauthenticated when no token is stored', () => {
    renderWithToken()
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
    expect(screen.getByTestId('admin')).toHaveTextContent('false')
    expect(screen.getByTestId('email')).toHaveTextContent('none')
  })

  it('exposes the email and isAdmin=true for an ADMIN token', () => {
    renderWithToken(makeToken({ sub: 'a@b.com', role: 'ADMIN', exp: epochInSeconds(3600) }))
    expect(screen.getByTestId('email')).toHaveTextContent('a@b.com')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(screen.getByTestId('admin')).toHaveTextContent('true')
  })

  it('exposes isAdmin=false for a USER token', () => {
    renderWithToken(makeToken({ sub: 'u@b.com', role: 'USER', exp: epochInSeconds(3600) }))
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(screen.getByTestId('admin')).toHaveTextContent('false')
  })

  it('ignores an expired token', () => {
    renderWithToken(makeToken({ sub: 'x@b.com', role: 'ADMIN', exp: epochInSeconds(-10) }))
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })
})
