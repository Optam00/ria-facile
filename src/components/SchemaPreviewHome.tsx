import React from 'react'
import { Link } from 'react-router-dom'

// Liste des schémas - correspond aux schémas de SchemasPage.tsx
const SCHEMAS = [
  {
    id: 1,
    titre: "AI act. Calendrier d'entrée en application",
    image: '/schemas/1. AI act. Calendrier d\'entree en application.png',
    url: '/schemas#schema-1',
  },
  {
    id: 2,
    titre: "AI act. Montant des sanctions",
    image: '/schemas/2. AI act. Montant des sanctions.png',
    url: '/schemas#schema-2',
  },
  {
    id: 3,
    titre: "AI act. Gouvernance",
    image: '/schemas/3. AI act. Gouvernance.png',
    url: '/schemas#schema-3',
  },
  {
    id: 4,
    titre: "AI act. Solutions d'IA",
    image: '/schemas/4. AI act. Solutions d\'IA.png',
    url: '/schemas#schema-4',
  },
  {
    id: 5,
    titre: "AI act. Modèles d'IA",
    image: '/schemas/5. AI act. Modeles d\'IA.png',
    url: '/schemas#schema-5',
  },
  {
    id: 6,
    titre: "AI act. Systèmes d'IA",
    image: '/schemas/6. AI act. Systemes d\'IApng.png',
    url: '/schemas#schema-6',
  },
  {
    id: 7,
    titre: "AI act. Opérateurs",
    image: '/schemas/7. AI act. Operateurs.png',
    url: '/schemas#schema-7',
  },
  {
    id: 8,
    titre: "AI act. Fournisseur",
    image: '/schemas/8. AI act. Fournisseur.png',
    url: '/schemas#schema-8',
  },
  {
    id: 9,
    titre: "AI act. Déployeur",
    image: '/schemas/9. AI act. Deployeur.png',
    url: '/schemas#schema-9',
  },
  {
    id: 10,
    titre: "AI act. Risques des modèles d'IA",
    image: '/schemas/10. AI act. Risques des modeles d\'IA.png',
    url: '/schemas#schema-10',
  },
  {
    id: 11,
    titre: "AI act. Identification des modèles d'IA à risque systémique",
    image: '/schemas/11. AI act. Identification des modeles d\'IA a risque systemique.png',
    url: '/schemas#schema-11',
  },
  {
    id: 12,
    titre: "AI act. Obligations des modèles d'IA à risque systémique",
    image: '/schemas/12. AI act. Obligations des modeles d\'IA a risque systemique.png',
    url: '/schemas#schema-12',
  },
  {
    id: 13,
    titre: "AI act. Identifications des modèles d'IA à usage général",
    image: '/schemas/13. AI act. Identifications des modeles d\'IA a usage generalpng.png',
    url: '/schemas#schema-13',
  },
  {
    id: 14,
    titre: "AI act. Obligations des modèles d'IA à usage général",
    image: '/schemas/14. AI act. Obligations des modeles d\'IA a usage general.png',
    url: '/schemas#schema-14',
  },
  {
    id: 15,
    titre: "AI act. Identification des modèles d'IA à risque inacceptable",
    image: '/schemas/15. AI act. Identification des modeles d\'IA a risque inacceptable.png',
    url: '/schemas#schema-15',
  },
  {
    id: 16,
    titre: "AI act. Obligations des systèmes d'IA à risque inacceptable",
    image: '/schemas/16. AI act. Obligations des systemes d\'IA a risque inacceptable.png',
    url: '/schemas#schema-16',
  },
  {
    id: 17,
    titre: "AI act. Identification des systèmes d'IA à haut risque",
    image: '/schemas/17. AI act. Identification des systemes d\'IA a haut risque.png',
    url: '/schemas#schema-17',
  },
  {
    id: 18,
    titre: "AI act. Obligations des systèmes d'IA à haut risque",
    image: '/schemas/18. AI act. Obligations des systemes d\'IA a haut risque.png',
    url: '/schemas#schema-18',
  },
  {
    id: 19,
    titre: "AI act. Identification des systèmes d'IA à risque limité",
    image: '/schemas/19. AI act. Identification des systemes d\'IA a risque limite.png',
    url: '/schemas#schema-19',
  },
  {
    id: 20,
    titre: "AI act. Obligations des systèmes d'IA à risque limité",
    image: '/schemas/20. AI act. Obligations des systemes d\'IA a risque limite.png',
    url: '/schemas#schema-20',
  },
  {
    id: 21,
    titre: "AI act. Identification des systèmes d'IA à risque minimal",
    image: '/schemas/21. AI act. Identification des systemes d\'IA a risque minimal.png',
    url: '/schemas#schema-21',
  },
  {
    id: 22,
    titre: "AI act. Obligations des systèmes d'IA à risque minimal",
    image: '/schemas/22. AI act. Obligations des systemes d\'IA a hrisque minimal.png',
    url: '/schemas#schema-22',
  },
]

export const SchemaPreviewHome: React.FC = () => {
  // Sélection aléatoire d'un schéma à chaque chargement
  const [randomIndex] = React.useState(() => Math.floor(Math.random() * SCHEMAS.length))
  const schema = SCHEMAS[randomIndex]

  // Encoder le nom de fichier pour l'URL
  const filename = schema.image.replace('/schemas/', '')
  const imageSrc = `/schemas/${encodeURIComponent(filename)}`

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
              src={imageSrc} 
              alt={`${schema.titre} - Schéma explicatif du Règlement IA - RIA Facile`}
              className="w-full max-w-md md:max-w-lg h-auto object-contain rounded-xl shadow-md" 
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <Link 
              to={schema.url}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base"
            >
              Voir ce schéma
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link 
              to="/schemas"
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