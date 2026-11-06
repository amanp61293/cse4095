import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { activateSurvey, closeSurvey } from '../lib/activation'

type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived'
type Survey = {
  id: string
  title: string
  description: string | null
  status: SurveyStatus
  created_at: string
}
type StatusFilter = 'all' | SurveyStatus

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Draft', active: 'Active', closed: 'Closed', archived: 'Archived',
}

const statusStyles: Record<SurveyStatus, string> = {
  draft: 'bg-slate-100 text-slate-800',
  active: 'bg-emerald-100 text-emerald-900',
  closed: 'bg-amber-100 text-amber-900',
  archived: 'bg-violet-100 text-violet-900',
}

function formatCreatedAt(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(parsed)
}

function getErrorMessage(caught: unknown, fallback: string) {
  // Avoid displaying raw database exceptions or internal details to the user.
  if (caught instanceof Error && caught.message === 'NOT_CONFIGURED') {
    return 'Supabase is not configured. Add the project URL and public key to your .env file.'
  }
  return fallback
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const loadSurveys = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      if (!supabase) throw new Error('NOT_CONFIGURED')
      const { data, error: fetchError } = await supabase
        .from('surveys')
        .select('id,title,description,status,created_at')
        .order('created_at', { ascending: false })
      if (fetchError) throw fetchError
      setSurveys((data ?? []) as Survey[])
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not load surveys. Check your connection and instructor permissions, then try again.'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void loadSurveys(true) }, [loadSurveys])

  const visibleSurveys = useMemo(() => surveys.filter((survey) =>
    (statusFilter === 'all' || survey.status === statusFilter) &&
    survey.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  ), [surveys, search, statusFilter])

  async function handleArchive(survey: Survey) {
    if (survey.status === 'active') return
    if (!window.confirm(`Archive "${survey.title}"? The survey and its responses will be kept, but the survey will no longer be available as a draft or closed survey.`)) return
    setPendingId(survey.id)
    setError(null)
    setNotice(null)
    try {
      if (!supabase) throw new Error('NOT_CONFIGURED')
      const { data, error: updateError } = await supabase
        .from('surveys')
        .update({ status: 'archived' })
        .eq('id', survey.id)
        .eq('status', survey.status)
        .select('id')
      if (updateError) throw updateError
      if (!data?.length) throw new Error('STALE_SURVEY')
      await loadSurveys()
      setNotice(`Archived "${survey.title}". Its historical responses were preserved.`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to archive this survey. It may have changed. Refresh and try again.'))
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(survey: Survey) {
    if (survey.status === 'active') return
    if (!window.confirm(`Permanently delete "${survey.title}"? This also deletes every question, choice, response, and answer associated with it. This cannot be undone. Consider archiving instead.`)) return
    setPendingId(survey.id)
    setError(null)
    setNotice(null)
    try {
      if (!supabase) throw new Error('NOT_CONFIGURED')
      const { data, error: deleteError } = await supabase
        .from('surveys')
        .delete()
        .eq('id', survey.id)
        .eq('status', survey.status)
        .select('id')
      if (deleteError) throw deleteError
      if (!data?.length) throw new Error('STALE_SURVEY')
      await loadSurveys()
      setNotice(`Deleted "${survey.title}".`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to delete this survey. It may have changed. Refresh and try again.'))
    } finally {
      setPendingId(null)
    }
  }

  async function handleActivate(survey: Survey) {
    if (!window.confirm(`Activate "${survey.title}"? Any currently active survey will be closed.`)) return
    setPendingId(survey.id)
    setError(null)
    setNotice(null)
    try {
      await activateSurvey(survey.id)
      await loadSurveys()
      navigate(`/surveys/${survey.id}/present`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to activate the survey.')
    } finally { setPendingId(null) }
  }

  async function handleClose(survey: Survey) {
    if (!window.confirm(`Close "${survey.title}"? Students will no longer be able to submit.`)) return
    setPendingId(survey.id)
    setError(null)
    setNotice(null)
    try {
      await closeSurvey(survey.id)
      await loadSurveys()
      setNotice(`Closed "${survey.title}".`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to close the survey.')
    } finally { setPendingId(null) }
  }

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

  const disabledActionClass = 'min-h-11 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400'
  const actionClass = 'min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Classroom Survey</p>
            <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Signed in as {user?.email ?? 'Instructor'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/surveys/new')} className={actionClass}>+ New Survey</button>
            <button type="button" onClick={handleLogout} disabled={signingOut} className={actionClass}>{signingOut ? 'Logging out...' : 'Logout'}</button>
          </div>
        </header>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Survey list">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-52 flex-1">
              <label htmlFor="survey-search" className="mb-2 block text-sm font-semibold">Search by title</label>
              <input id="survey-search" type="search" placeholder="Search surveys..." value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-blue-600" />
            </div>
            <div className="min-w-40">
              <label htmlFor="survey-status" className="mb-2 block text-sm font-semibold">Status</label>
              <select id="survey-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3">
                <option value="all">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => { setNotice(null); void loadSurveys() }} disabled={loading || refreshing || pendingId !== null} className={actionClass}>{refreshing ? 'Refreshing...' : 'Refresh'}</button>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
          {loading ? (
            <p role="status" className="mt-8 text-slate-600">Loading surveys...</p>
          ) : surveys.length === 0 && !error ? (
            <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <h2 className="text-lg font-semibold">You have not created any surveys yet.</h2>
              <p className="mt-2 text-slate-600">Create your first survey to get started.</p>
            </div>
          ) : visibleSurveys.length === 0 && !error ? (
            <p className="mt-8 text-center text-slate-600">No surveys match your search or selected status.</p>
          ) : (
            <>
              <p className="mt-6 text-sm text-slate-600" aria-live="polite">Showing {visibleSurveys.length} of {surveys.length} surveys</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {visibleSurveys.map((survey) => {
                  const busy = pendingId !== null
                  return <article key={survey.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="min-w-0 flex-1 break-words text-lg font-semibold">{survey.title}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[survey.status] ?? statusStyles.draft}`}>{statusLabels[survey.status] ?? survey.status}</span>
                    </div>
                    {survey.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{survey.description}</p>}
                    <p className="mt-3 text-sm text-slate-600">Created: <time dateTime={survey.created_at}>{formatCreatedAt(survey.created_at)}</time></p>
                    <div className="mt-5 flex flex-wrap gap-2" aria-label={`Actions for ${survey.title}`}>
                      {survey.status === 'draft' ? <Link className={actionClass} to={`/surveys/${survey.id}/edit`}>Edit</Link> : <button type="button" className={disabledActionClass} disabled title="Only draft surveys can be edited">Edit</button>}
                      <button type="button" disabled title="Duplication is scheduled for Phase 12" className={disabledActionClass}>Duplicate</button>
                      {survey.status === 'draft' || survey.status === 'closed' ? <button type="button" disabled={busy} onClick={() => void handleActivate(survey)} className={actionClass}>Activate</button> : null}
                      {survey.status === 'active' && <Link className={actionClass} to={`/surveys/${survey.id}/present`}>Present QR</Link>}
                      {survey.status === 'active' && <button type="button" disabled={busy} onClick={() => void handleClose(survey)} className={actionClass}>Close</button>}
                      <button type="button" disabled title="Results are scheduled for Phase 9" className={disabledActionClass}>Results</button>
                      {survey.status !== 'archived' && <button type="button" disabled={busy || survey.status === 'active'} title={survey.status === 'active' ? 'Close the survey before archiving' : 'Preserve the survey and its responses'} onClick={() => void handleArchive(survey)} className={actionClass}>{pendingId === survey.id ? 'Working...' : 'Archive'}</button>}
                      <button type="button" disabled={busy || survey.status === 'active'} title={survey.status === 'active' ? 'Close the survey before deleting' : 'Permanently delete this survey and all its responses'} onClick={() => void handleDelete(survey)} className={`${actionClass} text-red-700`}>Delete</button>
                    </div>
                  </article>
                })}
              </div>
            </>
          )}
        </section>
        <p className="mt-4 text-sm text-slate-600">Survey creation, editing, activation, presentation and closing are available. Duplication and results are reserved for later phases.</p>
      </div>
    </main>
  )
}
