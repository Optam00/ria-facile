import { createClient } from '@supabase/supabase-js';

// Accès aux variables d'environnement de manière plus robuste
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Configuration Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'non définie',
  env: import.meta.env.MODE // Affiche l'environnement (development/production)
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables d\'environnement manquantes:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    env: import.meta.env.MODE
  });
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
}); 