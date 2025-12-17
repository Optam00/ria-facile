import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const InscriptionPage: React.FC = () => {
  const { isAdmin, isAdherent, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [profession, setProfession] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin/console', { replace: true })
    } else if (isAdherent()) {
      navigate('/', { replace: true })
    }
  }, [loading, isAdmin, isAdherent, navigate])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une majuscule'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une minuscule'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Vérifications
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    try {
      // Créer le compte avec Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'adherent',
            nom: nom.trim() || null,
            prenom: prenom.trim() || null,
            profession: profession.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/connexion`,
        },
      })

      if (signUpError) {
        console.error('Erreur signUp:', signUpError)
        if (signUpError.message.includes('already registered')) {
          setError('Un compte existe déjà avec cet email')
        } else {
          setError(signUpError.message || 'Erreur lors de l\'inscription')
        }
        setIsLoading(false)
        return
      }

      // Vérifier si l'utilisateur a été créé
      if (data.user) {
        // Créer le profil dans la table profiles (en arrière-plan, sans bloquer)
        supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            role: 'adherent',
            nom: nom.trim() || null,
            prenom: prenom.trim() || null,
            profession: profession.trim() || null,
          })
          .then(({ error: profileError }) => {
            if (profileError) {
              console.error('Erreur création profil (non bloquante):', profileError)
            }
          })

        setSuccess(true)
        setIsLoading(false)
      } else {
        // Cas rare : pas d'erreur mais pas d'utilisateur non plus
        setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Exception lors de l\'inscription:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen p-4">
        <Helmet>
          <title>Inscription réussie — RIA Facile</title>
        </Helmet>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Inscription réussie !</h1>
            <p className="text-gray-600 mb-4">
              Un email de confirmation vous a été envoyé à <strong>{email}</strong>.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-amber-800 font-medium mb-1">Vérifiez votre boîte mail</p>
                  <p className="text-amber-700 text-sm">
                    Cliquez sur le lien dans l'email pour activer votre compte.
                    <br />
                    <strong>Pensez à vérifier vos spams / courriers indésirables</strong> si vous ne trouvez pas l'email.
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/connexion"
              className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Aller à la page de connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Inscription Adhérent — RIA Facile</title>
        <meta name="description" content="Créez votre compte adhérent RIA Facile pour accéder à tous les contenus exclusifs" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-2 text-[#774792] text-center">Devenir adhérent</h1>
          <p className="text-gray-600 text-center mb-8">
            Créez votre compte pour accéder à tous les contenus RIA Facile
          </p>

          {/* Formulaire d'inscription */}
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

            {/* Champs optionnels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                Profession <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
                placeholder="Ex: Juriste, DPO, Développeur..."
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.58" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c1.51 0 2.94.33 4.23.93M19.542 12A10.97 10.97 0 0112 19c-4.478 0-8.268-2.943-9.542-7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                8 caractères minimum, avec majuscule, minuscule et chiffre
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe*
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Inscription en cours...
                </span>
              ) : (
                "Créer mon compte adhérent"
              )}
            </button>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Vous avez déjà un compte ?{' '}
              <Link to="/connexion" className="text-[#774792] hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InscriptionPage

