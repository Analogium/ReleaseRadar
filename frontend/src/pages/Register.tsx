import { Link } from 'react-router-dom'

// Placeholder — le vrai écran « Join the Radar » câblé à /api/auth/register arrive en 10.2.
export default function Register() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="border-line bg-surface w-full max-w-md rounded-2xl border p-8 shadow-[var(--shadow-ambient)]">
        <div className="gradient-brand mx-auto mb-6 h-10 w-10 rounded-full" />
        <h1 className="text-content text-center text-3xl font-bold">Join the Radar</h1>
        <p className="text-content-subtle mt-2 text-center text-sm">
          Your gateway to the freshest releases.
        </p>
        <button
          type="button"
          className="gradient-brand mt-8 w-full rounded-full py-3 font-semibold text-white"
        >
          Create Account
        </button>
        <p className="text-content-subtle mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
