import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import ImageLightbox from '../components/ImageLightbox';

// Définition des schémas avec leurs noms de fichiers exacts et titres (en dehors du composant)
// Les noms de fichiers doivent correspondre exactement aux fichiers dans public/schemas/
const schemas = [
    { filename: "1. AI act. Calendrier d'entree en application.png", title: "AI act. Calendrier d'entrée en application" },
    { filename: "2. AI act. Montant des sanctions.png", title: "AI act. Montant des sanctions" },
    { filename: "3. AI act. Gouvernance.png", title: "AI act. Gouvernance" },
    { filename: "4. AI act. Solutions d'IA.png", title: "AI act. Solutions d'IA" },
    { filename: "5. AI act. Modeles d'IA.png", title: "AI act. Modèles d'IA" },
    { filename: "6. AI act. Systemes d'IApng.png", title: "AI act. Systèmes d'IA" },
    { filename: "7. AI act. Operateurs.png", title: "AI act. Opérateurs" },
    { filename: "8. AI act. Fournisseur.png", title: "AI act. Fournisseur" },
    { filename: "9. AI act. Deployeur.png", title: "AI act. Déployeur" },
    { filename: "10. AI act. Risques des modeles d'IA.png", title: "AI act. Risques des modèles d'IA" },
    { filename: "11. AI act. Identification des modeles d'IA a risque systemique.png", title: "AI act. Identification des modèles d'IA à risque systémique" },
    { filename: "12. AI act. Obligations des modeles d'IA a risque systemique.png", title: "AI act. Obligations des modèles d'IA à risque systémique" },
    { filename: "13. AI act. Identifications des modeles d'IA a usage generalpng.png", title: "AI act. Identifications des modèles d'IA à usage général" },
    { filename: "14. AI act. Obligations des modeles d'IA a usage general.png", title: "AI act. Obligations des modèles d'IA à usage général" },
    { filename: "15. AI act. Identification des modeles d'IA a risque inacceptable.png", title: "AI act. Identification des modèles d'IA à risque inacceptable" },
    { filename: "16. AI act. Obligations des systemes d'IA a risque inacceptable.png", title: "AI act. Obligations des systèmes d'IA à risque inacceptable" },
    { filename: "17. AI act. Identification des systemes d'IA a haut risque.png", title: "AI act. Identification des systèmes d'IA à haut risque" },
    { filename: "18. AI act. Obligations des systemes d'IA a haut risque.png", title: "AI act. Obligations des systèmes d'IA à haut risque" },
    { filename: "19. AI act. Identification des systemes d'IA a risque limite.png", title: "AI act. Identification des systèmes d'IA à risque limité" },
    { filename: "20. AI act. Obligations des systemes d'IA a risque limite.png", title: "AI act. Obligations des systèmes d'IA à risque limité" },
    { filename: "21. AI act. Identification des systemes d'IA a risque minimal.png", title: "AI act. Identification des systèmes d'IA à risque minimal" },
    { filename: "22. AI act. Obligations des systemes d'IA a hrisque minimal.png", title: "AI act. Obligations des systèmes d'IA à risque minimal" },
  ]

