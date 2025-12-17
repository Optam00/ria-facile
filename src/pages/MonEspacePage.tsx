import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const MonEspacePage: React.FC = () => {
  const { signOut, isAdherent, profile, loading, session } = useAuth()
  const navigate = useNavigate()

  // Rediriger si l'utilisateur n'est pas adhérent
  useEffect(() => {
    if (!loading && !isAdherent()) {
      navigate('/connexion')
    }
  }, [loading, isAdherent, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/connexion')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#774792]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Mon Espace — RIA Facile</title>
        <meta name="description" content="Espace personnel adhérent RIA Facile" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg border border-white overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Mon Espace</h1>
                <p className="text-indigo-100 mt-1">
                  Bienvenue, {profile?.email ?? session?.user?.email ?? 'Adhérent'}
                </p>
              </div>
              <div className="text-5xl opacity-30">👤</div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6">
            {/* Message de bienvenue */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-indigo-800 mb-2">
                    Bienvenue dans votre espace adhérent !
                  </h2>
                  <p className="text-indigo-700">
                    Cet espace est en cours de construction. De nouvelles fonctionnalités seront bientôt disponibles.
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder pour les futures fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📚</span>
                  <h3 className="font-semibold text-gray-700">Mes ressources</h3>
                </div>
                <p className="text-gray-500 text-sm">Bientôt disponible</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-gray-700">Mon activité</h3>
                </div>
                <p className="text-gray-500 text-sm">Bientôt disponible</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="font-semibold text-gray-700">Mes paramètres</h3>
                </div>
                <p className="text-gray-500 text-sm">Bientôt disponible</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💬</span>
                  <h3 className="font-semibold text-gray-700">Mes conversations</h3>
                </div>
                <p className="text-gray-500 text-sm">Bientôt disponible</p>
              </div>
            </div>

            {/* Informations du compte */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Mon compte</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Connecté en tant que</p>
                  <p className="font-medium text-gray-800">
                    {profile?.email ?? session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium shadow-md hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonEspacePage

