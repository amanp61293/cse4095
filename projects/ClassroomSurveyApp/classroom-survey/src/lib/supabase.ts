import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Only the public browser key belongs here. Never use a service-role or secret key.
// Leaving credentials unset keeps the homepage accessible with a configuration message on login.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }) : null
