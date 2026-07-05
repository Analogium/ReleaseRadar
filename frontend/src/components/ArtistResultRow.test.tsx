import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ArtistSearchResult } from '@/lib/types'
import { ToastProvider } from '@/components/toast/ToastProvider'
import ArtistResultRow from './ArtistResultRow'

const RESULT: ArtistSearchResult = { mbid: 'mb-1', name: 'Radiohead', disambiguation: null }

function renderRow(overrides: {
  followedId: string | undefined
  onFollow: (mbid: string, name: string) => Promise<void>
  onUnfollow: (id: string) => Promise<void>
}) {
  return render(
    <ToastProvider>
      <ArtistResultRow result={RESULT} {...overrides} />
    </ToastProvider>,
  )
}

describe('ArtistResultRow', () => {
  it('shows "Follow" and calls onFollow when the artist is not followed', async () => {
    const onFollow = vi.fn().mockResolvedValue(undefined)
    const onUnfollow = vi.fn().mockResolvedValue(undefined)
    renderRow({ followedId: undefined, onFollow, onUnfollow })

    const button = screen.getByRole('button', { name: /^Follow$/i })
    await userEvent.click(button)

    expect(onFollow).toHaveBeenCalledWith('mb-1', 'Radiohead')
    expect(onUnfollow).not.toHaveBeenCalled()
  })

  it('shows "Following" and calls onUnfollow when the artist is followed', async () => {
    const onFollow = vi.fn().mockResolvedValue(undefined)
    const onUnfollow = vi.fn().mockResolvedValue(undefined)
    renderRow({ followedId: 'artist-1', onFollow, onUnfollow })

    const button = screen.getByRole('button', { name: /Following/i })
    await userEvent.click(button)

    expect(onUnfollow).toHaveBeenCalledWith('artist-1')
    expect(onFollow).not.toHaveBeenCalled()
  })
})
