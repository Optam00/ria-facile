import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import ImageLightbox from '../components/ImageLightbox'
import { useAuth } from '../contexts/AuthContext'

interface RiaSchema {
  id: number
  title: string
  image_url: string
  position: number
}

export const SchemasPage = () => {
  const [schemas, setSchemas] = useState<RiaSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sommaireOuvert, setSommaireOuvert] = useState(false)
  const location = useLocation()
  const { session, loading: authLoading, isAdherent, isAdmin } = useAuth()
  const isMember = isAdherent() || isAdmin()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      if (cancelled) return
      controller.abort()
      setError('Chargement trop long. Vérifiez votre connexion.')
      setLoading(false)
    }, 15000)

    const fetchSchemas = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Configuration Supabase manquante (URL ou clé anon).')
        }

        const baseUrl = `${supabaseUrl}/rest/v1/ria_schemas?select=id,title,image_url,position&published=eq.true&order=position.asc`
        const headers: Record<string, string> = {
          apikey: supabaseAnonKey,
        }
        if (!authLoading && session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`
        }

        const res = await fetch(baseUrl, {
          method: 'GET',
          headers,
          signal: controller.signal,
        })

        if (cancelled) return
        clearTimeout(timeoutId)

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Erreur Supabase (${res.status})`)
        }

        const data = await res.json()
        if (cancelled) return
        setSchemas(Array.isArray(data) ? data : [])
      } catch (e) {
        if (cancelled) return
        console.error('Erreur chargement schémas:', e)
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          setError('Impossible de charger les schémas.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSchemas()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [session?.access_token, authLoading])

  const schemaRefsMap = useMemo(() => {
    const refs: Record<number, React.RefObject<HTMLDivElement>> = {}
    for (let i = 0; i < schemas.length; i++) {
      refs[i] = React.createRef<HTMLDivElement>()
    }
    return refs
  }, [schemas.length])

  const generateId = (_title: string, index: number) => `schema-${index + 1}`

  useEffect(() => {
    if (!location.hash || schemas.length === 0) return
    const id = location.hash.replace('#', '')
    const index = parseInt(id.replace('schema-', ''), 10) - 1
    if (index >= 0 && index < schemas.length && schemaRefsMap[index]?.current) {
      setTimeout(() => {
        schemaRefsMap[index].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [location, schemas.length, schemaRefsMap])

  const schemaImages = schemas.map((s) => ({
    src: s.image_url,
    alt: `Schéma explicatif : ${s.title} - Règlement européen sur l'intelligence artificielle (AI Act) - RIA Facile`,
  }))

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  const closeLightbox = () => setLightboxOpen(false)
  const prevLightbox = () => setLightboxIndex((i) => (i > 0 ? i - 1 : i))
  const nextLightbox = () => setLightboxIndex((i) => (i < schemaImages.length - 1 ? i + 1 : i))

  const count = schemas.length
  const metaDescription = count
    ? `${count} schéma${count > 1 ? 's' : ''} et infographies pour comprendre le Règlement IA (AI Act) : calendrier d'application, niveaux de risques, obligations des systèmes d'IA, gouvernance, sanctions.`
    : 'Schémas et infographies pour comprendre le Règlement IA (AI Act).'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Le RIA en schémas - RIA Facile',
    description: metaDescription,
    url: 'https://ria-facile.com/schemas',
    inLanguage: 'fr-FR',
    about: { '@type': 'Thing', name: "Règlement européen sur l'intelligence artificielle", alternateName: 'AI Act' },
    image: schemas.map((s) => ({
      '@type': 'ImageObject',
      url: s.image_url,
      name: s.title,
      description: `Schéma explicatif : ${s.title} - Règlement IA (AI Act)`,
    })),
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" aria-hidden />
        <p className="text-gray-600">Chargement des schémas…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`Le RIA en schémas - ${count} infographies explicatives du Règlement IA | RIA Facile`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content="Règlement IA, AI Act, schémas RIA, infographies intelligence artificielle, visualisation règlement IA" />
        <meta property="og:title" content={`Le RIA en schémas - ${count} infographies explicatives du Règlement IA`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ria-facile.com/schemas" />
        <link rel="canonical" href="https://ria-facile.com/schemas" />
        {schemas[0] && <meta property="og:image" content={schemas[0].image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Le RIA en schémas - ${count} infographies`} />
        <meta name="twitter:description" content={metaDescription} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

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

      {!isMember && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-gray-700 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="inline-flex items-center text-purple-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
              Certains schémas supplémentaires sont réservés aux adhérents.
            </span>
            <a
              href="/inscription"
              className="inline-flex items-center text-purple-700 hover:text-purple-900 text-sm font-semibold underline-offset-2 hover:underline"
            >
              Devenez adhérent pour y accéder.
            </a>
          </div>
        </div>
      )}

      {schemas.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
          Aucun schéma pour le moment.
        </div>
      ) : (
        <>
          <section className="mt-8 mb-8">
            <div className="max-w-3xl mx-auto p-3 rounded-xl shadow border border-violet-200 bg-violet-50/80">
              <button
                className="w-full flex items-center justify-between gap-2 text-violet-700 font-extrabold text-lg md:text-xl px-2 py-2 focus:outline-none select-none"
                onClick={() => setSommaireOuvert((v) => !v)}
                aria-expanded={sommaireOuvert}
                aria-controls="sommaire-list"
              >
                <span className="flex items-center gap-2">Sommaire des schémas</span>
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
                  {schemas.map((schema, index) => (
                    <li key={schema.id}>
                      <a
                        href={`#${generateId(schema.title, index)}`}
                        className="flex items-center gap-2 text-violet-700 font-medium rounded px-2 py-1 transition-all hover:bg-violet-100 hover:underline"
                      >
                        <span className="inline-block w-2 h-2 bg-violet-400 rounded-full" />
                        {schema.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 pb-16">
            {schemas.map((schema, index) => {
              const id = generateId(schema.title, index)
              return (
                <section key={schema.id} className="mb-12" ref={schemaRefsMap[index]} id={id}>
                  <div className="white-container rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">{schema.title}</h2>
                    <img
                      src={schema.image_url}
                      alt={`Schéma explicatif : ${schema.title} - Règlement européen sur l'intelligence artificielle (AI Act) - RIA Facile`}
                      className="mx-auto rounded-xl shadow-md w-full max-w-full sm:max-w-3xl h-auto mb-8 cursor-zoom-in transition hover:scale-105"
                      onClick={() => openLightbox(index)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Agrandir le schéma : ${schema.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') openLightbox(index)
                      }}
                    />
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}

      {lightboxOpen && schemaImages.length > 0 && (
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

export default SchemasPage
