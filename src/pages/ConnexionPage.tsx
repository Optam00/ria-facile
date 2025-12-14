import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type UserType = 'adherent' | 'admin'

const ConnexionPage: React.FC = () => {
  const { signIn, isAdmin, isAdherent, loading } = useAuth()
  const navigate = useNavigate()
  const [userType, setUserType] = useState<UserType>('adherent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!loading) {
      if (isAdmin()) {
        // Si l'utilisateur est déjà connecté en tant qu'admin, rediriger vers la console
        navigate('/admin/console', { replace: true })
      } else if (isAdherent()) {
        // Si l'utilisateur est déjà connecté en tant qu'adhérent, rediriger vers l'accueil
        navigate('/', { replace: true })
      }
    }
  }, [loading, isAdmin, isAdherent, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { error: authError } = await signIn(email, password, userType)

    if (authError) {
      setError(authError.message || 'Erreur lors de la connexion')
      setIsLoading(false)
    } else {
      // Redirection après connexion réussie
      // Les administrateurs vont vers la console d'administration
      if (userType === 'admin') {
        navigate('/admin/console')
      } else {
        navigate('/')
      }
    }
  }

  // Afficher un loader pendant la vérification de la session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur est déjà connecté, ne rien afficher (redirection en cours)
  if (isAdmin() || isAdherent()) {
    return null
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
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
                placeholder="••••••••"
              />
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

