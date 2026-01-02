import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'adherent' | 'admin'

interface UserProfile {
  id: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  showInactivityWarning: boolean
  signIn: (email: string, password: string, role: UserRole) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAdmin: () => boolean
  isAdherent: () => boolean
  dismissInactivityWarning: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [showInactivityWarning, setShowInactivityWarning] = useState(false)

  // Durées d'inactivité avant déconnexion automatique
  const ADMIN_INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000 // 2 heures pour les admins
  const ADHERENT_INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000 // 24 heures pour les adhérents
  const WARNING_BEFORE_LOGOUT = 5 * 60 * 1000 // Avertir 5 minutes avant la déconnexion

  useEffect(() => {
    // Vérifier si l'utilisateur s'est explicitement déconnecté (utiliser localStorage qui persiste)
    const explicitLogout = localStorage.getItem('explicit_logout') === 'true'
    const logoutTimestamp = localStorage.getItem('explicit_logout_timestamp')
    
    if (explicitLogout && logoutTimestamp) {
      // Vérifier que la déconnexion n'est pas trop ancienne (max 7 jours)
      const logoutTime = parseInt(logoutTimestamp, 10)
      const daysSinceLogout = (Date.now() - logoutTime) / (1000 * 60 * 60 * 24)
      
      if (daysSinceLogout < 7) {
        // Si déconnexion explicite récente, ne pas restaurer la session
        console.log('🔒 Déconnexion explicite détectée, nettoyage complet...')
        
        // Nettoyer TOUT le localStorage Supabase immédiatement
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        if (supabaseUrl) {
          const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
          const allKeys = Object.keys(localStorage)
          allKeys.forEach(key => {
            if (key.startsWith('sb-') || 
                key.startsWith('supabase.') ||
                (key.includes('supabase') && !key.includes('explicit_logout')) ||
                (key.includes('auth') && !key.includes('explicit_logout')) ||
                key === 'ria_admin_session' ||
                key === 'ria_public_read') {
              localStorage.removeItem(key)
            }
          })
        }
        
        // Forcer la déconnexion et NE PAS supprimer le flag (il doit persister)
        supabase.auth.signOut({ scope: 'local' }).finally(() => {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        })
        return
      } else {
        // Déconnexion trop ancienne, nettoyer le flag
        localStorage.removeItem('explicit_logout')
        localStorage.removeItem('explicit_logout_timestamp')
      }
    }

    // Vérifier la session actuelle et sa validité côté serveur
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Vérifier à nouveau au cas où explicit_logout aurait été ajouté entre-temps
      if (localStorage.getItem('explicit_logout') === 'true') {
        console.log('🔒 Flag de déconnexion détecté après getSession, nettoyage...')
        await supabase.auth.signOut({ scope: 'local' })
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      
      // Si une session existe, vérifier qu'elle est toujours valide côté serveur
      if (session?.access_token) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error || !user) {
            // Session invalide, nettoyer
            console.log('Session invalide détectée, nettoyage...')
            await supabase.auth.signOut({ scope: 'local' })
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de la session:', err)
          // En cas d'erreur, nettoyer par précaution
          await supabase.auth.signOut({ scope: 'local' })
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Si connexion ET flag de déconnexion explicite présent
      if (event === 'SIGNED_IN' && localStorage.getItem('explicit_logout') === 'true') {
        // Vérifier si c'est une connexion explicite (via formulaire) ou une restauration automatique
        const explicitLogin = localStorage.getItem('explicit_login') === 'true'
        
        if (explicitLogin) {
          // Connexion explicite : supprimer les flags et accepter la session
          console.log('✅ Connexion explicite détectée, suppression des flags de déconnexion')
          localStorage.removeItem('explicit_logout')
          localStorage.removeItem('explicit_logout_timestamp')
          localStorage.removeItem('explicit_login')
        } else {
          // Restauration automatique : ignorer et forcer la déconnexion
          console.log('🔒 Restauration automatique bloquée (déconnexion explicite active)')
          await supabase.auth.signOut({ scope: 'local' })
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
      }
      
      // Gérer le rafraîchissement du token : vérifier que le rôle admin est présent
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        const jwtRole = session.user.user_metadata?.role || (session.user as any).raw_user_meta_data?.role
        const profileRole = profile?.role
        
        // Si l'utilisateur est admin dans le profil mais pas dans le JWT, forcer un nouveau rafraîchissement
        if (profileRole === 'admin' && jwtRole !== 'admin') {
          console.warn('⚠️ [AUTH] Rôle admin manquant dans le JWT rafraîchi, resynchronisation...')
          try {
            // Recharger le profil pour forcer la mise à jour
            await loadUserProfile(session.user.id)
            // Forcer un nouveau rafraîchissement du token
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(session)
            if (refreshError) {
              console.error('❌ [AUTH] Erreur lors de la resynchronisation du token:', refreshError)
            } else if (refreshData.session) {
              console.log('✅ [AUTH] Token resynchronisé avec le rôle admin')
              setSession(refreshData.session)
              setUser(refreshData.session.user)
            }
          } catch (err) {
            console.error('❌ [AUTH] Exception lors de la resynchronisation:', err)
          }
        }
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
        // Réinitialiser le timestamp d'activité lors de la connexion
        setLastActivity(Date.now())
        // Supprimer le flag explicit_login après connexion réussie
        localStorage.removeItem('explicit_login')
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Filet de sécurité : ne jamais rester bloqué indéfiniment en mode "loading"
  useEffect(() => {
    if (!loading) return

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000) // 5 secondes max de "loading"

    return () => clearTimeout(timeout)
  }, [loading])

  // Système de déconnexion automatique après inactivité (admin: 2h, adhérent: 24h)
  useEffect(() => {
    // Fonction pour mettre à jour le timestamp d'activité
    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    // Écouter les événements utilisateur pour détecter l'activité
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Vérifier périodiquement si l'utilisateur doit être déconnecté
    const checkInactivity = setInterval(() => {
      if (user && profile) {
        const timeSinceLastActivity = Date.now() - lastActivity
        const isUserAdmin = profile.role === 'admin'
        
        // Définir le timeout selon le rôle
        const inactivityTimeout = isUserAdmin ? ADMIN_INACTIVITY_TIMEOUT : ADHERENT_INACTIVITY_TIMEOUT
        const warningTime = inactivityTimeout - WARNING_BEFORE_LOGOUT
        
        // Afficher un avertissement 5 minutes avant la déconnexion
        if (timeSinceLastActivity >= warningTime && timeSinceLastActivity < inactivityTimeout) {
          setShowInactivityWarning(true)
        } else {
          setShowInactivityWarning(false)
        }
        
        // Déconnexion automatique après le timeout d'inactivité
        if (timeSinceLastActivity >= inactivityTimeout) {
          const timeoutLabel = isUserAdmin ? '2 heures' : '24 heures'
          console.log(`Déconnexion automatique : inactivité de ${timeoutLabel} détectée`)
          setShowInactivityWarning(false)
          // Déconnexion automatique (pas de flag explicit_logout car c'est automatique)
          supabase.auth.signOut({ scope: 'global' }).finally(() => {
            setUser(null)
            setProfile(null)
            setSession(null)
            // Nettoyer le localStorage
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            if (supabaseUrl) {
              const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
              localStorage.removeItem('ria_admin_session')
              localStorage.removeItem(`sb-${projectRef}-auth-token`)
              localStorage.removeItem(`sb-${projectRef}-auth-token-code-verifier`)
            }
          })
        }
      } else {
        setShowInactivityWarning(false)
      }
    }, 30000) // Vérifier toutes les 30 secondes

    return () => {
      // Nettoyer les event listeners
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
      clearInterval(checkInactivity)
    }
  }, [profile, user, lastActivity])

  const loadUserProfile = async (userId: string) => {
    try {
      // Récupérer le profil utilisateur depuis la table 'profiles'
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = pas de résultat trouvé
        console.error('Erreur lors du chargement du profil:', error)
      }

      if (data) {
        // Profil trouvé, tout va bien
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role || 'adherent', // Par défaut, adhérent
        })
      } else {
        // Pas de profil trouvé = compte supprimé ou invalide
        // Déconnecter l'utilisateur immédiatement
        console.warn('⚠️ [AUTH] Profil non trouvé pour l\'utilisateur', userId, '- Déconnexion automatique')
        setProfile(null)
        setUser(null)
        setSession(null)
        // Déconnexion complète
        await supabase.auth.signOut()
        return
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      // En cas d'erreur, déconnecter pour sécurité
      setProfile(null)
      setUser(null)
      setSession(null)
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string, role: UserRole) => {
    try {
      // NETTOYER COMPLÈTEMENT LE LOCALSTORAGE AVANT LA CONNEXION
      // Cela évite que Chrome garde l'ancien JWT en cache
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
        const keysToRemove = [
          'ria_admin_session',
          `sb-${projectRef}-auth-token`,
          `sb-${projectRef}-auth-token-code-verifier`,
        ]
        // Nettoyer toutes les clés Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || 
              key.startsWith('supabase.') ||
              (key.includes('supabase') && !key.includes('explicit')) ||
              (key.includes('auth') && !key.includes('explicit'))) {
            keysToRemove.push(key)
          }
        })
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.warn(`Impossible de supprimer ${key}:`, e)
          }
        })
        console.log('🧹 [AUTH] localStorage nettoyé avant connexion,', keysToRemove.length, 'clés supprimées')
      }
      
      // SUPPRIMER IMMÉDIATEMENT le flag de déconnexion car c'est une connexion explicite
      // Cela permet de débloquer le storage avant même la tentative de connexion
      localStorage.removeItem('explicit_logout')
      localStorage.removeItem('explicit_logout_timestamp')
      
      // Marquer comme connexion explicite (pour le cas où le flag serait recréé)
      localStorage.setItem('explicit_login', 'true')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        localStorage.removeItem('explicit_login')
        return { error }
      }

      // S'assurer que les flags sont bien supprimés après connexion réussie
      localStorage.removeItem('explicit_logout')
      localStorage.removeItem('explicit_logout_timestamp')

      // FORCER LE RAFRAÎCHISSEMENT DU TOKEN pour obtenir le nouveau JWT avec le rôle admin
      // Cela résout le problème où Chrome garde l'ancien JWT en cache
      if (data.session) {
        try {
          console.log('🔄 [AUTH] Rafraîchissement forcé du token après connexion...')
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(data.session)
          if (refreshError) {
            console.warn('⚠️ [AUTH] Erreur lors du rafraîchissement du token:', refreshError)
          } else if (refreshData.session) {
            console.log('✅ [AUTH] Token rafraîchi avec succès, nouveau JWT:', {
              hasRole: !!(refreshData.session.user.user_metadata?.role || refreshData.session.user.raw_user_meta_data?.role),
              role: refreshData.session.user.user_metadata?.role || refreshData.session.user.raw_user_meta_data?.role
            })
          }
        } catch (refreshErr) {
          console.warn('⚠️ [AUTH] Exception lors du rafraîchissement du token:', refreshErr)
        }
      }

      // On ne refait pas de logique de rôle ici : 
      // - on laisse onAuthStateChange + loadUserProfile charger le profil
      // - la vérification de rôle se fait ensuite dans les composants (isAdmin / isAdherent)
      return { error: null }
    } catch (error) {
      return {
        error: {
          name: 'AuthError',
          message: error instanceof Error ? error.message : 'Une erreur est survenue',
        } as AuthError,
      }
    }
  }

  const signOut = async () => {
    try {
      // Marquer la déconnexion comme explicite pour empêcher la restauration automatique
      // Utiliser localStorage pour que ça persiste même après fermeture du navigateur
      localStorage.setItem('explicit_logout', 'true')
      localStorage.setItem('explicit_logout_timestamp', Date.now().toString())
      
      // Nettoyer IMMÉDIATEMENT le localStorage AVANT la déconnexion
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
        const keysToRemove = [
          'ria_admin_session',
          `sb-${projectRef}-auth-token`,
          `sb-${projectRef}-auth-token-code-verifier`,
        ]
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      // Scope 'global' invalide tous les tokens de cet utilisateur (toutes les sessions)
      await supabase.auth.signOut({ scope: 'global' })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      // Toujours nettoyer l'état local, même si signOut échoue
      setUser(null)
      setProfile(null)
      setSession(null)
      setShowInactivityWarning(false)
      
      // Nettoyer TOUTES les clés possibles de Supabase dans localStorage
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
        
        // Nettoyer toutes les clés possibles
        const keysToRemove = [
          'ria_admin_session',
          `sb-${projectRef}-auth-token`,
          `sb-${projectRef}-auth-token-code-verifier`,
          // Clés génériques Supabase
          ...Object.keys(localStorage).filter(key => 
            key.startsWith('sb-') || 
            key.startsWith('supabase.') ||
            key.includes('supabase') ||
            key.includes('auth')
          )
        ]
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.warn(`Impossible de supprimer la clé ${key}:`, e)
          }
        })
      }
      
      console.log('✅ Déconnexion complète effectuée')
    }
  }

  const ADMIN_EMAILS = ['promenadedepensees@gmail.com']

  const isAdmin = () => {
    const email = session?.user.email || profile?.email
    const metaRole = session?.user.user_metadata?.role as UserRole | undefined
    return (
      profile?.role === 'admin' ||
      metaRole === 'admin' ||
      (email ? ADMIN_EMAILS.includes(email) : false)
    )
  }

  const isAdherent = () => {
    const metaRole = session?.user.user_metadata?.role as UserRole | undefined
    // Adhérent explicite OU tout utilisateur connecté qui n'est pas admin
    return profile?.role === 'adherent' || metaRole === 'adherent' || (!!user && !isAdmin())
  }

  const dismissInactivityWarning = () => {
    setShowInactivityWarning(false)
    // Réinitialiser l'activité pour donner plus de temps
    setLastActivity(Date.now())
  }

  const value = {
    user,
    profile,
    session,
    loading,
    showInactivityWarning,
    signIn,
    signOut,
    isAdmin,
    isAdherent,
    dismissInactivityWarning,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

