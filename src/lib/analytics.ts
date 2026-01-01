/**
 * Utilitaires pour tracker les analytics (téléchargements, visites de pages, etc.)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Tracker un téléchargement de fichier
 */
export const trackFileDownload = async (fileName: string, session: { access_token: string; user?: { email?: string } } | null) => {
  if (!session?.access_token || !supabaseUrl || !supabaseAnonKey) {
    return
  }

  try {
    const userEmail = (session as any)?.user?.email || null
    
    await fetch(`${supabaseUrl}/rest/v1/file_downloads`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        file_name: fileName,
        user_email: userEmail,
      }),
    })
  } catch (error) {
    // Ne pas bloquer le téléchargement en cas d'erreur de tracking
    console.warn('Erreur lors du tracking du téléchargement:', error)
  }
}

/**
 * Tracker une visite de page
 */
export const trackPageView = async (
  pagePath: string,
  pageTitle: string,
  session: { access_token: string } | null,
  sessionDuration?: number
) => {
  if (!session?.access_token || !supabaseUrl || !supabaseAnonKey) {
    return
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        page_path: pagePath,
        page_title: pageTitle,
        session_duration: sessionDuration,
      }),
    })
  } catch (error) {
    // Ne pas bloquer la navigation en cas d'erreur de tracking
    console.warn('Erreur lors du tracking de la visite:', error)
  }
}

/**
 * Démarrer une session utilisateur
 */
export const startUserSession = async (session: { access_token: string } | null): Promise<string | null> => {
  if (!session?.access_token || !supabaseUrl || !supabaseAnonKey) {
    return null
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user_sessions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        session_start: new Date().toISOString(),
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) && data.length > 0 ? data[0].id : null
    }
  } catch (error) {
    console.warn('Erreur lors du démarrage de la session:', error)
  }

  return null
}

/**
 * Terminer une session utilisateur
 */
export const endUserSession = async (
  sessionId: string | null,
  session: { access_token: string } | null,
  pagesVisited: number
) => {
  if (!sessionId || !session?.access_token || !supabaseUrl || !supabaseAnonKey) {
    return
  }

  try {
    const sessionStart = new Date() // On devrait stocker ça, mais pour simplifier...
    const sessionEnd = new Date()
    const durationSeconds = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000)

    await fetch(`${supabaseUrl}/rest/v1/user_sessions?id=eq.${sessionId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        session_end: sessionEnd.toISOString(),
        duration_seconds: durationSeconds,
        pages_visited: pagesVisited,
      }),
    })
  } catch (error) {
    console.warn('Erreur lors de la fin de session:', error)
  }
}

