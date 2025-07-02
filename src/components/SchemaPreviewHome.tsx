import React from 'react'
import { Link } from 'react-router-dom'

// Liste des schémas (à synchroniser avec SearchResultsPage)
const SCHEMAS = [
  {
    id: 'calendrier',
    titre: "Calendrier d'entrée en application du règlement IA",
    texte: `La grande majorité des obligations du règlement deviennent applicables, notamment toutes les règles pour les systèmes d'IA classés à haut risque (à l'exception de ceux mentionnés au point suivant). ...`,
    image: '/src/assets/schemas/Dates.png',
    url: '/schemas#date-mise-en-oeuvre',
  },
  {
    id: 'modele-vs-systeme',
    titre: "La distinction entre modèle d'IA et système d'IA",
    texte: `Le Modèle d'IA (Le Moteur)... Le Système d'IA (Le Véhicule)...`,
    image: '/src/assets/schemas/modele%20vs%20systeme.png',
    url: '/schemas#modele-vs-systeme',
  },
  {
    id: 'gpai',
    titre: "Les différents modèles d'IA à usage général",
    texte: `La réglementation cible spécifiquement les Modèles d'IA à Usage Général (GPAI)...`,
    image: '/src/assets/schemas/GPAI.png',
    url: '/schemas#gpai',
  },
]

function getExcerpt(text: string, length = 180) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '…' : text
}

export const SchemaPreviewHome: React.FC = () => {
  // Sélection aléatoire d'un schéma à chaque chargement
  const [randomIndex] = React.useState(() => Math.floor(Math.random() * SCHEMAS.length))
  const schema = SCHEMAS[randomIndex]

  return (
    <div className="relative py-6">
      <div className="relative max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="inline-block text-2xl md:text-3xl font-bold text-purple-800 mb-2 px-4 py-1 bg-white rounded-lg">
            Le RIA en schémas
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full" />
        </div>
        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden flex flex-col items-center p-8">
          <div className="w-full flex justify-center mb-6">
            <img 
              src={schema.image} 
              alt={`${schema.titre} - Schéma explicatif du Règlement IA - RIA Facile`}
              className="w-full max-w-md md:max-w-lg h-auto object-contain rounded-xl shadow-md" 
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <Link 
              to={schema.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base"
            >
              Voir ce schéma
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link 
              to="/schemas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 text-sm md:text-base flex items-center justify-center"
            >
              Voir tous les schémas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 