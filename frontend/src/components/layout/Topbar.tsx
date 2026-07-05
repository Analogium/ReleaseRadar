import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Settings } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import MobileNav from './MobileNav'

export default function Topbar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  function onSearch(event: FormEvent) {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/discovery?q=${encodeURIComponent(q)}` : '/discovery')
  }

  return (
    <header className="border-line bg-bg/80 sticky top-0 z-10 flex items-center gap-4 border-b px-6 py-4 backdrop-blur">
      <MobileNav />
      <form onSubmit={onSearch} className="relative w-full max-w-xl">
        <Search className="text-content-subtle pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, albums, or genres…"
          className="bg-surface border-line text-content placeholder:text-content-subtle focus:border-accent w-full rounded-full border py-2.5 pr-4 pl-10 text-sm transition-colors outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          className="text-content-subtle hover:text-content"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="text-content-subtle hover:text-content"
          aria-label="Paramètres"
        >
          <Settings className="h-5 w-5" />
        </button>
        <div
          className="gradient-brand flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          title={user?.email}
        >
          {user?.email.charAt(0).toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  )
}
