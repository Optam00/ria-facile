import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabasePublic } from '../lib/supabasePublic'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'
import { TableData, CellAlignment } from '../components/TableEditor'

interface TextBlockStyle {
  type: 'none' | 'border-left' | 'box' | 'gradient-box' | 'info-box'
  color?: 'purple' | 'indigo' | 'blue' | 'teal' | 'yellow' | 'green' | 'red' | 'orange'
  emoji?: string
}

interface SectionBlock {
  type: 'sous-titre' | 'texte' | 'tableau'
  id: string
  texte?: string
  contenu?: string
  table_data?: TableData
  style?: TextBlockStyle
}

interface FichePratiqueSection {
  type: 'section' | 'image' | 'sources'
  titre?: string
  blocs?: SectionBlock[]
  // Pour compatibilité avec l'ancien format
  contenu?: string
  image_url?: string
  alt?: string
  position: number
  table_data?: {
    headers: string[]
    rows: string[][]
  }
  sources?: Array<{
    nom: string
    lien: string
  }>
}

interface FichePratique {
  id: number
  slug: string
  titre: string
  description: string
  articles_ria: string[]
  contenu: {
    sections: FichePratiqueSection[]
  }
  image_url?: string
  show_disclaimer?: boolean
  disclaimer_text?: string | null
}

const FichePratiquePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [fiche, setFiche] = useState<FichePratique | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)
  const defaultDisclaimerText =
    "Cette fiche pratique peut impliquer des simplifications pour faciliter la compréhension. Une lecture attentive du texte officiel du Règlement IA est nécessaire pour une application complète et précise.<br><br>Pour bénéficier d'un accompagnement personnalisé par des experts, <a href=\"/contact\" style=\"color: #774792; text-decoration: underline; font-weight: 600;\">contactez-nous via le formulaire</a>."

  useEffect(() => {
    const fetchFiche = async () => {
      if (!slug) {
        setError('Slug manquant')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabasePublic
          .from('fiches_pratiques')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (fetchError) throw fetchError
        if (!data) {
          setError('Fiche pratique non trouvée')
          return
        }

        // Debug: vérifier le contenu des blocs (spécialement pour exactitude)
        console.log(`🔍 DEBUG FICHE ${slug?.toUpperCase() || 'UNKNOWN'}:`, {
          slug: slug,
          hasContenu: !!data.contenu,
          hasSections: !!(data.contenu && data.contenu.sections),
          sectionsCount: data.contenu?.sections?.length || 0,
          contenuKeys: data.contenu ? Object.keys(data.contenu) : []
        })
        
        if (slug === 'exactitude') {
          console.log(`📋 EXACTITUDE - Structure complète (premiers 3000 chars):`, JSON.stringify(data.contenu, null, 2).substring(0, 3000))
        }
        
        if (data.contenu && data.contenu.sections) {
          let totalLinksFound = 0
          data.contenu.sections.forEach((section: any, sIndex: number) => {
            if (section.blocs) {
              section.blocs.forEach((block: any, bIndex: number) => {
                if (block.type === 'texte' && block.contenu) {
                  // Vérifier si des liens sont présents (chercher aussi dans le contenu brut)
                  const contenuStr = typeof block.contenu === 'string' ? block.contenu : JSON.stringify(block.contenu)
                  const hasLinkTag = contenuStr.includes('<a')
                  const hasEscapedLink = contenuStr.includes('&lt;a')
                  
                  if (slug === 'exactitude' || slug === 'transparence') {
                    console.log(`🔍 ${slug} - Section ${sIndex}, Bloc ${bIndex}:`, {
                      hasLinkTag,
                      hasEscapedLink,
                      contenuType: typeof block.contenu,
                      contenuLength: contenuStr.length,
                      contenuPreview: contenuStr.substring(0, 500),
                      fullContenu: contenuStr
                    })
                  }
                  
                  if (hasLinkTag || hasEscapedLink) {
                    totalLinksFound++
                    // Extraire tous les liens
                    const linkMatches = contenuStr.match(/<a[^>]*>.*?<\/a>/gi)
                    if (linkMatches) {
                      console.log(`✅ Liens trouvés (${slug}):`, linkMatches)
                      // Déséchapper si nécessaire
                      if (hasEscapedLink) {
                        block.contenu = contenuStr.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
                        console.log(`✅ Liens déséchappés pour ${slug}`)
                      }
                    } else {
                      // Vérifier si c'est échappé
                      const escapedMatches = contenuStr.match(/&lt;a[^&]*&gt;.*?&lt;\/a&gt;/gi)
                      if (escapedMatches) {
                        console.log(`⚠️ Liens échappés trouvés (${slug}):`, escapedMatches)
                        // Déséchapper les liens
                        block.contenu = contenuStr.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
                        console.log(`✅ Liens déséchappés pour ${slug}`)
                      }
                    }
                  }
                }
              })
            }
          })
          
          if (slug === 'exactitude' || slug === 'transparence') {
            console.log(`📊 ${slug.toUpperCase()}: ${totalLinksFound} bloc(s) avec lien(s) trouvé(s)`)
          }
        }

        setFiche(data)
      } catch (err) {
        console.error('Erreur lors de la récupération de la fiche pratique:', err)
        setError('Impossible de charger la fiche pratique')
      } finally {
        setLoading(false)
      }
    }

    fetchFiche()
  }, [slug])

  // Debug: vérifier le DOM après le rendu
  useEffect(() => {
    if (fiche) {
      setTimeout(() => {
        const links = document.querySelectorAll('.fiche-pratique-content a')
        console.log(`🔍 Liens trouvés dans le DOM après rendu: ${links.length}`)
        links.forEach((link, index) => {
          console.log(`Lien ${index}:`, {
            href: link.getAttribute('href'),
            text: link.textContent,
            outerHTML: link.outerHTML.substring(0, 150),
            computedStyle: window.getComputedStyle(link).color
          })
        })
      }, 1000)
    }
  }, [fiche])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error || !fiche) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Fiche pratique non trouvée</h1>
          <p className="text-gray-600 mb-6">{error || 'La fiche pratique demandée n\'existe pas.'}</p>
          <Link
            to="/fiches-pratiques"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour aux fiches pratiques
          </Link>
        </div>
      </div>
    )
  }

  // Trier les sections par position
  const sortedSections = [...(fiche.contenu.sections || [])].sort((a, b) => a.position - b.position)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{fiche.titre} — Fiche pratique | RIA Facile</title>
        <meta name="description" content={fiche.description} />
      </Helmet>

      <AdherentOnlyOverlay>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Bouton retour */}
          <Link 
            to="/fiches-pratiques" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour aux fiches pratiques</span>
          </Link>

          {/* En-tête */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-4 md:p-8 mb-8 border-2" style={{ borderColor: '#774792' }}>
            <div className="flex items-start gap-2 md:gap-3 mb-4">
              <span className="text-2xl md:text-4xl shrink-0">📄</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 break-words overflow-wrap-anywhere" style={{ color: '#774792' }}>
                  FICHE PRATIQUE : {fiche.titre.toUpperCase()}
                </h1>
                {fiche.description && (
                  <p className="text-gray-700 mb-4">{fiche.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-4">
                  {fiche.articles_ria && fiche.articles_ria.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                      <div className="flex flex-wrap gap-2">
                        {fiche.articles_ria.map((article) => (
                          <span
                            key={article}
                            className="inline-block text-sm font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200"
                          >
                            Article {article}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="prose prose-lg max-w-none">
            {sortedSections.map((section, index) => {
              if (section.type === 'section') {
                return (
                  <section key={index} className="bg-white rounded-2xl shadow-md p-8 mb-8">
                    {section.titre && (
                      <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
                        {section.titre}
                      </h2>
                    )}
                    {/* Nouveau format avec blocs */}
                    {section.blocs && section.blocs.length > 0 ? (
                      <div className="space-y-6">
                        {section.blocs.map((block) => {
                          if (block.type === 'sous-titre') {
                            return (
                              <h3 key={block.id} className="text-xl font-bold mb-4 text-gray-900">
                                {block.texte}
                              </h3>
                            )
                          } else if (block.type === 'texte') {
                            // Fonction helper pour générer les classes CSS selon le style
                            const getStyleClasses = (style?: TextBlockStyle): string => {
                              if (!style || style.type === 'none') {
                                return 'text-gray-700'
                              }
                              
                              const colorMap = {
                                purple: { border: 'border-purple-500', bg: 'bg-purple-50', borderLight: 'border-purple-200' },
                                indigo: { border: 'border-indigo-500', bg: 'bg-indigo-50', borderLight: 'border-indigo-200' },
                                blue: { border: 'border-blue-500', bg: 'bg-blue-50', borderLight: 'border-blue-200' },
                                teal: { border: 'border-teal-500', bg: 'bg-teal-50', borderLight: 'border-teal-200' },
                                yellow: { border: 'border-yellow-400', bg: 'bg-yellow-50', borderLight: 'border-yellow-200' },
                                green: { border: 'border-green-500', bg: 'bg-green-50', borderLight: 'border-green-200' },
                                red: { border: 'border-red-500', bg: 'bg-red-50', borderLight: 'border-red-200' },
                                orange: { border: 'border-orange-500', bg: 'bg-orange-50', borderLight: 'border-orange-200' },
                              }
                              
                              const colors = colorMap[style.color || 'purple']
                              
                              switch (style.type) {
                                case 'border-left':
                                  return `border-l-4 ${colors.border} pl-6 py-2 text-gray-700`
                                case 'box':
                                  return `${colors.bg} border-l-4 ${colors.border} p-6 rounded-r-lg text-gray-700`
                                case 'gradient-box':
                                  const gradientMap = {
                                    purple: 'bg-gradient-to-br from-purple-50 to-indigo-50',
                                    indigo: 'bg-gradient-to-br from-indigo-50 to-blue-50',
                                    blue: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                                    teal: 'bg-gradient-to-br from-teal-50 to-green-50',
                                    yellow: 'bg-gradient-to-br from-yellow-50 to-orange-50',
                                    green: 'bg-gradient-to-br from-green-50 to-emerald-50',
                                    red: 'bg-gradient-to-br from-red-50 to-pink-50',
                                    orange: 'bg-gradient-to-br from-orange-50 to-amber-50',
                                  }
                                  return `${gradientMap[style.color || 'purple']} rounded-xl p-6 border-2 ${colors.borderLight} text-gray-700`
                                case 'info-box':
                                  return `${colors.bg} border-l-4 ${colors.border} p-6 rounded-r-lg text-gray-700`
                                default:
                                  return 'text-gray-700'
                              }
                            }
                            
                            const styleClasses = getStyleClasses(block.style)
                            
                            // S'assurer que le contenu n'est pas échappé
                            let contenuToRender = block.contenu || ''
                            if (contenuToRender.includes('&lt;a') || contenuToRender.includes('&gt;')) {
                              // Déséchapper le HTML
                              contenuToRender = contenuToRender
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&quot;/g, '"')
                                .replace(/&#39;/g, "'")
                                .replace(/&amp;/g, '&')
                            }
                            
                            // Nettoyer le contenu : extraire seulement le contenu réel du bloc
                            // Si le contenu contient des balises de section parentes, les retirer
                            if (contenuToRender.includes('<section') || contenuToRender.includes('bg-white rounded-2xl')) {
                              // Créer un élément temporaire pour parser le HTML
                              const tempDiv = document.createElement('div')
                              tempDiv.innerHTML = contenuToRender
                              
                              // Chercher la section ou le div principal
                              const section = tempDiv.querySelector('section') || tempDiv.querySelector('div.bg-white')
                              
                              if (section) {
                                // Extraire tout le contenu de la section, mais sans la balise section elle-même
                                // Chercher le premier élément enfant qui contient du contenu réel
                                const firstChild = section.firstElementChild
                                
                                if (firstChild) {
                                  // Si c'est un <p>, prendre tous les <p> et <div> qui suivent
                                  if (firstChild.tagName === 'P') {
                                    let cleanedContent = ''
                                    let currentElement: Element | null = firstChild
                                    
                                    while (currentElement && currentElement.parentElement === section) {
                                      // Prendre tous les <p> et <div> qui ne sont pas des conteneurs de section
                                      if (currentElement.tagName === 'P' || 
                                          (currentElement.tagName === 'DIV' && 
                                           !currentElement.classList.contains('space-y-6') &&
                                           !currentElement.classList.contains('bg-white'))) {
                                        cleanedContent += currentElement.outerHTML
                                      }
                                      currentElement = currentElement.nextElementSibling
                                    }
                                    
                                    if (cleanedContent) {
                                      contenuToRender = cleanedContent
                                    } else {
                                      // Fallback : prendre le contenu textuel
                                      contenuToRender = section.textContent || contenuToRender
                                    }
                                  } else if (firstChild.tagName === 'DIV' && firstChild.classList.contains('space-y-6')) {
                                    // Si c'est un div.space-y-6, prendre tout son contenu
                                    contenuToRender = firstChild.innerHTML
                                  } else {
                                    // Sinon, prendre tout le contenu de la section
                                    contenuToRender = section.innerHTML
                                  }
                                } else {
                                  // Pas d'enfant, prendre le texte direct
                                  contenuToRender = section.textContent || contenuToRender
                                }
                              }
                            }
                            
                            // Debug: vérifier le contenu avant le rendu
                            if (contenuToRender.includes('<a')) {
                              console.log('🔗 Rendu bloc avec lien:', {
                                blockId: block.id,
                                slug: slug,
                                contenuPreview: contenuToRender.substring(0, 200) + '...',
                                hasLink: contenuToRender.includes('<a'),
                                linkCount: (contenuToRender.match(/<a/gi) || []).length
                              })
                            }
                            
                            return (
                              <div 
                                key={block.id}
                                className={`fiche-pratique-content ${styleClasses}`}
                                dangerouslySetInnerHTML={{ __html: contenuToRender }}
                              />
                            )
                          } else if (block.type === 'tableau' && block.table_data) {
                            const getCellKey = (rowIndex: number, colIndex: number) => `${rowIndex}-${colIndex}`
                            const getCellSpan = (rowIndex: number, colIndex: number) => {
                              const key = getCellKey(rowIndex, colIndex)
                              return (block.table_data as any).cellSpans?.[key] || {}
                            }
                            const getCellAlignment = (rowIndex: number, colIndex: number): CellAlignment => {
                              const key = getCellKey(rowIndex, colIndex)
                              return (block.table_data as any).cellAlignments?.[key] || { horizontal: 'left', vertical: 'middle' }
                            }
                            const isCellMerged = (rowIndex: number, colIndex: number) => {
                              const span = getCellSpan(rowIndex, colIndex)
                              return span.isMerged === true
                            }

                            return (
                              <div key={block.id} className="mb-8 overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                  <thead>
                                    <tr className="bg-purple-100">
                                      {block.table_data.headers.map((header, hIndex) => (
                                        <th key={hIndex} className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {block.table_data.rows.map((row, rIndex) => {
                                      const cellsToRender: Array<{ colIndex: number; shouldRender: boolean }> = []
                                      block.table_data.headers.forEach((_, colIndex) => {
                                        // Vérifier si la cellule est fusionnée (marquée comme isMerged)
                                        if (isCellMerged(rIndex, colIndex)) {
                                          cellsToRender.push({ colIndex, shouldRender: false })
                                          return
                                        }
                                        
                                        // Vérifier si cette cellule est couverte par une cellule avec rowspan/colspan d'une ligne précédente
                                        let isCovered = false
                                        for (let r = 0; r < rIndex; r++) {
                                          for (let c = 0; c < block.table_data.headers.length; c++) {
                                            const span = getCellSpan(r, c)
                                            if (span.rowspan && span.colspan) {
                                              const rowEnd = r + (span.rowspan - 1)
                                              const colEnd = c + (span.colspan - 1)
                                              if (rIndex <= rowEnd && rIndex > r && colIndex >= c && colIndex <= colEnd) {
                                                isCovered = true
                                                break
                                              }
                                            } else if (span.rowspan) {
                                              const rowEnd = r + (span.rowspan - 1)
                                              if (rIndex <= rowEnd && rIndex > r && colIndex === c) {
                                                isCovered = true
                                                break
                                              }
                                            } else if (span.colspan) {
                                              const colEnd = c + (span.colspan - 1)
                                              if (rIndex === r && colIndex >= c && colIndex <= colEnd && colIndex > c) {
                                                isCovered = true
                                                break
                                              }
                                            }
                                          }
                                          if (isCovered) break
                                        }
                                        
                                        cellsToRender.push({ colIndex, shouldRender: !isCovered })
                                      })

                                      return (
                                        <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                                          {cellsToRender.map(({ colIndex, shouldRender }) => {
                                            if (!shouldRender) return null
                                            const span = getCellSpan(rIndex, colIndex)
                                            const alignment = getCellAlignment(rIndex, colIndex)
                                            const textAlign = alignment.horizontal || 'left'
                                            const verticalAlign = alignment.vertical || 'middle'
                                            
                                            return (
                                              <td
                                                key={colIndex}
                                                rowSpan={span.rowspan}
                                                colSpan={span.colspan}
                                                className="border border-gray-300 px-4 py-3 text-gray-700"
                                                style={{
                                                  verticalAlign: verticalAlign,
                                                }}
                                              >
                                                <div 
                                                  className="fiche-pratique-content"
                                                  dangerouslySetInnerHTML={{ __html: row[colIndex] || '' }}
                                                  style={{
                                                    textAlign: textAlign,
                                                    display: 'flex',
                                                    alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
                                                    justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'space-between',
                                                    minHeight: '40px',
                                                  }}
                                                />
                                              </td>
                                            )
                                          })}
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    ) : section.contenu ? (
                      /* Ancien format avec contenu direct (compatibilité) */
                      <div 
                        className="fiche-pratique-content text-gray-700"
                        dangerouslySetInnerHTML={{ __html: section.contenu }}
                      />
                    ) : null}
                  </section>
                )
              } else if (section.type === 'image') {
                return (
                  <div key={index} className="mb-8 flex justify-center">
                    {section.image_url && (
                      <img
                        src={section.image_url}
                        alt={section.alt || 'Image de la fiche pratique'}
                        className="max-w-full h-auto rounded-lg shadow-md"
                        loading="lazy"
                      />
                    )}
                  </div>
                )
              } else if (section.type === 'table' && section.table_data) {
                return (
                  <div key={index} className="mb-8 overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-purple-100">
                          {section.table_data.headers.map((header, hIndex) => (
                            <th key={hIndex} className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table_data.rows.map((row, rIndex) => (
                          <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                            {row.map((cell, cIndex) => (
                              <td key={cIndex} className="border border-gray-300 px-4 py-3 text-gray-700">
                                <div className="fiche-pratique-content" dangerouslySetInnerHTML={{ __html: cell }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              } else if (section.type === 'sources') {
                // Utiliser le titre de la section ou "SOURCES ET RÉFÉRENCES" par défaut
                const sourcesTitle = section.titre || 'SOURCES ET RÉFÉRENCES'
                
                return (
                  <section key={index} className="bg-white rounded-2xl shadow-md p-8 mb-8">
                    <button
                      onClick={() => setSourcesOuvertes(!sourcesOuvertes)}
                      className="w-full flex items-center justify-between text-left mb-6 hover:opacity-80 transition-opacity"
                    >
                      <h2 className="text-2xl font-bold" style={{ color: '#774792' }}>
                        {sourcesTitle}
                      </h2>
                      <svg 
                        className={`w-6 h-6 text-purple-600 transition-transform ${sourcesOuvertes ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${sourcesOuvertes ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      {section.sources && section.sources.length > 0 ? (
                        <div className="space-y-6">
                          {section.sources.map((source, sIndex) => {
                            // Alterner les couleurs de bordure
                            const borderColors = ['border-purple-500', 'border-indigo-500', 'border-blue-500']
                            const borderColor = borderColors[sIndex % borderColors.length]
                            
                            return (
                              <div key={sIndex} className={`border-l-4 ${borderColor} pl-6 py-3`}>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                                  {source.nom || 'Source sans nom'}
                                </h3>
                                {source.lien && (
                                  <a 
                                    href={source.lien}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                                  >
                                    {source.lien.includes('eur-lex') ? 'Lien EUR-Lex' : source.lien.includes('consulter') ? 'Consulter le règlement' : 'Lien vers le document'}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Aucune source renseignée.</p>
                      )}
                    </div>
                  </section>
                )
              }
              return null
            })}
          </div>

          {/* Disclaimer Important - Optionnel selon la fiche */}
          {(fiche.show_disclaimer !== false) && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Important :</strong>{' '}
                    <span 
                      className="fiche-pratique-content"
                      dangerouslySetInnerHTML={{
                        __html: fiche.disclaimer_text && fiche.disclaimer_text.trim().length > 0
                          ? fiche.disclaimer_text
                          : defaultDisclaimerText
                      }}
                    />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bouton retour en bas */}
          <div className="mt-8 text-center">
            <Link 
              to="/fiches-pratiques" 
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour aux fiches pratiques</span>
            </Link>
          </div>
        </div>
      </AdherentOnlyOverlay>
    </div>
  )
}

export default FichePratiquePage
