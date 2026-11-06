import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The client is intentionally optional for Phase 1. The landing page can run
 * without credentials. Database and authentication features come later.
 * Never use a Supabase service-role key in a Vite frontend.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null
