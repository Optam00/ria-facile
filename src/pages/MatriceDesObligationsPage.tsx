import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

// Types
type TypeSysteme = 'haut-risque' | 'gpai' | 'transparence' | 'interdictions' | null
type Role = 'fournisseur' | 'deployeur' | 'mandataire' | 'importateur' | 'distributeur' | null
type TypeGPAI = 'systemique' | 'open-source' | 'proprietaire' | null
type TypeAnnexe = 'annexe-iii' | 'annexe-i' | null

// Interface pour les obligations
interface Obligation {
  id: string
  acteur: string
  phase?: string
  cible?: string
  type?: string
  dateStandard: string
  dateProduit?: string
  article: string
  resume: string
}

// Base de données des obligations
const obligationsHR: Obligation[] = [
  {
    id: 'HR-01',
    acteur: 'Fournisseur',
    phase: 'Conception',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 9',
    resume: "Établir un système de gestion des risques continu (identification, analyse, atténuation)."
  },
  {
    id: 'HR-02',
    acteur: 'Fournisseur',
    phase: 'Conception',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 10',
    resume: 'Gouvernance des données : entraînement, validation et test (qualité, biais, pertinence).'
  },
  {
    id: 'HR-03',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 11',
    resume: 'Rédiger la documentation technique exhaustive (Annexe IV).'
  },
  {
    id: 'HR-04',
    acteur: 'Fournisseur',
    phase: 'Conception',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 12',
    resume: "Intégrer des logs automatiques pour la traçabilité sur tout le cycle de vie."
  },
  {
    id: 'HR-05',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 13',
    resume: "Fournir une notice d'utilisation transparente (caractéristiques, limites, maintenance)."
  },
  {
    id: 'HR-06',
    acteur: 'Fournisseur',
    phase: 'Conception',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 14',
    resume: "Concevoir l'interface pour permettre un contrôle humain effectif (Human-in-the-loop)."
  },
  {
    id: 'HR-07',
    acteur: 'Fournisseur',
    phase: 'Conception',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 15',
    resume: "Garantir un niveau approprié d'exactitude, de robustesse et de cybersécurité."
  },
  {
    id: 'HR-08',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 16(l)',
    resume: "Accessibilité : Garantir la conformité aux exigences d'accessibilité (Dir. 2019/882)."
  },
  {
    id: 'HR-09',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 17',
    resume: 'Mettre en place un Système de Gestion de la Qualité (QMS) complet et documenté.'
  },
  {
    id: 'HR-10',
    acteur: 'Fournisseur',
    phase: 'Post-marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 18',
    resume: 'Conservation : Garder la documentation technique et les déclarations pendant 10 ans.'
  },
  {
    id: 'HR-11',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 43',
    resume: "Réaliser l'évaluation de conformité (Interne ou via Organisme Notifié selon le cas)."
  },
  {
    id: 'HR-12',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 47',
    resume: 'Rédiger et signer la déclaration UE de conformité.'
  },
  {
    id: 'HR-13',
    acteur: 'Fournisseur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 49',
    resume: "Enregistrer le système dans la base de données de l'UE (sauf infra critique)."
  },
  {
    id: 'HR-14',
    acteur: 'Fournisseur',
    phase: 'Post-marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 72',
    resume: "Mettre en œuvre le plan de surveillance après commercialisation (PMS) actif."
  },
  {
    id: 'HR-15',
    acteur: 'Fournisseur',
    phase: 'Post-marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 73',
    resume: 'Signaler les incidents graves aux autorités (max 15 jours, ou 2 jours si menace grave).'
  },
  {
    id: 'HR-16',
    acteur: 'Mandataire',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 22',
    resume: "Disposer d'un mandat écrit, vérifier la conformité et tenir la doc à disposition (si Fournisseur hors-UE)."
  },
  {
    id: 'HR-17',
    acteur: 'Importateur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 23',
    resume: "Vérifier la conformité du fournisseur, apposer son nom/adresse sur le produit, conserver la doc."
  },
  {
    id: 'HR-18',
    acteur: 'Distributeur',
    phase: 'Avant marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 24',
    resume: 'Vérifier la présence du marquage CE, de la notice et la déclaration de conformité.'
  },
  {
    id: 'HR-19',
    acteur: 'Déployeur',
    phase: 'Utilisation',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 26.1',
    resume: "Utiliser le système conformément à la notice d'utilisation (mesures techniques/orga)."
  },
  {
    id: 'HR-20',
    acteur: 'Déployeur',
    phase: 'Utilisation',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 26.2',
    resume: 'Assurer le contrôle humain par du personnel formé et compétent.'
  },
  {
    id: 'HR-21',
    acteur: 'Déployeur',
    phase: 'Utilisation',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 26.4',
    resume: "Surveiller les données d'entrée (pertinence) et le fonctionnement (détection d'anomalies)."
  },
  {
    id: 'HR-22',
    acteur: 'Déployeur',
    phase: 'Utilisation',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 26.6',
    resume: 'Conserver les logs générés par le système (min. 6 mois).'
  },
  {
    id: 'HR-23',
    acteur: 'Déployeur',
    phase: 'Avant usage',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 26.7',
    resume: "Informer les travailleurs et leurs représentants avant l'utilisation sur le lieu de travail."
  },
  {
    id: 'HR-24',
    acteur: 'Déployeur',
    phase: 'Avant usage',
    dateStandard: '2 août 2026',
    dateProduit: 'N/A',
    article: 'Art. 27',
    resume: 'FRIA : Réaliser une Analyse d\'impact sur les droits fondamentaux (Cas spécifiques uniquement).'
  },
  {
    id: 'HR-25',
    acteur: 'Déployeur',
    phase: 'Avant usage',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 49.3',
    resume: 'Enregistrement : Inscrire l\'utilisation du système dans la base UE (Organismes publics uniquement).'
  },
  {
    id: 'HR-26',
    acteur: 'Déployeur',
    phase: 'Post-marché',
    dateStandard: '2 août 2026',
    dateProduit: '2 août 2027',
    article: 'Art. 86',
    resume: "Droit à l'explication : Fournir une explication individuelle sur demande aux personnes affectées."
  }
]

