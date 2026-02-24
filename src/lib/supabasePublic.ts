import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase public client: variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes')
}

const _url = supabaseUrl || 'https://placeholder.supabase.co'
const _key = supabaseAnonKey || 'placeholder-anon-key'

export const supabasePublic = createClient(_url, _key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'ria_public_read',
  },
})
