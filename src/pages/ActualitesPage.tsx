import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

interface Actualite {
  id: number
  Date: string
  media: string
  Titre: string
  lien: string
}

export const ActualitesPage = () => {
  const [actualites, setActualites] = useState<Actualite[]>([])
  const [filteredActualites, setFilteredActualites] = useState<Actualite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaFilter, setMediaFilter] = useState<string>('')
  const [uniqueMedias, setUniqueMedias] = useState<string[]>([])

  useEffect(() => {
    fetchActualites()
  }, [])

  useEffect(() => {
    if (actualites.length > 0) {
      // Extraire les médias uniques
      const medias = [...new Set(actualites.map(actu => actu.media))].sort()
      setUniqueMedias(medias)
      
      // Appliquer les filtres
      let filtered = [...actualites]
      if (mediaFilter) {
        filtered = filtered.filter(actu => actu.media === mediaFilter)
      }
      setFilteredActualites(filtered)
    }
  }, [actualites, mediaFilter])

  const fetchActualites = async () => {
    try {
      console.log('ActualitesPage - Début de la récupération des actualités');
      console.log('ActualitesPage - Client Supabase initialisé:', !!supabase);

      const { data, error } = await supabase
        .from('Actu')
        .select('*')
        .order('Date', { ascending: false });

      console.log('ActualitesPage - Réponse de Supabase:', {
        success: !!data,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null,
        dataCount: data?.length || 0,
        firstItem: data?.[0] ? {
          id: data[0].id,
          titre: data[0].Titre,
          date: data[0].Date
        } : null
      });

      if (error) {
        console.error('ActualitesPage - Erreur Supabase:', error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('ActualitesPage - Aucune actualité trouvée');
        setError('Aucune actualité trouvée');
        setLoading(false);
        return;
      }

      console.log('ActualitesPage - Actualités récupérées avec succès:', {
        count: data.length,
        items: data.map(item => ({
          id: item.id,
          titre: item.Titre,
          date: item.Date
        }))
      });

      setActualites(data);
      setFilteredActualites(data);
      setLoading(false);
    } catch (err) {
      console.error('ActualitesPage - Erreur inattendue:', err);
      setError('Une erreur est survenue lors de la récupération des actualités');
      setLoading(false);
    }
  }

  const handleMediaFilterChange = (media: string) => {
    setMediaFilter(media === mediaFilter ? '' : media)
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
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filtrer par média :</span>
              <div className="relative inline-block min-w-[200px]">
                <select
                  value={mediaFilter}
                  onChange={(e) => handleMediaFilterChange(e.target.value)}
                  className="w-full appearance-none bg-white/50 backdrop-blur-sm border border-purple-200 rounded-lg px-3 py-2 pr-10 text-sm text-gray-700 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <option value="">Tous les médias</option>
                  {uniqueMedias.map((media) => (
                    <option key={media} value={media}>{media}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-purple-500">
                  <svg className="fill-current h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                  </svg>
                </div>
              </div>
            </div>
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
                {filteredActualites.map((actu) => (
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