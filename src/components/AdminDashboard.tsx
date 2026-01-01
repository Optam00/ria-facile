import React, { useEffect, useState } from 'react'
import { supabasePublic } from '../lib/supabasePublic'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface DashboardStats {
  totalActus: number
  totalDocs: number
  totalDoctrine: number
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

interface AdherentEvolution {
  date: string
  total_adherents: number
  new_adherents: number
}

interface ContentActivity {
  month: string
  actus_count: number
  docs_count: number
  doctrine_count: number
  questions_count: number
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
  const [adherentEvolution, setAdherentEvolution] = useState<AdherentEvolution[]>([])
  const [contentActivity, setContentActivity] = useState<ContentActivity[]>([])
  const [topDownloads, setTopDownloads] = useState<TopDownload[]>([])
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')
  const [assistantQuestions7Days, setAssistantQuestions7Days] = useState<{ date: string; count: number }[]>([])

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
        const [actusRes, docsRes, doctrineRes, questionsRes, assistantRes] = await Promise.all([
          supabasePublic.from('Actu').select('id', { count: 'exact', head: true }).gte('Date', startDateISO),
          supabasePublic.from('docs').select('id', { count: 'exact', head: true }).gte('date', startDateISO),
          supabasePublic.from('Doctrine').select('id', { count: 'exact', head: true }).gte('date', startDateISO),
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

        // Évolution des adhérents selon le filtre
        try {
          let daysCount = 30
          if (timeFilter === 'today') daysCount = 1
          else if (timeFilter === 'week') daysCount = 7
          else if (timeFilter === 'month') daysCount = 30
          else if (timeFilter === 'year') daysCount = 365
          
          const evolutionUrl = `${supabaseUrl}/rest/v1/rpc/get_adherents_evolution?days_count=${daysCount}`
          const evolutionResponse = await fetch(evolutionUrl, { 
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ days_count: daysCount })
          })
          if (evolutionResponse.ok) {
            const data = await evolutionResponse.json()
            setAdherentEvolution(Array.isArray(data) ? data : [])
          }
        } catch (e) {
          console.warn('Erreur lors du chargement de l\'évolution des adhérents:', e)
        }

        // Activité du contenu selon le filtre
        try {
          let monthsCount = 6
          if (timeFilter === 'today' || timeFilter === 'week') monthsCount = 1
          else if (timeFilter === 'month') monthsCount = 3
          else if (timeFilter === 'year') monthsCount = 12
          
          const activityUrl = `${supabaseUrl}/rest/v1/rpc/get_content_activity`
          const activityResponse = await fetch(activityUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ months_count: monthsCount })
          })
          if (activityResponse.ok) {
            const data = await activityResponse.json()
            setContentActivity(Array.isArray(data) ? data : [])
          }
        } catch (e) {
          console.warn('Erreur lors du chargement de l\'activité du contenu:', e)
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

        // Questions assistant RIA selon le filtre temporel
        try {
          const questionsUrl = `${supabaseUrl}/rest/v1/assistant_ria?select=created_at&created_at=gte.${startDateISO}&order=created_at.asc`
          const questionsResponse = await fetch(questionsUrl, { headers })
          if (questionsResponse.ok) {
            const data = await questionsResponse.json()
            // Grouper par jour ou par mois selon le filtre
            const grouped = (Array.isArray(data) ? data : []).reduce((acc: any, item: any) => {
              let date: string
              if (timeFilter === 'today' || timeFilter === 'week') {
                date = new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
              } else if (timeFilter === 'month') {
                date = new Date(item.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
              } else {
                date = new Date(item.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
              }
              acc[date] = (acc[date] || 0) + 1
              return acc
            }, {})
            setAssistantQuestions7Days(Object.entries(grouped).map(([date, count]) => ({ date, count: count as number })))
          }
        } catch (e) {
          console.warn('Erreur lors du chargement des questions assistant:', e)
        }


        setStats({
          totalActus: actusRes.count || 0,
          totalDocs: docsRes.count || 0,
          totalDoctrine: doctrineRes.count || 0,
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
      {/* En-tête avec filtre temporel */}
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre contenu RIA Facile</p>
      </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'year'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                timeFilter === filter
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'today' ? "Aujourd'hui" : filter === 'week' ? 'Semaine' : filter === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
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
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onActionSelect('consulter-adherents')}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs font-medium">Total adhérents</p>
              <p className="text-3xl font-bold">{stats.totalAdherents}</p>
              <div className="flex items-center gap-1 mt-1">
              <p className="text-indigo-200 text-xs">Membres inscrits</p>
                {adherentTrend.value > 0 && (
                  <span className={`text-xs ${adherentTrend.isPositive ? 'text-green-300' : 'text-red-300'}`}>
                    {adherentTrend.isPositive ? '↑' : '↓'} {adherentTrend.value.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <div className="text-4xl opacity-30">👥</div>
          </div>
        </button>

        <button
          onClick={() => onActionSelect('consulter-adherents')}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Nouveaux adhérents</p>
              <p className="text-3xl font-bold">+{stats.newAdherentsThisWeek}</p>
              <p className="text-emerald-200 text-xs">
                {timeFilter === 'today' ? "Aujourd'hui" : 
                 timeFilter === 'week' ? 'Cette semaine' : 
                 timeFilter === 'month' ? 'Ce mois' : 
                 'Cette année'}
              </p>
            </div>
            <div className="text-4xl opacity-30">📈</div>
          </div>
        </button>
      </div>

      {/* Graphique évolution des adhérents */}
      {adherentEvolution.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Évolution des adhérents (30 jours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={adherentEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="total_adherents" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cartes de statistiques contenu */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        <button
          onClick={() => onActionSelect('consulter-actus')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:scale-[1.02] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">📰</span>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-200 px-1.5 py-0.5 rounded-full">Actus</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{stats.totalActus}</p>
          <p className="text-blue-600 text-[10px]">Actualités</p>
        </button>

        <button
          onClick={() => onActionSelect('consulter-docs')}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:scale-[1.02] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">📄</span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-200 px-1.5 py-0.5 rounded-full">Docs</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{stats.totalDocs}</p>
          <p className="text-emerald-600 text-[10px]">Documents</p>
        </button>

        <button
          onClick={() => onActionSelect('consulter-doctrine')}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 hover:scale-[1.02] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">📚</span>
            <span className="text-[10px] font-medium text-purple-600 bg-purple-200 px-1.5 py-0.5 rounded-full">Doctrine</span>
          </div>
          <p className="text-xl font-bold text-purple-700">{stats.totalDoctrine}</p>
          <p className="text-purple-600 text-[10px]">Articles</p>
        </button>

        <button
          onClick={() => onActionSelect('consulter-questions')}
          className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3 border border-rose-200 shadow-sm hover:shadow-md hover:border-rose-300 hover:scale-[1.02] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">❓</span>
            <span className="text-[10px] font-medium text-rose-600 bg-rose-200 px-1.5 py-0.5 rounded-full">Quiz</span>
          </div>
          <p className="text-xl font-bold text-rose-700">{stats.totalQuestions}</p>
          <p className="text-rose-600 text-[10px]">Questions</p>
        </button>
      </div>

      {/* Graphique activité du contenu */}
      {contentActivity.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Activité du contenu (6 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={contentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="actus_count" stackId="a" fill="#3b82f6" name="Actus" />
              <Bar dataKey="docs_count" stackId="a" fill="#10b981" name="Docs" />
              <Bar dataKey="doctrine_count" stackId="a" fill="#8b5cf6" name="Doctrine" />
              <Bar dataKey="questions_count" stackId="a" fill="#f43f5e" name="Questions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Adhérents actifs</p>
          <p className="text-2xl font-bold text-gray-800">{stats.activeAdherents}</p>
          <p className="text-xs text-gray-500 mt-1">
            {timeFilter === 'today' ? "Aujourd'hui" : 
             timeFilter === 'week' ? '7 derniers jours' : 
             timeFilter === 'month' ? '30 derniers jours' : 
             '365 derniers jours'}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Téléchargements</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalDownloads}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
      </div>
        <button
          onClick={() => onActionSelect('consulter-assistant-ria')}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer text-left"
        >
          <p className="text-xs text-indigo-100 mb-1">Assistant RIA</p>
            <p className="text-2xl font-bold">{stats.todayAssistantQuestions}</p>
          <p className="text-xs text-indigo-200 mt-1">Questions aujourd'hui</p>
        </button>
        {assistantQuestions7Days.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Questions (7j)</p>
            <p className="text-2xl font-bold text-gray-800">
              {assistantQuestions7Days.reduce((sum, d) => sum + d.count, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cette semaine</p>
          </div>
        )}
      </div>

      {/* Graphique questions assistant RIA */}
      {assistantQuestions7Days.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Questions Assistant RIA (7 jours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={assistantQuestions7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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

      {/* Raccourcis rapides */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <span>⚡</span> Actions rapides
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onActionSelect('ajouter-actualite')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">➕</span>
            <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">Actu</span>
          </button>
          <button
            onClick={() => onActionSelect('ajouter-document')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">📎</span>
            <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">Doc</span>
          </button>
          <button
            onClick={() => onActionSelect('ajouter-article-doctrine')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">✍️</span>
            <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">Doctrine</span>
          </button>
          <button
            onClick={() => onActionSelect('consulter-assistant-ria')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
            <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">Assistant</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
