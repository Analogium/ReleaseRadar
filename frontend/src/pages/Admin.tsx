import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Mail, RefreshCw, Users } from 'lucide-react'
import type { AdminUser, Artist } from '@/lib/types'
import { api, apiErrorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/toast/useToast'
import AsyncActionButton from '@/components/admin/AsyncActionButton'
import AdminUserRow from '@/components/admin/AdminUserRow'
import EmptyState from '@/components/EmptyState'

const USER_SKELETONS = ['u1', 'u2', 'u3', 'u4']

export default function Admin() {
  const { user } = useAuth()
  const toast = useToast()
  const artists = useApi<Artist[]>('/admin/artists')

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

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

  const changeRole = useCallback(
    async (target: AdminUser) => {
      const nextRole = target.role === 'ADMIN' ? 'USER' : 'ADMIN'
      try {
        const { data } = await api.patch<AdminUser>(`/admin/users/${target.id}/role`, {
          role: nextRole,
        })
        setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
        toast.success(`${data.email} est maintenant ${data.role}`)
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Changement de rôle impossible'))
      }
    },
    [toast],
  )

  const deleteUser = useCallback(
    async (target: AdminUser) => {
      try {
        await api.delete(`/admin/users/${target.id}`)
        setUsers((prev) => prev.filter((u) => u.id !== target.id))
        toast.success(`Compte ${target.email} supprimé`)
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Suppression impossible'))
      }
    },
    [toast],
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <h1 className="text-content text-3xl font-bold">Admin</h1>
        <p className="text-content-subtle mt-1">Gestion des utilisateurs et synchronisation.</p>
      </header>

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
            onSuccess={() => toast.success('Synchronisation globale terminée')}
            onError={toast.error}
            icon={RefreshCw}
            className="gradient-brand text-white hover:opacity-95"
          >
            Sync now (global)
          </AsyncActionButton>
          <AsyncActionButton
            onAction={() => api.post('/admin/test-email').then(() => undefined)}
            onSuccess={() => toast.success('Email de test envoyé')}
            onError={toast.error}
            icon={Mail}
            className="bg-surface-2 hover:bg-surface-3 text-content"
          >
            Send test email
          </AsyncActionButton>
        </div>

        <div className="mt-6">
          <h3 className="text-content-muted mb-3 text-sm font-semibold">Sync par artiste</h3>
          {artists.loading && (
            <ul className="flex flex-col gap-2">
              {['sa1', 'sa2', 'sa3'].map((key) => (
                <li
                  key={key}
                  className="border-line bg-surface-2 flex animate-pulse items-center gap-3 rounded-lg border px-4 py-2.5"
                >
                  <div className="bg-surface-3 h-4 flex-1 rounded" />
                  <div className="bg-surface-3 h-7 w-16 rounded-lg" />
                </li>
              ))}
            </ul>
          )}
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
                    onSuccess={() => toast.success(`Sync de ${artist.name} terminée`)}
                    onError={toast.error}
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

        {usersLoading && (
          <div className="flex flex-col gap-3">
            {USER_SKELETONS.map((key) => (
              <div
                key={key}
                className="border-line flex animate-pulse items-center gap-4 border-b pb-3 last:border-0"
              >
                <div className="bg-surface-2 h-4 flex-1 rounded" />
                <div className="bg-surface-2 h-4 w-16 rounded" />
                <div className="bg-surface-2 h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        )}

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
