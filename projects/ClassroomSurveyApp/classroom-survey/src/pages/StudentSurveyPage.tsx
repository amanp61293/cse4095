import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { hasSubmittedSurvey, loadPublicSurvey, markSubmittedSurvey, submitPublicSurvey, type PublicSurvey } from '../lib/participation'

export default function StudentSurveyPage() {
  const { slug = '' } = useParams()
  const [survey, setSurvey] = useState<PublicSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await loadPublicSurvey(slug)
        if (!active) return
        setSurvey(result)
        setMissing(!result)
        if (result && hasSubmittedSurvey(result.id)) setDuplicate(true)
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load this survey.')
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [slug])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!survey || submitting || success || duplicate) return
    if (survey.questions.some((q) => !selections[q.id])) { setError('Please answer every question.'); return }
    setError(null)
    setSubmitting(true)
    try {
      await submitPublicSurvey(survey, selections)
      markSubmittedSurvey(survey.id)
      setSuccess(true)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to submit. Please try again.'
      if (message.includes('already submitted')) { markSubmittedSurvey(survey.id); setDuplicate(true) }
      setError(message)
    } finally { setSubmitting(false) }
  }

  const shell = 'mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10'
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:py-14">
    <div className={shell}>
      {loading ? <p role="status">Loading survey...</p> :
      error && !survey ? <p role="alert" className="text-red-700">{error}</p> :
      missing ? <><h1 className="text-2xl font-bold">Survey unavailable</h1><p className="mt-3">Survey not found or no longer accepting responses.</p></> :
      success ? <><h1 className="text-3xl font-bold">Thank you!</h1><p role="status" className="mt-3">Your response has been recorded.</p></> :
      duplicate ? <><h1 className="text-2xl font-bold">Already submitted</h1><p role="status" className="mt-3">You have already submitted a response to this survey.</p></> :
      survey ? <>
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        {survey.description && <p className="mt-3 text-slate-600">{survey.description}</p>}
        <form className="mt-8 space-y-7" onSubmit={(event) => void submit(event)} noValidate>
          {survey.questions.map((question, index) => <fieldset key={question.id} className="rounded-xl border border-slate-200 p-4 sm:p-5" disabled={submitting}>
            <legend className="px-1 text-lg font-semibold">{index + 1}. {question.question_text}</legend>
            <div className="mt-3 space-y-3">
              {question.choices.map((choice) => <label key={choice.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 focus-within:ring-2 focus-within:ring-blue-600 ${selections[question.id] === choice.id ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                <input type="radio" name={`question-${question.id}`} value={choice.id} checked={selections[question.id] === choice.id}
                  onChange={() => setSelections((old) => ({ ...old, [question.id]: choice.id }))}
                  className="h-5 w-5 accent-blue-700" required />
                <span>{choice.choice_text}</span>
              </label>)}
            </div>
          </fieldset>)}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
          <button type="submit" disabled={submitting || !survey.questions.length} className="min-h-12 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit responses'}
          </button>
        </form>
      </> : null}
    </div>
  </main>
}
