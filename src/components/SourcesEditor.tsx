import React from 'react'

interface Source {
  nom: string
  lien: string
}

interface SourcesEditorProps {
  sources: Source[]
  onChange: (sources: Source[]) => void
}

export const SourcesEditor: React.FC<SourcesEditorProps> = ({ sources, onChange }) => {
  // S'assurer que sources est toujours un tableau
  const safeSources = sources || []

  const addSource = () => {
    onChange([...safeSources, { nom: '', lien: '' }])
  }

  const updateSource = (index: number, field: 'nom' | 'lien', value: string) => {
    const newSources = [...safeSources]
    newSources[index] = { ...newSources[index], [field]: value }
    onChange(newSources)
  }

  const removeSource = (index: number) => {
    onChange(safeSources.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end mb-2">
        <button
          type="button"
          onClick={addSource}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          + Ajouter une source
        </button>
      </div>

      {safeSources.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Aucune source ajoutée. Cliquez sur "Ajouter une source" pour commencer.</p>
      ) : (
        <div className="space-y-3">
          {safeSources.map((source, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-white border border-gray-300 rounded-lg">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Nom de la source"
                  value={source.nom}
                  onChange={(e) => updateSource(index, 'nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="url"
                  placeholder="https://exemple.com"
                  value={source.lien}
                  onChange={(e) => updateSource(index, 'lien', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSource(index)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-1"
                title="Supprimer cette source"
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
