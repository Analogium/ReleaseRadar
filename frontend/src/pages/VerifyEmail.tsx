import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import AuthLayout from '@/components/AuthLayout'
import { api, apiErrorMessage } from '@/lib/api'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  // Garde contre le double-montage de StrictMode : le token est à usage unique,
  // un second POST le verrait déjà consommé et renverrait une erreur.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!token) {
      setStatus('error')
      setMessage('Lien de vérification invalide.')
      return
    }

    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(apiErrorMessage(err, 'Ce lien est invalide ou a expiré.'))
      })
  }, [token])

  return (
    <AuthLayout
      title="Email verification"
      subtitle="Activating your account."
      footer={
        <Link to="/login" className="text-accent font-semibold">
          Go to login
        </Link>
      }
    >
      <div className="space-y-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="text-accent mx-auto h-12 w-12 animate-spin" />
            <p className="text-content-subtle text-sm">Vérification en cours…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="text-accent mx-auto h-12 w-12" />
            <p className="text-content-subtle text-sm">
              Ton adresse est confirmée. Tu peux maintenant te connecter.
            </p>
            <Link
              to="/login"
              className="gradient-brand inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-95"
            >
              Log in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="text-danger mx-auto h-12 w-12" />
            <p className="text-content-subtle text-sm">{message}</p>
            <p className="text-content-subtle text-sm">
              Ton lien a peut-être expiré. Reconnecte-toi pour en recevoir un nouveau.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
