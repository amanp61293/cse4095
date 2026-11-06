import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured. Add its URL and public key to your .env file.')
      setLoading(false)
      return
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setError(null)
      setLoading(false)
    })

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError('Unable to restore your session. Please try again.')
      else setSession(data.session)
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setError('Unable to connect to authentication. Check your connection.')
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured. Add your public credentials to .env.')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw new Error('Login failed. Check your email and password and try again.')
  }

  async function signOut() {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw new Error('Could not log out. Please try again.')
    setSession(null)
  }

  const value: AuthContextValue = {
    session, user: session?.user ?? null, loading, error, signIn, signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
