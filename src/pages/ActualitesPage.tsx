import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

interface Actualite {
  id: number
  Date: string
  media: string
  Titre: string
  lien: string
}

export const ActualitesPage = () => {
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActualites()
  }, [])

  const fetchActualites = async () => {
    try {
      const { data, error } = await supabase
        .from('Actu')
        .select('*')
        .order('Date', { ascending: false })

      if (error) {
        setError(`Erreur: ${error.message}`)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError('Aucune actualité trouvée')
        setLoading(false)
        return
      }

      setActualites(data)
      setLoading(false)
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération des actualités')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4 text-gray-800">Chargement des actualités...</h1>
          <p className="text-sm text-gray-600">Connexion à la base de données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl mb-4 text-gray-800">Erreur</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchActualites}
            className="px-6 py-2 bg-[#774792] text-white rounded-lg hover:bg-[#8a5ba3] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Actualités de la conformité IA</h1>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Média</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Titre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {actualites.map((actu) => (
                  <tr key={actu.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(actu.Date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{actu.media}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{actu.Titre}</td>
                    <td className="px-6 py-4 text-sm">
                      <a 
                        href={actu.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#774792] hover:text-[#8a5ba3] hover:underline transition-colors"
                      >
                        Lire l'article
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 