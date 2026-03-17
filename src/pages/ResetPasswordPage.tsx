import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null)

  // Vérifier qu'il existe bien une session active (lien magique / connexion depuis un email)
  useEffect(() => {
    let cancelled = false
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (cancelled) return
        setIsValidLink(!!data?.user)
      } catch {
        if (!cancelled) setIsValidLink(false)
      }
    }
    checkUser()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message || 'Erreur lors de la mise à jour du mot de passe.')
        return
      }

      setSuccess(true)

      // Après quelques secondes, rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/connexion', { replace: true })
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du mot de passe.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Définir un mot de passe — RIA Facile</title>
        <meta
          name="description"
          content="Choisissez un nouveau mot de passe pour votre compte RIA Facile."
        />
      </Helmet>

      <div className="max-w-md mx-auto">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Définir un nouveau mot de passe</h1>
          <p className="text-sm text-gray-600 mb-6">
            Choisissez un nouveau mot de passe pour votre compte après avoir cliqué sur le lien reçu par email.
          </p>

          {isValidLink === false && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              Ce lien de réinitialisation n&apos;est plus valide. Veuillez refaire une demande de&nbsp;
              <button
                type="button"
                onClick={() => navigate('/connexion')}
                className="underline font-semibold"
              >
                mot de passe oublié
              </button>
              .
            </div>
          )}

          {isValidLink === null && (
            <div className="mb-4 text-gray-500 text-sm">
              Vérification du lien en cours…
            </div>
          )}

          {isValidLink && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
                  Mot de passe mis à jour. Vous allez être redirigé vers la page de connexion…
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isSubmitting || !!success}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring-1 focus:ring-[#774792]/30 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isSubmitting || !!success}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring-1 focus:ring-[#774792]/30 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!success || isValidLink === false}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium text-sm shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage

