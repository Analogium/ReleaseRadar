import { useState } from 'react'
import { Loader2, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import type { AdminUser } from '@/lib/types'
import { formatReleaseDate } from '@/lib/format'

interface AdminUserRowProps {
  user: AdminUser
  isSelf: boolean
  onChangeRole: (user: AdminUser) => Promise<void>
  onDelete: (user: AdminUser) => Promise<void>
}

export default function AdminUserRow({ user, isSelf, onChangeRole, onDelete }: AdminUserRowProps) {
  const [roleP, setRoleP] = useState(false)
  const [deleteP, setDeleteP] = useState(false)

  const isAdmin = user.role === 'ADMIN'

  async function toggleRole() {
    setRoleP(true)
    try {
      await onChangeRole(user)
    } finally {
      setRoleP(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Supprimer le compte ${user.email} ? Cette action est irréversible.`))
      return
    setDeleteP(true)
    try {
      await onDelete(user)
    } finally {
      setDeleteP(false)
    }
  }

  return (
    <tr className="border-line border-b last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-content font-medium">{user.email}</span>
          {isSelf && (
            <span className="bg-surface-3 text-content-subtle rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
              vous
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
            isAdmin ? 'bg-violet/15 text-violet' : 'bg-surface-3 text-content-muted'
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="text-content-muted px-4 py-3 text-sm">{user.followedCount}</td>
      <td className="text-content-subtle px-4 py-3 text-sm">{formatReleaseDate(user.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleRole}
            disabled={isSelf || roleP}
            title={isSelf ? 'Vous ne pouvez pas changer votre propre rôle' : undefined}
            className="text-content-subtle hover:text-content flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {roleP ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAdmin ? (
              <ShieldOff className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {isAdmin ? 'Rétrograder' : 'Promouvoir'}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={isSelf || deleteP}
            title={isSelf ? 'Vous ne pouvez pas supprimer votre propre compte' : undefined}
            className="text-content-subtle hover:text-danger flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleteP ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  )
}
