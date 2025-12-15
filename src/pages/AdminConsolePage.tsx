import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type AdminAction = 'ajouter-actualite' | 'ajouter-article-doctrine' | 'ajouter-document' | 'enrichir-article' | null

const AdminConsolePage: React.FC = () => {
  const { signOut, isAdmin, profile } = useAuth()
  const navigate = useNavigate()
  const [selectedAction, setSelectedAction] = useState<AdminAction>(null)
  const [actualiteForm, setActualiteForm] = useState({
    Titre: '',
    Date: '',
    media: '',
    lien: '',
  })
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Rediriger si l'utilisateur n'est pas admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/connexion')
    }
  }, [isAdmin, navigate])

  // Réinitialiser les messages et formulaires quand on change d'action
  useEffect(() => {
    setFormStatus({ type: null, message: '' })
    if (selectedAction === 'ajouter-actualite') {
      setActualiteForm({
        Titre: '',
        Date: '',
        media: '',
        lien: '',
      })
    }
  }, [selectedAction])

  const handleSignOut = async () => {
    await signOut()
    navigate('/connexion')
  }

  const actions = [
    { id: 'ajouter-actualite' as AdminAction, label: 'Ajouter une actualité', icon: '📰' },
    { id: 'ajouter-article-doctrine' as AdminAction, label: 'Ajouter un article de doctrine', icon: '📚' },
    { id: 'ajouter-document' as AdminAction, label: 'Ajouter un document', icon: '📄' },
    { id: 'enrichir-article' as AdminAction, label: 'Enrichir un article', icon: '✨' },
  ]

  // Afficher un loader pendant la vérification
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Console d'administration — RIA Facile</title>
        <meta name="description" content="Console d'administration de RIA Facile" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* En-tête avec bouton de déconnexion */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#774792] mb-2">Console d'administration</h1>
              <p className="text-gray-600">
                Connecté en tant que <span className="font-semibold">{profile?.email}</span>
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium shadow-md hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Contenu principal avec sidebar */}
        <div className="flex gap-6">
          {/* Sidebar à gauche */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-4">
              <h2 className="text-lg font-semibold text-[#774792] mb-4">Actions</h2>
              <nav className="space-y-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      selectedAction === action.id
                        ? 'bg-gradient-to-r from-purple-500 to-[#774792] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Zone de contenu principale */}
          <div className="flex-1">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white min-h-[500px]">
              {selectedAction === 'ajouter-actualite' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter une actualité</h2>
                  <p className="text-gray-600 mb-6">Renseignez les champs ci-dessous. Le champ <code>ID</code> est généré automatiquement.</p>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const { error } = await supabase.from('Actu').insert({
                          Titre: actualiteForm.Titre.trim(),
                          Date: actualiteForm.Date,
                          media: actualiteForm.media.trim(),
                          lien: actualiteForm.lien.trim(),
                        })

                        if (error) {
                          throw new Error(error.message)
                        }

                        setFormStatus({ type: 'success', message: 'Actualité ajoutée avec succès.' })
                        setActualiteForm({
                          Titre: '',
                          Date: '',
                          media: '',
                          lien: '',
                        })
                      } catch (err) {
                        setFormStatus({
                          type: 'error',
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                        })
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre*
                      </label>
                      <input
                        type="text"
                        value={actualiteForm.Titre}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, Titre: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Titre de l'actualité"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date*
                      </label>
                      <input
                        type="date"
                        value={actualiteForm.Date}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, Date: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media*
                      </label>
                      <input
                        type="text"
                        value={actualiteForm.media}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, media: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Ex : Le Monde, CNIL..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien*
                      </label>
                      <input
                        type="url"
                        value={actualiteForm.lien}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, lien: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setActualiteForm({
                            Titre: '',
                            Date: '',
                            media: '',
                            lien: '',
                          })
                        }
                        className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter l’actualité'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!selectedAction && (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">Bienvenue dans la console d'administration</h2>
                  <p className="text-gray-500">
                    Sélectionnez une action dans le menu de gauche pour commencer.
                  </p>
                </div>
              )}

              {selectedAction && selectedAction !== 'ajouter-actualite' && (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    {actions.find(a => a.id === selectedAction)?.label}
                  </h2>
                  <p className="text-gray-500">
                    Le contenu de cette action sera ajouté prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminConsolePage
