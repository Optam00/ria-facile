import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Select from 'react-select'

interface FichePratique {
  id: string
  titre: string
  description: string
  categorie?: string
  duree?: string
  articlesRIA: string[] // Articles du RIA associés (ex: ["10", "15", "26"])
  dateCreation: string // Date de création au format "YYYY-MM-DD"
}

interface FilterOption {
  value: string
  label: string
}

const fichesPratiques: FichePratique[] = [
  {
    id: 'exactitude',
    titre: "Gérer l'exactitude (Accuracy) dans les systèmes IA",
    description: "Guide pratique pour la mise en conformité opérationnelle du principe d'exactitude. Croisement RGPD et AI Act.",
    categorie: 'Conformité',
    duree: '15 min de lecture',
    articlesRIA: ['10', '15'],
    dateCreation: '2025-01-15'
  },
  {
    id: 'explicabilite',
    titre: "Explicabilité & Interprétabilité dans les systèmes IA",
    description: "Guide pratique pour la mise en conformité opérationnelle de l'explicabilité et l'interprétabilité. Croisement RGPD et AI Act.",
    categorie: 'Conformité',
    duree: '15 min de lecture',
    articlesRIA: ['13', '14', '86'],
    dateCreation: '2025-01-20'
  }
]

const FichesPratiquesPage: React.FC = () => {
  const [selectedArticles, setSelectedArticles] = useState<FilterOption[]>([])

  // Fonction pour formater la date en français
  const formaterDate = (dateString: string): string => {
    const date = new Date(dateString)
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`
  }

  // Extraire tous les articles uniques des fiches
  const articlesDisponibles = useMemo(() => {
    const articlesSet = new Set<string>()
    fichesPratiques.forEach(fiche => {
      fiche.articlesRIA.forEach(article => articlesSet.add(article))
    })
    return Array.from(articlesSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(article => ({
        value: article,
        label: `Article ${article}`
      }))
  }, [])

  // Filtrer les fiches selon les articles sélectionnés
  const fichesFiltrees = useMemo(() => {
    if (selectedArticles.length === 0) {
      return fichesPratiques
    }
    const articlesSelectionnes = selectedArticles.map(a => a.value)
    return fichesPratiques.filter(fiche =>
      fiche.articlesRIA.some(article => articlesSelectionnes.includes(article))
    )
  }, [selectedArticles])

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
        {articlesDisponibles.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md p-4 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          </div>
        )}

        {fichesPratiques.length === 0 ? (
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
                to={`/fiches-pratiques/${fiche.id}`}
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
                    {fiche.articlesRIA && fiche.articlesRIA.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Articles RIA associés :</p>
                        <div className="flex flex-wrap gap-2">
                          {fiche.articlesRIA.map((article) => (
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
                    {fiche.dateCreation && (
                      <p className="text-xs text-gray-500 mb-4">
                        Créée le {formaterDate(fiche.dateCreation)}
                      </p>
                    )}
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


