import React, { useEffect, useState, useRef } from 'react'
import { supabasePublic } from '../lib/supabasePublic'
import { Sommaire } from '@/components/Sommaire'
import { TextSettings } from '@/components/TextSettings'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

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
  recitals?: string
  chapitre_titre?: string
  section_titre?: string
  fiches?: string
  doc_associee?: string
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

  // Mapping des URLs des fiches pratiques vers leurs titres
  const fichesPratiquesTitres: Record<string, string> = {
    '/fiches-pratiques/exactitude': "Gérer l'exactitude (Accuracy) dans les systèmes IA",
    'exactitude': "Gérer l'exactitude (Accuracy) dans les systèmes IA",
    '/fiches-pratiques/explicabilite': "Explicabilité & Interprétabilité dans les systèmes IA",
    'explicabilite': "Explicabilité & Interprétabilité dans les systèmes IA",
    '/fiches-pratiques/droits-rgpd': "Gestion des droits RGPD dans les systèmes d'IA",
    'droits-rgpd': "Gestion des droits RGPD dans les systèmes d'IA",
    '/fiches-pratiques/rms': "Le système de gestion des risques (RMS)",
    'rms': "Le système de gestion des risques (RMS)",
    '/fiches-pratiques/fria': "Analyse d'impact sur les droits fondamentaux (FRIA)",
    'fria': "Analyse d'impact sur les droits fondamentaux (FRIA)",
    '/fiches-pratiques/transparence': "Transparence et information des utilisateurs",
    'transparence': "Transparence et information des utilisateurs",
    '/fiches-pratiques/controle-humain': "Le contrôle humain",
    'controle-humain': "Le contrôle humain",
    '/fiches-pratiques/secteur-bancaire': "L'AI Act dans le secteur bancaire & financier",
    'secteur-bancaire': "L'AI Act dans le secteur bancaire & financier",
    '/fiches-pratiques/exception-haut-risque': "L'exception de qualification \"Haut Risque\" (Article 6.3)",
    'exception-haut-risque': "L'exception de qualification \"Haut Risque\" (Article 6.3)",
    '/fiches-pratiques/maitrise-ia': "La maîtrise de l'IA (Article 4)",
    'maitrise-ia': "La maîtrise de l'IA (Article 4)"
  }

  // Fonction pour parser le document associé (format: "Titre|Lien" ou "Titre Lien" ou juste "Lien")
  const parseDocAssociee = (docString?: string): { titre: string; lien: string } | null => {
    if (!docString || docString.trim() === '') {
      return null
    }
    
    const trimmed = docString.trim()
    
    // Vérifier si le format est "Titre|Lien" (avec pipe)
    if (trimmed.includes('|')) {
      const [titre, ...lienParts] = trimmed.split('|')
      return {
        titre: titre.trim(),
        lien: lienParts.join('|').trim()
      }
    }
    
    // Vérifier si c'est une URL (commence par http:// ou https://)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Si c'est juste une URL, on l'utilise comme lien et on extrait un titre depuis l'URL
      const urlParts = trimmed.split('/')
      const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || trimmed
      return {
        titre: lastPart.replace(/[?#].*$/, '').replace(/%20/g, ' ') || trimmed,
        lien: trimmed
      }
    }
    
    // Si le format est "Titre Lien" (titre suivi d'un espace puis d'une URL)
    // On cherche la première occurrence d'une URL dans la chaîne
    const urlRegex = /(https?:\/\/[^\s]+)/
    const urlMatch = trimmed.match(urlRegex)
    
    if (urlMatch && urlMatch.index !== undefined) {
      // Il y a une URL dans la chaîne
      const titre = trimmed.substring(0, urlMatch.index).trim()
      const lien = urlMatch[1]
      return {
        titre: titre || lien, // Si pas de titre avant l'URL, on utilise l'URL comme titre
        lien: lien
      }
    }
    
    // Si pas d'URL détectée, on considère que c'est juste un titre sans lien
    return {
      titre: trimmed,
      lien: ''
    }
  }

  // Fonction pour obtenir les fiches pratiques avec titre et lien depuis le champ "fiches"
  const getFichesPratiques = (fichesString?: string): Array<{ titre: string; lien: string }> => {
    if (!fichesString || fichesString.trim() === '') {
      return []
    }
    
    // Le champ peut contenir plusieurs liens séparés par des virgules, des points-virgules ou des retours à la ligne
    // Format supporté : "Titre|Lien" ou juste "Lien"
    return fichesString
      .split(/[,;\n]+/)
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => {
        // Vérifier si le format est "Titre|Lien"
        if (item.includes('|')) {
          const [titre, ...lienParts] = item.split('|')
          return {
            titre: titre.trim(),
            lien: lienParts.join('|').trim()
          }
        }
        
        // Sinon, c'est juste un lien - récupérer le titre depuis le mapping ou extraire depuis l'URL
        const lien = item
        const titre = fichesPratiquesTitres[lien] || 
                     fichesPratiquesTitres[lien.split('/').pop() || ''] ||
                     lien.split('/').pop() || 
                     lien
        
        return { titre, lien }
      })
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
  const [isArticleFichesOpen, setIsArticleFichesOpen] = useState(false)
  const [isArticleDocOpen, setIsArticleDocOpen] = useState(false)

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
        const { data, error } = await supabasePublic
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
      const numero = params.get('numero')

      if (!type || (!id && !numero)) return

      setLoadingContent(true)
      try {
        switch (type) {
          case 'considerant':
            await handleConsiderantClick(parseInt(id!))
            break
          case 'chapitre':
            await handleChapitreClick(parseInt(id!))
            break
          case 'article':
            let article
            if (numero) {
              // Recherche par numéro d'article
              const { data: articleData } = await supabasePublic
              .from('article')
                .select('id_article, titre, numero, contenu, resume, recitals, fiches, doc_associee')
                .eq('numero', numero)
                .single()
              article = articleData
            } else if (id) {
              // Recherche par id_article (comportement existant)
              const { data: articleData } = await supabasePublic
                .from('article')
                .select('id_article, titre, numero, contenu, resume, recitals, fiches, doc_associee')
              .eq('id_article', parseInt(id))
              .single()
              article = articleData
            }
            
            if (article) {
              await handleArticleClick({
                id_article: article.id_article,
                titre: article.titre,
                numero: article.numero,
                contenu: article.contenu,
                resume: article.resume,
                recitals: (article as any).recitals
              })
            }
            break
          case 'annexe':
            // D'abord récupérer l'annexe depuis liste_annexes
            const { data: listeAnnexe } = await supabasePublic
              .from('liste_annexes')
              .select('*')
              .eq('id_annexe', parseInt(id))
              .single()
            
            if (listeAnnexe) {
              // Récupérer le contenu depuis la table annexes
              const { data: annexeContent } = await supabasePublic
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
            const { data: section } = await supabasePublic
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
      const { data, error } = await supabasePublic
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
      const { data, error } = await supabasePublic
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
      const { data, error } = await supabasePublic
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
          recitals: (data as any).recitals,
          fiches: (data as any).fiches,
          doc_associee: (data as any).doc_associee,
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
      const { data, error } = await supabasePublic
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
          recitals: (data as any).recitals,
          fiches: (data as any).fiches,
          doc_associee: (data as any).doc_associee,
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
      const { data, error } = await supabasePublic
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
          recitals: (data as any).recitals,
          fiches: (data as any).fiches,
          doc_associee: (data as any).doc_associee,
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
      const { data, error } = await supabasePublic
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
      const { data, error } = await supabasePublic
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
      const { data: sectionData, error: sectionError } = await supabasePublic
        .from('section')
        .select('*')
        .eq('id_section', section.id_section)
        .single()

      if (sectionError) throw sectionError

      // Récupérer tous les articles de cette section et les trier
      const { data: articlesData, error: articleError } = await supabasePublic
        .from('article')
        .select(`
          id_article,
          titre,
          numero,
          contenu,
          recitals,
          resume,
          fiches,
          doc_associee,
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
          recitals: (firstArticle as any).recitals,
          fiches: (firstArticle as any).fiches,
          doc_associee: (firstArticle as any).doc_associee,
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

  // Utilitaire: parse la liste de considérants ("12, 13; 14-16") en numéros uniques, ordre d'apparition
  const parseRecitalNumbers = (value?: string): number[] => {
    if (!value) return []
    const tokens = value.split(/[,;]+/).map(t => t.trim()).filter(Boolean)
    const out: number[] = []
    for (const token of tokens) {
      const m = token.match(/^(\d+)\s*-\s*(\d+)$/)
      if (m) {
        const a = parseInt(m[1], 10)
        const b = parseInt(m[2], 10)
        if (!isNaN(a) && !isNaN(b) && b >= a) {
          for (let n = a; n <= b; n++) out.push(n)
        }
        continue
      }
      const n = parseInt(token, 10)
      if (!isNaN(n)) out.push(n)
    }
    const seen = new Set<number>()
    const unique: number[] = []
    for (const n of out) { if (!seen.has(n)) { seen.add(n); unique.push(n) } }
    return unique
  }

  // Fonction pour charger tout le contenu
  const loadFullContent = async () => {
    setIsLoadingFullContent(true)
    try {
      // Charger les considérants
      const { data: considerants, error: considerantsError } = await supabasePublic
        .from('considerant')
        .select('*')
        .order('numero')
      
      if (considerantsError) throw considerantsError
      setAllConsiderants(considerants)

      // Charger les articles avec leurs relations
      const { data: articles, error: articlesError } = await supabasePublic
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
      // Pour l'instant, on ne précharge pas les annexes complètes ici.
      // Le chargement détaillé des annexes est géré par handleAnnexeClick,
      // qui utilise les bonnes tables (`liste_annexes` et `annexes`).
      setAllAnnexes([])

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
        <link rel="canonical" href="https://ria-facile.com/consulter" />
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
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                    {error}
                  </div>
                )}
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
                          <div className="mt-2 border rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap italic" style={{ backgroundColor: '#f3f1ff', borderColor: '#f3f1ff' }}>
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
                          <div className="mt-2 border rounded-lg p-3 text-sm text-gray-700" style={{ backgroundColor: '#f3f1ff', borderColor: '#f3f1ff' }}>
                            {(() => {
                              const nums = parseRecitalNumbers(selectedArticle.recitals)
                              if (nums.length === 0) return 'Aucun considérant associé pour cet article.'
                              return (
                                <span className="pointer-events-auto">
                                  {nums.map((n, i) => (
                                    <React.Fragment key={n}>
                                      <a
                                        href={`/consulter?type=considerant&id=${n}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-[#774792] underline hover:text-violet-900 cursor-pointer"
                                      >
                                        {n}
                                      </a>
                                      {i < nums.length - 1 ? ', ' : ''}
                                    </React.Fragment>
                                  ))}
                                </span>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                      
                      {/* Fiches pratiques associées */}
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setIsArticleFichesOpen(!isArticleFichesOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          aria-expanded={isArticleFichesOpen}
                        >
                          <span className="text-sm font-medium">Fiches pratiques</span>
                          <svg className={`w-4 h-4 transition-transform ${isArticleFichesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isArticleFichesOpen && (
                          <div className="mt-2 border rounded-lg p-3 text-sm text-gray-700" style={{ backgroundColor: '#f3f1ff', borderColor: '#f3f1ff' }}>
                            {(() => {
                              const fiches = getFichesPratiques(selectedArticle.fiches)
                              if (fiches.length === 0) {
                                return 'Aucune fiche pratique associée pour cet article.'
                              }
                              return (
                                <ul className="space-y-2">
                                  {fiches.map((fiche, index) => {
                                    const isRelativeLink = fiche.lien.startsWith('/')
                                    
                                    return (
                                      <li key={index}>
                                        {isRelativeLink ? (
                                          <Link
                                            to={fiche.lien}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#774792] underline hover:text-violet-900 cursor-pointer inline-flex items-center gap-1"
                                          >
                                            {fiche.titre}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                          </Link>
                                        ) : (
                                          <a
                                            href={fiche.lien}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#774792] underline hover:text-violet-900 cursor-pointer inline-flex items-center gap-1"
                                          >
                                            {fiche.titre}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                          </a>
                      )}
                                      </li>
                                    )
                                  })}
                                </ul>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                      
                      {/* Documentation officielle associée */}
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setIsArticleDocOpen(!isArticleDocOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                          aria-expanded={isArticleDocOpen}
                        >
                          <span className="text-sm font-medium">Documentation officielle</span>
                          <svg className={`w-4 h-4 transition-transform ${isArticleDocOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isArticleDocOpen && (
                          <div className="mt-2 border rounded-lg p-3 text-sm text-gray-700" style={{ backgroundColor: '#f3f1ff', borderColor: '#f3f1ff' }}>
                            {(() => {
                              const doc = parseDocAssociee(selectedArticle.doc_associee)
                              if (!doc || !doc.lien) {
                                return 'Aucun document officiel associé pour le moment.'
                              }
                              return (
                                <a
                                  href={doc.lien}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#774792] underline hover:text-violet-900 cursor-pointer inline-flex items-center gap-1"
                                >
                                  {doc.titre || doc.lien}
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )
                            })()}
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