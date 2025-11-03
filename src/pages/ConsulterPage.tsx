import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Sommaire } from '@/components/Sommaire'
import { TextSettings } from '@/components/TextSettings'
import { Helmet } from 'react-helmet-async'

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
  resume?: string
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
  id_annexe?: number
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
  const [allConsiderants, setAllConsiderants] = useState<ConsiderantContent[]>([])
  const [allArticles, setAllArticles] = useState<ArticleContent[]>([])
  const [allAnnexes, setAllAnnexes] = useState<AnnexeContent[]>([])
  const [isLoadingFullContent, setIsLoadingFullContent] = useState(false)
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
  const [isOpen, setIsOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isArticleConsiderantsOpen, setIsArticleConsiderantsOpen] = useState(false)

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
              .select('id_article, titre, numero, contenu, resume')
              .eq('id_article', parseInt(id))
              .single()
            if (article) {
              await handleArticleClick({
                id_article: article.id_article,
                titre: article.titre,
                numero: article.numero,
                contenu: article.contenu,
                resume: article.resume
              })
            }
            break
          case 'annexe':
            // D'abord récupérer l'annexe depuis liste_annexes
            const { data: listeAnnexe } = await supabase
              .from('liste_annexes')
              .select('*')
              .eq('id_annexe', parseInt(id))
              .single()
            
            if (listeAnnexe) {
              // Récupérer le contenu depuis la table annexes
              const { data: annexeContent } = await supabase
                .from('annexes')
                .select('*')
                .eq('id_annexe', parseInt(id))
              
              if (annexeContent && annexeContent.length > 0) {
                // Si une seule entrée sans titre_section, c'est le cas 1
                const isCasUn = annexeContent.length === 1 && !annexeContent[0].titre_section
                
                if (isCasUn) {
                  // Cas 1 : Pas de subdivisions
                  const annexe: AnnexeContent = {
                    numero: listeAnnexe.numero || listeAnnexe.id_annexe,
                    titre: listeAnnexe.titre || `Annexe ${listeAnnexe.numero || listeAnnexe.id_annexe}`,
                    contenu: annexeContent[0].contenu,
                    id_annexe: listeAnnexe.id_annexe
                  }
                  await handleAnnexeClick(annexe)
                } else {
                  // Cas 2 : Avec subdivisions
                  const subdivisions = annexeContent
                    .filter(sub => sub.titre_section)
                    .map(sub => ({
                      titre_section: sub.titre_section,
                      contenu: sub.contenu
                    }))
                  
                  const annexe: AnnexeContent = {
                    numero: listeAnnexe.numero || listeAnnexe.id_annexe,
                    titre: listeAnnexe.titre || `Annexe ${listeAnnexe.numero || listeAnnexe.id_annexe}`,
                    subdivision: subdivisions,
                    id_annexe: listeAnnexe.id_annexe
                  }
                  await handleAnnexeClick(annexe, subdivisions[0])
                }
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
        console.log('handleArticleClick data', data)
        setSelectedArticle({
          id_article: data.id_article,
          titre: data.titre,
          numero: data.numero,
          contenu: data.contenu,
          resume: (data as any).resume,
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
        console.log('navigateToNextArticle data', data)
        setSelectedArticle({
          id_article: data.id_article,
          titre: data.titre,
          numero: data.numero,
          contenu: data.contenu,
          resume: (data as any).resume,
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
        console.log('navigateToPreviousArticle data', data)
        setSelectedArticle({
          id_article: data.id_article,
          titre: data.titre,
          numero: data.numero,
          contenu: data.contenu,
          resume: (data as any).resume,
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
      updateURL('annexe', annexe.id_annexe || annexe.numero)
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
          resume,
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
          resume: (firstArticle as any).resume,
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

  // Fonction pour charger tout le contenu
  const loadFullContent = async () => {
    setIsLoadingFullContent(true)
    try {
      // Charger les considérants
      const { data: considerants, error: considerantsError } = await supabase
        .from('considerant')
        .select('*')
        .order('numero')
      
      if (considerantsError) throw considerantsError
      setAllConsiderants(considerants)

      // Charger les articles avec leurs relations
      const { data: articles, error: articlesError } = await supabase
        .from('article')
        .select(`
          *,
          chapitre:id_chapitre(titre),
          section:id_section(titre)
        `)
        .order('id_article')
      
      if (articlesError) throw articlesError
      setAllArticles(articles.map(article => ({
        id_article: article.id_article,
        titre: article.titre,
        numero: article.numero,
        contenu: article.contenu,
        chapitre_titre: article.chapitre?.titre,
        section_titre: article.section?.titre
      })))

      // Charger les annexes avec leur contenu complet
      console.log('Début de la récupération des annexes...')
      const { data: annexes, error: annexesError } = await supabase
        .from('annexe')
        .select('*')
        .order('numero', { ascending: true })
      
      if (annexesError) {
        console.error('Erreur lors du chargement des annexes:', annexesError)
        throw annexesError
      }

      // Transformer les annexes de la même manière que handleAnnexeClick
      const transformedAnnexes = annexes?.map(annexe => {
        console.log('Traitement de l\'annexe:', annexe.numero)
        
        // Parser les subdivisions
        let parsedSubdivisions = null
        try {
          if (annexe.subdivision) {
            parsedSubdivisions = JSON.parse(annexe.subdivision as string)
            console.log('Subdivisions parsées:', parsedSubdivisions)
          }
        } catch (err) {
          console.error('Erreur parsing subdivision pour annexe', annexe.numero, err)
        }

        // Si l'annexe a des subdivisions, on retourne une annexe pour chaque subdivision
        if (parsedSubdivisions && Array.isArray(parsedSubdivisions) && parsedSubdivisions.length > 0) {
          return parsedSubdivisions.map(sub => ({
            numero: annexe.numero,
            titre: annexe.titre,
            contenu: sub.contenu,
            subdivision: [sub]
          }))
        }
        
        // Si l'annexe a un contenu direct, on le retourne
        if (annexe.contenu) {
          return [{
            numero: annexe.numero,
            titre: annexe.titre,
            contenu: annexe.contenu
          }]
        }

        return []
      }).flat()

      console.log('Annexes transformées:', transformedAnnexes)
      setAllAnnexes(transformedAnnexes || [])

    } catch (err) {
      console.error('Erreur lors du chargement du contenu complet:', err)
      setError('Impossible de charger tout le contenu')
    } finally {
      setIsLoadingFullContent(false)
    }
  }

  // Charger le contenu complet quand on passe en mode défilement
  useEffect(() => {
    loadFullContent()
  }, [])

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
    <>
      <Helmet>
        <title>Consulter le règlement IA de façon simple et interactive (RIA, IA Act, AI Act)</title>
        <meta name="description" content="Plus besoin de se battre avec le pdf officiel, vous pouvez désormais consulter le règlement grâce à un sommaire interactif" />
        <meta property="og:title" content="Consulter le règlement IA de façon simple et interactive (RIA, IA Act, AI Act)" />
        <meta property="og:description" content="Plus besoin de se battre avec le pdf officiel, vous pouvez désormais consulter le règlement grâce à un sommaire interactif" />
      </Helmet>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-0' : 'min-h-[calc(100vh-1rem)] p-0'}`}>
        <div className={`${isFullscreen ? 'h-full overflow-hidden' : 'max-w-6xl mx-auto'}`}>
          <div className={`white-container ${isFullscreen ? '' : 'rounded-2xl shadow-lg'} min-h-[70vh] relative`}>
            {/* Menu Burger et paramètres pour mobile */}
            <div className="lg:hidden px-1 mb-1">
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
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

            {/* Overlay Sommaire mobile */}
            {isOpen && (
              <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto lg:hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Sommaire</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Fermer le sommaire"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sommaire
                    onConsiderantClick={(numero) => { setIsOpen(false); handleConsiderantClick(numero); }}
                    onChapitreClick={(id) => { setIsOpen(false); handleChapitreClick(id); }}
                    onArticleClick={(article) => { setIsOpen(false); handleArticleClick(article); }}
                    onAnnexeClick={(annexe, subdivision) => { setIsOpen(false); handleAnnexeClick(annexe, subdivision); }}
                    onSectionClick={(section) => { setIsOpen(false); handleSectionClick(section); }}
                  />
                </div>
              </div>
            )}

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
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="hidden lg:flex p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center gap-2"
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

                    <button
                      onClick={() => window.open('https://eur-lex.europa.eu/legal-content/FR/TXT/PDF/?uri=OJ:L_202401689', '_blank')}
                      className="hidden lg:flex p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors items-center gap-2"
                      title="Consulter le PDF officiel"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">PDF officiel</span>
                    </button>
                  </div>
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
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          aria-expanded={isSummaryOpen}
                        >
                          <span className="text-sm font-medium">Résumé</span>
                          <svg className={`w-4 h-4 transition-transform ${isSummaryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isSummaryOpen && (
                          <div className="mt-2 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap italic" style={{ backgroundColor: '#f3f1ff' }}>
                            {selectedArticle.resume && selectedArticle.resume.trim().length > 0
                              ? selectedArticle.resume
                              : 'Aucun résumé disponible pour cet article.'}
                          </div>
                        )}
                      </div>
                      <div className="break-words whitespace-pre-wrap">
                        {selectedArticle.contenu}
                      </div>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setIsArticleConsiderantsOpen(!isArticleConsiderantsOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          aria-expanded={isArticleConsiderantsOpen}
                        >
                          <span className="text-sm font-medium">Considérants associés</span>
                          <svg className={`w-4 h-4 transition-transform ${isArticleConsiderantsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isArticleConsiderantsOpen && (
                          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                            Liste des considérants à venir.
                          </div>
                        )}
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
                      <div className="mb-4">
                        <h2 className="text-xl font-medium mb-2 flex flex-wrap items-start gap-x-4">
                          <span className="shrink-0">Considérant {selectedConsiderant.numero}</span>
                        </h2>
                      </div>
                      <div className="break-words whitespace-pre-wrap">
                        {selectedConsiderant.contenu}
                      </div>
                    </div>
                    <div className="mt-12 mb-8">
                      <NavigationButtons 
                        onPrevious={navigateToPreviousConsiderant}
                        onNext={navigateToNextConsiderant}
                      />
                    </div>
                  </div>
                ) : selectedAnnexe ? (
                  <div className="relative mt-4 px-6">
                    <div className={`w-full ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'} mx-auto`} style={contentStyle}>
                      <div className="mb-4">
                        <h2 className="text-xl font-medium mb-2 flex flex-wrap items-start gap-x-4">
                          <span className="shrink-0">Annexe {selectedAnnexe.numero}</span>
                          <span className="flex-1">{selectedAnnexe.titre}</span>
                        </h2>
                      </div>
                      <div className="break-words whitespace-pre-wrap">
                        {selectedAnnexe.contenu}
                      </div>
                      {selectedAnnexe.subdivision && selectedAnnexe.subdivision.length > 0 && (
                        <div className="mt-8">
                          {selectedAnnexe.subdivision.map((sub, index) => (
                            <div key={index} className="mb-6">
                              <h3 className="text-lg font-medium mb-2">{sub.titre_section}</h3>
                              <div className="break-words whitespace-pre-wrap">
                                {sub.contenu}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
    </>
  )
} 