const obligationsTR: Obligation[] = [
  {
    id: 'TR-01',
    acteur: 'Fournisseur',
    cible: 'Chatbot',
    dateStandard: '2 août 2026',
    article: 'Art. 50.1',
    resume: "Informer l'utilisateur qu'il interagit avec une machine (sauf évidence contextuelle)."
  },
  {
    id: 'TR-02',
    acteur: 'Fournisseur',
    cible: 'Générative',
    dateStandard: '2 août 2026',
    article: 'Art. 50.2',
    resume: 'Marquage technique des sorties (watermarking) lisible par machine.'
  },
  {
    id: 'TR-03',
    acteur: 'Déployeur',
    cible: 'Émotions',
    dateStandard: '2 août 2026',
    article: 'Art. 50.3',
    resume: "Informer les personnes physiques qu'elles sont soumises à une reconnaissance d'émotions/catégorisation."
  },
  {
    id: 'TR-04',
    acteur: 'Déployeur',
    cible: 'Deepfake',
    dateStandard: '2 août 2026',
    article: 'Art. 50.4',
    resume: "Divulguer que le contenu est généré/manipulé artificiellement."
  },
  {
    id: 'TR-05',
    acteur: 'Déployeur',
    cible: 'Texte public',
    dateStandard: '2 août 2026',
    article: 'Art. 50.4',
    resume: "Signaler l'origine IA d'un texte d'intérêt public (sauf si révision humaine)."
  }
]

const obligationsGP: Obligation[] = [
  {
    id: 'GP-01',
    acteur: 'Fournisseur',
    type: 'Tous GPAI',
    dateStandard: '2 août 2025',
    article: 'Art. 53.1(a)',
    resume: 'Documentation technique du modèle (sauf Open Source non systémique).'
  },
  {
    id: 'GP-02',
    acteur: 'Fournisseur',
    type: 'Tous GPAI',
    dateStandard: '2 août 2025',
    article: 'Art. 53.1(b)',
    resume: 'Documentation pour les fournisseurs en aval (sauf Open Source non systémique).'
  },
  {
    id: 'GP-03',
    acteur: 'Fournisseur',
    type: 'Tous GPAI',
    dateStandard: '2 août 2025',
    article: 'Art. 53.1(c)',
    resume: 'Politique de respect du droit d\'auteur (Copyright Directive).'
  },
  {
    id: 'GP-04',
    acteur: 'Fournisseur',
    type: 'Tous GPAI',
    dateStandard: '2 août 2025',
    article: 'Art. 53.1(d)',
    resume: 'Résumé public détaillé des données d\'entraînement.'
  },
  {
    id: 'GP-05',
    acteur: 'Fournisseur',
    type: 'Systémique',
    dateStandard: '2 août 2025',
    article: 'Art. 55.1',
    resume: 'Évaluations de modèles, Red Teaming, Cybersécurité renforcée, Rapport incidents.'
  }
]

