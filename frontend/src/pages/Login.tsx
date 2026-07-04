import { Link } from 'react-router-dom'

// Placeholder — le vrai écran « Welcome Back » câblé à /api/auth/login arrive en 10.2.
export default function Login() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="border-line bg-surface w-full max-w-md rounded-2xl border p-8 shadow-[var(--shadow-ambient)]">
        <div className="gradient-brand mx-auto mb-6 h-10 w-10 rounded-full" />
        <h1 className="text-content text-center text-3xl font-bold">Welcome Back</h1>
        <p className="text-content-subtle mt-2 text-center text-sm">
          Your sonic journey continues here.
        </p>
        <button
          type="button"
          className="gradient-brand mt-8 w-full rounded-full py-3 font-semibold text-white"
        >
          Log in
        </button>
        <p className="text-content-subtle mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
