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
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
        // Réinitialiser le timestamp d'activité lors de la connexion
        setLastActivity(Date.now())
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
          supabase.auth.signOut({ scope: 'global' })
          setUser(null)
          setProfile(null)
          setSession(null)
          // Nettoyer le localStorage
          localStorage.removeItem('ria_admin_session')
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
      // Si la table n'existe pas encore, on utilisera les métadonnées de l'utilisateur
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = pas de résultat trouvé, ce n'est pas grave
        console.error('Erreur lors du chargement du profil:', error)
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role || 'adherent', // Par défaut, adhérent
        })
      } else {
        // Si pas de profil dans la table, utiliser les métadonnées de l'utilisateur
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          const userRole = (userData.user.user_metadata?.role as UserRole) || 'adherent'
          setProfile({
            id: userData.user.id,
            email: userData.user.email || '',
            role: userRole,
          })
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
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
      
      // Nettoyer manuellement le localStorage pour être sûr
      localStorage.removeItem('ria_admin_session')
      // Nettoyer aussi l'ancienne clé par défaut de Supabase au cas où
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
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

