import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ActualiteFormData {
  Titre: string
  Date: string
  media: string
  lien: string
}

export const AddActualiteForm: React.FC = () => {
  const [formData, setFormData] = useState<ActualiteFormData>({
    Titre: '',
    Date: '',
    media: '',
    lien: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Réinitialiser les messages d'erreur/succès lors de la modification
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    // Timeout de sécurité (30 secondes)
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false)
        setError('La requête a pris trop de temps. Veuillez réessayer.')
        console.error('Timeout lors de l\'ajout de l\'actualité')
      }
    }, 30000)

    try {
      // Validation des champs requis
      if (!formData.Titre.trim()) {
        clearTimeout(timeoutId)
        setError('Le titre est requis')
        setIsSubmitting(false)
        return
      }
      if (!formData.Date.trim()) {
        clearTimeout(timeoutId)
        setError('La date est requise')
        setIsSubmitting(false)
        return
      }
      if (!formData.media.trim()) {
        clearTimeout(timeoutId)
        setError('Le média est requis')
        setIsSubmitting(false)
        return
      }
      if (!formData.lien.trim()) {
        clearTimeout(timeoutId)
        setError('Le lien est requis')
        setIsSubmitting(false)
        return
      }

      console.log('Tentative d\'insertion dans Supabase:', {
        Titre: formData.Titre.trim(),
        Date: formData.Date.trim(),
        media: formData.media.trim(),
        lien: formData.lien.trim(),
      })

      // Insérer dans Supabase
      const { data, error: insertError } = await supabase
        .from('Actu')
        .insert([{
          Titre: formData.Titre.trim(),
          Date: formData.Date.trim(),
          media: formData.media.trim(),
          lien: formData.lien.trim(),
        }])
        .select()

      clearTimeout(timeoutId)

      if (insertError) {
        console.error('Erreur Supabase détaillée:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        })
        throw insertError
      }

      console.log('Actualité ajoutée avec succès:', data)

      // Succès
      setSuccess(true)
      // Réinitialiser le formulaire
      setFormData({
        Titre: '',
        Date: '',
        media: '',
        lien: '',
      })

      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error('Erreur lors de l\'ajout de l\'actualité:', err)
      
      // Message d'erreur plus détaillé
      let errorMessage = 'Une erreur est survenue lors de l\'ajout de l\'actualité'
      
      if (err?.message) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      // Ajouter des détails si disponibles
      if (err?.details) {
        errorMessage += ` (${err.details})`
      } else if (err?.hint) {
        errorMessage += ` (${err.hint})`
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-[#774792] mb-6">Ajouter une actualité</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            <p className="text-sm font-medium">✓ Actualité ajoutée avec succès !</p>
          </div>
        )}

        {/* Champ Titre */}
        <div>
          <label htmlFor="Titre" className="block text-sm font-medium text-gray-700 mb-2">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="Titre"
            name="Titre"
            value={formData.Titre}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
            placeholder="Titre de l'actualité"
          />
        </div>

        {/* Champ Date */}
        <div>
          <label htmlFor="Date" className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="Date"
            name="Date"
            value={formData.Date}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
          />
        </div>

        {/* Champ Média */}
        <div>
          <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-2">
            Média <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="media"
            name="media"
            value={formData.media}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
            placeholder="Ex: Le Monde, France Info, etc."
          />
        </div>

        {/* Champ Lien */}
        <div>
          <label htmlFor="lien" className="block text-sm font-medium text-gray-700 mb-2">
            Lien <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="lien"
            name="lien"
            value={formData.lien}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors shadow-sm"
            placeholder="https://exemple.com/article"
          />
        </div>

        {/* Bouton de soumission */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Ajout en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter l'actualité
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
