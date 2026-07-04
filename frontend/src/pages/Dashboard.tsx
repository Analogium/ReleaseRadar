import { LogOut } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

// Placeholder — le vrai dashboard (étape 10.4) affichera les sorties et artistes suivis.
export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <p className="text-accent text-xs font-bold tracking-widest uppercase">Curated for you</p>
        <button
          onClick={logout}
          className="text-content-subtle hover:text-content flex items-center gap-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      <h1 className="mt-2 text-5xl font-extrabold tracking-tight">
        Weekend Discovery <span className="text-gradient-brand">Radar</span>
      </h1>
      <p className="text-content-muted mt-4">
        Connecté en tant que <span className="text-content font-medium">{user?.email}</span>.
      </p>
      <p className="text-content-subtle mt-2 text-sm">
        Placeholder du dashboard — branché sur l&apos;API à l&apos;étape 10.4.
      </p>
    </div>
  )
}
