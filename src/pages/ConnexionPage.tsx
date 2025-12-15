import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type UserType = 'adherent' | 'admin'

const ConnexionPage: React.FC = () => {
  const { isAdmin, isAdherent, loading } = useAuth()
  const navigate = useNavigate()
  const [userType, setUserType] = useState<UserType>('adherent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Si on arrive avec ?logout=1, on déconnecte puis on nettoie l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shouldLogout = params.get('logout') === '1'

    if (!shouldLogout) return

    supabase.auth.signOut().finally(() => {
      params.delete('logout')
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '')
      window.history.replaceState({}, '', newUrl)
    })
  }, [])

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    // Dès que le profil est chargé et indique un utilisateur connecté,
    // on redirige sans bloquer l'affichage de la page de connexion.
    if (isAdmin()) {
      navigate('/admin/console', { replace: true })
    } else if (isAdherent()) {
      navigate('/', { replace: true })
    }
  }, [loading, isAdmin, isAdherent, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message || 'Erreur lors de la connexion')
        return
      }

      // Redirection après connexion réussie : on force un rechargement complet
      if (userType === 'admin') {
        window.location.assign('/admin/console')
      } else {
        window.location.assign('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Connexion — RIA Facile</title>
        <meta name="description" content="Page de connexion à RIA Facile - Adhérent ou Administrateur" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-8 text-[#774792] text-center">Connexion</h1>

          {/* Sélecteur de type d'utilisateur */}
          <div className="mb-8">
            <div className="flex gap-4 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setUserType('adherent')
                  setError('')
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  userType === 'adherent'
                    ? 'bg-white text-[#774792] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Adhérent
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType('admin')
                  setError('')
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  userType === 'admin'
                    ? 'bg-white text-[#774792] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Administrateur
              </button>
            </div>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email*
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
                placeholder="exemple@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pr-12 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.58M9.88 9.88L9.17 9.17M13.41 13.41L14.12 14.12M9.88 9.88A3 3 0 0115 12c0 .46-.1.9-.29 1.29M9.88 9.88L8.7 8.7M15 12a3 3 0 00-3-3"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.522 5 12 5c1.51 0 2.94.33 4.23.93M19.542 12A10.97 10.97 0 0112 19c-4.478 0-8.268-2.943-9.542-7"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                `Se connecter en tant que ${userType === 'adherent' ? 'adhérent' : 'administrateur'}`
              )}
            </button>
          </form>

          {/* Informations supplémentaires */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              {userType === 'adherent' ? (
                <>
                  Vous n&apos;avez pas encore de compte adhérent ?{' '}
                  <a href="/contact" className="text-[#774792] hover:underline font-medium">
                    Contactez-nous
                  </a>
                </>
              ) : (
                <>
                  Accès réservé aux administrateurs. En cas de problème,{' '}
                  <a href="/contact" className="text-[#774792] hover:underline font-medium">
                    contactez le support
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnexionPage

