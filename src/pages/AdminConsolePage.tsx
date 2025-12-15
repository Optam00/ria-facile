import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabasePublic } from '../lib/supabasePublic'

type AdminAction = 'ajouter-actualite' | 'ajouter-article-doctrine' | 'ajouter-document' | 'enrichir-article' | null

const AdminConsolePage: React.FC = () => {
  const { signOut, isAdmin, profile, loading, session } = useAuth()
  const navigate = useNavigate()
  const [selectedAction, setSelectedAction] = useState<AdminAction>(null)
  const [actualiteForm, setActualiteForm] = useState({
    Titre: '',
    Date: '',
    media: '',
    lien: '',
  })
  const [docForm, setDocForm] = useState({
    titre: '',
    auteur: '',
    lien: '',
    date: '',
    resume: '',
    themes: '',
    langue: '',
  })
  const [doctrineForm, setDoctrineForm] = useState({
    titre: '',
    date: '',
    abstract: '',
    intro: '',
    titre1: '',
    'sous-titre1': '',
    contenu1: '',
    'sous-titre2': '',
    contenu2: '',
    titre2: '',
    'sous-titre3': '',
    contenu3: '',
    'sous-titre4': '',
    contenu4: '',
    conclusion: '',
    references: '',
    auteur: '',
    theme: '',
  })
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [articlesList, setArticlesList] = useState<Array<{ id_article: number; numero: string; titre: string }>>([])
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [isArticleDropdownOpen, setIsArticleDropdownOpen] = useState(false)
  const [articleSearch, setArticleSearch] = useState('')
  const [enrichForm, setEnrichForm] = useState({
    numero: '',
    titre: '',
    resume: '',
    recitals: '',
    fiches: '',
    doc_associee: '',
  })
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const getAuthHeaders = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuration Supabase manquante côté client')
    }
    if (!session?.access_token) {
      throw new Error('Session administrateur introuvable')
    }
    return {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    } as const
  }

  // Rediriger si l'utilisateur n'est pas admin une fois la session chargée
  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/connexion')
    }
  }, [loading, isAdmin, navigate])

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
    } else if (selectedAction === 'ajouter-document') {
      setDocForm({
        titre: '',
        auteur: '',
        lien: '',
        date: '',
        resume: '',
        themes: '',
        langue: '',
      })
    } else if (selectedAction === 'ajouter-article-doctrine') {
      setDoctrineForm({
        titre: '',
        date: '',
        abstract: '',
        intro: '',
        titre1: '',
        'sous-titre1': '',
        contenu1: '',
        'sous-titre2': '',
        contenu2: '',
        titre2: '',
        'sous-titre3': '',
        contenu3: '',
        'sous-titre4': '',
        contenu4: '',
        conclusion: '',
        references: '',
        auteur: '',
        theme: '',
      })
    }
  }, [selectedAction])
  const selectedArticle = selectedArticleId
    ? articlesList.find((a) => a.id_article === selectedArticleId) ?? null
    : null
  const filteredArticles = articlesList.filter((article) => {
    const q = articleSearch.trim().toLowerCase()
    if (!q) return true
    return (
      article.numero.toLowerCase().includes(q) ||
      article.titre.toLowerCase().includes(q)
    )
  })

  // Charger la liste des articles quand on arrive sur "enrichir un article"
  useEffect(() => {
    if (selectedAction !== 'enrichir-article') return

    const loadArticles = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('article')
          .select('id_article, numero, titre')
          .order('id_article')

        if (error) throw error
        setArticlesList(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des articles pour enrichissement:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des articles. Réessayez plus tard.",
        })
      }
    }

    loadArticles()
  }, [selectedAction])

  const handleSignOut = () => {
    // On délègue le signOut à la page connexion via le paramètre logout=1
    window.location.assign('/connexion?logout=1')
  }

  const actions = [
    { id: 'ajouter-actualite' as AdminAction, label: 'Ajouter une actualité', icon: '📰' },
    { id: 'ajouter-article-doctrine' as AdminAction, label: 'Ajouter un article de doctrine', icon: '📚' },
    { id: 'ajouter-document' as AdminAction, label: 'Ajouter un document', icon: '📄' },
    { id: 'enrichir-article' as AdminAction, label: 'Enrichir un article', icon: '✨' },
  ]

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
                Connecté en tant que{' '}
                <span className="font-semibold">
                  {profile?.email ?? session?.user.email ?? 'Administrateur'}
                </span>
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (en haut sur mobile, à gauche sur desktop) */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-4">
              <h2 className="text-lg font-semibold text-[#774792] mb-4">Actions</h2>
              <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
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
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/Actu`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            Titre: actualiteForm.Titre.trim(),
                            Date: actualiteForm.Date,
                            media: actualiteForm.media.trim(),
                            lien: actualiteForm.lien.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
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

              {selectedAction === 'ajouter-document' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter un document</h2>
                  <p className="text-gray-600 mb-6">
                    Les champs ci-dessous correspondent à la table <code>docs</code> de Supabase. L&apos;ID est généré automatiquement.
                  </p>

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
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/docs`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            titre: docForm.titre.trim(),
                            auteur: docForm.auteur.trim() || null,
                            lien: docForm.lien.trim(),
                            date: docForm.date,
                            resume: docForm.resume.trim(),
                            themes: docForm.themes.trim(),
                            langue: docForm.langue.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
                        }

                        setFormStatus({ type: 'success', message: 'Document ajouté avec succès.' })
                        setDocForm({
                          titre: '',
                          auteur: '',
                          lien: '',
                          date: '',
                          resume: '',
                          themes: '',
                          langue: '',
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
                        value={docForm.titre}
                        onChange={(e) => setDocForm({ ...docForm, titre: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Titre du document"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auteur
                      </label>
                      <input
                        type="text"
                        value={docForm.auteur}
                        onChange={(e) => setDocForm({ ...docForm, auteur: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Nom de l'auteur"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date*
                      </label>
                      <input
                        type="date"
                        value={docForm.date}
                        onChange={(e) => setDocForm({ ...docForm, date: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien*
                      </label>
                      <input
                        type="url"
                        value={docForm.lien}
                        onChange={(e) => setDocForm({ ...docForm, lien: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Résumé*
                      </label>
                      <textarea
                        value={docForm.resume}
                        onChange={(e) => setDocForm({ ...docForm, resume: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        placeholder="Résumé du document"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thèmes (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={docForm.themes}
                        onChange={(e) => setDocForm({ ...docForm, themes: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Ex : conformité, gouvernance, risques"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue(s)
                      </label>
                      <input
                        type="text"
                        value={docForm.langue}
                        onChange={(e) => setDocForm({ ...docForm, langue: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Ex : FR, EN"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDocForm({
                            titre: '',
                            auteur: '',
                            lien: '',
                            date: '',
                            resume: '',
                            themes: '',
                            langue: '',
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
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter le document'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedAction === 'ajouter-article-doctrine' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter un article de doctrine</h2>
                  <p className="text-gray-600 mb-6">
                    Les champs ci-dessous correspondent à la table <code>doctrine</code> de Supabase. L&apos;ID est généré automatiquement.
                  </p>

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
                    className="space-y-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/doctrine`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            titre: doctrineForm.titre.trim(),
                            date: doctrineForm.date,
                            abstract: doctrineForm.abstract.trim(),
                            intro: doctrineForm.intro.trim(),
                            titre1: doctrineForm.titre1.trim(),
                            'sous-titre1': doctrineForm['sous-titre1'].trim(),
                            contenu1: doctrineForm.contenu1.trim(),
                            'sous-titre2': doctrineForm['sous-titre2'].trim(),
                            contenu2: doctrineForm.contenu2.trim(),
                            titre2: doctrineForm.titre2.trim(),
                            'sous-titre3': doctrineForm['sous-titre3'].trim(),
                            contenu3: doctrineForm.contenu3.trim(),
                            'sous-titre4': doctrineForm['sous-titre4'].trim(),
                            contenu4: doctrineForm.contenu4.trim(),
                            conclusion: doctrineForm.conclusion.trim(),
                            references: doctrineForm.references.trim(),
                            auteur: doctrineForm.auteur.trim(),
                            theme: doctrineForm.theme.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
                        }

                        setFormStatus({ type: 'success', message: 'Article de doctrine ajouté avec succès.' })
                        setDoctrineForm({
                          titre: '',
                          date: '',
                          abstract: '',
                          intro: '',
                          titre1: '',
                          'sous-titre1': '',
                          contenu1: '',
                          'sous-titre2': '',
                          contenu2: '',
                          titre2: '',
                          'sous-titre3': '',
                          contenu3: '',
                          'sous-titre4': '',
                          contenu4: '',
                          conclusion: '',
                          references: '',
                          auteur: '',
                          theme: '',
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre*
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.titre}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, titre: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Titre de l'article"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date*
                        </label>
                        <input
                          type="date"
                          value={doctrineForm.date}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, date: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auteur*
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.auteur}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, auteur: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Nom de l'auteur"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thème
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.theme}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, theme: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Ex : gouvernance, transparence..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Résumé (abstract)*
                      </label>
                      <textarea
                        value={doctrineForm.abstract}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, abstract: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introduction*
                      </label>
                      <textarea
                        value={doctrineForm.intro}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, intro: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre de la première partie (titre1)
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.titre1}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, titre1: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 1.1
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre1']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre1': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 1.1
                        </label>
                        <textarea
                          value={doctrineForm.contenu1}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu1: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 1.2
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre2']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre2': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 1.2
                        </label>
                        <textarea
                          value={doctrineForm.contenu2}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu2: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre de la deuxième partie (titre2)
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.titre2}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, titre2: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 2.1
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre3']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre3': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 2.1
                        </label>
                        <textarea
                          value={doctrineForm.contenu3}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu3: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 2.2
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre4']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre4': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 2.2
                        </label>
                        <textarea
                          value={doctrineForm.contenu4}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu4: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conclusion
                      </label>
                      <textarea
                        value={doctrineForm.conclusion}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, conclusion: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Références (une par ligne)
                      </label>
                      <textarea
                        value={doctrineForm.references}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, references: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDoctrineForm({
                            titre: '',
                            date: '',
                            abstract: '',
                            intro: '',
                            titre1: '',
                            'sous-titre1': '',
                            contenu1: '',
                            'sous-titre2': '',
                            contenu2: '',
                            titre2: '',
                            'sous-titre3': '',
                            contenu3: '',
                            'sous-titre4': '',
                            contenu4: '',
                            conclusion: '',
                            references: '',
                            auteur: '',
                            theme: '',
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
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter l’article de doctrine'}
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

              {selectedAction === 'enrichir-article' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Enrichir un article</h2>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez un article par son numéro, puis complétez ou modifiez les champs ci-dessous :{' '}
                    <span className="font-medium">considérants (recitals)</span>, <span className="font-medium">résumé</span>,{' '}
                    <span className="font-medium">fiches pratiques</span> et <span className="font-medium">document associé</span>.
                  </p>

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

                  <div className="space-y-6">
                    {/* Sélection de l'article par numéro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner l&apos;article (par numéro)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:max-w-md">
                          <button
                            type="button"
                            onClick={() => setIsArticleDropdownOpen((v) => !v)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-left hover:border-[#774792] focus:outline-none focus:ring-2 focus:ring-purple-200"
                          >
                            <span className="truncate text-sm text-gray-800">
                              {selectedArticle
                                ? `${selectedArticle.numero} — ${selectedArticle.titre}`
                                : 'Choisir un article…'}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                isArticleDropdownOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {isArticleDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-hidden">
                              <div className="p-2 border-b border-gray-100 bg-gray-50">
                                <input
                                  type="text"
                                  value={articleSearch}
                                  onChange={(e) => setArticleSearch(e.target.value)}
                                  placeholder="Filtrer par numéro ou titre…"
                                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-300"
                                />
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {filteredArticles.length === 0 ? (
                                  <div className="px-4 py-3 text-xs text-gray-500">
                                    Aucun article ne correspond à votre recherche.
                                  </div>
                                ) : (
                                  filteredArticles.map((article) => (
                                    <button
                                      key={article.id_article}
                                      type="button"
                                      onClick={async () => {
                                        const value = article.id_article
                                        setSelectedArticleId(value)
                                        setIsArticleDropdownOpen(false)
                                        setArticleSearch('')
                                        setFormStatus({ type: null, message: '' })

                                        setIsLoadingArticle(true)
                                        try {
                                          const { data, error } = await supabasePublic
                                            .from('article')
                                            .select('id_article, numero, titre, resume, recitals, fiches, doc_associee')
                                            .eq('id_article', value)
                                            .single()

                                          if (error) throw error

                                          setEnrichForm({
                                            numero: data.numero ?? '',
                                            titre: data.titre ?? '',
                                            resume: data.resume ?? '',
                                            recitals: data.recitals ?? '',
                                            fiches: data.fiches ?? '',
                                            doc_associee: (data as any).doc_associee ?? '',
                                          })
                                        } catch (err) {
                                          console.error('Erreur lors du chargement de l’article à enrichir:', err)
                                          setFormStatus({
                                            type: 'error',
                                            message:
                                              "Impossible de charger cet article. Réessayez ou choisissez-en un autre.",
                                          })
                                        } finally {
                                          setIsLoadingArticle(false)
                                        }
                                      }}
                                      className={`w-full px-4 py-2 text-sm text-left flex flex-col gap-0.5 hover:bg-purple-50 ${
                                        selectedArticleId === article.id_article ? 'bg-purple-50' : ''
                                      }`}
                                    >
                                      <span className="font-medium text-gray-900">{article.numero}</span>
                                      <span className="text-xs text-gray-600 truncate">{article.titre}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {isLoadingArticle && (
                          <span className="text-sm text-gray-500 flex items-center">
                            Chargement de l&apos;article…
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedArticleId && (
                      <form
                        className="space-y-5 mt-4"
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (!selectedArticleId) return
                          setIsSubmitting(true)
                          setFormStatus({ type: null, message: '' })

                          try {
                            const headers = getAuthHeaders()
                            const response = await fetch(
                              `${supabaseUrl}/rest/v1/article?id_article=eq.${selectedArticleId}`,
                              {
                                method: 'PATCH',
                                headers,
                                body: JSON.stringify({
                                  resume: enrichForm.resume.trim(),
                                  recitals: enrichForm.recitals.trim(),
                                  fiches: enrichForm.fiches.trim(),
                                  doc_associee: enrichForm.doc_associee.trim() || null,
                                }),
                              }
                            )

                            if (!response.ok) {
                              const text = await response.text()
                              throw new Error(text || `Erreur Supabase (${response.status})`)
                            }

                            setFormStatus({
                              type: 'success',
                              message: 'Article enrichi avec succès.',
                            })
                          } catch (err) {
                            console.error('Erreur lors de la mise à jour de l’article:', err)
                            setFormStatus({
                              type: 'error',
                              message:
                                err instanceof Error
                                  ? err.message
                                  : "Une erreur est survenue lors de l'enregistrement.",
                            })
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                      >
                        {/* Rappel numéro + titre */}
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                          <p className="text-sm text-purple-900 font-medium">
                            Article sélectionné :{' '}
                            <span className="font-semibold">
                              {enrichForm.numero} — {enrichForm.titre}
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Considérants associés (champ <code>recitals</code>)
                            </label>
                            <input
                              type="text"
                              value={enrichForm.recitals}
                              onChange={(e) => setEnrichForm({ ...enrichForm, recitals: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                              placeholder="Ex : 12, 13-16, 20"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Format suggéré : liste de numéros séparés par des virgules et/ou des intervalles (par exemple
                              &quot;12, 13-16, 20&quot;).
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Résumé de l&apos;article (champ <code>resume</code>)
                            </label>
                            <textarea
                              value={enrichForm.resume}
                              onChange={(e) => setEnrichForm({ ...enrichForm, resume: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                              placeholder="Résumé pédagogique de l'article…"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fiches pratiques associées (champ <code>fiches</code>)
                            </label>
                            <textarea
                              value={enrichForm.fiches}
                              onChange={(e) => setEnrichForm({ ...enrichForm, fiches: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[80px]"
                              placeholder='Ex : "/fiches-pratiques/exactitude", "/fiches-pratiques/controle-humain"…'
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Vous pouvez saisir des chemins internes (ex. <code>/fiches-pratiques/exactitude</code>) ou des
                              URLs complètes, séparées par des virgules.
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Document associé (champ <code>doc_associee</code>)
                            </label>
                            <input
                              type="text"
                              value={enrichForm.doc_associee}
                              onChange={(e) => setEnrichForm({ ...enrichForm, doc_associee: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                              placeholder="Identifiant ou lien vers un document complémentaire"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEnrichForm({
                                numero: enrichForm.numero,
                                titre: enrichForm.titre,
                                resume: '',
                                recitals: '',
                                fiches: '',
                                doc_associee: '',
                              })
                              setFormStatus({ type: null, message: '' })
                            }}
                            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                          >
                            Réinitialiser les champs
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
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
