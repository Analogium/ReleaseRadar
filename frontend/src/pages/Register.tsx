import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/AuthLayout'
import TextField from '@/components/TextField'
import Button from '@/components/Button'
import { useAuth } from '@/auth/useAuth'
import { apiErrorMessage } from '@/lib/api'

const MIN_PASSWORD_LENGTH = 8

export default function Register() {
  const { register, resendVerification } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resent, setResent] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`)
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      setSubmitted(true)
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de créer le compte.'))
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    setResent(true)
    try {
      await resendVerification(email)
    } catch {
      // Réponse volontairement uniforme côté backend : rien de plus à signaler.
    }
  }

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="One last step to activate your account."
        footer={
          <>
            Already confirmed?{' '}
            <Link to="/login" className="text-accent font-semibold">
              Log in
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <MailCheck className="text-accent mx-auto h-12 w-12" />
          <p className="text-content-subtle text-sm">
            Nous avons envoyé un lien de confirmation à{' '}
            <span className="text-content font-semibold">{email}</span>. Clique dessus pour activer
            ton compte (le lien expire dans 24 heures).
          </p>
          <p className="text-content-subtle text-sm">
            Rien reçu ? Vérifie tes spams, ou{' '}
            <button
              type="button"
              onClick={onResend}
              disabled={resent}
              className="text-accent font-semibold disabled:opacity-60"
            >
              renvoie l'email
            </button>
            .
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Join the Radar"
      subtitle="Your gateway to the freshest releases."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
        />
        <TextField
          id="confirm"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <label className="text-content-subtle flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="accent-accent mt-0.5"
          />
          <span>
            I agree to the <span className="text-accent">Terms of Service</span> and{' '}
            <span className="text-accent">Privacy Policy</span>
          </span>
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={loading} disabled={!agree}>
          Create Account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  )
}
