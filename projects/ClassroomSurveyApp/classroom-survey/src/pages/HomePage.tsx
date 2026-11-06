import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:py-20">
      <section className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="mb-7 rounded-2xl bg-blue-100 p-4 text-blue-700" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="15" rx="2" />
            <path d="M7 9h10M7 13h6M9 22v-3m6 3v-3" />
          </svg>
        </div>
        <p className="mb-3 text-sm font-semibold tracking-[0.16em] text-blue-700 uppercase">Classroom tools</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Classroom Survey</h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">Quick in-class understanding checks.</p>
        <p className="mt-3 max-w-md text-base text-slate-500">Instructors prepare surveys. Students respond using a QR code, without needing an account.</p>
        <Link to="/login" className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-7 font-semibold text-white hover:bg-blue-800">Instructor Login</Link>
      </section>
    </main>
  )
}
