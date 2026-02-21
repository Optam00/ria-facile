import React, { useEffect, useState } from 'react'
import { UserGroupIcon, LinkIcon } from '@heroicons/react/24/outline'
import { supabasePublic } from '../lib/supabasePublic'
import { useAuth } from '../contexts/AuthContext'

interface DashboardStats {
  totalActus: number
  totalDocs: number
  totalDoctrine: number
  totalFichesPratiques: number
  totalQuestions: number
  todayAssistantQuestions: number
  totalAdherents: number
  newAdherentsThisWeek: number
  previousWeekAdherents: number
  activeAdherents: number
  totalDownloads: number
  pendingDeletionRequests: number
  unansweredQuestions: number
}

interface TopDownload {
  file_name: string
  download_count: number
}

interface AdminDashboardProps {
  onActionSelect: (action: string) => void
}

type TimeFilter = 'today' | 'week' | 'month' | 'year'

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onActionSelect }) => {
  const { session } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalActus: 0,
    totalDocs: 0,
    totalDoctrine: 0,
    totalFichesPratiques: 0,
    totalQuestions: 0,
    todayAssistantQuestions: 0,
    totalAdherents: 0,
    newAdherentsThisWeek: 0,
    previousWeekAdherents: 0,
    activeAdherents: 0,
    totalDownloads: 0,
    pendingDeletionRequests: 0,
    unansweredQuestions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [topDownloads, setTopDownloads] = useState<TopDownload[]>([])
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayISO = today.toISOString()

        // Calculer les dates en fonction du filtre temporel
        let startDate = new Date()
        let previousPeriodStart = new Date()
        
        switch (timeFilter) {
          case 'today':
            startDate = new Date(today)
            previousPeriodStart = new Date(today)
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 1)
            break
          case 'week':
            startDate = new Date(today)
            startDate.setDate(startDate.getDate() - 7)
            previousPeriodStart = new Date(startDate)
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
            break
          case 'month':
            startDate = new Date(today)
            startDate.setMonth(startDate.getMonth() - 1)
            previousPeriodStart = new Date(startDate)
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
            break
          case 'year':
            startDate = new Date(today)
            startDate.setFullYear(startDate.getFullYear() - 1)
            previousPeriodStart = new Date(startDate)
            previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
            break
        }
        
        startDate.setHours(0, 0, 0, 0)
        previousPeriodStart.setHours(0, 0, 0, 0)
        
        const startDateISO = startDate.toISOString()
        const previousPeriodStartISO = previousPeriodStart.toISOString()

        // Pour la comparaison avec la période précédente (pour les tendances)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        oneWeekAgo.setHours(0, 0, 0, 0)
        const oneWeekAgoISO = oneWeekAgo.toISOString()

        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        twoWeeksAgo.setHours(0, 0, 0, 0)
        const twoWeeksAgoISO = twoWeeksAgo.toISOString()

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!session?.access_token || !supabaseUrl || !supabaseAnonKey) {
          setIsLoading(false)
          return
        }

        const headers = {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Accept': 'application/json',
          'Prefer': 'count=exact',
        }

        // Récupérer les statistiques de base (filtrées selon le filtre temporel)
        const [actusRes, docsRes, doctrineRes, fichesRes, questionsRes, assistantRes] = await Promise.all([
          supabasePublic.from('Actu').select('id', { count: 'exact', head: true }).gte('Date', startDateISO),
          supabasePublic.from('docs').select('id', { count: 'exact', head: true }).gte('date', startDateISO),
          supabasePublic.from('doctrine').select('id', { count: 'exact', head: true }).gte('date', startDateISO),
          supabasePublic.from('fiches_pratiques').select('id', { count: 'exact', head: true }).gte('created_at', startDateISO),
          supabasePublic.from('questions').select('Id', { count: 'exact', head: true }),
          supabasePublic.from('assistant_ria').select('id', { count: 'exact', head: true }).gte('created_at', startDateISO),
        ])

        // Compter les adhérents
        let totalAdherents = 0
        let newAdherentsThisWeek = 0
        let previousWeekAdherents = 0
        let activeAdherents = 0

        const totalUrl = `${supabaseUrl}/rest/v1/profiles?select=id&role=eq.adherent`
        const totalResponse = await fetch(totalUrl, { headers })
        if (totalResponse.ok) {
          const contentRange = totalResponse.headers.get('content-range')
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)$/)
            totalAdherents = match ? parseInt(match[1], 10) : 0
          }
        }

        // Nouveaux adhérents selon le filtre temporel
        const newUrl = `${supabaseUrl}/rest/v1/profiles?select=id&role=eq.adherent&created_at=gte.${startDateISO}`
        const newResponse = await fetch(newUrl, { headers })
        if (newResponse.ok) {
          const contentRange = newResponse.headers.get('content-range')
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)$/)
            newAdherentsThisWeek = match ? parseInt(match[1], 10) : 0
          }
        }

        // Période précédente pour la comparaison
        const prevUrl = `${supabaseUrl}/rest/v1/profiles?select=id&role=eq.adherent&created_at=gte.${previousPeriodStartISO}&created_at=lt.${startDateISO}`
        const prevResponse = await fetch(prevUrl, { headers })
        if (prevResponse.ok) {
          const contentRange = prevResponse.headers.get('content-range')
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)$/)
            previousWeekAdherents = match ? parseInt(match[1], 10) : 0
          }
        }

        // Adhérents actifs selon le filtre temporel (via fonction SQL)
        try {
          const activeUrl = `${supabaseUrl}/rest/v1/rpc/get_active_adherents`
          const activeResponse = await fetch(activeUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start_date: startDateISO })
          })
          if (activeResponse.ok) {
            const data = await activeResponse.json()
            activeAdherents = typeof data === 'number' ? data : (Array.isArray(data) && data.length > 0 ? data[0] : 0)
          }
        } catch (e) {
          console.warn('Erreur lors du chargement des adhérents actifs:', e)
          activeAdherents = 0
        }

        // Demandes de suppression en attente
        let pendingDeletionRequests = 0
        try {
          const deletionUrl = `${supabaseUrl}/rest/v1/deletion_requests?select=id&status=eq.pending`
          const deletionResponse = await fetch(deletionUrl, { headers })
          if (deletionResponse.ok) {
            const contentRange = deletionResponse.headers.get('content-range')
            if (contentRange) {
              const match = contentRange.match(/\/(\d+)$/)
              pendingDeletionRequests = match ? parseInt(match[1], 10) : 0
            } else {
              const data = await deletionResponse.json()
              pendingDeletionRequests = Array.isArray(data) ? data.length : 0
            }
          }
        } catch (e) {
          console.warn('Erreur lors du chargement des demandes de suppression:', e)
        }

        // Questions non répondues (plus de 24h)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        let unansweredQuestions = 0
        try {
          const unansweredUrl = `${supabaseUrl}/rest/v1/assistant_ria?select=id&created_at=lt.${yesterday.toISOString()}`
          const unansweredResponse = await fetch(unansweredUrl, { headers })
          if (unansweredResponse.ok) {
            const contentRange = unansweredResponse.headers.get('content-range')
            if (contentRange) {
              const match = contentRange.match(/\/(\d+)$/)
              unansweredQuestions = match ? parseInt(match[1], 10) : 0
            }
          }
        } catch (e) {
          console.warn('Erreur lors du chargement des questions non répondues:', e)
        }

        // Téléchargements selon le filtre temporel
        let totalDownloads = 0
        try {
          const downloadsUrl = `${supabaseUrl}/rest/v1/file_downloads?select=id&downloaded_at=gte.${startDateISO}`
          const downloadsResponse = await fetch(downloadsUrl, { headers })
          if (downloadsResponse.ok) {
            const contentRange = downloadsResponse.headers.get('content-range')
            if (contentRange) {
              const match = contentRange.match(/\/(\d+)$/)
              totalDownloads = match ? parseInt(match[1], 10) : 0
            }
          }
        } catch (e) {
          console.warn('Erreur lors du chargement des téléchargements:', e)
        }

        // Top téléchargements
        try {
          const topDownloadsUrl = `${supabaseUrl}/rest/v1/rpc/get_file_download_stats`
          const topDownloadsResponse = await fetch(topDownloadsUrl, { headers })
          if (topDownloadsResponse.ok) {
            const data = await topDownloadsResponse.json()
            setTopDownloads(Array.isArray(data) ? data.slice(0, 5) : [])
          }
        } catch (e) {
          console.warn('Erreur lors du chargement des top téléchargements:', e)
        }

        setStats({
          totalActus: actusRes.count || 0,
          totalDocs: docsRes.count || 0,
          totalDoctrine: doctrineRes.count || 0,
          totalFichesPratiques: fichesRes.count || 0,
          totalQuestions: questionsRes.count || 0,
          todayAssistantQuestions: assistantRes.count || 0,
          totalAdherents,
          newAdherentsThisWeek,
          previousWeekAdherents,
          activeAdherents,
          totalDownloads,
          pendingDeletionRequests,
          unansweredQuestions,
        })
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
    fetchStats()
    }
  }, [session, timeFilter])

  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current > 0 }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  const adherentTrend = calculateTrend(stats.newAdherentsThisWeek, stats.previousWeekAdherents)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre contenu RIA Facile</p>
      </div>

      {/* Widget d'alertes */}
      {(stats.pendingDeletionRequests > 0 || stats.unansweredQuestions > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <span>⚠️</span> Alertes
          </h3>
          <div className="space-y-2">
            {stats.pendingDeletionRequests > 0 && (
              <button
                onClick={() => onActionSelect('demandes-suppression')}
                className="w-full text-left p-2 bg-white rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <span className="text-sm text-yellow-800">
                  {stats.pendingDeletionRequests} demande{stats.pendingDeletionRequests > 1 ? 's' : ''} de suppression en attente
                </span>
              </button>
            )}
            {stats.unansweredQuestions > 0 && (
              <button
                onClick={() => onActionSelect('consulter-assistant-ria')}
                className="w-full text-left p-2 bg-white rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <span className="text-sm text-yellow-800">
                  {stats.unansweredQuestions} question{stats.unansweredQuestions > 1 ? 's' : ''} non répondue{stats.unansweredQuestions > 1 ? 's' : ''} (plus de 24h)
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Statistiques Adhérents avec tendances */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onActionSelect('consulter-adherents')}
          className="bg-[#774792] rounded-lg p-3 text-white shadow-sm hover:opacity-95 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-[11px] font-medium">Total adhérents</p>
              <p className="text-2xl font-bold">{stats.totalAdherents}</p>
              <div className="flex items-center gap-1 mt-0.5">
              <p className="text-white/60 text-[11px]">Membres inscrits</p>
                {adherentTrend.value > 0 && (
                  <span className={`text-[11px] ${adherentTrend.isPositive ? 'text-green-300' : 'text-red-300'}`}>
                    {adherentTrend.isPositive ? '↑' : '↓'} {adherentTrend.value.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <UserGroupIcon className="w-8 h-8 text-white shrink-0" strokeWidth={1.5} />
          </div>
        </button>

        <button
          onClick={() => onActionSelect('veille')}
          className="bg-[#774792] rounded-lg p-3 text-white shadow-sm hover:opacity-95 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Veille et liens utiles</p>
            </div>
            <LinkIcon className="w-8 h-8 text-white shrink-0" strokeWidth={1.5} />
          </div>
        </button>
      </div>

      {/* Raccourcis rapides */}
      <div>
        <h3 className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
          <span className="text-sm">⚡</span> Actions rapides
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => onActionSelect('ajouter-actualite')}
            className="flex flex-col items-center gap-0.5 p-1.5 bg-[#f3f1ff] rounded-md border border-[#e0dcf7] hover:bg-[#e8e5ff] transition-all"
          >
            <span className="text-sm font-bold">➕</span>
            <span className="text-[10px] text-gray-800 font-bold text-center leading-tight">Actu</span>
          </button>
          <button
            onClick={() => onActionSelect('ajouter-document')}
            className="flex flex-col items-center gap-0.5 p-1.5 bg-[#f3f1ff] rounded-md border border-[#e0dcf7] hover:bg-[#e8e5ff] transition-all"
          >
            <span className="text-sm font-bold">📎</span>
            <span className="text-[10px] text-gray-800 font-bold text-center leading-tight">Doc</span>
          </button>
          <button
            onClick={() => onActionSelect('ajouter-article-doctrine')}
            className="flex flex-col items-center gap-0.5 p-1.5 bg-[#f3f1ff] rounded-md border border-[#e0dcf7] hover:bg-[#e8e5ff] transition-all"
          >
            <span className="text-sm font-bold">✍️</span>
            <span className="text-[10px] text-gray-800 font-bold text-center leading-tight">Doctrine</span>
          </button>
          <button
            onClick={() => onActionSelect('ajouter-fiche-pratique')}
            className="flex flex-col items-center gap-0.5 p-1.5 bg-[#f3f1ff] rounded-md border border-[#e0dcf7] hover:bg-[#e8e5ff] transition-all"
          >
            <span className="text-sm font-bold">📋</span>
            <span className="text-[10px] text-gray-800 font-bold text-center leading-tight">Fiche</span>
          </button>
          <button
            onClick={() => onActionSelect('enrichir-article')}
            className="flex flex-col items-center gap-0.5 p-1.5 bg-[#f3f1ff] rounded-md border border-[#e0dcf7] hover:bg-[#e8e5ff] transition-all"
          >
            <span className="text-sm font-bold">✨</span>
            <span className="text-[10px] text-gray-800 font-bold text-center leading-tight">Enrichir un article</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h3 className="text-xs font-semibold text-gray-600 flex items-center gap-1">
            <span className="text-sm">📊</span> Statistiques
          </h3>
          <div className="flex items-center gap-1">
            {(['today', 'week', 'month', 'year'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                  timeFilter === filter
                    ? 'bg-[#774792] text-white font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium'
                }`}
              >
                {filter === 'today' ? "Aujourd'hui" : filter === 'week' ? 'Semaine' : filter === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onActionSelect('consulter-actus')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.totalActus}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Actualités</p>
          </button>

          <button
            onClick={() => onActionSelect('consulter-docs')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.totalDocs}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Documents</p>
          </button>

          <button
            onClick={() => onActionSelect('consulter-doctrine')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.totalDoctrine}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Articles doctrine</p>
          </button>

          <button
            onClick={() => onActionSelect('consulter-fiches-pratiques')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.totalFichesPratiques}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Fiches pratiques</p>
          </button>

          <button
            onClick={() => onActionSelect('consulter-questions')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.totalQuestions}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Questions quiz</p>
          </button>

          <button
            type="button"
            onClick={() => onActionSelect('consulter-adherents')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.activeAdherents}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Adhérents actifs · {timeFilter === 'today' ? "jour" : timeFilter === 'week' ? '7j' : timeFilter === 'month' ? '30j' : 'an'}</p>
          </button>

          <button
            type="button"
            onClick={() => onActionSelect('gestion-fichiers')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.totalDownloads}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Téléchargements</p>
          </button>

          <button
            onClick={() => onActionSelect('consulter-assistant-ria')}
            className="bg-[#fffca8]/20 rounded-lg p-2.5 border border-amber-200/90 shadow-sm hover:bg-[#fffca8]/30 transition-all cursor-pointer text-center flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold text-gray-800">{stats.todayAssistantQuestions}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Questions assistant</p>
          </button>
        </div>
      </div>

      {/* Top téléchargements */}
      {topDownloads.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Fichiers les plus téléchargés</h3>
          <div className="space-y-2">
            {topDownloads.map((file, index) => (
              <div key={file.file_name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="text-sm text-gray-700 truncate">{file.file_name}</span>
                </div>
                <span className="text-sm font-semibold text-indigo-600">{file.download_count}</span>
              </div>
            ))}
        </div>
      </div>
      )}
    </div>
  )
}

export default AdminDashboard
