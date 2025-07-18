import React, { useRef, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import ImageLightbox from '../components/ImageLightbox';

export const SchemasPage = () => {
  // Référence pour la section du schéma
  const refDateMiseEnOeuvre = useRef<HTMLDivElement>(null)
  const refModeleVsSysteme = useRef<HTMLDivElement>(null)
  const refGPAI = useRef<HTMLDivElement>(null)
  const refSIAs = useRef<HTMLDivElement>(null)
  const refGouvernance = useRef<HTMLDivElement>(null)

  // État pour gérer l'affichage du texte explicatif de chaque schéma
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'date-mise-en-oeuvre': false,
    'modele-vs-systeme': false,
    'gpai': false,
    'sias': false,
    'limite': false,
    'gouvernance': false,
    'exigences_SIAHR': false,
  })
  // État pour le sommaire replié/déplié
  const [sommaireOuvert, setSommaireOuvert] = useState(false)

  const location = useLocation()

  // Scroll fluide vers l'ancre si présente dans l'URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
        'date-mise-en-oeuvre': refDateMiseEnOeuvre,
        'modele-vs-systeme': refModeleVsSysteme,
        'gpai': refGPAI,
        'sias': refSIAs,
        'gouvernance': refGouvernance,
        'exigences_SIAHR': refGouvernance,
      }
      const ref = refMap[id]
      if (ref && ref.current) {
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location])

  // Fonction de scroll fluide
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Fonction pour basculer l'affichage d'une section
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Données structurées pour les images
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Le RIA en schémas - RIA Facile",
    "description": "Visualisez le règlement IA en schémas et infographies explicatives",
    "url": "https://ria-facile.com/schemas",
    "image": [
      {
        "@type": "ImageObject",
        "url": "/schemas/Dates.png",
        "name": "Calendrier d'entrée en application du Règlement IA",
        "description": "Calendrier d'entrée en application du Règlement IA (AI Act) - Dates de mise en œuvre 2025-2027"
      },
      {
        "@type": "ImageObject",
        "url": "/schemas/modele%20vs%20systeme.png",
        "name": "Distinction entre modèle d'IA et système d'IA",
        "description": "Schéma explicatif de la distinction entre modèle d'IA et système d'IA selon le Règlement IA"
      },
      {
        "@type": "ImageObject",
        "url": "/schemas/GPAI.png",
        "name": "Modèles d'IA à usage général (GPAI)",
        "description": "Schéma des modèles d'IA à usage général (GPAI) - Classification et obligations"
      },
      {
        "@type": "ImageObject",
        "url": "/schemas/SIAs.png",
        "name": "Niveaux de risques des systèmes d'IA",
        "description": "Schéma des niveaux de risques des systèmes d'IA - Risque inacceptable, élevé, limité, minimal"
      },
      {
        "@type": "ImageObject",
        "url": "/schemas/gouvernance.png",
        "name": "Gouvernance prévue par le Règlement IA",
        "description": "Schéma de la gouvernance prévue par le Règlement IA - Bureau de l'IA, Comité IA, autorités nationales"
      }
    ]
  }

  // Liste des schémas à afficher dans la lightbox
  const schemaImages = [
    { src: '/schemas/Dates.png', alt: "Calendrier d'entrée en application du Règlement IA (AI Act) - Dates de mise en œuvre 2025-2027 - RIA Facile" },
    { src: '/schemas/modele%20vs%20systeme.png', alt: "Schéma explicatif : distinction entre modèle d'IA et système d'IA - Règlement IA - RIA Facile" },
    { src: '/schemas/GPAI.png', alt: "Schéma des modèles d'IA à usage général (GPAI) - Classification et obligations - Règlement IA - RIA Facile" },
    { src: '/schemas/SIAs.png', alt: "Schéma des niveaux de risques des systèmes d'IA - Risque inacceptable, élevé, limité, minimal - RIA Facile" },
    { src: '/schemas/gouvernance.png', alt: "Schéma de la gouvernance prévue par le Règlement IA - Bureau de l'IA, Comité IA, autorités nationales - RIA Facile" },
    { src: '/schemas/limite.png', alt: "Obligations pour les systèmes d'IA à risque limité - RIA Facile" },
    { src: '/schemas/exigences_SIAHR.png', alt: "Exigences concernant les systèmes d'IA à haut risque - RIA Facile" },
    { src: '/schemas/obligations_SIAHR.png', alt: "Obligations SIAHR - RIA Facile" },
    { src: '/schemas/sanctions.png', alt: "Montant des sanctions prévues par le RIA - RIA Facile" },
  ];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () => setLightboxIndex(i => (i > 0 ? i - 1 : i));
  const nextLightbox = () => setLightboxIndex(i => (i < schemaImages.length - 1 ? i + 1 : i));

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Le RIA en schémas - RIA Facile</title>
        <meta name="description" content="Visualisez le règlement IA en schémas et infographies." />
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
            className={`overflow-hidden transition-all duration-300 ${sommaireOuvert ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}`}
            aria-hidden={!sommaireOuvert}
          >
            <ul className="space-y-1 text-base md:text-lg">
              <li>
                <a href="#date-mise-en-oeuvre" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  Calendrier d'entrée en application du règlement IA
                </a>
              </li>
              <li>
                <a href="#modele-vs-systeme" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  La distinction entre modèle d'IA et système d'IA
                </a>
              </li>
              <li>
                <a href="#gpai" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  Les différents modèles d'IA à usage général
                </a>
              </li>
              <li>
                <a href="#sias" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  Les niveaux de risques des systèmes d'IA
                </a>
              </li>
              <li>
                <a href="#limite" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  Obligations pour les systèmes d'IA à risque limité
                </a>
              </li>
              <li>
                <a href="#gouvernance" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  La gouvernance prévue par le RIA
                </a>
              </li>
              <li>
                <a href="#sanctions" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  Montant des sanctions prévues par le RIA
                </a>
              </li>
              <li>
                <a href="#exigences_SIAHR" className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full"></span>
                  Exigences concernant les systèmes d'IA à haut risque
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <section className="mb-12" ref={refDateMiseEnOeuvre} id="date-mise-en-oeuvre">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Calendrier d'entrée en application du règlement IA</h2>
            <img
              src="/schemas/Dates.png"
              alt="Calendrier d'entrée en application du Règlement IA (AI Act) - Dates de mise en œuvre 2025-2027 - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(0)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(0); }}
            />

            {/* Bouton pour afficher/masquer les détails */}
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('date-mise-en-oeuvre')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['date-mise-en-oeuvre'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Texte explicatif (masqué par défaut) */}
            {expandedSections['date-mise-en-oeuvre'] && (
              <ol className="space-y-8 text-black max-w-3xl mx-auto">
              <li>
                <div className="font-semibold text-black mb-1">1. 2 février 2025 (6 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Interdiction des pratiques d'IA inacceptables.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span> Les règles interdisant les systèmes d'IA qui présentent un risque inacceptable, comme la notation sociale par les gouvernements, la manipulation des comportements ou l'exploitation des vulnérabilités des personnes, deviennent applicables.</div>
                <div className="mb-1"><span className="font-semibold">Articles concernés :</span> Chapitre II (Article 5).</div>
              </li>
              <li>
                <div className="font-semibold text-black mb-1">2. 2 août 2025 (12 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Gouvernance, modèles d'IA à usage général (GPAI) et sanctions.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span></div>
                <ul className="list-disc ml-8 mb-1">
                  <li>Les obligations pour les fournisseurs de modèles d'IA à usage général (GPAI), comme la documentation technique, la transparence et le respect du droit d'auteur, s'appliquent.</li>
                  <li>La structure de gouvernance (Bureau de l'IA, Comité IA, etc.) doit être fonctionnelle.</li>
                  <li>Les États membres doivent avoir mis en place le régime des sanctions.</li>
                  <li>Les règles sur les organismes notifiés (chargés de la certification des IA à haut risque) entrent en application.</li>
                </ul>
                <div className="mb-1"><span className="font-semibold">Articles concernés :</span></div>
                <ul className="list-disc ml-8">
                  <li>Chapitre V (Articles 51-56) pour les modèles d'IA à usage général.</li>
                  <li>Chapitre VII (Articles 64-70) pour la gouvernance.</li>
                  <li>Chapitre XII (Article 99) pour les sanctions.</li>
                  <li>Chapitre III, Section 4 (Articles 28-39) pour les organismes notifiés.</li>
                </ul>
              </li>
              <li>
                <div className="font-semibold text-black mb-1">3. 2 août 2026 (24 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Application générale du règlement.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span> La grande majorité des obligations du règlement deviennent applicables, notamment toutes les règles pour les systèmes d'IA classés à haut risque (à l'exception de ceux mentionnés au point suivant).</div>
                <div className="mb-1"><span className="font-semibold">Article concerné :</span> Article 113, qui fixe cette date comme date d'application générale par défaut.</div>
              </li>
              <li>
                <div className="font-semibold text-black mb-1">4. 2 août 2027 (36 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Systèmes d'IA à haut risque intégrés dans des produits déjà réglementés.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span> Les obligations pour les systèmes d'IA à haut risque qui sont des composants de sécurité de produits déjà couverts par une autre législation de l'Union (listée à l'Annexe I, comme les jouets, les dispositifs médicaux, les machines, etc.) deviennent applicables.</div>
                <div className="mb-1"><span className="font-semibold">Article concerné :</span> Article 6, paragraphe 1.</div>
              </li>
            </ol>
            )}
          </div>
        </section>

        {/* Nouvelle section : Modèle vs Système */}
        <section className="mb-12" ref={refModeleVsSysteme} id="modele-vs-systeme">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">La distinction entre modèle d'IA et système d'IA</h2>
            <img
              src="/schemas/modele%20vs%20systeme.png"
              alt="Schéma explicatif : distinction entre modèle d'IA et système d'IA - Règlement IA - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(1)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(1); }}
            />
            
            {/* Bouton pour afficher/masquer les détails */}
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('modele-vs-systeme')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['modele-vs-systeme'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Texte explicatif (masqué par défaut) */}
            {expandedSections['modele-vs-systeme'] && (
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Modèle d'IA */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">Le Modèle d'IA (Le Moteur)</h3>
                <ul className="list-disc ml-5 text-black space-y-2 mb-4">
                  <li><span className="font-semibold">Nature :</span> C'est un composant, un "cerveau" algorithmique.</li>
                  <li><span className="font-semibold">Fonction :</span> Il est généraliste et adaptable. Il est le résultat d'un processus d'entraînement et peut être intégré dans de multiples applications.</li>
                  <li><span className="font-semibold">Réglementation :</span> Il est réglementé à la source, au niveau de ses fournisseurs. Les règles se concentrent sur la transparence technique et la gestion des risques systémiques potentiels.</li>
                  <li><span className="font-semibold">Exemple :</span> Le modèle de langage GPT-4 en lui-même.</li>
                  <li><span className="font-semibold">Article de définition :</span> Article 3, point 63 (définit le "modèle d'IA à usage général").</li>
                </ul>
              </div>
              {/* Système d'IA */}
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">Le Système d'IA (Le Véhicule)</h3>
                <ul className="list-disc ml-5 text-black space-y-2 mb-4">
                  <li><span className="font-semibold">Nature :</span> C'est le produit final que l'utilisateur déploie ou utilise.</li>
                  <li><span className="font-semibold">Fonction :</span> Il a une finalité précise ("destination") définie par son fournisseur. C'est cette finalité qui détermine son niveau de risque.</li>
                  <li><span className="font-semibold">Réglementation :</span> Il est réglementé en fonction de son risque d'usage. Les règles varient drastiquement selon qu'il est classé comme à risque inacceptable, élevé ou limité.</li>
                  <li><span className="font-semibold">Exemple :</span> Un chatbot de service client qui utilise le modèle GPT-4.</li>
                  <li><span className="font-semibold">Article de définition :</span> Article 3, point 1 (définit le "système d'IA").</li>
                </ul>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* Nouvelle section : GPAI */}
        <section className="mb-12" ref={refGPAI} id="gpai">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Les différents modèles d'IA à usage général</h2>
            <img
              src="/schemas/GPAI.png"
              alt="Schéma des modèles d'IA à usage général (GPAI) - Classification et obligations - Règlement IA - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(2)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(2); }}
            />
            
            {/* Bouton pour afficher/masquer les détails */}
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('gpai')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['gpai'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Texte explicatif (masqué par défaut) */}
            {expandedSections['gpai'] && (
              <div className="text-black space-y-6 max-w-3xl mx-auto">
              <p>La réglementation cible spécifiquement les Modèles d'IA à Usage Général (GPAI - General-Purpose AI models), définis comme des modèles capables d'exécuter un large éventail de tâches distinctes et pouvant être intégrés dans une multitude de systèmes en aval.</p>
              <div className="mb-2"><span className="font-semibold">Article de définition clé :</span> Article 3, point 63.</div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">1. Le Modèle d'IA à Usage Général (Catégorie par défaut)</h3>
                  <ul className="list-disc ml-6 space-y-1 mb-2">
                    <li><span className="font-semibold">Description :</span> C'est la catégorie de base pour tout modèle d'IA à usage général mis sur le marché.</li>
                    <li><span className="font-semibold">Exemples :</span> La plupart des grands modèles de langage (LLM) ou des modèles de génération d'images.</li>
                  </ul>
                  <div className="mb-1 font-semibold">Obligations principales :</div>
                  <ul className="list-disc ml-8 mb-2">
                    <li>Élaborer et tenir à jour une documentation technique pour les développeurs qui intégreront le modèle.</li>
                    <li>Mettre en place une politique de respect du droit d'auteur de l'Union, notamment pour l'entraînement.</li>
                  </ul>
                  <div className="mb-2"><span className="font-semibold">Article clé pour les obligations :</span> Article 53.</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">2. Le Modèle d'IA à Usage Général présentant un Risque Systémique</h3>
                  <ul className="list-disc ml-6 space-y-1 mb-2">
                    <li><span className="font-semibold">Description :</span> Il s'agit d'une sous-catégorie des modèles à usage général. Ces modèles sont si puissants ("capacités à fort impact") qu'ils pourraient poser des risques graves à l'échelle de la société (sécurité publique, santé, etc.).</li>
                    <li><span className="font-semibold">Identification :</span> Un modèle est classé dans cette catégorie s'il atteint un seuil très élevé de capacité, présumé lorsque la puissance de calcul utilisée pour son entraînement dépasse 10^25 FLOPs, ou s'il est désigné comme tel par la Commission.</li>
                  </ul>
                  <div className="mb-1 font-semibold">Obligations supplémentaires (en plus de celles de la catégorie 1) :</div>
                  <ul className="list-disc ml-8 mb-2">
                    <li>Réaliser des évaluations du modèle (y compris des tests contradictoires ou "red-teaming").</li>
                    <li>Évaluer et atténuer les risques systémiques.</li>
                    <li>Assurer un haut niveau de cybersécurité.</li>
                    <li>Signaler les incidents graves au Bureau de l'IA.</li>
                  </ul>
                  <div className="mb-2"><span className="font-semibold">Articles clés :</span> Article 51 (classification) et Article 55 (obligations supplémentaires).</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Cas Particulier : Les Modèles sous Licence Libre et Ouverte (Open-Source)</h3>
                  <ul className="list-disc ml-6 space-y-1 mb-2">
                    <li><span className="font-semibold">Traitement :</span> Ils bénéficient d'une exemption significative. En règle générale, ils ne sont pas soumis aux obligations de l'Article 53 (notamment la documentation technique) si leurs paramètres et architecture sont publiquement accessibles.</li>
                    <li><span className="font-semibold">L'exception à l'exemption :</span> Cette exemption ne s'applique pas si un modèle open-source est classé comme présentant un risque systémique. Dans ce cas, il doit se conformer aux obligations supplémentaires.</li>
                  </ul>
                </div>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* Nouvelle section : Niveaux de risques des systèmes d'IA */}
        <section className="mb-12" ref={refSIAs} id="sias">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Les niveaux de risques des systèmes d'IA</h2>
            <img
              src="/schemas/SIAs.png"
              alt="Schéma des niveaux de risques des systèmes d'IA - Risque inacceptable, élevé, limité, minimal - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(3)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(3); }}
            />
            
            {/* Bouton pour afficher/masquer les détails */}
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('sias')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['sias'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Texte explicatif (masqué par défaut) */}
            {expandedSections['sias'] && (
              <div className="text-black space-y-8 max-w-3xl mx-auto">
              <div>
                <h3 className="text-xl font-bold mb-2">1. Systèmes à Risque Inacceptable (Pratiques Interdites)</h3>
                <p><span className="font-semibold">Description :</span> Ce sont les applications de l'IA jugées comme une menace pour les droits fondamentaux des personnes. Leur mise sur le marché, mise en service et utilisation sont totalement interdites dans l'Union européenne.</p>
                <p className="mt-2 font-semibold">Exemples :</p>
                <ul className="list-disc ml-8 mb-2">
                  <li>La notation sociale par les autorités publiques.</li>
                  <li>La manipulation des comportements humains qui peut causer un préjudice.</li>
                  <li>L'exploitation des vulnérabilités de certains groupes (enfants, personnes handicapées).</li>
                  <li>L'identification biométrique à distance "en temps réel" dans les espaces accessibles au public à des fins répressives (sauf pour des exceptions très strictes et limitées).</li>
                </ul>
                <p><span className="font-semibold">Article clé :</span> Article 5.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">2. Systèmes d'IA à Haut Risque</h3>
                <p><span className="font-semibold">Description :</span> C'est la catégorie la plus réglementée. Ces systèmes ne sont pas interdits, mais ils doivent se conformer à des exigences obligatoires strictes avant d'être mis sur le marché. Ces exigences portent sur la gestion des risques, la qualité des données, la documentation technique, le contrôle humain, la robustesse et la cybersécurité.</p>
                <p><span className="font-semibold">Identification :</span> Un système est classé "à haut risque" s'il appartient à l'une des deux catégories suivantes :</p>
                <ul className="list-disc ml-8 mb-2">
                  <li>Systèmes qui sont des composants de sécurité de produits déjà réglementés (ex : dispositifs médicaux, jouets, voitures, ascenseurs). La liste de ces produits se trouve à l'Annexe I.</li>
                  <li>Systèmes utilisés dans huit domaines spécifiques et sensibles, listés à l'Annexe III :</li>
                  <ul className="list-disc ml-8">
                    <li>Identification biométrique.</li>
                    <li>Gestion des infrastructures critiques.</li>
                    <li>Éducation et formation professionnelle.</li>
                    <li>Emploi, gestion des travailleurs et accès au travail indépendant.</li>
                    <li>Accès aux services essentiels privés et publics (ex : évaluation de la solvabilité pour les crédits, dispatch des services d'urgence).</li>
                    <li>Application de la loi (Répression).</li>
                    <li>Migration, asile et contrôle des frontières.</li>
                    <li>Administration de la justice et processus démocratiques.</li>
                  </ul>
                </ul>
                <p><span className="font-semibold">Articles clés :</span> Article 6 (règle de classification) et Annexes I et III (listes des produits et domaines).</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">3. Systèmes d'IA à Risque Limité</h3>
                <p><span className="font-semibold">Description :</span> Ces systèmes ne sont pas considérés comme dangereux, mais ils doivent respecter des obligations de transparence pour que les utilisateurs sachent qu'ils interagissent avec une IA ou que du contenu a été généré artificiellement. Le but est d'éviter la tromperie.</p>
                <p className="font-semibold">Exemples et obligations :</p>
                <ul className="list-disc ml-8 mb-2">
                  <li><span className="font-semibold">Chatbots :</span> Doivent informer qu'ils sont une IA.</li>
                  <li><span className="font-semibold">Hypertrucages (Deepfakes) :</span> Doivent étiqueter le contenu comme étant généré ou manipulé par une IA.</li>
                  <li><span className="font-semibold">Reconnaissance des émotions / Catégorisation biométrique :</span> Doivent informer les personnes qu'elles sont exposées à un tel système.</li>
                </ul>
                <p><span className="font-semibold">Article clé :</span> Article 50.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">4. Systèmes d'IA à Risque Minimal (ou nul)</h3>
                <p><span className="font-semibold">Description :</span> C'est la catégorie par défaut qui couvre la les autres systèmes d'IA.</p>
                <p><span className="font-semibold">Exemples :</span> Les filtres anti-spam, les systèmes de recommandation, les jeux vidéo utilisant l'IA, les systèmes de gestion des stocks.</p>
                <p><span className="font-semibold">Obligations :</span> Il n'y a aucune obligation spécifique dans le cadre de ce règlement. Les fournisseurs sont toutefois encouragés à adhérer volontairement à des codes de conduite.</p>
                <p><span className="font-semibold">Article clé pour l'encouragement volontaire :</span> Article 95.</p>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* Nouvelle section : Obligations pour les systèmes d'IA à risque limité */}
        <section className="mb-12" id="limite">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Obligations pour les systèmes d'IA à risque limité</h2>
            <img
              src="/schemas/limite.png"
              alt="Obligations pour les systèmes d'IA à risque limité - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(4)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(4); }}
            />
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('limite')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['limite'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            {expandedSections['limite'] && (
              <div className="text-black space-y-8 max-w-3xl mx-auto text-left animate-fade-in">
                <div>
                  <h3 className="font-bold text-lg mb-2">1. Systèmes d'Interaction avec les Humains (ex: Chatbots)</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><b>Obligation :</b> Les utilisateurs doivent être informés de manière claire qu'ils interagissent avec un système d'IA.</li>
                    <li><b>Responsable :</b> <b>Le fournisseur</b> doit concevoir le système dans ce but.</li>
                    <li><b>Article de référence :</b> <b>Article 50, paragraphe 1</b>.</li>
                    <li><b>Exception :</b> Cette obligation ne s'applique pas si l'interaction avec l'IA est "évidente" compte tenu des circonstances (par exemple, un avatar dans un jeu vidéo).</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">2. Systèmes de Reconnaissance des Émotions ou de Catégorisation Biométrique</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><b>Obligation :</b> Les personnes physiques exposées à un tel système doivent être informées de son fonctionnement.</li>
                    <li><b>Responsable :</b> <b>Le déployeur</b> (celui qui utilise le système).</li>
                    <li><b>Article de référence :</b> <b>Article 50, paragraphe 3</b>.</li>
                    <li><b>Note :</b> S'applique uniquement aux systèmes <i>non interdits</i> et <i>non classés à haut risque</i>.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">3. Systèmes de Génération de Contenu Artificiel (ex: Deepfakes)</h3>
                  <div className="mb-2">Ici, la responsabilité est partagée entre le fournisseur et le déployeur :</div>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><b>Obligation du Fournisseur :</b>
                      <ul className="list-[circle] pl-6">
                        <li><b>Marquer le contenu :</b> Les systèmes doivent intégrer une solution technique pour que les sorties (images, audio, vidéo, texte) soient <b>marquées</b> dans un format lisible par machine, indiquant qu'elles ont été générées artificiellement.</li>
                        <li><b>Article de référence :</b> <b>Article 50, paragraphe 2</b>.</li>
                      </ul>
                    </li>
                    <li><b>Obligation du Déployeur :</b>
                      <ul className="list-[circle] pl-6">
                        <li><b>Déclarer le contenu :</b>
                          <ul className="list-[square] pl-6">
                            <li>Pour les <b>hypertrucages</b> (images/audio/vidéo qui semblent réels), le déployeur doit clairement indiquer que le contenu est artificiel.</li>
                            <li>Pour le <b>texte</b> généré par IA et publié pour informer le public sur des sujets d'intérêt général, le déployeur doit également le signaler.</li>
                          </ul>
                        </li>
                        <li><b>Article de référence :</b> <b>Article 50, paragraphe 4</b>.</li>
                        <li><b>Exception :</b> Pour les contenus manifestement artistiques, créatifs, ou satiriques, l'obligation se limite à une divulgation appropriée qui ne gêne pas l'œuvre.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <hr className="my-6" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Points Clés Communs à ces Obligations</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><b>Comment informer ?</b> L'information doit être claire, reconnaissable et fournie au plus tard lors de la première interaction ou exposition. (<b>Article 50, paragraphe 5</b>).</li>
                    <li><b>Articulation avec les autres règles :</b> Ces obligations de transparence sont un socle minimal et ne remplacent pas les exigences plus strictes pour les systèmes d'IA à haut risque. (<b>Article 50, paragraphe 6</b>).</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Schéma : La gouvernance prévue par le RIA */}
        <div ref={refGouvernance} className="schema-section mb-16">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
              La gouvernance prévue par le RIA
            </h2>
            
            <div className="flex justify-center mb-8">
              <img
                src="/schemas/gouvernance.png"
                alt="Schéma de la gouvernance prévue par le Règlement IA - Bureau de l'IA, Comité IA, autorités nationales - RIA Facile"
                className="w-full max-w-full sm:max-w-3xl mx-auto rounded-xl shadow-md border mb-8 cursor-zoom-in transition hover:scale-105"
                onClick={() => openLightbox(5)}
                tabIndex={0}
                role="button"
                aria-label="Agrandir le schéma"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(5); }}
              />
            </div>
            
            {/* Bouton pour afficher/masquer les détails */}
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('gouvernance')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['gouvernance'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Texte explicatif (masqué par défaut) */}
            {expandedSections['gouvernance'] && (
              <div className="space-y-8 text-left max-w-3xl mx-auto">
              <div>
                <div className="font-semibold text-black mb-1">1. Le Bureau de l'intelligence artificielle (Bureau de l'IA)</div>
                <div className="text-gray-700 mb-4">
                  <strong>Description :</strong> Organe central établi au sein de la Commission européenne, il est le pilier de la surveillance et de l'application du règlement au niveau de l'Union. Il joue un rôle crucial dans la supervision des modèles d'IA les plus puissants.
                </div>
                <div className="text-gray-700 mb-4">
                  <strong>Missions Clés :</strong>
                </div>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Superviser l'application des règles pour les modèles d'IA à usage général.</li>
                  <li>Identifier et surveiller les modèles d'IA à usage général présentant un risque systémique.</li>
                  <li>Contribuer à l'élaboration de normes et de codes de bonne pratique.</li>
                  <li>Coordonner l'action des différents organes de gouvernance.</li>
                </ul>
                <div className="text-gray-700">
                  <strong>Articles clés :</strong> Article 64, Article 88.
                </div>
              </div>

              <div>
                <div className="font-semibold text-black mb-1">2. Le Comité européen de l'intelligence artificielle (Comité IA)</div>
                <div className="text-gray-700 mb-4">
                  <strong>Description :</strong> Organe composé de représentants de chaque État membre, il a pour but d'assurer une application cohérente et harmonisée du règlement dans toute l'Union. Il conseille la Commission et les États membres.
                </div>
                <div className="text-gray-700 mb-4">
                  <strong>Composition et Rôle :</strong>
                </div>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Composition :</strong> Un représentant par État membre, présidé par l'un d'eux.</li>
                  <li><strong>Rôle :</strong> Émettre des avis et des recommandations sur des sujets clés, comme la mise à jour de la liste des IA à haut risque (Annexe III) ou sur l'application des sanctions.</li>
                </ul>
                <div className="text-gray-700">
                  <strong>Articles clés :</strong> Article 65, Article 66.
                </div>
              </div>

              <div>
                <div className="font-semibold text-black mb-1">3. Les Autorités nationales de surveillance</div>
                <div className="text-gray-700 mb-4">
                  <strong>Description :</strong> Il s'agit des "gendarmes" de l'IA dans chaque pays de l'UE. Chaque État membre doit en désigner au moins une pour être le principal point de contact et assurer l'application du règlement sur son territoire.
                </div>
                <div className="text-gray-700 mb-4">
                  <strong>Pouvoirs et Responsabilités :</strong>
                </div>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Contrôler le respect des obligations par les fournisseurs et les utilisateurs de systèmes d'IA.</li>
                  <li>Mener des enquêtes en cas de suspicion de non-conformité.</li>
                  <li>Appliquer des sanctions et des mesures correctrices.</li>
                  <li>Collaborer avec les autres autorités nationales pour une surveillance efficace du marché.</li>
                </ul>
                <div className="text-gray-700">
                  <strong>Articles clés :</strong> Article 70, Article 74.
                </div>
              </div>

              <div>
                <div className="font-semibold text-black mb-1">4. Le Forum consultatif</div>
                <div className="text-gray-700 mb-4">
                  <strong>Description :</strong> Un groupe d'experts créé pour apporter une expertise technique et représenter les points de vue de la société civile et de l'industrie. Il conseille le Bureau de l'IA et le Comité IA.
                </div>
                <div className="text-gray-700 mb-4">
                  <strong>Composition et Mission :</strong>
                </div>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li><strong>Composition :</strong> Représentants équilibrés de l'industrie (y compris PME et startups), du monde universitaire, de la société civile et des organismes de normalisation.</li>
                  <li><strong>Mission :</strong> Fournir des avis techniques et s'assurer que les perspectives des différentes parties prenantes sont prises en compte dans la mise en œuvre du règlement.</li>
                </ul>
                <div className="text-gray-700">
                  <strong>Article clé :</strong> Article 67.
                </div>
              </div>

              <div>
                <div className="font-semibold text-black mb-1">5. Le Groupe scientifique d'experts indépendants</div>
                <div className="text-gray-700 mb-4">
                  <strong>Description :</strong> Un panel de scientifiques et de techniciens indépendants chargé de fournir une expertise de haut niveau sur les modèles d'IA les plus avancés.
                </div>
                <div className="text-gray-700 mb-4">
                  <strong>Missions Clés :</strong>
                </div>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Alerter le Bureau de l'IA sur les risques systémiques potentiels liés aux modèles d'IA à usage général.</li>
                  <li>Fournir des avis scientifiques sur les évolutions technologiques et leurs implications.</li>
                  <li>Contribuer à l'évaluation des capacités et des risques des modèles d'IA les plus avancés.</li>
                </ul>
                <div className="text-gray-700">
                  <strong>Article clé :</strong> Article 68.
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Nouvelle section : Montant des sanctions prévus par le RIA */}
        <section className="mb-12" id="sanctions">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Montant des sanctions prévus par le RIA</h2>
            <img
              src="/schemas/sanctions.png"
              alt="Montant des sanctions prévues par le RIA - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(6)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(6); }}
            />
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('sanctions')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['sanctions'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            {expandedSections['sanctions'] && (
              <div className="text-black space-y-8 max-w-3xl mx-auto text-left animate-fade-in">
                <div>
                  <h3 className="font-bold text-lg mb-2">1. Niveau 1 : Jusqu'à 35 millions d'euros ou 7% du chiffre d'affaires mondial</h3>
                  <p><span className="font-semibold">Pour quelle infraction ?</span> C'est la sanction la plus sévère, réservée au non-respect des pratiques d'IA interdites.</p>
                  <p><span className="font-semibold">Exemples :</span> Mettre sur le marché ou utiliser un système de notation sociale, de manipulation subliminale, etc.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 99, paragraphe 3.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">2. Niveau 2 : Jusqu'à 15 millions d'euros ou 3% du chiffre d'affaires mondial</h3>
                  <p><span className="font-semibold">Pour quelle infraction ?</span> Non-respect de la plupart des autres obligations clés du règlement, notamment :</p>
                  <ul className="list-disc ml-8 mb-2">
                    <li>Les obligations des fournisseurs d'IA à haut risque (exigences de qualité, de documentation, etc. - Art. 16).</li>
                    <li>Les obligations des déployeurs d'IA à haut risque (contrôle humain, surveillance, etc. - Art. 26).</li>
                    <li>Les obligations des organismes notifiés (organismes de certification).</li>
                    <li>Les obligations de transparence pour les IA à risque limité (chatbots, deepfakes - Art. 50).</li>
                    <li>Les obligations relatives aux fournisseurs de modèles d'IA à usage générale (Art. 101).</li>
                  </ul>
                  <p><span className="font-semibold">Article de référence :</span> Article 99, paragraphe 4.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">3. Niveau 3 : Jusqu'à 7,5 millions d'euros ou 1% du chiffre d'affaires mondial</h3>
                  <p><span className="font-semibold">Pour quelle infraction ?</span> Fourniture d'informations incorrectes, incomplètes ou trompeuses aux organismes notifiés ou aux autorités nationales compétentes.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 99, paragraphe 5.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Nouvelle section : Exigences concernant les systèmes d'IA à haut risque */}
        <section className="mb-12" id="exigences_SIAHR">
          <div className="white-container rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Exigences concernant les systèmes d'IA à haut risque</h2>
            <img
              src="/schemas/exigences_SIAHR.png"
              alt="Exigences concernant les systèmes d'IA à haut risque - Règlement IA - RIA Facile"
              className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
              onClick={() => openLightbox(7)}
              tabIndex={0}
              role="button"
              aria-label="Agrandir le schéma"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(7); }}
            />
            <div className="text-center mb-6">
              <button
                onClick={() => toggleSection('exigences_SIAHR')}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                {expandedSections['exigences_SIAHR'] ? (
                  <>
                    <span>Masquer les détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Voir plus de détails</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            {expandedSections['exigences_SIAHR'] && (
              <div className="text-black space-y-8 max-w-3xl mx-auto text-left animate-fade-in">
                <div>
                  <h3 className="font-bold text-lg mb-2">1. Système de gestion des risques</h3>
                  <p><span className="font-semibold">Description :</span> Un processus continu d'identification, d'analyse et d'atténuation des risques pour la santé, la sécurité et les droits fondamentaux, qui doit être maintenu tout au long du cycle de vie du système.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 9.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">2. Qualité et gouvernance des données</h3>
                  <p><span className="font-semibold">Description :</span> Les jeux de données utilisés pour l'entraînement, la validation et les tests doivent être de haute qualité : pertinents, représentatifs, exempts d'erreurs et complets. Des pratiques de gouvernance des données appropriées sont obligatoires pour prévenir et atténuer les biais discriminatoires.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 10.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">3. Documentation technique</h3>
                  <p><span className="font-semibold">Description :</span> Une documentation complète doit être créée avant la mise sur le marché. Elle doit détailler le fonctionnement du système, ses capacités, ses limites et les processus de développement afin de permettre aux autorités d'évaluer sa conformité.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 11.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">4. Tenue de registres (Journaux)</h3>
                  <p><span className="font-semibold">Description :</span> Le système doit être capable d'enregistrer automatiquement les événements ("logs") pendant son fonctionnement pour garantir la traçabilité des résultats et faciliter le suivi et les audits post-commercialisation.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 12.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">5. Transparence et fourniture d'informations aux utilisateurs</h3>
                  <p><span className="font-semibold">Description :</span> Le système doit être suffisamment transparent pour que les utilisateurs (déployeurs) puissent en comprendre le fonctionnement. Il doit être accompagné d'une notice d'utilisation claire et complète.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 13.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">6. Contrôle humain</h3>
                  <p><span className="font-semibold">Description :</span> Le système doit être conçu pour pouvoir être contrôlé efficacement par des humains. Ceux-ci doivent être en mesure de comprendre les sorties du système, de décider de ne pas les utiliser, d'ignorer ou d'annuler une décision, ou d'arrêter le système.</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 14.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">7. Exactitude, robustesse et cybersécurité</h3>
                  <p><span className="font-semibold">Description :</span> Le système doit atteindre un niveau approprié d'exactitude, être résilient aux erreurs ou aux incohérences, et être protégé contre les vulnérabilités et les attaques malveillantes (cybersécurité).</p>
                  <p><span className="font-semibold">Article de référence :</span> Article 15.</p>
                </div>
              </div>
            )}
          </div>
        </section>
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