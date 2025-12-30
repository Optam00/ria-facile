import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabasePublic } from '../lib/supabasePublic'
import { supabase } from '../lib/supabase'
import AdminDashboard from '../components/AdminDashboard'

type AdminAction = 'ajouter-actualite' | 'consulter-actus' | 'ajouter-article-doctrine' | 'consulter-doctrine' | 'ajouter-document' | 'consulter-docs' | 'enrichir-article' | 'ajouter-question' | 'consulter-questions' | 'consulter-assistant-ria' | 'consulter-adherents' | 'supprimer-adherent' | 'gestion-fichiers' | 'demandes-suppression' | null

interface Actualite {
  id: number
  Titre: string
  Date: string
  media: string
  lien: string
}

interface Doc {
  id: number
  titre: string
  auteur: string
  lien: string
  date: string
  resume: string
  themes: string
  langue: string
}

interface DoctrineArticle {
  id: number
  titre: string
  date: string
  abstract: string
  intro: string
  titre1: string
  'sous-titre1': string
  contenu1: string
  'sous-titre2': string
  contenu2: string
  titre2: string
  'sous-titre3': string
  contenu3: string
  'sous-titre4': string
  contenu4: string
  conclusion: string
  references: string
  auteur: string
  theme: string
}

interface QuizQuestion {
  Id: number
  Question: string
  BR: string
  MR1: string
  MR2: string
  MR3: string
  Explication: string
  Theme: string
}

interface AssistantRIAQuestion {
  id: number
  question: string
  created_at?: string
}

