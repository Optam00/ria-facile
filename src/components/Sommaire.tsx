import React, { useState, useEffect } from 'react'
import { supabasePublic } from '@/lib/supabasePublic'

interface ConsiderantType {
  numero: number
}

interface ArticleType {
  titre: string
  id_chapitre: number
  id_section?: number
  id_article: number
  numero: string
  contenu: string
}

interface SectionType {
  id_section: number
  titre: string
  id_chapitre: number
  articles?: ArticleType[]
}

interface ChapitreType {
  id_chapitre: number
  titre: string
  sections?: SectionType[]
  articles?: ArticleType[] // Articles directement dans le chapitre
}

interface SubdivisionType {
  titre_section: string
  id_annexe: number
  contenu: string
}

interface AnnexeType {
  numero: number
  titre: string
  id_annexe?: number
  contenu?: string
  subdivisions?: SubdivisionType[]
}

interface SommaireProps {
  onConsiderantClick: (numero: number) => void
  onChapitreClick: (id: number) => void
  onArticleClick: (article: ArticleType) => void
  onAnnexeClick?: (annexe: AnnexeType, subdivision?: SubdivisionType) => void
  onSectionClick: (section: SectionType) => void
  defaultOpen?: boolean
  forceOpen?: boolean
}

export const Sommaire: React.FC<SommaireProps> = ({ 
  onConsiderantClick, 
  onChapitreClick, 
  onArticleClick,
  onAnnexeClick,
  onSectionClick,
  defaultOpen = false,
  forceOpen = false
}) => {
  const [isConsiderantsOpen, setIsConsiderantsOpen] = useState(() => {
    const saved = localStorage.getItem('isConsiderantsOpen')
    return saved ? JSON.parse(saved) : defaultOpen
  })
  const [isDispositifOpen, setIsDispositifOpen] = useState(true)
  const [isAnnexesOpen, setIsAnnexesOpen] = useState(() => {
    const saved = localStorage.getItem('isAnnexesOpen')
    return saved ? JSON.parse(saved) : defaultOpen
  })
  const [openChapitres, setOpenChapitres] = useState<number[]>([])
  const [considerants, setConsiderants] = useState<ConsiderantType[]>([])
  const [chapitres, setChapitres] = useState<ChapitreType[]>([])
  const [annexes, setAnnexes] = useState<AnnexeType[]>([])
  const [chapitresError, setChapitresError] = useState<string | null>(null)
  const [considerantsError, setConsiderantsError] = useState<string | null>(null)
  const [annexesError, setAnnexesError] = useState<string | null>(null)

  const toggleChapitre = (chapitreId: number) => {
    setOpenChapitres(prev => 
      prev.includes(chapitreId) 
        ? prev.filter(id => id !== chapitreId)
        : [...prev, chapitreId]
    )
  }

  useEffect(() => {
    if (forceOpen) {
      setIsConsiderantsOpen(true)
      setIsDispositifOpen(true)
      setIsAnnexesOpen(true)
    }
  }, [forceOpen])

  useEffect(() => {
    const fetchConsiderants = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('ria_preambule')
          .select('numero')
          .eq('type', 'considerant')
          .order('numero')

        if (error) {
          throw error
        }

        if (data) {
          setConsiderants(data)
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des considérants:', err)
        setConsiderantsError('Impossible de charger les considérants')
      }
    }

    const fetchAnnexes = async () => {
      try {
        console.log('Début de la récupération des annexes...')
        
        // Récupérer les annexes principales
        const { data: annexesData, error: annexesError } = await supabasePublic
          .from('liste_annexes')
          .select('*')

        if (annexesError) {
          console.error('Erreur lors de la récupération des annexes:', annexesError)
          throw annexesError
        }

        // Récupérer les subdivisions et leur contenu
        const { data: subdivisionsData, error: subdivisionsError } = await supabasePublic
          .from('annexes')
          .select('id_annexe, titre_section, contenu')

        if (subdivisionsError) {
          console.error('Erreur lors de la récupération des subdivisions:', subdivisionsError)
          throw subdivisionsError
        }

        if (!annexesData || annexesData.length === 0) {
          console.error('Aucune donnée dans liste_annexes')
          setAnnexesError('Aucune annexe trouvée')
          return
        }

        // Formatons les données pour correspondre à notre interface
        const formattedAnnexes = annexesData.map(item => {
          // Trouver toutes les entrées dans la table annexes pour cette annexe
          const annexeEntries = subdivisionsData?.filter(sub => sub.id_annexe === item.id_annexe)
          
          // Si nous n'avons qu'une seule entrée sans titre_section, c'est le cas 1
          const isCasUn = annexeEntries?.length === 1 && !annexeEntries[0].titre_section
          
          if (isCasUn) {
            // Cas 1 : Pas de subdivisions
            return {
              numero: item.numero || item.id_annexe,
              titre: item.titre || `Annexe ${item.numero || item.id_annexe}`,
              id_annexe: item.id_annexe,
              contenu: annexeEntries[0].contenu
            }
          } else {
            // Cas 2 : Avec subdivisions
            const subdivisions = annexeEntries
              ?.filter(sub => sub.titre_section)
              .map(sub => ({
                titre_section: sub.titre_section,
                id_annexe: sub.id_annexe,
                contenu: sub.contenu
              }))
            
            return {
              numero: item.numero || item.id_annexe,
              titre: item.titre || `Annexe ${item.numero || item.id_annexe}`,
              id_annexe: item.id_annexe,
              subdivisions: subdivisions
            }
          }
        })
        
        setAnnexes(formattedAnnexes)
      } catch (err) {
        console.error('Erreur détaillée lors de la récupération des annexes:', err)
        if (err instanceof Error) {
          setAnnexesError(`Impossible de charger les annexes: ${err.message}`)
        } else {
          setAnnexesError('Impossible de charger les annexes')
        }
      }
    }

    const fetchChapitresEtSections = async () => {
      try {
        setChapitresError('Chargement des données...')
        
        // Récupérer les chapitres
        const { data: chapitresData, error: chapitresError } = await supabasePublic
          .from('chapitre')
          .select('id_chapitre, titre')
          .order('id_chapitre')

        if (chapitresError) {
          setChapitresError(`Erreur chapitres: ${chapitresError.message}`)
          throw chapitresError
        }

        if (!chapitresData || chapitresData.length === 0) {
          setChapitresError('Aucun chapitre trouvé dans la base de données')
          return
        }

        // Récupérer toutes les sections
        const { data: sectionsData, error: sectionsError } = await supabasePublic
          .from('section')
          .select('titre, id_chapitre, id_section')
          .order('id_section')

        if (sectionsError) {
          setChapitresError(`Erreur sections: ${sectionsError.message}`)
          throw sectionsError
        }

        // Récupérer tous les articles
        const { data: articlesData, error: articlesError } = await supabasePublic
          .from('article')
          .select('titre, id_chapitre, id_section, id_article, numero, contenu')
          .order('id_article')

        if (articlesError) {
          setChapitresError(`Erreur articles: ${articlesError.message}`)
          throw articlesError
        }

        // Associer les sections et articles à leurs chapitres respectifs
        const chapitresAvecSectionsEtArticles = chapitresData.map(chapitre => {
          // Filtrer les sections pour ce chapitre
          const sectionsduChapitre = sectionsData
            ? sectionsData.filter(section => Number(section.id_chapitre) === Number(chapitre.id_chapitre))
            .sort((a, b) => a.id_section - b.id_section)
            .map(section => ({
              ...section,
              // Ajouter les articles de cette section
              articles: articlesData
                .filter(article => Number(article.id_section) === Number(section.id_section))
                .sort((a, b) => a.id_article - b.id_article)
            }))
            : []

          // Filtrer les articles directement dans le chapitre (sans section)
          const articlesDuChapitre = articlesData
            ? articlesData.filter(article => 
                Number(article.id_chapitre) === Number(chapitre.id_chapitre) && 
                !article.id_section
              )
            .sort((a, b) => a.id_article - b.id_article)
            : []

          return {
            ...chapitre,
            sections: sectionsduChapitre,
            articles: articlesDuChapitre
          }
        })

        setChapitres(chapitresAvecSectionsEtArticles)
        setChapitresError(null)
      } catch (err: any) {
        console.error('Erreur détaillée:', err)
        setChapitresError(`Erreur: ${err.message}`)
      }
    }

    fetchConsiderants()
    fetchChapitresEtSections()
    fetchAnnexes()
  }, [])

  // Sauvegarder l'état d'ouverture dans le localStorage
  useEffect(() => {
    localStorage.setItem('isConsiderantsOpen', JSON.stringify(isConsiderantsOpen))
    localStorage.setItem('isDispositifOpen', JSON.stringify(isDispositifOpen))
    localStorage.setItem('isAnnexesOpen', JSON.stringify(isAnnexesOpen))
    localStorage.setItem('openChapitres', JSON.stringify(openChapitres))
  }, [isConsiderantsOpen, isDispositifOpen, isAnnexesOpen, openChapitres])

  return (
    <div className="text-sm space-y-2">
      {/* Section Considérants */}
      <div>
        <button
          onClick={() => setIsConsiderantsOpen(!isConsiderantsOpen)}
          className="flex items-center w-full text-left px-2 py-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className={`w-4 h-4 mr-1 transform transition-transform ${
              isConsiderantsOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium">Considérants</span>
        </button>

        {isConsiderantsOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {considerantsError ? (
              <p className="text-red-500 text-xs">{considerantsError}</p>
            ) : considerants.length === 0 ? (
              <p className="text-gray-400 text-xs">Chargement...</p>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {considerants.map((considerant) => (
                  <button
                    key={considerant.numero}
                    onClick={() => onConsiderantClick(considerant.numero)}
                    className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors text-center"
                  >
                    {considerant.numero}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Dispositif */}
      <div>
        <button
          onClick={() => setIsDispositifOpen(!isDispositifOpen)}
          className="flex items-center w-full text-left px-2 py-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className={`w-4 h-4 mr-1 transform transition-transform ${
              isDispositifOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium">Dispositif</span>
        </button>

        {isDispositifOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {chapitresError ? (
              <p className="text-red-500 text-xs whitespace-pre-wrap">{chapitresError}</p>
            ) : chapitres.length === 0 ? (
              <p className="text-gray-400 text-xs">Chargement...</p>
            ) : (
              <div className="flex flex-col space-y-0.5">
                {chapitres.map(chapitre => (
                  <div key={chapitre.id_chapitre} className="mb-1">
                    <button
                      onClick={() => toggleChapitre(chapitre.id_chapitre)}
                      className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded px-2 py-0.5"
                    >
                      <svg
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          openChapitres.includes(chapitre.id_chapitre) ? 'transform rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span className="text-[13px] font-medium">{chapitre.titre}</span>
                    </button>

                    {openChapitres.includes(chapitre.id_chapitre) && (
                      <div className="ml-6 mt-0.5 space-y-0.5">
                        {chapitre.sections?.map(section => (
                          <div key={section.id_section}>
                            <button
                              onClick={() => onSectionClick({
                                id_section: section.id_section,
                                titre: section.titre,
                                id_chapitre: section.id_chapitre
                              })}
                              className="text-[13px] text-gray-900 hover:text-gray-900 hover:bg-gray-50 w-full text-left px-2 py-0.5 rounded"
                            >
                              {section.titre}
                            </button>
                            <div className="ml-4 space-y-0.5">
                              {section.articles?.map(article => (
                                <button
                                  key={article.id_article}
                                  onClick={() => onArticleClick(article)}
                                  className="text-[13px] text-gray-900 hover:text-gray-900 hover:bg-gray-50 w-full text-left px-2 py-0.5 rounded"
                                >
                                  {article.numero} - {article.titre}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        {chapitre.articles?.map(article => (
                          <button
                            key={article.id_article}
                            onClick={() => onArticleClick(article)}
                            className="text-[13px] text-gray-900 hover:text-gray-900 hover:bg-gray-50 w-full text-left px-2 py-0.5 rounded"
                          >
                            {article.numero} - {article.titre}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Annexes */}
      <div>
        <button
          onClick={() => setIsAnnexesOpen(!isAnnexesOpen)}
          className="flex items-center w-full text-left px-2 py-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className={`w-4 h-4 mr-1 transform transition-transform ${
              isAnnexesOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium">Annexes</span>
        </button>

        {isAnnexesOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {annexesError ? (
              <p className="text-red-500 text-xs">{annexesError}</p>
            ) : annexes.length === 0 ? (
              <p className="text-gray-400 text-xs">Chargement...</p>
            ) : (
              <div className="flex flex-col space-y-1">
                {annexes.map((annexe) => (
                  <div key={annexe.numero}>
                    {annexe.subdivisions ? (
                      <div>
                        <div className="flex items-center w-full">
                          <button
                            onClick={() => toggleChapitre(annexe.numero)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg
                              className={`w-4 h-4 transform transition-transform ${
                                openChapitres.includes(annexe.numero) ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              toggleChapitre(annexe.numero);
                              onAnnexeClick?.(annexe);
                            }}
                            className="flex-1 text-left px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors text-xs"
                          >
                            {annexe.titre}
                          </button>
                        </div>
                        {openChapitres.includes(annexe.numero) && (
                          <div className="ml-4 mt-1 space-y-1">
                            {annexe.subdivisions.map((subdivision, index) => (
                              <button
                                key={`${annexe.numero}-${index}`}
                                onClick={() => onAnnexeClick?.(annexe, subdivision)}
                                className="text-left px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition-colors text-xs w-full"
                              >
                                {subdivision.titre_section}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onAnnexeClick?.(annexe)}
                        className="text-left px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors text-xs w-full"
                      >
                        {annexe.titre}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}