export const SchemasPage = () => {
  // État pour le sommaire replié/déplié
  const [sommaireOuvert, setSommaireOuvert] = useState(false)

  const location = useLocation()

  // Création des références pour chaque schéma
  const schemaRefsMap = useMemo(() => {
    const refs: Record<number, React.RefObject<HTMLDivElement>> = {}
    for (let i = 0; i < schemas.length; i++) {
      refs[i] = React.createRef<HTMLDivElement>()
    }
    return refs
  }, [])

  // Fonction pour générer un ID d'ancre à partir du titre
  const generateId = (title: string, index: number) => {
    return `schema-${index + 1}`
  }

  // Scroll fluide vers l'ancre si présente dans l'URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const index = parseInt(id.replace('schema-', '')) - 1
      if (index >= 0 && index < schemas.length && schemaRefsMap[index]?.current) {
        setTimeout(() => {
          schemaRefsMap[index].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location, schemaRefsMap])

  // Liste des schémas pour la lightbox
  const schemaImages = schemas.map((schema) => ({
    src: `/schemas/${encodeURIComponent(schema.filename)}`,
    alt: `Schéma explicatif : ${schema.title} - Règlement européen sur l'intelligence artificielle (AI Act) - RIA Facile`
  }))

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  const closeLightbox = () => setLightboxOpen(false)
  const prevLightbox = () => setLightboxIndex(i => (i > 0 ? i - 1 : i))
  const nextLightbox = () => setLightboxIndex(i => (i < schemaImages.length - 1 ? i + 1 : i))

  // Structured data pour le SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Le RIA en schémas - RIA Facile",
    "description": "Découvrez 22 schémas explicatifs et infographies pour comprendre le Règlement européen sur l'Intelligence Artificielle (AI Act). Visualisez les calendriers d'application, les niveaux de risques, les obligations, la gouvernance et bien plus encore.",
    "url": "https://ria-facile.com/schemas",
    "inLanguage": "fr-FR",
    "about": {
      "@type": "Thing",
      "name": "Règlement européen sur l'intelligence artificielle",
      "alternateName": "AI Act"
    },
    "image": schemas.map((schema) => {
      const imageSrc = `/schemas/${encodeURIComponent(schema.filename)}`
      const fullUrl = `https://ria-facile.com${imageSrc}`
      return {
        "@type": "ImageObject",
        "url": fullUrl,
        "name": schema.title,
        "description": `Schéma explicatif : ${schema.title} - Règlement IA (AI Act)`,
        "contentUrl": fullUrl,
        "license": "https://ria-facile.com",
        "copyrightHolder": {
          "@type": "Organization",
          "name": "RIA Facile"
      }
      }
    })
  }

  const metaDescription = "22 schémas et infographies pour comprendre le Règlement IA (AI Act) : calendrier d'application, niveaux de risques, obligations des systèmes d'IA, gouvernance, sanctions. Visualisations explicatives du règlement européen sur l'intelligence artificielle."

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Le RIA en schémas - 22 infographies explicatives du Règlement IA | RIA Facile</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content="Règlement IA, AI Act, schémas RIA, infographies intelligence artificielle, visualisation règlement IA, calendrier application RIA, niveaux de risques IA, obligations systèmes IA, gouvernance IA" />
        <meta property="og:title" content="Le RIA en schémas - 22 infographies explicatives du Règlement IA" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ria-facile.com/schemas" />
        <link rel="canonical" href="https://ria-facile.com/schemas" />
        <meta property="og:image" content={`https://ria-facile.com/schemas/${encodeURIComponent("1. AI act. Calendrier d'entree en application.png")}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Le RIA en schémas - 22 infographies explicatives du Règlement IA" />
        <meta name="twitter:description" content={metaDescription} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* En-tête inspiré de Doctrine/Documentation */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="white-container rounded-2xl shadow-lg p-8 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Le RIA en schémas
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Retrouvez ici des schémas et infographies pour mieux comprendre le Règlement IA (AI Act).
          </p>
        </div>
      </div>

      {/* Sommaire des schémas */}
      <section className="mt-8 mb-8">
        <div className="max-w-3xl mx-auto p-3 rounded-xl shadow border border-violet-200 bg-violet-50/80 animate-fade-in">
          <button
            className="w-full flex items-center justify-between gap-2 text-violet-700 font-extrabold text-lg md:text-xl px-2 py-2 focus:outline-none select-none"
            onClick={() => setSommaireOuvert(v => !v)}
            aria-expanded={sommaireOuvert}
            aria-controls="sommaire-list"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.862 5.487l1.65 1.65a2 2 0 010 2.828l-8.486 8.486a2 2 0 01-.707.464l-3.536 1.179a.5.5 0 01-.637-.637l1.179-3.536a2 2 0 01.464-.707l8.486-8.486a2 2 0 012.828 0z" /><path d="M15 7l2 2" /></svg>
              Sommaire des schémas
            </span>
            <svg className={`w-6 h-6 transition-transform duration-200 ${sommaireOuvert ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="sommaire-list"
            className={`overflow-hidden transition-all duration-300 ${sommaireOuvert ? 'max-h-[600px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}`}
            aria-hidden={!sommaireOuvert}
          >
            <ul className="space-y-1 text-base md:text-lg">
              {schemas.map((schema, index) => {
                const id = generateId(schema.title, index)
                return (
                  <li key={index}>
                    <a 
                      href={`#${id}`} 
                      className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline"
                    >
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                      {schema.title}
                </a>
              </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {schemas.map((schema, index) => {
          const id = generateId(schema.title, index)
          // Encoder le nom de fichier pour l'URL
          const imageSrc = `/schemas/${encodeURIComponent(schema.filename)}`
          
          return (
            <section key={index} className="mb-12" ref={schemaRefsMap[index]} id={id}>
          <div className="white-container rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">{schema.title}</h2>
            <img
                  src={imageSrc}
                  alt={`Schéma explicatif : ${schema.title} - Règlement européen sur l'intelligence artificielle (AI Act) - RIA Facile`}
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
                  onClick={() => openLightbox(index)}
              tabIndex={0}
              role="button"
                  aria-label={`Agrandir le schéma : ${schema.title}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(index); }}
                />
          </div>
        </section>
          )
        })}
      </div>

      {/* Lightbox d'image */}
      {lightboxOpen && (
        <ImageLightbox
          images={schemaImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </div>
  )
}

export default SchemasPage; 