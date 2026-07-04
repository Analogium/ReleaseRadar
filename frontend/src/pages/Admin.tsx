import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Mail, RefreshCw, Users, X } from 'lucide-react'
import type { AdminUser, Artist } from '@/lib/types'
import { api, apiErrorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { useAuth } from '@/auth/useAuth'
import AsyncActionButton from '@/components/admin/AsyncActionButton'
import AdminUserRow from '@/components/admin/AdminUserRow'
import EmptyState from '@/components/EmptyState'

export default function Admin() {
  const { user } = useAuth()
  const artists = useApi<Artist[]>('/admin/artists')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const { data } = await api.get<AdminUser[]>('/admin/users')
      setUsers(data)
    } catch (err) {
      setUsersError(apiErrorMessage(err, 'Impossible de charger les utilisateurs'))
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const changeRole = useCallback(async (target: AdminUser) => {
    const nextRole = target.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const { data } = await api.patch<AdminUser>(`/admin/users/${target.id}/role`, {
      role: nextRole,
    })
    setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
  }, [])

  const deleteUser = useCallback(async (target: AdminUser) => {
    await api.delete(`/admin/users/${target.id}`)
    setUsers((prev) => prev.filter((u) => u.id !== target.id))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <h1 className="text-content text-3xl font-bold">Admin</h1>
        <p className="text-content-subtle mt-1">Gestion des utilisateurs et synchronisation.</p>
      </header>

      {banner && (
        <div className="border-danger/30 bg-danger/10 text-danger mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{banner}</span>
          <button type="button" onClick={() => setBanner(null)} aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Synchronisation */}
      <section className="border-line bg-surface mb-10 rounded-[var(--radius-card)] border p-6">
        <h2 className="text-content text-lg font-bold">Synchronisation</h2>
        <p className="text-content-subtle mt-1 text-sm">
          Récupère les dernières sorties depuis MusicBrainz. La sync globale peut prendre un moment
          (≈ 1 s par artiste).
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <AsyncActionButton
            onAction={() => api.post('/admin/sync').then(() => undefined)}
            onError={setBanner}
            icon={RefreshCw}
            className="gradient-brand text-white hover:opacity-95"
          >
            Sync now (global)
          </AsyncActionButton>
          <AsyncActionButton
            onAction={() => api.post('/admin/test-email').then(() => undefined)}
            onError={setBanner}
            icon={Mail}
            className="bg-surface-2 hover:bg-surface-3 text-content"
          >
            Send test email
          </AsyncActionButton>
        </div>

        <div className="mt-6">
          <h3 className="text-content-muted mb-3 text-sm font-semibold">Sync par artiste</h3>
          {artists.loading && <p className="text-content-subtle text-sm">Chargement…</p>}
          {!artists.loading && artists.error && (
            <p className="text-danger text-sm">{artists.error}</p>
          )}
          {!artists.loading && !artists.error && artists.data?.length === 0 && (
            <p className="text-content-subtle text-sm">Aucun artiste dans la base.</p>
          )}
          {!artists.loading && !artists.error && artists.data && artists.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {artists.data.map((artist) => (
                <li
                  key={artist.id}
                  className="border-line bg-surface-2 flex items-center gap-3 rounded-lg border px-4 py-2.5"
                >
                  <span className="text-content min-w-0 flex-1 truncate text-sm font-medium">
                    {artist.name}
                  </span>
                  <AsyncActionButton
                    onAction={() =>
                      api.post(`/admin/artists/${artist.id}/sync`).then(() => undefined)
                    }
                    onError={setBanner}
                    icon={RefreshCw}
                    className="bg-surface-3 text-content-muted hover:text-content px-3 py-1.5 text-xs"
                  >
                    Sync
                  </AsyncActionButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Utilisateurs */}
      <section className="border-line bg-surface rounded-[var(--radius-card)] border p-6">
        <h2 className="text-content mb-4 text-lg font-bold">Utilisateurs</h2>

        {usersLoading && <p className="text-content-subtle text-sm">Chargement…</p>}

        {!usersLoading && usersError && (
          <EmptyState
            icon={AlertTriangle}
            title="Chargement impossible"
            message={usersError}
            action={
              <button
                type="button"
                onClick={loadUsers}
                className="bg-surface-2 hover:bg-surface-3 text-content rounded-lg px-4 py-2 text-sm font-medium transition"
              >
                Réessayer
              </button>
            }
          />
        )}

        {!usersLoading && !usersError && users.length === 0 && (
          <EmptyState icon={Users} title="Aucun utilisateur" />
        )}

        {!usersLoading && !usersError && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="text-content-subtle border-line border-b text-xs uppercase">
                  <th className="px-4 py-2 font-semibold">Email</th>
                  <th className="px-4 py-2 font-semibold">Rôle</th>
                  <th className="px-4 py-2 font-semibold">Suivis</th>
                  <th className="px-4 py-2 font-semibold">Inscrit le</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <AdminUserRow
                    key={u.id}
                    user={u}
                    isSelf={u.email === user?.email}
                    onChangeRole={changeRole}
                    onDelete={deleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
