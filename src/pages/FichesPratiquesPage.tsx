import React, { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { supabasePublic } from '../lib/supabasePublic'

interface FichePratique {
  id: number
  slug: string
  titre: string
  description: string
  categorie?: string
  duree?: string
  articles_ria: string[] // Articles du RIA associés (ex: ["10", "15", "26"])
  image_url?: string
  concerne_rgpd?: boolean
}

interface FilterOption {
  value: string
  label: string
}

const FichesPratiquesPage: React.FC = () => {
  const [selectedArticles, setSelectedArticles] = useState<FilterOption[]>([])
  const [filterRGPD, setFilterRGPD] = useState<boolean>(false)
  const [fichesPratiques, setFichesPratiques] = useState<FichePratique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiches = async () => {
      try {
        const { data, error: fetchError } = await supabasePublic
          .from('fiches_pratiques')
          .select('id, slug, titre, description, categorie, duree, articles_ria, image_url, concerne_rgpd')
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setFichesPratiques(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des fiches pratiques:', err)
        setError('Impossible de charger les fiches pratiques')
      } finally {
        setLoading(false)
      }
    }

    fetchFiches()
  }, [])

  // Extraire tous les articles uniques des fiches
  const articlesDisponibles = useMemo(() => {
    const articlesSet = new Set<string>()
    fichesPratiques.forEach(fiche => {
      if (fiche.articles_ria) {
        fiche.articles_ria.forEach(article => articlesSet.add(article))
      }
    })
    return Array.from(articlesSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(article => ({
        value: article,
        label: `Article ${article}`
      }))
  }, [fichesPratiques])

  // Filtrer les fiches selon les articles sélectionnés et le filtre RGPD
  const fichesFiltrees = useMemo(() => {
    let filtered = fichesPratiques

    // Filtrer par RGPD si activé
    if (filterRGPD) {
      filtered = filtered.filter(fiche => fiche.concerne_rgpd === true)
    }

    // Filtrer par articles si sélectionnés
    if (selectedArticles.length > 0) {
      const articlesSelectionnes = selectedArticles.map(a => a.value)
      filtered = filtered.filter(fiche =>
        fiche.articles_ria && fiche.articles_ria.some(article => articlesSelectionnes.includes(article))
      )
    }

    return filtered
  }, [selectedArticles, filterRGPD, fichesPratiques])

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Fiches pratiques — RIA Facile</title>
        <meta name="description" content="Guides pratiques pour appliquer le Règlement IA. Retrouvez des fiches détaillées pour vous mettre en conformité." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#774792' }}>
              Fiches pratiques
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm">
              Ces fiches pratiques sont conçues pour préciser et approfondir les articles du Règlement IA. 
              Dans la page <a href="/consulter" className="text-purple-600 hover:text-purple-700 underline">"Consulter"</a>, 
              vous trouverez sous chaque article concerné un renvoi vers les fiches pratiques associées.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg border border-purple-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtre par articles */}
            {articlesDisponibles.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Filtrer par article du RIA
                </label>
                <Select
                  isMulti
                  options={articlesDisponibles}
                  value={selectedArticles}
                  onChange={(selected) => setSelectedArticles(selected as FilterOption[])}
                  placeholder="Sélectionner les articles"
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
                {selectedArticles.length > 0 && (
                  <p className="text-xs text-purple-600 mt-2 font-medium">
                    {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} sélectionné{selectedArticles.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Filtre RGPD */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Conformité RGPD
              </label>
              <label htmlFor="filter-rgpd" className="flex items-start cursor-pointer group">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    id="filter-rgpd"
                    checked={filterRGPD}
                    onChange={(e) => setFilterRGPD(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <span className={`text-sm ${filterRGPD ? 'text-gray-900 font-medium' : 'text-gray-700'} group-hover:text-gray-900 transition-colors`}>
                    Afficher uniquement les fiches concernant aussi la conformité RGPD
                  </span>
                  {filterRGPD && (
                    <p className="text-xs text-blue-600 mt-1 font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Filtre actif
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-gray-600 mt-4">Chargement des fiches pratiques...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : fichesPratiques.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <p className="text-gray-600">Les fiches pratiques seront bientôt disponibles.</p>
          </div>
        ) : fichesFiltrees.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-gray-600 font-medium">Aucune fiche ne correspond aux filtres sélectionnés</p>
            <p className="text-gray-500 mt-2">Essayez de modifier vos critères de filtrage</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fichesFiltrees.map((fiche) => (
              <Link
                key={fiche.id}
                to={`/fiches-pratiques/${fiche.slug}`}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    {fiche.categorie && (
                      <span className="inline-block text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-3">
                        {fiche.categorie}
                      </span>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                      {fiche.titre}
                    </h2>
                    {fiche.articles_ria && fiche.articles_ria.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Articles RIA associés :</p>
                        <div className="flex flex-wrap gap-2">
                          {fiche.articles_ria.map((article) => (
                            <span
                              key={article}
                              className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
                            >
                              Art. {article}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {fiche.description}
                    </p>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Lire la fiche</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FichesPratiquesPage


