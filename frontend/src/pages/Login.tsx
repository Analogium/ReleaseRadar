import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthLayout from '@/components/AuthLayout'
import TextField from '@/components/TextField'
import Button from '@/components/Button'
import { useAuth } from '@/auth/useAuth'
import { apiErrorMessage } from '@/lib/api'
import Seo from '@/components/Seo'

export default function Login() {
  const { login, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Renseigné quand le login échoue car l'email n'est pas encore vérifié (403).
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resent, setResent] = useState(false)

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard'

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setResent(false)
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Email ou mot de passe invalide.'))
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setNeedsVerification(true)
      }
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

  return (
    <>
      <Seo
        title="Connexion · Release Radar"
        description="Connectez-vous à votre compte Release Radar pour suivre les nouvelles sorties de vos artistes."
        path="/login"
      />
      <AuthLayout
        title="Welcome Back"
        subtitle="Your sonic journey continues here."
        footer={
          <>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent font-semibold">
              Create account
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
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-content-subtle hover:text-content"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          {needsVerification &&
            (resent ? (
              <p className="text-content-subtle text-sm">
                Si un compte non vérifié existe pour cette adresse, un nouveau lien vient d'être
                envoyé.
              </p>
            ) : (
              <button
                type="button"
                onClick={onResend}
                className="text-accent text-sm font-semibold"
              >
                Renvoyer l'email de confirmation
              </button>
            ))}

          <Button type="submit" loading={loading} className="mt-2">
            Log in <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </AuthLayout>
    </>
  )
}
