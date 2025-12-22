import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const MonEspacePage: React.FC = () => {
  const { isAdherent, profile, loading, session } = useAuth()
  const navigate = useNavigate()

  // États pour le formulaire de modification des infos
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [profession, setProfession] = useState('')
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
  }, [session])

  // Rediriger si l'utilisateur n'est pas adhérent
  useEffect(() => {
    if (!loading && !isAdherent()) {
      navigate('/connexion')
    }
  }, [loading, isAdherent, navigate])

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
      console.log('🔵 [MON ESPACE] Données à sauvegarder:', { prenom, nom, profession })
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

            {/* Placeholder pour les futures fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📚</span>
                  <h3 className="font-semibold text-gray-700">Mes ressources</h3>
                </div>
                <p className="text-gray-500 text-sm">Bientôt disponible</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💬</span>
                  <h3 className="font-semibold text-gray-700">Mes conversations</h3>
                </div>
                <p className="text-gray-500 text-sm">Bientôt disponible</p>
              </div>
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
