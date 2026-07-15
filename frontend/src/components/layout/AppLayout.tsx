import { Outlet } from 'react-router-dom'
import Seo from '@/components/Seo'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

/** Shell des routes protégées : sidebar + topbar + contenu. */
export default function AppLayout() {
  return (
    <div className="flex min-h-svh">
      {/* Espace privé : jamais indexé (doublé par robots.txt). */}
      <Seo title="Mon espace · Release Radar" noindex />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
