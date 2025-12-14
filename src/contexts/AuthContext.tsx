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
  signIn: (email: string, password: string, role: UserRole) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAdmin: () => boolean
  isAdherent: () => boolean
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
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

      if (data.user) {
        // Charger le profil pour vérifier le rôle
        let userProfile: UserProfile | null = null
        
        // Essayer de récupérer depuis la table profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', data.user.id)
          .single()

        if (!profileError && profileData) {
          userProfile = {
            id: profileData.id,
            email: profileData.email || data.user.email || '',
            role: (profileData.role as UserRole) || 'adherent',
          }
        } else {
          // Utiliser les métadonnées de l'utilisateur
          const userRole = (data.user.user_metadata?.role as UserRole) || 'adherent'
          userProfile = {
            id: data.user.id,
            email: data.user.email || '',
            role: userRole,
          }
        }
        
        // Vérifier que le rôle correspond
        if (userProfile.role !== role) {
          await supabase.auth.signOut()
          return {
            error: {
              name: 'AuthError',
              message: `Vous n'avez pas les droits pour vous connecter en tant que ${role === 'admin' ? 'administrateur' : 'adhérent'}`,
            } as AuthError,
          }
        }
      }

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
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  const isAdherent = () => {
    return profile?.role === 'adherent'
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    isAdmin,
    isAdherent,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

