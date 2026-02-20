import React, { useMemo, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const VerifierChampApplicationPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type')?.toUpperCase()
  const [typeObjet, setTypeObjet] = useState<'SYSTEME' | 'MODELE' | null>(typeFromUrl === 'MODELE' ? 'MODELE' : typeFromUrl === 'SYSTEME' ? 'SYSTEME' : null)
  
  const [openRefs, setOpenRefs] = useState<boolean>(false)
  
  // État pour les réponses
  const [q1, setQ1] = useState<number | null>(null) // GEO_ROLE
  const [q2, setQ2] = useState<'oui' | 'non' | null>(null) // EXEMPT_MILITARY
  const [q3, setQ3] = useState<number | null>(null) // EXEMPT_INTL
  const [q4, setQ4] = useState<number | null>(null) // EXEMPT_R_D
  const [q5, setQ5] = useState<number | null>(null) // EXEMPT_PERSO (seulement si déployeur)
  const [q6, setQ6] = useState<'oui' | 'non' | null>(null) // OPEN_SOURCE_CHECK
  const [q7, setQ7] = useState<number | null>(null) // OPEN_SOURCE_EXCEPTION
  
  // État pour gérer quelles questions sont dépliées
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  
  // Variable interne pour savoir si c'est un déployeur
  const estDeployeur = useMemo(() => {
    return q1 === 2 // Choix 2 = PROFIL DÉPLOYEUR
  }, [q1])
  
  const toggleQuestion = (idx: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(idx)) {
        newSet.delete(idx)
      } else {
        newSet.add(idx)
      }
      return newSet
    })
  }
  
  // Déplier automatiquement la question suivante quand on répond
  const handleAnswer = (questionNum: number, value: any) => {
    if (questionNum === 1) setQ1(value)
    if (questionNum === 2) setQ2(value)
    if (questionNum === 3) setQ3(value)
    if (questionNum === 4) setQ4(value)
    if (questionNum === 5) setQ5(value)
    if (questionNum === 6) setQ6(value)
    if (questionNum === 7) setQ7(value)
    
    // Déplier la question suivante si applicable
    if (value !== null && questionNum < 7) {
      setExpandedQuestions(prev => new Set([...prev, questionNum + 1]))
    }
  }
  
  // Déplier automatiquement les questions quand elles deviennent visibles
  useEffect(() => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      let changed = false
      
      // Question 1 : déplier si type sélectionné
      if (typeObjet !== null && !newSet.has(1)) {
        newSet.add(1)
        changed = true
      }
      
      // Question 2 : déplier si Q1 répondue (et pas choix 4)
      if (q1 !== null && q1 !== 4 && !newSet.has(2)) {
        newSet.add(2)
        changed = true
      }
      
      // Question 3 : déplier si Q2 = non
      if (q2 === 'non' && !newSet.has(3)) {
        newSet.add(3)
        changed = true
      }
      
      // Question 4 : déplier si Q3 = 2
      if (q3 === 2 && !newSet.has(4)) {
        newSet.add(4)
        changed = true
      }
      
      // Question 5 : déplier si déployeur et Q4 = 4
      if (estDeployeur && q4 === 4 && !newSet.has(5)) {
        newSet.add(5)
        changed = true
      }
      
      // Question 6 : déplier quand elle devient visible
      const q6Visible = (estDeployeur && q5 === 2) || (!estDeployeur && q4 === 4)
      if (q6Visible && !newSet.has(6)) {
        newSet.add(6)
        changed = true
      }
      
      // Question 7 : déplier si Q6 = oui
      if (q6 === 'oui' && typeObjet !== null && !newSet.has(7)) {
        newSet.add(7)
        changed = true
      }
      
      return changed ? newSet : prev
    })
  }, [typeObjet, q1, q2, q3, q4, q5, q6, estDeployeur])
  
  // Calcul du résultat
  const resultat = useMemo(() => {
    // Question 1 : HORS CHAMP si choix 4
    if (q1 === 4) return { type: 'HORS_CHAMP', message: "Vous êtes hors du champ d'application du Règlement IA." }
    
    // Question 2 : HORS CHAMP si usage exclusivement militaire
    if (q2 === 'oui') return { type: 'HORS_CHAMP', message: "Vous êtes hors du champ d'application du Règlement IA (usage exclusivement militaire, de défense ou de sécurité nationale)." }
    
    // Question 3 : HORS CHAMP si autorité publique pays tiers
    if (q3 === 1) return { type: 'HORS_CHAMP', message: "Vous êtes hors du champ d'application du Règlement IA (exemption pour autorités publiques de pays tiers ou organisations internationales)." }
    
    // Question 4 : HORS CHAMP si R&D purement scientifique ou test confiné
    if (q4 === 1 || q4 === 2) return { type: 'HORS_CHAMP', message: "Vous êtes hors du champ d'application du Règlement IA (R&D purement scientifique ou test confiné)." }
    
    // Question 4 : RÉGIME SPÉCIFIQUE si essais en conditions réelles
    if (q4 === 3) return { type: 'REGIME_SPECIFIQUE', message: "Vous êtes soumis au régime spécifique pour les essais en conditions réelles (Art. 60 du RIA)." }
    
    // Question 5 : HORS CHAMP si usage personnel (seulement pour déployeurs)
    if (estDeployeur && q5 === 1) return { type: 'HORS_CHAMP', message: "Vous êtes hors du champ d'application du Règlement IA (usage strictement personnel à caractère non professionnel)." }
    
    // Question 6 : Si pas Open Source, DANS LE CHAMP
    if (q6 === 'non') return { type: 'DANS_CHAMP_PLEIN', message: "Vous êtes dans le champ d'application du Règlement IA (obligations complètes)." }
    
    // Question 7 : Traitement des exceptions Open Source
    if (q6 === 'oui' && q7 !== null) {
      if (typeObjet === 'SYSTEME') {
        if (q7 === 1) return { type: 'DANS_CHAMP_PLEIN', message: "Vous êtes dans le champ d'application du Règlement IA (obligations complètes). L'exemption Open Source ne s'applique pas car le système est à haut risque, interdit ou nécessite de la transparence." }
        if (q7 === 2) return { type: 'HORS_CHAMP', message: "Vous êtes hors du champ d'application du Règlement IA (exemption Open Source applicable - Art. 2.12)." }
      } else if (typeObjet === 'MODELE') {
        if (q7 === 3) return { type: 'DANS_CHAMP_LOURD', message: "Vous êtes dans le champ d'application du Règlement IA avec un régime lourd (modèle d'IA à usage général présentant un risque systémique - Art. 51)." }
        if (q7 === 4) return { type: 'REGIME_OPEN_SOURCE', message: "Vous êtes soumis au régime spécifique Open Source (exemption de documentation technique, mais maintien des obligations de respect du droit d'auteur et du résumé d'entraînement - Art. 53.1.c et 53.1.d)." }
      }
    }
    
    return null
  }, [q1, q2, q3, q4, q5, q6, q7, estDeployeur, typeObjet])
  
  // Vérifier si toutes les questions nécessaires sont répondues
  const allAnswered = useMemo(() => {
    if (q1 === null) return false
    if (q1 === 4) return true // Arrêt si hors champ
    if (q2 === null) return false
    if (q2 === 'oui') return true // Arrêt si militaire
    if (q3 === null) return false
    if (q3 === 1) return true // Arrêt si autorité pays tiers
    if (q4 === null) return false
    if (q4 === 1 || q4 === 2) return true // Arrêt si R&D scientifique ou test confiné
    if (q4 === 3) return true // Régime spécifique essais
    if (estDeployeur && q5 === null) return false
    if (estDeployeur && q5 === 1) return true // Arrêt si usage personnel
    if (q6 === null) return false
    if (q6 === 'non') return true // Dans le champ plein
    if (q7 === null) return false
    return true
  }, [q1, q2, q3, q4, q5, q6, q7, estDeployeur])
  
  const questions = [
    {
      id: 1,
      q: "Quelle phrase décrit le mieux votre situation vis-à-vis de l'IA et du marché de l'Union européenne ?",
      p: "Cette question permet de déterminer votre lien avec le marché de l'UE et votre rôle juridique (Fournisseur vs Déployeur).",
      type: 'radio',
      options: [
        { value: 1, label: "Je développe, je fais développer ou je fournis cette IA (système ou modèle) sous mon propre nom ou ma marque dans l'UE (y compris si je suis fabricant d'un produit intégrant cette IA, importateur ou distributeur)." },
        { value: 2, label: "Je suis situé dans l'UE et j'utilise ce système d'IA sous ma propre autorité dans le cadre de mon activité professionnelle (ex: entreprise, administration)." },
        { value: 3, label: "Je suis situé hors de l'UE, je ne vends pas l'IA dans l'UE, mais les résultats (sorties) générés par le système sont utilisés dans l'UE." },
        { value: 4, label: "Aucune de ces situations (Je suis hors UE et l'IA n'a aucun lien, direct ou via ses résultats, avec le marché européen)." }
      ],
      value: q1,
      setValue: (v: number) => handleAnswer(1, v),
      condition: typeObjet !== null // La question 1 n'apparaît que si le type est sélectionné
    },
    {
      id: 2,
      q: "L'IA est-elle mise sur le marché ou utilisée exclusivement à des fins militaires, de défense ou de sécurité nationale ?",
      p: "Note : Si l'usage est mixte (civil et militaire), répondez Non.",
      type: 'oui-non',
      value: q2,
      setValue: (v: 'oui' | 'non') => handleAnswer(2, v),
      condition: q1 !== null && q1 !== 4
    },
    {
      id: 3,
      q: "Quelle est la nature de l'entité qui utilise le système ?",
      p: "Cette question permet d'identifier les exemptions liées aux autorités publiques de pays tiers.",
      type: 'radio',
      options: [
        { value: 1, label: "Une autorité publique d'un pays tiers (hors UE) ou une organisation internationale, agissant dans le cadre d'accords internationaux avec l'UE." },
        { value: 2, label: "Une entreprise privée, une autorité publique d'un État membre de l'UE ou une institution de l'UE." }
      ],
      value: q3,
      setValue: (v: number) => handleAnswer(3, v),
      condition: q2 === 'non'
    },
    {
      id: 4,
      q: "Quel est le stade actuel et la finalité de l'IA ?",
      p: "Cette question distingue la R&D scientifique (exclue) de la R&D produit (partiellement régulée).",
      type: 'radio',
      options: [
        { value: 1, label: "Activité de R&D purement scientifique (orientée vers la découverte scientifique et non le développement d'un produit commercial spécifique)." },
        { value: 2, label: "R&D orientée produit, en phase de test confiné (avant mise sur le marché/mise en service)." },
        { value: 3, label: "R&D orientée produit, en phase d'essais en conditions réelles (hors laboratoire)." },
        { value: 4, label: "Produit fini, opérationnel ou mis sur le marché." }
      ],
      value: q4,
      setValue: (v: number) => handleAnswer(4, v),
      condition: q3 === 2
    },
    {
      id: 5,
      q: "Dans quel cadre utilisez-vous ce système d'IA ?",
      p: "Cette question s'applique uniquement aux déployeurs.",
      type: 'radio',
      options: [
        { value: 1, label: "Usage strictement personnel à caractère non professionnel (ex: loisir, sphère privée)." },
        { value: 2, label: "Usage professionnel, commercial ou institutionnel." }
      ],
      value: q5,
      setValue: (v: number) => handleAnswer(5, v),
      condition: estDeployeur && q4 === 4
    },
    {
      id: 6,
      q: "L'IA est-elle publiée sous une licence libre et open source (permettant l'accès, l'utilisation, la modification et la redistribution) ET sans être monétisée ?",
      p: "Note : La fourniture contre paiement ou l'utilisation de données personnelles hors sécurité/interopérabilité exclut l'exemption.",
      type: 'oui-non',
      value: q6,
      setValue: (v: 'oui' | 'non') => handleAnswer(6, v),
      condition: (estDeployeur && q5 === 2) || (!estDeployeur && q4 === 4)
    },
    {
      id: 7,
      q: "Malgré la licence Open Source, l'IA correspond-elle à l'un des cas suivants ?",
      p: typeObjet === 'SYSTEME'
        ? "Cette question vérifie si l'exemption Open Source s'applique ou non selon le type de système."
        : "Cette question vérifie si l'exemption Open Source s'applique ou non selon le type de modèle.",
      type: 'radio',
      options: typeObjet === 'SYSTEME' ? [
        { value: 1, label: "Système à Haut Risque (Art. 6), Système Interdit (Art. 5) ou Système nécessitant de la transparence (Chatbot/Deepfake/Génération de contenu - Art. 50)." },
        { value: 2, label: "Aucun de ces cas." }
      ] : typeObjet === 'MODELE' ? [
        { value: 3, label: "Modèle d'IA à usage général présentant un risque systémique (Art. 51)." },
        { value: 4, label: "Modèle d'IA à usage général sans risque systémique." }
      ] : [],
      value: q7,
      setValue: (v: number) => handleAnswer(7, v),
      condition: q6 === 'oui' && typeObjet !== null
    }
  ]
  
  return (
    <AdherentOnlyOverlay revealHeight="55vh">
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer si je suis dans le champ d'application du règlement — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Déterminer si je suis dans le champ d'application du règlement
          </h1>
          <p className="text-gray-600">
            Répondez à ce questionnaire pour savoir si vous êtes dans le champ d'application du Règlement IA.
          </p>
        </div>

        {/* Accordéon Références utiles */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setOpenRefs(v => !v)}
            aria-expanded={openRefs}
          >
            <span className="font-semibold text-gray-900">Références utiles</span>
            <svg className={`w-5 h-5 transition-transform ${openRefs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {openRefs && (
            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold">Article 2 (1) du RIA (Champ d'application) :</div>
                <div>« Le présent règlement s'applique : a) aux fournisseurs [...] qui mettent sur le marché ou mettent en service des systèmes d'IA ou qui mettent sur le marché des modèles d'IA à usage général dans l'Union ; b) aux déployeurs de systèmes d'IA qui ont leur lieu d'établissement ou sont situés dans l'Union ; c) aux fournisseurs et aux déployeurs [...] situés dans un pays tiers, lorsque les sorties produites par le système d'IA sont utilisées dans l'Union. »</div>
              </div>
              <div>
                <div className="font-semibold">Article 3 (3) et (4) du RIA (Définitions clés) :</div>
                <div>« <strong>Fournisseur</strong> » : une personne [...] qui développe ou fait développer un système d'IA ou un modèle d'IA à usage général et le met sur le marché ou met le système d'IA en service sous son propre nom ou sa propre marque.<br /><br />« <strong>Déployeur</strong> » : une personne [...] utilisant sous sa propre autorité un système d'IA, sauf lorsque ce système est utilisé dans le cadre d'une activité personnelle à caractère non professionnel.</div>
              </div>
              <div>
                <div className="font-semibold">Considérant 22 du RIA (Extraterritorialité) :</div>
                <div>"Afin d'éviter le contournement des règles [...] et d'assurer une protection efficace des personnes physiques situées dans l'Union, le présent règlement devrait également s'appliquer aux fournisseurs et aux déployeurs de systèmes d'IA qui sont établis dans un pays tiers, dans la mesure où les sorties produites par ces systèmes sont destinées à être utilisées dans l'Union."</div>
              </div>
              <div>
                <div className="font-semibold">Article 2 (3) et (6) du RIA (Exclusions principales) :</div>
                <div>« Le présent règlement ne s'applique pas aux systèmes d'IA [...] utilisés [...] exclusivement à des fins militaires, de défense ou de sécurité nationale. »<br /><br />« Le présent règlement ne s'applique pas aux systèmes d'IA ou aux modèles d'IA spécifiquement développés et mis en service uniquement à des fins de recherche et développement scientifiques. »</div>
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire */}
        <div className="bg-white rounded-2xl shadow divide-y">
          {/* Question 0 : Type de solution d'IA */}
          <div className="border-b">
            <div className="px-5 py-3">
              <div className="text-base font-medium text-gray-900 mb-3">
                Type de solution d'IA :
              </div>
              <div className="flex gap-4 mb-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="typeObjet"
                    checked={typeObjet === 'SYSTEME'}
                    onChange={() => {
                      setTypeObjet('SYSTEME')
                      // Réinitialiser les réponses si on change de type
                      setQ1(null)
                      setQ2(null)
                      setQ3(null)
                      setQ4(null)
                      setQ5(null)
                      setQ6(null)
                      setQ7(null)
                      setExpandedQuestions(new Set([1]))
                    }}
                    className="h-4 w-4"
                  />
                  <span>Système d'IA</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="typeObjet"
                    checked={typeObjet === 'MODELE'}
                    onChange={() => {
                      setTypeObjet('MODELE')
                      // Réinitialiser les réponses si on change de type
                      setQ1(null)
                      setQ2(null)
                      setQ3(null)
                      setQ4(null)
                      setQ5(null)
                      setQ6(null)
                      setQ7(null)
                      setExpandedQuestions(new Set([1])) // Déplier la question 1 après sélection
                    }}
                    className="h-4 w-4"
                  />
                  <span>Modèle d'IA</span>
                </label>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 text-sm">
                <p className="text-gray-700 mb-2">
                  <strong className="text-gray-900">Note :</strong> Si vous n'êtes pas sûr du type de votre solution d'IA, des questionnaires dédiés sont disponibles pour vous aider à déterminer si votre solution est un système d'IA ou un modèle d'IA à usage général.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Link 
                    to="/verificateur/systeme-ia" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold underline inline-flex items-center gap-1"
                  >
                    Questionnaire "Système d'IA"
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                  <span className="text-gray-500">•</span>
                  <Link 
                    to="/verificateur/modele-ia" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold underline inline-flex items-center gap-1"
                  >
                    Questionnaire "Modèle d'IA"
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {questions
            .filter(q => q.condition !== false)
            .map(item => {
              const isExpanded = expandedQuestions.has(item.id)
              const isAnswered = item.value !== null
              return (
                <div key={item.id} className="border-b last:border-b-0">
                  {/* Header de la question */}
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-purple-600">Question {item.id}</span>
                      {isAnswered && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Répondu
                        </span>
                      )}
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Contenu de la question */}
                  {isExpanded && (
                    <div className="px-5 pb-5 transition-all duration-300 ease-in-out">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                        <div className="text-base font-medium text-gray-900 md:max-w-[70%]">{item.q}</div>
                        {item.type === 'oui-non' && (
                          <div className="flex items-center gap-6">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`q${item.id}`}
                                checked={item.value === 'oui'}
                                onChange={() => item.setValue('oui')}
                                className="h-4 w-4"
                              />
                              <span>Oui</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`q${item.id}`}
                                checked={item.value === 'non'}
                                onChange={() => item.setValue('non')}
                                className="h-4 w-4"
                              />
                              <span>Non</span>
                            </label>
                          </div>
                        )}
                      </div>
                      {item.type === 'radio' && (
                        <div className="space-y-2 mb-3">
                          {item.options?.map(opt => (
                            <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                              <input
                                type="radio"
                                name={`q${item.id}`}
                                checked={item.value === opt.value}
                                onChange={() => item.setValue(opt.value)}
                                className="h-4 w-4 mt-1 shrink-0"
                              />
                              <span className="text-sm text-gray-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4">
                        {item.p}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {/* Résultat */}
        {allAnswered && resultat && (
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-2" style={{ borderColor: '#774792' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#774792' }}>Résultat</h2>
            <div className="text-center">
              <div className="mb-4">
                {resultat.type === 'HORS_CHAMP' ? (
                  <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                {resultat.message}
              </p>
              {resultat.type !== 'HORS_CHAMP' && (
                <div>
                  <p className="text-base text-gray-700 mb-6">
                    Veuillez compléter les questionnaires sur le niveau de risque {typeObjet === 'SYSTEME' ? 'du SIA' : 'du modèle d\'IA'} et votre rôle.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link 
                      to="/verificateur" 
                      className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                    >
                      Aller aux autres questionnaires
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!allAnswered && (
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-2" style={{ borderColor: '#774792' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#774792' }}>Résultat</h2>
            <div className="text-center">
              <p className="text-lg text-gray-700">Veuillez répondre à chaque question pour obtenir une réponse.</p>
            </div>
          </div>
        )}

        {/* Bloc d'information contact */}
        <div className="bg-white rounded-2xl shadow-md p-5 mt-8 text-center">
          <p className="text-gray-700">
            Ce questionnaire ne constitue pas un conseil juridique et ne remplace pas
            un accompagnement par des experts de la conformité au Règlement IA.
            <span className="block mt-2">
              <Link to="/contact" className="text-indigo-600 font-semibold hover:underline">
                Contactez-nous via le formulaire pour être accompagné
              </Link>
              .
            </span>
          </p>
        </div>
      </div>
    </div>
    </AdherentOnlyOverlay>
  )
}

export default VerifierChampApplicationPage

