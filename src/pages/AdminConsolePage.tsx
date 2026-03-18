import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabasePublic } from '../lib/supabasePublic'
import { supabase } from '../lib/supabase'
import AdminDashboard from '../components/AdminDashboard'
import { FichePratiqueEditor, FichePratiqueSection } from '../components/FichePratiqueEditor'
import { FichesEditor, type FicheItem } from '../components/FichesEditor'

// Parser le champ fiches (string) en tableau titre/lien pour l'admin
function parseFichesString(fichesString: string): FicheItem[] {
  if (!fichesString || !fichesString.trim()) return []
  return fichesString
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.includes('|')) {
        const [titre, ...lienParts] = item.split('|')
        return { titre: titre.trim(), lien: lienParts.join('|').trim() }
      }
      return { titre: item, lien: item }
    })
}

function serializeFiches(fiches: FicheItem[]): string {
  return fiches
    .filter((f) => f.titre.trim() || f.lien.trim())
    .map((f) => `${f.titre.trim()}|${f.lien.trim()}`)
    .join('\n')
}

// Fonction utilitaire pour décoder un JWT et vérifier son expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp
    if (!exp) return true
    // Vérifier si le token expire dans les 30 prochaines secondes (marge de sécurité)
    return Date.now() / 1000 >= exp - 30
  } catch {
    return true
  }
}

const getLinkedInEmbedUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null

  // Si l'admin colle directement un <iframe ...>, on extrait le src
  const iframeSrcMatch = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)
  if (iframeSrcMatch?.[1]) return iframeSrcMatch[1]

  try {
    const parsed = new URL(raw)

    // URL d'embed déjà prête
    if (parsed.hostname === 'www.linkedin.com' && parsed.pathname.startsWith('/embed/feed/update')) return raw

    // URL de type .../activity-<id>-...
    const activityMatch = parsed.pathname.match(/activity-(\d+)-/)
    if (activityMatch?.[1]) {
      const id = activityMatch[1]
      return `https://www.linkedin.com/embed/feed/update/urn:li:share:${id}`
    }

    // Fallback: on tente d'extraire un identifiant numérique du chemin
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

const formatDateFr = (iso: string) => {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

type AdminAction =
  | 'ajouter-actualite'
  | 'consulter-actus'
  | 'veille'
  | 'actus-linkedin'
  | 'ajouter-article-doctrine'
  | 'consulter-doctrine'
  | 'ajouter-document'
  | 'consulter-docs'
  | 'enrichir-article'
  | 'ajouter-question'
  | 'consulter-questions'
  | 'consulter-assistant-ria'
  | 'consulter-rag-questions'
  | 'consulter-adherents'
  | 'supprimer-adherent'
  | 'gestion-fichiers'
  | 'demandes-suppression'
  | 'ajouter-fiche-pratique'
  | 'consulter-fiches-pratiques'
  | 'gestion-schemas'
  | 'notes-perso'
  | null

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
  image_url?: string
  image_contenu_url?: string
  published?: boolean
  show_linkedin_cta?: boolean
}

interface RiaSchema {
  id: number
  title: string
  image_url: string
  position: number
  published: boolean
  visible_to: 'all' | 'members'
  created_at?: string
}

interface VeilleGroupRow {
  id: number
  name: string
  position: number
}

interface VeilleLinkRow {
  id: number
  group_id: number
  label: string | null
  url: string
  position: number
  note?: string | null
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

interface RAGQuestion {
  id: number
  question: string
  sources?: string[]
  created_at?: string
}

interface FichePratique {
  id: number
  slug: string
  titre: string
  description: string
  categorie?: string
  duree?: string
  articles_ria: string[]
  concerne_rgpd?: boolean
  show_disclaimer?: boolean
  disclaimer_text?: string | null
  show_linkedin_cta?: boolean
  linkedin_cta_text?: string | null
  contenu: {
    sections: FichePratiqueSection[]
  }
  image_url?: string
  published?: boolean
  created_at?: string
  updated_at?: string
}

const DEFAULT_DISCLAIMER_TEXT =
  'Cette fiche pratique peut impliquer des simplifications pour faciliter la compréhension. Une lecture attentive du texte officiel du Règlement IA est nécessaire pour une application complète et précise.<br><br>Pour bénéficier d\'un accompagnement personnalisé par des experts, <a href="/contact" style="color: #774792; text-decoration: underline; font-weight: 600;">contactez-nous via le formulaire</a>.'

const DEFAULT_LINKEDIN_CTA_TEXT = 'Pour être informé des actualités,'

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
    image_url: '',
    image_contenu_url: '',
    show_linkedin_cta: true,
  })
  const [doctrineImageFile, setDoctrineImageFile] = useState<File | null>(null)
  const [doctrineImagePreview, setDoctrineImagePreview] = useState<string | null>(null)
  const [uploadingDoctrineImage, setUploadingDoctrineImage] = useState(false)
  const [doctrineContenuImageFile, setDoctrineContenuImageFile] = useState<File | null>(null)
  const [doctrineContenuImagePreview, setDoctrineContenuImagePreview] = useState<string | null>(null)
  const [uploadingDoctrineContenuImage, setUploadingDoctrineContenuImage] = useState(false)
  const [doctrinePublished, setDoctrinePublished] = useState(true)
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [articlesList, setArticlesList] = useState<Array<{ id_article: number; numero: string; titre: string }>>([])
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [isArticleDropdownOpen, setIsArticleDropdownOpen] = useState(false)
  const [articleSearch, setArticleSearch] = useState('')
  const [enrichForm, setEnrichForm] = useState<{
    numero: string
    titre: string
    resume: string
    recitals: string
    fiches: FicheItem[]
    doc_associee: string
  }>({
    numero: '',
    titre: '',
    resume: '',
    recitals: '',
    fiches: [],
    doc_associee: '',
  })
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)
  // Sidebar repliée par défaut sur mobile / petits écrans, ouverte sur desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    // Même breakpoint que Tailwind "lg" (≈1024px)
    return window.innerWidth < 1024
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  
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
  const [veilleGroups, setVeilleGroups] = useState<VeilleGroupRow[]>([])
  const [veilleLinks, setVeilleLinks] = useState<VeilleLinkRow[]>([])
  const [isLoadingVeille, setIsLoadingVeille] = useState(false)
  const [veilleDraggingGroupId, setVeilleDraggingGroupId] = useState<number | null>(null)
  const [veilleDraggingLinkId, setVeilleDraggingLinkId] = useState<number | null>(null)
  const [veilleDropGroupIndex, setVeilleDropGroupIndex] = useState<number | null>(null)
  const [veilleDropLink, setVeilleDropLink] = useState<{ groupId: number; linkIndex: number } | null>(null)
  const [veilleDropGroupForLink, setVeilleDropGroupForLink] = useState<number | null>(null)
  const [veilleCollapsedGroupIds, setVeilleCollapsedGroupIds] = useState<Set<number>>(new Set())
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
  const [deleteDoctrineConfirmId, setDeleteDoctrineConfirmId] = useState<number | null>(null)

  // États pour la gestion des schémas (RIA en schémas)
  const [schemasList, setSchemasList] = useState<RiaSchema[]>([])
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(false)
  const [schemaFormTitle, setSchemaFormTitle] = useState('')
  const [schemaFormFile, setSchemaFormFile] = useState<File | null>(null)
  const [isUploadingSchema, setIsUploadingSchema] = useState(false)
  const [deleteSchemaConfirmId, setDeleteSchemaConfirmId] = useState<number | null>(null)
  const [schemaFormPublished, setSchemaFormPublished] = useState(true)
  const [schemaFormVisibleTo, setSchemaFormVisibleTo] = useState<'all' | 'members'>('all')
  const [schemaDraggingId, setSchemaDraggingId] = useState<number | null>(null)
  const [schemaDropIndex, setSchemaDropIndex] = useState<number | null>(null)
  const [schemaLoadTrigger, setSchemaLoadTrigger] = useState(0)
  const [schemaFormKey, setSchemaFormKey] = useState(0)
  const schemaFileInputRef = useRef<HTMLInputElement | null>(null)
  
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
  
  // États pour les fiches pratiques
  const [fichesPratiquesList, setFichesPratiquesList] = useState<FichePratique[]>([])
  const [fichesPratiquesSearch, setFichesPratiquesSearch] = useState('')
  const [isLoadingFichesPratiques, setIsLoadingFichesPratiques] = useState(false)
  const [editingFichePratique, setEditingFichePratique] = useState<FichePratique | null>(null)
  const [fichePratiqueForm, setFichePratiqueForm] = useState({
    slug: '',
    titre: '',
    description: '',
    articles_ria: [] as string[],
    concerne_rgpd: false,
    show_disclaimer: true,
    disclaimer_text: DEFAULT_DISCLAIMER_TEXT,
    show_linkedin_cta: true,
    linkedin_cta_text: DEFAULT_LINKEDIN_CTA_TEXT,
  })
  const [articlesRiaInput, setArticlesRiaInput] = useState<string>('')
  const [fichePratiquePublished, setFichePratiquePublished] = useState<boolean>(false)
  const disclaimerEditorRef = useRef<HTMLDivElement | null>(null)
  const [disclaimerEditorInitialized, setDisclaimerEditorInitialized] = useState(false)
  const [disclaimerCurrentFontSize, setDisclaimerCurrentFontSize] = useState<string>('default')
  const [disclaimerLinkModal, setDisclaimerLinkModal] = useState<{
    visible: boolean
    url: string
    openInNewTab: boolean
    existingLink: HTMLAnchorElement | null
    savedRange: Range | null
  }>({
    visible: false,
    url: '',
    openInNewTab: true,
    existingLink: null,
    savedRange: null,
  })
  const [fichePratiqueSections, setFichePratiqueSections] = useState<FichePratiqueSection[]>([])
  const [deleteFichePratiqueConfirmId, setDeleteFichePratiqueConfirmId] = useState<number | null>(null)
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
    role?: 'adherent' | 'admin'
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
    is_available?: boolean
    description?: string
  }
  const [filesList, setFilesList] = useState<FileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [deleteFileConfirmName, setDeleteFileConfirmName] = useState<string | null>(null)
  const [renameFileData, setRenameFileData] = useState<{ oldName: string; newName: string } | null>(null)
  const [editDescriptionData, setEditDescriptionData] = useState<{ fileName: string; description: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Historique LinkedIn (bloc homepage + page dédiée)
  type LinkedInPostRow = {
    id: number
    embed_input: string
    created_at: string
  }
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPostRow[]>([])
  const [isLoadingLinkedinPosts, setIsLoadingLinkedinPosts] = useState(false)
  const [linkedinPostsStatus, setLinkedinPostsStatus] = useState<string | null>(null)
  const [linkedinNewInput, setLinkedinNewInput] = useState('')
  const [expandedLinkedinPostId, setExpandedLinkedinPostId] = useState<number | null>(null)

  // Notes perso (to-do avec cases à cocher, brouillons LinkedIn) — stockées en base (Supabase)
  type TodoItem = { id: string; text: string; done: boolean }
  const [adminNotes, setAdminNotes] = useState<{ notes: string; todo: TodoItem[]; linkedin: string }>({ notes: '', todo: [], linkedin: '' })
  const [isLoadingAdminNotes, setIsLoadingAdminNotes] = useState(false)
  const adminNotesLoadedFromServerRef = useRef(false)
  const adminNotesSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ADMIN_NOTES_KEY = 'ria-facile-admin-notes'

  const [adminTodoNewText, setAdminTodoNewText] = useState('')
  const addTodoItem = () => {
    const text = adminTodoNewText.trim()
    if (!text) return
    setAdminNotes((prev) => ({
      ...prev,
      todo: [...prev.todo, { id: crypto.randomUUID(), text, done: false }],
    }))
    setAdminTodoNewText('')
  }
  const toggleTodoItem = (id: string) => {
    setAdminNotes((prev) => ({
      ...prev,
      todo: prev.todo.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))
  }
  const removeTodoItem = (id: string) => {
    setAdminNotes((prev) => ({ ...prev, todo: prev.todo.filter((t) => t.id !== id) }))
  }
  const updateTodoItemText = (id: string, text: string) => {
    setAdminNotes((prev) => ({
      ...prev,
      todo: prev.todo.map((t) => (t.id === id ? { ...t, text } : t)),
    }))
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Fonction pour obtenir les headers d'authentification avec rafraîchissement automatique du token
  const getAuthHeaders = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuration Supabase manquante côté client')
    }
    if (!session?.access_token) {
      throw new Error('Session administrateur introuvable')
    }

    let accessToken = session.access_token

    // Vérifier si le token est expiré ou sur le point d'expirer
    if (isTokenExpired(accessToken)) {
      console.log('🔄 [AUTH] Token expiré ou sur le point d\'expirer, rafraîchissement...')
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(session)
        if (refreshError) {
          console.error('❌ [AUTH] Erreur lors du rafraîchissement du token:', refreshError)
          throw new Error('Impossible de rafraîchir la session. Veuillez vous reconnecter.')
        }
        if (refreshData.session?.access_token) {
          accessToken = refreshData.session.access_token
          console.log('✅ [AUTH] Token rafraîchi avec succès')
        } else {
          throw new Error('Session rafraîchie mais aucun token disponible. Veuillez vous reconnecter.')
        }
      } catch (err) {
        if (err instanceof Error) {
          throw err
        }
        throw new Error('Erreur lors du rafraîchissement de la session. Veuillez vous reconnecter.')
      }
    }

    return {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
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
        { id: 'veille' as AdminAction, label: 'Veille', icon: '🔗' },
        { id: 'actus-linkedin' as AdminAction, label: 'LinkedIn (home)', icon: '🔗' },
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
      key: 'fiches-pratiques',
      label: 'Fiches pratiques',
      icon: '📋',
      items: [
        { id: 'ajouter-fiche-pratique' as AdminAction, label: 'Ajouter une fiche', icon: '➕' },
        { id: 'consulter-fiches-pratiques' as AdminAction, label: 'Consulter et modifier', icon: '📋' },
      ],
    },
    {
      key: 'schemas',
      label: 'RIA en schémas',
      icon: '📊',
      items: [
        { id: 'gestion-schemas' as AdminAction, label: 'Gérer les schémas', icon: '📋' },
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
        { id: 'consulter-rag-questions' as AdminAction, label: 'Consulter les questions RAG', icon: '🔍' },
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
    {
      key: 'notes-perso',
      label: 'Notes',
      icon: '📝',
      items: [
        { id: 'notes-perso' as AdminAction, label: 'Notes & to-do', icon: '📝' },
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

  // Charger les notes admin depuis Supabase quand on ouvre la section Notes
  useEffect(() => {
    if (selectedAction !== 'notes-perso' || !session?.user?.id || !supabaseUrl) return
    const uid = session.user.id
    let cancelled = false
    adminNotesLoadedFromServerRef.current = false
    setIsLoadingAdminNotes(true)
    const run = async () => {
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(
          `${supabaseUrl}/rest/v1/admin_notes?user_id=eq.${encodeURIComponent(uid)}&select=notes,todo,linkedin`,
          { headers }
        )
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        const data = await res.json()
        const row = Array.isArray(data) ? data[0] : data
        if (cancelled) return
        if (row) {
          let todo: TodoItem[] = []
          if (Array.isArray(row.todo)) {
            todo = row.todo
              .filter((t: unknown) => t && typeof t === 'object' && 'id' in t && 'text' in t && 'done' in t)
              .map((t: { id: string; text: string; done: boolean }) => ({ id: String(t.id), text: String(t.text), done: Boolean(t.done) }))
          }
          setAdminNotes({
            notes: typeof row.notes === 'string' ? row.notes : '',
            todo,
            linkedin: typeof row.linkedin === 'string' ? row.linkedin : '',
          })
        } else {
          const fromStorage = (() => {
            try {
              const raw = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_NOTES_KEY) : null
              if (!raw) return null
              const o = JSON.parse(raw)
              let todo: TodoItem[] = []
              if (Array.isArray(o.todo)) {
                todo = o.todo
                  .filter((t: unknown) => t && typeof t === 'object' && 'id' in t && 'text' in t && 'done' in t)
                  .map((t: { id: string; text: string; done: boolean }) => ({ id: t.id || crypto.randomUUID(), text: String(t.text), done: Boolean(t.done) }))
              } else if (typeof o.todo === 'string' && o.todo.trim()) {
                todo = o.todo.split(/\n/).map((l: string) => l.trim()).filter(Boolean).map((text: string, i: number) => ({ id: crypto.randomUUID(), text, done: false }))
              }
              return { notes: String(o.notes ?? ''), todo, linkedin: String(o.linkedin ?? '') }
            } catch { return null }
          })()
          if (fromStorage && (fromStorage.notes || fromStorage.todo.length || fromStorage.linkedin)) {
            setAdminNotes(fromStorage)
          }
        }
        adminNotesLoadedFromServerRef.current = true
      } catch (err) {
        if (!cancelled) setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Impossible de charger les notes.' })
      } finally {
        if (!cancelled) setIsLoadingAdminNotes(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [selectedAction, session?.user?.id])

  // Sauvegarder les notes en base (debounce) après une modification par l'utilisateur (une fois chargées)
  useEffect(() => {
    if (adminNotesSaveTimeoutRef.current) {
      clearTimeout(adminNotesSaveTimeoutRef.current)
      adminNotesSaveTimeoutRef.current = null
    }
    if (!adminNotesLoadedFromServerRef.current || selectedAction !== 'notes-perso') return
    if (!session?.user?.id || !supabaseUrl) return
    const payload = {
      user_id: session.user.id,
      notes: adminNotes.notes,
      todo: adminNotes.todo,
      linkedin: adminNotes.linkedin,
    }
    adminNotesSaveTimeoutRef.current = setTimeout(async () => {
      adminNotesSaveTimeoutRef.current = null
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(`${supabaseUrl}/rest/v1/admin_notes`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const t = await res.text()
          setFormStatus({ type: 'error', message: t || `Erreur ${res.status} lors de l'enregistrement des notes.` })
        } else {
          try { localStorage.removeItem(ADMIN_NOTES_KEY) } catch { /* migration: nettoyer l'ancien stockage */ }
        }
      } catch (err) {
        setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement des notes.' })
      }
    }, 600)
    return () => {
      if (adminNotesSaveTimeoutRef.current) clearTimeout(adminNotesSaveTimeoutRef.current)
    }
  }, [adminNotes, session?.user?.id, selectedAction])

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
      setEditingDoctrine(null)
    } else if (selectedAction === 'gestion-schemas') {
      setSchemaFormTitle('')
      setSchemaFormFile(null)
      setDeleteSchemaConfirmId(null)
    } else if (selectedAction === 'actus-linkedin') {
      setLinkedinPostsStatus(null)
      setLinkedinNewInput('')
      setExpandedLinkedinPostId(null)
      ;(async () => {
        try {
          setIsLoadingLinkedinPosts(true)
          const headers = await getAuthHeaders()

          const loadPosts = async () => {
            const res = await fetch(
              `${supabaseUrl}/rest/v1/homepage_linkedin_posts?select=id,embed_input,created_at&order=created_at.desc`,
              { headers },
            )
            if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`)
            const data = await res.json()
            return (Array.isArray(data) ? data : []).map((r) => ({
              ...r,
              id: Number(r.id),
            }))
          }

          let posts = await loadPosts()

          // Si la table historique est vide, on convertit l'ancien réglage en 1 entrée
          if (!posts.length) {
            const resSettings = await fetch(
              `${supabaseUrl}/rest/v1/homepage_settings?id=eq.1&select=linkedin_post_url`,
              { headers },
            )
            if (resSettings.ok) {
              const settingsData = await resSettings.json()
              const row = Array.isArray(settingsData) ? settingsData[0] : settingsData
              const raw = row?.linkedin_post_url
              if (typeof raw === 'string' && raw.trim()) {
                await fetch(`${supabaseUrl}/rest/v1/homepage_linkedin_posts`, {
                  method: 'POST',
                  headers: { ...headers, Prefer: 'return=representation' },
                  body: JSON.stringify([{ embed_input: raw.trim() }]),
                }).catch(() => null)
                posts = await loadPosts()
              }
            }
          }

          setLinkedinPosts(posts)
        } catch (err) {
          setLinkedinPostsStatus(
            err instanceof Error ? err.message : 'Erreur lors du chargement de l’historique LinkedIn.',
          )
        } finally {
          setIsLoadingLinkedinPosts(false)
        }
      })()
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
      if (!editingDoctrine) {
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
          image_url: '',
          image_contenu_url: '',
          show_linkedin_cta: true,
        })
        setDoctrinePublished(true)
      }
    } else if (selectedAction === 'ajouter-fiche-pratique') {
      if (!editingFichePratique) {
        // Nouvelle fiche, réinitialiser
        setFichePratiqueForm({
          slug: '',
          titre: '',
          description: '',
          articles_ria: [],
          concerne_rgpd: false,
          show_disclaimer: true,
          disclaimer_text: DEFAULT_DISCLAIMER_TEXT,
          show_linkedin_cta: true,
          linkedin_cta_text: DEFAULT_LINKEDIN_CTA_TEXT,
          sources: [],
        })
        setArticlesRiaInput('')
        setFichePratiquePublished(false)
        setFichePratiqueSections([])
      }
    } else if (selectedAction === 'consulter-fiches-pratiques') {
      setFichesPratiquesSearch('')
      setEditingFichePratique(null)
    }
  }, [selectedAction, editingFichePratique])

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

  // Fonctions pour l'éditeur de disclaimer
  const executeDisclaimerCommand = (command: string, value?: string) => {
    const editor = disclaimerEditorRef.current
    if (!editor) return

    editor.focus()
    
    setTimeout(() => {
      const selection = window.getSelection()
      
      if (!selection || selection.rangeCount === 0) {
        const rangeEnd = document.createRange()
        rangeEnd.selectNodeContents(editor)
        rangeEnd.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(rangeEnd)
      }
      
      const success = document.execCommand(command, false, value || undefined)
      
      if (success) {
        setTimeout(() => {
          updateDisclaimerContent()
        }, 0)
      }
    }, 10)
  }

  const updateDisclaimerContent = () => {
    const editor = disclaimerEditorRef.current
    if (!editor) return

    const html = editor.innerHTML.trim()
    // S'assurer que les liens sont visibles
    const links = editor.querySelectorAll('a')
    links.forEach(link => {
      if (!link.style.color) {
        link.style.color = '#2563eb'
        link.style.textDecoration = 'underline'
      }
    })

    // Mettre à jour le formulaire
    const cleanHtml = (html === '' || html === '<br>' || html === '<p><br></p>' || html === '<p></p>') ? '' : html
    setFichePratiqueForm({ ...fichePratiqueForm, disclaimer_text: cleanHtml || null })
  }

  const refreshDisclaimerFontSize = () => {
    const editor = disclaimerEditorRef.current
    if (!editor) return

    try {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        setDisclaimerCurrentFontSize('default')
        return
      }

      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      const element = container.nodeType === 3 // Node.TEXT_NODE = 3
        ? container.parentElement 
        : container as HTMLElement

      if (!element) {
        setDisclaimerCurrentFontSize('default')
        return
      }

      const computedStyle = window.getComputedStyle(element)
      const fontSize = computedStyle.fontSize
      const sizeMatch = fontSize.match(/(\d+(?:\.\d+)?)/)
      
      if (sizeMatch) {
        const sizeValue = parseFloat(sizeMatch[1])
        // Convertir px en taille relative (approximation)
        const size = Math.round(sizeValue / 8) // 8px = taille 1, 16px = taille 2, etc.
        const allowed = ['1', '2', '3', '4', '5', '6', '7']
        if (size && allowed.includes(size.toString())) {
          setDisclaimerCurrentFontSize(size.toString())
        } else {
          setDisclaimerCurrentFontSize('default')
        }
      } else {
        setDisclaimerCurrentFontSize('default')
      }
    } catch {
      setDisclaimerCurrentFontSize('default')
    }
  }

  const handleDisclaimerLinkClick = () => {
    const editor = disclaimerEditorRef.current
    if (!editor) return

    // Sauvegarder la position de scroll actuelle
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    editor.focus()
    
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
        alert('Veuillez sélectionner du texte avant d\'ajouter un lien')
        return
      }

      const range = selection.getRangeAt(0)
      if (range.collapsed) {
        alert('Veuillez sélectionner du texte avant d\'ajouter un lien')
        return
      }

      const savedRange = range.cloneRange()

      let linkElement: HTMLAnchorElement | null = null
      let node = range.commonAncestorContainer
      while (node && node !== editor) {
        if (node.nodeType === 1) { // Node.ELEMENT_NODE = 1
          const element = node as HTMLElement
          if (element.tagName === 'A') {
            linkElement = element as HTMLAnchorElement
            break
          }
        }
        node = node.parentNode
      }

      setDisclaimerLinkModal({
        visible: true,
        url: linkElement?.href || '',
        openInNewTab: linkElement?.target === '_blank',
        existingLink: linkElement,
        savedRange: savedRange,
      })

      setTimeout(() => {
        window.scrollTo(scrollX, scrollY)
      }, 50)
    }, 10)
  }

  const applyDisclaimerLink = () => {
    const editor = disclaimerEditorRef.current
    if (!editor) return

    if (disclaimerLinkModal.existingLink) {
      disclaimerLinkModal.existingLink.href = disclaimerLinkModal.url || '#'
      disclaimerLinkModal.existingLink.target = disclaimerLinkModal.openInNewTab ? '_blank' : ''
      disclaimerLinkModal.existingLink.rel = disclaimerLinkModal.openInNewTab ? 'noopener noreferrer' : ''
      disclaimerLinkModal.existingLink.style.color = '#2563eb'
      disclaimerLinkModal.existingLink.style.textDecoration = 'underline'
    } else {
      editor.focus()
      
      setTimeout(() => {
        const selection = window.getSelection()
        if (!selection) return

        if (disclaimerLinkModal.savedRange) {
          try {
            selection.removeAllRanges()
            selection.addRange(disclaimerLinkModal.savedRange)
          } catch (e) {
            console.warn('Impossible de restaurer la sélection:', e)
            return
          }
        } else {
          return
        }

        const range = selection.getRangeAt(0)
        if (range.collapsed) {
          return
        }

        const selectedText = range.toString()
        if (!selectedText) return

        const linkHtml = `<a href="${disclaimerLinkModal.url || '#'}" ${disclaimerLinkModal.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="color: #2563eb; text-decoration: underline;">${selectedText}</a>`
        
        try {
          range.deleteContents()
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = linkHtml
          const linkNode = tempDiv.firstChild
          if (linkNode) {
            range.insertNode(linkNode)
          }
        } catch (e) {
          document.execCommand('insertHTML', false, linkHtml)
        }
      }, 10)
    }

    setTimeout(() => {
      updateDisclaimerContent()
    }, 200)

    setDisclaimerLinkModal({ visible: false, url: '', openInNewTab: true, existingLink: null, savedRange: null })
  }

  const removeDisclaimerLink = () => {
    if (!disclaimerLinkModal.existingLink) return

    const text = disclaimerLinkModal.existingLink.textContent || ''
    const textNode = document.createTextNode(text)
    disclaimerLinkModal.existingLink.parentNode?.replaceChild(textNode, disclaimerLinkModal.existingLink)

    setTimeout(() => {
      updateDisclaimerContent()
    }, 0)

    setDisclaimerLinkModal({ visible: false, url: '', openInNewTab: true, existingLink: null, savedRange: null })
  }

  // Empêcher le scroll du body quand la modal de lien disclaimer est ouverte
  useEffect(() => {
    if (disclaimerLinkModal.visible) {
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = `-${scrollX}px`
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.width = ''
        window.scrollTo(scrollX, scrollY)
      }
    }
  }, [disclaimerLinkModal.visible])

  // Réinitialiser l'éditeur de disclaimer quand on change de fiche
  useEffect(() => {
    if (editingFichePratique || selectedAction === 'ajouter-fiche-pratique') {
      setDisclaimerEditorInitialized(false)
      setTimeout(() => {
        const editor = disclaimerEditorRef.current
        if (editor) {
          const contentToLoad = fichePratiqueForm.disclaimer_text && fichePratiqueForm.disclaimer_text.trim() !== ''
            ? fichePratiqueForm.disclaimer_text
            : DEFAULT_DISCLAIMER_TEXT
          editor.innerHTML = contentToLoad
          const links = editor.querySelectorAll('a')
          links.forEach(link => {
            if (!link.style.color) {
              link.style.color = '#2563eb'
              link.style.textDecoration = 'underline'
            }
          })
          setDisclaimerEditorInitialized(true)
        }
      }, 100)
    }
  }, [editingFichePratique, fichePratiqueForm.disclaimer_text])

  // Charger la liste des fiches pratiques
  useEffect(() => {
    if (selectedAction !== 'consulter-fiches-pratiques') return

    const loadFichesPratiques = async () => {
      setIsLoadingFichesPratiques(true)
      try {
        console.log('🔄 Chargement des fiches pratiques...')
        console.log('Session:', session ? 'présente' : 'absente')
        console.log('Is admin:', isAdmin())
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Configuration Supabase manquante')
        }
        
        // Utiliser une requête directe avec authentification pour voir toutes les fiches
        const headers = await getAuthHeaders()
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/fiches_pratiques?select=*&order=created_at.desc`,
          {
            method: 'GET',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          }
        )

        console.log('📊 Réponse HTTP:', response.status, response.statusText)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Erreur HTTP:', errorText)
          throw new Error(`Erreur ${response.status}: ${errorText}`)
        }
        
        const data = await response.json()
        console.log('✅ Fiches pratiques chargées:', data?.length || 0)
        setFichesPratiquesList(data ?? [])
      } catch (err) {
        console.error('❌ Erreur lors du chargement des fiches pratiques:', err)
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
        setFormStatus({
          type: 'error',
          message: `Impossible de charger la liste des fiches pratiques: ${errorMessage}`,
        })
      } finally {
        setIsLoadingFichesPratiques(false)
      }
    }

    loadFichesPratiques()
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

  // Charger la liste des schémas (RIA en schémas) quand on arrive sur "gestion-schemas" — fetch avec auth comme le reste de l'admin
  useEffect(() => {
    if (selectedAction !== 'gestion-schemas') return

    const loadSchemas = async () => {
      setIsLoadingSchemas(true)
      setFormStatus({ type: null, message: '' })
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        const headers = await getAuthHeaders()
        const res = await fetch(
          `${supabaseUrl}/rest/v1/ria_schemas?select=*&order=position.asc`,
          {
            method: 'GET',
            headers: {
              apikey: supabaseAnonKey,
              Authorization: (headers as { Authorization: string }).Authorization,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        )
        clearTimeout(timeoutId)

        if (!res.ok) {
          const text = await res.text()
          let msg = `Erreur ${res.status}`
          try {
            const j = JSON.parse(text)
            if (j.message) msg = j.message
            else if (j.error_description) msg = j.error_description
          } catch {
            if (text) msg = text.slice(0, 200)
          }
          if (res.status === 401) msg = 'Session expirée. Reconnectez-vous.'
          if (res.status === 403) msg = 'Droits insuffisants. Vérifiez que votre compte a le rôle admin (table profiles).'
          throw new Error(msg)
        }

        const data = await res.json()
        const rows = Array.isArray(data) ? data : []
        setSchemasList(rows.map((row: Record<string, unknown>) => ({
          id: row.id as number,
          title: (row.title as string) ?? '',
          image_url: (row.image_url as string) ?? '',
          position: (row.position as number) ?? 0,
          published: row.published !== false,
          visible_to: (row.visible_to === 'members' ? 'members' : 'all') as 'all' | 'members',
          created_at: row.created_at as string | undefined,
        })))
      } catch (err) {
        console.error('Erreur lors du chargement des schémas:', err)
        const message = err instanceof Error ? err.message : 'Impossible de charger les schémas.'
        setFormStatus({ type: 'error', message })
      } finally {
        setIsLoadingSchemas(false)
      }
    }

    loadSchemas()
  }, [selectedAction, schemaLoadTrigger])

  // Charger les groupes et liens de veille (admin uniquement, fetch avec auth comme le reste de l'admin)
  useEffect(() => {
    if (selectedAction !== 'veille') return

    const loadVeille = async () => {
      setIsLoadingVeille(true)
      setFormStatus({ type: null, message: '' })
      const timeoutMs = 12_000
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const headers = await getAuthHeaders()
        const [groupsRes, linksRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/veille_groups?select=*&order=position.asc`, {
            headers: { ...headers, Accept: 'application/json' },
            signal: controller.signal,
          }),
          fetch(`${supabaseUrl}/rest/v1/veille_links?select=*&order=position.asc`, {
            headers: { ...headers, Accept: 'application/json' },
            signal: controller.signal,
          }),
        ])
        clearTimeout(timeoutId)

        if (!groupsRes.ok) {
          const text = await groupsRes.text()
          throw new Error(text || `veille_groups: ${groupsRes.status}`)
        }
        if (!linksRes.ok) {
          const text = await linksRes.text()
          throw new Error(text || `veille_links: ${linksRes.status}`)
        }

        const groupsData = await groupsRes.json()
        const linksData = await linksRes.json()
        setVeilleGroups(Array.isArray(groupsData) ? groupsData : [])
        setVeilleLinks(Array.isArray(linksData) ? linksData : [])
      } catch (err) {
        console.error('Erreur chargement veille:', err)
        const message =
          err instanceof Error
            ? err.name === 'AbortError'
              ? 'Chargement trop long. Vérifiez votre connexion et que les tables veille_groups / veille_links existent dans Supabase.'
              : err.message
            : 'Impossible de charger la veille.'
        setFormStatus({
          type: 'error',
          message: message.includes('relation') || message.includes('does not exist')
            ? 'Les tables de veille sont absentes. Exécutez le script create-veille-tables.sql dans Supabase (SQL Editor).'
            : message,
        })
      } finally {
        clearTimeout(timeoutId)
        setIsLoadingVeille(false)
      }
    }

    loadVeille()
  }, [selectedAction])

  const veilleAddGroup = async () => {
    try {
      const maxPos = veilleGroups.length === 0 ? 0 : Math.max(...veilleGroups.map((g) => g.position), 0)
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_groups`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ name: 'Nouveau groupe', position: maxPos + 1 }),
      })
      if (!res.ok) {
        const text = await res.text()
        setFormStatus({ type: 'error', message: text || `Erreur ${res.status}` })
        return
      }
      const data = await res.json()
      const newRow = Array.isArray(data) ? data[0] : data
      if (newRow) setVeilleGroups((prev) => [...prev, newRow])
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de l\'ajout du groupe.' })
    }
  }

  const veilleOpenAllLinks = () => {
    const urls = veilleLinks
      .map((l) => (l.url || '').trim())
      .filter((url) => url && url !== 'https://')

    if (urls.length === 0) {
      setFormStatus({ type: 'error', message: 'Aucun lien de veille valide à ouvrir.' })
      return
    }

    urls.forEach((url) => {
      try {
        window.open(url, '_blank', 'noopener,noreferrer')
      } catch (err) {
        console.error('Erreur lors de l\'ouverture du lien de veille:', err)
      }
    })
  }

  const veilleUpdateGroupName = async (id: number, name: string) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_groups?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      setVeilleGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' })
    }
  }

  const veilleUpdateGroupPosition = async (id: number, position: number) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_groups?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ position }),
      })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      setVeilleGroups((prev) => prev.map((g) => (g.id === id ? { ...g, position } : g)))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors du déplacement du groupe.' })
    }
  }

  const veilleDeleteGroup = async (id: number) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_groups?id=eq.${id}`, { method: 'DELETE', headers })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      setVeilleGroups((prev) => prev.filter((g) => g.id !== id))
      setVeilleLinks((prev) => prev.filter((l) => l.group_id !== id))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la suppression.' })
    }
  }

  const veilleAddLink = async (group_id: number) => {
    try {
      const groupLinks = veilleLinks.filter((l) => l.group_id === group_id)
      const maxPos = groupLinks.length === 0 ? 0 : Math.max(...groupLinks.map((l) => l.position), 0)
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_links`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ group_id, label: '', url: 'https://', note: '', position: maxPos + 1 }),
      })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      const data = await res.json()
      const newRow = Array.isArray(data) ? data[0] : data
      if (newRow) setVeilleLinks((prev) => [...prev, newRow])
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de l\'ajout du lien.' })
    }
  }

  const veilleUpdateLink = async (id: number, field: 'label' | 'url' | 'note' | 'position' | 'group_id', value: string | number) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_links?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      setVeilleLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' })
    }
  }

  const veilleMoveLink = async (linkId: number, targetGroupId: number, targetPosition: number) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_links?id=eq.${linkId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ group_id: targetGroupId, position: targetPosition }),
      })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      setVeilleLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, group_id: targetGroupId, position: targetPosition } : l)))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors du déplacement du lien.' })
    }
  }

  const veilleDeleteLink = async (id: number) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${supabaseUrl}/rest/v1/veille_links?id=eq.${id}`, { method: 'DELETE', headers })
      if (!res.ok) {
        setFormStatus({ type: 'error', message: await res.text() || `Erreur ${res.status}` })
        return
      }
      setVeilleLinks((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la suppression.' })
    }
  }

  const veilleOpenAllInGroup = (group_id: number) => {
    const links = veilleLinks.filter((l) => l.group_id === group_id && l.url && l.url.trim() !== '')
    links.forEach((l, i) => {
      setTimeout(() => window.open(l.url.trim(), '_blank', 'noopener,noreferrer'), i * 200)
    })
  }

  const sortedVeilleGroups = [...veilleGroups].sort((a, b) => a.position - b.position)

  const handleVeilleGroupDragStart = (e: React.DragEvent, groupId: number) => {
    setVeilleDraggingGroupId(groupId)
    e.dataTransfer.setData('application/veille-group', String(groupId))
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '') // pour Firefox
  }

  const handleVeilleGroupDragEnd = () => {
    setVeilleDraggingGroupId(null)
    setVeilleDropGroupIndex(null)
  }

  const handleVeilleGroupDragOver = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setVeilleDropGroupIndex(dropIndex)
  }

  const handleVeilleGroupDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const groupIdStr = e.dataTransfer.getData('application/veille-group')
    if (!groupIdStr) return
    const draggedId = Number(groupIdStr)
    const fromIndex = sortedVeilleGroups.findIndex((g) => g.id === draggedId)
    if (fromIndex === -1 || fromIndex === toIndex) {
      setVeilleDraggingGroupId(null)
      setVeilleDropGroupIndex(null)
      return
    }
    const newOrder = [...sortedVeilleGroups]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    newOrder.forEach((g, idx) => {
      if (g.position !== idx) veilleUpdateGroupPosition(g.id, idx)
    })
    setVeilleGroups((prev) => {
      const byId = Object.fromEntries(prev.map((g) => [g.id, g]))
      return newOrder.map((g, idx) => ({ ...byId[g.id], position: idx }))
    })
    setVeilleDraggingGroupId(null)
    setVeilleDropGroupIndex(null)
  }

  const handleVeilleLinkDragStart = (e: React.DragEvent, linkId: number, groupId: number) => {
    setVeilleDraggingLinkId(linkId)
    e.dataTransfer.setData('application/veille-link', JSON.stringify({ linkId, groupId }))
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '')
  }

  const handleVeilleLinkDragEnd = () => {
    setVeilleDraggingLinkId(null)
    setVeilleDropLink(null)
    setVeilleDropGroupForLink(null)
  }

  const handleVeilleLinkDrop = (e: React.DragEvent, targetGroupId: number, targetLinkIndex: number) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/veille-link')
    if (!raw) return
    try {
      const { linkId, groupId } = JSON.parse(raw)
      const groupLinks = veilleLinks.filter((l) => l.group_id === targetGroupId).sort((a, b) => a.position - b.position)
      if (groupId === targetGroupId) {
        const fromIndex = groupLinks.findIndex((l) => l.id === linkId)
        if (fromIndex === -1 || fromIndex === targetLinkIndex) {
          handleVeilleLinkDragEnd()
          return
        }
        const newOrder = [...groupLinks]
        const [removed] = newOrder.splice(fromIndex, 1)
        newOrder.splice(targetLinkIndex, 0, removed)
        newOrder.forEach((l, idx) => {
          if (l.position !== idx) veilleUpdateLink(l.id, 'position', idx)
        })
        setVeilleLinks((prev) =>
          prev.map((l) => {
            if (l.group_id !== targetGroupId) return l
            const idx = newOrder.findIndex((o) => o.id === l.id)
            return idx >= 0 ? { ...l, position: idx } : l
          })
        )
      } else {
        const newPosition = groupLinks.length === 0 ? 0 : Math.max(...groupLinks.map((l) => l.position)) + 1
        veilleMoveLink(linkId, targetGroupId, newPosition)
      }
    } catch (_) {
      /* ignore */
    }
    handleVeilleLinkDragEnd()
  }

  const handleVeilleLinkDropOnGroup = (e: React.DragEvent, targetGroupId: number) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/veille-link')
    if (!raw) return
    try {
      const { linkId, groupId } = JSON.parse(raw)
      if (groupId === targetGroupId) return
      const groupLinks = veilleLinks.filter((l) => l.group_id === targetGroupId).sort((a, b) => a.position - b.position)
      const newPosition = groupLinks.length === 0 ? 0 : Math.max(0, ...groupLinks.map((l) => l.position), 0) + 1
      veilleMoveLink(linkId, targetGroupId, newPosition)
    } catch (_) {
      /* ignore */
    }
    handleVeilleLinkDragEnd()
  }

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

        // Charger tous les profils (adhérents et admins) pour que l'admin puisse voir tous les comptes
        const url = `${supabaseUrl}/rest/v1/profiles?select=id,email,prenom,nom,profession,created_at,consentement_prospection,role&order=created_at.desc`

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
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!session?.access_token || !supabaseUrl || !supabaseAnonKey) {
          throw new Error('Configuration Supabase manquante ou session invalide')
        }

        const url = `${supabaseUrl}/rest/v1/deletion_requests?select=*&order=requested_at.desc`
        const response = await fetch(url, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          console.error('❌ [DEMANDES SUPPRESSION] Erreur HTTP:', response.status, errorText)
          throw new Error(`Erreur HTTP ${response.status} lors du chargement des demandes`)
        }

        const data = await response.json()
        console.log('✅ [DEMANDES SUPPRESSION] Demandes chargées:', data?.length)
        setDeletionRequests(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('❌ [DEMANDES SUPPRESSION] Exception:', err)
        setFormStatus({ 
          type: 'error', 
          message: err instanceof Error ? err.message : 'Erreur lors du chargement des demandes' 
        })
      } finally {
        setIsLoadingDeletionRequests(false)
      }
    }

    loadDeletionRequests()
  }, [selectedAction, session])

  // Annuler une demande de suppression (sans supprimer le compte)
  const handleCancelDeletionRequest = async (requestId: string) => {
    if (!session?.user) {
      setFormStatus({ type: 'error', message: 'Session expirée' })
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande de suppression ?')) {
      return
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey || !session?.access_token) {
        setFormStatus({ type: 'error', message: 'Configuration Supabase manquante' })
        return
      }

      // Marquer la demande comme annulée
      const cancelUrl = `${supabaseUrl}/rest/v1/deletion_requests?id=eq.${requestId}`
      const cancelResponse = await fetch(cancelUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'cancelled',
          processed_at: new Date().toISOString(),
          processed_by: session.user.id,
        }),
      })

      if (!cancelResponse.ok) {
        const errorText = await cancelResponse.text().catch(() => '')
        console.error('❌ [DEMANDES SUPPRESSION] Erreur annulation:', cancelResponse.status, errorText)
        setFormStatus({ type: 'error', message: 'Erreur lors de l\'annulation de la demande' })
        return
      }

      setFormStatus({ type: 'success', message: 'Demande annulée avec succès' })
      
      // Recharger les demandes
      const reloadUrl = `${supabaseUrl}/rest/v1/deletion_requests?select=*&order=requested_at.desc`
      const reloadResponse = await fetch(reloadUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Accept': 'application/json',
        },
      })
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setDeletionRequests(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('❌ [DEMANDES SUPPRESSION] Exception lors de l\'annulation:', err)
      setFormStatus({ type: 'error', message: 'Erreur lors de l\'annulation de la demande' })
    }
  }

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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey || !session?.access_token) {
        setFormStatus({ type: 'error', message: 'Configuration Supabase manquante' })
        return
      }

      // Supprimer l'utilisateur via une fonction SQL (qui supprime le profil et bannit l'utilisateur)
      const deleteUserUrl = `${supabaseUrl}/rest/v1/rpc/delete_user_account`
      const deleteResponse = await fetch(deleteUserUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ user_id_to_delete: userId }),
      })

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ [DEMANDES SUPPRESSION] Erreur suppression utilisateur:', deleteResponse.status, errorData)
        
        // Pas besoin de remettre à "pending" car on ne passe plus par "processing"
        
        const errorMessage = errorData?.message || errorData?.error || 'Erreur lors de la suppression du compte'
        setFormStatus({ type: 'error', message: errorMessage })
        return
      }

      const deleteResult = await deleteResponse.json()
      console.log('✅ [DEMANDES SUPPRESSION] Utilisateur supprimé:', deleteResult)

      // Marquer la demande comme complétée directement (pas besoin de statut "processing")
      const completeUrl = `${supabaseUrl}/rest/v1/deletion_requests?id=eq.${requestId}`
      const completeResponse = await fetch(completeUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: session.user.id,
        }),
      })

      if (!completeResponse.ok) {
        console.error('❌ [DEMANDES SUPPRESSION] Erreur lors de la mise à jour du statut:', completeResponse.status)
        // Ne pas échouer complètement si la suppression a réussi mais la mise à jour du statut a échoué
      }

      setFormStatus({ type: 'success', message: 'Compte supprimé avec succès' })
      
      // Recharger les demandes
      const reloadUrl = `${supabaseUrl}/rest/v1/deletion_requests?select=*&order=requested_at.desc`
      const reloadResponse = await fetch(reloadUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Accept': 'application/json',
        },
      })
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setDeletionRequests(Array.isArray(data) ? data : [])
      }

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
      const headers = await getAuthHeaders()
      
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
      
      // Charger les informations de disponibilité et description depuis la table adherent_files
      try {
        const { data: adherentFilesData, error: adherentFilesError } = await supabasePublic
          .from('adherent_files')
          .select('file_name, is_available, description')
        
        if (!adherentFilesError && adherentFilesData) {
          // Créer un map pour un accès rapide
          const fileDataMap = new Map<string, { is_available: boolean; description?: string }>()
          adherentFilesData.forEach(item => {
            fileDataMap.set(item.file_name, {
              is_available: item.is_available || false,
              description: item.description || undefined
            })
          })
          
          // Enrichir les fichiers avec les informations de disponibilité et description
          const enrichedFiles = files.map((file: FileItem) => {
            const fileData = fileDataMap.get(file.name)
            return {
              ...file,
              is_available: fileData?.is_available || false,
              description: fileData?.description
            }
          })
          setFilesList(enrichedFiles)
        } else {
          // Si erreur ou pas de données, mettre is_available à false par défaut
          const enrichedFiles = files.map((file: FileItem) => ({
            ...file,
            is_available: false,
            description: undefined
          }))
          setFilesList(enrichedFiles)
        }
    } catch (err) {
        console.error('Erreur lors du chargement de la disponibilité des fichiers:', err)
        // En cas d'erreur, mettre is_available à false par défaut
        const enrichedFiles = files.map((file: FileItem) => ({
          ...file,
          is_available: false,
          description: undefined
        }))
        setFilesList(enrichedFiles)
      }
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
      
      // Créer une entrée dans adherent_files avec is_available = false par défaut
      try {
        const { error: insertError } = await supabasePublic
          .from('adherent_files')
          .insert({
            file_name: fileName,
            is_available: false
          })
          .select()
          .single()

        // Ignorer l'erreur si l'entrée existe déjà (cas où on ré-upload un fichier)
        if (insertError && insertError.code !== '23505') { // 23505 = unique violation
          console.warn('Erreur lors de la création de l\'entrée dans adherent_files:', insertError)
        }
      } catch (err) {
        console.warn('Exception lors de la création de l\'entrée dans adherent_files:', err)
        // Ne pas bloquer si cette création échoue
      }
      
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

      // Tracker le téléchargement
      const { trackFileDownload } = await import('../lib/analytics')
      trackFileDownload(fileName, session)
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
      
      // Supprimer l'entrée dans adherent_files si elle existe
      try {
        await supabasePublic
          .from('adherent_files')
          .delete()
          .eq('file_name', fileName)
      } catch (err) {
        console.warn('Erreur lors de la suppression dans adherent_files:', err)
        // Ne pas bloquer si cette suppression échoue
      }
      
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

  // Renommer un fichier (utilise copy + remove car move n'est pas toujours fiable)
  const handleRenameFile = async (oldName: string, newName: string) => {
    if (!newName || newName.trim() === '') {
      setFormStatus({ type: 'error', message: 'Le nom du fichier ne peut pas être vide.' })
      return
    }

    if (newName === oldName) {
      setRenameFileData(null)
      return
    }

    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      if (!session) {
        throw new Error('Vous devez être connecté pour renommer un fichier.')
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }
      
      // Étape 1: Copier le fichier avec le nouveau nom
      const copyUrl = `${supabaseUrl}/storage/v1/object/copy`
      
      const copyResponse = await fetch(copyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: 'admin-files',
          sourceKey: oldName,
          destinationKey: newName
        })
      })
      
      if (!copyResponse.ok) {
        const errorText = await copyResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        throw new Error(errorData.message || `Erreur lors de la copie: ${copyResponse.status}`)
      }

      // Étape 2: Supprimer l'ancien fichier
      const deleteUrl = `${supabaseUrl}/storage/v1/object/admin-files/${oldName}`
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        }
      })
      
      if (!deleteResponse.ok) {
        // Si la suppression échoue, on essaie de supprimer le nouveau fichier pour éviter les doublons
        const cleanupUrl = `${supabaseUrl}/storage/v1/object/admin-files/${newName}`
        await fetch(cleanupUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey
          }
        })
        
        const errorText = await deleteResponse.text()
        throw new Error(`Erreur lors de la suppression de l'ancien fichier: ${errorText || deleteResponse.status}`)
      }

      setFormStatus({ type: 'success', message: 'Fichier renommé avec succès.' })
      setRenameFileData(null)
      
      // Mettre à jour le nom dans adherent_files si l'entrée existe
      try {
        const { data: existing } = await supabasePublic
          .from('adherent_files')
          .select('id')
          .eq('file_name', oldName)
          .single()

        if (existing) {
          // Mettre à jour le nom
          await supabasePublic
            .from('adherent_files')
            .update({ file_name: newName })
            .eq('file_name', oldName)
        }
      } catch (err) {
        console.warn('Erreur lors de la mise à jour du nom dans adherent_files:', err)
        // Ne pas bloquer si cette mise à jour échoue
      }
      
      // Recharger la liste
      await loadFiles()
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors du renommage du fichier.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mettre à jour la disponibilité d'un fichier pour les adhérents
  const handleToggleFileAvailability = async (fileName: string, isAvailable: boolean) => {
    try {
      if (!session) {
        throw new Error('Vous devez être connecté pour modifier la disponibilité.')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }

      // Vérifier si l'entrée existe déjà via API REST
      const checkUrl = `${supabaseUrl}/rest/v1/adherent_files?file_name=eq.${encodeURIComponent(fileName)}&select=id`
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      })

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text()
        console.error('Erreur lors de la vérification:', errorText)
        throw new Error(`Erreur lors de la vérification: ${errorText || checkResponse.status}`)
      }

      const existingData = await checkResponse.json()
      const existing = existingData && existingData.length > 0 ? existingData[0] : null

      if (existing) {
        // Mettre à jour l'entrée existante via API REST
        const updateUrl = `${supabaseUrl}/rest/v1/adherent_files?file_name=eq.${encodeURIComponent(fileName)}`
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ is_available: Boolean(isAvailable) })
        })

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          console.error('Erreur lors de la mise à jour:', errorText)
          throw new Error(`Erreur lors de la mise à jour: ${errorText || updateResponse.status}`)
        }
      } else {
        // Créer une nouvelle entrée via API REST
        const insertUrl = `${supabaseUrl}/rest/v1/adherent_files`
        const insertResponse = await fetch(insertUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            file_name: fileName,
            is_available: Boolean(isAvailable)
          })
        })

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text()
          console.error('Erreur lors de l\'insertion:', errorText)
          throw new Error(`Erreur lors de l'insertion: ${errorText || insertResponse.status}`)
        }
      }

      // Mettre à jour l'état local
      setFilesList(prevFiles => 
        prevFiles.map(file => 
          file.name === fileName 
            ? { ...file, is_available: isAvailable }
            : file
        )
      )

      setFormStatus({ 
        type: 'success', 
        message: `Le fichier est maintenant ${isAvailable ? 'disponible' : 'indisponible'} pour les adhérents.` 
      })
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de la mise à jour de la disponibilité.'
      
      // Afficher un message plus détaillé si c'est une erreur RLS
      if (errorMessage.includes('permission') || errorMessage.includes('RLS') || errorMessage.includes('policy')) {
        setFormStatus({
          type: 'error',
          message: 'Erreur de permissions. Vérifiez que vous êtes bien connecté en tant qu\'admin et que les politiques RLS sont correctement configurées.'
        })
      } else {
        setFormStatus({
          type: 'error',
          message: errorMessage
        })
      }
    }
  }

  // Mettre à jour la description d'un fichier
  const handleSaveDescription = async (fileName: string, description: string) => {
    try {
      if (!session) {
        throw new Error('Vous devez être connecté pour modifier la description.')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante')
      }

      // Vérifier si l'entrée existe déjà via API REST
      const checkUrl = `${supabaseUrl}/rest/v1/adherent_files?file_name=eq.${encodeURIComponent(fileName)}&select=id`
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      })

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text()
        throw new Error(`Erreur lors de la vérification: ${errorText || checkResponse.status}`)
      }

      const existingData = await checkResponse.json()
      const existing = existingData && existingData.length > 0 ? existingData[0] : null

      const descriptionToSave = description.trim() || null

      if (existing) {
        // Mettre à jour l'entrée existante via API REST
        const updateUrl = `${supabaseUrl}/rest/v1/adherent_files?file_name=eq.${encodeURIComponent(fileName)}`
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ description: descriptionToSave })
        })

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          throw new Error(`Erreur lors de la mise à jour: ${errorText || updateResponse.status}`)
        }
      } else {
        // Créer une nouvelle entrée via API REST
        const insertUrl = `${supabaseUrl}/rest/v1/adherent_files`
        const insertResponse = await fetch(insertUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            file_name: fileName,
            is_available: false,
            description: descriptionToSave
          })
        })

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text()
          throw new Error(`Erreur lors de l'insertion: ${errorText || insertResponse.status}`)
        }
      }

      // Mettre à jour l'état local
      setFilesList(prevFiles => 
        prevFiles.map(file => 
          file.name === fileName 
            ? { ...file, description: descriptionToSave || undefined }
            : file
        )
      )

      setEditDescriptionData(null)
      setFormStatus({ 
        type: 'success', 
        message: 'Description mise à jour avec succès.' 
      })
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la description:', err)
      setFormStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la description.'
      })
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
      const headers = await getAuthHeaders()
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
      const headers = await getAuthHeaders()
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
      const headers = await getAuthHeaders()
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

  // Passer en mode édition : remplir le formulaire et afficher la vue « Ajouter un article » (comme pour les fiches pratiques)
  const handleEditDoctrine = (doctrine: DoctrineArticle) => {
    setEditingDoctrine(doctrine)
    setDoctrinePublished(doctrine.published !== false)
    // Normaliser la date au format YYYY-MM-DD pour l'input type="date" (conserver la date de création à l'édition)
    const rawDate = doctrine.date
    const dateForInput = rawDate
      ? (typeof rawDate === 'string' && rawDate.length >= 10
          ? rawDate.slice(0, 10)
          : new Date(rawDate).toISOString().slice(0, 10))
      : ''
    setDoctrineForm({
      titre: doctrine.titre,
      date: dateForInput,
      abstract: doctrine.abstract ?? '',
      intro: doctrine.intro ?? '',
      titre1: doctrine.titre1 ?? '',
      'sous-titre1': doctrine['sous-titre1'] ?? '',
      contenu1: doctrine.contenu1 ?? '',
      'sous-titre2': doctrine['sous-titre2'] ?? '',
      contenu2: doctrine.contenu2 ?? '',
      titre2: doctrine.titre2 ?? '',
      'sous-titre3': doctrine['sous-titre3'] ?? '',
      contenu3: doctrine.contenu3 ?? '',
      'sous-titre4': doctrine['sous-titre4'] ?? '',
      contenu4: doctrine.contenu4 ?? '',
      conclusion: doctrine.conclusion ?? '',
      references: doctrine.references ?? '',
      auteur: doctrine.auteur,
      theme: doctrine.theme ?? '',
      image_url: doctrine.image_url ?? '',
      image_contenu_url: doctrine.image_contenu_url ?? '',
      show_linkedin_cta: doctrine.show_linkedin_cta !== false,
    })
    setDoctrineImageFile(null)
    setDoctrineImagePreview(doctrine.image_url || null)
    setDoctrineContenuImageFile(null)
    setDoctrineContenuImagePreview(doctrine.image_contenu_url || null)
    setSelectedAction('ajouter-article-doctrine')
  }

  // Supprimer un article de doctrine
  const handleDeleteDoctrine = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = await getAuthHeaders()
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

  // Ajouter un schéma (RIA en schémas) — upload via REST + INSERT avec timeouts courts
  const handleAddSchema = async () => {
    if (!schemaFormTitle.trim() || !schemaFormFile) {
      setFormStatus({ type: 'error', message: 'Titre et image requis.' })
      return
    }
    setIsUploadingSchema(true)
    setFormStatus({ type: null, message: '' })
    const UPLOAD_TIMEOUT_MS = 60_000
    const INSERT_TIMEOUT_MS = 20_000
    let currentStep: 'session' | 'upload' | 'insert' = 'session'

    try {
      setFormStatus({ type: null, message: 'Récupération de la session…' })
      const headers = await getAuthHeaders()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const filePath = `schemas/${Date.now()}-${schemaFormFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      currentStep = 'upload'
      setFormStatus({ type: null, message: 'Upload de l\'image…' })
      const uploadController = new AbortController()
      const uploadTimeoutId = setTimeout(() => uploadController.abort(), UPLOAD_TIMEOUT_MS)
      const uploadPathEnc = filePath.split('/').map(encodeURIComponent).join('/')
      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/ria-schemas/${uploadPathEnc}`,
        {
          method: 'POST',
          headers: {
            Authorization: (headers as { Authorization: string }).Authorization,
            apikey: supabaseAnonKey,
            'Content-Type': schemaFormFile.type || 'image/png',
          },
          body: schemaFormFile,
          signal: uploadController.signal,
        }
      )
      clearTimeout(uploadTimeoutId)
      if (!uploadRes.ok) {
        const errText = await uploadRes.text()
        throw new Error(`Upload échoué (${uploadRes.status}) : ${errText.slice(0, 150) || 'vérifiez le bucket ria-schemas et vos droits.'}`)
      }
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/ria-schemas/${uploadPathEnc}`

      currentStep = 'insert'
      setFormStatus({ type: null, message: 'Enregistrement du schéma…' })
      const insertController = new AbortController()
      const insertTimeoutId = setTimeout(() => insertController.abort(), INSERT_TIMEOUT_MS)
      const maxPosition = schemasList.length === 0 ? 0 : Math.max(...schemasList.map(s => s.position), 0)
      const postHeaders = { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=representation' as const }
      let body: Record<string, unknown> = {
        title: schemaFormTitle.trim(),
        image_url: publicUrl,
        position: maxPosition + 1,
        published: schemaFormPublished,
        visible_to: schemaFormVisibleTo,
      }
      let response = await fetch(`${supabaseUrl}/rest/v1/ria_schemas`, {
        method: 'POST',
        headers: postHeaders as Record<string, string>,
        body: JSON.stringify(body),
        signal: insertController.signal,
      })
      clearTimeout(insertTimeoutId)

      if (!response.ok) {
        const errText = await response.text()
        if (response.status === 400 && (errText.includes('column') || errText.includes('published') || errText.includes('visible_to'))) {
          body = { title: body.title, image_url: body.image_url, position: body.position }
          const retryRes = await fetch(`${supabaseUrl}/rest/v1/ria_schemas`, {
            method: 'POST',
            headers: postHeaders as Record<string, string>,
            body: JSON.stringify(body),
            signal: insertController.signal,
          })
          if (!retryRes.ok) throw new Error(await retryRes.text())
          response = retryRes
        } else {
          throw new Error(errText || `Erreur ${response.status}`)
        }
      }

      const responseText = await response.text()
      let inserted: unknown
      try {
        inserted = responseText ? JSON.parse(responseText) : null
      } catch {
        inserted = null
      }
      if (inserted == null) {
        setSchemaLoadTrigger(t => t + 1)
        setSchemaFormTitle('')
        setSchemaFormFile(null)
        setSchemaFormPublished(true)
        setSchemaFormVisibleTo('all')
        setSchemaFormKey(k => k + 1)
        setFormStatus({ type: 'success', message: 'Schéma enregistré. Liste rafraîchie.' })
        return
      }
      const normalized = Array.isArray(inserted) ? inserted : [inserted]
      const withDefaults = normalized.map((row: Record<string, unknown>) => ({
        id: row.id as number,
        title: (row.title as string) ?? '',
        image_url: (row.image_url as string) ?? '',
        position: (row.position as number) ?? 0,
        published: row.published !== false,
        visible_to: (row.visible_to === 'members' ? 'members' : 'all') as 'all' | 'members',
      }))
      setSchemasList(prev => [...prev, ...withDefaults].sort((a, b) => a.position - b.position))
      setSchemaFormTitle('')
      setSchemaFormFile(null)
      setSchemaFormPublished(true)
      setSchemaFormVisibleTo('all')
      setSchemaFormKey(k => k + 1)
      setFormStatus({ type: 'success', message: 'Schéma ajouté.' })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (currentStep === 'upload') setFormStatus({ type: 'error', message: 'Upload trop long (60 s). Connexion lente ou fichier trop lourd — essayez une image < 2 Mo.' })
        else if (currentStep === 'insert') setFormStatus({ type: 'error', message: 'Enregistrement trop long (20 s). Réessayez ou vérifiez Supabase.' })
        else setFormStatus({ type: 'error', message: 'Délai dépassé. Réessayez.' })
      } else {
        setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de l\'ajout.' })
      }
    } finally {
      setIsUploadingSchema(false)
    }
  }

  // Mettre à jour l'ordre d'un schéma
  const handleUpdateSchemaPosition = async (id: number, newPosition: number) => {
    try {
      const headers = await getAuthHeaders()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/rest/v1/ria_schemas?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition }),
      })
      if (!response.ok) throw new Error(await response.text())
      setSchemasList(prev => prev.map(s => s.id === id ? { ...s, position: newPosition } : s).sort((a, b) => a.position - b.position))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' })
    }
  }

  // Mettre à jour le titre d'un schéma
  const handleUpdateSchemaTitle = async (id: number, title: string) => {
    const trimmed = title.trim() || 'Sans titre'
    try {
      const headers = await getAuthHeaders()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/rest/v1/ria_schemas?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      if (!response.ok) throw new Error(await response.text())
      setSchemasList(prev => prev.map(s => s.id === id ? { ...s, title: trimmed } : s))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour du titre.' })
    }
  }

  // Mettre à jour publié / visibilité d'un schéma
  const handleUpdateSchemaPublished = async (id: number, published: boolean) => {
    try {
      const headers = await getAuthHeaders()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/rest/v1/ria_schemas?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      if (!response.ok) throw new Error(await response.text())
      setSchemasList(prev => prev.map(s => s.id === id ? { ...s, published } : s))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' })
    }
  }

  const handleUpdateSchemaVisibleTo = async (id: number, visible_to: 'all' | 'members') => {
    try {
      const headers = await getAuthHeaders()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/rest/v1/ria_schemas?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible_to }),
      })
      if (!response.ok) throw new Error(await response.text())
      setSchemasList(prev => prev.map(s => s.id === id ? { ...s, visible_to } : s))
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' })
    }
  }

  // Drag-and-drop réordonnancement des schémas (comme veille)
  const sortedSchemasList = [...schemasList].sort((a, b) => a.position - b.position)
  const handleSchemaDragStart = (e: React.DragEvent, schemaId: number) => {
    setSchemaDraggingId(schemaId)
    e.dataTransfer.setData('application/ria-schema', String(schemaId))
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '')
  }
  const handleSchemaDragEnd = () => {
    setSchemaDraggingId(null)
    setSchemaDropIndex(null)
  }
  const handleSchemaDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const idStr = e.dataTransfer.getData('application/ria-schema')
    if (!idStr) return
    const draggedId = Number(idStr)
    const fromIndex = sortedSchemasList.findIndex(s => s.id === draggedId)
    if (fromIndex === -1 || fromIndex === toIndex) {
      handleSchemaDragEnd()
      return
    }
    const newOrder = [...sortedSchemasList]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    newOrder.forEach((s, idx) => {
      if (s.position !== idx) handleUpdateSchemaPosition(s.id, idx)
    })
    setSchemasList(prev => {
      const byId = Object.fromEntries(prev.map(s => [s.id, s]))
      return newOrder.map((s, idx) => ({ ...byId[s.id], position: idx }))
    })
    handleSchemaDragEnd()
  }

  // Supprimer un schéma
  const handleDeleteSchema = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })
    try {
      const headers = await getAuthHeaders()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/rest/v1/ria_schemas?id=eq.${id}`, { method: 'DELETE', headers })
      if (!response.ok) throw new Error(await response.text())
      setSchemasList(prev => prev.filter(s => s.id !== id))
      setFormStatus({ type: 'success', message: 'Schéma supprimé.' })
      setDeleteSchemaConfirmId(null)
    } catch (err) {
      setFormStatus({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la suppression.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer une fiche pratique
  const handleDeleteFichePratique = async (id: number) => {
    setIsSubmitting(true)
    setFormStatus({ type: null, message: '' })

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${supabaseUrl}/rest/v1/fiches_pratiques?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur Supabase (${response.status})`)
      }

      // Recharger la liste
      const { data, error: reloadError } = await supabasePublic
        .from('fiches_pratiques')
        .select('*')
        .order('created_at', { ascending: false })

      if (!reloadError && data) {
        setFichesPratiquesList(data)
      }

      setFormStatus({ type: 'success', message: 'Fiche pratique supprimée avec succès.' })
      setDeleteFichePratiqueConfirmId(null)
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
      const headers = await getAuthHeaders()
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
      const headers = await getAuthHeaders()
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
      const headers = await getAuthHeaders()
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
      const headers = await getAuthHeaders()
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

  // Gérer la touche Enter pour valider la suppression d'une fiche pratique
  useEffect(() => {
    if (deleteFichePratiqueConfirmId === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault()
        handleDeleteFichePratique(deleteFichePratiqueConfirmId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteFichePratiqueConfirmId, isSubmitting])

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
          <div className={`w-full lg:w-52 flex-shrink-0 ${isSidebarCollapsed ? 'lg:max-w-[60px]' : ''}`}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow border border-gray-100 p-3 flex flex-col h-full">
              <div className="flex items-center mb-3">
                {!isSidebarCollapsed && (
                  <h2 className="text-base font-semibold text-gray-700">
                    Console admin
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
                  <nav className="space-y-1.5">
                    {/* Bouton Dashboard */}
                    <button
                      onClick={() => setSelectedAction(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        selectedAction === null
                          ? 'bg-[#774792] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-base">📊</span>
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>

                    {menuGroups.map((group) => {
                      const isSingleItem = group.items.length === 1
                      const hasActiveItem = group.items.some((item) => selectedAction === item.id)

                      if (isSingleItem) {
                        const item = group.items[0]
                        return (
                          <div key={group.key} className="space-y-0.5">
                            <button
                              onClick={() => setSelectedAction(item.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                selectedAction === item.id
                                  ? 'bg-[#774792] text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <span className="text-base">{group.icon}</span>
                              <span className="text-sm font-medium">{group.label}</span>
                            </button>
                          </div>
                        )
                      }

                      const isExpanded = expandedGroups.has(group.key)
                      return (
                        <div key={group.key} className="space-y-0.5">
                          <button
                            onClick={() => toggleGroup(group.key)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${
                              hasActiveItem
                                ? 'bg-[#774792] text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{group.icon}</span>
                              <span className="text-sm font-medium">{group.label}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${
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
                            <div className="ml-3 space-y-0.5 pl-3 border-l border-gray-200">
                              {group.items.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedAction(item.id)}
                                  className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm ${
                                    selectedAction === item.id
                                      ? 'bg-[#774792] text-white shadow-sm'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <span className="text-sm">{item.icon}</span>
                                  <span className="font-medium">{item.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </nav>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 mb-1.5">
                      Connecté en tant que{' '}
                      <span className="font-medium text-gray-600">
                        {profile?.email ?? session?.user.email ?? 'Administrateur'}
                      </span>
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 rounded-lg bg-red-500/90 text-white text-xs font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        const headers = await getAuthHeaders()
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

              {selectedAction === 'veille' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Veille</h2>
                      <p className="text-gray-600 mt-2">Gérez vos liens de veille par groupes. Ouvrez tous les liens d&apos;un groupe d&apos;un coup.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={veilleOpenAllLinks}
                        className="px-3 py-1.5 rounded-xl border border-purple-100 bg-white text-xs text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1"
                      >
                        <span className="text-sm">↗</span>
                        <span className="hidden sm:inline">Ouvrir tous les liens</span>
                        <span className="sm:hidden">Tout ouvrir</span>
                      </button>
                      <button
                        type="button"
                        onClick={veilleAddGroup}
                        className="px-4 py-2 rounded-xl border border-purple-100 bg-purple-50 text-gray-700 hover:bg-purple-100 transition-colors flex items-center gap-2"
                      >
                        <span>+</span> Ajouter un groupe
                      </button>
                    </div>
                  </div>

                  {formStatus.type && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 ${
                        formStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {formStatus.message}
                    </div>
                  )}

                  {isLoadingVeille ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement…</p>
                    </div>
                  ) : veilleGroups.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 mb-4">Aucun groupe. Cliquez sur « Ajouter un groupe » pour commencer.</p>
                      <button type="button" onClick={veilleAddGroup} className="px-4 py-2 rounded-xl border border-purple-100 bg-purple-50 text-gray-700 hover:bg-purple-100 transition-colors">
                        Ajouter un groupe
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sortedVeilleGroups.map((group, groupIndex) => {
                        const groupLinks = veilleLinks.filter((l) => l.group_id === group.id).sort((a, b) => a.position - b.position)
                        const showGroupDropLine = veilleDraggingGroupId != null && veilleDropGroupIndex === groupIndex
                        const isGroupDragging = veilleDraggingGroupId === group.id
                        return (
                          <div key={group.id} className="relative">
                            {/* Ligne de drop entre groupes */}
                            {showGroupDropLine && (
                              <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-300 rounded z-10 pointer-events-none" style={{ marginTop: '-3px' }} />
                            )}
                            <div
                              className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-opacity ${isGroupDragging ? 'opacity-50' : ''}`}
                              onDragOver={(e) => {
                                if (veilleDraggingGroupId != null) {
                                  e.preventDefault()
                                  e.dataTransfer.dropEffect = 'move'
                                  setVeilleDropGroupIndex(groupIndex)
                                }
                              }}
                              onDragLeave={() => {
                                if (veilleDraggingGroupId != null) setVeilleDropGroupIndex(null)
                              }}
                              onDrop={(e) => {
                                if (veilleDraggingGroupId != null) {
                                  handleVeilleGroupDrop(e, groupIndex)
                                } else if (veilleDraggingLinkId != null) {
                                  handleVeilleLinkDropOnGroup(e, group.id)
                                }
                              }}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                {/* Poignée de déplacement du groupe */}
                                <div
                                  draggable
                                  onDragStart={(e) => handleVeilleGroupDragStart(e, group.id)}
                                  onDragEnd={handleVeilleGroupDragEnd}
                                  className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 touch-none"
                                  title="Maintenir et glisser pour réordonner les groupes"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
                                </div>
                                <input
                                  type="text"
                                  value={group.name}
                                  onChange={(e) => setVeilleGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, name: e.target.value } : g)))}
                                  onBlur={(e) => veilleUpdateGroupName(group.id, e.target.value.trim() || 'Sans nom')}
                                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                  className="text-lg font-semibold text-gray-800 px-2 py-1 rounded border border-transparent hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 min-w-[200px]"
                                  placeholder="Nom du groupe"
                                />
                                <button
                                  type="button"
                                  onClick={() => setVeilleCollapsedGroupIds((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(group.id)) next.delete(group.id)
                                    else next.add(group.id)
                                    return next
                                  })}
                                  className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-transform"
                                  title={veilleCollapsedGroupIds.has(group.id) ? 'Déplier le groupe' : 'Replier le groupe'}
                                  aria-expanded={!veilleCollapsedGroupIds.has(group.id)}
                                >
                                  <svg
                                    className="w-4 h-4 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ transform: veilleCollapsedGroupIds.has(group.id) ? 'rotate(-90deg)' : 'none' }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => veilleOpenAllInGroup(group.id)}
                                    disabled={groupLinks.length === 0}
                                    className="px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 text-gray-700 text-sm hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Ouvrir tout ({groupLinks.length})
                                  </button>
                                  <button type="button" onClick={() => veilleAddLink(group.id)} className="px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 text-gray-700 text-sm hover:bg-purple-100">
                                    + Lien
                                  </button>
                                  <button type="button" onClick={() => veilleDeleteGroup(group.id)} className="px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 text-gray-600 text-sm hover:bg-purple-100" title="Supprimer le groupe">
                                    Supprimer le groupe
                                  </button>
                                </div>
                              </div>
                              {!veilleCollapsedGroupIds.has(group.id) && (
                              <div
                                className={`space-y-2 pl-2 border-l-2 border-gray-200 rounded transition-colors ${veilleDraggingLinkId != null && veilleDropGroupForLink === group.id ? 'border-purple-300 bg-purple-50/30' : ''}`}
                                onDragOver={(e) => {
                                  if (veilleDraggingLinkId != null) {
                                    e.preventDefault()
                                    e.dataTransfer.dropEffect = 'move'
                                    setVeilleDropGroupForLink(group.id)
                                  }
                                }}
                                onDragLeave={() => setVeilleDropGroupForLink(null)}
                              >
                                {groupLinks.length === 0 ? (
                                  <p className="text-sm text-gray-500 italic">Aucun lien. Cliquez sur « + Lien ». Glissez-déposez un lien ici pour le déplacer.</p>
                                ) : (
                                  groupLinks.map((link, linkIndex) => {
                                    const showLinkDropLine = veilleDraggingLinkId != null && veilleDropLink?.groupId === group.id && veilleDropLink?.linkIndex === linkIndex
                                    const isLinkDragging = veilleDraggingLinkId === link.id
                                    return (
                                      <div key={link.id} className="relative">
                                        {showLinkDropLine && (
                                          <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-300 rounded z-10 pointer-events-none" style={{ marginTop: '-2px' }} />
                                        )}
                                        <div
                                          className={`flex flex-nowrap items-center gap-2 py-1 rounded transition-opacity ${isLinkDragging ? 'opacity-50' : ''}`}
                                          onDragOver={(e) => {
                                            if (veilleDraggingLinkId != null) {
                                              e.preventDefault()
                                              e.dataTransfer.dropEffect = 'move'
                                              setVeilleDropLink({ groupId: group.id, linkIndex })
                                            }
                                          }}
                                          onDragLeave={() => setVeilleDropLink(null)}
                                          onDrop={(e) => handleVeilleLinkDrop(e, group.id, linkIndex)}
                                        >
                                          <div
                                            draggable
                                            onDragStart={(e) => handleVeilleLinkDragStart(e, link.id, group.id)}
                                            onDragEnd={handleVeilleLinkDragEnd}
                                            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 touch-none"
                                            title="Maintenir et glisser pour réordonner ou déplacer le lien"
                                          >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
                                          </div>
                                          <input
                                            type="text"
                                            value={link.label ?? ''}
                                            onChange={(e) => setVeilleLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l)))}
                                            onBlur={(e) => veilleUpdateLink(link.id, 'label', e.target.value)}
                                            placeholder="Libellé"
                                            className="flex-shrink-0 w-32 sm:w-40 px-2 py-1 text-sm border border-gray-300 rounded focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                                          />
                                          <input
                                            type="url"
                                            value={link.url}
                                            onChange={(e) => setVeilleLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)))}
                                            onBlur={(e) => veilleUpdateLink(link.id, 'url', e.target.value)}
                                            placeholder="https://…"
                                            className="flex-1 min-w-0 w-0 px-2 py-1 text-sm border border-gray-300 rounded focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                                          />
                                          <input
                                            type="text"
                                            value={link.note ?? ''}
                                            onChange={(e) => setVeilleLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, note: e.target.value } : l)))}
                                            onBlur={(e) => veilleUpdateLink(link.id, 'note', e.target.value)}
                                            placeholder="Note (facultatif)"
                                            className="flex-shrink-0 w-28 sm:w-36 px-2 py-1 text-sm border border-gray-300 rounded focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                                          />
                                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="Ouvrir">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                          </a>
                                          <button type="button" onClick={() => veilleDeleteLink(link.id)} className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="Supprimer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedAction === 'actus-linkedin' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    LinkedIn — page d&apos;accueil
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Ajoutez l&apos;URL du post LinkedIn (ou le code d&apos;intégration <code>&lt;iframe&gt;</code>)
                    que vous souhaitez afficher sur la page d&apos;accueil. Le dernier ajouté est celui mis en avant.
                  </p>

                  {linkedinPostsStatus && (
                    <div className="mb-3 text-sm px-3 py-2 rounded-lg border bg-purple-50 text-purple-800">
                      {linkedinPostsStatus}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          URL du post LinkedIn ou code d&apos;intégration <code>&lt;iframe&gt;</code>
                        </label>
                        <textarea
                          value={linkedinNewInput}
                          onChange={(e) => setLinkedinNewInput(e.target.value)}
                          placeholder="https://www.linkedin.com/posts/... (ou collez le <iframe ...>)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[88px]"
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          Astuce : pour une intégration “propre”, collez plutôt l&apos;URL de la page du post.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          const raw = linkedinNewInput.trim()
                          if (!raw) return
                          try {
                            setLinkedinPostsStatus(null)
                            const headers = await getAuthHeaders()
                            const res = await fetch(`${supabaseUrl}/rest/v1/homepage_linkedin_posts`, {
                              method: 'POST',
                              headers: { ...headers, Prefer: 'return=representation' },
                              body: JSON.stringify({ embed_input: raw }),
                            })
                            if (!res.ok) throw new Error((await res.text()) || `Erreur ${res.status}`)

                            setLinkedinNewInput('')
                            setExpandedLinkedinPostId(null)

                            // Recharger la liste
                            const reloadRes = await fetch(
                              `${supabaseUrl}/rest/v1/homepage_linkedin_posts?select=id,embed_input,created_at&order=created_at.desc`,
                              { headers },
                            )
                            if (reloadRes.ok) {
                              const reloadData = await reloadRes.json()
                              setLinkedinPosts(
                                (Array.isArray(reloadData) ? reloadData : []).map((r) => ({
                                  ...r,
                                  id: Number(r.id),
                                })),
                              )
                            }
                            setLinkedinPostsStatus('Post LinkedIn ajouté.')
                          } catch (err) {
                            setLinkedinPostsStatus(err instanceof Error ? err.message : 'Erreur lors de l’ajout.')
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#774792] text-white text-sm font-medium shadow hover:bg-[#653a7a]"
                      >
                        Ajouter au site
                      </button>
                    </div>

                    <div className="max-w-3xl">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Historique des posts</h3>
                        <div className="text-sm text-gray-500">
                          {linkedinPosts.length} post{linkedinPosts.length > 1 ? 's' : ''}
                        </div>
                      </div>

                      {isLoadingLinkedinPosts ? (
                        <p className="text-sm text-gray-500">Chargement…</p>
                      ) : linkedinPosts.length === 0 ? (
                        <p className="text-sm text-gray-600">Aucun post partagé pour le moment.</p>
                      ) : (
                        <div className="space-y-3">
                          {linkedinPosts.map((post) => {
                            const embedUrl = getLinkedInEmbedUrl(post.embed_input)
                            const canOpenDirectUrl = post.embed_input.startsWith('http')
                            const isExpanded = expandedLinkedinPostId === post.id
                            return (
                              <div key={post.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-xs text-gray-500">
                                      Ajouté le {formatDateFr(post.created_at)}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800 truncate">
                                      {canOpenDirectUrl ? post.embed_input : 'Post (intégration)'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {embedUrl ? (
                                      <button
                                        type="button"
                                        onClick={() => setExpandedLinkedinPostId(isExpanded ? null : post.id)}
                                        className="px-2 py-1.5 rounded-lg border text-sm font-semibold text-[#774792] border-[#774792]/30 hover:bg-[#774792]/10"
                                      >
                                        {isExpanded ? 'Masquer aperçu' : 'Aperçu'}
                                      </button>
                                    ) : null}

                                    <button
                                      type="button"
                                      onClick={async () => {
                                        try {
                                          setLinkedinPostsStatus(null)
                                          const headers = await getAuthHeaders()
                                          const delRes = await fetch(
                                            `${supabaseUrl}/rest/v1/homepage_linkedin_posts?id=eq.${post.id}`,
                                            { method: 'DELETE', headers },
                                          )
                                          if (!delRes.ok) throw new Error((await delRes.text()) || `Erreur ${delRes.status}`)

                                          setExpandedLinkedinPostId(null)
                                          const reloadRes = await fetch(
                                            `${supabaseUrl}/rest/v1/homepage_linkedin_posts?select=id,embed_input,created_at&order=created_at.desc`,
                                            { headers },
                                          )
                                          if (reloadRes.ok) {
                                            const reloadData = await reloadRes.json()
                                            setLinkedinPosts(
                                              (Array.isArray(reloadData) ? reloadData : []).map((r) => ({
                                                ...r,
                                                id: Number(r.id),
                                              })),
                                            )
                                          }
                                          setLinkedinPostsStatus('Post supprimé.')
                                        } catch (err) {
                                          setLinkedinPostsStatus(
                                            err instanceof Error ? err.message : 'Erreur lors de la suppression.',
                                          )
                                        }
                                      }}
                                      className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                      title="Supprimer"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {canOpenDirectUrl ? (
                                  <div className="mt-2">
                                    <a
                                      href={post.embed_input}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-[#774792] font-semibold hover:underline"
                                    >
                                      Ouvrir le post ↗
                                    </a>
                                  </div>
                                ) : null}

                                {isExpanded && embedUrl ? (
                                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                    <iframe
                                      src={embedUrl}
                                      className="w-full h-[260px]"
                                      loading="lazy"
                                      frameBorder="0"
                                      allowFullScreen
                                      title="Aperçu post LinkedIn"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
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
                              <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {doctrine.titre}
                                </h3>
                                {doctrine.published === false && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                    Brouillon
                                  </span>
                                )}
                                {doctrine.published === true && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                    Publié
                                  </span>
                                )}
                              </div>
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
                        const headers = await getAuthHeaders()
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
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {editingDoctrine ? 'Modifier l\'article de doctrine' : 'Ajouter un article de doctrine'}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {editingDoctrine
                          ? 'Modifiez les champs ci-dessous puis enregistrez.'
                          : 'Les champs ci-dessous correspondent à la table doctrine de Supabase. L\'ID est généré automatiquement.'}
                      </p>
                    </div>
                    {/* Toggle publié / brouillon */}
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium transition-colors ${!doctrinePublished ? 'text-gray-700' : 'text-gray-400'}`}>
                        Non publié
                      </span>
                      <button
                        type="button"
                        onClick={() => setDoctrinePublished(!doctrinePublished)}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#774792] focus:ring-offset-2 ${
                          doctrinePublished ? 'bg-[#774792]' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={doctrinePublished}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            doctrinePublished ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium transition-colors ${doctrinePublished ? 'text-[#774792]' : 'text-gray-400'}`}>
                        Publié
                      </span>
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

                  <form
                    className="space-y-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        let imageUrl = doctrineForm.image_url
                        let imageContenuUrl = doctrineForm.image_contenu_url

                        // Upload de l'image de couverture si un fichier a été sélectionné
                        if (doctrineImageFile) {
                          setUploadingDoctrineImage(true)
                          try {
                            const fileName = `doctrine-${Date.now()}-${doctrineImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
                            const uploadUrl = `${supabaseUrl}/storage/v1/object/doctrine-images/${fileName}`
                            
                            const headers = await getAuthHeaders()
                            const uploadResponse = await fetch(uploadUrl, {
                              method: 'POST',
                              headers: {
                                ...headers,
                                'Content-Type': doctrineImageFile.type || 'image/jpeg',
                                'x-upsert': 'false',
                                'cache-control': '3600'
                              },
                              body: doctrineImageFile
                            })

                            if (!uploadResponse.ok) {
                              const errorText = await uploadResponse.text()
                              throw new Error(`Erreur lors de l'upload de l'image: ${errorText}`)
                            }

                            // Construire l'URL publique de l'image
                            imageUrl = `${supabaseUrl}/storage/v1/object/public/doctrine-images/${fileName}`
                          } catch (uploadError) {
                            setUploadingDoctrineImage(false)
                            throw new Error(uploadError instanceof Error ? uploadError.message : 'Erreur lors de l\'upload de l\'image')
                          } finally {
                            setUploadingDoctrineImage(false)
                          }
                        }

                        // Upload de l'image de contenu si un fichier a été sélectionné
                        if (doctrineContenuImageFile) {
                          setUploadingDoctrineContenuImage(true)
                          try {
                            const fileName = `doctrine-contenu-${Date.now()}-${doctrineContenuImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
                            const uploadUrl = `${supabaseUrl}/storage/v1/object/doctrine-images/${fileName}`
                            
                            const headers = await getAuthHeaders()
                            const uploadResponse = await fetch(uploadUrl, {
                              method: 'POST',
                              headers: {
                                ...headers,
                                'Content-Type': doctrineContenuImageFile.type || 'image/jpeg',
                                'x-upsert': 'false',
                                'cache-control': '3600'
                              },
                              body: doctrineContenuImageFile
                            })

                            if (!uploadResponse.ok) {
                              const errorText = await uploadResponse.text()
                              throw new Error(`Erreur lors de l'upload de l'image de contenu: ${errorText}`)
                            }

                            // Construire l'URL publique de l'image
                            imageContenuUrl = `${supabaseUrl}/storage/v1/object/public/doctrine-images/${fileName}`
                          } catch (uploadError) {
                            setUploadingDoctrineContenuImage(false)
                            throw new Error(uploadError instanceof Error ? uploadError.message : 'Erreur lors de l\'upload de l\'image de contenu')
                          } finally {
                            setUploadingDoctrineContenuImage(false)
                          }
                        }

                        const headers = await getAuthHeaders()
                        const payload = {
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
                          image_url: imageUrl || null,
                          image_contenu_url: imageContenuUrl || null,
                          published: doctrinePublished,
                          show_linkedin_cta: doctrineForm.show_linkedin_cta,
                        }
                        const isEdit = editingDoctrine !== null
                        const url = isEdit
                          ? `${supabaseUrl}/rest/v1/doctrine?id=eq.${editingDoctrine!.id}`
                          : `${supabaseUrl}/rest/v1/doctrine`
                        const response = await fetch(url, {
                          method: isEdit ? 'PATCH' : 'POST',
                          headers,
                          body: JSON.stringify(payload),
                        })

                        if (!response.ok) {
                          const text = await response.text()
                          let errorMessage = text || `Erreur Supabase (${response.status})`
                          
                          // Messages d'erreur plus explicites
                          if (response.status === 401) {
                            errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.'
                          } else if (response.status === 403) {
                            errorMessage = 'Accès refusé. Vérifiez que vous avez les droits administrateur et que les politiques RLS sont correctement configurées.'
                          } else if (response.status === 404) {
                            errorMessage = 'La table doctrine n\'existe pas. Veuillez exécuter le script create-doctrine-table.sql dans Supabase.'
                          } else if (response.status === 409) {
                            errorMessage = 'Conflit : un article avec ces caractéristiques existe déjà.'
                          } else if (response.status === 422) {
                            errorMessage = 'Données invalides. Vérifiez que tous les champs requis sont remplis.'
                          } else if (text.includes('JWT expired') || text.includes('jwt expired') || response.status === 401) {
                            errorMessage = 'Votre session a expiré. Le système va tenter de la rafraîchir automatiquement. Si le problème persiste, veuillez vous reconnecter.'
                            // Tenter de rafraîchir la session une dernière fois
                            try {
                              if (session) {
                                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(session)
                                if (!refreshError && refreshData.session) {
                                  errorMessage = 'Session rafraîchie. Veuillez réessayer d\'ajouter l\'article.'
                                }
                              }
                            } catch (refreshErr) {
                              console.error('Erreur lors du rafraîchissement:', refreshErr)
                            }
                          } else if (text.includes('permission denied') || text.includes('new row violates row-level security')) {
                            errorMessage = 'Permission refusée par les politiques RLS. Vérifiez que vous êtes administrateur et que les politiques sont correctement configurées.'
                          } else if (text.includes('relation') && text.includes('does not exist')) {
                            errorMessage = 'La table doctrine n\'existe pas. Veuillez exécuter le script create-doctrine-table.sql dans Supabase.'
                          }
                          
                          throw new Error(errorMessage)
                        }

                        if (isEdit) {
                          setFormStatus({ type: 'success', message: doctrinePublished ? 'Article modifié et publié.' : 'Brouillon modifié.' })
                          setEditingDoctrine(null)
                          setSelectedAction('consulter-doctrine')
                          const { data: reloadData, error: reloadError } = await supabasePublic
                            .from('doctrine')
                            .select('*')
                            .order('date', { ascending: false })
                          if (!reloadError && reloadData) setDoctrineList(reloadData)
                        } else {
                          setFormStatus({ type: 'success', message: doctrinePublished ? 'Article de doctrine publié avec succès.' : 'Brouillon enregistré avec succès.' })
                          setDoctrinePublished(true)
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
                            image_url: '',
                            image_contenu_url: '',
                            show_linkedin_cta: true,
                          })
                          setDoctrineImageFile(null)
                          setDoctrineImagePreview(null)
                          setDoctrineContenuImageFile(null)
                          setDoctrineContenuImagePreview(null)
                        }
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

                    {/* Champ d'upload d'image */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image de l'article
                      </label>
                      <div className="space-y-4">
                        {doctrineImagePreview && (
                          <div className="relative w-full max-w-md">
                            <img
                              src={doctrineImagePreview}
                              alt="Aperçu"
                              className="w-full h-48 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setDoctrineImageFile(null)
                                setDoctrineImagePreview(null)
                                setDoctrineForm({ ...doctrineForm, image_url: '' })
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                              title="Supprimer l'image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  // Vérifier la taille (5MB max)
                                  if (file.size > 5 * 1024 * 1024) {
                                    setFormStatus({
                                      type: 'error',
                                      message: 'L\'image est trop volumineuse. Taille maximale : 5MB'
                                    })
                                    return
                                  }
                                  setDoctrineImageFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setDoctrineImagePreview(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                        </div>
                        {uploadingDoctrineImage && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                            Upload de l'image en cours...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Champ d'upload d'image de contenu (schéma explicatif) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image dans le contenu (schéma explicatif - optionnel)
                      </label>
                      <p className="text-xs text-gray-500 mb-3">Cette image apparaîtra dans le contenu de l'article, après l'introduction</p>
                      <div className="space-y-4">
                        {doctrineContenuImagePreview && (
                          <div className="relative w-full max-w-md">
                            <img
                              src={doctrineContenuImagePreview}
                              alt="Aperçu image contenu"
                              className="w-full h-48 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setDoctrineContenuImageFile(null)
                                setDoctrineContenuImagePreview(null)
                                setDoctrineForm({ ...doctrineForm, image_contenu_url: '' })
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                              title="Supprimer l'image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    setFormStatus({
                                      type: 'error',
                                      message: 'L\'image est trop volumineuse. Taille maximale : 5MB'
                                    })
                                    return
                                  }
                                  setDoctrineContenuImageFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setDoctrineContenuImagePreview(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                        </div>
                        {uploadingDoctrineContenuImage && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                            Upload de l'image de contenu en cours...
                          </div>
                        )}
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

                    <div className="border-t border-gray-200 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doctrineForm.show_linkedin_cta}
                          onChange={(e) => setDoctrineForm({ ...doctrineForm, show_linkedin_cta: e.target.checked })}
                          className="w-5 h-5 text-[#0a66c2] border-gray-300 rounded focus:ring-[#0a66c2] focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Afficher l&apos;invitation LinkedIn en bas de l&apos;article
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3">
                      {editingDoctrine ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoctrine(null)
                            setSelectedAction('consulter-doctrine')
                          }}
                          className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                          disabled={isSubmitting}
                        >
                          Retour à la liste
                        </button>
                      ) : (
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
                              image_url: '',
                              image_contenu_url: '',
                              show_linkedin_cta: true,
                            })
                          }
                          className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                          disabled={isSubmitting}
                        >
                          Réinitialiser
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (editingDoctrine ? 'Enregistrement...' : 'Ajout en cours...') : editingDoctrine ? 'Enregistrer les modifications' : "Ajouter l'article de doctrine"}
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
                                {adherent.role === 'admin' && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                    👑 Admin
                                  </span>
                                )}
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
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCancelDeletionRequest(request.id)}
                                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Annuler la demande
                                </button>
                              <button
                                onClick={() => handleProcessDeletionRequest(request.id, request.user_id)}
                                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer le compte
                              </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RIA en schémas */}
              {selectedAction === 'gestion-schemas' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Gérer les schémas</h2>
                      <p className="text-gray-600 mt-2">Ajoutez des schémas, modifiez les titres, choisissez l&apos;ordre par glisser-déposer, et définissez la publication et la visibilité.</p>
                    </div>
                  </div>

                  {formStatus.type && (
                    <div className={`mb-4 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${formStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      <span>{formStatus.message}</span>
                      {formStatus.type === 'error' && selectedAction === 'gestion-schemas' && (
                        <button
                          type="button"
                          onClick={() => setSchemaLoadTrigger(t => t + 1)}
                          className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-red-200 text-red-700 text-sm font-medium"
                        >
                          Réessayer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Formulaire d'ajout */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">+</span>
                      Ajouter un schéma
                    </h3>

                    {/* Ligne 1 : titre + fichier */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                          type="text"
                          value={schemaFormTitle}
                          onChange={(e) => setSchemaFormTitle(e.target.value)}
                          placeholder="Ex: AI act. Calendrier d'entrée en application"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        />
                      </div>
                      <div className="w-full md:w-72">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image (PNG, JPG)</label>
                        <div className="flex flex-col gap-1">
                          <input
                            key={schemaFormKey}
                            ref={schemaFileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => setSchemaFormFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => schemaFileInputRef.current?.click()}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                          >
                            Choisir un fichier
                          </button>
                          <p className="text-xs text-gray-500 truncate">
                            {schemaFormFile ? schemaFormFile.name : 'Aucun fichier choisi'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ligne 2 : options de visibilité + bouton aligné à droite */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schemaFormPublished}
                            onChange={(e) => setSchemaFormPublished(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Publié</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Visible par</span>
                          <select
                            value={schemaFormVisibleTo}
                            onChange={(e) => setSchemaFormVisibleTo(e.target.value as 'all' | 'members')}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="all">Tout le monde</option>
                            <option value="members">Adhérents uniquement</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSchema}
                        disabled={isUploadingSchema || !schemaFormTitle.trim() || !schemaFormFile}
                        className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        {isUploadingSchema ? 'Ajout en cours…' : 'Ajouter le schéma'}
                      </button>
                    </div>
                  </div>

                  {/* Liste des schémas avec glisser-déposer */}
                  {isLoadingSchemas ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600"></div>
                      <p className="mt-4 text-gray-600">Chargement des schémas…</p>
                    </div>
                  ) : schemasList.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-gray-500 mb-2">Aucun schéma.</p>
                      <p className="text-sm text-gray-400">Utilisez le formulaire ci-dessus pour en ajouter un.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {sortedSchemasList.map((schema, index) => {
                        const showDropLine = schemaDraggingId != null && schemaDropIndex === index
                        const isDragging = schemaDraggingId === schema.id
                        return (
                          <div key={schema.id} className="relative">
                            {showDropLine && (
                              <div className="absolute left-0 right-0 top-0 h-1 bg-purple-400 rounded-full z-10 pointer-events-none" style={{ marginTop: '-2px' }} />
                            )}
                            <div
                              className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all ${isDragging ? 'opacity-50 scale-[0.98]' : ''} hover:border-purple-100`}
                              onDragOver={(e) => {
                                if (schemaDraggingId != null) {
                                  e.preventDefault()
                                  e.dataTransfer.dropEffect = 'move'
                                  setSchemaDropIndex(index)
                                }
                              }}
                              onDragLeave={() => setSchemaDropIndex(null)}
                              onDrop={(e) => handleSchemaDrop(e, index)}
                            >
                              <div className="flex flex-wrap items-center gap-4">
                                <div
                                  draggable
                                  onDragStart={(e) => handleSchemaDragStart(e, schema.id)}
                                  onDragEnd={handleSchemaDragEnd}
                                  className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 touch-none"
                                  title="Glisser pour réordonner"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
                                </div>
                                <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                  <img src={schema.image_url} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={schema.title}
                                    onChange={(e) => setSchemasList(prev => prev.map(s => s.id === schema.id ? { ...s, title: e.target.value } : s))}
                                    onBlur={(e) => handleUpdateSchemaTitle(schema.id, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                    className="w-full font-medium text-gray-800 px-2 py-1 rounded border border-transparent hover:border-gray-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 bg-transparent"
                                    placeholder="Titre du schéma"
                                  />
                                  <p className="text-xs text-gray-500 mt-0.5">Ordre d&apos;affichage : {index + 1}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <label className="flex items-center gap-1.5 cursor-pointer" title={schema.published ? 'Publié' : 'Non publié'}>
                                    <input
                                      type="checkbox"
                                      checked={schema.published}
                                      onChange={(e) => handleUpdateSchemaPublished(schema.id, e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-600">Publié</span>
                                  </label>
                                  <select
                                    value={schema.visible_to}
                                    onChange={(e) => handleUpdateSchemaVisibleTo(schema.id, e.target.value as 'all' | 'members')}
                                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    title="Visibilité"
                                  >
                                    <option value="all">Tous</option>
                                    <option value="members">Adhérents</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteSchemaConfirmId(schema.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Modal confirmation suppression schéma */}
                  {deleteSchemaConfirmId !== null && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer ce schéma ?</h3>
                        <p className="text-gray-600 text-sm mb-6">Cette action est irréversible. Le schéma ne sera plus affiché sur la page.</p>
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setDeleteSchemaConfirmId(null)} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
                          <button onClick={() => handleDeleteSchema(deleteSchemaConfirmId)} className="px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600">Supprimer</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sections pour les fiches pratiques */}
              {selectedAction === 'ajouter-fiche-pratique' && (
                <div>
                  <form
                    className="space-y-6"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setIsSubmitting(true)
                      setFormStatus({ type: null, message: '' })

                      try {
                        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                        
                        if (!fichePratiqueForm.slug.trim()) {
                          throw new Error('Le slug est requis')
                        }
                        if (!fichePratiqueForm.titre.trim()) {
                          throw new Error('Le titre est requis')
                        }
                        
                        console.log('Validation OK, envoi de la fiche pratique...')
                        console.log('Nombre de sections:', fichePratiqueSections.length)
                        console.log('Sections:', JSON.stringify(fichePratiqueSections, null, 2))

                        let finalSections = [...fichePratiqueSections]

                        console.log('Préparation des sections...', finalSections)
                        const sectionsWithPositions = finalSections.length > 0
                          ? finalSections.map((s, index) => {
                              const cleanedSection: any = {
                                type: s.type,
                                position: index + 1,
                              }
                              if (s.id) cleanedSection.id = s.id
                              if (s.titre) cleanedSection.titre = s.titre
                              if (s.blocs && s.blocs.length > 0) {
                                cleanedSection.blocs = s.blocs.map(block => {
                                  const cleanedBlock: any = {
                                    type: block.type,
                                    id: block.id,
                                  }
                                  if (block.texte) cleanedBlock.texte = block.texte
                                  if (block.contenu) cleanedBlock.contenu = block.contenu
                                  if (block.table_data) cleanedBlock.table_data = block.table_data
                                  if (block.style) cleanedBlock.style = block.style
                                  return cleanedBlock
                                })
                              }
                              if (s.contenu) cleanedSection.contenu = s.contenu
                              if (s.image_url) cleanedSection.image_url = s.image_url
                              if (s.alt) cleanedSection.alt = s.alt
                              if (s.table_data) cleanedSection.table_data = s.table_data
                              if (s.sources) cleanedSection.sources = s.sources
                              return cleanedSection
                            })
                          : []
                        console.log('Sections préparées:', JSON.stringify(sectionsWithPositions, null, 2))

                        const headers = await getAuthHeaders()
                        const isEdit = editingFichePratique !== null
                        const url = isEdit
                          ? `${supabaseUrl}/rest/v1/fiches_pratiques?id=eq.${editingFichePratique.id}`
                          : `${supabaseUrl}/rest/v1/fiches_pratiques`
                        const publishedValue = fichePratiquePublished
                        
                        const payload = {
                          slug: fichePratiqueForm.slug.trim(),
                          titre: fichePratiqueForm.titre.trim(),
                          description: fichePratiqueForm.description.trim() || null,
                          articles_ria: fichePratiqueForm.articles_ria,
                          concerne_rgpd: fichePratiqueForm.concerne_rgpd,
                          show_disclaimer: fichePratiqueForm.show_disclaimer,
                          disclaimer_text: fichePratiqueForm.disclaimer_text?.trim() || null,
                          show_linkedin_cta: fichePratiqueForm.show_linkedin_cta,
                          linkedin_cta_text: null,
                          contenu: {
                            sections: sectionsWithPositions,
                          },
                          published: publishedValue,
                        }
                        
                        console.log('Envoi de la requête:', { url, method: isEdit ? 'PATCH' : 'POST', payload })
                        const response = await fetch(url, {
                          method: isEdit ? 'PATCH' : 'POST',
                          headers: {
                            ...headers,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                          },
                          body: JSON.stringify(payload),
                        })

                        console.log('Réponse reçue:', response.status, response.statusText)

                        if (!response.ok) {
                          const text = await response.text()
                          console.error('Erreur Supabase - Status:', response.status)
                          console.error('Erreur Supabase - Body:', text)
                          try {
                            const errorJson = JSON.parse(text)
                            let errorMessage = errorJson.message || errorJson.error_description || text || `Erreur Supabase (${response.status})`
                            if (errorJson.code === '23505') {
                              if (errorJson.message?.includes('slug')) {
                                errorMessage = `Le slug "${fichePratiqueForm.slug}" existe déjà. Veuillez utiliser un slug unique (ex: "${fichePratiqueForm.slug}-2" ou un autre nom).`
                              } else {
                                errorMessage = `Une valeur existe déjà en base de données. ${errorJson.message}`
                              }
                            } else if (response.status === 409) {
                              errorMessage = `Conflit : ${errorMessage}`
                            }
                            throw new Error(errorMessage)
                          } catch (parseError) {
                            throw new Error(text || `Erreur Supabase (${response.status})`)
                          }
                        }
                        
                        const responseData = await response.json()
                        console.log('Fiche pratique enregistrée avec succès!')
                        setFormStatus({ 
                          type: 'success', 
                          message: fichePratiquePublished
                            ? (isEdit ? 'Fiche pratique publiée et modifiée avec succès.' : 'Fiche pratique publiée avec succès.')
                            : (isEdit ? 'Brouillon modifié avec succès. La fiche n\'est pas encore publiée.' : 'Brouillon enregistré avec succès. La fiche n\'est pas encore publiée.')
                        })
                        
                        setFichePratiqueForm({
                          slug: '',
                          titre: '',
                          description: '',
                          articles_ria: [],
                          concerne_rgpd: false,
                          show_disclaimer: true,
                          disclaimer_text: DEFAULT_DISCLAIMER_TEXT,
                          show_linkedin_cta: true,
                          linkedin_cta_text: DEFAULT_LINKEDIN_CTA_TEXT,
                          sources: [],
                        })
                        setArticlesRiaInput('')
                        setFichePratiquePublished(false)
                        setFichePratiqueSections([])
                        setEditingFichePratique(null)
                        
                        if (selectedAction === 'consulter-fiches-pratiques') {
                          const { data, error } = await supabase
                            .from('fiches_pratiques')
                            .select('*')
                            .order('created_at', { ascending: false })
                          if (!error && data) {
                            setFichesPratiquesList(data)
                          }
                        }
                      } catch (err) {
                        console.error('Erreur lors de l\'enregistrement de la fiche pratique:', err)
                        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue.'
                        setFormStatus({
                          type: 'error',
                          message: errorMessage,
                        })
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {editingFichePratique ? 'Modifier une fiche pratique' : 'Ajouter une fiche pratique'}
                      </h2>
                      <p className="text-gray-600">
                        {editingFichePratique 
                          ? 'Modifiez la fiche pratique avec un contenu flexible (sections et images).'
                          : 'Créez une nouvelle fiche pratique avec un contenu flexible (sections et images).'
                        }
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      {/* Toggle pour publié/non publié */}
                      <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium transition-colors ${!fichePratiquePublished ? 'text-gray-700' : 'text-gray-400'}`}>
                        Non publié
                      </span>
                      <button
                        type="button"
                        onClick={() => setFichePratiquePublished(!fichePratiquePublished)}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#774792] focus:ring-offset-2 ${
                          fichePratiquePublished ? 'bg-[#774792]' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={fichePratiquePublished}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            fichePratiquePublished ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium transition-colors ${fichePratiquePublished ? 'text-[#774792]' : 'text-gray-400'}`}>
                        Publié
                      </span>
                    </div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug* (identifiant URL, ex: "exactitude")
                        </label>
                        <input
                          type="text"
                          value={fichePratiqueForm.slug}
                          onChange={(e) => setFichePratiqueForm({ ...fichePratiqueForm, slug: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200"
                          placeholder="exactitude"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre*
                        </label>
                        <input
                          type="text"
                          value={fichePratiqueForm.titre}
                          onChange={(e) => setFichePratiqueForm({ ...fichePratiqueForm, titre: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200"
                          placeholder="Titre de la fiche pratique"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={fichePratiqueForm.description}
                          onChange={(e) => setFichePratiqueForm({ ...fichePratiqueForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200"
                          placeholder="Description de la fiche pratique"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Articles RIA associés (séparés par des virgules)
                        </label>
                        <input
                          type="text"
                          value={articlesRiaInput}
                          onChange={(e) => {
                            // Permettre la saisie libre sans filtrage immédiat
                            setArticlesRiaInput(e.target.value)
                          }}
                          onBlur={(e) => {
                            // Au blur, parser et nettoyer les articles
                            const articles = e.target.value
                              .split(',')
                              .map(a => a.trim())
                              .filter(a => a.length > 0)
                              .filter((value, index, self) => self.indexOf(value) === index) // Supprimer les doublons
                            setFichePratiqueForm({ ...fichePratiqueForm, articles_ria: articles })
                            // Mettre à jour l'input avec la version nettoyée
                            setArticlesRiaInput(articles.join(', '))
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200"
                          placeholder="Ex: 10, 15, 26"
                        />
                        {fichePratiqueForm.articles_ria.length > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Articles enregistrés: {fichePratiqueForm.articles_ria.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fichePratiqueForm.concerne_rgpd}
                            onChange={(e) => setFichePratiqueForm({ ...fichePratiqueForm, concerne_rgpd: e.target.checked })}
                            className="w-5 h-5 text-[#774792] border-gray-300 rounded focus:ring-[#774792] focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Cette fiche pratique concerne aussi la conformité RGPD
                          </span>
                        </label>

                        <div className="border-t border-gray-200 pt-4 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fichePratiqueForm.show_disclaimer}
                              onChange={(e) => setFichePratiqueForm({ ...fichePratiqueForm, show_disclaimer: e.target.checked })}
                              className="w-5 h-5 text-[#774792] border-gray-300 rounded focus:ring-[#774792] focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Afficher le disclaimer en bas de la fiche
                            </span>
                          </label>

                          <details className="group" open={disclaimerEditorInitialized}>
                            <summary className="flex items-center justify-between cursor-pointer text-sm text-gray-700 select-none">
                              <span className="font-medium">Éditer le disclaimer</span>
                              <span className="text-xs text-gray-500 group-open:hidden">Afficher</span>
                              <span className="text-xs text-gray-500 hidden group-open:inline">Masquer</span>
                            </summary>
                            <div className="mt-2 space-y-2">
                              {/* Barre d'outils de formatage */}
                              <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 border border-gray-300 rounded-t-lg">
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    executeDisclaimerCommand('bold')
                                  }}
                                  className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                                  title="Gras"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    executeDisclaimerCommand('italic')
                                  }}
                                  className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
                                  title="Italique"
                                >
                                  I
                                </button>
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    executeDisclaimerCommand('underline')
                                  }}
                                  className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
                                  title="Souligné"
                                >
                                  U
                                </button>
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDisclaimerLinkClick()
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                  className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
                                  title="Ajouter un lien"
                                  style={{ minWidth: '32px', minHeight: '32px', display: 'flex' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <input
                                  type="color"
                                  onInput={(e) => {
                                    const target = e.target as HTMLInputElement
                                    executeDisclaimerCommand('foreColor', target.value)
                                  }}
                                  className="w-8 h-7 border border-gray-300 rounded cursor-pointer"
                                  title="Couleur"
                                />
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <select
                                  onMouseDown={(e) => {
                                    const editor = disclaimerEditorRef.current
                                    if (editor) editor.focus()
                                  }}
                                  onChange={(e) => {
                                    const editor = disclaimerEditorRef.current
                                    if (!editor) return
                                    editor.focus()
                                    const size = e.target.value
                                    if (size === 'default') {
                                      executeDisclaimerCommand('removeFormat')
                                    } else {
                                      const success = document.execCommand('fontSize', false, size)
                                      if (!success) {
                                        const selection = window.getSelection()
                                        if (selection && selection.rangeCount > 0) {
                                          const range = selection.getRangeAt(0)
                                          const span = document.createElement('span')
                                          span.style.fontSize = `${Number(size) * 0.5}em`
                                          try {
                                            range.surroundContents(span)
                                          } catch (e) {
                                            document.execCommand('insertHTML', false, `<span style="font-size: ${Number(size) * 0.5}em">${range.toString()}</span>`)
                                          }
                                        }
                                      }
                                      setTimeout(() => {
                                        updateDisclaimerContent()
                                        refreshDisclaimerFontSize()
                                      }, 0)
                                    }
                                    setDisclaimerCurrentFontSize(size)
                                  }}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                                  value={disclaimerCurrentFontSize}
                                >
                                  <option value="default">Taille</option>
                                  <option value="1">Très petit</option>
                                  <option value="2">Petit</option>
                                  <option value="3">Normal</option>
                                  <option value="4">Moyen</option>
                                  <option value="5">Grand</option>
                                  <option value="6">Très grand</option>
                                  <option value="7">Énorme</option>
                                </select>
                              </div>
                              {/* Éditeur de contenu */}
                              <div
                                ref={(el) => {
                                  disclaimerEditorRef.current = el
                                  if (el && !disclaimerEditorInitialized) {
                                    // Initialiser le contenu seulement une fois
                                    const currentContent = el.innerHTML.trim()
                                    if (currentContent === '' || currentContent === '<br>' || currentContent === '<p><br></p>') {
                                      const contentToLoad = fichePratiqueForm.disclaimer_text && fichePratiqueForm.disclaimer_text.trim() !== ''
                                        ? fichePratiqueForm.disclaimer_text
                                        : DEFAULT_DISCLAIMER_TEXT
                                      el.innerHTML = contentToLoad
                                      // S'assurer que les liens sont visibles et stylés
                                      const links = el.querySelectorAll('a')
                                      links.forEach(link => {
                                        // Si le lien pointe vers /contact, utiliser le style purple
                                        if (link.getAttribute('href') === '/contact') {
                                          link.style.color = '#774792'
                                          link.style.textDecoration = 'underline'
                                          link.style.fontWeight = '600'
                                        } else if (!link.style.color) {
                                          link.style.color = '#2563eb'
                                          link.style.textDecoration = 'underline'
                                        }
                                      })
                                    }
                                    setDisclaimerEditorInitialized(true)
                                  }
                                }}
                                contentEditable
                                onInput={() => {
                                  updateDisclaimerContent()
                                  refreshDisclaimerFontSize()
                                }}
                                onBlur={() => {
                                  updateDisclaimerContent()
                                }}
                                className="w-full min-h-[100px] px-3 py-2 rounded-b-lg border border-t-0 border-gray-300 focus:border-[#774792] focus:ring focus:ring-purple-200 text-sm focus:outline-none"
                                style={{ whiteSpace: 'pre-wrap' }}
                              />
                              <p className="text-xs text-gray-500">
                                Si vous laissez vide, le texte de disclaimer par défaut sera utilisé.
                              </p>
                            </div>
                          </details>

                          <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-gray-100 mt-4">
                            <input
                              type="checkbox"
                              checked={fichePratiqueForm.show_linkedin_cta}
                              onChange={(e) => setFichePratiqueForm({ ...fichePratiqueForm, show_linkedin_cta: e.target.checked })}
                              className="w-5 h-5 text-[#0a66c2] border-gray-300 rounded focus:ring-[#0a66c2] focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Afficher l&apos;invitation LinkedIn en bas de la fiche
                            </span>
                          </label>
                        </div>
                      </div>

                    </div>

                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Contenu de la fiche</h3>
                      <FichePratiqueEditor
                        sections={fichePratiqueSections}
                        onSectionsChange={setFichePratiqueSections}
                        onImageUpload={async (file, sectionId) => {
                          console.log('Upload d\'image dans section:', sectionId, 'Fichier:', file.name)
                          try {
                            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
                            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
                            if (!supabaseUrl || !supabaseAnonKey) {
                              throw new Error('Configuration Supabase manquante (URL ou clé anon).')
                            }

                            const headers = await getAuthHeaders()
                            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                            const filePath = `fiches-pratiques/${Date.now()}-${safeName}`
                            const encodedPath = filePath.split('/').map(encodeURIComponent).join('/')

                            const uploadUrl = `${supabaseUrl}/storage/v1/object/fiches-pratiques-images/${encodedPath}`
                            console.log('Upload REST vers:', uploadUrl)

                            const controller = new AbortController()
                            const timeoutId = setTimeout(() => {
                              controller.abort()
                            }, 30000)

                            const uploadRes = await fetch(uploadUrl, {
                              method: 'POST',
                              headers: {
                                apikey: supabaseAnonKey,
                                Authorization: (headers as { Authorization: string }).Authorization,
                                'Content-Type': file.type || 'application/octet-stream',
                                'x-upsert': 'false',
                                'cache-control': '3600',
                              },
                              body: file,
                              signal: controller.signal,
                            })

                            clearTimeout(timeoutId)

                            if (!uploadRes.ok) {
                              const text = await uploadRes.text()
                              console.error('Erreur upload image section (HTTP):', uploadRes.status, text)
                              throw new Error(text || `Erreur upload image (${uploadRes.status})`)
                            }

                            const publicUrl = `${supabaseUrl}/storage/v1/object/public/fiches-pratiques-images/${encodedPath}`
                            console.log('URL publique image section:', publicUrl)
                            return publicUrl
                          } catch (error) {
                            console.error('Erreur complète upload image section:', error)
                            throw error
                          }
                        }}
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAction(null)
                              setEditingFichePratique(null)
                            }}
                            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl bg-[#774792] text-white hover:bg-[#5d356f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Enregistrement...' : editingFichePratique ? 'Enregistrer les modifications' : 'Enregistrer la fiche pratique'}
                          </button>
                        </div>
                        
                        {/* Toggle de publication en bas, aligné à droite */}
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium transition-colors ${!fichePratiquePublished ? 'text-gray-700' : 'text-gray-400'}`}>
                            Non publié
                          </span>
                          <button
                            type="button"
                            onClick={() => setFichePratiquePublished(!fichePratiquePublished)}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#774792] focus:ring-offset-2 ${
                              fichePratiquePublished ? 'bg-[#774792]' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={fichePratiquePublished}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                fichePratiquePublished ? 'translate-x-9' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-sm font-medium transition-colors ${fichePratiquePublished ? 'text-[#774792]' : 'text-gray-400'}`}>
                            Publié
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Modal pour ajouter/modifier un lien dans le disclaimer */}
                    {disclaimerLinkModal.visible && (
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" 
                        style={{ 
                          left: 0, 
                          right: 0, 
                          top: 0, 
                          bottom: 0,
                          position: 'fixed'
                        }}
                        onMouseDown={(e) => {
                          if (e.target === e.currentTarget) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <div 
                          className="bg-white rounded-lg p-6 max-w-md w-full my-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {disclaimerLinkModal.existingLink ? 'Modifier le lien' : 'Ajouter un lien'}
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL
                              </label>
                              <input
                                type="url"
                                value={disclaimerLinkModal.url}
                                onChange={(e) => setDisclaimerLinkModal({ ...disclaimerLinkModal, url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="https://exemple.com"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={disclaimerLinkModal.openInNewTab}
                                  onChange={(e) => setDisclaimerLinkModal({ ...disclaimerLinkModal, openInNewTab: e.target.checked })}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">Ouvrir dans un nouvel onglet</span>
                              </label>
                            </div>
                            <div className="flex gap-2 justify-end">
                              {disclaimerLinkModal.existingLink && (
                                <button
                                  type="button"
                                  onClick={removeDisclaimerLink}
                                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  Supprimer le lien
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDisclaimerLinkModal({ visible: false, url: '', openInNewTab: true, existingLink: null, savedRange: null })}
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={applyDisclaimerLink}
                                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                              >
                                {disclaimerLinkModal.existingLink ? 'Modifier' : 'Appliquer'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {selectedAction === 'consulter-fiches-pratiques' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter et modifier les fiches pratiques</h2>
                      <p className="text-gray-600 mt-2">Gérez toutes les fiches pratiques existantes.</p>
                    </div>
                    <button
                      onClick={() => setSelectedAction('ajouter-fiche-pratique')}
                      className="px-4 py-2 bg-[#774792] text-white rounded-lg hover:bg-[#5d356f] transition-colors"
                    >
                      + Ajouter une fiche
                    </button>
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
                    <input
                      type="text"
                      value={fichesPratiquesSearch}
                      onChange={(e) => setFichesPratiquesSearch(e.target.value)}
                      placeholder="Rechercher une fiche pratique..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200"
                    />
                  </div>

                  {/* Liste des fiches pratiques */}
                  {isLoadingFichesPratiques ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des fiches pratiques...</p>
                    </div>
                  ) : fichesPratiquesList.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500">Aucune fiche pratique trouvée.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fichesPratiquesList
                        .filter((fiche) =>
                          fiche.titre.toLowerCase().includes(fichesPratiquesSearch.toLowerCase()) ||
                          fiche.slug.toLowerCase().includes(fichesPratiquesSearch.toLowerCase())
                        )
                        .map((fiche) => (
                          <div
                            key={fiche.id}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-gray-800">{fiche.titre}</h3>
                                  {fiche.published === false && (
                                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                      Brouillon
                                    </span>
                                  )}
                                  {fiche.published === true && (
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                      Publié
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{fiche.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {fiche.articles_ria.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      Articles: {fiche.articles_ria.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingFichePratique(fiche)
                                    // Charger toutes les sections, y compris les sections sources
                                    // Les sections sources sont maintenant gérées dans l'éditeur de sections
                                    let sectionsToLoad = [...(fiche.contenu?.sections || [])]
                                      .map((s, index) => {
                                        const section: any = {
                                          ...s,
                                          // S'assurer que chaque section a un ID unique
                                          id: s.id || `${s.type}-${Date.now()}-${index}`,
                                        }
                                        // S'assurer que les blocs ont tous des IDs
                                        if (section.blocs && Array.isArray(section.blocs)) {
                                          section.blocs = section.blocs.map((block: any, blockIndex: number) => ({
                                            ...block,
                                            id: block.id || `block-${section.id || index}-${blockIndex}`,
                                          }))
                                        }
                                        return section
                                      })
                                    
                                    setFichePratiqueForm({
                                      slug: fiche.slug,
                                      titre: fiche.titre,
                                      description: fiche.description || '',
                                      articles_ria: fiche.articles_ria,
                                      concerne_rgpd: fiche.concerne_rgpd || false,
                                      show_disclaimer: fiche.show_disclaimer !== false,
                                      disclaimer_text: fiche.disclaimer_text && fiche.disclaimer_text.trim().length > 0
                                        ? fiche.disclaimer_text
                                        : DEFAULT_DISCLAIMER_TEXT,
                                      show_linkedin_cta: fiche.show_linkedin_cta !== false,
                                      linkedin_cta_text: fiche.linkedin_cta_text && fiche.linkedin_cta_text.trim().length > 0
                                        ? fiche.linkedin_cta_text
                                        : DEFAULT_LINKEDIN_CTA_TEXT,
                                      sources: [],
                                    })
                                    setArticlesRiaInput(fiche.articles_ria.join(', '))
                                    setFichePratiquePublished(fiche.published === true)
                                    setFichePratiqueSections(sectionsToLoad)
                                    setSelectedAction('ajouter-fiche-pratique')
                                  }}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => setDeleteFichePratiqueConfirmId(fiche.id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
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

              {!selectedAction && (
                <AdminDashboard onActionSelect={(action) => {
                setSelectedAction(action as AdminAction)
                if (action === 'ajouter-article-doctrine') setEditingDoctrine(null)
              }} />
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
                        const headers = await getAuthHeaders()
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

              {selectedAction === 'consulter-rag-questions' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Consulter les questions RAG</h2>
                      <p className="text-gray-600 mt-2">Consultez et supprimez les questions posées dans le système RAG.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredRAGQuestions.length} question{filteredRAGQuestions.length > 1 ? 's' : ''}
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
                      value={ragSearch}
                      onChange={(e) => setRagSearch(e.target.value)}
                      placeholder="Rechercher par question..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                    />
                  </div>

                  {/* Liste des questions */}
                  {isLoadingRAG ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792]"></div>
                      <p className="mt-4 text-gray-600">Chargement des questions...</p>
                    </div>
                  ) : filteredRAGQuestions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">
                        {ragSearch
                          ? 'Aucune question ne correspond à votre recherche.'
                          : 'Aucune question trouvée.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRAGQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-gray-800 mb-2">{q.question}</p>
                              {q.sources && q.sources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {q.sources.map((source, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200"
                                    >
                                      {source === 'reglement' ? '📋 Règlement' : 
                                       source === 'lignes_directrices' ? '📘 Lignes directrices' : 
                                       source === 'jurisprudence' ? '⚖️ Jurisprudence' : source}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                                onClick={() => setDeleteRAGConfirmId(q.id)}
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

                  {/* Modal de confirmation de suppression */}
                  {deleteRAGConfirmId !== null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                      <div className="bg-white rounded-xl p-6 max-w-md w-full my-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Êtes-vous sûr de vouloir supprimer cette question RAG ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setDeleteRAGConfirmId(null)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleDeleteRAGQuestion(deleteRAGConfirmId)}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isSubmitting ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </div>
                      </div>
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
                                            fiches: parseFichesString(data.fiches ?? ''),
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
                            const headers = await getAuthHeaders()
                            const response = await fetch(
                              `${supabaseUrl}/rest/v1/article?id_article=eq.${selectedArticleId}`,
                              {
                                method: 'PATCH',
                                headers,
                                body: JSON.stringify({
                                  resume: enrichForm.resume.trim(),
                                  recitals: enrichForm.recitals.trim(),
                                  fiches: serializeFiches(enrichForm.fiches),
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
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                              <FichesEditor
                                fiches={enrichForm.fiches}
                                onChange={(fiches) => setEnrichForm({ ...enrichForm, fiches })}
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Ajoutez une ou plusieurs fiches avec un titre et un lien (chemin interne ou URL).
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
                                fiches: [],
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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

      {/* Modal de confirmation de suppression d'un article de doctrine */}
      {deleteDoctrineConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-auto">
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
                  {/* En-tête avec statistiques */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                          <span className="text-4xl">📁</span>
                          Gestion des fichiers
                        </h2>
                        <p className="text-gray-600 mt-2 ml-11">
                        Upload, téléchargez et gérez vos fichiers (Excel, Word, PDF, etc.)
                      </p>
                    </div>
                    </div>
                    
                    {/* Statistiques */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-700">Total fichiers</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">{filesList.length}</p>
                          </div>
                          <span className="text-3xl opacity-50">📊</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Disponibles adhérents</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                              {filesList.filter(f => f.is_available).length}
                            </p>
                          </div>
                          <span className="text-3xl opacity-50">✅</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">Avec description</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                              {filesList.filter(f => f.description).length}
                            </p>
                          </div>
                          <span className="text-3xl opacity-50">📝</span>
                        </div>
                      </div>
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
                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <span className="text-xl">📤</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Uploader un fichier</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sélectionner un fichier
                        </label>
                        <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept=".xlsx,.xls,.doc,.docx,.pdf"
                            className="w-full px-4 py-3 rounded-xl bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
                          />
                          {!selectedFile && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-32">
                              <span className="text-sm text-gray-400">ou glissez-déposez un fichier ici</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <span>📋</span>
                          Formats acceptés : Excel (.xlsx, .xls), Word (.doc, .docx), PDF (.pdf)
                        </p>
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-3 text-sm bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">📄</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate" title={selectedFile.name}>
                            {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Retirer le fichier"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <button
                        onClick={handleUploadFile}
                        disabled={!selectedFile || uploadingFile}
                        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploadingFile ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 4.627 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Upload en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>📤</span>
                            <span>Uploader le fichier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Liste des fichiers */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span>📂</span>
                        Fichiers disponibles
                      </h3>
                      {filesList.length > 0 && (
                        <button
                          onClick={loadFiles}
                          disabled={isLoadingFiles}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                          title="Rafraîchir la liste"
                        >
                          {isLoadingFiles ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 4.627 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <span>🔄</span>
                          )}
                          <span>Rafraîchir</span>
                        </button>
                      )}
                    </div>
                    
                    {isLoadingFiles ? (
                      <div className="text-center py-12 text-gray-500">
                        <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-purple-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 4.627 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p>Chargement des fichiers...</p>
                      </div>
                    ) : filesList.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-3xl">📁</span>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Aucun fichier pour le moment</p>
                        <p className="text-sm text-gray-500">Uploadez votre premier fichier ci-dessus</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filesList.map((file) => {
                          const fileSize = file.metadata?.size 
                            ? `${(file.metadata.size / 1024 / 1024).toFixed(2)} MB`
                            : 'Taille inconnue'
                          const fileType = file.metadata?.mimetype || 'Type inconnu'
                          const isAvailable = file.is_available || false
                          
                          return (
                            <div
                              key={file.id}
                              className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all p-5"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Icône et infos du fichier */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                                    fileType.includes('excel') || fileType.includes('spreadsheet') 
                                      ? 'bg-green-100' 
                                      : fileType.includes('word') || fileType.includes('document')
                                      ? 'bg-blue-100'
                                      : fileType.includes('pdf')
                                      ? 'bg-red-100'
                                      : 'bg-purple-100'
                                  }`}>
                                  {fileType.includes('excel') || fileType.includes('spreadsheet') ? (
                                      <span className="text-3xl">📊</span>
                                  ) : fileType.includes('word') || fileType.includes('document') ? (
                                      <span className="text-3xl">📝</span>
                                  ) : fileType.includes('pdf') ? (
                                      <span className="text-3xl">📄</span>
                                  ) : (
                                      <span className="text-3xl">📁</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate text-base">{file.name}</p>
                                        {file.description && (
                                          <p className="text-sm text-gray-600 mt-1.5 italic line-clamp-2" title={file.description}>
                                            {file.description}
                                          </p>
                                        )}
                                      </div>
                                      {isAvailable && (
                                        <span className="flex-shrink-0 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                                          ✓ Disponible
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <span>📏</span>
                                        {fileSize}
                                      </span>
                                      <span className="hidden sm:inline">•</span>
                                      <span className="flex items-center gap-1">
                                        <span>📅</span>
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
                                
                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium whitespace-nowrap ${
                                    isAvailable
                                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                  }`}>
                                    <input
                                      type="checkbox"
                                      checked={isAvailable}
                                      onChange={(e) => handleToggleFileAvailability(file.name, e.target.checked)}
                                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span>Dispo. adhérents</span>
                                  </label>
                                  
                                  <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDownloadFile(file.name)}
                                      className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                                      title="Télécharger le fichier"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => setEditDescriptionData({ fileName: file.name, description: file.description || '' })}
                                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                        file.description
                                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                      }`}
                                      title={file.description ? "Modifier la description" : "Ajouter une description"}
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => setRenameFileData({ oldName: file.name, newName: file.name })}
                                      className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium"
                                      title="Renommer le fichier"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteFileConfirmName(file.name)}
                                      className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
                                      title="Supprimer le fichier"
                                >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes perso — to-do, brouillons LinkedIn */}
              {selectedAction === 'notes-perso' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                      <span>📝</span> Notes & to-do
                    </h2>
                    <p className="text-gray-600 mt-1">Prenez des notes, gérez votre to-do ou préparez des brouillons (ex. posts LinkedIn). Sauvegardé automatiquement en base (visible sur tous vos appareils).</p>
                  </div>
                  {isLoadingAdminNotes ? (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#774792] block mr-2" aria-hidden />
                      Chargement des notes…
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800">Notes</h3>
                      </div>
                      <textarea
                        value={adminNotes.notes}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes diverses…"
                        className="w-full h-48 p-4 text-sm text-gray-800 placeholder:text-gray-400 border-0 focus:ring-0 resize-y min-h-[8rem]"
                        aria-label="Notes"
                      />
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-amber-50">
                        <h3 className="text-sm font-semibold text-gray-800">To-do</h3>
                      </div>
                      <div className="p-4 min-h-[12rem] max-h-96 overflow-y-auto">
                        <ul className="space-y-2">
                          {adminNotes.todo.map((item) => (
                            <li key={item.id} className="flex items-center gap-2 group">
                              <input
                                type="checkbox"
                                checked={item.done}
                                onChange={() => toggleTodoItem(item.id)}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 shrink-0"
                                aria-label={item.text || 'Cocher'}
                              />
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateTodoItemText(item.id, e.target.value)}
                                onBlur={(e) => updateTodoItemText(item.id, e.target.value.trim() || item.text)}
                                className={`flex-1 min-w-0 text-sm border-0 border-b border-transparent hover:border-gray-200 focus:border-amber-400 focus:ring-0 py-0.5 bg-transparent ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                                aria-label="Libellé de la tâche"
                              />
                              <button
                                type="button"
                                onClick={() => removeTodoItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all shrink-0"
                                aria-label="Supprimer la tâche"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <input
                            type="text"
                            value={adminTodoNewText}
                            onChange={(e) => setAdminTodoNewText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTodoItem())}
                            placeholder="Nouvelle tâche…"
                            className="flex-1 min-w-0 text-sm px-2 py-1.5 rounded border border-gray-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                            aria-label="Ajouter une tâche"
                          />
                          <button
                            type="button"
                            onClick={addTodoItem}
                            className="px-3 py-1.5 text-sm font-medium rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors shrink-0"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                        <h3 className="text-sm font-semibold text-gray-800">Brouillons (ex. LinkedIn)</h3>
                      </div>
                      <textarea
                        value={adminNotes.linkedin}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="Brouillon de post…"
                        className="w-full h-48 p-4 text-sm text-gray-800 placeholder:text-gray-400 border-0 focus:ring-0 resize-y min-h-[8rem]"
                        aria-label="Brouillons LinkedIn"
                      />
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression d'une question de quiz */}
      {deleteQuestionConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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

      {/* Modal d'édition de la description d'un fichier */}
      {editDescriptionData !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Éditer la description</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Fichier : "{editDescriptionData.fileName}"
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={editDescriptionData.description}
                  onChange={(e) => setEditDescriptionData({ ...editDescriptionData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ajoutez une description pour ce fichier..."
                  rows={4}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette description sera visible par les adhérents pour les fichiers disponibles.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditDescriptionData(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSaveDescription(editDescriptionData.fileName, editDescriptionData.description)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de renommage d'un fichier */}
      {renameFileData !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Renommer le fichier</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Renommez "{renameFileData.oldName}"
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau nom
                </label>
                <input
                  type="text"
                  value={renameFileData.newName}
                  onChange={(e) => setRenameFileData({ ...renameFileData, newName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nom du fichier"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setRenameFileData(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRenameFile(renameFileData.oldName, renameFileData.newName)}
                  disabled={isSubmitting || !renameFileData.newName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Renommage...' : 'Renommer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'une fiche pratique */}
      {deleteFichePratiqueConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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
                    Êtes-vous sûr de vouloir supprimer cette fiche pratique ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDeleteFichePratiqueConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteFichePratique(deleteFichePratiqueConfirmId)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overflow-x-hidden p-4" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full my-auto">
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
