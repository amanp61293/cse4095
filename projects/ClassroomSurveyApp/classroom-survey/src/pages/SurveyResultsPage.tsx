import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { downloadCsv, exportResultsCsv } from '../lib/csv'
import { fetchSurveyResults, type SurveyResults } from '../lib/results'

const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50'

export default function SurveyResultsPage() {
  const { id = '' } = useParams()
  const [results, setResults] = useState<SurveyResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try { setResults(await fetchSurveyResults(id)) }
    catch { setError('Unable to load results. Confirm your instructor account and connection, then try again.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [id])
  useEffect(() => { void load(true) }, [load])

  function exportCsv() {
    if (!results) return
    try { downloadCsv(`survey-results-${results.survey.id}.csv`, exportResultsCsv(results)) }
    catch { setError('Could not export the CSV. Please try again.') }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-semibold text-blue-700">Classroom Survey</p><h1 className="mt-1 text-3xl font-bold">{results?.survey.title ?? 'Survey results'}</h1>
          {results && <p className="mt-2 text-slate-600">{results.survey.status.charAt(0).toUpperCase() + results.survey.status.slice(1)} survey · Created {new Date(results.survey.created_at).toLocaleDateString()}</p>}</div>
        <nav aria-label="Results actions" className="flex flex-wrap gap-2"><Link className={buttonClass} to="/dashboard">Back to dashboard</Link>
          <button className={buttonClass} type="button" disabled={loading || refreshing} onClick={() => void load()}>{refreshing ? 'Refreshing...' : 'Refresh results'}</button>
          <button className={buttonClass} type="button" disabled={!results || loading || refreshing} onClick={exportCsv}>Export CSV</button>
          {results?.survey.status === 'active' && <Link className={buttonClass} to={`/surveys/${id}/present`}>Present QR</Link>}</nav>
      </header>
      {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      {loading ? <p role="status" className="mt-8">Loading results...</p> : !results ? <p className="mt-8">No results available.</p> : <>
        <section aria-label="Response summary" className="mt-8 rounded-xl border bg-white p-6">
          <p className="text-sm font-semibold text-slate-600">Total responses</p><p className="mt-1 text-4xl font-bold" aria-live="polite">{results.responseCount}</p>
          {results.responseCount === 0 && <p className="mt-3 text-slate-600">No responses yet. Display the QR code so students can join.</p>}
        </section>
        <div className="mt-6 space-y-6">{results.questions.map((question, index) => <section key={question.id} aria-labelledby={`question-${question.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 id={`question-${question.id}`} className="text-xl font-semibold">{index + 1}. {question.question_text}</h2>
          <p className="mt-2 text-sm text-slate-600">{question.responseCount} answered · {question.unanswered} unanswered</p>
          {question.unanswered > 0 && <p className="mt-1 text-sm text-amber-800">{question.unanswered} {question.unanswered === 1 ? 'response did' : 'responses did'} not provide a valid choice for this question.</p>}
          {question.choices.length === 0 ? <p className="mt-4 text-slate-600">No answer choices remain for this question.</p> : <>
            <div className="mt-5 overflow-x-auto" role="region" aria-label={`Chart for question ${index + 1}`} tabIndex={0}>
              <div style={{ minWidth: 320, height: Math.max(200, question.choices.length * 56) }}>
                <ResponsiveContainer width="100%" height="100%"><BarChart data={question.choices.map((choice, i) => ({ ...choice, label: `Choice ${i + 1}` }))} layout="vertical" margin={{ left: 15, right: 32, top: 6, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} domain={[0, 'dataMax']} /><YAxis type="category" dataKey="label" width={85} />
                  <Tooltip formatter={(value) => [value, 'Responses']} /><Bar dataKey="count" fill="#1d4ed8" isAnimationActive={false} /></BarChart></ResponsiveContainer>
              </div>
            </div>
            <table className="mt-5 w-full text-left text-sm"><caption className="sr-only">Counts and percentages for question {index + 1}</caption>
              <thead><tr className="border-b"><th scope="col" className="py-2 pr-3">Answer</th><th scope="col" className="py-2 pr-3 text-right">Count</th><th scope="col" className="py-2 text-right">Percentage</th></tr></thead>
              <tbody>{question.choices.map((choice) => <tr key={choice.id} className="border-b border-slate-100"><th scope="row" className="py-3 pr-3 font-normal break-words">{choice.choice_text}</th><td className="py-3 pr-3 text-right tabular-nums">{choice.count}</td><td className="py-3 text-right tabular-nums">{choice.percentage.toFixed(1)}%</td></tr>)}</tbody>
            </table>
          </>}
        </section>)}</div>
      </>}
    </div>
  </main>
}
