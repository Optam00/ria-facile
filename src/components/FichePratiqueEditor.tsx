import React, { useState, useRef, useEffect } from 'react'
import { TableEditor, TableData } from './TableEditor'
import { SourcesEditor } from './SourcesEditor'

export interface TextBlockStyle {
  type: 'none' | 'border-left' | 'box' | 'gradient-box' | 'info-box'
  color?: 'purple' | 'indigo' | 'blue' | 'teal' | 'yellow' | 'green' | 'red' | 'orange'
  emoji?: string // Emoji optionnel pour le titre (ex: 💡, ✅, ⚠️, etc.)
}

export interface SectionBlock {
  type: 'sous-titre' | 'texte' | 'tableau'
  id: string
  texte?: string // Pour sous-titre
  contenu?: string // Pour texte (HTML)
  table_data?: TableData
  style?: TextBlockStyle // Style de mise en page pour les blocs texte
}

export interface FichePratiqueSection {
  type: 'section' | 'image' | 'sources'
  titre?: string
  blocs?: SectionBlock[] // Blocs de contenu (sous-titres, texte, tableaux)
  // Pour compatibilité avec l'ancien format
  contenu?: string
  image_url?: string
  alt?: string
  position: number
  id?: string
  // Pour les sources
  sources?: Array<{
    nom: string
    lien: string
  }>
}

interface FichePratiqueEditorProps {
  sections: FichePratiqueSection[]
  onSectionsChange: (sections: FichePratiqueSection[]) => void
  onImageUpload?: (file: File, sectionId: string) => Promise<string>
}

