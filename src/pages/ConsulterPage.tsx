import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Sommaire } from '@/components/Sommaire'
import { BurgerMenu } from '@/components/BurgerMenu'

interface ConsiderantContent {
  numero: number
  contenu: string
}

interface ChapitreContent {
  id: number
  titre: string
  contenu: string
}

interface ArticleContent {
  id_article: number
  titre: string
  numero: string
  contenu: string
  chapitre_titre?: string
  section_titre?: string
}

interface AnnexeContent {
  numero: number
  titre: string
  contenu?: string
  subdivision?: {
    titre_section: string
    contenu: string
  }
}

interface ContentItem {
  type: 'considerant' | 'article' | 'annexe' | 'chapitre'
  content: ConsiderantContent | ArticleContent | AnnexeContent | ChapitreContent
}

export const ConsulterPage = () => {
  const [titre, setTitre] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [selectedConsiderant, setSelectedConsiderant] = useState<ConsiderantContent | null>(null)
  const [selectedChapitre, setSelectedChapitre] = useState<ChapitreContent | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null)
  const [selectedAnnexe, setSelectedAnnexe] = useState<AnnexeContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [allContent, setAllContent] = useState<ContentItem[]>([])
  const [visibleContent, setVisibleContent] = useState<ContentItem[]>([])
  const [page, setPage] = useState(1)
  const loadMoreRef = useRef(null)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchTitre = async () => {
      try {
        const { data, error } = await supabase
          .from('reglement')
          .select('titre')
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setTitre(data.titre)
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du titre:', err)
        setError('Impossible de charger le titre du règlement')
      }
    }

    fetchTitre()
  }, [])

  useEffect(() => {
    const fetchAllContent = async () => {
      setLoadingContent(true)
      try {
        // Récupérer tous les considérants
        const { data: considerants } = await supabase
          .from('considerant')
          .select('*')
          .order('numero')

        // Récupérer tous les articles
        const { data: articles } = await supabase
          .from('article')
          .select(`
            *,
            chapitre:id_chapitre(titre),
            section:id_section(titre)
          `)
          .order('id_article')

        // Récupérer toutes les annexes
        const { data: annexes } = await supabase
          .from('liste_annexes')
          .select('*')
          .order('numero')

        const content: ContentItem[] = [
          ...(considerants?.map(c => ({ type: 'considerant' as const, content: c })) || []),
          ...(articles?.map(a => ({ type: 'article' as const, content: a })) || []),
          ...(annexes?.map(an => ({ type: 'annexe' as const, content: an })) || [])
        ]

        setAllContent(content)
        setVisibleContent(content.slice(0, itemsPerPage))
      } catch (err) {
        console.error('Erreur lors de la récupération du contenu:', err)
        setError('Impossible de charger le contenu')
      } finally {
        setLoadingContent(false)
      }
    }

    fetchAllContent()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingContent) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loadingContent, page])

  const loadMore = () => {
    const nextItems = allContent.slice(
      page * itemsPerPage,
      (page + 1) * itemsPerPage
    )
    if (nextItems.length > 0) {
      setVisibleContent(prev => [...prev, ...nextItems])
      setPage(prev => prev + 1)
    }
  }

  const scrollToItem = (type: string, id: number) => {
    const element = document.getElementById(`${type}-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleConsiderantClick = (numero: number) => {
    scrollToItem('considerant', numero)
  }

  const handleChapitreClick = async (id: number) => {
    setLoadingContent(true)
    setSelectedConsiderant(null)
    try {
      const { data, error } = await supabase
        .from('chapitre')
        .select('id, titre, contenu')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedChapitre(data)
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du chapitre:', err)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleArticleClick = (article: ArticleContent) => {
    scrollToItem('article', article.id_article)
  }

  const navigateToNextArticle = async () => {
    if (!selectedArticle) return
    
    try {
      const { data, error } = await supabase
        .from('article')
        .select(`
          *,
          chapitre:id_chapitre(titre),
          section:id_section(titre)
        `)
        .gt('id_article', selectedArticle.id_article)
        .order('id_article', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedArticle({
          id_article: data.id_article,
          titre: data.titre,
          numero: data.numero,
          contenu: data.contenu,
          chapitre_titre: data.chapitre?.titre,
          section_titre: data.section?.titre
        })
      }
    } catch (err) {
      console.error('Erreur lors de la navigation vers l\'article suivant:', err)
    }
  }

  const navigateToPreviousArticle = async () => {
    if (!selectedArticle) return
    
    try {
      const { data, error } = await supabase
        .from('article')
        .select(`
          *,
          chapitre:id_chapitre(titre),
          section:id_section(titre)
        `)
        .lt('id_article', selectedArticle.id_article)
        .order('id_article', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedArticle({
          id_article: data.id_article,
          titre: data.titre,
          numero: data.numero,
          contenu: data.contenu,
          chapitre_titre: data.chapitre?.titre,
          section_titre: data.section?.titre
        })
      }
    } catch (err) {
      console.error('Erreur lors de la navigation vers l\'article précédent:', err)
    }
  }

  const navigateToNextConsiderant = async () => {
    if (!selectedConsiderant) return
    
    try {
      const { data, error } = await supabase
        .from('considerant')
        .select('numero, contenu')
        .gt('numero', selectedConsiderant.numero)
        .order('numero', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedConsiderant(data)
      }
    } catch (err) {
      console.error('Erreur lors de la navigation vers le considérant suivant:', err)
    }
  }

  const navigateToPreviousConsiderant = async () => {
    if (!selectedConsiderant) return
    
    try {
      const { data, error } = await supabase
        .from('considerant')
        .select('numero, contenu')
        .lt('numero', selectedConsiderant.numero)
        .order('numero', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedConsiderant(data)
      }
    } catch (err) {
      console.error('Erreur lors de la navigation vers le considérant précédent:', err)
    }
  }

  const handleAnnexeClick = (annexe: AnnexeContent) => {
    scrollToItem('annexe', annexe.numero)
  }

  const NavigationButtons = ({ onPrevious, onNext }: { onPrevious: () => void, onNext: () => void }) => (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={onPrevious}
        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Précédent
      </button>
      <button
        onClick={onNext}
        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        Suivant
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-6xl mx-auto">
        {error ? (
          <div className="bg-red-50 p-2 rounded text-red-600 text-center text-xs">
            {error}
          </div>
        ) : (
          <div className="mb-8 text-center">
            <p className="text-xl font-medium text-gray-800 mb-4">
              Explorez facilement le Règlement sur l'Intelligence Artificielle grâce à cette interface intuitive. 
              Naviguez entre les considérants, le dispositif et les annexes en utilisant le sommaire interactif.
            </p>
            <h1 className="text-sm text-gray-500 max-w-4xl mx-auto">
              RÈGLEMENT (UE) 2024/1689 DU PARLEMENT EUROPÉEN ET DU CONSEIL du 13 juin 2024 établissant des règles harmonisées concernant l'intelligence artificielle et modifiant les règlements (CE) no 300/2008, (UE) no 167/2013, (UE) no 168/2013, (UE) 2018/858, (UE) 2018/1139 et (UE) 2019/2144 et les directives 2014/90/UE, (UE) 2016/797 et (UE) 2020/1828 (règlement sur l'intelligence artificielle)
            </h1>
          </div>
        )}
        
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg min-h-[80vh]">
          {/* Menu Burger pour mobile */}
          <div className="lg:hidden px-8 mb-4">
            <BurgerMenu buttonClassName="-ml-3 mt-6">
              <Sommaire 
                onConsiderantClick={handleConsiderantClick}
                onChapitreClick={handleChapitreClick}
                onArticleClick={handleArticleClick}
                onAnnexeClick={handleAnnexeClick}
              />
            </BurgerMenu>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-8 pt-0 lg:pt-8">
            {/* Sommaire pour desktop */}
            <div className="hidden lg:block col-span-1 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-2xl shadow-lg sticky top-4 self-start">
              <div className="flex items-center gap-2 mb-3 border-b pb-1">
                <h2 className="font-medium text-gray-800">Sommaire interactif</h2>
              </div>
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                <Sommaire 
                  onConsiderantClick={handleConsiderantClick}
                  onChapitreClick={handleChapitreClick}
                  onArticleClick={handleArticleClick}
                  onAnnexeClick={handleAnnexeClick}
                />
              </div>
            </div>

            {/* Contenu */}
            <div className="col-span-1 lg:col-span-3 lg:pt-2">
              {loadingContent && visibleContent.length === 0 ? (
                <p className="text-gray-400 text-sm">Chargement...</p>
              ) : (
                <div className="space-y-12">
                  {visibleContent.map((item, index) => (
                    <div
                      key={`${item.type}-${index}`}
                      id={`${item.type}-${
                        item.type === 'considerant'
                          ? (item.content as ConsiderantContent).numero
                          : item.type === 'article'
                          ? (item.content as ArticleContent).id_article
                          : (item.content as AnnexeContent).numero
                      }`}
                      className="scroll-mt-8"
                    >
                      {item.type === 'considerant' && (
                        <div>
                          <h2 className="text-lg font-medium text-gray-800 mb-4">
                            Considérant {(item.content as ConsiderantContent).numero}
                          </h2>
                          <div className="text-gray-600 whitespace-pre-wrap">
                            {(item.content as ConsiderantContent).contenu}
                          </div>
                        </div>
                      )}

                      {item.type === 'article' && (
                        <div>
                          <div className="mb-4">
                            <div className="text-sm text-gray-500 mb-3">
                              {(item.content as ArticleContent).chapitre_titre}
                              {(item.content as ArticleContent).section_titre && (
                                <>
                                  <span className="mx-2">›</span>
                                  {(item.content as ArticleContent).section_titre}
                                </>
                              )}
                            </div>
                            <h2 className="text-xl font-medium text-gray-900 mb-2 flex flex-wrap items-start gap-x-4">
                              <span className="shrink-0">{(item.content as ArticleContent).numero}</span>
                              <span className="flex-1">{(item.content as ArticleContent).titre}</span>
                            </h2>
                          </div>
                          <div className="text-gray-600 prose prose-sm max-w-none whitespace-pre-wrap font-normal">
                            {(item.content as ArticleContent).contenu}
                          </div>
                        </div>
                      )}

                      {item.type === 'annexe' && (
                        <div>
                          <h2 className="text-lg font-medium text-gray-800 mb-4">
                            Annexe {(item.content as AnnexeContent).numero} - {(item.content as AnnexeContent).titre}
                            {(item.content as AnnexeContent).subdivision && (
                              <div className="text-base font-normal mt-2">
                                {(item.content as AnnexeContent).subdivision.titre_section}
                              </div>
                            )}
                          </h2>
                          <div className="text-gray-600 prose prose-sm max-w-none whitespace-pre-wrap">
                            {(item.content as AnnexeContent).contenu}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={loadMoreRef} className="h-10" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 