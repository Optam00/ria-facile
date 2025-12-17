import { createClient } from '@supabase/supabase-js';

// Accès aux variables d'environnement de manière plus robuste
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Type pour le storage personnalisé
interface CustomStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

// Storage personnalisé qui vérifie le flag de déconnexion explicite
const createSecureStorage = (): CustomStorage => {
  const baseStorage = typeof window !== 'undefined' ? window.localStorage : null;
  
  if (!baseStorage) {
    // Fallback pour les environnements sans localStorage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (key: string) => {
      // Si on demande la clé de session, vérifier le flag de déconnexion
      const isSessionKey = key === 'ria_admin_session' || key.includes('auth-token');
      
      if (isSessionKey) {
        const explicitLogout = baseStorage.getItem('explicit_logout') === 'true';
        const explicitLogin = baseStorage.getItem('explicit_login') === 'true';
        const logoutTimestamp = baseStorage.getItem('explicit_logout_timestamp');
        
        // Si connexion explicite en cours, supprimer le flag et autoriser
        if (explicitLogin) {
          console.log('🔓 Storage: Connexion explicite détectée, suppression du flag explicit_logout');
          baseStorage.removeItem('explicit_logout');
          baseStorage.removeItem('explicit_logout_timestamp');
          return baseStorage.getItem(key);
        }
        
        if (explicitLogout && logoutTimestamp) {
          const logoutTime = parseInt(logoutTimestamp, 10);
          const daysSinceLogout = (Date.now() - logoutTime) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLogout < 7) {
            // Déconnexion explicite récente : ne PAS retourner la session existante
            // Mais on ne bloque pas complètement, car setItem supprimera le flag lors d'une nouvelle connexion
            console.log('🔒 Storage: Déconnexion explicite détectée, session existante bloquée');
            return null;
          } else {
            // Flag trop ancien, le supprimer
            baseStorage.removeItem('explicit_logout');
            baseStorage.removeItem('explicit_logout_timestamp');
          }
        }
      }
      
      return baseStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      // Si on sauvegarde la session, c'est qu'une connexion est en cours
      const isSessionKey = key === 'ria_admin_session' || key.includes('auth-token');
      
      if (isSessionKey) {
        const explicitLogout = baseStorage.getItem('explicit_logout') === 'true';
        
        // Si on sauvegarde une session, c'est qu'une connexion est en cours
        // Donc on supprime le flag de déconnexion pour permettre la connexion
        if (explicitLogout) {
          console.log('🔓 Storage: Sauvegarde de session détectée (connexion en cours), suppression du flag explicit_logout');
          baseStorage.removeItem('explicit_logout');
          baseStorage.removeItem('explicit_logout_timestamp');
        }
        
        // Toujours autoriser la sauvegarde de la session
        baseStorage.setItem(key, value);
        return;
      }
      
      baseStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      baseStorage.removeItem(key);
    },
  };
};

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
    // Utiliser un storage personnalisé qui vérifie le flag de déconnexion
    storage: createSecureStorage(),
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