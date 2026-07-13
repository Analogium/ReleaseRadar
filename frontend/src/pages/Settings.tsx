import { type FormEvent, type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Download, KeyRound, Mail, Trash2 } from 'lucide-react'
import type { AccountExport, MeProfile } from '@/lib/types'
import { api, apiErrorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/toast/useToast'
import TextField from '@/components/TextField'
import Button from '@/components/Button'

const MIN_PASSWORD_LENGTH = 8

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-line bg-surface rounded-[var(--radius-card)] border p-6">
      <h2 className="text-content text-lg font-bold">{title}</h2>
      {description && <p className="text-content-subtle mt-1 text-sm">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function Settings() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const profile = useApi<MeProfile>('/me')

  // --- Changement d'email ---
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // --- Changement de mot de passe ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // --- Export ---
  const [exporting, setExporting] = useState(false)

  // --- Suppression (double confirmation) ---
  const [deleteArmed, setDeleteArmed] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function onChangeEmail(event: FormEvent) {
    event.preventDefault()
    setEmailLoading(true)
    try {
      const { data } = await api.patch<{ message: string }>('/me/email', {
        newEmail,
        currentPassword: emailPassword,
      })
      toast.success(data.message)
      setNewEmail('')
      setEmailPassword('')
      profile.reload()
    } catch (err) {
      toast.error(apiErrorMessage(err, "Impossible de changer l'email"))
    } finally {
      setEmailLoading(false)
    }
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault()
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setPasswordLoading(true)
    try {
      await api.patch('/me/password', { currentPassword, newPassword })
      toast.success('Mot de passe mis à jour. Vos autres sessions ont été déconnectées.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Impossible de changer le mot de passe'))
    } finally {
      setPasswordLoading(false)
    }
  }

  async function onExport() {
    setExporting(true)
    try {
      const { data } = await api.get<AccountExport>('/me/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'release-radar-export.json'
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Export téléchargé.')
    } catch (err) {
      toast.error(apiErrorMessage(err, "Impossible d'exporter les données"))
    } finally {
      setExporting(false)
    }
  }

  async function onDelete() {
    setDeleteLoading(true)
    try {
      await api.delete('/me', { data: { currentPassword: deletePassword } })
      toast.success('Compte supprimé. Au revoir 👋')
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Suppression impossible'))
      setDeleteLoading(false)
    }
  }

  const canDelete =
    deleteConfirmEmail.trim().toLowerCase() === (user?.email ?? '').toLowerCase() &&
    deletePassword.length > 0

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <h1 className="text-content text-3xl font-bold">Account settings</h1>
        <p className="text-content-subtle mt-1">Gérez votre compte, vos données et vos accès.</p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Infos du compte */}
        <Section title="Mon compte">
          {profile.loading && <p className="text-content-subtle text-sm">Chargement…</p>}
          {!profile.loading && profile.error && (
            <p className="text-danger text-sm">{profile.error}</p>
          )}
          {!profile.loading && profile.data && (
            <dl className="text-sm">
              <div className="border-line flex justify-between border-b py-2">
                <dt className="text-content-subtle">Email</dt>
                <dd className="text-content font-medium">{profile.data.email}</dd>
              </div>
              <div className="border-line flex justify-between border-b py-2">
                <dt className="text-content-subtle">Email vérifié</dt>
                <dd className="text-content font-medium">
                  {profile.data.emailVerified ? 'Oui' : 'Non'}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-content-subtle">Membre depuis</dt>
                <dd className="text-content font-medium">
                  {new Date(profile.data.createdAt).toLocaleDateString('fr-FR')}
                </dd>
              </div>
            </dl>
          )}
        </Section>

        {/* Changer d'email */}
        <Section
          title="Changer d'adresse email"
          description="Un lien de confirmation sera envoyé à la nouvelle adresse. Le compte reste inactif jusqu'à sa validation."
        >
          <form onSubmit={onChangeEmail} className="space-y-4" noValidate>
            <TextField
              id="new-email"
              label="Nouvelle adresse email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
            <TextField
              id="email-password"
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              icon={<KeyRound className="h-4 w-4" />}
            />
            <Button type="submit" loading={emailLoading} className="sm:w-auto sm:px-6">
              Mettre à jour l'email
            </Button>
          </form>
        </Section>

        {/* Changer de mot de passe */}
        <Section
          title="Changer de mot de passe"
          description="Vos autres sessions seront déconnectées."
        >
          <form onSubmit={onChangePassword} className="space-y-4" noValidate>
            <TextField
              id="current-password"
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<KeyRound className="h-4 w-4" />}
            />
            <TextField
              id="new-password"
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<KeyRound className="h-4 w-4" />}
            />
            <TextField
              id="confirm-password"
              label="Confirmer le nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<KeyRound className="h-4 w-4" />}
            />
            <Button type="submit" loading={passwordLoading} className="sm:w-auto sm:px-6">
              Changer le mot de passe
            </Button>
          </form>
        </Section>

        {/* Export des données */}
        <Section
          title="Mes données"
          description="Téléchargez une copie de vos données personnelles au format JSON (RGPD — droit d'accès et portabilité)."
        >
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="bg-surface-2 hover:bg-surface-3 text-content flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Export…' : 'Exporter mes données'}
          </button>
        </Section>

        {/* Zone de danger */}
        <section className="border-danger/40 bg-danger/5 rounded-[var(--radius-card)] border p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-danger h-5 w-5" />
            <h2 className="text-content text-lg font-bold">Supprimer mon compte</h2>
          </div>
          <p className="text-content-subtle mt-1 text-sm">
            Cette action est <strong>irréversible</strong>. Votre compte, vos abonnements et vos
            données personnelles seront définitivement supprimés (RGPD — droit à l'effacement).
          </p>

          {!deleteArmed ? (
            <button
              type="button"
              onClick={() => setDeleteArmed(true)}
              className="border-danger/50 text-danger hover:bg-danger/10 mt-4 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </button>
          ) : (
            <div className="mt-4 space-y-4">
              <TextField
                id="delete-confirm-email"
                label={`Saisissez votre email (${user?.email ?? ''}) pour confirmer`}
                type="email"
                autoComplete="off"
                placeholder={user?.email ?? ''}
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
              />
              <TextField
                id="delete-password"
                label="Mot de passe actuel"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                icon={<KeyRound className="h-4 w-4" />}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={!canDelete || deleteLoading}
                  className="bg-danger flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteLoading ? 'Suppression…' : 'Supprimer définitivement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteArmed(false)
                    setDeleteConfirmEmail('')
                    setDeletePassword('')
                  }}
                  className="text-content-subtle hover:text-content px-5 py-2.5 text-sm font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
