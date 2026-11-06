import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { user, loading, error: configError, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const destination = typeof location.state?.from === 'string' && location.state.from.startsWith('/') && !location.state.from.startsWith('//')
    ? location.state.from : '/dashboard'

  if (loading) return <main className="p-8" role="status">Checking your session...</main>
  if (user) return <Navigate to={destination} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(destination, { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to log in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link to="/" className="text-sm font-semibold text-blue-700 hover:underline">Classroom Survey</Link>
        <h1 className="mt-6 text-3xl font-bold">Instructor Login</h1>
        <p className="mt-2 text-slate-600">Sign in with your instructor account.</p>
        {(configError || error) && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{configError || error}</p>}
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} disabled={submitting || !!configError} className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus:border-blue-600" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={submitting || !!configError} className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus:border-blue-600" />
          </div>
          <button type="submit" disabled={submitting || !!configError} className="min-h-12 w-full rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Signing in...' : 'Log In'}</button>
        </form>
      </section>
    </main>
  )
}
