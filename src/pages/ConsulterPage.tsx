import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Sommaire } from '@/components/Sommaire'
import { BurgerMenu } from '@/components/BurgerMenu'
import { TextSettings } from '@/components/TextSettings'

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

interface AnnexeSubdivision {
  titre_section: string
  contenu: string
}

interface AnnexeContent {
  numero: number
  titre: string
  contenu?: string
  subdivision?: AnnexeSubdivision[]
}

interface SectionContent {
  id_section: number
  titre: string
  id_chapitre: number
}

interface ChapitreData {
  titre: string
}

interface SectionData {
  titre: string
  id_section: number
}

interface ArticleData {
  id_article: number
  titre: string
  numero: string
  contenu: string
  chapitre: ChapitreData
}

interface SupabaseArticleResponse {
  id_article: number
  titre: string
  numero: string
  contenu: string
  chapitre: {
    titre: string
  } | null
}

interface ArticleWithChapter {
  id_article: number
  titre: string
  numero: string
  contenu: string
  chapitre: {
    titre: string
  }
}

interface ArticleWithRelations {
  id_article: number
  titre: string
  numero: string
  contenu: string
  chapitre: ChapitreData
  section: SectionData
}

export const ConsulterPage = () => {
  const getFontFamily = (font: string) => {
    switch (font) {
      case 'sans':
        return 'ui-sans-serif, system-ui, sans-serif'
      case 'serif':
        return 'ui-serif, Georgia, serif'
      case 'times':
        return 'Times New Roman, serif'
      default:
        return 'ui-monospace, monospace'
    }
  }

  const [titre, setTitre] = useState<string>('')
  const [visa, setVisa] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedConsiderant, setSelectedConsiderant] = useState<ConsiderantContent | null>(null)
  const [selectedChapitre, setSelectedChapitre] = useState<ChapitreContent | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null)
  const [selectedAnnexe, setSelectedAnnexe] = useState<AnnexeContent | null>(null)
  const [selectedSection, setSelectedSection] = useState<SectionContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem('fontSize')
    return savedSize ? parseInt(savedSize) : 16
  })
  const [fontFamily, setFontFamily] = useState(() => {
    const savedFont = localStorage.getItem('fontFamily')
    return savedFont || 'sans'
  })
  const [textAlign] = useState<'left' | 'justify'>(() => {
    return localStorage.getItem('textAlign') as 'left' | 'justify' || 'justify'
  })
  const [showTextSettings, setShowTextSettings] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth')
    return savedWidth ? parseInt(savedWidth) : 300
  })
  const [isResizingActive, setIsResizingActive] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const startPosRef = useRef(0)
  const startWidthRef = useRef(0)

  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize.toString())
    localStorage.setItem('fontFamily', fontFamily)
    localStorage.setItem('textAlign', textAlign)
    localStorage.setItem('sidebarWidth', sidebarWidth.toString())
  }, [fontSize, fontFamily, textAlign, sidebarWidth])

  useEffect(() => {
    const fetchReglementData = async () => {
      try {
        const { data, error } = await supabase
          .from('reglement')
          .select('titre, visa')
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setTitre(data.titre)
          setVisa(data.visa)
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err)
        setError('Impossible de charger les données du règlement')
      }
    }

    fetchReglementData()
  }, [])

  // Fonction pour mettre à jour l'URL
  const updateURL = (type: string, id: string | number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('type', type)
    url.searchParams.set('id', id.toString())
    window.history.pushState({}, '', url)
  }

  // Restaurer l'état depuis l'URL au chargement
  useEffect(() => {
    const restoreStateFromURL = async () => {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const id = params.get('id')

      if (!type || !id) return

      setLoadingContent(true)
      try {
        switch (type) {
          case 'considerant':
            await handleConsiderantClick(parseInt(id))
            break
          case 'chapitre':
            await handleChapitreClick(parseInt(id))
            break
          case 'article':
            const { data: article } = await supabase
              .from('article')
              .select('id_article, titre, numero, contenu')
              .eq('id_article', parseInt(id))
              .single()
            if (article) {
              await handleArticleClick({
                id_article: article.id_article,
                titre: article.titre,
                numero: article.numero,
                contenu: article.contenu
              })
            }
            break
          case 'annexe':
            const { data: annexe } = await supabase
              .from('annexe')
              .select('*')
              .eq('numero', parseInt(id))
              .single()
            if (annexe) {
              // Si l'annexe a un contenu direct, on l'affiche
              if (annexe.contenu) {
                await handleAnnexeClick(annexe)
              } 
              // Si l'annexe a des subdivisions, on affiche la première
              else if (annexe.subdivision && annexe.subdivision.length > 0) {
                await handleAnnexeClick(annexe, annexe.subdivision[0])
              }
            }
            break
          case 'section':
            const { data: section } = await supabase
              .from('section')
              .select('*')
              .eq('id_section', parseInt(id))
              .single()
            if (section) {
              await handleSectionClick(section)
            }
            break
        }
      } catch (err) {
        console.error('Erreur lors de la restauration de l\'état:', err)
      } finally {
        setLoadingContent(false)
      }
    }

    restoreStateFromURL()
  }, [])

  const handleConsiderantClick = async (numero: number) => {
    setLoadingContent(true)
    setSelectedChapitre(null)
    setSelectedArticle(null)
    try {
      const { data, error } = await supabase
        .from('considerant')
        .select('numero, contenu')
        .eq('numero', numero)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedConsiderant(data)
        updateURL('considerant', numero)
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du considérant:', err)
    } finally {
      setLoadingContent(false)
    }
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
        updateURL('chapitre', id)
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du chapitre:', err)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleArticleClick = async (article: ArticleContent) => {
    setLoadingContent(true)
    setSelectedConsiderant(null)
    setSelectedChapitre(null)
    
    try {
      const { data, error } = await supabase
        .from('article')
        .select(`
          *,
          chapitre:id_chapitre(titre),
          section:id_section(titre)
        `)
        .eq('id_article', article.id_article)
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
        updateURL('article', data.id_article)
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des détails de l\'article:', err)
    } finally {
      setLoadingContent(false)
    }
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

  const handleAnnexeClick = async (annexe: AnnexeContent, subdivision?: AnnexeSubdivision) => {
    setLoadingContent(true)
    setSelectedConsiderant(null)
    setSelectedChapitre(null)
    setSelectedArticle(null)
    
    try {
      if (subdivision) {
        setSelectedAnnexe({
          numero: annexe.numero,
          titre: annexe.titre,
          contenu: subdivision.contenu,
          subdivision: [subdivision]
        })
      } else if (annexe.contenu) {
        setSelectedAnnexe({
          numero: annexe.numero,
          titre: annexe.titre,
          contenu: annexe.contenu
        })
      }
      updateURL('annexe', annexe.numero)
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'annexe:', err)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleSectionClick = async (section: SectionContent) => {
    setLoadingContent(true)
    setSelectedConsiderant(null)
    setSelectedChapitre(null)
    setSelectedArticle(null)
    setSelectedAnnexe(null)
    
    try {
      // Récupérer les détails de la section
      const { data: sectionData, error: sectionError } = await supabase
        .from('section')
        .select('*')
        .eq('id_section', section.id_section)
        .single()

      if (sectionError) throw sectionError

      // Récupérer tous les articles de cette section et les trier
      const { data: articlesData, error: articleError } = await supabase
        .from('article')
        .select(`
          id_article,
          titre,
          numero,
          contenu,
          chapitre:id_chapitre(titre)
        `)
        .eq('id_section', section.id_section)

      if (articleError) throw articleError

      if (!articlesData || articlesData.length === 0) throw new Error('Aucun article trouvé')

      // Trier les articles en extrayant le numéro
      const sortedArticles = (articlesData as unknown as SupabaseArticleResponse[]).sort((a, b) => {
        const numA = parseInt(a.numero.replace(/[^0-9]/g, ''))
        const numB = parseInt(b.numero.replace(/[^0-9]/g, ''))
        return numA - numB
      })

      // Prendre le premier article
      const firstArticle = sortedArticles[0]

      setSelectedSection(sectionData)
      if (firstArticle) {
        setSelectedArticle({
          id_article: firstArticle.id_article,
          titre: firstArticle.titre,
          numero: firstArticle.numero,
          contenu: firstArticle.contenu,
          chapitre_titre: firstArticle.chapitre?.titre || '',
          section_titre: section.titre
        })
      }
      updateURL('section', section.id_section)
    } catch (err) {
      console.error('Erreur lors de la récupération de la section:', err)
      setError('Impossible de charger la section')
    } finally {
      setLoadingContent(false)
    }
  }

  const NavigationButtons = ({ onPrevious, onNext }: { onPrevious: () => void, onNext: () => void }) => (
    <div className="flex gap-4 items-center">
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

  const contentStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: getFontFamily(fontFamily),
  }

  const paragraphStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: getFontFamily(fontFamily),
  }

  const startResizing = (e: React.MouseEvent) => {
    isResizing.current = true
    setIsResizingActive(true)
    startPosRef.current = e.clientX
    startWidthRef.current = sidebarWidth
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResizing)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return

    const delta = e.clientX - startPosRef.current
    const newWidth = startWidthRef.current + delta
    const minWidth = 250
    const maxWidth = Math.min(window.innerWidth * 0.4, 600)

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth)
    }
  }

  const stopResizing = () => {
    isResizing.current = false
    setIsResizingActive(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResizing)
  }

  // Nettoyage des événements au démontage du composant
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', stopResizing)
    }
  }, [])

  // Gestionnaire de la touche Échap pour quitter le mode plein écran
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isFullscreen])

  const firstArticle = selectedArticle ? {
    chapitre_titre: selectedArticle.chapitre_titre || '',
    section_titre: selectedArticle.section_titre || '',
    numero: selectedArticle.numero || '',
    titre: selectedArticle.titre || '',
    contenu: selectedArticle.contenu || ''
  } : null

  const breadcrumbData = firstArticle ? {
    chapitre_titre: firstArticle.chapitre_titre,
    section_titre: firstArticle.section_titre,
    numero: firstArticle.numero,
    titre: firstArticle.titre,
    contenu: firstArticle.contenu
  } : null

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-0' : 'min-h-[calc(100vh-1rem)] p-0'}`}>
      <div className={`${isFullscreen ? 'h-full overflow-hidden' : 'max-w-6xl mx-auto'}`}>
        <div className={`white-container ${isFullscreen ? '' : 'rounded-2xl shadow-lg'} min-h-[70vh] relative`}>
          {/* Menu Burger et paramètres pour mobile */}
          <div className="lg:hidden px-1 mb-1">
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <BurgerMenu buttonClassName="bg-white shadow-none">
                  <div className={`${isFullscreen ? 'max-h-[calc(100vh-12rem)]' : 'max-h-[calc(100vh-8rem)]'} overflow-y-auto pr-2 custom-scrollbar`}>
                    <Sommaire 
                      onConsiderantClick={handleConsiderantClick}
                      onChapitreClick={handleChapitreClick}
                      onArticleClick={handleArticleClick}
                      onAnnexeClick={handleAnnexeClick}
                      onSectionClick={handleSectionClick}
                    />
                  </div>
                </BurgerMenu>
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center gap-2"
                title={isFullscreen ? "Quitter le mode plein écran" : "Passer en mode plein écran"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isFullscreen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20h6M4 15v5h5m6 0h5v-5M4 9V4h5m6 0h5v5"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 16V20h4M21 16v4h-4M3 8V4h4M21 8V4h-4"
                    />
                  )}
                </svg>
                <span className="text-sm">{isFullscreen ? "Réduire" : "Plein écran"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-1 p-0">
            {/* Sommaire pour desktop */}
            <div 
              ref={sidebarRef}
              className="hidden lg:block bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-2xl shadow-lg sticky top-4 self-start relative"
              style={{ width: `${sidebarWidth}px` }}
            >
              {/* Barre de redimensionnement */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors ${isResizingActive ? 'bg-blue-500' : 'bg-transparent'}`}
                onMouseDown={startResizing}
              />
              <div className="flex items-center gap-2 mb-2 border-b pb-1">
                <h2 className="font-medium text-gray-800">Sommaire interactif</h2>
              </div>
              <div className={`${isFullscreen ? 'max-h-[calc(100vh-12rem)]' : 'max-h-[calc(100vh-8rem)]'} overflow-y-auto pr-2 custom-scrollbar`}>
                <Sommaire 
                  onConsiderantClick={handleConsiderantClick}
                  onChapitreClick={handleChapitreClick}
                  onArticleClick={handleArticleClick}
                  onAnnexeClick={handleAnnexeClick}
                  onSectionClick={handleSectionClick}
                />
              </div>

              <div className="mt-2 border-t pt-2 relative">
                <div className="bg-white rounded-lg shadow-lg">
                  <button
                    onClick={() => setShowTextSettings(!showTextSettings)}
                    className="w-full p-2 flex items-center gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">Affichage</span>
                    </div>
                    {showTextSettings && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                  {showTextSettings && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 p-3 bg-white rounded-lg shadow-lg border z-50">
                      <TextSettings
                        fontSize={fontSize}
                        fontFamily={fontFamily}
                        onFontSizeChange={setFontSize}
                        onFontFamilyChange={setFontFamily}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className={`col-span-1 ${isFullscreen ? 'p-8 h-[calc(100vh-2rem)] overflow-y-auto' : 'lg:pt-2'}`}>
              <div className="flex justify-between items-center mb-4">
                {(selectedConsiderant || selectedArticle) && (
                  <NavigationButtons 
                    onPrevious={selectedConsiderant ? navigateToPreviousConsiderant : navigateToPreviousArticle}
                    onNext={selectedConsiderant ? navigateToNextConsiderant : navigateToNextArticle}
                  />
                )}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`hidden lg:flex p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center gap-2 ${selectedConsiderant || selectedArticle ? '' : 'ml-auto'}`}
                  title={isFullscreen ? "Quitter le mode plein écran" : "Passer en mode plein écran"}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isFullscreen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20h6M4 15v5h5m6 0h5v-5M4 9V4h5m6 0h5v5"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 16V20h4M21 16v4h-4M3 8V4h4M21 8V4h-4"
                      />
                    )}
                  </svg>
                  <span className="text-sm">{isFullscreen ? "Réduire" : "Plein écran"}</span>
                </button>
              </div>
              {loadingContent ? (
                <p className="text-gray-400 text-sm">Chargement...</p>
              ) : selectedArticle ? (
                <div className="relative mt-4 px-6">
                  <div className={`w-full ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`} style={contentStyle}>
                    <div className="mb-4">
                      <div className="text-sm mb-3">
                        {selectedArticle.chapitre_titre}
                        {selectedArticle.section_titre && (
                          <>
                            <span className="mx-2">›</span>
                            <span className="font-medium">{selectedArticle.section_titre}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-medium mb-2 flex flex-wrap items-start gap-x-4">
                        <span className="shrink-0">{selectedArticle.numero}</span>
                        <span className="flex-1">{selectedArticle.titre}</span>
                      </h2>
                    </div>
                    <div className="break-words whitespace-pre-wrap">
                      {selectedArticle.contenu}
                    </div>
                  </div>
                  <div className="mt-12 mb-8">
                    <NavigationButtons 
                      onPrevious={navigateToPreviousArticle}
                      onNext={navigateToNextArticle}
                    />
                  </div>
                </div>
              ) : selectedConsiderant ? (
                <div className="relative mt-4 px-6">
                  <div className={`w-full ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`} style={contentStyle}>
                    <h2 className="text-lg font-medium mb-4">
                      Considérant {selectedConsiderant.numero}
                    </h2>
                    <div className="break-words whitespace-pre-wrap">
                      {selectedConsiderant.contenu}
                    </div>
                  </div>
                  <div className="mt-8">
                    <NavigationButtons 
                      onPrevious={navigateToPreviousConsiderant}
                      onNext={navigateToNextConsiderant}
                    />
                  </div>
                </div>
              ) : selectedChapitre ? (
                <div className="px-6">
                  <div className={`w-full ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`} style={contentStyle}>
                    <h2 className="text-lg font-medium mb-4">
                      {selectedChapitre.titre}
                    </h2>
                    <div className="break-words whitespace-pre-wrap">
                      {selectedChapitre.contenu}
                    </div>
                  </div>
                </div>
              ) : selectedAnnexe ? (
                <div className="relative mt-4 px-6">
                  <div className={`w-full ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`} style={contentStyle}>
                    <h2 className="text-lg font-medium mb-4">
                      Annexe {selectedAnnexe.numero} - {selectedAnnexe.titre}
                      {selectedAnnexe.subdivision && (
                        <div className="text-base font-normal mt-2">
                          {selectedAnnexe.subdivision[0].titre_section}
                        </div>
                      )}
                    </h2>
                    <div className="w-full max-w-full">
                      <div className="break-words whitespace-pre-wrap">
                        {selectedAnnexe.contenu}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedSection ? (
                <div>
                  <div style={contentStyle}>
                    <h2 className="text-lg font-medium mb-4">
                      Section {selectedSection.titre}
                    </h2>
                    <div className="w-full max-w-full">
                      <div className="break-words whitespace-pre-wrap">
                        {selectedSection.titre}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center h-full px-6">
                  <div className={`w-full ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'}`}>
                    <h1 className="text-sm font-bold text-center whitespace-pre-wrap">{titre}</h1>
                    <div className="whitespace-pre-wrap text-sm">{visa}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour désactiver les interactions pendant le redimensionnement */}
      {isResizingActive && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 cursor-ew-resize z-50" 
          onMouseUp={stopResizing}
        />
      )}
    </div>
  )
} 