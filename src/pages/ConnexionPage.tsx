import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ConnexionPage: React.FC = () => {
  const { isAdmin, isAdherent, loading, profile, signOut, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailConfirmed, setEmailConfirmed] = useState(false)

  // Détecter si l'utilisateur vient de confirmer son email
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Le hash contient les paramètres de Supabase après confirmation
      // Format: #access_token=...&type=signup ou #type=signup
      const hashParams = new URLSearchParams(hash.substring(1))
      const type = hashParams.get('type')
      
      if (type === 'signup' || type === 'email_confirmation' || type === 'recovery') {
        setEmailConfirmed(true)
        // Nettoyer l'URL pour ne pas garder le hash
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  // Si on arrive avec ?logout=1, on déconnecte puis on nettoie l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shouldLogout = params.get('logout') === '1'

    if (!shouldLogout) return

    // Utiliser la fonction signOut du contexte qui crée le flag explicit_logout
    signOut().finally(() => {
      params.delete('logout')
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '')
      window.history.replaceState({}, '', newUrl)
    })
  }, [signOut])

  // Rediriger dès que le profil est connu : admin → console, adhérent → mon espace
  useEffect(() => {
    if (loading) return
    if (isAdmin()) {
      navigate('/admin/console', { replace: true })
      return
    }
    if (isAdherent()) {
      navigate('/mon-espace', { replace: true })
    }
  }, [loading, profile, isAdmin, isAdherent, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error, role } = await signIn(email, password)

      if (error) {
        setError(error.message || 'Erreur lors de la connexion')
        return
      }

      // Redirection immédiate selon le rôle (évite de dépendre du cycle de rendu)
      if (role === 'admin') {
        navigate('/admin/console', { replace: true })
      } else {
        navigate('/mon-espace', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const featuresSansAdhesion = [
    'Consultation du règlement (recherche, navigation)',
    'RIA en 5 minutes',
    'Quiz',
    'Schémas explicatifs',
    'Documentation et actualités',
    'Lexique français-anglais',
    'Articles de doctrine',
    'Assistant RIA (accès limité)',
  ]

  // Adhérents : d'abord les mêmes que sans adhésion (affichés en gris), puis les réservés (en violet)
  const featuresAdherentsShared = [
    'Consultation du règlement (recherche, navigation)',
    'RIA en 5 minutes',
    'Quiz',
    'Schémas explicatifs',
    'Documentation et actualités',
    'Lexique français-anglais',
    'Articles de doctrine',
  ]
  const featuresAdherentsOnly = [
    'Assistant RIA (accès illimité)',
    'Questionnaires du vérificateur',
    'Fiches pratiques',
    'Matrice des obligations',
  ]

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Connexion — RIA Facile</title>
        <meta name="description" content="Connexion à RIA Facile. L'adhésion est gratuite et donne accès aux vérificateurs, fiches pratiques et matrice des obligations." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Encart connexion — compact : champs à gauche, bouton + texte à droite */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          {emailConfirmed && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
              <p className="text-green-800 font-medium">Email confirmé. Vous pouvez vous connecter.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring-1 focus:ring-[#774792]/30 text-sm"
                  placeholder="exemple@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pr-10 px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring-1 focus:ring-[#774792]/30 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              </div>
              <div className="sm:shrink-0">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto py-2 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium text-sm shadow-sm hover:shadow transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      Connexion...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-left mt-3">
              Pas de compte ? <Link to="/inscription" className="text-[#774792] hover:underline font-medium">S&apos;inscrire</Link>
              {' · '}
              <Link to="/contact" className="text-[#774792] hover:underline font-medium">Contact</Link>
            </p>
          </form>
        </div>

        {/* Tableau des accès — en dessous */}
        <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-sm text-gray-600 mb-5">
            L&apos;adhésion à RIA Facile est <strong className="font-bold text-[#774792]">gratuite</strong>. Répartition des contenus :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                <h3 className="text-sm font-semibold text-gray-800 text-center">Accessible sans adhésion</h3>
              </div>
              <ul className="px-4 py-3 space-y-2">
                {featuresSansAdhesion.map((label, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5" aria-hidden>
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-purple-100 bg-purple-50/60">
                <h3 className="text-sm font-semibold text-[#774792] text-center">Réservé aux adhérents</h3>
              </div>
              <ul className="px-4 py-3 space-y-2">
                {featuresAdherentsShared.map((label, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5" aria-hidden>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
                {featuresAdherentsOnly.map((label, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#774792] font-medium">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5" aria-hidden>
                      <svg className="w-3 h-3 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white border-2 border-[#774792] text-[#774792] font-semibold text-sm shadow-sm hover:bg-purple-50 transition"
            >
              S&apos;inscrire / Adhérer
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnexionPage

