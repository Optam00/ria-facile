import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { supabasePublic } from '../lib/supabasePublic'

type LinkedInPostRow = {
  id: number
  embed_input: string
  created_at: string
}

const getLinkedInEmbedUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null

  // Si l'admin colle directement un <iframe ...>, on extrait le src
  const iframeSrcMatch = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)
  if (iframeSrcMatch && iframeSrcMatch[1]) return iframeSrcMatch[1]

  try {
    const parsed = new URL(raw)
    if (parsed.hostname === 'www.linkedin.com' && parsed.pathname.startsWith('/embed/feed/update')) return raw

    // URL de type ...activity-<id>-...
    const activityMatch = parsed.pathname.match(/activity-(\d+)-/)
    if (activityMatch?.[1]) {
      const id = activityMatch[1]
      return `https://www.linkedin.com/embed/feed/update/urn:li:share:${id}`
    }

    // Fallback: on récupère un gros identifiant numérique dans le chemin
    const genericIdMatch = parsed.pathname.match(/-(\d+)(?:\/|$)/)
    if (genericIdMatch?.[1]) {
      const id = genericIdMatch[1]
      return `https://www.linkedin.com/embed/feed/update/urn:li:share:${id}`
    }

    return null
  } catch {
    return null
  }
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

export const LinkedInPostsPage = () => {
  const [posts, setPosts] = useState<LinkedInPostRow[]>([])
  const [featuredFallback, setFeaturedFallback] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1) Table historique
        const { data: postsData, error: postsError } = await supabasePublic
          .from('homepage_linkedin_posts')
          .select('id, embed_input, created_at')
          .order('created_at', { ascending: false })

        if (!postsError && Array.isArray(postsData) && postsData.length > 0) {
          if (isMounted) setPosts(postsData as LinkedInPostRow[])
          return
        }

        // 2) Fallback: ancienne table "homepage_settings"
        const { data: settingsData, error: settingsError } = await supabasePublic
          .from('homepage_settings')
          .select('linkedin_post_url')
          .eq('id', 1)
          .maybeSingle()

        if (!settingsError) {
          const raw = settingsData?.linkedin_post_url ?? null
          if (raw && isMounted) {
            setFeaturedFallback(raw)
            setPosts([
              {
                id: 1,
                embed_input: raw,
                created_at: new Date().toISOString(),
              },
            ])
          }
        } else if (settingsError) {
          throw settingsError
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des posts LinkedIn.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPosts()
    return () => {
      isMounted = false
    }
  }, [])

  const heading = useMemo(() => {
    if (featuredFallback) return 'Posts LinkedIn (1 post configuré)'
    return 'Posts LinkedIn partagés sur le site'
  }, [featuredFallback])

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>RIA Facile - Posts LinkedIn</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#774792]">LinkedIn</h1>
            <p className="text-gray-600 mt-2">Découvrez les posts LinkedIn déjà partagés sur RIA Facile.</p>
          </div>
          <div className="text-sm">
            <Link to="/" className="text-[#774792] font-semibold hover:underline">
              ← Retour accueil
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow p-6 text-sm text-gray-500">Chargement…</div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow p-6 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-6 text-sm text-gray-600">
            Aucun post LinkedIn partagé pour le moment.
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">{heading}</h2>

            {posts.map((p) => {
              const embedUrl = getLinkedInEmbedUrl(p.embed_input)
              const canOpenDirectUrl = p.embed_input.startsWith('http')
              return (
                <div key={p.id} className="bg-white rounded-3xl shadow overflow-hidden border border-gray-50">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Ajouté le {formatDate(p.created_at)}</div>
                      <div className="text-lg font-semibold text-gray-800">Post LinkedIn</div>
                    </div>
                    {canOpenDirectUrl ? (
                      <a
                        href={p.embed_input}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#774792] hover:underline whitespace-nowrap mt-0.5"
                      >
                        Voir le post ↗
                      </a>
                    ) : null}
                  </div>
                  <div className="p-6">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-[360px] md:h-[430px]"
                        loading="lazy"
                        frameBorder="0"
                        allowFullScreen
                        title="Post LinkedIn RIA Facile"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">
                        Impossible d&apos;afficher l&apos;intégration pour ce lien. Consultez directement sur LinkedIn.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

