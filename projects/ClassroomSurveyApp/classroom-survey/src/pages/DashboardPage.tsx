import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// Phase 3 only: the survey dashboard itself will be built in Phase 4.
export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogout() {
    setError(null)
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to log out.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-semibold text-blue-700">Classroom Survey</p><h1 className="mt-1 text-3xl font-bold">Dashboard</h1></div>
          <button onClick={handleLogout} disabled={signingOut} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 font-medium hover:bg-slate-100 disabled:opacity-60">{signingOut ? 'Logging out...' : 'Logout'}</button>
        </header>
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Signed in as <strong>{user?.email ?? 'Instructor'}</strong></p>
          <p className="mt-3 text-slate-600">Authentication is ready. Survey management will be added in Phase 4.</p>
          {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
        </section>
      </div>
    </main>
  )
}
