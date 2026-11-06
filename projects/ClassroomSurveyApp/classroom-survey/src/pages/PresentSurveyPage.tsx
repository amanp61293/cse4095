import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { closeSurvey, publicSurveyUrl } from '../lib/activation'
import { supabase } from '../lib/supabase'

type Presentation = { title: string; status: string; public_slug: string | null }
export default function PresentSurveyPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Presentation | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (!supabase) throw new Error('Supabase is not configured.')
        const { data, error: fetchError } = await supabase.from('surveys').select('title,status,public_slug').eq('id', id).single()
        if (fetchError) throw fetchError
        if (active) setSurvey(data)
        if (data.status === 'active' && data.public_slug) {
          const image = await QRCode.toDataURL(publicSurveyUrl(data.public_slug), { width: 650, margin: 2, errorCorrectionLevel: 'M' })
          if (active) setQr(image)
          const { count: total, error: countError } = await supabase.from('responses').select('id', { count: 'exact', head: true }).eq('survey_id', id)
          if (countError) throw countError
          if (active) setCount(total)
        }
      } catch { if (active) setError('Unable to load the presentation. Check your connection and try again.') }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [id])

  async function refreshCount() {
    if (!supabase) return
    const { count: total, error: fetchError } = await supabase.from('responses').select('id', { count: 'exact', head: true }).eq('survey_id', id)
    if (fetchError) setError('Unable to refresh the response count.')
    else { setCount(total); setError(null) }
  }
  async function handleClose() {
    if (!window.confirm('Close this survey? Students will no longer be able to submit responses.')) return
    setBusy(true)
    setError(null)
    try { await closeSurvey(id); navigate('/dashboard') }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to close the survey.') }
    finally { setBusy(false) }
  }
  const url = survey?.public_slug ? publicSurveyUrl(survey.public_slug) : ''
  const button = 'inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50'
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-center text-slate-900 sm:py-12">
    <section className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
      {loading ? <p role="status">Loading presentation...</p> : error && !survey ? <p role="alert">{error}</p> :
      <>
        <h1 className="text-3xl font-bold sm:text-5xl">{survey?.title ?? 'Survey'}</h1>
        {survey?.status !== 'active' || !url ? <p className="mt-6 text-xl">This survey is not active.</p> : <>
          {qr && <img src={qr} alt="Scan this QR code to open the student survey" className="mx-auto mt-8 w-full max-w-sm" />}
          <p className="mt-5 break-all text-lg font-semibold sm:text-2xl"><a href={url} className="text-blue-800 underline">{url}</a></p>
          <p className="mt-8 text-3xl font-bold" aria-live="polite">Responses: {count ?? '...'}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button className={button} type="button" onClick={() => void refreshCount()}>Refresh count</button>
            {qr && <a className={button} href={qr} download={`survey-${survey?.public_slug ?? 'qr'}.png`}>Download QR code</a>}
            <button className={`${button} text-red-700`} disabled={busy} type="button" onClick={() => void handleClose()}>{busy ? 'Closing...' : 'Close survey'}</button>
          </div>
        </>}
        {error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
      </>}
      <Link to="/dashboard" className="mt-8 inline-block text-blue-800 underline">Back to dashboard</Link>
    </section>
  </main>
}
