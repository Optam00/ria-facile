import React, { useRef, useState, useEffect } from 'react'

export interface CellSpan {
  rowspan?: number
  colspan?: number
  isMerged?: boolean // Indique si cette cellule est fusionnée (cachée)
  mergedFrom?: { row: number; col: number } // D'où vient la fusion
}

export interface CellAlignment {
  horizontal?: 'left' | 'center' | 'right' | 'justify'
  vertical?: 'top' | 'middle' | 'bottom'
}

export interface TableData {
  headers: string[]
  rows: string[][]
  cellSpans?: { [key: string]: CellSpan } // Clé: "row-col"
  cellAlignments?: { [key: string]: CellAlignment } // Clé: "row-col"
}

interface TableEditorProps {
  tableData: TableData
  onChange: (data: TableData) => void
}

export const TableEditor: React.FC<TableEditorProps> = ({ tableData, onChange }) => {
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; col: number }>>([])
  const isUpdatingRef = useRef<{ [key: string]: boolean }>({})
  const [currentFontSize, setCurrentFontSize] = useState<string>('default')
  const [linkModal, setLinkModal] = useState<{
    visible: boolean
    cellId: string | null
    url: string
    openInNewTab: boolean
    existingLink: HTMLAnchorElement | null
    savedRange: Range | null
  }>({
    visible: false,
    cellId: null,
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

  const getCellId = (rowIndex: number, colIndex: number) => `cell-${rowIndex}-${colIndex}`
  const getCellKey = (rowIndex: number, colIndex: number) => `${rowIndex}-${colIndex}`
  
  const getCellSpan = (rowIndex: number, colIndex: number): CellSpan => {
    const key = getCellKey(rowIndex, colIndex)
    return tableData.cellSpans?.[key] || {}
  }

  const getCellAlignment = (rowIndex: number, colIndex: number): CellAlignment => {
    const key = getCellKey(rowIndex, colIndex)
    return tableData.cellAlignments?.[key] || { horizontal: 'left', vertical: 'middle' }
  }

  const setCellAlignment = (rowIndex: number, colIndex: number, alignment: CellAlignment) => {
    const key = getCellKey(rowIndex, colIndex)
    const newAlignments = { ...(tableData.cellAlignments || {}) }
    newAlignments[key] = alignment
    onChange({
      ...tableData,
      cellAlignments: newAlignments
    })
  }

  const isCellMerged = (rowIndex: number, colIndex: number): boolean => {
    const span = getCellSpan(rowIndex, colIndex)
    return span.isMerged === true
  }

  const getMergedFrom = (rowIndex: number, colIndex: number): { row: number; col: number } | null => {
    const span = getCellSpan(rowIndex, colIndex)
    return span.mergedFrom || null
  }

  const applyLink = () => {
    if (!linkModal.cellId) return

    const editor = editorRefs.current[linkModal.cellId]
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

    // Mettre à jour le contenu de la cellule après un court délai
    setTimeout(() => {
      updateCellContent(linkModal.cellId!)
    }, 150)

    setLinkModal({ visible: false, cellId: null, url: '', openInNewTab: true, existingLink: null, savedRange: null })
  }

  const removeLink = () => {
    if (!linkModal.cellId || !linkModal.existingLink) return

    const editor = editorRefs.current[linkModal.cellId]
    if (!editor) return

    // Remplacer le lien par son contenu textuel
    const text = linkModal.existingLink.textContent || ''
    const textNode = document.createTextNode(text)
    linkModal.existingLink.parentNode?.replaceChild(textNode, linkModal.existingLink)

    // Mettre à jour le contenu de la cellule
    setTimeout(() => {
      updateCellContent(linkModal.cellId!)
    }, 0)

    setLinkModal({ visible: false, cellId: null, url: '', openInNewTab: true, existingLink: null, savedRange: null })
  }

  const handleLinkClick = (cellId: string) => {
    const editor = editorRefs.current[cellId]
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
        cellId,
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

  const executeCommand = (cellId: string, command: string, value?: string) => {
    const editor = editorRefs.current[cellId]
    if (!editor) return

    editor.focus()
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        const rangeEnd = document.createRange()
        rangeEnd.selectNodeContents(editor)
        rangeEnd.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(rangeEnd)
      }
      document.execCommand(command, false, value || undefined)
      updateCellContent(cellId)
    }, 10)
  }

  const refreshCurrentFontSize = () => {
    if (!activeCell) {
      setCurrentFontSize('default')
      return
    }
    const editor = editorRefs.current[activeCell]
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

  const updateCellContent = (cellId: string) => {
    if (isUpdatingRef.current[cellId]) return
    
    const editor = editorRefs.current[cellId]
    if (!editor) return

    // S'assurer que les liens sont visibles
    const links = editor.querySelectorAll('a')
    links.forEach(link => {
      if (!link.style.color) {
        link.style.color = '#2563eb'
        link.style.textDecoration = 'underline'
      }
    })

    // Sauvegarder la position du curseur avant la mise à jour
    const selection = window.getSelection()
    let savedRange: Range | null = null
    if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0)
      if (editor.contains(currentRange.startContainer)) {
        savedRange = currentRange.cloneRange()
      }
    }

    const [rowIndex, colIndex] = cellId.replace('cell-', '').split('-').map(Number)
    // Récupérer le contenu textuel réel, même s'il est vide
    const html = editor.innerHTML.trim()
    // Si le contenu est vide ou ne contient que des balises vides, sauvegarder une chaîne vide
    const cleanHtml = (html === '' || html === '<br>' || html === '<p><br></p>' || html === '<p></p>') ? '' : html
    
    // Vérifier si le contenu a vraiment changé
    const currentContent = (tableData.rows[rowIndex]?.[colIndex] || '').trim()
    if (currentContent === cleanHtml) {
      // Le contenu n'a pas changé, ne pas déclencher de mise à jour
      return
    }
    
    isUpdatingRef.current[cellId] = true
    setTimeout(() => {
      const newRows = [...tableData.rows]
      if (!newRows[rowIndex]) {
        newRows[rowIndex] = new Array(tableData.headers.length).fill('')
      }
      newRows[rowIndex] = [...newRows[rowIndex]]
      newRows[rowIndex][colIndex] = cleanHtml
      onChange({ ...tableData, rows: newRows })

      // Restaurer la position du curseur au plus près de là où l'utilisateur tapait
      if (editor === document.activeElement) {
        setTimeout(() => {
          try {
            const sel = window.getSelection()
            if (!sel) return
            sel.removeAllRanges()

            if (savedRange && editor.contains(savedRange.startContainer)) {
              // Revenir exactement là où l'utilisateur tapait
              sel.addRange(savedRange)
            } else {
              // Fallback : placer le curseur à la fin du contenu
              const rangeEnd = document.createRange()
              rangeEnd.selectNodeContents(editor)
              rangeEnd.collapse(false)
              sel.addRange(rangeEnd)
            }
          } catch (e) {
            // Ignorer les erreurs de restauration du curseur
          }
        }, 0)
      }
      
      isUpdatingRef.current[cellId] = false
    }, 0)
  }

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...tableData.headers]
    newHeaders[index] = value
    onChange({ ...tableData, headers: newHeaders })
  }

  const addRow = () => {
    onChange({
      ...tableData,
      rows: [...tableData.rows, new Array(tableData.headers.length).fill('')],
    })
  }

  const removeRow = (index: number) => {
    const newRows = tableData.rows.filter((_, i) => i !== index)
    onChange({ ...tableData, rows: newRows })
  }

  const addColumn = () => {
    const newHeaders = [...tableData.headers, 'Nouvelle colonne']
    const newRows = tableData.rows.map((row) => [...row, ''])
    onChange({ headers: newHeaders, rows: newRows })
  }

  const removeColumn = (index: number) => {
    if (tableData.headers.length <= 1) return
    const newHeaders = tableData.headers.filter((_, i) => i !== index)
    const newRows = tableData.rows.map((row) => row.filter((_, i) => i !== index))
    // Nettoyer les cellSpans pour la colonne supprimée
    const newCellSpans: { [key: string]: CellSpan } = {}
    if (tableData.cellSpans) {
      Object.keys(tableData.cellSpans).forEach(key => {
        const [row, col] = key.split('-').map(Number)
        if (col < index) {
          newCellSpans[key] = tableData.cellSpans![key]
        } else if (col > index) {
          newCellSpans[`${row}-${col - 1}`] = tableData.cellSpans![key]
        }
      })
    }
    onChange({ headers: newHeaders, rows: newRows, cellSpans: newCellSpans })
  }

  const handleCheckboxClick = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (isCellMerged(rowIndex, colIndex)) {
      const mergedFrom = getMergedFrom(rowIndex, colIndex)
      if (mergedFrom) {
        setActiveCell(getCellId(mergedFrom.row, mergedFrom.col))
        setSelectedCells([mergedFrom])
      }
      return
    }

    const isAlreadySelected = selectedCells.some(c => c.row === rowIndex && c.col === colIndex)
    
    if (e.shiftKey && selectedCells.length > 0) {
      // Sélection multiple avec Shift (sélection rectangulaire)
      const lastSelected = selectedCells[selectedCells.length - 1]
      const newSelection: Array<{ row: number; col: number }> = []
      const minRow = Math.min(lastSelected.row, rowIndex)
      const maxRow = Math.max(lastSelected.row, rowIndex)
      const minCol = Math.min(lastSelected.col, colIndex)
      const maxCol = Math.max(lastSelected.col, colIndex)
      
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (!isCellMerged(r, c)) {
            newSelection.push({ row: r, col: c })
          }
        }
      }
      setSelectedCells(newSelection)
    } else {
      // Sélection multiple simple (ajouter/retirer de la sélection)
      if (isAlreadySelected) {
        // Désélectionner si déjà sélectionnée
        const newSelection = selectedCells.filter(c => !(c.row === rowIndex && c.col === colIndex))
        setSelectedCells(newSelection)
        if (newSelection.length > 0) {
          const last = newSelection[newSelection.length - 1]
          setActiveCell(getCellId(last.row, last.col))
        } else {
          setActiveCell(null)
        }
      } else {
        // Ajouter à la sélection existante
        setActiveCell(getCellId(rowIndex, colIndex))
        setSelectedCells([...selectedCells, { row: rowIndex, col: colIndex }])
      }
    }
  }

  const mergeCells = () => {
    if (selectedCells.length < 2) return

    // Trier les cellules sélectionnées
    const sorted = [...selectedCells].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.col - b.col
    })

    const topLeft = sorted[0]
    const rowspan = sorted[sorted.length - 1].row - topLeft.row + 1
    const colspan = Math.max(...sorted.map(c => c.col)) - topLeft.col + 1

    const newCellSpans: { [key: string]: CellSpan } = { ...(tableData.cellSpans || {}) }
    
    // Marquer la cellule principale
    newCellSpans[getCellKey(topLeft.row, topLeft.col)] = {
      rowspan,
      colspan,
      isMerged: false,
    }

    // Marquer les autres cellules comme fusionnées
    sorted.slice(1).forEach(cell => {
      newCellSpans[getCellKey(cell.row, cell.col)] = {
        isMerged: true,
        mergedFrom: topLeft,
      }
    })

    onChange({ ...tableData, cellSpans: newCellSpans })
    setSelectedCells([])
    setActiveCell(getCellId(topLeft.row, topLeft.col))
  }

  const unmergeCells = () => {
    if (selectedCells.length === 0) return

    const cell = selectedCells[0]
    const key = getCellKey(cell.row, cell.col)
    const span = getCellSpan(cell.row, cell.col)

    if (!span.rowspan && !span.colspan) return

    const newCellSpans: { [key: string]: CellSpan } = { ...(tableData.cellSpans || {}) }
    
    // Supprimer le rowspan/colspan de la cellule principale
    delete newCellSpans[key]

    // Supprimer les marqueurs de fusion des cellules fusionnées
    Object.keys(newCellSpans).forEach(k => {
      const mergedFrom = newCellSpans[k].mergedFrom
      if (mergedFrom && mergedFrom.row === cell.row && mergedFrom.col === cell.col) {
        delete newCellSpans[k]
      }
    })

    onChange({ ...tableData, cellSpans: newCellSpans })
    setSelectedCells([])
  }

  // Initialiser le contenu des cellules
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      tableData.rows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellId = getCellId(rowIndex, colIndex)
          const editor = editorRefs.current[cellId]
          if (editor) {
            const currentContent = editor.innerHTML.trim()
            const cellContent = cell || ''
            // Charger le contenu si l'éditeur est vide ou si le contenu est différent
            if (cellContent && (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>' || currentContent !== cellContent)) {
              if (!isUpdatingRef.current[cellId]) {
                editor.innerHTML = cellContent
              }
            } else if (!cellContent && (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>')) {
              if (!isUpdatingRef.current[cellId]) {
                editor.innerHTML = '<p><br></p>'
              }
            }
          }
        })
      })
    }, 150)
    return () => clearTimeout(timeoutId)
  }, [tableData.rows, tableData.headers.length])

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={addColumn}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Colonne
        </button>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Ligne
        </button>
      </div>

      {/* Barre d'outils de fusion - Toujours visible */}
      <div className="flex gap-2 mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg items-center">
        <button
          type="button"
          onClick={mergeCells}
          disabled={selectedCells.length < 2}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          title="Fusionner les cellules sélectionnées (sélectionnez au moins 2 cellules)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
          </svg>
          Fusionner
        </button>
        <button
          type="button"
          onClick={unmergeCells}
          disabled={selectedCells.length !== 1 || (!getCellSpan(selectedCells[0]?.row || 0, selectedCells[0]?.col || 0).rowspan && !getCellSpan(selectedCells[0]?.row || 0, selectedCells[0]?.col || 0).colspan)}
          className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          title="Séparer les cellules fusionnées (sélectionnez une cellule fusionnée)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Séparer
        </button>
        <span className="text-sm text-gray-600 ml-2">
          {selectedCells.length === 0 
            ? 'Cliquez sur une cellule pour la sélectionner, puis Shift+clic pour sélectionner plusieurs cellules'
            : `${selectedCells.length} cellule${selectedCells.length > 1 ? 's' : ''} sélectionnée${selectedCells.length > 1 ? 's' : ''}`
          }
        </span>
      </div>

      {/* Barre d'outils de formatage - Toujours visible */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 border border-gray-300 rounded-lg">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (activeCell) {
              executeCommand(activeCell, 'bold')
            }
          }}
          disabled={!activeCell}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          title="Gras"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (activeCell) {
              executeCommand(activeCell, 'italic')
            }
          }}
          disabled={!activeCell}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 italic disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          title="Italique"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (activeCell) {
              executeCommand(activeCell, 'underline')
            }
          }}
          disabled={!activeCell}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 underline disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          title="Souligné"
        >
          U
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (activeCell) {
              handleLinkClick(activeCell)
            }
          }}
          disabled={!activeCell}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          title="Ajouter un lien"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <input
          type="color"
          onInput={(e) => {
            if (activeCell) {
              const target = e.target as HTMLInputElement
              executeCommand(activeCell, 'foreColor', target.value)
            }
          }}
          disabled={!activeCell}
          className="w-8 h-7 border border-gray-300 rounded cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          title="Couleur"
        />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <select
          onMouseDown={(e) => {
            if (activeCell) {
              const editor = editorRefs.current[activeCell]
              if (editor) editor.focus()
            }
          }}
          onChange={(e) => {
            if (!activeCell) return
            const editor = editorRefs.current[activeCell]
            if (!editor) return
            editor.focus()
            const size = e.target.value
            if (size === 'default') {
              executeCommand(activeCell, 'removeFormat')
            } else {
              document.execCommand('fontSize', false, size)
              setTimeout(() => {
                updateCellContent(activeCell)
                refreshCurrentFontSize()
              }, 0)
            }
            setCurrentFontSize(size)
          }}
          disabled={!activeCell}
          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
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
        {/* Alignement horizontal */}
        <div className="flex items-center gap-1 border border-gray-300 rounded bg-white">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              if (activeCell) {
                const [_, rowIndex, colIndex] = activeCell.split('-').map(Number)
                const currentAlign = getCellAlignment(rowIndex, colIndex)
                setCellAlignment(rowIndex, colIndex, { ...currentAlign, horizontal: 'left' })
              }
            }}
            disabled={!activeCell}
            className="px-3 py-1 text-xs hover:bg-gray-100 flex items-center gap-1 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Aligner à gauche"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3V6zm0 4h12v2H3v-2zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/>
            </svg>
            <span>Gauche</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              if (activeCell) {
                const [_, rowIndex, colIndex] = activeCell.split('-').map(Number)
                const currentAlign = getCellAlignment(rowIndex, colIndex)
                setCellAlignment(rowIndex, colIndex, { ...currentAlign, horizontal: 'center' })
              }
            }}
            disabled={!activeCell}
            className="px-3 py-1 text-xs hover:bg-gray-100 flex items-center gap-1 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Centrer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3V6zm3 4h12v2H6v-2zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z"/>
            </svg>
            <span>Centre</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              if (activeCell) {
                const [_, rowIndex, colIndex] = activeCell.split('-').map(Number)
                const currentAlign = getCellAlignment(rowIndex, colIndex)
                setCellAlignment(rowIndex, colIndex, { ...currentAlign, horizontal: 'right' })
              }
            }}
            disabled={!activeCell}
            className="px-3 py-1 text-xs hover:bg-gray-100 flex items-center gap-1 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Aligner à droite"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3V6zm6 4h12v2H9v-2zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z"/>
            </svg>
            <span>Droite</span>
          </button>
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        {/* Alignement vertical */}
        <div className="flex items-center gap-1 border border-gray-300 rounded bg-white">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              if (activeCell) {
                const [_, rowIndex, colIndex] = activeCell.split('-').map(Number)
                const currentAlign = getCellAlignment(rowIndex, colIndex)
                setCellAlignment(rowIndex, colIndex, { ...currentAlign, vertical: 'top' })
              }
            }}
            disabled={!activeCell}
            className="px-3 py-1 text-xs hover:bg-gray-100 flex items-center gap-1 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Aligner en haut"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="2" rx="1"/>
              <rect x="3" y="7" width="12" height="2" rx="1"/>
              <rect x="3" y="11" width="12" height="2" rx="1"/>
              <rect x="3" y="15" width="12" height="2" rx="1"/>
              <rect x="3" y="19" width="12" height="2" rx="1"/>
            </svg>
            <span>Haut</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              if (activeCell) {
                const [_, rowIndex, colIndex] = activeCell.split('-').map(Number)
                const currentAlign = getCellAlignment(rowIndex, colIndex)
                setCellAlignment(rowIndex, colIndex, { ...currentAlign, vertical: 'middle' })
              }
            }}
            disabled={!activeCell}
            className="px-3 py-1 text-xs hover:bg-gray-100 flex items-center gap-1 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Centrer verticalement"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="5" width="12" height="2" rx="1"/>
              <rect x="3" y="9" width="18" height="2" rx="1"/>
              <rect x="3" y="13" width="18" height="2" rx="1"/>
              <rect x="3" y="17" width="12" height="2" rx="1"/>
            </svg>
            <span>Milieu</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              if (activeCell) {
                const [_, rowIndex, colIndex] = activeCell.split('-').map(Number)
                const currentAlign = getCellAlignment(rowIndex, colIndex)
                setCellAlignment(rowIndex, colIndex, { ...currentAlign, vertical: 'bottom' })
              }
            }}
            disabled={!activeCell}
            className="px-3 py-1 text-xs hover:bg-gray-100 flex items-center gap-1 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Aligner en bas"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="12" height="2" rx="1"/>
              <rect x="3" y="7" width="12" height="2" rx="1"/>
              <rect x="3" y="11" width="12" height="2" rx="1"/>
              <rect x="3" y="15" width="12" height="2" rx="1"/>
              <rect x="3" y="19" width="18" height="2" rx="1"/>
            </svg>
            <span>Bas</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {tableData.headers.map((header, index) => (
                <th key={index} className="border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                      placeholder={`Colonne ${index + 1}`}
                    />
                    {tableData.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        title="Supprimer la colonne"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => {
              // Déterminer quelles cellules doivent être rendues
              const cellsToRender: Array<{ colIndex: number; shouldRender: boolean }> = []
              let currentCol = 0
              
              tableData.headers.forEach((_, colIndex) => {
                // Vérifier si cette cellule est fusionnée (cachée)
                if (isCellMerged(rowIndex, colIndex)) {
                  cellsToRender.push({ colIndex, shouldRender: false })
                  return
                }
                
                // Vérifier si cette cellule est couverte par une cellule avec rowspan/colspan d'une ligne précédente
                let isCovered = false
                for (let r = 0; r < rowIndex; r++) {
                  for (let c = 0; c < tableData.headers.length; c++) {
                    const span = getCellSpan(r, c)
                    if (span.rowspan && span.colspan) {
                      const rowEnd = r + (span.rowspan - 1)
                      const colEnd = c + (span.colspan - 1)
                      if (rowIndex <= rowEnd && rowIndex > r && colIndex >= c && colIndex <= colEnd) {
                        isCovered = true
                        break
                      }
                    } else if (span.rowspan) {
                      const rowEnd = r + (span.rowspan - 1)
                      if (rowIndex <= rowEnd && rowIndex > r && colIndex === c) {
                        isCovered = true
                        break
                      }
                    } else if (span.colspan) {
                      const colEnd = c + (span.colspan - 1)
                      if (rowIndex === r && colIndex >= c && colIndex <= colEnd) {
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
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {cellsToRender.map(({ colIndex, shouldRender }) => {
                    if (!shouldRender) return null

                    const cellId = getCellId(rowIndex, colIndex)
                    const span = getCellSpan(rowIndex, colIndex)
                    const alignment = getCellAlignment(rowIndex, colIndex)
                    const isSelected = selectedCells.some(c => c.row === rowIndex && c.col === colIndex)
                    
                    // Styles d'alignement
                    const textAlign = alignment.horizontal || 'left'
                    const verticalAlign = alignment.vertical || 'middle'
                    
                    return (
                      <td
                        key={colIndex}
                        rowSpan={span.rowspan}
                        colSpan={span.colspan}
                        className={`border border-gray-300 p-0 relative ${isSelected ? 'bg-blue-50' : ''}`}
                        style={{
                          verticalAlign: verticalAlign,
                        }}
                      >
                        {/* Case à cocher pour la sélection */}
                        <div
                          className="absolute top-1 left-1 z-10"
                          onClick={(e) => handleCheckboxClick(rowIndex, colIndex, e)}
                        >
                          <div
                            className={`w-4 h-4 border-2 rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-500 border-blue-600'
                                : 'bg-white border-gray-400 hover:border-blue-400'
                            }`}
                            title="Cliquer pour sélectionner (Shift+clic pour sélection rectangulaire)"
                          >
                            {isSelected && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        {/* Zone éditable */}
                        <div
                          ref={(el) => {
                            if (el) {
                              const wasInitialized = editorRefs.current[cellId] !== undefined
                              const isFocused = document.activeElement === el
                              
                              // Sauvegarder la position du curseur si l'élément est focus
                              let savedRange: Range | null = null
                              if (isFocused) {
                                const selection = window.getSelection()
                                if (selection && selection.rangeCount > 0) {
                                  savedRange = selection.getRangeAt(0).cloneRange()
                                }
                              }
                              
                              editorRefs.current[cellId] = el
                              
                              // Initialiser le contenu seulement lors du premier chargement
                              if (!wasInitialized) {
                                setTimeout(() => {
                                  if (el && !isUpdatingRef.current[cellId]) {
                                    const currentContent = el.innerHTML.trim()
                                    const cellContent = row[colIndex] || ''
                                    if (cellContent && (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>' || currentContent === '<p></p>')) {
                                      el.innerHTML = cellContent
                                      // S'assurer que les liens sont visibles
                                      const links = el.querySelectorAll('a')
                                      links.forEach(link => {
                                        if (!link.style.color) {
                                          link.style.color = '#2563eb'
                                          link.style.textDecoration = 'underline'
                                        }
                                      })
                                    } else if (!cellContent && (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>' || currentContent === '<p></p>')) {
                                      el.innerHTML = '<p><br></p>'
                                    }
                                    
                                    // Restaurer le curseur si l'élément était focus
                                    if (isFocused && savedRange && el.contains(savedRange.startContainer)) {
                                      try {
                                        const selection = window.getSelection()
                                        if (selection) {
                                          selection.removeAllRanges()
                                          selection.addRange(savedRange)
                                        }
                                      } catch (e) {
                                        // Ignorer les erreurs
                                      }
                                    }
                                  }
                                }, 50)
                              }
                            }
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={(e) => {
                            setActiveCell(cellId)
                            setTimeout(() => {
                              refreshCurrentFontSize()
                            }, 0)
                            // S'assurer que le curseur est visible
                            setTimeout(() => {
                              const selection = window.getSelection()
                              if (selection && selection.rangeCount === 0) {
                                const range = document.createRange()
                                const editor = e.currentTarget
                                if (editor.childNodes.length > 0) {
                                  range.selectNodeContents(editor)
                                  range.collapse(false)
                                } else {
                                  range.setStart(editor, 0)
                                  range.setEnd(editor, 0)
                                }
                                selection.removeAllRanges()
                                selection.addRange(range)
                              }
                            }, 0)
                          }}
                          onBlur={() => {
                            // Toujours sauvegarder le contenu au blur, même s'il est vide
                            updateCellContent(cellId)
                            // Ne pas réinitialiser immédiatement activeCell pour garder la sélection
                            // et permettre l'utilisation de la barre d'outils juste après un clic.
                          }}
                          onInput={(e) => {
                            // Sauvegarder en temps réel pendant la saisie, mais avec un debounce
                            if (!isUpdatingRef.current[cellId]) {
                              // Utiliser un timeout pour éviter trop de mises à jour
                              const timeoutId = setTimeout(() => {
                                updateCellContent(cellId)
                              }, 100)
                              
                              // Nettoyer le timeout précédent s'il existe
                              const prevTimeout = (e.currentTarget as any).__updateTimeout
                              if (prevTimeout) {
                                clearTimeout(prevTimeout)
                              }
                              (e.currentTarget as any).__updateTimeout = timeoutId
                            }
                          }}
                          onKeyUp={() => {
                            refreshCurrentFontSize()
                          }}
                          onMouseUp={() => {
                            refreshCurrentFontSize()
                          }}
                          onKeyDown={(e) => {
                            // Permettre les retours à la ligne avec Enter
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              // Insérer un <br> à la position du curseur
                              const selection = window.getSelection()
                              if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0)
                                const br = document.createElement('br')
                                range.deleteContents()
                                range.insertNode(br)
                                // Déplacer le curseur après le <br>
                                range.setStartAfter(br)
                                range.collapse(true)
                                selection.removeAllRanges()
                                selection.addRange(range)
                                // Mettre à jour le contenu
                                setTimeout(() => {
                                  updateCellContent(cellId)
                                }, 0)
                              }
                            }
                            // Sauvegarder immédiatement après suppression (Backspace, Delete)
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                              setTimeout(() => {
                                updateCellContent(cellId)
                              }, 0)
                            }
                          }}
                          className={`min-h-[40px] px-2 py-1 pl-6 pr-2 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-text ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            textAlign: textAlign,
                            display: 'flex',
                            alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
                            justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'space-between',
                            minHeight: '40px',
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
                      </td>
                    )
                  })}
                <td className="border border-gray-300 p-2 w-20">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="Supprimer la ligne"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
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
                  onClick={() => setLinkModal({ visible: false, cellId: null, url: '', openInNewTab: true, existingLink: null, savedRange: null })}
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
