import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchSurveyDraft, newChoice, newQuestion, saveDraft, type QuestionDraft, type SurveyDraft } from '../lib/surveys'

const field = 'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus-visible:outline-blue-600'
const button = 'min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
const blank: SurveyDraft = { title: '', description: '', questions: [newQuestion()] }

function move<T>(items: T[], index: number, offset: number): T[] {
  const target = index + offset
  if (target < 0 || target >= items.length) return items
  const result = [...items]
  ;[result[index], result[target]] = [result[target], result[index]]
  return result
}

export default function SurveyEditorPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [draft, setDraft] = useState<SurveyDraft>(blank)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    let live = true
    void fetchSurveyDraft(id).then(({ status, draft: loaded }) => {
      if (!live) return
      if (status !== 'draft') {
        setBlocked(true)
        setError('Only draft surveys can be edited. Active, closed, and archived surveys are read-only.')
      } else setDraft(loaded)
    }).catch(() => {
      if (live) setError('Unable to load the survey. Check your connection and permissions.')
    }).finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [id])

  function update(patch: Partial<SurveyDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setSaved(false)
  }

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    update({ questions: draft.questions.map((question, i) => i === index ? { ...question, ...patch } : question) })
  }

  function changeQuestionType(index: number, type: QuestionDraft['question_type']) {
    const current = draft.questions[index]
    updateQuestion(index, {
      question_type: type,
      choices: type === 'true_false' ? [newChoice('True'), newChoice('False')] :
        current.question_type === 'true_false' ? [newChoice(), newChoice()] : current.choices,
    })
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const surveyId = await saveDraft(draft, id)
      setSaved(true)
      if (!editing) navigate(`/surveys/${surveyId}/edit`, { replace: true, state: { saved: true } })
    } catch (caught) {
      setError(caught instanceof Error && !('code' in caught) ? caught.message : 'Could not save the draft. Check your connection and try again.')
    } finally { setSaving(false) }
  }

  if (loading) return <main className="mx-auto max-w-3xl p-8" role="status">Loading survey...</main>
  if (blocked) return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold">Survey unavailable for editing</h1><p role="alert" className="mt-4">{error}</p><Link className="mt-6 inline-block text-blue-700 underline" to="/dashboard">Back to dashboard</Link></main>

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-3xl">
      <Link className="text-sm font-semibold text-blue-700 underline" to="/dashboard">Back to dashboard</Link>
      <h1 className="mt-5 text-3xl font-bold">{editing ? 'Edit draft survey' : 'Create survey'}</h1>
      <p className="mt-2 text-slate-600">Surveys remain in Draft status until activation is added in Phase 6.</p>
      <form className="mt-7 space-y-6" onSubmit={(event) => void submit(event)} noValidate>
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div><label htmlFor="title" className="mb-2 block font-semibold">Survey title *</label><input id="title" className={field} maxLength={180} value={draft.title} onChange={(event) => update({ title: event.target.value })} required /></div>
          <div><label htmlFor="description" className="mb-2 block font-semibold">Description (optional)</label><textarea id="description" className={field} rows={3} value={draft.description} onChange={(event) => update({ description: event.target.value })} /></div>
        </section>
        {draft.questions.map((question, index) => <section key={question.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label={`Question ${index + 1}`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Question {index + 1}</h2><div className="flex flex-wrap gap-2">
            <button type="button" className={button} disabled={saving || index === 0} onClick={() => update({ questions: move(draft.questions, index, -1) })} aria-label={`Move question ${index + 1} up`}>↑</button>
            <button type="button" className={button} disabled={saving || index === draft.questions.length - 1} onClick={() => update({ questions: move(draft.questions, index, 1) })} aria-label={`Move question ${index + 1} down`}>↓</button>
            <button type="button" className={`${button} text-red-700`} disabled={saving} onClick={() => { if (window.confirm(`Delete question ${index + 1}?`)) update({ questions: draft.questions.filter((q) => q.id !== question.id) }) }}>Delete question</button>
          </div></div>
          <div className="mt-4"><label className="mb-2 block font-semibold" htmlFor={`question-${question.id}`}>Question text *</label><textarea id={`question-${question.id}`} className={field} value={question.question_text} rows={2} onChange={(event) => updateQuestion(index, { question_text: event.target.value })} required /></div>
          <div className="mt-4"><label className="mb-2 block font-semibold" htmlFor={`type-${question.id}`}>Question type</label><select id={`type-${question.id}`} className={field} value={question.question_type} onChange={(event) => changeQuestionType(index, event.target.value as QuestionDraft['question_type'])}><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option></select></div>
          <fieldset className="mt-5 space-y-3"><legend className="font-semibold">Answer choices *</legend>
            {question.choices.map((choice, choiceIndex) => <div className="flex flex-wrap items-center gap-2" key={choice.id}>
              <label className="w-full text-sm text-slate-600 sm:w-20" htmlFor={`choice-${choice.id}`}>Choice {choiceIndex + 1}</label>
              <input id={`choice-${choice.id}`} className={`${field} min-w-40 flex-1`} value={choice.choice_text} disabled={question.question_type === 'true_false' || saving} onChange={(event) => updateQuestion(index, { choices: question.choices.map((entry) => entry.id === choice.id ? { ...entry, choice_text: event.target.value } : entry) })} />
              {question.question_type === 'multiple_choice' && <div className="flex gap-2">
                <button type="button" className={button} disabled={saving || choiceIndex === 0} onClick={() => updateQuestion(index, { choices: move(question.choices, choiceIndex, -1) })} aria-label={`Move choice ${choiceIndex + 1} up in question ${index + 1}`}>↑</button>
                <button type="button" className={button} disabled={saving || choiceIndex === question.choices.length - 1} onClick={() => updateQuestion(index, { choices: move(question.choices, choiceIndex, 1) })} aria-label={`Move choice ${choiceIndex + 1} down in question ${index + 1}`}>↓</button>
                <button type="button" className={`${button} text-red-700`} disabled={saving || question.choices.length <= 2} onClick={() => updateQuestion(index, { choices: question.choices.filter((entry) => entry.id !== choice.id) })} aria-label={`Delete choice ${choiceIndex + 1} in question ${index + 1}`}>Remove</button>
              </div>}
            </div>)}
            {question.question_type === 'multiple_choice' && <button type="button" className={button} disabled={saving || question.choices.length >= 10} onClick={() => updateQuestion(index, { choices: [...question.choices, newChoice()] })}>+ Add choice</button>}
          </fieldset>
        </section>)}
        <button type="button" className={button} disabled={saving} onClick={() => update({ questions: [...draft.questions, newQuestion()] })}>+ Add question</button>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
        {saved && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">Draft saved.</p>}
        <div className="flex flex-wrap gap-3"><button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save Draft'}</button><Link to="/dashboard" className={button}>Cancel</Link></div>
      </form>
    </div>
  </main>
}
