import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // On loggue plutôt que de throw pour éviter de casser le rendu en prod
  console.error('Supabase public client: variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes')
}

// Client "lecture seule" public, indépendant de la session admin
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'ria_public_read',
  },
})
