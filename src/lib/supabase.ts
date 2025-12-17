import { createClient } from '@supabase/supabase-js';

// Accès aux variables d'environnement de manière plus robuste
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Configuration Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'non définie',
  env: import.meta.env.MODE,
  envVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables d\'environnement manquantes:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    env: import.meta.env.MODE,
    envVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persister la session dans le localStorage
    persistSession: true,
    // Utiliser une clé de stockage spécifique pour éviter les conflits
    storageKey: 'ria_admin_session',
    // Rafraîchir automatiquement le token (on le garde pour une bonne UX)
    autoRefreshToken: true,
    // Détecter les tokens dans l'URL (pour les liens magiques, etc.)
    detectSessionInUrl: true,
  },
}); 

// Facilite le debug dans la console navigateur : window.supabase.from(...)
if (typeof window !== 'undefined') {
  // @ts-expect-error: attache volontaire sur l'objet global pour inspection
  window.supabase = supabase;
}