export const FichePratiqueEditor: React.FC<FichePratiqueEditorProps> = ({
  sections,
  onSectionsChange,
  onImageUpload,
}) => {
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const isInitializedRef = useRef<{ [key: string]: boolean }>({})
  const isUpdatingRef = useRef<{ [key: string]: boolean }>({})
  const [currentFontSize, setCurrentFontSize] = useState<string>('default')
  const [linkModal, setLinkModal] = useState<{
    visible: boolean
    editorId: string | null
    url: string
    openInNewTab: boolean
    existingLink: HTMLAnchorElement | null
    savedRange: Range | null
  }>({
    visible: false,
    editorId: null,
    url: '',
    openInNewTab: true,
    existingLink: null,
    savedRange: null,
  })

  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (linkModal.visible) {
      // Sauvegarder la position de scroll
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = `-${scrollX}px`
      document.body.style.width = '100%'
      
      return () => {
        // Restaurer le scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.width = ''
        window.scrollTo(scrollX, scrollY)
      }
    }
  }, [linkModal.visible])
  
  const addSection = () => {
    const newSection: FichePratiqueSection = {
      type: 'section',
      titre: '',
      blocs: [],
      position: sections.length + 1,
      id: `section-${Date.now()}`,
    }
    onSectionsChange([...sections, newSection])
  }

  const addImage = () => {
    const newImage: FichePratiqueSection = {
      type: 'image',
      image_url: '',
      alt: '',
      position: sections.length + 1,
      id: `image-${Date.now()}`,
    }
    onSectionsChange([...sections, newImage])
  }

  const addSources = () => {
    // Les sources doivent toujours être à la fin
    const nonSourcesSections = sections.filter(s => s.type !== 'sources')
    const sourcesSections = sections.filter(s => s.type === 'sources')
    
    const newSources: FichePratiqueSection = {
      type: 'sources',
      titre: 'SOURCES ET RÉFÉRENCES',
      sources: [],
      position: sections.length + 1,
      id: `sources-${Date.now()}`,
    }
    
    // Mettre les sources à la fin
    onSectionsChange([...nonSourcesSections, ...sourcesSections, newSources])
  }

  const refreshBlockFontSize = (editorId: string) => {
    const editor = editorRefs.current[editorId]
    if (!editor) {
      setCurrentFontSize('default')
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
      setCurrentFontSize('default')
      return
    }
    try {
      const size = document.queryCommandValue('fontSize')
      const allowed = ['1', '2', '3', '4', '5', '6', '7']
      if (size && allowed.includes(size.toString())) {
        setCurrentFontSize(size.toString())
      } else {
        setCurrentFontSize('default')
      }
    } catch {
      setCurrentFontSize('default')
    }
  }

  const addBlockToSection = (sectionId: string, blockType: 'sous-titre' | 'texte' | 'tableau') => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.type !== 'section') return

    const newBlock: SectionBlock = {
      type: blockType,
      id: `block-${Date.now()}`,
      ...(blockType === 'sous-titre' ? { texte: '' } : {}),
      ...(blockType === 'texte' ? { contenu: '' } : {}),
      ...(blockType === 'tableau' ? {
        table_data: {
          headers: ['Colonne 1', 'Colonne 2', 'Colonne 3'],
          rows: [
            ['Ligne 1, Col 1', 'Ligne 1, Col 2', 'Ligne 1, Col 3'],
            ['Ligne 2, Col 1', 'Ligne 2, Col 2', 'Ligne 2, Col 3'],
          ],
        }
      } : {}),
    }

    updateSection(sectionId, {
      blocs: [...(section.blocs || []), newBlock]
    })
  }

  const updateBlock = (sectionId: string, blockId: string, updates: Partial<SectionBlock>) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.type !== 'section') return

    const updatedBlocs = (section.blocs || []).map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    )

    updateSection(sectionId, { blocs: updatedBlocs })
  }

  const deleteBlock = (sectionId: string, blockId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.type !== 'section') return

    const updatedBlocs = (section.blocs || []).filter(block => block.id !== blockId)
    updateSection(sectionId, { blocs: updatedBlocs })
  }

  const moveBlock = (sectionId: string, blockId: string, direction: 'up' | 'down') => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.type !== 'section') return

    const blocs = [...(section.blocs || [])]
    const index = blocs.findIndex(b => b.id === blockId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocs.length) return

    ;[blocs[index], blocs[newIndex]] = [blocs[newIndex], blocs[index]]
    updateSection(sectionId, { blocs })
  }

  const updateSection = (id: string, updates: Partial<FichePratiqueSection>) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id))
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    // Empêcher de déplacer une section avant la position 0 (métadonnées)
    // Les sections commencent à la position 1 (après les métadonnées)
    if (newIndex < 0) return

    const newSections = [...sections]
    ;[newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ]
    // Mettre à jour les positions
    newSections.forEach((s, i) => {
      s.position = i + 1
    })
    onSectionsChange(newSections)
  }

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionId: string
  ) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload) return

    try {
      const imageUrl = await onImageUpload(file, sectionId)
      updateSection(sectionId, { image_url: imageUrl })
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error)
      alert('Erreur lors de l\'upload de l\'image')
    }
  }

  const handleLinkClick = (editorId: string) => {
    const editor = editorRefs.current[editorId]
    if (!editor) return

    // Sauvegarder la position de scroll actuelle
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    editor.focus()
    
    // Attendre un peu pour que le focus soit établi
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        // Si pas de sélection, essayer de sélectionner le mot sous le curseur
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
        alert('Veuillez sélectionner du texte avant d\'ajouter un lien')
        return
      }

      const range = selection.getRangeAt(0)
      if (range.collapsed) {
        alert('Veuillez sélectionner du texte avant d\'ajouter un lien')
        return
      }

      // SAUVEGARDER LA SÉLECTION AVANT D'OUVRIR LA MODAL
      const savedRange = range.cloneRange()

      // Vérifier si on est déjà dans un lien
      let linkElement: HTMLAnchorElement | null = null
      let node = range.commonAncestorContainer
      while (node && node !== editor) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          if (element.tagName === 'A') {
            linkElement = element as HTMLAnchorElement
            break
          }
        }
        node = node.parentNode
      }

      setLinkModal({
        visible: true,
        editorId,
        url: linkElement?.href || '',
        openInNewTab: linkElement?.target === '_blank',
        existingLink: linkElement,
        savedRange: savedRange,
      })

      // Restaurer la position de scroll après un court délai
      setTimeout(() => {
        window.scrollTo(scrollX, scrollY)
      }, 50)
    }, 10)
  }

  const applyLink = () => {
    if (!linkModal.editorId) return

    const editor = editorRefs.current[linkModal.editorId]
    if (!editor) return

    // Si on modifie un lien existant
    if (linkModal.existingLink) {
      linkModal.existingLink.href = linkModal.url || '#'
      linkModal.existingLink.target = linkModal.openInNewTab ? '_blank' : ''
      linkModal.existingLink.rel = linkModal.openInNewTab ? 'noopener noreferrer' : ''
      linkModal.existingLink.style.color = '#2563eb'
      linkModal.existingLink.style.textDecoration = 'underline'
    } else {
      // Restaurer la sélection sauvegardée
      editor.focus()
      
      setTimeout(() => {
        const selection = window.getSelection()
        if (!selection) return

        // Utiliser la sélection sauvegardée
        if (linkModal.savedRange) {
          try {
            selection.removeAllRanges()
            selection.addRange(linkModal.savedRange)
          } catch (e) {
            console.warn('Impossible de restaurer la sélection:', e)
            return
          }
        } else {
          return
        }

        const range = selection.getRangeAt(0)
        if (range.collapsed) {
          return
        }

        // Créer un nouveau lien
        const selectedText = range.toString()
        if (!selectedText) return

        const linkHtml = `<a href="${linkModal.url || '#'}" ${linkModal.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="color: #2563eb; text-decoration: underline;">${selectedText}</a>`
        
        try {
          range.deleteContents()
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = linkHtml
          const linkNode = tempDiv.firstChild
          if (linkNode) {
            range.insertNode(linkNode)
          }
        } catch (e) {
          // Fallback : utiliser insertHTML
          document.execCommand('insertHTML', false, linkHtml)
        }
      }, 50)
    }

    // Mettre à jour le contenu du bloc après un court délai
    setTimeout(() => {
      const editorId = linkModal.editorId!
      const blockId = editorId.replace('block-', '')
      const section = sections.find(s => s.blocs?.some(b => b.id === blockId))
      if (section) {
        const block = section.blocs?.find(b => b.id === blockId)
        if (block) {
          const html = editor.innerHTML
          // Vérifier que les liens sont bien présents dans le HTML
          const links = editor.querySelectorAll('a')
          console.log('Liens trouvés dans l\'éditeur:', links.length)
          links.forEach((link, index) => {
            console.log(`Lien ${index}:`, {
              href: link.href,
              text: link.textContent,
              html: link.outerHTML
            })
          })
          updateBlock(section.id!, blockId, { contenu: html })
        }
      }
    }, 200)

    setLinkModal({ visible: false, editorId: null, url: '', openInNewTab: true, existingLink: null, savedRange: null })
  }

  const removeLink = () => {
    if (!linkModal.editorId || !linkModal.existingLink) return

    const editor = editorRefs.current[linkModal.editorId]
    if (!editor) return

    // Remplacer le lien par son contenu textuel
    const text = linkModal.existingLink.textContent || ''
    const textNode = document.createTextNode(text)
    linkModal.existingLink.parentNode?.replaceChild(textNode, linkModal.existingLink)

    // Mettre à jour le contenu du bloc
    setTimeout(() => {
      const editorId = linkModal.editorId!
      const blockId = editorId.replace('block-', '')
      const section = sections.find(s => s.blocs?.some(b => b.id === blockId))
      if (section) {
        const block = section.blocs?.find(b => b.id === blockId)
        if (block) {
          const html = editor.innerHTML
          updateBlock(section.id!, blockId, { contenu: html })
        }
      }
    }, 0)

    setLinkModal({ visible: false, editorId: null, url: '', openInNewTab: true, existingLink: null, savedRange: null })
  }

  const executeCommand = (editorId: string, command: string, value?: string) => {
    const editor = editorRefs.current[editorId]
    if (!editor) {
      console.warn('Éditeur non trouvé:', editorId)
      return
    }

    // Focus sur l'éditeur d'abord
    editor.focus()
    
    // Attendre un peu pour que le focus soit établi, puis exécuter
    setTimeout(() => {
      // Sauvegarder la sélection actuelle si elle existe
      const selection = window.getSelection()
      
      if (!selection || selection.rangeCount === 0) {
        // Si pas de sélection, placer le curseur à la fin
        const rangeEnd = document.createRange()
        rangeEnd.selectNodeContents(editor)
        rangeEnd.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(rangeEnd)
      }
      
      // Exécuter la commande
      const success = document.execCommand(command, false, value || undefined)
      
      if (success) {
        // Mettre à jour le contenu après l'exécution de la commande
        isUpdatingRef.current[editorId] = true
        setTimeout(() => {
          const html = editor.innerHTML
          // Si c'est un bloc, trouver la section et le bloc correspondants
          if (editorId.startsWith('block-')) {
            const blockId = editorId.replace('block-', '')
            sections.forEach(s => {
              if (s.type === 'section' && s.blocs) {
                const block = s.blocs.find(b => b.id === blockId)
                if (block && block.type === 'texte') {
                  updateBlock(s.id!, blockId, { contenu: html })
                }
              }
            })
          } else {
            // Ancien format : section avec contenu direct
            updateSection(editorId, { contenu: html })
          }
          isUpdatingRef.current[editorId] = false
        }, 0)
      } else {
        console.warn('Commande échouée:', command, value)
      }
    }, 10)
  }

  const handleEditorChange = (sectionId: string) => {
    if (isUpdatingRef.current[sectionId]) return
    
    const editor = editorRefs.current[sectionId]
    if (!editor) return
    
    // Mettre à jour le contenu sans toucher au DOM
    const html = editor.innerHTML
    updateSection(sectionId, { contenu: html })
  }

  const insertHTML = (editorId: string, openTag: string, closeTag: string) => {
    const editor = editorRefs.current[editorId]
    if (!editor) return

    editor.focus()
    
    // Insérer le HTML à la position du curseur
    const htmlToInsert = openTag + 'Votre texte ici' + closeTag
    const success = document.execCommand('insertHTML', false, htmlToInsert)
    
    if (success) {
      // Mettre à jour le contenu après l'insertion
      isUpdatingRef.current[editorId] = true
      setTimeout(() => {
        const html = editor.innerHTML
        // Si c'est un bloc, trouver la section et le bloc correspondants
        if (editorId.startsWith('block-')) {
          const blockId = editorId.replace('block-', '')
          sections.forEach(s => {
            if (s.type === 'section' && s.blocs) {
              const block = s.blocs.find(b => b.id === blockId)
              if (block && block.type === 'texte') {
                updateBlock(s.id!, blockId, { contenu: html })
              }
            }
          })
        } else {
          updateSection(editorId, { contenu: html })
        }
        isUpdatingRef.current[editorId] = false
      }, 0)
    }
  }

  // Initialiser le contenu seulement une fois par section
  useEffect(() => {
    // Réinitialiser isInitializedRef pour les sections et blocs qui n'existent plus
    const currentBlockIds = new Set<string>()
    sections.forEach(section => {
      if (section.type === 'section' && section.id) {
        if (section.blocs) {
          section.blocs.forEach(block => {
            if (block.type === 'texte') {
              currentBlockIds.add(`block-${block.id}`)
            }
          })
        }
      }
    })
    
    // Supprimer les refs qui n'existent plus
    Object.keys(isInitializedRef.current).forEach(id => {
      if (id.startsWith('block-') && !currentBlockIds.has(id)) {
        delete isInitializedRef.current[id]
        delete editorRefs.current[id]
      }
    })
    
    // Attendre un peu pour que les refs soient attachées
    const timeoutId = setTimeout(() => {
      sections.forEach((section) => {
        // Gérer les sections de type 'section'
        if (section.type === 'section' && section.id) {
          const editor = editorRefs.current[section.id]
          if (editor) {
            // Toujours charger le contenu si la section en a un
            if (section.contenu && section.contenu.trim() !== '') {
              // Vérifier si le contenu actuel de l'éditeur est différent du contenu de la section
              const currentContent = editor.innerHTML.trim()
              const sectionContent = section.contenu.trim()
              // Charger le contenu si l'éditeur est vide ou si le contenu est différent
              if (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>' || currentContent !== sectionContent) {
                editor.innerHTML = section.contenu
                isInitializedRef.current[section.id] = true
              } else if (!isInitializedRef.current[section.id]) {
                editor.innerHTML = section.contenu
                isInitializedRef.current[section.id] = true
              }
            } else if (!isInitializedRef.current[section.id]) {
              // Si pas de contenu, initialiser avec un paragraphe vide
              editor.innerHTML = '<p><br></p>'
              isInitializedRef.current[section.id] = true
            }
          }
        }
        // Gérer les tableaux avec leur contenu de présentation
        if (section.type === 'table' && section.id) {
          const editor = editorRefs.current[`table-content-${section.id}`]
          if (editor) {
            if (section.contenu && section.contenu.trim() !== '') {
              const currentContent = editor.innerHTML.trim()
              const sectionContent = section.contenu.trim()
              if (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>' || currentContent !== sectionContent) {
                editor.innerHTML = section.contenu
                isInitializedRef.current[`table-content-${section.id}`] = true
              } else if (!isInitializedRef.current[`table-content-${section.id}`]) {
                editor.innerHTML = section.contenu
                isInitializedRef.current[`table-content-${section.id}`] = true
              }
            } else if (!isInitializedRef.current[`table-content-${section.id}`]) {
              editor.innerHTML = '<p><br></p>'
              isInitializedRef.current[`table-content-${section.id}`] = true
            }
          }
        }
      })
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [sections])

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sections
          .sort((a, b) => {
            // Les sources doivent toujours être à la fin
            if (a.type === 'sources' && b.type !== 'sources') return 1
            if (a.type !== 'sources' && b.type === 'sources') return -1
            return a.position - b.position
          })
          .map((section) => (
            <div
              key={section.id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Position {section.position}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {section.type === 'section' ? 'Section' : section.type === 'image' ? 'Image' : 'Sources'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveSection(section.id!, 'up')}
                    disabled={section.position === 1 || section.type === 'sources'}
                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title={section.type === 'sources' ? 'Les sources doivent rester à la fin' : 'Déplacer vers le haut'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id!, 'down')}
                    disabled={section.position === sections.length || section.type === 'sources'}
                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title={section.type === 'sources' ? 'Les sources doivent rester à la fin' : 'Déplacer vers le bas'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(section.id!)}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {section.type === 'section' ? (
                <div className="space-y-4">
                  {/* Titre de la section */}
                  <input
                    type="text"
                    placeholder="Titre de la section"
                    value={section.titre || ''}
                    onChange={(e) =>
                      updateSection(section.id!, { titre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                  />

                  {/* Liste des blocs */}
                  <div className="space-y-3">
                    {(section.blocs || []).map((block, blockIndex) => (
                      <div key={block.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {block.type === 'sous-titre' ? 'Sous-titre' : block.type === 'texte' ? 'Texte' : 'Tableau'}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveBlock(section.id!, block.id, 'up')}
                              disabled={blockIndex === 0}
                              className="px-1 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                              title="Déplacer vers le haut"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(section.id!, block.id, 'down')}
                              disabled={blockIndex === (section.blocs || []).length - 1}
                              className="px-1 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                              title="Déplacer vers le bas"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlock(section.id!, block.id)}
                              className="px-1 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              title="Supprimer"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {block.type === 'sous-titre' ? (
                          <input
                            type="text"
                            placeholder="Sous-titre"
                            value={block.texte || ''}
                            onChange={(e) => updateBlock(section.id!, block.id, { texte: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-medium"
                          />
                        ) : block.type === 'texte' ? (
                          <div key={`text-block-${block.id}`}>
                            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'bold')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                                title="Gras"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'italic')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
                                title="Italique"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'underline')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
                                title="Souligné"
                              >
                                U
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log('🔗 Bouton lien cliqué pour bloc:', block.id)
                                  handleLinkClick(`block-${block.id}`)
                                }}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
                                title="Ajouter un lien"
                                style={{ minWidth: '32px', minHeight: '32px', display: 'flex' }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </button>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <input
                                type="color"
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement
                                  executeCommand(`block-${block.id}`, 'foreColor', target.value)
                                }}
                                className="w-8 h-7 border border-gray-300 rounded cursor-pointer"
                                title="Couleur"
                              />
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <select
                                onMouseDown={(e) => {
                                  const editor = editorRefs.current[`block-${block.id}`]
                                  if (editor) editor.focus()
                                }}
                                onChange={(e) => {
                                  const editor = editorRefs.current[`block-${block.id}`]
                                  if (!editor) return
                                  editor.focus()
                                  const size = e.target.value
                                  if (size === 'default') {
                                    executeCommand(`block-${block.id}`, 'removeFormat')
                                  } else {
                                    const success = document.execCommand('fontSize', false, size)
                                    if (!success) {
                                      const selection = window.getSelection()
                                      if (selection && selection.rangeCount > 0) {
                                        const range = selection.getRangeAt(0)
                                        const span = document.createElement('span')
                                        span.style.fontSize = `${Number(size) * 0.5}em`
                                        try {
                                          range.surroundContents(span)
                                        } catch (e) {
                                          document.execCommand('insertHTML', false, `<span style="font-size: ${Number(size) * 0.5}em">${range.toString()}</span>`)
                                        }
                                      }
                                    }
                                    setTimeout(() => {
                                      const html = editor.innerHTML
                                      updateBlock(section.id!, block.id, { contenu: html })
                                      refreshBlockFontSize(`block-${block.id}`)
                                    }, 0)
                                  }
                                  setCurrentFontSize(size)
                                }}
                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                                value={currentFontSize}
                              >
                                <option value="default">Taille</option>
                                <option value="1">Très petit</option>
                                <option value="2">Petit</option>
                                <option value="3">Normal</option>
                                <option value="4">Moyen</option>
                                <option value="5">Grand</option>
                                <option value="6">Très grand</option>
                                <option value="7">Énorme</option>
                              </select>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              {/* Options de mise en page */}
                              <div className="flex items-center gap-1 border border-gray-300 rounded bg-white px-1">
                                <select
                                  value={block.style?.type || 'none'}
                                  onChange={(e) => {
                                    const styleType = e.target.value as TextBlockStyle['type']
                                    if (styleType === 'none') {
                                      updateBlock(section.id!, block.id, { style: undefined })
                                    } else {
                                      updateBlock(section.id!, block.id, { 
                                        style: { 
                                          type: styleType, 
                                          color: block.style?.color || 'purple',
                                          emoji: block.style?.emoji || ''
                                        } 
                                      })
                                    }
                                  }}
                                  className="px-2 py-1 text-xs bg-white border-0 rounded"
                                  title="Style de mise en page"
                                >
                                  <option value="none">Style normal</option>
                                  <option value="border-left">Barre latérale</option>
                                  <option value="box">Boîte colorée</option>
                                  <option value="gradient-box">Boîte dégradé</option>
                                  <option value="info-box">Boîte info</option>
                                </select>
                              </div>
                              {/* Sélecteur d'emojis - toujours visible */}
                              <div className="relative">
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    const emoji = e.target.value
                                    if (emoji) {
                                      // Insérer l'emoji dans le contenu éditable
                                      const editor = editorRefs.current[`block-${block.id}`]
                                      if (editor) {
                                        editor.focus()
                                        // Attendre un peu pour que le focus soit bien établi
                                        setTimeout(() => {
                                          // Insérer l'emoji à la position du curseur
                                          const selection = window.getSelection()
                                          if (selection && selection.rangeCount > 0) {
                                            const range = selection.getRangeAt(0)
                                            range.deleteContents()
                                            const textNode = document.createTextNode(emoji + ' ')
                                            range.insertNode(textNode)
                                            // Positionner le curseur après l'emoji
                                            range.setStartAfter(textNode)
                                            range.collapse(true)
                                            selection.removeAllRanges()
                                            selection.addRange(range)
                                          } else {
                                            // Si pas de sélection, insérer à la fin du contenu
                                            const range = document.createRange()
                                            range.selectNodeContents(editor)
                                            range.collapse(false)
                                            const textNode = document.createTextNode(emoji + ' ')
                                            range.insertNode(textNode)
                                            range.setStartAfter(textNode)
                                            range.collapse(true)
                                            selection?.removeAllRanges()
                                            selection?.addRange(range)
                                          }
                                          // Mettre à jour le contenu
                                          const html = editor.innerHTML
                                          updateBlock(section.id!, block.id, { contenu: html })
                                        }, 10)
                                      }
                                    }
                                    // Réinitialiser le select
                                    e.target.value = ''
                                  }}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                                  title="Insérer un emoji dans le texte"
                                >
                                  <option value="">Emoji</option>
                                  <option value="💡">💡 Ampoule (Conseil)</option>
                                  <option value="✅">✅ Cocher (Validé)</option>
                                  <option value="⚠️">⚠️ Avertissement</option>
                                  <option value="📄">📄 Document</option>
                                  <option value="📋">📋 Presse-papiers</option>
                                  <option value="🔍">🔍 Loupe (Recherche)</option>
                                  <option value="📊">📊 Graphique</option>
                                  <option value="🎯">🎯 Cible (Objectif)</option>
                                  <option value="⚡">⚡ Éclair (Important)</option>
                                  <option value="🔐">🔐 Cadenas (Sécurité)</option>
                                  <option value="📝">📝 Note</option>
                                  <option value="💼">💼 Porte-documents</option>
                                  <option value="🌐">🌐 Globe (Web)</option>
                                  <option value="🔒">🔒 Verrouillé</option>
                                  <option value="🔓">🔓 Déverrouillé</option>
                                  <option value="📌">📌 Épingle</option>
                                  <option value="📍">📍 Marqueur</option>
                                  <option value="💬">💬 Bulle de discussion</option>
                                  <option value="📢">📢 Haut-parleur</option>
                                  <option value="🛡️">🛡️ Bouclier (Protection)</option>
                                  <option value="⚖️">⚖️ Balance (Justice)</option>
                                  <option value="📚">📚 Livres</option>
                                  <option value="🔑">🔑 Clé</option>
                                  <option value="🎓">🎓 Mortier (Éducation)</option>
                                  <option value="💻">💻 Ordinateur</option>
                                  <option value="📱">📱 Téléphone</option>
                                  <option value="🔔">🔔 Cloche (Notification)</option>
                                  <option value="⭐">⭐ Étoile</option>
                                  <option value="🔥">🔥 Feu (Urgent)</option>
                                  <option value="💎">💎 Diamant (Premium)</option>
                                  <option value="🚀">🚀 Fusée (Innovation)</option>
                                  <option value="🎨">🎨 Palette (Créativité)</option>
                                  <option value="⚙️">⚙️ Engrenage (Paramètres)</option>
                                  <option value="🔧">🔧 Clé (Outils)</option>
                                  <option value="📈">📈 Graphique croissant</option>
                                  <option value="📉">📉 Graphique décroissant</option>
                                  <option value="🎁">🎁 Cadeau</option>
                                  <option value="🏆">🏆 Trophée</option>
                                  <option value="🎪">🎪 Chapiteau</option>
                                  <option value="🌍">🌍 Terre</option>
                                  <option value="🌎">🌎 Amériques</option>
                                  <option value="🌏">🌏 Asie-Pacifique</option>
                                </select>
                              </div>
                              {block.style && block.style.type !== 'none' && (
                                <select
                                  value={block.style.color || 'purple'}
                                  onChange={(e) => {
                                    updateBlock(section.id!, block.id, { 
                                      style: { 
                                        ...block.style!, 
                                        color: e.target.value as TextBlockStyle['color']
                                      } 
                                    })
                                  }}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                                  title="Couleur"
                                >
                                  <option value="purple">Violet</option>
                                  <option value="indigo">Indigo</option>
                                  <option value="blue">Bleu</option>
                                  <option value="teal">Sarcelle</option>
                                  <option value="yellow">Jaune</option>
                                  <option value="green">Vert</option>
                                  <option value="red">Rouge</option>
                                  <option value="orange">Orange</option>
                                </select>
                              )}
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'insertUnorderedList')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                title="Liste à puces"
                              >
                                •
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'insertOrderedList')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                title="Liste numérotée"
                              >
                                1.
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'indent')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                title="Indenter"
                              >
                                ⮕
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  executeCommand(`block-${block.id}`, 'outdent')
                                }}
                                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                title="Désindenter"
                              >
                                ⬅
                              </button>
                            </div>
                            {/* Wrapper avec style appliqué */}
                            {(() => {
                              const getStyleClasses = (style?: TextBlockStyle): string => {
                                if (!style || style.type === 'none') {
                                  return ''
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
                                    return `border-l-4 ${colors.border} pl-6 py-2`
                                  case 'box':
                                    return `${colors.bg} border-l-4 ${colors.border} p-6 rounded-r-lg`
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
                                    return `${gradientMap[style.color || 'purple']} rounded-xl p-6 border-2 ${colors.borderLight}`
                                  case 'info-box':
                                    return `${colors.bg} border-l-4 ${colors.border} p-6 rounded-r-lg`
                                  default:
                                    return ''
                                }
                              }
                              
                              const wrapperClasses = getStyleClasses(block.style)
                              
                              return (
                                <div className={wrapperClasses || undefined}>
                                  <div
                                    ref={(el) => {
                                      if (el) {
                                        const editorId = `block-${block.id}`
                                        editorRefs.current[editorId] = el
                                        // Charger le contenu seulement lors de l'initialisation, pas pendant la saisie
                                        if (!isInitializedRef.current[editorId]) {
                                          setTimeout(() => {
                                            // Vérifier qu'on n'est pas en train de mettre à jour
                                            if (el && !isUpdatingRef.current[editorId]) {
                                              const currentContent = el.innerHTML.trim()
                                              // Charger seulement si l'éditeur est vraiment vide
                                              if (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>') {
                                                if (block.contenu && block.contenu.trim() !== '') {
                                                  // NETTOYER LE CONTENU : retirer les balises de section parentes
                                                  let cleanedContent = block.contenu
                                                  
                                                  // Si le contenu contient des balises de section parentes, les retirer
                                                  if (cleanedContent.includes('<section') || cleanedContent.includes('bg-white rounded-2xl')) {
                                                    const tempDiv = document.createElement('div')
                                                    tempDiv.innerHTML = cleanedContent
                                                    
                                                    const section = tempDiv.querySelector('section') || tempDiv.querySelector('div.bg-white')
                                                    
                                                    if (section) {
                                                      const firstChild = section.firstElementChild
                                                      
                                                      if (firstChild) {
                                                        if (firstChild.tagName === 'P') {
                                                          let cleaned = ''
                                                          let currentElement: Element | null = firstChild
                                                          
                                                          while (currentElement && currentElement.parentElement === section) {
                                                            if (currentElement.tagName === 'P' || 
                                                                (currentElement.tagName === 'DIV' && 
                                                                 !currentElement.classList.contains('space-y-6') &&
                                                                 !currentElement.classList.contains('bg-white'))) {
                                                              cleaned += currentElement.outerHTML
                                                            }
                                                            currentElement = currentElement.nextElementSibling
                                                          }
                                                          
                                                          cleanedContent = cleaned || firstChild.outerHTML
                                                        } else if (firstChild.tagName === 'DIV' && firstChild.classList.contains('space-y-6')) {
                                                          cleanedContent = firstChild.innerHTML
                                                        } else {
                                                          cleanedContent = section.innerHTML
                                                        }
                                                      } else {
                                                        cleanedContent = section.textContent || cleanedContent
                                                      }
                                                    }
                                                  }
                                                  
                                                  el.innerHTML = cleanedContent
                                                  // S'assurer que les liens sont visibles
                                                  const links = el.querySelectorAll('a')
                                                  links.forEach(link => {
                                                    if (!link.style.color) {
                                                      link.style.color = '#2563eb'
                                                      link.style.textDecoration = 'underline'
                                                    }
                                                  })
                                                } else {
                                                  el.innerHTML = '<p><br></p>'
                                                }
                                              }
                                              isInitializedRef.current[editorId] = true
                                            }
                                          }, 10)
                                        }
                                      }
                                    }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={(e) => {
                                      if (!isUpdatingRef.current[`block-${block.id}`]) {
                                        isUpdatingRef.current[`block-${block.id}`] = true
                                        const editor = editorRefs.current[`block-${block.id}`]
                                        if (editor) {
                                          // S'assurer que les liens sont visibles
                                          const links = editor.querySelectorAll('a')
                                          links.forEach(link => {
                                            if (!link.style.color) {
                                              link.style.color = '#2563eb'
                                              link.style.textDecoration = 'underline'
                                            }
                                          })
                                          const html = editor.innerHTML
                                          updateBlock(section.id!, block.id, { contenu: html })
                                        }
                                        // Réinitialiser le flag après un court délai
                                        setTimeout(() => {
                                          isUpdatingRef.current[`block-${block.id}`] = false
                                        }, 0)
                                      }
                                    }}
                                    onKeyUp={() => {
                                      refreshBlockFontSize(`block-${block.id}`)
                                    }}
                                    onMouseUp={() => {
                                      refreshBlockFontSize(`block-${block.id}`)
                                    }}
                                    onBlur={() => {
                                      if (!isUpdatingRef.current[`block-${block.id}`]) {
                                        const editor = editorRefs.current[`block-${block.id}`]
                                        if (editor) {
                                          const html = editor.innerHTML
                                          updateBlock(section.id!, block.id, { contenu: html })
                                        }
                                      }
                                    }}
                                    className={`min-h-[150px] ${wrapperClasses ? 'px-0 py-0' : 'px-3 py-2'} text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${wrapperClasses ? '' : 'rounded-b-lg'}`}
                                    style={{
                                      wordBreak: 'break-word',
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: '1.6',
                                      caretColor: 'currentColor',
                                    }}
                                    onFocus={(e) => {
                                      // S'assurer que les liens sont visibles
                                      const links = e.currentTarget.querySelectorAll('a')
                                      links.forEach(link => {
                                        if (!link.style.color) {
                                          link.style.color = '#2563eb'
                                          link.style.textDecoration = 'underline'
                                        }
                                      })
                                    }}
                                  />
                                </div>
                              )
                            })()}
                          </div>
                        ) : block.type === 'tableau' ? (
                          <div>
                            {block.table_data && (
                              <TableEditor
                                tableData={block.table_data}
                                onChange={(newData) => updateBlock(section.id!, block.id, { table_data: newData })}
                              />
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {/* Boutons pour ajouter des blocs */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => addBlockToSection(section.id!, 'sous-titre')}
                        className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        + Sous-titre
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlockToSection(section.id!, 'texte')}
                        className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        + Texte
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlockToSection(section.id!, 'tableau')}
                        className="px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        + Tableau
                      </button>
                    </div>
                  </div>
                </div>
              ) : section.type === 'image' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, section.id!)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {section.image_url && (
                      <div className="mt-2">
                        <img
                          src={section.image_url}
                          alt={section.alt || 'Preview'}
                          className="max-w-xs h-auto rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Texte alternatif de l'image"
                    value={section.alt || ''}
                    onChange={(e) =>
                      updateSection(section.id!, { alt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ) : section.type === 'sources' ? (
                <div className="space-y-4">
                  {/* Titre de la section sources */}
                  <input
                    type="text"
                    placeholder="Titre des sources (ex: SOURCES ET RÉFÉRENCES)"
                    value={section.titre || ''}
                    onChange={(e) =>
                      updateSection(section.id!, { titre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                  />
                  {/* Éditeur de sources */}
                  <SourcesEditor
                    sources={section.sources || []}
                    onChange={(sources) =>
                      updateSection(section.id!, { sources })
                    }
                  />
                </div>
              ) : null}
            </div>
          ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune section ajoutée. Cliquez sur "Ajouter une section" ou "Ajouter une image" pour commencer.
        </div>
      )}

      <div className="flex gap-2 mt-6 flex-wrap">
        <button
          type="button"
          onClick={addSection}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Ajouter une section
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ajouter une image
        </button>
        <button
          type="button"
          onClick={addSources}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Ajouter des sources
        </button>
      </div>

      {/* Modal pour ajouter/modifier un lien */}
      {linkModal.visible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" 
          style={{ 
            left: 0, 
            right: 0, 
            top: 0, 
            bottom: 0,
            position: 'fixed'
          }}
          onMouseDown={(e) => {
            // Empêcher le scroll lors du clic sur l'overlay
            if (e.target === e.currentTarget) {
              e.preventDefault()
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {linkModal.existingLink ? 'Modifier le lien' : 'Ajouter un lien'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkModal.url}
                  onChange={(e) => setLinkModal({ ...linkModal, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://exemple.com"
                  autoFocus
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkModal.openInNewTab}
                    onChange={(e) => setLinkModal({ ...linkModal, openInNewTab: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Ouvrir dans un nouvel onglet</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                {linkModal.existingLink && (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Supprimer le lien
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLinkModal({ visible: false, editorId: null, url: '', openInNewTab: true, existingLink: null, savedRange: null })}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {linkModal.existingLink ? 'Modifier' : 'Appliquer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