const AdminConsolePage: React.FC = () => {
  const { signOut, isAdmin, profile, loading, session } = useAuth()
  const navigate = useNavigate()
  const [selectedAction, setSelectedAction] = useState<AdminAction>(null)
  const [actualiteForm, setActualiteForm] = useState({
    Titre: '',
    Date: '',
    media: '',
    lien: '',
  })
  const [docForm, setDocForm] = useState({
    titre: '',
    auteur: '',
    lien: '',
    date: '',
    resume: '',
    themes: '',
    langue: '',
  })
  const [doctrineForm, setDoctrineForm] = useState({
    titre: '',
    date: '',
    abstract: '',
    intro: '',
    titre1: '',
    'sous-titre1': '',
    contenu1: '',
    'sous-titre2': '',
    contenu2: '',
    titre2: '',
    'sous-titre3': '',
    contenu3: '',
    'sous-titre4': '',
    contenu4: '',
    conclusion: '',
    references: '',
    auteur: '',
    theme: '',
  })
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [articlesList, setArticlesList] = useState<Array<{ id_article: number; numero: string; titre: string }>>([])
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [isArticleDropdownOpen, setIsArticleDropdownOpen] = useState(false)
  const [articleSearch, setArticleSearch] = useState('')
  const [enrichForm, setEnrichForm] = useState({
    numero: '',
    titre: '',
    resume: '',
    recitals: '',
    fiches: '',
    doc_associee: '',
  })
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)
  // Sidebar repliée par défaut sur mobile / petits écrans, ouverte sur desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    // Même breakpoint que Tailwind "lg" (≈1024px)
    return window.innerWidth < 1024
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['actus']))
  
  // États pour la gestion des actualités
  const [actualitesList, setActualitesList] = useState<Actualite[]>([])
  const [actualitesSearch, setActualitesSearch] = useState('')
  const [actualitesMediaFilter, setActualitesMediaFilter] = useState('')
  const [isLoadingActualites, setIsLoadingActualites] = useState(false)
  const [editingActualite, setEditingActualite] = useState<Actualite | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [actualiteEditForm, setActualiteEditForm] = useState({
    Titre: '',
    Date: '',
    media: '',
    lien: '',
  })
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [availableMedias, setAvailableMedias] = useState<string[]>([])
  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false)
  const [availableAuteurs, setAvailableAuteurs] = useState<string[]>([])
  const [isAuteurDropdownOpen, setIsAuteurDropdownOpen] = useState(false)
  const [availableLangues, setAvailableLangues] = useState<string[]>([])
  const [isLangueDropdownOpen, setIsLangueDropdownOpen] = useState(false)
  const [availableThemes, setAvailableThemes] = useState<string[]>([])
  const [isThemesDropdownOpen, setIsThemesDropdownOpen] = useState(false)
  
  // États pour la gestion des docs
  const [docsList, setDocsList] = useState<Doc[]>([])
  const [docsSearch, setDocsSearch] = useState('')
  const [docsLangueFilter, setDocsLangueFilter] = useState('')
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null)
  const [isEditDocModalOpen, setIsEditDocModalOpen] = useState(false)
  const [docEditForm, setDocEditForm] = useState({
    titre: '',
    auteur: '',
    lien: '',
    date: '',
    resume: '',
    themes: '',
    langue: '',
  })
  const [deleteDocConfirmId, setDeleteDocConfirmId] = useState<number | null>(null)
  
  // États pour la gestion de la doctrine
  const [doctrineList, setDoctrineList] = useState<DoctrineArticle[]>([])
  const [doctrineSearch, setDoctrineSearch] = useState('')
  const [doctrineThemeFilter, setDoctrineThemeFilter] = useState('')
  const [isLoadingDoctrine, setIsLoadingDoctrine] = useState(false)
  const [editingDoctrine, setEditingDoctrine] = useState<DoctrineArticle | null>(null)
  const [isEditDoctrineModalOpen, setIsEditDoctrineModalOpen] = useState(false)
  const [doctrineEditForm, setDoctrineEditForm] = useState({
    titre: '',
    date: '',
    abstract: '',
    intro: '',
    titre1: '',
    'sous-titre1': '',
    contenu1: '',
    'sous-titre2': '',
    contenu2: '',
    titre2: '',
    'sous-titre3': '',
    contenu3: '',
    'sous-titre4': '',
    contenu4: '',
    conclusion: '',
    references: '',
    auteur: '',
    theme: '',
  })
  const [deleteDoctrineConfirmId, setDeleteDoctrineConfirmId] = useState<number | null>(null)
  
  // États pour la gestion du quiz
  const [questionForm, setQuestionForm] = useState({
    Question: '',
    BR: '',
    MR1: '',
    MR2: '',
    MR3: '',
    Explication: '',
    Theme: '',
  })
  const [questionsList, setQuestionsList] = useState<QuizQuestion[]>([])
  const [questionsSearch, setQuestionsSearch] = useState('')
  const [questionsThemeFilter, setQuestionsThemeFilter] = useState('')
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false)
  const [questionEditForm, setQuestionEditForm] = useState({
    Question: '',
    BR: '',
    MR1: '',
    MR2: '',
    MR3: '',
    Explication: '',
    Theme: '',
  })
  const [deleteQuestionConfirmId, setDeleteQuestionConfirmId] = useState<number | null>(null)
  
  // États pour la gestion de l'assistant RIA
  const [assistantRIAQuestions, setAssistantRIAQuestions] = useState<AssistantRIAQuestion[]>([])
  const [assistantRIASearch, setAssistantRIASearch] = useState('')
  const [isLoadingAssistantRIA, setIsLoadingAssistantRIA] = useState(false)
  const [deleteAssistantRIAConfirmId, setDeleteAssistantRIAConfirmId] = useState<number | null>(null)

  // États pour la gestion des adhérents
  interface Adherent {
    id: string
    email: string
    prenom: string | null
    nom: string | null
    profession: string | null
    created_at: string
    consentement_prospection: boolean | null
  }
  const [adherentsList, setAdherentsList] = useState<Adherent[]>([])
  const [adherentsSearch, setAdherentsSearch] = useState('')
  const [adherentsFilter, setAdherentsFilter] = useState<'all' | 'with-consent'>('all')
  const [isLoadingAdherents, setIsLoadingAdherents] = useState(false)
  const [deleteAdherentConfirmId, setDeleteAdherentConfirmId] = useState<string | null>(null)

  // États pour les demandes de suppression
  interface DeletionRequest {
    id: string
    user_id: string
    email: string
    reason: string | null
    requested_at: string
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    processed_at: string | null
    processed_by: string | null
  }
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([])
  const [isLoadingDeletionRequests, setIsLoadingDeletionRequests] = useState(false)
  const [deletionRequestFilter, setDeletionRequestFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all')

  // États pour la gestion des fichiers
  interface FileItem {
    name: string
    id: string
    created_at: string
    updated_at: string
    metadata: {
      size?: number
      mimetype?: string
    }
  }
  const [filesList, setFilesList] = useState<FileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [deleteFileConfirmName, setDeleteFileConfirmName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const getAuthHeaders = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuration Supabase manquante côté client')
    }
    if (!session?.access_token) {
      throw new Error('Session administrateur introuvable')
    }
    return {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    } as const
  }

  // Rediriger si l'utilisateur n'est pas admin une fois la session chargée
  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/connexion')
    }
  }, [loading, isAdmin, navigate])

  const menuGroups = [
    {
      key: 'actus',
      label: 'Actus',
      icon: '📰',
      items: [
        { id: 'ajouter-actualite' as AdminAction, label: 'Ajouter une actualité', icon: '➕' },
        { id: 'consulter-actus' as AdminAction, label: 'Consulter et modifier', icon: '📋' },
      ],
    },
    {
      key: 'docs',
      label: 'Docs',
      icon: '📄',
      items: [
        { id: 'ajouter-document' as AdminAction, label: 'Ajouter un document', icon: '➕' },
        { id: 'consulter-docs' as AdminAction, label: 'Consulter et modifier', icon: '📋' },
      ],
    },
    {
      key: 'doctrine',
      label: 'Doctrine',
      icon: '📚',
      items: [
        { id: 'ajouter-article-doctrine' as AdminAction, label: 'Ajouter un article', icon: '➕' },
        { id: 'consulter-doctrine' as AdminAction, label: 'Consulter et modifier', icon: '📋' },
      ],
    },
    {
      key: 'ria',
      label: 'RIA',
      icon: '✨',
      items: [
        { id: 'enrichir-article' as AdminAction, label: 'Enrichir un article', icon: '✨' },
      ],
    },
    {
      key: 'quiz',
      label: 'Quiz',
      icon: '❓',
      items: [
        { id: 'ajouter-question' as AdminAction, label: 'Ajouter une question', icon: '➕' },
        { id: 'consulter-questions' as AdminAction, label: 'Consulter et modifier', icon: '📋' },
      ],
    },
    {
      key: 'assistant',
      label: 'Assistant RIA',
      icon: '🤖',
      items: [
        { id: 'consulter-assistant-ria' as AdminAction, label: 'Consulter les questions', icon: '📋' },
      ],
    },
    {
      key: 'adherents',
      label: 'Adhérents',
      icon: '👥',
      items: [
        { id: 'consulter-adherents' as AdminAction, label: 'Liste des adhérents', icon: '📋' },
        { id: 'supprimer-adherent' as AdminAction, label: 'Supprimer un adhérent', icon: '🗑️' },
        { id: 'demandes-suppression' as AdminAction, label: 'Demandes de suppression', icon: '⚠️' },
      ],
    },
    {
      key: 'fichiers',
      label: 'Fichiers',
      icon: '📁',
      items: [
        { id: 'gestion-fichiers' as AdminAction, label: 'Gérer les fichiers', icon: '📂' },
      ],
    },
  ]

  // Ouvrir automatiquement le groupe parent quand une action est sélectionnée
  useEffect(() => {
    if (selectedAction) {
      const parentGroup = menuGroups.find((group) =>
        group.items.some((item) => item.id === selectedAction)
      )
      if (parentGroup) {
        setExpandedGroups((prev) => {
          if (!prev.has(parentGroup.key)) {
            return new Set([...prev, parentGroup.key])
          }
          return prev
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction])

  // Réinitialiser les messages et formulaires quand on change d'action
  useEffect(() => {
    setFormStatus({ type: null, message: '' })
    if (selectedAction === 'ajouter-actualite') {
      setActualiteForm({
        Titre: '',
        Date: '',
        media: '',
        lien: '',
      })
    } else if (selectedAction === 'consulter-actus') {
      setActualitesSearch('')
      setActualitesMediaFilter('')
      setDeleteConfirmId(null)
      setIsEditModalOpen(false)
      setEditingActualite(null)
    } else if (selectedAction === 'consulter-docs') {
      setDocsSearch('')
      setDocsLangueFilter('')
      setDeleteDocConfirmId(null)
      setIsEditDocModalOpen(false)
      setEditingDoc(null)
    } else if (selectedAction === 'consulter-doctrine') {
      setDoctrineSearch('')
      setDoctrineThemeFilter('')
      setDeleteDoctrineConfirmId(null)
      setIsEditDoctrineModalOpen(false)
      setEditingDoctrine(null)
    } else if (selectedAction === 'ajouter-question') {
      setQuestionForm({
        Question: '',
        BR: '',
        MR1: '',
        MR2: '',
        MR3: '',
        Explication: '',
        Theme: '',
      })
    } else if (selectedAction === 'consulter-questions') {
      setQuestionsSearch('')
      setQuestionsThemeFilter('')
      setDeleteQuestionConfirmId(null)
      setIsEditQuestionModalOpen(false)
      setEditingQuestion(null)
    } else if (selectedAction === 'consulter-assistant-ria') {
      setAssistantRIASearch('')
      setDeleteAssistantRIAConfirmId(null)
    } else if (selectedAction === 'ajouter-document') {
      setDocForm({
        titre: '',
        auteur: '',
        lien: '',
        date: '',
        resume: '',
        themes: '',
        langue: '',
      })
    } else if (selectedAction === 'ajouter-article-doctrine') {
      setDoctrineForm({
        titre: '',
        date: '',
        abstract: '',
        intro: '',
        titre1: '',
        'sous-titre1': '',
        contenu1: '',
        'sous-titre2': '',
        contenu2: '',
        titre2: '',
        'sous-titre3': '',
        contenu3: '',
        'sous-titre4': '',
        contenu4: '',
        conclusion: '',
        references: '',
        auteur: '',
        theme: '',
      })
    }
  }, [selectedAction])

  // Charger la liste des articles quand on arrive sur "enrichir un article"
  useEffect(() => {
    if (selectedAction !== 'enrichir-article') return

    const loadArticles = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('article')
          .select('id_article, numero, titre')
          .order('id_article')

        if (error) throw error
        setArticlesList(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des articles pour enrichissement:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des articles. Réessayez plus tard.",
        })
      }
    }

    loadArticles()
  }, [selectedAction])

  // Charger la liste des actualités quand on arrive sur "consulter-actus"
  useEffect(() => {
    if (selectedAction !== 'consulter-actus') return

    const loadActualites = async () => {
      setIsLoadingActualites(true)
      try {
        const { data, error } = await supabasePublic
          .from('Actu')
          .select('*')
          .order('Date', { ascending: false })

        if (error) throw error
        setActualitesList(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des actualités:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des actualités. Réessayez plus tard.",
        })
      } finally {
        setIsLoadingActualites(false)
      }
    }

    loadActualites()
  }, [selectedAction])

  // Charger la liste des médias disponibles quand on arrive sur "ajouter-actualite"
  useEffect(() => {
    if (selectedAction !== 'ajouter-actualite') return

    const loadMedias = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('Actu')
          .select('media')

        if (error) throw error

        // Extraire les médias uniques, normaliser (trim) et filtrer les valeurs nulles/vides
        const medias = [...new Set(
          (data ?? [])
            .map(a => a.media?.trim())
            .filter((media): media is string => !!media)
        )].sort()

        setAvailableMedias(medias)
      } catch (err) {
        console.error('Erreur lors du chargement des médias:', err)
        // Ne pas afficher d'erreur à l'utilisateur, juste utiliser une liste vide
        setAvailableMedias([])
      }
    }

    loadMedias()
  }, [selectedAction])

  // Charger la liste des docs quand on arrive sur "consulter-docs"
  useEffect(() => {
    if (selectedAction !== 'consulter-docs') return

    const loadDocs = async () => {
      setIsLoadingDocs(true)
      try {
        const { data, error } = await supabasePublic
          .from('docs')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error
        setDocsList(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des docs:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des documents. Réessayez plus tard.",
        })
      } finally {
        setIsLoadingDocs(false)
      }
    }

    loadDocs()
  }, [selectedAction])

  // Charger les auteurs, langues et thèmes disponibles quand on arrive sur "ajouter-document"
  useEffect(() => {
    if (selectedAction !== 'ajouter-document') return

    const loadDocOptions = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('docs')
          .select('auteur, langue, themes')

        if (error) throw error

        // Extraire les auteurs uniques
        const auteurs = [...new Set(
          (data ?? [])
            .map(d => d.auteur?.trim())
            .filter((auteur): auteur is string => !!auteur)
        )].sort()

        // Extraire les langues uniques
        const langues = [...new Set(
          (data ?? [])
            .map(d => d.langue?.trim())
            .filter((langue): langue is string => !!langue)
        )].sort()

        // Extraire tous les thèmes individuels (séparés par des virgules)
        const allThemes = new Set<string>()
        ;(data ?? []).forEach(d => {
          if (d.themes) {
            d.themes.split(',').forEach(theme => {
              const trimmed = theme.trim()
              if (trimmed) {
                allThemes.add(trimmed)
              }
            })
          }
        })
        const themes = Array.from(allThemes).sort()

        setAvailableAuteurs(auteurs)
        setAvailableLangues(langues)
        setAvailableThemes(themes)
      } catch (err) {
        console.error('Erreur lors du chargement des options de document:', err)
        setAvailableAuteurs([])
        setAvailableLangues([])
        setAvailableThemes([])
      }
    }

    loadDocOptions()
  }, [selectedAction])

  // Charger la liste de la doctrine quand on arrive sur "consulter-doctrine"
  useEffect(() => {
    if (selectedAction !== 'consulter-doctrine') return

    const loadDoctrine = async () => {
      setIsLoadingDoctrine(true)
      try {
        const { data, error } = await supabasePublic
          .from('doctrine')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error
        setDoctrineList(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement de la doctrine:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des articles de doctrine. Réessayez plus tard.",
        })
      } finally {
        setIsLoadingDoctrine(false)
      }
    }

    loadDoctrine()
  }, [selectedAction])

  // Charger la liste des questions de quiz quand on arrive sur "consulter-questions"
  useEffect(() => {
    if (selectedAction !== 'consulter-questions') return

    const loadQuestions = async () => {
      setIsLoadingQuestions(true)
      try {
        const { data, error } = await supabasePublic
          .from('questions')
          .select('*')
          .order('Id', { ascending: false })

        if (error) throw error
        setQuestionsList(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des questions:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des questions. Réessayez plus tard.",
        })
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    loadQuestions()
  }, [selectedAction])

  // Charger la liste des questions de l'assistant RIA quand on arrive sur "consulter-assistant-ria"
  useEffect(() => {
    if (selectedAction !== 'consulter-assistant-ria') return

    const loadAssistantRIA = async () => {
      setIsLoadingAssistantRIA(true)
      try {
        const { data, error } = await supabasePublic
          .from('assistant_ria')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setAssistantRIAQuestions(data ?? [])
      } catch (err) {
        console.error('Erreur lors du chargement des questions de l\'assistant:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des questions. Réessayez plus tard.",
        })
      } finally {
        setIsLoadingAssistantRIA(false)
      }
    }

    loadAssistantRIA()
  }, [selectedAction])

  // Charger la liste des adhérents quand on arrive sur "consulter-adherents" ou "supprimer-adherent"
  useEffect(() => {
    if (selectedAction !== 'consulter-adherents' && selectedAction !== 'supprimer-adherent') return

    const loadAdherents = async () => {
      // Filet de sécurité : ne jamais laisser le loader bloqué plus de 15s
      const safetyTimeout = setTimeout(() => {
        console.warn('⚠️ [ADHERENTS] Timeout de sécurité atteint, arrêt du chargement forcé.')
        setIsLoadingAdherents(false)
      }, 15000)

      setIsLoadingAdherents(true)
      console.log('🔵 [ADHERENTS] Début du chargement des adhérents...')
      console.log('🔵 [ADHERENTS] Session:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userRole: session?.user?.user_metadata?.role,
        accessToken: session?.access_token ? 'présent' : 'absent'
      })
      
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        console.log('🔵 [ADHERENTS] Vérification configuration Supabase côté client:', {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
        })

        console.log('🔵 [ADHERENTS] Exécution de la requête Supabase...')
        console.log('🔵 [ADHERENTS] Contenu du JWT:', {
          user_metadata: session?.user?.user_metadata,
          raw_user_meta_data: (session as any)?.user?.raw_user_meta_data,
          role_in_metadata: session?.user?.user_metadata?.role
        })

        // Requête directe via l'endpoint REST de Supabase pour éviter tout blocage du client JS
        console.log('🔵 [ADHERENTS] Envoi de la requête complète (REST direct)...')

        if (!supabaseUrl || !session?.access_token || !supabaseAnonKey) {
          console.error('❌ [ADHERENTS] Configuration Supabase incomplète pour la requête REST.', {
            hasUrl: !!supabaseUrl,
            hasToken: !!session?.access_token,
            hasAnonKey: !!supabaseAnonKey,
          })
          throw new Error('Configuration Supabase incomplète côté client.')
        }

        const url = `${supabaseUrl}/rest/v1/profiles?select=id,email,prenom,nom,profession,created_at,consentement_prospection&role=eq.adherent&order=created_at.desc`

        const response = await fetch(url, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          console.error('🔴 [ADHERENTS] Erreur HTTP REST:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })
          throw new Error(`Erreur HTTP ${response.status} lors du chargement des adhérents`)
        }

        const data = await response.json()
        const error = null as any

        console.log('🟢 [ADHERENTS] Réponse Supabase reçue:', { 
          dataCount: data?.length ?? 0, 
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          } : null
        })
        
        if (error) {
          console.error('🔴 [ADHERENTS] Erreur Supabase détaillée:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            status: (error as any).status
          })
          throw error
        }
        
        console.log('✅ [ADHERENTS] Données chargées avec succès:', data?.length ?? 0, 'adhérents')
        setAdherentsList(data ?? [])
      } catch (err) {
        console.error('🔴 [ADHERENTS] Exception lors du chargement:', err)
        setFormStatus({
          type: 'error',
          message: "Impossible de charger la liste des adhérents. Réessayez plus tard.",
        })
      } finally {
        console.log('🔵 [ADHERENTS] Fin du chargement')
        setIsLoadingAdherents(false)
      }
    }

    loadAdherents()
  }, [selectedAction])

  // Charger les demandes de suppression
  useEffect(() => {
    const loadDeletionRequests = async () => {
      if (selectedAction !== 'demandes-suppression') return
      
      setIsLoadingDeletionRequests(true)
      try {
        const { data, error } = await supabase
          .from('deletion_requests')
          .select('*')
          .order('requested_at', { ascending: false })

        if (error) {
          console.error('❌ [DEMANDES SUPPRESSION] Erreur:', error)
          setFormStatus({ type: 'error', message: 'Erreur lors du chargement des demandes' })
        } else {
          console.log('✅ [DEMANDES SUPPRESSION] Demandes chargées:', data?.length)
          setDeletionRequests(data || [])
        }
      } catch (err) {
        console.error('❌ [DEMANDES SUPPRESSION] Exception:', err)
        setFormStatus({ type: 'error', message: 'Erreur lors du chargement des demandes' })
      } finally {
        setIsLoadingDeletionRequests(false)
      }
    }

    loadDeletionRequests()
  }, [selectedAction])

  // Traiter une demande de suppression (supprimer le compte)
  const handleProcessDeletionRequest = async (requestId: string, userId: string) => {
    if (!session?.user) {
      setFormStatus({ type: 'error', message: 'Session expirée' })
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      return
    }

    try {
      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from('deletion_requests')
        .update({
          status: 'processing',
          processed_by: session.user.id,
        })
        .eq('id', requestId)

      if (updateError) {
        console.error('❌ [DEMANDES SUPPRESSION] Erreur mise à jour:', updateError)
        setFormStatus({ type: 'error', message: 'Erreur lors de la mise à jour de la demande' })
        return
      }

      // Supprimer l'utilisateur (cela supprimera aussi automatiquement le profil et la demande grâce aux CASCADE)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const accessToken = session.access_token

      if (!supabaseUrl || !accessToken) {
        setFormStatus({ type: 'error', message: 'Erreur de configuration' })
        return
      }

      // Utiliser l'API Admin de Supabase pour supprimer l'utilisateur
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ [DEMANDES SUPPRESSION] Erreur suppression utilisateur:', errorData)
        setFormStatus({ type: 'error', message: 'Erreur lors de la suppression du compte' })
        return
      }

      // Marquer la demande comme complétée
      await supabase
        .from('deletion_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      setFormStatus({ type: 'success', message: 'Compte supprimé avec succès' })
      
      // Recharger les demandes
      const { data } = await supabase
        .from('deletion_requests')
        .select('*')
        .order('requested_at', { ascending: false })
      setDeletionRequests(data || [])

    } catch (err) {
      console.error('❌ [DEMANDES SUPPRESSION] Exception:', err)
      setFormStatus({ type: 'error', message: 'Erreur lors du traitement de la demande' })
    }
  }

  // Filtrer les demandes selon le statut
  const filteredDeletionRequests = deletionRequests.filter((req) => {
    if (deletionRequestFilter === 'all') return true
    return req.status === deletionRequestFilter
  })

  // Filtrer les actualités selon la recherche et le filtre média
  const filteredActualites = actualitesList.filter((actu) => {
    const searchLower = actualitesSearch.trim().toLowerCase()
    const matchesSearch = !searchLower || 
      actu.Titre.toLowerCase().includes(searchLower) ||
      actu.media.toLowerCase().includes(searchLower) ||
      actu.lien.toLowerCase().includes(searchLower)
    
    // Comparaison normalisée (trim) pour le filtre média
    const matchesMedia = !actualitesMediaFilter || 
      (actu.media && actu.media.trim() === actualitesMediaFilter.trim())
    
    return matchesSearch && matchesMedia
  })

  // Générer la liste des médias uniques en normalisant (trim) et en filtrant les valeurs nulles/vides
  const uniqueMedias = [...new Set(actualitesList
    .map(a => a.media?.trim())
    .filter((media): media is string => !!media)
  )].sort()

  // Filtrer les docs selon la recherche et le filtre langue
  const filteredDocs = docsList.filter((doc) => {
    const searchLower = docsSearch.trim().toLowerCase()
    const matchesSearch = !searchLower || 
      doc.titre.toLowerCase().includes(searchLower) ||
      doc.auteur.toLowerCase().includes(searchLower) ||
      doc.lien.toLowerCase().includes(searchLower) ||
      doc.resume.toLowerCase().includes(searchLower) ||
      doc.themes.toLowerCase().includes(searchLower)
    
    const matchesLangue = !docsLangueFilter || doc.langue === docsLangueFilter
    
    return matchesSearch && matchesLangue
  })

  const uniqueLangues = [...new Set(docsList.map(d => d.langue).filter(Boolean))].sort()

  // Filtrer la doctrine selon la recherche et le filtre thème
  const filteredDoctrine = doctrineList.filter((doctrine) => {
    const searchLower = doctrineSearch.trim().toLowerCase()
    const matchesSearch = !searchLower || 
      doctrine.titre.toLowerCase().includes(searchLower) ||
      doctrine.auteur.toLowerCase().includes(searchLower) ||
      doctrine.abstract.toLowerCase().includes(searchLower) ||
      doctrine.theme.toLowerCase().includes(searchLower)
    
    const matchesTheme = !doctrineThemeFilter || doctrine.theme === doctrineThemeFilter
    
    return matchesSearch && matchesTheme
  })

  const uniqueThemes = [...new Set(doctrineList.map(d => d.theme).filter(Boolean))].sort()

  // Filtrer les questions de quiz selon la recherche et le filtre thème
  const filteredQuestions = questionsList.filter((q) => {
    const searchLower = questionsSearch.trim().toLowerCase()
    const matchesSearch = !searchLower || 
      q.Question.toLowerCase().includes(searchLower) ||
      q.BR.toLowerCase().includes(searchLower) ||
      q.Explication.toLowerCase().includes(searchLower) ||
      q.Theme.toLowerCase().includes(searchLower)
    
    const matchesTheme = !questionsThemeFilter || q.Theme === questionsThemeFilter
    
    return matchesSearch && matchesTheme
  })

  const uniqueQuestionThemes = [...new Set(questionsList.map(q => q.Theme).filter(Boolean))].sort()

  // Filtrer les questions de l'assistant RIA selon la recherche
  const filteredAssistantRIAQuestions = assistantRIAQuestions.filter((q) => {
    const searchLower = assistantRIASearch.trim().toLowerCase()
    return !searchLower || q.question.toLowerCase().includes(searchLower)
  })

  // Filtrer les adhérents selon la recherche et le filtre de consentement
  const filteredAdherents = adherentsList.filter((a) => {
    // Filtre par consentement
    if (adherentsFilter === 'with-consent' && a.consentement_prospection !== true) {
      return false
    }
    
    // Filtre par recherche
    const searchLower = adherentsSearch.trim().toLowerCase()
    return !searchLower || 
      (a.email && a.email.toLowerCase().includes(searchLower)) ||
      (a.prenom && a.prenom.toLowerCase().includes(searchLower)) ||
      (a.nom && a.nom.toLowerCase().includes(searchLower)) ||
      (a.profession && a.profession.toLowerCase().includes(searchLower))
  })

  // Fonction pour exporter les adhérents avec consentement en Excel (CSV)
  const exportAdherentsWithConsentToExcel = () => {
    const adherentsWithConsent = adherentsList.filter(a => a.consentement_prospection === true)
    
    if (adherentsWithConsent.length === 0) {
      setFormStatus({ type: 'error', message: 'Aucun adhérent avec consentement à la prospection commerciale.' })
      return
    }

    // Créer les en-têtes CSV
    const headers = ['Email', 'Prénom', 'Nom', 'Profession', 'Date d\'inscription', 'Consentement prospection']
    
    // Créer les lignes de données
    const rows = adherentsWithConsent.map(a => [
      a.email || '',
      a.prenom || '',
      a.nom || '',
      a.profession || '',
      new Date(a.created_at).toLocaleDateString('fr-FR'),
      'Oui'
    ])

    // Créer le contenu CSV avec BOM UTF-8 pour Excel
    const csvContent = [
      '\uFEFF', // BOM UTF-8 pour Excel
      headers.join(';'),
      ...rows.map(row => row.map(cell => {
        // Échapper les guillemets et les points-virgules
        const cellStr = String(cell).replace(/"/g, '""')
        return `"${cellStr}"`
      }).join(';'))
    ].join('\n')

    // Créer un blob et télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `adherents-consentement-prospection-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setFormStatus({ type: 'success', message: `${adherentsWithConsent.length} adhérent(s) exporté(s) avec succès.` })
  }

  // Supprimer un adhérent
  const handleDeleteAdherent = async (id: string) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      
      // Supprimer le profil (la suppression cascade sur auth.users si configuré)
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabase
        .from('profiles')
        .select('id, email, prenom, nom, profession, created_at, consentement_prospection')
        .eq('role', 'adherent')
        .order('created_at', { ascending: false })

      if (!reloadError && data) {
        setAdherentsList(data)
      }

      setFormStatus({ type: 'success', message: 'Adhérent supprimé avec succès.' })
      setDeleteAdherentConfirmId(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // GESTION DES FICHIERS (Supabase Storage)
  // ============================================

  // Charger la liste des fichiers
  const loadFiles = async () => {
    setIsLoadingFiles(true)
    try {
      // Utiliser la session depuis useAuth() au lieu de refaire getSession()
      if (!session) {
        throw new Error('Vous devez être connecté pour voir les fichiers.')
      }
      
      // Utiliser l'API REST directement
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }
      
      const listUrl = `${supabaseUrl}/storage/v1/object/list/admin-files`
      
      const response = await fetch(listUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prefix: '',
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        console.error('❌ Erreur lors du chargement des fichiers:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // La réponse peut être un tableau directement ou un objet avec une propriété data
      const files = Array.isArray(data) ? data : (data?.data || data?.files || [])
      setFilesList(files)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors du chargement des fichiers.'
      
      setFormStatus({
        type: 'error',
        message: errorMessage.includes('row-level security') || errorMessage.includes('RLS') || errorMessage.includes('policy')
          ? 'Erreur de permissions. Vérifiez que les politiques RLS sont correctement configurées.'
          : errorMessage,
      })
      setFilesList([])
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Uploader un fichier directement vers Supabase Storage
  const handleUploadFile = async () => {
    if (!selectedFile) {
      setFormStatus({ type: 'error', message: 'Veuillez sélectionner un fichier.' })
      return
    }

    setUploadingFile(true)
    setFormStatus({ type: null, message: '' })

    try {
      if (!session) {
        throw new Error('Vous devez être connecté pour uploader un fichier.')
      }

      const fileName = `${Date.now()}-${selectedFile.name}`

      // Utiliser l'API REST directement au lieu du client Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }
      
      const uploadUrl = `${supabaseUrl}/storage/v1/object/admin-files/${fileName}`
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': selectedFile.type || 'application/octet-stream',
          'x-upsert': 'false',
          'cache-control': '3600'
        },
        body: selectedFile
      })
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        throw new Error(
          errorData.message || 
          errorData.error_description || 
          `Erreur ${uploadResponse.status}: ${uploadResponse.statusText}`
        )
      }
      
      const data = await uploadResponse.json()

      setFormStatus({ type: 'success', message: 'Fichier uploadé avec succès !' })
      setSelectedFile(null)
      
      // Recharger la liste après un court délai pour laisser le temps au fichier d'être indexé
      setTimeout(async () => {
        await loadFiles()
      }, 500)
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err
        ? String(err.message)
        : 'Erreur lors de l\'upload du fichier.'
      
      setFormStatus({
        type: 'error',
        message: errorMessage.includes('row-level security') 
          ? 'Erreur de permissions. Vérifiez que vous êtes connecté en tant qu\'admin et que les politiques RLS sont correctement configurées.'
          : errorMessage,
      })
    } finally {
      setUploadingFile(false)
    }
  }

  // Télécharger un fichier
  const handleDownloadFile = async (fileName: string) => {
    try {
      if (!session) {
        throw new Error('Vous devez être connecté pour télécharger un fichier.')
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }
      
      const downloadUrl = `${supabaseUrl}/storage/v1/object/admin-files/${fileName}`
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.blob()

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors du téléchargement du fichier.',
      })
    }
  }

  // Supprimer un fichier
  const handleDeleteFile = async (fileName: string) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      if (!session) {
        throw new Error('Vous devez être connecté pour supprimer un fichier.')
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }
      
      const deleteUrl = `${supabaseUrl}/storage/v1/object/admin-files/${fileName}`
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`)
      }

      setFormStatus({ type: 'success', message: 'Fichier supprimé avec succès.' })
      setDeleteFileConfirmName(null)
      
      // Recharger la liste
      await loadFiles()
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de la suppression du fichier.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Charger les fichiers quand on arrive sur "gestion-fichiers"
  useEffect(() => {
    if (selectedAction === 'gestion-fichiers') {
      loadFiles()
    }
  }, [selectedAction, session])

  // Ouvrir le modal de modification
  const handleEditActualite = (actu: Actualite) => {
    setEditingActualite(actu)
    setActualiteEditForm({
      Titre: actu.Titre,
      Date: actu.Date,
      media: actu.media,
      lien: actu.lien,
    })
    setIsEditModalOpen(true)
  }

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editingActualite) return
    
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/Actu?id=eq.${editingActualite.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          Titre: actualiteEditForm.Titre.trim(),
          Date: actualiteEditForm.Date,
          media: actualiteEditForm.media.trim(),
          lien: actualiteEditForm.lien.trim(),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste pour avoir les données à jour
      const { data, error: reloadError } = await supabasePublic
        .from('Actu')
        .select('*')
        .order('Date', { ascending: false })

      if (!reloadError && data) {
        setActualitesList(data)
      } else {
        // Fallback : mettre à jour la liste locale
        setActualitesList(actualitesList.map(a => 
          a.id === editingActualite.id 
            ? { ...a, ...actualiteEditForm }
            : a
        ))
      }

      setFormStatus({ type: 'success', message: 'Actualité modifiée avec succès.' })
      setIsEditModalOpen(false)
      setEditingActualite(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ouvrir le modal de modification d'un doc
  const handleEditDoc = (doc: Doc) => {
    setEditingDoc(doc)
    setDocEditForm({
      titre: doc.titre,
      auteur: doc.auteur,
      lien: doc.lien,
      date: doc.date,
      resume: doc.resume,
      themes: doc.themes,
      langue: doc.langue,
    })
    setIsEditDocModalOpen(true)
  }

  // Sauvegarder les modifications d'un doc
  const handleSaveDocEdit = async () => {
    if (!editingDoc) return
    
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/docs?id=eq.${editingDoc.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          titre: docEditForm.titre.trim(),
          auteur: docEditForm.auteur.trim() || null,
          lien: docEditForm.lien.trim(),
          date: docEditForm.date,
          resume: docEditForm.resume.trim(),
          themes: docEditForm.themes.trim(),
          langue: docEditForm.langue.trim(),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('docs')
        .select('*')
        .order('date', { ascending: false })

      if (!reloadError && data) {
        setDocsList(data)
      }

      setFormStatus({ type: 'success', message: 'Document modifié avec succès.' })
      setIsEditDocModalOpen(false)
      setEditingDoc(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer un doc
  const handleDeleteDoc = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/docs?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('docs')
        .select('*')
        .order('date', { ascending: false })

      if (!reloadError && data) {
        setDocsList(data)
      }

      setFormStatus({ type: 'success', message: 'Document supprimé avec succès.' })
      setDeleteDocConfirmId(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ouvrir le modal de modification d'un article de doctrine
  const handleEditDoctrine = (doctrine: DoctrineArticle) => {
    setEditingDoctrine(doctrine)
    setDoctrineEditForm({
      titre: doctrine.titre,
      date: doctrine.date,
      abstract: doctrine.abstract,
      intro: doctrine.intro,
      titre1: doctrine.titre1,
      'sous-titre1': doctrine['sous-titre1'],
      contenu1: doctrine.contenu1,
      'sous-titre2': doctrine['sous-titre2'],
      contenu2: doctrine.contenu2,
      titre2: doctrine.titre2,
      'sous-titre3': doctrine['sous-titre3'],
      contenu3: doctrine.contenu3,
      'sous-titre4': doctrine['sous-titre4'],
      contenu4: doctrine.contenu4,
      conclusion: doctrine.conclusion,
      references: doctrine.references,
      auteur: doctrine.auteur,
      theme: doctrine.theme,
    })
    setIsEditDoctrineModalOpen(true)
  }

  // Sauvegarder les modifications d'un article de doctrine
  const handleSaveDoctrineEdit = async () => {
    if (!editingDoctrine) return
    
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/doctrine?id=eq.${editingDoctrine.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          titre: doctrineEditForm.titre.trim(),
          date: doctrineEditForm.date,
          abstract: doctrineEditForm.abstract.trim(),
          intro: doctrineEditForm.intro.trim(),
          titre1: doctrineEditForm.titre1.trim(),
          'sous-titre1': doctrineEditForm['sous-titre1'].trim(),
          contenu1: doctrineEditForm.contenu1.trim(),
          'sous-titre2': doctrineEditForm['sous-titre2'].trim(),
          contenu2: doctrineEditForm.contenu2.trim(),
          titre2: doctrineEditForm.titre2.trim(),
          'sous-titre3': doctrineEditForm['sous-titre3'].trim(),
          contenu3: doctrineEditForm.contenu3.trim(),
          'sous-titre4': doctrineEditForm['sous-titre4'].trim(),
          contenu4: doctrineEditForm.contenu4.trim(),
          conclusion: doctrineEditForm.conclusion.trim(),
          references: doctrineEditForm.references.trim(),
          auteur: doctrineEditForm.auteur.trim(),
          theme: doctrineEditForm.theme.trim(),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('doctrine')
        .select('*')
        .order('date', { ascending: false })

      if (!reloadError && data) {
        setDoctrineList(data)
      }

      setFormStatus({ type: 'success', message: 'Article de doctrine modifié avec succès.' })
      setIsEditDoctrineModalOpen(false)
      setEditingDoctrine(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer un article de doctrine
  const handleDeleteDoctrine = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/doctrine?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('doctrine')
        .select('*')
        .order('date', { ascending: false })

      if (!reloadError && data) {
        setDoctrineList(data)
      }

      setFormStatus({ type: 'success', message: 'Article de doctrine supprimé avec succès.' })
      setDeleteDoctrineConfirmId(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer une actualité
  const handleDeleteActualite = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/Actu?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste pour avoir les données à jour
      const { data, error: reloadError } = await supabasePublic
        .from('Actu')
        .select('*')
        .order('Date', { ascending: false })

      if (!reloadError && data) {
        setActualitesList(data)
      } else {
        // Fallback : mettre à jour la liste locale
        setActualitesList(actualitesList.filter(a => a.id !== id))
      }

      setFormStatus({ type: 'success', message: 'Actualité supprimée avec succès.' })
      setDeleteConfirmId(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ouvrir le modal de modification d'une question de quiz
  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question)
    setQuestionEditForm({
      Question: question.Question,
      BR: question.BR,
      MR1: question.MR1,
      MR2: question.MR2,
      MR3: question.MR3,
      Explication: question.Explication,
      Theme: question.Theme,
    })
    setIsEditQuestionModalOpen(true)
  }

  // Sauvegarder les modifications d'une question de quiz
  const handleSaveQuestionEdit = async () => {
    if (!editingQuestion) return
    
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/questions?Id=eq.${editingQuestion.Id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          Question: questionEditForm.Question.trim(),
          BR: questionEditForm.BR.trim(),
          MR1: questionEditForm.MR1.trim(),
          MR2: questionEditForm.MR2.trim(),
          MR3: questionEditForm.MR3.trim(),
          Explication: questionEditForm.Explication.trim(),
          Theme: questionEditForm.Theme.trim(),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('questions')
        .select('*')
        .order('Id', { ascending: false })

      if (!reloadError && data) {
        setQuestionsList(data)
      }

      setFormStatus({ type: 'success', message: 'Question modifiée avec succès.' })
      setIsEditQuestionModalOpen(false)
      setEditingQuestion(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer une question de quiz
  const handleDeleteQuestion = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/questions?Id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('questions')
        .select('*')
        .order('Id', { ascending: false })

      if (!reloadError && data) {
        setQuestionsList(data)
      }

      setFormStatus({ type: 'success', message: 'Question supprimée avec succès.' })
      setDeleteQuestionConfirmId(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer une question de l'assistant RIA
  const handleDeleteAssistantRIA = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/assistant_ria?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('assistant_ria')
        .select('*')
        .order('created_at', { ascending: false })

      if (!reloadError && data) {
        setAssistantRIAQuestions(data)
      }

      setFormStatus({ type: 'success', message: 'Question supprimée avec succès.' })
      setDeleteAssistantRIAConfirmId(null)
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gérer la touche Enter pour valider la suppression d'une actualité
  useEffect(() => {
    if (deleteConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteActualite(deleteConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteConfirmId, isSubmitting])

  // Gérer la touche Enter pour valider la suppression d'un document
  useEffect(() => {
    if (deleteDocConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteDoc(deleteDocConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteDocConfirmId, isSubmitting])

  // Gérer la touche Enter pour valider la suppression d'un article de doctrine
  useEffect(() => {
    if (deleteDoctrineConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteDoctrine(deleteDoctrineConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteDoctrineConfirmId, isSubmitting])

  // Gérer la touche Enter pour valider la suppression d'une question de quiz
  useEffect(() => {
    if (deleteQuestionConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteQuestion(deleteQuestionConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteQuestionConfirmId, isSubmitting])

  // Gérer la touche Enter pour valider la suppression d'une question de l'assistant RIA
  useEffect(() => {
    if (deleteAssistantRIAConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteAssistantRIA(deleteAssistantRIAConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteAssistantRIAConfirmId, isSubmitting])

  // Gérer la touche Enter pour valider la suppression d'un adhérent
  useEffect(() => {
    if (deleteAdherentConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteAdherent(deleteAdherentConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteAdherentConfirmId, isSubmitting])

  const handleSignOut = () => {
    // On délègue le signOut à la page connexion via le paramètre logout=1
    window.location.assign('/connexion?logout=1')
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const selectedArticle = selectedArticleId
    ? articlesList.find((a) => a.id_article === selectedArticleId) ?? null
    : null
  const filteredArticles = articlesList.filter((article) => {
    const q = articleSearch.trim().toLowerCase()
    if (!q) return true
    return (
      article.numero.toLowerCase().includes(q) ||
      article.titre.toLowerCase().includes(q)
    )
  })

  return (
    <>
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Console d'administration — RIA Facile</title>
        <meta name="description" content="Console d'administration de RIA Facile" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Contenu principal avec sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (en haut sur mobile, à gauche sur desktop) */}
          <div className={`w-full lg:w-64 flex-shrink-0 ${isSidebarCollapsed ? 'lg:max-w-[68px]' : ''}`}>
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-4 flex flex-col h-full">
              <div className="flex items-center mb-4">
                {!isSidebarCollapsed && (
                  <h2 className="text-lg font-semibold text-[#774792]">
                    Menu d’administration
                  </h2>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((v) => !v)}
                  className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
                  aria-label={isSidebarCollapsed ? 'Déployer le menu admin' : 'Rétracter le menu admin'}
                >
                  <span className="text-sm font-semibold">
                    {isSidebarCollapsed ? '>' : '<'}
                  </span>
                </button>
              </div>

              {!isSidebarCollapsed && (
                <>
                  <nav className="space-y-2">
                    {/* Bouton Dashboard */}
                    <button
                      onClick={() => setSelectedAction(null)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        selectedAction === null
                          ? 'bg-gradient-to-r from-purple-500 to-[#774792] text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">📊</span>
                      <span className="font-medium">Dashboard</span>
                    </button>

                    {menuGroups.map((group) => {
                      const isExpanded = expandedGroups.has(group.key)
                      const hasActiveItem = group.items.some((item) => selectedAction === item.id)
                      
                      return (
                        <div key={group.key} className="space-y-1">
                          <button
                            onClick={() => toggleGroup(group.key)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                              hasActiveItem
                                ? 'bg-gradient-to-r from-purple-500 to-[#774792] text-white shadow-md'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{group.icon}</span>
                              <span className="font-medium">{group.label}</span>
                            </div>
                            <svg
                              className={`w-5 h-5 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          
                          {isExpanded && (
                            <div className="ml-4 space-y-1 pl-4 border-l-2 border-gray-200">
                              {group.items.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedAction(item.id)}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
                                    selectedAction === item.id
                                      ? 'bg-gradient-to-r from-purple-500 to-[#774792] text-white shadow-md'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <span className="text-base">{item.icon}</span>
                                  <span className="font-medium">{item.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </nav>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Connecté en tant que{' '}
                      <span className="font-semibold text-gray-700">
                        {profile?.email ?? session?.user.email ?? 'Administrateur'}
                      </span>
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium shadow-md hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Zone de contenu principale */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white min-h-[500px] overflow-visible">
              {selectedAction === 'ajouter-actualite' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter une actualité</h2>
                  <p className="text-gray-600 mb-6">Renseignez les champs ci-dessous. Le champ <code>ID</code> est généré automatiquement.</p>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/Actu`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            Titre: actualiteForm.Titre.trim(),
                            Date: actualiteForm.Date,
                            media: actualiteForm.media.trim(),
                            lien: actualiteForm.lien.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
                        }

                        // Ajouter le nouveau média à la liste s'il n'existe pas déjà
                        const newMedia = actualiteForm.media.trim()
                        if (newMedia && !availableMedias.includes(newMedia)) {
                          setAvailableMedias((prev) => [...prev, newMedia].sort())
                        }

                        setFormStatus({ type: 'success', message: 'Actualité ajoutée avec succès.' })
                        setActualiteForm({
                          Titre: '',
                          Date: '',
                          media: '',
                          lien: '',
                        })
                      } catch (err) {
                        setFormStatus({
                          type: 'error',
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                        })
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre*
                      </label>
                      <input
                        type="text"
                        value={actualiteForm.Titre}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, Titre: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Titre de l'actualité"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date*
                      </label>
                      <input
                        type="date"
                        value={actualiteForm.Date}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, Date: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media*
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={actualiteForm.media}
                          onChange={(e) => {
                            setActualiteForm({ ...actualiteForm, media: e.target.value })
                            setIsMediaDropdownOpen(true)
                          }}
                          onFocus={() => setIsMediaDropdownOpen(true)}
                          onBlur={() => {
                            // Délai pour permettre le clic sur une option
                            setTimeout(() => setIsMediaDropdownOpen(false), 200)
                          }}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Ex : Le Monde, CNIL..."
                        />
                        {isMediaDropdownOpen && availableMedias.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {availableMedias
                              .filter((media) =>
                                actualiteForm.media === '' ||
                                media.toLowerCase().includes(actualiteForm.media.toLowerCase())
                              )
                              .map((media) => (
                                <button
                                  key={media}
                                  type="button"
                                  onClick={() => {
                                    setActualiteForm({ ...actualiteForm, media })
                                    setIsMediaDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {media}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien*
                      </label>
                      <input
                        type="url"
                        value={actualiteForm.lien}
                        onChange={(e) => setActualiteForm({ ...actualiteForm, lien: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setActualiteForm({
                            Titre: '',
                            Date: '',
                            media: '',
                            lien: '',
                          })
                        }
                        className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter l’actualité'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedAction === 'consulter-actus' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter et modifier les actualités</h2>
                      <p className="text-gray-600 mt-2">Gérez toutes les actualités existantes : modifiez ou supprimez-les.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredActualites.length} actualité{filteredActualites.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Barre de recherche et filtres */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rechercher
                        </label>
                        <input
                          type="text"
                          value={actualitesSearch}
                          onChange={(e) => setActualitesSearch(e.target.value)}
                          placeholder="Rechercher par titre, média ou lien..."
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>
                      <div className="sm:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filtrer par média
                        </label>
                        <select
                          value={actualitesMediaFilter}
                          onChange={(e) => setActualitesMediaFilter(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        >
                          <option value="">Tous les médias</option>
                          {uniqueMedias.map((media) => (
                            <option key={media} value={media}>
                              {media}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Liste des actualités */}
                  {isLoadingActualites ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des actualités...</p>
                    </div>
                  ) : filteredActualites.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">
                        {actualitesSearch || actualitesMediaFilter
                          ? 'Aucune actualité ne correspond à votre recherche.'
                          : 'Aucune actualité trouvée.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredActualites.map((actu) => (
                        <div
                          key={actu.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {actu.Titre}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(actu.Date).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                      </svg>
                                      {actu.media}
                                    </span>
                                  </div>
                                  <a
                                    href={actu.lien}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#774792] hover:text-[#8a5ba3] hover:underline text-sm mt-2 inline-flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Voir l'article
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 lg:flex-col">
                              <button
                                onClick={() => handleEditActualite(actu)}
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(actu.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedAction === 'consulter-docs' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter et modifier les documents</h2>
                      <p className="text-gray-600 mt-2">Gérez tous les documents existants : modifiez ou supprimez-les.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredDocs.length} document{filteredDocs.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Barre de recherche et filtres */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rechercher
                        </label>
                        <input
                          type="text"
                          value={docsSearch}
                          onChange={(e) => setDocsSearch(e.target.value)}
                          placeholder="Rechercher par titre, auteur, résumé, thèmes..."
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>
                      <div className="sm:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filtrer par langue
                        </label>
                        <select
                          value={docsLangueFilter}
                          onChange={(e) => setDocsLangueFilter(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        >
                          <option value="">Toutes les langues</option>
                          {uniqueLangues.map((langue) => (
                            <option key={langue} value={langue}>
                              {langue}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Liste des docs */}
                  {isLoadingDocs ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des documents...</p>
                    </div>
                  ) : filteredDocs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">
                        {docsSearch || docsLangueFilter
                          ? 'Aucun document ne correspond à votre recherche.'
                          : 'Aucun document trouvé.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                {doc.titre}
                              </h3>
                              <div className="space-y-2 text-sm text-gray-600">
                                {doc.auteur && (
                                  <p>
                                    <span className="font-medium">Auteur :</span> {doc.auteur}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">Date :</span>{' '}
                                  {new Date(doc.date).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                {doc.themes && (
                                  <p>
                                    <span className="font-medium">Thèmes :</span> {doc.themes}
                                  </p>
                                )}
                                {doc.langue && (
                                  <p>
                                    <span className="font-medium">Langue :</span> {doc.langue}
                                  </p>
                                )}
                                {doc.resume && (
                                  <p className="mt-2 text-gray-700 line-clamp-2">{doc.resume}</p>
                                )}
                              </div>
                              <a
                                href={doc.lien}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#774792] hover:text-[#8a5ba3] hover:underline text-sm mt-3 inline-flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Voir le document
                              </a>
                            </div>
                            <div className="flex gap-2 lg:flex-col">
                              <button
                                onClick={() => handleEditDoc(doc)}
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => setDeleteDocConfirmId(doc.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedAction === 'consulter-doctrine' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter et modifier les articles de doctrine</h2>
                      <p className="text-gray-600 mt-2">Gérez tous les articles de doctrine existants : modifiez ou supprimez-les.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredDoctrine.length} article{filteredDoctrine.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Barre de recherche et filtres */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rechercher
                        </label>
                        <input
                          type="text"
                          value={doctrineSearch}
                          onChange={(e) => setDoctrineSearch(e.target.value)}
                          placeholder="Rechercher par titre, auteur, résumé, thème..."
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>
                      <div className="sm:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filtrer par thème
                        </label>
                        <select
                          value={doctrineThemeFilter}
                          onChange={(e) => setDoctrineThemeFilter(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        >
                          <option value="">Tous les thèmes</option>
                          {uniqueThemes.map((theme) => (
                            <option key={theme} value={theme}>
                              {theme}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Liste de la doctrine */}
                  {isLoadingDoctrine ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des articles...</p>
                    </div>
                  ) : filteredDoctrine.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-gray-500">
                        {doctrineSearch || doctrineThemeFilter
                          ? 'Aucun article ne correspond à votre recherche.'
                          : 'Aucun article trouvé.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDoctrine.map((doctrine) => (
                        <div
                          key={doctrine.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                {doctrine.titre}
                              </h3>
                              <div className="space-y-2 text-sm text-gray-600">
                                {doctrine.auteur && (
                                  <p>
                                    <span className="font-medium">Auteur :</span> {doctrine.auteur}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">Date :</span>{' '}
                                  {new Date(doctrine.date).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                {doctrine.theme && (
                                  <p>
                                    <span className="font-medium">Thème :</span> {doctrine.theme}
                                  </p>
                                )}
                                {doctrine.abstract && (
                                  <p className="mt-2 text-gray-700 line-clamp-3">{doctrine.abstract}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 lg:flex-col">
                              <button
                                onClick={() => handleEditDoctrine(doctrine)}
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => setDeleteDoctrineConfirmId(doctrine.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedAction === 'ajouter-document' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter un document</h2>
                  <p className="text-gray-600 mb-6">
                    Les champs ci-dessous correspondent à la table <code>docs</code> de Supabase. L&apos;ID est généré automatiquement.
                  </p>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/docs`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            titre: docForm.titre.trim(),
                            auteur: docForm.auteur.trim() || null,
                            lien: docForm.lien.trim(),
                            date: docForm.date,
                            resume: docForm.resume.trim(),
                            themes: docForm.themes.trim(),
                            langue: docForm.langue.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
                        }

                        // Ajouter le nouvel auteur à la liste s'il n'existe pas déjà
                        const newAuteur = docForm.auteur.trim()
                        if (newAuteur && !availableAuteurs.includes(newAuteur)) {
                          setAvailableAuteurs((prev) => [...prev, newAuteur].sort())
                        }

                        // Ajouter la nouvelle langue à la liste si elle n'existe pas déjà
                        const newLangue = docForm.langue.trim()
                        if (newLangue && !availableLangues.includes(newLangue)) {
                          setAvailableLangues((prev) => [...prev, newLangue].sort())
                        }

                        // Ajouter les nouveaux thèmes à la liste
                        const newThemes = docForm.themes
                          .split(',')
                          .map(t => t.trim())
                          .filter(t => t && !availableThemes.includes(t))
                        if (newThemes.length > 0) {
                          setAvailableThemes((prev) => [...prev, ...newThemes].sort())
                        }

                        setFormStatus({ type: 'success', message: 'Document ajouté avec succès.' })
                        setDocForm({
                          titre: '',
                          auteur: '',
                          lien: '',
                          date: '',
                          resume: '',
                          themes: '',
                          langue: '',
                        })
                      } catch (err) {
                        setFormStatus({
                          type: 'error',
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                        })
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre*
                      </label>
                      <input
                        type="text"
                        value={docForm.titre}
                        onChange={(e) => setDocForm({ ...docForm, titre: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Titre du document"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auteur
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={docForm.auteur}
                          onChange={(e) => {
                            setDocForm({ ...docForm, auteur: e.target.value })
                            setIsAuteurDropdownOpen(true)
                          }}
                          onFocus={() => setIsAuteurDropdownOpen(true)}
                          onBlur={() => {
                            setTimeout(() => setIsAuteurDropdownOpen(false), 200)
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Nom de l'auteur"
                        />
                        {isAuteurDropdownOpen && availableAuteurs.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {availableAuteurs
                              .filter((auteur) =>
                                docForm.auteur === '' ||
                                auteur.toLowerCase().includes(docForm.auteur.toLowerCase())
                              )
                              .map((auteur) => (
                                <button
                                  key={auteur}
                                  type="button"
                                  onClick={() => {
                                    setDocForm({ ...docForm, auteur })
                                    setIsAuteurDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {auteur}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date*
                      </label>
                      <input
                        type="date"
                        value={docForm.date}
                        onChange={(e) => setDocForm({ ...docForm, date: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien*
                      </label>
                      <input
                        type="url"
                        value={docForm.lien}
                        onChange={(e) => setDocForm({ ...docForm, lien: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Résumé*
                      </label>
                      <textarea
                        value={docForm.resume}
                        onChange={(e) => setDocForm({ ...docForm, resume: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        placeholder="Résumé du document"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thèmes (séparés par des virgules)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={docForm.themes}
                          onChange={(e) => {
                            setDocForm({ ...docForm, themes: e.target.value })
                            setIsThemesDropdownOpen(true)
                          }}
                          onFocus={() => setIsThemesDropdownOpen(true)}
                          onBlur={() => {
                            setTimeout(() => setIsThemesDropdownOpen(false), 200)
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Ex : conformité, gouvernance, risques"
                        />
                        {isThemesDropdownOpen && availableThemes.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {availableThemes
                              .filter((theme) => {
                                const currentThemes = docForm.themes.split(',').map(t => t.trim().toLowerCase())
                                const isAlreadyAdded = currentThemes.includes(theme.toLowerCase())
                                if (isAlreadyAdded) return false
                                
                                // Si le champ est vide ou se termine par une virgule, montrer tous les thèmes
                                const trimmed = docForm.themes.trim()
                                if (trimmed === '' || trimmed.endsWith(',')) return true
                                
                                // Sinon, filtrer selon le dernier terme après la dernière virgule
                                const lastPart = trimmed.split(',').pop()?.trim().toLowerCase() || ''
                                return lastPart === '' || theme.toLowerCase().includes(lastPart)
                              })
                              .map((theme) => (
                                <button
                                  key={theme}
                                  type="button"
                                  onClick={() => {
                                    const trimmed = docForm.themes.trim()
                                    if (trimmed === '' || trimmed.endsWith(',')) {
                                      // Ajouter le thème à la fin
                                      setDocForm({ ...docForm, themes: trimmed ? `${trimmed} ${theme}` : theme })
                                    } else {
                                      // Remplacer le dernier terme par le thème sélectionné
                                      const parts = trimmed.split(',')
                                      parts[parts.length - 1] = theme
                                      setDocForm({ ...docForm, themes: parts.join(', ') })
                                    }
                                    setIsThemesDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {theme}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue(s)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={docForm.langue}
                          onChange={(e) => {
                            setDocForm({ ...docForm, langue: e.target.value })
                            setIsLangueDropdownOpen(true)
                          }}
                          onFocus={() => setIsLangueDropdownOpen(true)}
                          onBlur={() => {
                            setTimeout(() => setIsLangueDropdownOpen(false), 200)
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Ex : FR, EN"
                        />
                        {isLangueDropdownOpen && availableLangues.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {availableLangues
                              .filter((langue) =>
                                docForm.langue === '' ||
                                langue.toLowerCase().includes(docForm.langue.toLowerCase())
                              )
                              .map((langue) => (
                                <button
                                  key={langue}
                                  type="button"
                                  onClick={() => {
                                    setDocForm({ ...docForm, langue })
                                    setIsLangueDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {langue}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDocForm({
                            titre: '',
                            auteur: '',
                            lien: '',
                            date: '',
                            resume: '',
                            themes: '',
                            langue: '',
                          })
                        }
                        className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter le document'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedAction === 'ajouter-article-doctrine' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter un article de doctrine</h2>
                  <p className="text-gray-600 mb-6">
                    Les champs ci-dessous correspondent à la table <code>doctrine</code> de Supabase. L&apos;ID est généré automatiquement.
                  </p>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  <form
                    className="space-y-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/doctrine`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            titre: doctrineForm.titre.trim(),
                            date: doctrineForm.date,
                            abstract: doctrineForm.abstract.trim(),
                            intro: doctrineForm.intro.trim(),
                            titre1: doctrineForm.titre1.trim(),
                            'sous-titre1': doctrineForm['sous-titre1'].trim(),
                            contenu1: doctrineForm.contenu1.trim(),
                            'sous-titre2': doctrineForm['sous-titre2'].trim(),
                            contenu2: doctrineForm.contenu2.trim(),
                            titre2: doctrineForm.titre2.trim(),
                            'sous-titre3': doctrineForm['sous-titre3'].trim(),
                            contenu3: doctrineForm.contenu3.trim(),
                            'sous-titre4': doctrineForm['sous-titre4'].trim(),
                            contenu4: doctrineForm.contenu4.trim(),
                            conclusion: doctrineForm.conclusion.trim(),
                            references: doctrineForm.references.trim(),
                            auteur: doctrineForm.auteur.trim(),
                            theme: doctrineForm.theme.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
                        }

                        setFormStatus({ type: 'success', message: 'Article de doctrine ajouté avec succès.' })
                        setDoctrineForm({
                          titre: '',
                          date: '',
                          abstract: '',
                          intro: '',
                          titre1: '',
                          'sous-titre1': '',
                          contenu1: '',
                          'sous-titre2': '',
                          contenu2: '',
                          titre2: '',
                          'sous-titre3': '',
                          contenu3: '',
                          'sous-titre4': '',
                          contenu4: '',
                          conclusion: '',
                          references: '',
                          auteur: '',
                          theme: '',
                        })
                      } catch (err) {
                        setFormStatus({
                          type: 'error',
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                        })
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre*
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.titre}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, titre: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Titre de l'article"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date*
                        </label>
                        <input
                          type="date"
                          value={doctrineForm.date}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, date: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auteur*
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.auteur}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, auteur: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Nom de l'auteur"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thème
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.theme}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, theme: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                          placeholder="Ex : gouvernance, transparence..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Résumé (abstract)*
                      </label>
                      <textarea
                        value={doctrineForm.abstract}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, abstract: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introduction*
                      </label>
                      <textarea
                        value={doctrineForm.intro}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, intro: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre de la première partie (titre1)
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.titre1}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, titre1: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 1.1
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre1']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre1': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 1.1
                        </label>
                        <textarea
                          value={doctrineForm.contenu1}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu1: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 1.2
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre2']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre2': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 1.2
                        </label>
                        <textarea
                          value={doctrineForm.contenu2}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu2: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre de la deuxième partie (titre2)
                        </label>
                        <input
                          type="text"
                          value={doctrineForm.titre2}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, titre2: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 2.1
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre3']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre3': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 2.1
                        </label>
                        <textarea
                          value={doctrineForm.contenu3}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu3: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre 2.2
                        </label>
                        <input
                          type="text"
                          value={doctrineForm['sous-titre4']}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, 'sous-titre4': e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu 2.2
                        </label>
                        <textarea
                          value={doctrineForm.contenu4}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, contenu4: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conclusion
                      </label>
                      <textarea
                        value={doctrineForm.conclusion}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, conclusion: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Références (une par ligne)
                      </label>
                      <textarea
                        value={doctrineForm.references}
                        onChange={(e) => setDoctrineForm({ ...doctrineForm, references: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDoctrineForm({
                            titre: '',
                            date: '',
                            abstract: '',
                            intro: '',
                            titre1: '',
                            'sous-titre1': '',
                            contenu1: '',
                            'sous-titre2': '',
                            contenu2: '',
                            titre2: '',
                            'sous-titre3': '',
                            contenu3: '',
                            'sous-titre4': '',
                            contenu4: '',
                            conclusion: '',
                            references: '',
                            auteur: '',
                            theme: '',
                          })
                        }
                        className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter l’article de doctrine'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste des adhérents */}
              {(selectedAction === 'consulter-adherents' || selectedAction === 'supprimer-adherent') && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {selectedAction === 'supprimer-adherent' ? 'Supprimer un adhérent' : 'Liste des adhérents'}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {selectedAction === 'supprimer-adherent' 
                          ? 'Sélectionnez un adhérent à supprimer. Cette action est irréversible.'
                          : 'Consultez la liste de tous les adhérents inscrits.'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredAdherents.length} adhérent{filteredAdherents.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Barre de recherche et filtres */}
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rechercher
                      </label>
                      <input
                        type="text"
                        value={adherentsSearch}
                        onChange={(e) => setAdherentsSearch(e.target.value)}
                        placeholder="Rechercher par email, nom, prénom ou profession..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      />
                    </div>
                    
                    {/* Filtres et export */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAdherentsFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            adherentsFilter === 'all'
                              ? 'bg-[#774792] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Tous les adhérents
                        </button>
                        <button
                          onClick={() => setAdherentsFilter('with-consent')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            adherentsFilter === 'with-consent'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Avec consentement prospection
                        </button>
                      </div>
                      
                      {adherentsFilter === 'with-consent' && (
                        <button
                          onClick={exportAdherentsWithConsentToExcel}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Exporter en Excel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Liste des adhérents */}
                  {isLoadingAdherents ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des adhérents...</p>
                    </div>
                  ) : filteredAdherents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-gray-500">
                        {adherentsSearch
                          ? 'Aucun adhérent ne correspond à votre recherche.'
                          : 'Aucun adhérent inscrit.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAdherents.map((adherent) => (
                        <div
                          key={adherent.id}
                          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {(adherent.prenom?.[0] || adherent.email[0]).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {adherent.prenom || adherent.nom 
                                      ? `${adherent.prenom || ''} ${adherent.nom || ''}`.trim()
                                      : 'Nom non renseigné'}
                                  </p>
                                  <p className="text-sm text-gray-600">{adherent.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {adherent.profession && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                    {adherent.profession}
                                  </span>
                                )}
                                {adherent.consentement_prospection === true && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Consentement prospection
                                  </span>
                                )}
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  Inscrit le {new Date(adherent.created_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                            {selectedAction === 'supprimer-adherent' && (
                              <button
                                onClick={() => setDeleteAdherentConfirmId(adherent.id)}
                                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section Demandes de suppression */}
              {selectedAction === 'demandes-suppression' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Demandes de suppression de compte
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Gérez les demandes de suppression de compte des adhérents.
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredDeletionRequests.length} demande{filteredDeletionRequests.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Filtres par statut */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => setDeletionRequestFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        deletionRequestFilter === 'all'
                          ? 'bg-[#774792] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Toutes
                    </button>
                    <button
                      onClick={() => setDeletionRequestFilter('pending')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        deletionRequestFilter === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => setDeletionRequestFilter('processing')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        deletionRequestFilter === 'processing'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      En traitement
                    </button>
                    <button
                      onClick={() => setDeletionRequestFilter('completed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        deletionRequestFilter === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Traitées
                    </button>
                    <button
                      onClick={() => setDeletionRequestFilter('cancelled')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        deletionRequestFilter === 'cancelled'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Annulées
                    </button>
                  </div>

                  {/* Liste des demandes */}
                  {isLoadingDeletionRequests ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des demandes...</p>
                    </div>
                  ) : filteredDeletionRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">
                        {deletionRequestFilter === 'all'
                          ? 'Aucune demande de suppression.'
                          : `Aucune demande avec le statut "${deletionRequestFilter}".`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDeletionRequests.map((request) => (
                        <div
                          key={request.id}
                          className={`bg-white border rounded-xl p-5 ${
                            request.status === 'pending'
                              ? 'border-yellow-300 bg-yellow-50'
                              : request.status === 'processing'
                              ? 'border-blue-300 bg-blue-50'
                              : request.status === 'completed'
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                  request.status === 'pending'
                                    ? 'bg-yellow-500'
                                    : request.status === 'processing'
                                    ? 'bg-blue-500'
                                    : request.status === 'completed'
                                    ? 'bg-green-500'
                                    : 'bg-gray-500'
                                }`}>
                                  {request.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{request.email}</p>
                                  <p className="text-sm text-gray-600">
                                    Demandé le {new Date(request.requested_at).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              {request.reason && (
                                <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Motif :</p>
                                  <p className="text-sm text-gray-700">{request.reason}</p>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  request.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : request.status === 'processing'
                                    ? 'bg-blue-100 text-blue-700'
                                    : request.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {request.status === 'pending' && 'En attente'}
                                  {request.status === 'processing' && 'En traitement'}
                                  {request.status === 'completed' && 'Traité'}
                                  {request.status === 'cancelled' && 'Annulé'}
                                </span>
                                {request.processed_at && (
                                  <span className="text-xs text-gray-500">
                                    Traité le {new Date(request.processed_at).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {request.status === 'pending' && (
                              <button
                                onClick={() => handleProcessDeletionRequest(request.id, request.user_id)}
                                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer le compte
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!selectedAction && (
                <AdminDashboard onActionSelect={(action) => setSelectedAction(action as AdminAction)} />
              )}

              {selectedAction === 'ajouter-question' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter une question de quiz</h2>
                  <p className="text-gray-600 mb-6">Renseignez les champs ci-dessous. Le champ <code>Id</code> est généré automatiquement.</p>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const headers = getAuthHeaders()
                        const response = await fetch(`${supabaseUrl}/rest/v1/questions`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({
                            Question: questionForm.Question.trim(),
                            BR: questionForm.BR.trim(),
                            MR1: questionForm.MR1.trim(),
                            MR2: questionForm.MR2.trim(),
                            MR3: questionForm.MR3.trim(),
                            Explication: questionForm.Explication.trim(),
                            Theme: questionForm.Theme.trim(),
                          }),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          throw new Error(text || `Erreur Supabase (${response.status})`)
                        }

                        setFormStatus({ type: 'success', message: 'Question ajoutée avec succès.' })
                        setQuestionForm({
                          Question: '',
                          BR: '',
                          MR1: '',
                          MR2: '',
                          MR3: '',
                          Explication: '',
                          Theme: '',
                        })
                      } catch (err) {
                        setFormStatus({
                          type: 'error',
                          message: err instanceof Error ? err.message : 'Une erreur est survenue.',
                        })
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question*
                      </label>
                      <textarea
                        value={questionForm.Question}
                        onChange={(e) => setQuestionForm({ ...questionForm, Question: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[100px]"
                        placeholder="Texte de la question"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonne réponse (BR)*
                      </label>
                      <input
                        type="text"
                        value={questionForm.BR}
                        onChange={(e) => setQuestionForm({ ...questionForm, BR: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Bonne réponse"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thème
                      </label>
                      <input
                        type="text"
                        value={questionForm.Theme}
                        onChange={(e) => setQuestionForm({ ...questionForm, Theme: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Ex : conformité, gouvernance..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mauvaise réponse 1 (MR1)*
                      </label>
                      <input
                        type="text"
                        value={questionForm.MR1}
                        onChange={(e) => setQuestionForm({ ...questionForm, MR1: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Mauvaise réponse 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mauvaise réponse 2 (MR2)*
                      </label>
                      <input
                        type="text"
                        value={questionForm.MR2}
                        onChange={(e) => setQuestionForm({ ...questionForm, MR2: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Mauvaise réponse 2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mauvaise réponse 3 (MR3)*
                      </label>
                      <input
                        type="text"
                        value={questionForm.MR3}
                        onChange={(e) => setQuestionForm({ ...questionForm, MR3: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Mauvaise réponse 3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explication*
                      </label>
                      <textarea
                        value={questionForm.Explication}
                        onChange={(e) => setQuestionForm({ ...questionForm, Explication: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                        placeholder="Explication de la bonne réponse"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setQuestionForm({
                            Question: '',
                            BR: '',
                            MR1: '',
                            MR2: '',
                            MR3: '',
                            Explication: '',
                            Theme: '',
                          })
                        }
                        className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter la question'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedAction === 'consulter-questions' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter et modifier les questions de quiz</h2>
                      <p className="text-gray-600 mt-2">Gérez toutes les questions existantes : modifiez ou supprimez-les.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredQuestions.length} question{filteredQuestions.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Barre de recherche et filtres */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rechercher
                        </label>
                        <input
                          type="text"
                          value={questionsSearch}
                          onChange={(e) => setQuestionsSearch(e.target.value)}
                          placeholder="Rechercher par question, réponse, explication, thème..."
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                      </div>
                      <div className="sm:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filtrer par thème
                        </label>
                        <select
                          value={questionsThemeFilter}
                          onChange={(e) => setQuestionsThemeFilter(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        >
                          <option value="">Tous les thèmes</option>
                          {uniqueQuestionThemes.map((theme) => (
                            <option key={theme} value={theme}>
                              {theme}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Liste des questions */}
                  {isLoadingQuestions ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des questions...</p>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">
                        {questionsSearch || questionsThemeFilter
                          ? 'Aucune question ne correspond à votre recherche.'
                          : 'Aucune question trouvée.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuestions.map((q) => (
                        <div
                          key={q.Id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                {q.Question}
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-green-700">✓ Bonne réponse :</span>{' '}
                                  <span className="text-gray-700">{q.BR}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-red-700">✗ Mauvaises réponses :</span>{' '}
                                  <span className="text-gray-600">{q.MR1}, {q.MR2}, {q.MR3}</span>
                                </div>
                                {q.Theme && (
                                  <div>
                                    <span className="font-medium text-gray-700">Thème :</span>{' '}
                                    <span className="text-gray-600">{q.Theme}</span>
                                  </div>
                                )}
                                {q.Explication && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Explication :</span>{' '}
                                    <span className="text-gray-600">{q.Explication}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 lg:flex-col">
                              <button
                                onClick={() => handleEditQuestion(q)}
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => setDeleteQuestionConfirmId(q.Id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedAction === 'consulter-assistant-ria' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter les questions de l'assistant RIA</h2>
                      <p className="text-gray-600 mt-2">Consultez et supprimez les questions posées par les utilisateurs.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredAssistantRIAQuestions.length} question{filteredAssistantRIAQuestions.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Barre de recherche */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher
                    </label>
                    <input
                      type="text"
                      value={assistantRIASearch}
                      onChange={(e) => setAssistantRIASearch(e.target.value)}
                      placeholder="Rechercher par question..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                    />
                  </div>

                  {/* Liste des questions */}
                  {isLoadingAssistantRIA ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des questions...</p>
                    </div>
                  ) : filteredAssistantRIAQuestions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">
                        {assistantRIASearch
                          ? 'Aucune question ne correspond à votre recherche.'
                          : 'Aucune question trouvée.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAssistantRIAQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-gray-800 mb-2">{q.question}</p>
                              {q.created_at && (
                                <p className="text-xs text-gray-500">
                                  {new Date(q.created_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeleteAssistantRIAConfirmId(q.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedAction === 'enrichir-article' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Enrichir un article</h2>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez un article par son numéro, puis complétez ou modifiez les champs ci-dessous :{' '}
                    <span className="font-medium">considérants (recitals)</span>, <span className="font-medium">résumé</span>,{' '}
                    <span className="font-medium">fiches pratiques</span> et <span className="font-medium">document associé</span>.
                  </p>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Sélection de l'article par numéro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner l&apos;article (par numéro)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:max-w-md">
                          <button
                            type="button"
                            onClick={() => setIsArticleDropdownOpen((v) => !v)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-left hover:border-[#774792] focus:outline-none focus:ring-2 focus:ring-purple-200"
                          >
                            <span className="truncate text-sm text-gray-800">
                              {selectedArticle
                                ? `${selectedArticle.numero} — ${selectedArticle.titre}`
                                : 'Choisir un article…'}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                isArticleDropdownOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {isArticleDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-hidden">
                              <div className="p-2 border-b border-gray-100 bg-gray-50">
                                <input
                                  type="text"
                                  value={articleSearch}
                                  onChange={(e) => setArticleSearch(e.target.value)}
                                  placeholder="Filtrer par numéro ou titre…"
                                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-300"
                                />
                              </div>
                              <div className="max-h-56 overflow-y-auto">
                                {filteredArticles.length === 0 ? (
                                  <div className="px-4 py-3 text-xs text-gray-500">
                                    Aucun article ne correspond à votre recherche.
                                  </div>
                                ) : (
                                  filteredArticles.map((article) => (
                                    <button
                                      key={article.id_article}
                                      type="button"
                                      onClick={async () => {
                                        const value = article.id_article
                                        setSelectedArticleId(value)
                                        setIsArticleDropdownOpen(false)
                                        setArticleSearch('')
                                        setFormStatus({ type: null, message: '' })

                                        setIsLoadingArticle(true)
                                        try {
                                          const { data, error } = await supabasePublic
                                            .from('article')
                                            .select('id_article, numero, titre, resume, recitals, fiches, doc_associee')
                                            .eq('id_article', value)
                                            .single()

                                          if (error) throw error

                                          setEnrichForm({
                                            numero: data.numero ?? '',
                                            titre: data.titre ?? '',
                                            resume: data.resume ?? '',
                                            recitals: data.recitals ?? '',
                                            fiches: data.fiches ?? '',
                                            doc_associee: (data as any).doc_associee ?? '',
                                          })
                                        } catch (err) {
                                          console.error('Erreur lors du chargement de l’article à enrichir:', err)
                                          setFormStatus({
                                            type: 'error',
                                            message:
                                              "Impossible de charger cet article. Réessayez ou choisissez-en un autre.",
                                          })
                                        } finally {
                                          setIsLoadingArticle(false)
                                        }
                                      }}
                                      className={`w-full px-4 py-2 text-sm text-left flex flex-col gap-0.5 hover:bg-purple-50 ${
                                        selectedArticleId === article.id_article ? 'bg-purple-50' : ''
                                      }`}
                                    >
                                      <span className="font-medium text-gray-900">{article.numero}</span>
                                      <span className="text-xs text-gray-600 truncate">{article.titre}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {isLoadingArticle && (
                          <span className="text-sm text-gray-500 flex items-center">
                            Chargement de l&apos;article…
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedArticleId && (
                      <form
                        className="space-y-5 mt-4"
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (!selectedArticleId) return
                          setIsSubmitting(true)
                          setFormStatus({ type: null, message: '' })

                          try {
                            const headers = getAuthHeaders()
                            const response = await fetch(
                              `${supabaseUrl}/rest/v1/article?id_article=eq.${selectedArticleId}`,
                              {
                                method: 'PATCH',
                                headers,
                                body: JSON.stringify({
                                  resume: enrichForm.resume.trim(),
                                  recitals: enrichForm.recitals.trim(),
                                  fiches: enrichForm.fiches.trim(),
                                  doc_associee: enrichForm.doc_associee.trim() || null,
                                }),
                              }
                            )

                            if (!response.ok) {
                              const text = await response.text()
                              throw new Error(text || `Erreur Supabase (${response.status})`)
                            }

                            setFormStatus({
                              type: 'success',
                              message: 'Article enrichi avec succès.',
                            })
                          } catch (err) {
                            console.error('Erreur lors de la mise à jour de l’article:', err)
                            setFormStatus({
                              type: 'error',
                              message:
                                err instanceof Error
                                  ? err.message
                                  : "Une erreur est survenue lors de l'enregistrement.",
                            })
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                      >
                        {/* Rappel numéro + titre */}
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                          <p className="text-sm text-purple-900 font-medium">
                            Article sélectionné :{' '}
                            <span className="font-semibold">
                              {enrichForm.numero} — {enrichForm.titre}
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Considérants associés (champ <code>recitals</code>)
                            </label>
                            <input
                              type="text"
                              value={enrichForm.recitals}
                              onChange={(e) => setEnrichForm({ ...enrichForm, recitals: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                              placeholder="Ex : 12, 13-16, 20"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Format suggéré : liste de numéros séparés par des virgules et/ou des intervalles (par exemple
                              &quot;12, 13-16, 20&quot;).
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Résumé de l&apos;article (champ <code>resume</code>)
                            </label>
                            <textarea
                              value={enrichForm.resume}
                              onChange={(e) => setEnrichForm({ ...enrichForm, resume: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                              placeholder="Résumé pédagogique de l'article…"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fiches pratiques associées (champ <code>fiches</code>)
                            </label>
                            <textarea
                              value={enrichForm.fiches}
                              onChange={(e) => setEnrichForm({ ...enrichForm, fiches: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[80px]"
                              placeholder='Ex : "/fiches-pratiques/exactitude", "/fiches-pratiques/controle-humain"…'
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Vous pouvez saisir des chemins internes (ex. <code>/fiches-pratiques/exactitude</code>) ou des
                              URLs complètes, séparées par des virgules.
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Document associé (champ <code>doc_associee</code>)
                            </label>
                            <input
                              type="text"
                              value={enrichForm.doc_associee}
                              onChange={(e) => setEnrichForm({ ...enrichForm, doc_associee: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                              placeholder="Titre du document suivi du lien (ex: Guide pratique https://example.com/doc.pdf)"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Format : Titre suivi d'un espace puis le lien (ex: Guide pratique https://example.com/doc.pdf)
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEnrichForm({
                                numero: enrichForm.numero,
                                titre: enrichForm.titre,
                                resume: '',
                                recitals: '',
                                fiches: '',
                                doc_associee: '',
                              })
                              setFormStatus({ type: null, message: '' })
                            }}
                            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                          >
                            Réinitialiser les champs
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

      {/* Modal de modification d'actualité */}
      {isEditModalOpen && editingActualite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Modifier l'actualité</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingActualite(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form
              className="p-6 space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveEdit()
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre*
                </label>
                <input
                  type="text"
                  value={actualiteEditForm.Titre}
                  onChange={(e) => setActualiteEditForm({ ...actualiteEditForm, Titre: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  placeholder="Titre de l'actualité"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date*
                  </label>
                  <input
                    type="date"
                    value={actualiteEditForm.Date}
                    onChange={(e) => setActualiteEditForm({ ...actualiteEditForm, Date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media*
                  </label>
                  <input
                    type="text"
                    value={actualiteEditForm.media}
                    onChange={(e) => setActualiteEditForm({ ...actualiteEditForm, media: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                    placeholder="Ex : Le Monde, CNIL..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien*
                </label>
                <input
                  type="url"
                  value={actualiteEditForm.lien}
                  onChange={(e) => setActualiteEditForm({ ...actualiteEditForm, lien: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingActualite(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir supprimer cette actualité ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteActualite(deleteConfirmId)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'un doc */}
      {isEditDocModalOpen && editingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Modifier le document</h3>
                <button
                  onClick={() => {
                    setIsEditDocModalOpen(false)
                    setEditingDoc(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form
              className="p-6 space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveDocEdit()
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre*
                  </label>
                  <input
                    type="text"
                    value={docEditForm.titre}
                    onChange={(e) => setDocEditForm({ ...docEditForm, titre: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur
                  </label>
                  <input
                    type="text"
                    value={docEditForm.auteur}
                    onChange={(e) => setDocEditForm({ ...docEditForm, auteur: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date*
                  </label>
                  <input
                    type="date"
                    value={docEditForm.date}
                    onChange={(e) => setDocEditForm({ ...docEditForm, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien*
                  </label>
                  <input
                    type="url"
                    value={docEditForm.lien}
                    onChange={(e) => setDocEditForm({ ...docEditForm, lien: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Résumé*
                  </label>
                  <textarea
                    value={docEditForm.resume}
                    onChange={(e) => setDocEditForm({ ...docEditForm, resume: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thèmes
                  </label>
                  <input
                    type="text"
                    value={docEditForm.themes}
                    onChange={(e) => setDocEditForm({ ...docEditForm, themes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <input
                    type="text"
                    value={docEditForm.langue}
                    onChange={(e) => setDocEditForm({ ...docEditForm, langue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDocModalOpen(false)
                    setEditingDoc(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'un doc */}
      {deleteDocConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteDocConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteDoc(deleteDocConfirmId)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'un article de doctrine */}
      {isEditDoctrineModalOpen && editingDoctrine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Modifier l'article de doctrine</h3>
                <button
                  onClick={() => {
                    setIsEditDoctrineModalOpen(false)
                    setEditingDoctrine(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form
              className="p-6 space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveDoctrineEdit()
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre*
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm.titre}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, titre: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date*
                  </label>
                  <input
                    type="date"
                    value={doctrineEditForm.date}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur*
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm.auteur}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, auteur: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm.theme}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, theme: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Résumé (abstract)*
                  </label>
                  <textarea
                    value={doctrineEditForm.abstract}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, abstract: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction*
                  </label>
                  <textarea
                    value={doctrineEditForm.intro}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, intro: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la première partie (titre1)
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm.titre1}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, titre1: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre 1.1
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm['sous-titre1']}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, 'sous-titre1': e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu 1.1
                  </label>
                  <textarea
                    value={doctrineEditForm.contenu1}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, contenu1: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre 1.2
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm['sous-titre2']}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, 'sous-titre2': e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu 1.2
                  </label>
                  <textarea
                    value={doctrineEditForm.contenu2}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, contenu2: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la deuxième partie (titre2)
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm.titre2}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, titre2: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre 2.1
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm['sous-titre3']}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, 'sous-titre3': e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu 2.1
                  </label>
                  <textarea
                    value={doctrineEditForm.contenu3}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, contenu3: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre 2.2
                  </label>
                  <input
                    type="text"
                    value={doctrineEditForm['sous-titre4']}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, 'sous-titre4': e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu 2.2
                  </label>
                  <textarea
                    value={doctrineEditForm.contenu4}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, contenu4: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conclusion
                  </label>
                  <textarea
                    value={doctrineEditForm.conclusion}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, conclusion: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Références
                  </label>
                  <textarea
                    value={doctrineEditForm.references}
                    onChange={(e) => setDoctrineEditForm({ ...doctrineEditForm, references: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDoctrineModalOpen(false)
                    setEditingDoctrine(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'un article de doctrine */}
      {deleteDoctrineConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir supprimer cet article de doctrine ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteDoctrineConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteDoctrine(deleteDoctrineConfirmId)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'une question de quiz */}
      {isEditQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Modifier la question</h3>
                <button
                  onClick={() => {
                    setIsEditQuestionModalOpen(false)
                    setEditingQuestion(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form
              className="p-6 space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveQuestionEdit()
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question*
                  </label>
                  <textarea
                    value={questionEditForm.Question}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, Question: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonne réponse (BR)*
                  </label>
                  <input
                    type="text"
                    value={questionEditForm.BR}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, BR: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème
                  </label>
                  <input
                    type="text"
                    value={questionEditForm.Theme}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, Theme: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mauvaise réponse 1 (MR1)*
                  </label>
                  <input
                    type="text"
                    value={questionEditForm.MR1}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, MR1: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mauvaise réponse 2 (MR2)*
                  </label>
                  <input
                    type="text"
                    value={questionEditForm.MR2}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, MR2: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mauvaise réponse 3 (MR3)*
                  </label>
                  <input
                    type="text"
                    value={questionEditForm.MR3}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, MR3: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explication*
                  </label>
                  <textarea
                    value={questionEditForm.Explication}
                    onChange={(e) => setQuestionEditForm({ ...questionEditForm, Explication: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors min-h-[120px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditQuestionModalOpen(false)
                    setEditingQuestion(null)
                    setFormStatus({ type: null, message: '' })
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gestion des fichiers */}
              {selectedAction === 'gestion-fichiers' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Gestion des fichiers</h2>
                      <p className="text-gray-600 mt-2">
                        Upload, téléchargez et gérez vos fichiers (Excel, Word, PDF, etc.)
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filesList.length} fichier{filesList.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {/* Zone d'upload */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploader un fichier</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sélectionner un fichier
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept=".xlsx,.xls,.doc,.docx,.pdf"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Formats acceptés : Excel (.xlsx, .xls), Word (.doc, .docx), PDF (.pdf)
                        </p>
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <span>📄</span>
                          <span className="flex-1 min-w-0 truncate" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                          <span className="text-gray-500 flex-shrink-0">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                      <button
                        onClick={handleUploadFile}
                        disabled={!selectedFile || uploadingFile}
                        className="px-6 py-3 rounded-xl bg-[#774792] text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {uploadingFile ? 'Upload en cours...' : 'Uploader le fichier'}
                      </button>
                    </div>
                  </div>

                  {/* Liste des fichiers */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Fichiers disponibles</h3>
                    
                    {isLoadingFiles ? (
                      <div className="text-center py-8 text-gray-500">Chargement...</div>
                    ) : filesList.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Aucun fichier pour le moment. Uploadez votre premier fichier ci-dessus.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filesList.map((file) => {
                          const fileSize = file.metadata?.size 
                            ? `${(file.metadata.size / 1024 / 1024).toFixed(2)} MB`
                            : 'Taille inconnue'
                          const fileType = file.metadata?.mimetype || 'Type inconnu'
                          
                          return (
                            <div
                              key={file.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                  {fileType.includes('excel') || fileType.includes('spreadsheet') ? (
                                    <span className="text-2xl">📊</span>
                                  ) : fileType.includes('word') || fileType.includes('document') ? (
                                    <span className="text-2xl">📝</span>
                                  ) : fileType.includes('pdf') ? (
                                    <span className="text-2xl">📄</span>
                                  ) : (
                                    <span className="text-2xl">📁</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 truncate">{file.name}</p>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-gray-500">
                                    <span>{fileSize}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="break-all sm:break-normal">
                                      {new Date(file.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleDownloadFile(file.name)}
                                  className="px-3 sm:px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                                >
                                  Télécharger
                                </button>
                                <button
                                  onClick={() => setDeleteFileConfirmName(file.name)}
                                  className="px-3 sm:px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression d'une question de quiz */}
      {deleteQuestionConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteQuestionConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteQuestion(deleteQuestionConfirmId)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'une question de l'assistant RIA */}
      {deleteAssistantRIAConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteAssistantRIAConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteAssistantRIA(deleteAssistantRIAConfirmId)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'un adhérent */}
      {deleteAdherentConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Supprimer cet adhérent ?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cette action est irréversible. L'adhérent perdra son accès à tous les contenus réservés.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteAdherentConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteAdherent(deleteAdherentConfirmId)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'un fichier */}
      {deleteFileConfirmName !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Supprimer ce fichier ?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir supprimer "{deleteFileConfirmName}" ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteFileConfirmName(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteFile(deleteFileConfirmName)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default AdminConsolePage
