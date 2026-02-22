import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'

const MonEspacePage: React.FC = () => {
  const { isAdherent, profile, loading, session } = useAuth()
  const navigate = useNavigate()

  // États pour le formulaire de modification des infos
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [profession, setProfession] = useState('')
  const [consentementProspection, setConsentementProspection] = useState(false)
  const [isEditingInfos, setIsEditingInfos] = useState(false)
  const [isSavingInfos, setIsSavingInfos] = useState(false)
  const [infosMessage, setInfosMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)

  // États pour le changement de mot de passe
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // États pour la demande de suppression
  const [showDeletionRequest, setShowDeletionRequest] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionPassword, setDeletionPassword] = useState('')
  const [deletionConfirm, setDeletionConfirm] = useState(false)
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false)
  const [deletionMessage, setDeletionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [existingDeletionRequest, setExistingDeletionRequest] = useState<any>(null)

  // États pour les fichiers disponibles
  const [availableFiles, setAvailableFiles] = useState<Array<{ file_name: string; created_at: string; description?: string }>>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // État pour le dépliant de prospection commerciale
  const [isProspectionExpanded, setIsProspectionExpanded] = useState(false)
  
  // État pour le dépliant de suppression de compte
  const [isDeletionExpanded, setIsDeletionExpanded] = useState(false)

  // Charger les infos utilisateur uniquement depuis les métadonnées Supabase
  // On évite d'appeler la table profiles côté client car les requêtes timeout / 500
  useEffect(() => {
    if (!session?.user) {
      console.log('⚠️ [MON ESPACE] Pas de session, impossible de charger les infos')
      return
    }

    const metadata = session.user.user_metadata
    console.log('🔵 [MON ESPACE] Chargement des infos depuis user_metadata:', metadata)
    setPrenom(metadata?.prenom || '')
    setNom(metadata?.nom || '')
    setProfession(metadata?.profession || '')
    setConsentementProspection(metadata?.consentement_prospection === true)
  }, [session])

  // Rediriger si l'utilisateur n'est pas adhérent
  useEffect(() => {
    if (!loading && !isAdherent()) {
      navigate('/connexion')
    }
  }, [loading, isAdherent, navigate])

  // Charger les fichiers disponibles
  const loadAvailableFiles = async () => {
    setIsLoadingFiles(true)
    try {
      if (!session) {
        console.warn('Pas de session pour charger les fichiers')
        setAvailableFiles([])
        return
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Configuration Supabase manquante')
        setAvailableFiles([])
        return
      }

      // Utiliser l'API REST directement
      // Filtrer uniquement les fichiers avec is_available = true (booléen)
      const url = `${supabaseUrl}/rest/v1/adherent_files?is_available=eq.true&select=file_name,created_at,description&order=created_at.desc`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erreur lors du chargement des fichiers:', errorText)
        setAvailableFiles([])
        return
      }

      const data = await response.json()
      // Filtrer une deuxième fois côté client pour être sûr (au cas où)
      const filteredData = (data || []).filter((file: { is_available?: boolean }) => file.is_available === true)
      setAvailableFiles(filteredData)
    } catch (err) {
      console.error('Exception lors du chargement des fichiers:', err)
      setAvailableFiles([])
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Charger les fichiers au montage du composant et quand la page redevient visible
  useEffect(() => {
    // Utiliser session?.user?.id comme dépendance stable au lieu de session complète
    // et vérifier isAdherent() dans la condition mais ne pas l'inclure dans les dépendances
    if (!loading && isAdherent() && session?.user?.id) {
      loadAvailableFiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session?.user?.id])

  // Rafraîchir la liste quand la page redevient visible (pour détecter les changements depuis l'admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && isAdherent() && session?.user?.id) {
        loadAvailableFiles()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session?.user?.id])

  // Charger la demande de suppression existante au démarrage
  useEffect(() => {
    const loadExistingDeletionRequest = async () => {
      if (!session?.user?.id || !isAdherent()) return

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey || !session?.access_token) {
          return
        }

        const url = `${supabaseUrl}/rest/v1/deletion_requests?user_id=eq.${session.user.id}&status=in.(pending,processing)&select=*&order=requested_at.desc&limit=1`
        const response = await fetch(url, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
            'Accept': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setExistingDeletionRequest(data[0])
          }
        }
      } catch (err) {
        console.warn('⚠️ [MON ESPACE] Erreur lors du chargement de la demande existante:', err)
      }
    }

    if (!loading && isAdherent() && session?.user?.id) {
      loadExistingDeletionRequest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session?.user?.id])

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
      
      // Utiliser le même endpoint que dans AdminConsolePage (sans /download/)
      const downloadUrl = `${supabaseUrl}/storage/v1/object/admin-files/${encodeURIComponent(fileName)}`
      
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
      alert(err instanceof Error ? err.message : 'Erreur lors du téléchargement du fichier.')
    }
  }

  const handleSignOut = () => {
    // On délègue le signOut à la page connexion via le paramètre logout=1
    window.location.assign('/connexion?logout=1')
  }

  const handleSaveInfos = async () => {
    setIsSavingInfos(true)
    setInfosMessage(null)

    // Vérifier que l'utilisateur est connecté (via useAuth)
    if (!session) {
      setInfosMessage({ type: 'error', text: 'Session expirée. Veuillez vous reconnecter.' })
      setIsSavingInfos(false)
      return
    }

    try {
      console.log('🔵 [MON ESPACE] Début de la mise à jour des infos...')
      console.log('🔵 [MON ESPACE] Données à sauvegarder:', { prenom, nom, profession, consentementProspection })
      console.log('🔵 [MON ESPACE] User ID:', session.user.id)

      // Mettre à jour UNIQUEMENT les user_metadata via l'API REST directe
      // (contournement du client Supabase qui peut bloquer)
      console.log('🔵 [MON ESPACE] Mise à jour des user_metadata via API REST...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const accessToken = session.access_token
      
      if (!supabaseUrl || !accessToken) {
        console.error('❌ [MON ESPACE] URL Supabase ou token manquant')
        setInfosMessage({ type: 'error', text: 'Erreur de configuration' })
        setIsSavingInfos(false)
        return
      }

      // Préparer les nouvelles métadonnées (fusionner avec les existantes)
      const currentMetadata = session.user.user_metadata || {}
      const newMetadata = {
        ...currentMetadata,
        prenom: prenom.trim() || null,
        nom: nom.trim() || null,
        profession: profession.trim() || null,
        consentement_prospection: consentementProspection,
      }

      console.log('🔵 [MON ESPACE] Nouvelles métadonnées:', newMetadata)

      // Appel direct à l'API REST de Supabase Auth
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          data: newMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ [MON ESPACE] Erreur API REST:', errorData)
        setInfosMessage({ type: 'error', text: errorData.message || 'Erreur lors de la mise à jour' })
        setIsSavingInfos(false)
        return
      }

      const updatedUser = await response.json()
      console.log('✅ [MON ESPACE] user_metadata mis à jour avec succès via API REST')
      console.log('🔵 [MON ESPACE] Utilisateur mis à jour:', updatedUser)
      
      // Utiliser directement les métadonnées retournées par l'API pour mettre à jour l'affichage immédiatement
      if (updatedUser?.user_metadata) {
        const updatedMetadata = updatedUser.user_metadata
        console.log('🔵 [MON ESPACE] Nouvelles métadonnées depuis API:', updatedMetadata)
        setPrenom(updatedMetadata.prenom || '')
        setNom(updatedMetadata.nom || '')
        setProfession(updatedMetadata.profession || '')
        setConsentementProspection(updatedMetadata.consentement_prospection === true)
      }
      
      // Mettre à jour les états locaux directement avec les nouvelles métadonnées
      console.log('✅ [MON ESPACE] Mise à jour des états locaux avec les nouvelles métadonnées')
      
      setInfosMessage({ type: 'success', text: 'Vos informations ont été mises à jour !' })
      setIsEditingInfos(false)
      
      // Attendre un peu pour que Supabase propage les changements
      console.log('🔵 [MON ESPACE] Attente de la propagation des changements...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Forcer un rafraîchissement complet de la session depuis le serveur
      // (en invalidant le cache du navigateur)
      console.log('🔵 [MON ESPACE] Rafraîchissement forcé de la session...')
      try {
        // Forcer un refresh de la session qui va recharger depuis le serveur
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.warn('⚠️ [MON ESPACE] Erreur lors du rafraîchissement de session:', refreshError)
        } else if (refreshedSession?.user?.user_metadata) {
          const refreshedMetadata = refreshedSession.user.user_metadata
          console.log('✅ [MON ESPACE] Session rafraîchie avec succès')
          console.log('🔵 [MON ESPACE] Métadonnées depuis session rafraîchie:', refreshedMetadata)
          
          // Mettre à jour les états avec les nouvelles métadonnées
          setPrenom(refreshedMetadata.prenom || '')
          setNom(refreshedMetadata.nom || '')
          setProfession(refreshedMetadata.profession || '')
          setConsentementProspection(refreshedMetadata.consentement_prospection === true)
        }
      } catch (refreshErr) {
        console.warn('⚠️ [MON ESPACE] Exception lors du rafraîchissement de session:', refreshErr)
      }
      
      // Forcer un rechargement complet de la page avec cache-busting
      // pour s'assurer que la session est bien rechargée depuis le serveur
      console.log('🔄 [MON ESPACE] Rechargement de la page avec invalidation du cache...')
      // Utiliser location.reload() avec un paramètre pour forcer le rechargement
      window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now()
    } catch (err) {
      console.error('Exception lors de la mise à jour:', err)
      setInfosMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setIsSavingInfos(false)
    }
  }

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une majuscule'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une minuscule'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre'
    }
    return null
  }

  const handleRequestDeletion = async () => {
    if (!session?.user) {
      setDeletionMessage({ type: 'error', text: 'Session expirée. Veuillez vous reconnecter.' })
      return
    }

    // Validations
    if (!deletionPassword) {
      setDeletionMessage({ type: 'error', text: 'Veuillez entrer votre mot de passe pour confirmer' })
      return
    }

    if (!deletionConfirm) {
      setDeletionMessage({ type: 'error', text: 'Veuillez cocher la case de confirmation' })
      return
    }

    setIsSubmittingDeletion(true)
    setDeletionMessage(null)

    try {
      // Vérifier le mot de passe
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const userEmail = session.user.email

      if (!supabaseUrl || !userEmail) {
        setDeletionMessage({ type: 'error', text: 'Erreur de configuration' })
        setIsSubmittingDeletion(false)
        return
      }

      console.log('🔵 [MON ESPACE] Vérification du mot de passe pour la demande de suppression...')
      const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          email: userEmail,
          password: deletionPassword,
        }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({ message: 'Erreur inconnue' }))
        setDeletionMessage({ type: 'error', text: 'Mot de passe incorrect' })
        setIsSubmittingDeletion(false)
        return
      }

      console.log('✅ [MON ESPACE] Mot de passe vérifié, création de la demande de suppression...')
      console.log('🔵 [MON ESPACE] Données à insérer:', {
        user_id: session.user.id,
        email: userEmail,
        reason: deletionReason.trim() || null,
        status: 'pending',
      })
      console.log('🔵 [MON ESPACE] Session user ID:', session.user.id)
      console.log('🔵 [MON ESPACE] Session access_token présent:', !!session.access_token)
      console.log('🔵 [MON ESPACE] Type de user_id:', typeof session.user.id)

      // Créer la demande de suppression via API REST directe
      console.log('🔵 [MON ESPACE] Création de la demande via API REST...')
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseAnonKey) {
        setDeletionMessage({ type: 'error', text: 'Erreur de configuration' })
        setIsSubmittingDeletion(false)
        return
      }

      const insertUrl = `${supabaseUrl}/rest/v1/deletion_requests`
      const insertResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
        user_id: session.user.id,
        email: userEmail,
        reason: deletionReason.trim() || null,
        status: 'pending',
        }),
      })

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text().catch(() => '')
        const errorData = errorText ? JSON.parse(errorText) : { message: 'Erreur inconnue' }
        console.error('❌ [MON ESPACE] Erreur lors de la création de la demande:', insertResponse.status, errorData)
        
        let errorMessage = 'Erreur lors de la création de la demande. Veuillez réessayer.'
        if (insertResponse.status === 403 || errorData.message?.includes('permission denied') || errorData.message?.includes('row-level security')) {
          errorMessage = 'Erreur de permissions. Veuillez contacter l\'administrateur.'
        } else if (errorData.message?.includes('relation') && errorData.message?.includes('does not exist')) {
          errorMessage = 'La table deletion_requests n\'existe pas encore. Veuillez contacter l\'administrateur.'
        } else if (errorData.code === '23503') {
          errorMessage = 'Erreur de référence. Veuillez contacter l\'administrateur.'
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        
        setDeletionMessage({ type: 'error', text: errorMessage })
        setIsSubmittingDeletion(false)
        return
      }

      const data = await insertResponse.json()
      const createdRequest = Array.isArray(data) ? data[0] : data

      if (!createdRequest) {
        console.error('❌ [MON ESPACE] Aucune donnée retournée après insertion')
        setDeletionMessage({ type: 'error', text: 'Erreur : aucune donnée retournée après insertion' })
        setIsSubmittingDeletion(false)
        return
      }

      console.log('✅ [MON ESPACE] Demande de suppression créée avec succès:', createdRequest)
      setExistingDeletionRequest(createdRequest)
      setDeletionMessage({ 
        type: 'success', 
        text: 'Votre demande de suppression a été envoyée. Elle sera traitée par un administrateur sous peu.' 
      })
      setShowDeletionRequest(false)
      setDeletionReason('')
      setDeletionPassword('')
      setDeletionConfirm(false)

    } catch (err) {
      console.error('❌ [MON ESPACE] Exception lors de la demande de suppression:', err)
      setDeletionMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' })
    } finally {
      setIsSubmittingDeletion(false)
    }
  }

  const handleCancelDeletionRequest = async () => {
    if (!existingDeletionRequest || !session?.user) return

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey || !session?.access_token) {
        setDeletionMessage({ type: 'error', text: 'Erreur de configuration' })
        return
      }

      const cancelUrl = `${supabaseUrl}/rest/v1/deletion_requests?id=eq.${existingDeletionRequest.id}&user_id=eq.${session.user.id}`
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
        }),
      })

      if (!cancelResponse.ok) {
        const errorText = await cancelResponse.text().catch(() => '')
        console.error('❌ [MON ESPACE] Erreur lors de l\'annulation:', cancelResponse.status, errorText)
        setDeletionMessage({ type: 'error', text: 'Erreur lors de l\'annulation de la demande' })
        return
      }

      setExistingDeletionRequest(null)
      setDeletionMessage({ type: 'success', text: 'Votre demande de suppression a été annulée.' })
    } catch (err) {
      console.error('❌ [MON ESPACE] Exception lors de l\'annulation:', err)
      setDeletionMessage({ type: 'error', text: 'Une erreur est survenue.' })
    }
  }

  const handleExportData = async () => {
    if (!session?.user) {
      return
    }

    try {
      console.log('🔵 [MON ESPACE] Génération de l\'export PDF des données...')
      
      const metadata = session.user.user_metadata || {}
      const userEmail = session.user.email || 'Non renseigné'
      const createdAt = session.user.created_at ? new Date(session.user.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Non disponible'
      const lastSignIn = session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Jamais'

      // Créer le PDF
      const doc = new jsPDF()
      
      // Couleurs
      const primaryColor = [119, 71, 146] // #774792
      const lightGray = [245, 245, 245]
      const darkGray = [75, 85, 99]

      // En-tête
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('Export de mes données personnelles', 105, 20, { align: 'center' })
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 105, 30, { align: 'center' })

      let yPosition = 50

      // Section 1: Informations de compte
      doc.setTextColor(...darkGray)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('1. Informations de compte', 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      const accountData = [
        ['Email', userEmail],
        ['Date de création du compte', createdAt],
        ['Dernière connexion', lastSignIn],
        ['ID utilisateur', session.user.id],
      ]

      accountData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(`${label} :`, 25, yPosition)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(value || 'Non renseigné', 150)
        doc.text(lines, 25, yPosition + 5)
        yPosition += lines.length * 6 + 5
      })

      yPosition += 10

      // Section 2: Informations personnelles
      if (metadata.prenom || metadata.nom || metadata.profession) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...darkGray)
        doc.text('2. Informations personnelles', 20, yPosition)
        yPosition += 10

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)

        const personalData = [
          ['Prénom', metadata.prenom || 'Non renseigné'],
          ['Nom', metadata.nom || 'Non renseigné'],
          ['Profession', metadata.profession || 'Non renseigné'],
        ]

        personalData.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold')
          doc.text(`${label} :`, 25, yPosition)
          doc.setFont('helvetica', 'normal')
          doc.text(value, 25, yPosition + 5)
          yPosition += 8
        })

        yPosition += 10
      }

      // Section 3: Consentements et préférences
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkGray)
      doc.text('3. Consentements et préférences', 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)

      const consentement = metadata.consentement_prospection === true ? 'Oui' : 'Non'
      doc.setFont('helvetica', 'bold')
      doc.text('Consentement à la prospection commerciale :', 25, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(consentement, 25, yPosition + 5)
      yPosition += 10

      // Section 4: Note RGPD
      yPosition += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 100, 100)
      const rgpdNote = 'Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit d\'accéder, de rectifier, de supprimer et de porter vos données personnelles. Pour exercer ces droits, contactez-nous via le formulaire de contact.'
      const rgpdLines = doc.splitTextToSize(rgpdNote, 170)
      doc.text(rgpdLines, 20, yPosition)
      yPosition += rgpdLines.length * 5 + 5

      // Pied de page
      const pageCount = doc.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${i} sur ${pageCount} - RIA Facile - Export de données personnelles`,
          105,
          285,
          { align: 'center' }
        )
      }

      // Sauvegarder le PDF
      const fileName = `export-donnees-personnelles-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      console.log('✅ [MON ESPACE] Export PDF généré avec succès')
    } catch (err) {
      console.error('❌ [MON ESPACE] Erreur lors de la génération du PDF:', err)
      alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.')
    }
  }

  const handleSaveConsentement = async (newValue: boolean) => {
    if (!session?.user) {
      return
    }

    try {
      console.log('🔵 [MON ESPACE] Mise à jour du consentement prospection:', newValue)
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const accessToken = session.access_token
      
      if (!supabaseUrl || !accessToken) {
        console.error('❌ [MON ESPACE] URL Supabase ou token manquant')
        return
      }

      // Préparer les nouvelles métadonnées
      const currentMetadata = session.user.user_metadata || {}
      const newMetadata = {
        ...currentMetadata,
        consentement_prospection: newValue,
      }

      // Appel direct à l'API REST de Supabase Auth
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          data: newMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ [MON ESPACE] Erreur API REST pour le consentement:', errorData)
        // Revenir à l'ancienne valeur en cas d'erreur
        setConsentementProspection(!newValue)
        return
      }

      console.log('✅ [MON ESPACE] Consentement mis à jour avec succès')
      
      // Rafraîchir la session en arrière-plan
      supabase.auth.refreshSession().catch(err => {
        console.warn('⚠️ [MON ESPACE] Erreur lors du rafraîchissement de session (non bloquant):', err)
      })
    } catch (err) {
      console.error('❌ [MON ESPACE] Exception lors de la mise à jour du consentement:', err)
      // Revenir à l'ancienne valeur en cas d'erreur
      setConsentementProspection(!newValue)
    }
  }

  const handleSavePassword = async () => {
    setIsSavingPassword(true)
    setPasswordMessage(null)

    // Vérifier que le mot de passe actuel est renseigné
    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Veuillez entrer votre mot de passe actuel' })
      setIsSavingPassword(false)
      return
    }

    // Vérifications
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      setIsSavingPassword(false)
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setPasswordMessage({ type: 'error', text: passwordError })
      setIsSavingPassword(false)
      return
    }

    try {
      const userEmail = session?.user?.email
      if (!userEmail) {
        setPasswordMessage({ type: 'error', text: 'Erreur: email non trouvé' })
        setIsSavingPassword(false)
        return
      }

      console.log('🔵 [MON ESPACE] Vérification du mot de passe actuel via API REST...')
      // Vérifier le mot de passe actuel via l'API REST directe (contournement du timeout)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ [MON ESPACE] Configuration Supabase manquante')
        setPasswordMessage({ type: 'error', text: 'Erreur de configuration' })
        setIsSavingPassword(false)
        return
      }

      // Vérifier le mot de passe actuel via l'endpoint token
      console.log('🔵 [MON ESPACE] Appel API REST pour vérifier le mot de passe...')
      const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: userEmail,
          password: currentPassword,
        }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ [MON ESPACE] Erreur lors de la vérification du mot de passe:', errorData)
        if (errorData.error === 'invalid_grant' || errorData.message?.includes('Invalid login credentials') || errorData.error_description?.includes('Invalid login credentials')) {
          setPasswordMessage({ type: 'error', text: 'Le mot de passe actuel est incorrect' })
        } else {
          setPasswordMessage({ type: 'error', text: errorData.message || errorData.error_description || 'Erreur lors de la vérification du mot de passe' })
        }
        setIsSavingPassword(false)
        return
      }

      const verifyData = await verifyResponse.json()
      const accessToken = verifyData.access_token || session?.access_token
      
      if (!accessToken) {
        console.error('❌ [MON ESPACE] Token non récupéré après vérification')
        setPasswordMessage({ type: 'error', text: 'Erreur lors de la vérification du mot de passe' })
        setIsSavingPassword(false)
        return
      }

      console.log('✅ [MON ESPACE] Mot de passe actuel vérifié avec succès')
      console.log('✅ [MON ESPACE] Mise à jour du mot de passe via API REST...')

      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ [MON ESPACE] Erreur API REST pour le mot de passe:', errorData)
        setPasswordMessage({ type: 'error', text: errorData.message || 'Erreur lors du changement de mot de passe' })
        setIsSavingPassword(false)
        return
      }

      console.log('✅ [MON ESPACE] Mot de passe mis à jour avec succès via API REST')
      setPasswordMessage({ type: 'success', text: 'Votre mot de passe a été modifié !' })
      setIsEditingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      console.error('Exception lors du changement de mot de passe:', err)
      setPasswordMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#774792]"></div>
      </div>
    )
  }

  const userEmail = profile?.email ?? session?.user?.email
  const displayName = prenom || nom ? `${prenom} ${nom}`.trim() : userEmail

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Mon Espace — RIA Facile</title>
        <meta name="description" content="Espace personnel adhérent RIA Facile" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg border border-white overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Mon Espace</h1>
                <p className="text-indigo-100 mt-1">
                  Bienvenue, {displayName}
                </p>
              </div>
              <div className="text-5xl opacity-30">👤</div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6 space-y-6">

            {/* Rappel des accès adhérent : mettre en avant le statut adhérent */}
            <div className="bg-white border border-purple-200 rounded-xl overflow-hidden shadow-sm">
              {/* Bloc principal : réservé aux adhérents */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-5 py-5">
                <h2 className="text-lg font-semibold text-[#774792] mb-1 flex items-center gap-2">
                  <span>✨</span> Grâce à votre adhésion
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Vous avez accès aux contenus réservés aux adhérents :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/assistant-ria" className="flex items-center gap-3 rounded-lg bg-white/80 hover:bg-white border border-purple-100 px-4 py-3 text-[#774792] font-semibold shadow-sm hover:shadow transition-all">
                    <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    Assistant RIA (accès illimité)
                  </Link>
                  <Link to="/verificateur" className="flex items-center gap-3 rounded-lg bg-white/80 hover:bg-white border border-purple-100 px-4 py-3 text-[#774792] font-semibold shadow-sm hover:shadow transition-all">
                    <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    Questionnaires du vérificateur
                  </Link>
                  <Link to="/fiches-pratiques" className="flex items-center gap-3 rounded-lg bg-white/80 hover:bg-white border border-purple-100 px-4 py-3 text-[#774792] font-semibold shadow-sm hover:shadow transition-all">
                    <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    Fiches pratiques
                  </Link>
                  <Link to="/matrice-des-obligations" className="flex items-center gap-3 rounded-lg bg-white/80 hover:bg-white border border-purple-100 px-4 py-3 text-[#774792] font-semibold shadow-sm hover:shadow transition-all">
                    <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    Matrice des obligations
                  </Link>
                </div>
              </div>
              {/* Autres contenus (accessibles aussi sans adhésion) — secondaire */}
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Vous avez aussi accès à</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <Link to="/consulter" className="hover:text-[#774792] hover:underline">Consultation du règlement</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/ria-en-5-minutes" className="hover:text-[#774792] hover:underline">RIA en 5 minutes</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/quiz" className="hover:text-[#774792] hover:underline">Quiz</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/schemas" className="hover:text-[#774792] hover:underline">Schémas</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/documentation" className="hover:text-[#774792] hover:underline">Documentation & actualités</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/lexique" className="hover:text-[#774792] hover:underline">Lexique</Link>
                  <span className="text-gray-300">·</span>
                  <Link to="/doctrine" className="hover:text-[#774792] hover:underline">Articles de doctrine</Link>
                </div>
              </div>
              <div className="px-5 py-4 bg-gray-50/80 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">
                  Une idée de nouvelle fonctionnalité ? Nous vous invitons à nous la faire part via le formulaire de contact.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#774792] hover:underline"
                >
                  Suggérer une fonctionnalité via le formulaire de contact
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Section Mes informations */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>👤</span> Mes informations
                </h2>
                {!isEditingInfos && (
                  <button
                    onClick={() => setIsEditingInfos(true)}
                    className="text-sm text-[#774792] hover:underline font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {infosMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                  infosMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {infosMessage.text}
                </div>
              )}

              {isEditingInfos ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-gray-400 font-normal">(non modifiable)</span>
                    </label>
                    <input
                      type="email"
                      value={userEmail || ''}
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      placeholder="Ex: Juriste, DPO, Développeur..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveInfos}
                      disabled={isSavingInfos}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {isSavingInfos ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingInfos(false)
                        setInfosMessage(null)
                        // Réinitialiser avec les valeurs actuelles
                        const metadata = session?.user?.user_metadata
                        setPrenom(metadata?.prenom || '')
                        setNom(metadata?.nom || '')
                        setProfession(metadata?.profession || '')
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Email</span>
                    <span className="text-gray-800 text-sm font-medium">{userEmail}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Prénom</span>
                    <span className="text-gray-800 text-sm font-medium">{prenom || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Nom</span>
                    <span className="text-gray-800 text-sm font-medium">{nom || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500 text-sm">Profession</span>
                    <span className="text-gray-800 text-sm font-medium">{profession || '—'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section Mot de passe */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>🔒</span> Mot de passe
                </h2>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="text-sm text-[#774792] hover:underline font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {passwordMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              {isEditingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 pr-12 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.58" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c1.51 0 2.94.33 4.23.93M19.542 12A10.97 10.97 0 0112 19c-4.478 0-8.268-2.943-9.542-7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      8 caractères minimum, avec majuscule, minuscule et chiffre
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSavePassword}
                      disabled={isSavingPassword}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {isSavingPassword ? 'Modification...' : 'Changer le mot de passe'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false)
                        setPasswordMessage(null)
                        setNewPassword('')
                        setConfirmNewPassword('')
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Votre mot de passe est sécurisé. Cliquez sur "Modifier" pour le changer.
                </p>
              )}
            </div>

            {/* Section Export de données */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <span>📥</span> Export de mes données
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                Conformément au RGPD, vous pouvez télécharger toutes vos données personnelles stockées sur RIA Facile au format PDF.
              </p>
              
              <button
                onClick={handleExportData}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger mes données (PDF)
              </button>
              
              <p className="text-xs text-gray-500 mt-3 italic">
                Le fichier PDF contiendra toutes vos informations personnelles : profil, consentements, dates de création et de connexion.
              </p>
            </div>

            {/* Section Fichiers disponibles */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>📚</span> Fichiers disponibles
                </h2>
                <button
                  onClick={loadAvailableFiles}
                  disabled={isLoadingFiles}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50"
                  title="Rafraîchir la liste"
                >
                  {isLoadingFiles ? '⏳' : '🔄'}
                </button>
                </div>
              
              {isLoadingFiles ? (
                <div className="text-center py-8 text-gray-500">Chargement...</div>
              ) : availableFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Aucun fichier disponible pour le moment.</p>
                  <p className="text-xs text-gray-400 mt-2">Les administrateurs peuvent rendre des fichiers disponibles ici.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableFiles.map((file) => (
                    <div
                      key={file.file_name}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{file.file_name}</p>
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-1 italic">
                              {file.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Ajouté le {new Date(file.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file.file_name)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                      >
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>

            {/* Section Consentement prospection commerciale (dépliable, en bas) */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setIsProspectionExpanded(!isProspectionExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <h2 className="text-lg font-semibold text-gray-800">Prospection commerciale</h2>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isProspectionExpanded ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isProspectionExpanded && (
                <div className="px-6 pb-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="consentementProspection"
                        checked={consentementProspection}
                        onChange={(e) => {
                          // Si l'utilisateur veut décocher, demander confirmation
                          if (consentementProspection && !e.target.checked) {
                            if (!window.confirm('Êtes-vous sûr de vouloir refuser les communications commerciales ? Vous ne recevrez plus nos newsletters et offres exclusives.')) {
                              return
                            }
                          }
                          setConsentementProspection(e.target.checked)
                          // Sauvegarder immédiatement le changement
                          handleSaveConsentement(e.target.checked)
                        }}
                        className="mt-1 w-4 h-4 text-[#774792] border-gray-300 rounded focus:ring-[#774792] focus:ring-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800">
                          J'accepte de recevoir des communications commerciales de RIA Facile
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          En cochant cette case, vous acceptez de recevoir des emails promotionnels, newsletters et autres communications commerciales de RIA Facile. Vous pouvez modifier ce choix à tout moment.
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Pour en savoir plus sur vos droits et la façon dont nous traitons vos données, consultez notre{' '}
                          <a
                            href="/politique-de-confidentialite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#774792] hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Politique de confidentialité
                          </a>
                          .
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Section Suppression de compte (dépliable, en bas) */}
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setIsDeletionExpanded(!isDeletionExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>🗑️</span>
                  <h2 className="text-lg font-semibold text-gray-800">Supprimer mon compte</h2>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isDeletionExpanded ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDeletionExpanded && (
                <div className="px-6 pb-6">
                  {deletionMessage && (
                    <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                      deletionMessage.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {deletionMessage.text}
                    </div>
                  )}

                  {existingDeletionRequest ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-sm text-yellow-800 mb-3">
                        <strong>Demande en cours</strong> : Vous avez déjà une demande de suppression en attente de traitement.
                      </p>
                      <div className="text-xs text-yellow-700 mb-3">
                        <p>Date de la demande : {new Date(existingDeletionRequest.requested_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        {existingDeletionRequest.reason && (
                          <p className="mt-2">Motif : {existingDeletionRequest.reason}</p>
                        )}
                      </div>
                      <button
                        onClick={handleCancelDeletionRequest}
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium text-sm hover:bg-yellow-600 transition-all"
                      >
                        Annuler ma demande
                      </button>
                    </div>
                  ) : (
                    <>
                      {!showDeletionRequest ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-4">
                            Si vous souhaitez supprimer votre compte, vous pouvez faire une demande. Un administrateur traitera votre demande sous peu. Cette action est irréversible.
                          </p>
                          <button
                            onClick={() => {
                              if (!window.confirm('Êtes-vous sûr de vouloir demander la suppression de votre compte ? Cette action est irréversible.')) {
                                return
                              }
                              setShowDeletionRequest(true)
                            }}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all"
                          >
                            Demander la suppression de mon compte
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Veuillez remplir le formulaire ci-dessous pour demander la suppression de votre compte.
                          </p>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Motif de la suppression <span className="text-gray-400 font-normal">(optionnel)</span>
                            </label>
                            <textarea
                              value={deletionReason}
                              onChange={(e) => setDeletionReason(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                              placeholder="Expliquez brièvement pourquoi vous souhaitez supprimer votre compte..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              value={deletionPassword}
                              onChange={(e) => setDeletionPassword(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#774792] focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
                              placeholder="Entrez votre mot de passe pour confirmer"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Nous avons besoin de votre mot de passe pour confirmer votre identité.
                            </p>
                          </div>

                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={deletionConfirm}
                                onChange={(e) => setDeletionConfirm(e.target.checked)}
                                className="mt-1 w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                              />
                              <span className="text-sm text-red-800">
                                Je comprends que la suppression de mon compte est définitive et irréversible. Toutes mes données seront supprimées de manière permanente.
                              </span>
                            </label>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleRequestDeletion}
                              disabled={isSubmittingDeletion}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm shadow-md hover:bg-red-600 transition-all disabled:opacity-60"
                            >
                              {isSubmittingDeletion ? 'Envoi en cours...' : 'Envoyer la demande'}
                            </button>
                            <button
                              onClick={() => {
                                setShowDeletionRequest(false)
                                setDeletionReason('')
                                setDeletionPassword('')
                                setDeletionConfirm(false)
                                setDeletionMessage(null)
                              }}
                              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Déconnexion */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Connecté en tant que</p>
                  <p className="font-medium text-gray-800">{userEmail}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium shadow-md hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonEspacePage
