import React from 'react'

export interface FicheItem {
  titre: string
  lien: string
}

interface FichesEditorProps {
  fiches: FicheItem[]
  onChange: (fiches: FicheItem[]) => void
}

export const FichesEditor: React.FC<FichesEditorProps> = ({ fiches, onChange }) => {
  const safeFiches = fiches || []

  const addFiche = () => {
    onChange([...safeFiches, { titre: '', lien: '' }])
  }

  const updateFiche = (index: number, field: 'titre' | 'lien', value: string) => {
    const newFiches = [...safeFiches]
    newFiches[index] = { ...newFiches[index], [field]: value }
    onChange(newFiches)
  }

  const removeFiche = (index: number) => {
    onChange(safeFiches.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end mb-2">
        <button
          type="button"
          onClick={addFiche}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          + Ajouter une fiche pratique
        </button>
      </div>

      {safeFiches.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Aucune fiche pratique ajoutée. Cliquez sur &quot;Ajouter une fiche pratique&quot; pour commencer.</p>
      ) : (
        <div className="space-y-3">
          {safeFiches.map((fiche, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-white border border-gray-300 rounded-lg">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Titre de la fiche pratique"
                  value={fiche.titre}
                  onChange={(e) => updateFiche(index, 'titre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="url"
                  placeholder="Lien (ex: /fiches-pratiques/exactitude ou https://…)"
                  value={fiche.lien}
                  onChange={(e) => updateFiche(index, 'lien', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFiche(index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-1"
                title="Supprimer cette fiche"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