const obligationsBAN: Obligation[] = [
  {
    id: 'BAN-01',
    acteur: 'Tous',
    cible: 'Pratiques Art. 5',
    dateStandard: '2 février 2025',
    article: 'Art. 5',
    resume: 'ARRÊT IMMÉDIAT de toute mise sur le marché ou utilisation des systèmes interdits.'
  }
]

const MatriceDesObligationsPage: React.FC = () => {
  const [typeSysteme, setTypeSysteme] = useState<TypeSysteme>(null)
  const [role, setRole] = useState<Role>(null)
  const [typeGPAI, setTypeGPAI] = useState<TypeGPAI>(null)
  const [typeAnnexe, setTypeAnnexe] = useState<TypeAnnexe>(null)
  const [isGenerative, setIsGenerative] = useState<boolean>(false)
  const [isOrganismePublic, setIsOrganismePublic] = useState<boolean>(false)
  const [isBanqueAssurance, setIsBanqueAssurance] = useState<boolean>(false)
  const [isDeepfake, setIsDeepfake] = useState<boolean>(false)
  const [isEmotions, setIsEmotions] = useState<boolean>(false)
  const [isChatbot, setIsChatbot] = useState<boolean>(false)
  const [obligationsAffichees, setObligationsAffichees] = useState<Obligation[]>([])

  // Fonction pour calculer les obligations à afficher
  const calculerObligations = () => {
    const resultats: Obligation[] = []

    // SCÉNARIO 1 : SYSTÈME À HAUT RISQUE
    if (typeSysteme === 'haut-risque') {
      if (role === 'fournisseur') {
        resultats.push(...obligationsHR.filter((o) => o.id.startsWith('HR-') && parseInt(o.id.split('-')[1]) <= 15))
        if (isGenerative) {
          resultats.push(...obligationsTR.filter((o) => ['TR-01', 'TR-02'].includes(o.id)))
        }
      } else if (role === 'deployeur') {
        resultats.push(...obligationsHR.filter((o) => ['HR-19', 'HR-20', 'HR-21', 'HR-22', 'HR-23', 'HR-26'].includes(o.id)))
        
        // FRIA conditionnel
        if (typeAnnexe === 'annexe-iii' && (isOrganismePublic || isBanqueAssurance)) {
          resultats.push(obligationsHR.find((o) => o.id === 'HR-24')!)
        }
        
        // Enregistrement conditionnel
        if (isOrganismePublic) {
          resultats.push(obligationsHR.find((o) => o.id === 'HR-25')!)
        }
        
        // Transparence conditionnelle
        if (isDeepfake || isGenerative) {
          resultats.push(...obligationsTR.filter((o) => ['TR-04', 'TR-05'].includes(o.id)))
        }
        
        if (isEmotions) {
          resultats.push(obligationsTR.find((o) => o.id === 'TR-03')!)
        }
      } else if (role === 'mandataire') {
        resultats.push(obligationsHR.find((o) => o.id === 'HR-16')!)
      } else if (role === 'importateur') {
        resultats.push(obligationsHR.find((o) => o.id === 'HR-17')!)
      } else if (role === 'distributeur') {
        resultats.push(obligationsHR.find((o) => o.id === 'HR-18')!)
      }
    }

    // SCÉNARIO 2 : MODÈLE D'IA (GPAI)
    if (typeSysteme === 'gpai') {
      // Base (toujours afficher)
      resultats.push(...obligationsGP.filter((o) => ['GP-03', 'GP-04'].includes(o.id)))
      
      if (typeGPAI === 'systemique') {
        resultats.push(...obligationsGP.filter((o) => ['GP-01', 'GP-02', 'GP-05'].includes(o.id)))
      } else if (typeGPAI === 'proprietaire') {
        resultats.push(...obligationsGP.filter((o) => ['GP-01', 'GP-02'].includes(o.id)))
      }
      // Si Open Source non systémique, on n'ajoute rien d'autre
    }

    // SCÉNARIO 3 : RISQUE LIMITÉ (TRANSPARENCE)
    if (typeSysteme === 'transparence') {
      if (isChatbot) {
        resultats.push(obligationsTR.find((o) => o.id === 'TR-01')!)
      }
      if (isGenerative) {
        resultats.push(obligationsTR.find((o) => o.id === 'TR-02')!)
      }
      if (isEmotions) {
        resultats.push(obligationsTR.find((o) => o.id === 'TR-03')!)
      }
      if (isDeepfake) {
        resultats.push(obligationsTR.find((o) => o.id === 'TR-04')!)
      }
      resultats.push(obligationsTR.find((o) => o.id === 'TR-05')!)
    }

    // SCÉNARIO 4 : INTERDICTIONS
    if (typeSysteme === 'interdictions') {
      resultats.push(...obligationsBAN)
    }

    setObligationsAffichees(resultats)
  }

  const handleCalculer = () => {
    calculerObligations()
  }

  const resetFormulaire = () => {
    setTypeSysteme(null)
    setRole(null)
    setTypeGPAI(null)
    setTypeAnnexe(null)
    setIsGenerative(false)
    setIsOrganismePublic(false)
    setIsBanqueAssurance(false)
    setIsDeepfake(false)
    setIsEmotions(false)
    setIsChatbot(false)
    setObligationsAffichees([])
  }

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Matrice des obligations — RIA Facile</title>
        <meta
          name="description"
          content="Renseignez le niveau de risque de votre IA et votre rôle pour obtenir la liste des obligations applicables selon l'AI Act."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Matrice des obligations
          </h1>
          <p className="text-gray-600">
            Renseignez le niveau de risque de votre IA et votre rôle pour obtenir la liste des obligations applicables selon l&apos;AI Act.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#774792' }}>
            1. Sélection du type de système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => {
                setTypeSysteme('haut-risque')
                setRole(null)
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                typeSysteme === 'haut-risque'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Système à Haut Risque</div>
              <div className="text-sm text-gray-600 mt-1">Annexe III ou Annexe I</div>
            </button>
            <button
              onClick={() => {
                setTypeSysteme('gpai')
                setRole(null)
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                typeSysteme === 'gpai'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Modèle GPAI</div>
              <div className="text-sm text-gray-600 mt-1">Modèle à usage général</div>
            </button>
            <button
              onClick={() => {
                setTypeSysteme('transparence')
                setRole(null)
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                typeSysteme === 'transparence'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Risque Limité (Transparence)</div>
              <div className="text-sm text-gray-600 mt-1">Chatbots, Deepfakes, etc.</div>
            </button>
            <button
              onClick={() => {
                setTypeSysteme('interdictions')
                setRole(null)
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                typeSysteme === 'interdictions'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Interdictions</div>
              <div className="text-sm text-gray-600 mt-1">Pratiques Art. 5</div>
            </button>
          </div>

          {/* Questions conditionnelles selon le type */}
          {typeSysteme === 'haut-risque' && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-8" style={{ color: '#774792' }}>
                2. Sélection du rôle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['fournisseur', 'deployeur', 'mandataire', 'importateur', 'distributeur'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r as Role)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      role === r
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 capitalize">{r}</div>
                  </button>
                ))}
              </div>

              {role === 'deployeur' && (
                <>
                  <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-900">Questions complémentaires (Déployeur)</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Le système est-il classé Haut Risque via :
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="annexe"
                            value="annexe-iii"
                            checked={typeAnnexe === 'annexe-iii'}
                            onChange={() => setTypeAnnexe('annexe-iii')}
                            className="mr-2"
                          />
                          <span className="text-sm">Annexe III (Standard)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="annexe"
                            value="annexe-i"
                            checked={typeAnnexe === 'annexe-i'}
                            onChange={() => setTypeAnnexe('annexe-i')}
                            className="mr-2"
                          />
                          <span className="text-sm">Annexe I (Produit)</span>
                        </label>
                      </div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isOrganismePublic}
                        onChange={(e) => setIsOrganismePublic(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Organisme public</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isBanqueAssurance}
                        onChange={(e) => setIsBanqueAssurance(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Banque/Assurance (scoring crédit ou tarification vie/santé)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isDeepfake}
                        onChange={(e) => setIsDeepfake(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Utilisation de Deepfake / Contenu généré</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isEmotions}
                        onChange={(e) => setIsEmotions(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Reconnaissance d&apos;émotions / Catégorisation</span>
                    </label>
                  </div>
                </>
              )}

              {role === 'fournisseur' && (
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isGenerative}
                      onChange={(e) => setIsGenerative(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">IA Générative</span>
                  </label>
                </div>
              )}
            </>
          )}

          {typeSysteme === 'gpai' && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-8" style={{ color: '#774792' }}>
                2. Type de modèle GPAI
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setTypeGPAI('systemique')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    typeGPAI === 'systemique'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Risque Systémique</div>
                  <div className="text-sm text-gray-600 mt-1">Modèle systémique</div>
                </button>
                <button
                  onClick={() => setTypeGPAI('open-source')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    typeGPAI === 'open-source'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Open Source</div>
                  <div className="text-sm text-gray-600 mt-1">Non systémique</div>
                </button>
                <button
                  onClick={() => setTypeGPAI('proprietaire')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    typeGPAI === 'proprietaire'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Propriétaire / Fermé</div>
                  <div className="text-sm text-gray-600 mt-1">Non systémique</div>
                </button>
              </div>
            </>
          )}

          {typeSysteme === 'transparence' && (
            <>
              <h2 className="text-xl font-bold mb-4 mt-8" style={{ color: '#774792' }}>
                2. Type de système
              </h2>
              <div className="space-y-3 mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChatbot}
                    onChange={(e) => setIsChatbot(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Chatbot</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isGenerative}
                    onChange={(e) => setIsGenerative(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">IA Générative</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEmotions}
                    onChange={(e) => setIsEmotions(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Reconnaissance d&apos;émotions / Catégorisation</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isDeepfake}
                    onChange={(e) => setIsDeepfake(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Deepfake / Contenu généré</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={true} disabled className="mr-2" />
                  <span className="text-sm text-gray-500">Texte d&apos;intérêt public (toujours applicable)</span>
                </label>
              </div>
            </>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCalculer}
              disabled={!typeSysteme || (typeSysteme === 'haut-risque' && !role) || (typeSysteme === 'gpai' && !typeGPAI)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Calculer les obligations
            </button>
            <button
              onClick={resetFormulaire}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Résultats */}
        {obligationsAffichees.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#774792' }}>
              Obligations applicables ({obligationsAffichees.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Acteur</th>
                    {typeSysteme === 'haut-risque' && (
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Phase</th>
                    )}
                    {(typeSysteme === 'transparence' || typeSysteme === 'gpai') && (
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        {typeSysteme === 'gpai' ? 'Type' : 'Cible'}
                      </th>
                    )}
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Entrée en vigueur
                    </th>
                    {typeSysteme === 'haut-risque' && (
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Entrée en vigueur (Produit)
                      </th>
                    )}
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Article</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Résumé</th>
                  </tr>
                </thead>
                <tbody>
                  {obligationsAffichees.map((obligation) => (
                    <tr key={obligation.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">{obligation.acteur}</td>
                      {typeSysteme === 'haut-risque' && (
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{obligation.phase}</td>
                      )}
                      {(typeSysteme === 'transparence' || typeSysteme === 'gpai') && (
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {obligation.cible || obligation.type}
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">{obligation.dateStandard}</td>
                      {typeSysteme === 'haut-risque' && (
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {obligation.dateProduit || 'N/A'}
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <a
                          href={`/consulter?type=article&numero=${obligation.article.replace('Art. ', '').trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 underline"
                        >
                          {obligation.article}
                        </a>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">{obligation.resume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm text-gray-700">
                <strong>Note :</strong> Les dates d&apos;entrée en vigueur peuvent varier selon le type de système (Standard vs Produit Annexe I).
                Pour les systèmes de l&apos;Annexe I, certaines obligations peuvent avoir des dates différentes.
              </p>
            </div>
          </div>
        )}

        {/* Note informative */}
        {obligationsAffichees.length === 0 && typeSysteme && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
            <p className="text-sm text-gray-700">
              Veuillez remplir tous les champs requis et cliquer sur &quot;Calculer les obligations&quot; pour voir les résultats.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatriceDesObligationsPage
