import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders the title, message and action', () => {
    render(
      <EmptyState
        icon={Users}
        title="Rien ici"
        message="Aucun élément"
        action={<button type="button">Agir</button>}
      />,
    )

    expect(screen.getByText('Rien ici')).toBeInTheDocument()
    expect(screen.getByText('Aucun élément')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agir' })).toBeInTheDocument()
  })

  it('omits the message when not provided', () => {
    render(<EmptyState icon={Users} title="Vide" />)
    expect(screen.getByText('Vide')).toBeInTheDocument()
  })
})
