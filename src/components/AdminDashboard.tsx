import React, { useEffect, useState } from 'react'
import { supabasePublic } from '../lib/supabasePublic'

interface DashboardStats {
  totalActus: number
  totalDocs: number
  totalDoctrine: number
  totalQuestions: number
  todayAssistantQuestions: number
}

interface AdminDashboardProps {
  onActionSelect: (action: string) => void
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onActionSelect }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalActus: 0,
    totalDocs: 0,
    totalDoctrine: 0,
    totalQuestions: 0,
    todayAssistantQuestions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Date du jour à minuit (début de journée)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayISO = today.toISOString()

        // Récupérer les statistiques depuis Supabase
        const [actusRes, docsRes, doctrineRes, questionsRes, assistantTodayRes] = await Promise.all([
          supabasePublic.from('Actu').select('id', { count: 'exact', head: true }),
          supabasePublic.from('docs').select('id', { count: 'exact', head: true }),
          supabasePublic.from('Doctrine').select('id', { count: 'exact', head: true }),
          supabasePublic.from('questions').select('Id', { count: 'exact', head: true }),
          // Questions posées aujourd'hui seulement
          supabasePublic.from('assistant_ria').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
        ])

        setStats({
          totalActus: actusRes.count || 0,
          totalDocs: docsRes.count || 0,
          totalDoctrine: doctrineRes.count || 0,
          totalQuestions: questionsRes.count || 0,
          todayAssistantQuestions: assistantTodayRes.count || 0,
        })
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

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

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {/* Actualités */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">📰</span>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-200 px-1.5 py-0.5 rounded-full">Actus</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{stats.totalActus}</p>
          <p className="text-blue-600 text-[10px]">Actualités</p>
        </div>

        {/* Documents */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">📄</span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-200 px-1.5 py-0.5 rounded-full">Docs</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{stats.totalDocs}</p>
          <p className="text-emerald-600 text-[10px]">Documents</p>
        </div>

        {/* Doctrine */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">📚</span>
            <span className="text-[10px] font-medium text-purple-600 bg-purple-200 px-1.5 py-0.5 rounded-full">Doctrine</span>
          </div>
          <p className="text-xl font-bold text-purple-700">{stats.totalDoctrine}</p>
          <p className="text-purple-600 text-[10px]">Articles</p>
        </div>

        {/* Questions Quiz */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">❓</span>
            <span className="text-[10px] font-medium text-rose-600 bg-rose-200 px-1.5 py-0.5 rounded-full">Quiz</span>
          </div>
          <p className="text-xl font-bold text-rose-700">{stats.totalQuestions}</p>
          <p className="text-rose-600 text-[10px]">Questions</p>
        </div>
      </div>

      {/* Statistique Assistant RIA - Aujourd'hui */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-xs font-medium">Assistant RIA</p>
            <p className="text-2xl font-bold">{stats.todayAssistantQuestions}</p>
            <p className="text-indigo-200 text-xs">Questions aujourd'hui</p>
          </div>
          <div className="text-4xl opacity-30">🤖</div>
        </div>
      </div>

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
