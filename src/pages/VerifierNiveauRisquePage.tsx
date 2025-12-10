import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

type RisqueResultat = 'inacceptable' | 'haut-risque' | 'risque-limite' | 'risque-minimal' | null

const VerifierNiveauRisquePage: React.FC = () => {
  const [openRefs, setOpenRefs] = useState<boolean>(false)
  
  // État pour les réponses
  const [q1, setQ1] = useState<number | null>(null) // RISK_PROHIBITED
  const [q2, setQ2] = useState<number | null>(null) // RISK_SAFETY_COMP_TYPE
  const [q3, setQ3] = useState<number | null>(null) // RISK_3RD_PARTY
  const [q4, setQ4] = useState<number[]>([]) // RISK_ANNEX_III (multiple)
  const [q5, setQ5] = useState<number | null>(null) // DEROGATION_PROFILING
  const [q6, setQ6] = useState<number | null>(null) // DEROGATION_CRITERIA
  const [q7, setQ7] = useState<number[]>([]) // RISK_TRANSPARENCY (multiple)
  
  // État pour gérer quelles questions sont dépliées
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([1]))
  
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
  const handleAnswer = (questionId: number, value: number | number[]) => {
    if (questionId === 1) {
      setQ1(value as number)
      if (value !== 9) {
        // Si pratique interdite, on arrête
        return
      }
      // Sinon, déplier Q2
      setExpandedQuestions(prev => new Set([...prev, 2]))
    } else if (questionId === 2) {
      setQ2(value as number)
      if (value === 5) {
        // Passer à Q4 (Domaines Critiques)
        setExpandedQuestions(prev => new Set([...prev, 4]))
      } else {
        // Continuer vers Q3
        setExpandedQuestions(prev => new Set([...prev, 3]))
      }
    } else if (questionId === 3) {
      setQ3(value as number)
      if (value === 1) {
        // Haut Risque Art. 6.1, on arrête
        return
      }
      // Sinon, passer à Q4
      setExpandedQuestions(prev => new Set([...prev, 4]))
    } else if (questionId === 4) {
      setQ4(value as number[])
      if (value.length === 0 || (value as number[]).includes(9)) {
        // Passer à Q7 (Transparence)
        setExpandedQuestions(prev => new Set([...prev, 7]))
      } else {
        // Continuer vers Q5 (Dérogation)
        setExpandedQuestions(prev => new Set([...prev, 5]))
      }
    } else if (questionId === 5) {
      setQ5(value as number)
      if (value === 1) {
        // Profilage = Haut Risque, on arrête
        return
      }
      // Sinon, continuer vers Q6
      setExpandedQuestions(prev => new Set([...prev, 6]))
    } else if (questionId === 6) {
      setQ6(value as number)
      if (value === 5) {
        // Haut Risque, on arrête
        return
      }
      // Sinon, passer à Q7 (Transparence)
      setExpandedQuestions(prev => new Set([...prev, 7]))
    } else if (questionId === 7) {
      setQ7(value as number[])
    }
  }
  
  // Calcul du résultat
  const resultat: RisqueResultat = useMemo(() => {
    // Étape 1 : Pratiques interdites
    if (q1 !== null && q1 !== 9) {
      return 'inacceptable'
    }
    
    // Étape 2 : Haut Risque - Composants de sécurité
    if (q3 === 1) {
      return 'haut-risque'
    }
    
    // Étape 3 & 4 : Haut Risque - Domaines critiques
    const isAnnexIII = q4.length > 0 && !q4.includes(9)
    if (isAnnexIII) {
      // Vérifier la dérogation
      if (q5 === 1) {
        // Profilage = Haut Risque
        return 'haut-risque'
      }
      if (q6 === 5) {
        // Pas de condition remplie = Haut Risque
        return 'haut-risque'
      }
      // Si dérogation applicable, continuer vers transparence
    }
    
    // Étape 5 : Risque de transparence
    if (q7.length > 0 && !q7.includes(5)) {
      return 'risque-limite'
    }
    
    // Par défaut : Risque minimal
    if (q1 === 9 && q2 === 5 && (q4.length === 0 || q4.includes(9)) && (q7.length === 0 || q7.includes(5))) {
      return 'risque-minimal'
    }
    
    return null
  }, [q1, q2, q3, q4, q5, q6, q7])
  
  // Vérifier si toutes les questions nécessaires sont répondues
  const toutesQuestionsRepondues = useMemo(() => {
    if (q1 === null) return false
    if (q1 !== 9) return true // Pratique interdite, on arrête
    
    if (q2 === null) return false
    if (q2 === 5) {
      // Passer à Q4
      if (q4.length === 0) return false
      if (q4.includes(9)) {
        // Passer à Q7
        return q7.length > 0
      }
      // Sinon, vérifier dérogation
      if (q5 === null) return false
      if (q5 === 1) return true // Profilage = Haut Risque
      if (q6 === null) return false
      if (q6 === 5) return true // Haut Risque
      // Sinon, passer à Q7
      return q7.length > 0
    }
    
    if (q3 === null) return false
    if (q3 === 1) return true // Haut Risque Art. 6.1
    
    // Passer à Q4
    if (q4.length === 0) return false
    if (q4.includes(9)) {
      // Passer à Q7
      return q7.length > 0
    }
    // Sinon, vérifier dérogation
    if (q5 === null) return false
    if (q5 === 1) return true // Profilage = Haut Risque
    if (q6 === null) return false
    if (q6 === 5) return true // Haut Risque
    // Sinon, passer à Q7
    return q7.length > 0
  }, [q1, q2, q3, q4, q5, q6, q7])
  
  // Structure des questions
  const questions = [
    {
      id: 1,
      q: "Le système d'IA effectue-t-il l'une des fonctions suivantes ?",
      p: "Objectif : Identifier immédiatement les \"lignes rouges\" (Risque Inacceptable).",
      type: 'radio',
      options: [
        { value: 1, label: 'Manipulation : Techniques subliminales ou manipulatrices altérant le comportement de manière nuisible.' },
        { value: 2, label: 'Exploitation : Exploitation des vulnérabilités (âge, handicap, situation sociale).' },
        { value: 3, label: 'Notation Sociale (Social Scoring) : Évaluation ou classification des personnes par des autorités publiques menant à un traitement défavorable injustifié.' },
        { value: 4, label: 'Police Prédictive : Évaluation du risque qu\'une personne commette une infraction (basée uniquement sur le profilage).' },
        { value: 5, label: 'Scraping Facial : Création de bases de données faciales par moissonnage non ciblé d\'internet ou de vidéosurveillance.' },
        { value: 6, label: 'Émotions (Travail/École) : Reconnaissance des émotions sur le lieu de travail ou dans l\'enseignement (sauf raison médicale/sécurité).' },
        { value: 7, label: 'Catégorisation Biométrique : Classement des personnes selon des données sensibles (race, opinions, religion, orientation sexuelle).' },
        { value: 8, label: 'Identification Biométrique Temps Réel : Identification à distance en temps réel dans des espaces publics à des fins répressives (sauf exceptions strictes type terrorisme/enlèvement).' },
        { value: 9, label: 'Aucune de ces fonctions.' }
      ],
      value: q1,
      setValue: (v: number) => handleAnswer(1, v),
      condition: true
    },
    {
      id: 2,
      q: "Le système d'IA est-il un composant de sécurité destiné à l'un des types de produits suivants ?",
      p: "Aide : Un \"composant de sécurité\" est un composant dont la défaillance ou le dysfonctionnement mettrait en danger la santé ou la sécurité des personnes ou des biens.",
      type: 'radio',
      options: [
        { value: 1, label: 'Machines et Industrie : Machines, Ascenseurs, Installations à câbles, Équipements sous pression, Appareils pour atmosphères explosibles (ATEX).' },
        { value: 2, label: 'Santé : Dispositifs médicaux ou Dispositifs médicaux de diagnostic in vitro.' },
        { value: 3, label: 'Transports : Voitures, Véhicules agricoles/forestiers, Deux/trois roues, Aviation civile, Marine (équipements marins), Ferroviaire.' },
        { value: 4, label: 'Grand Public & Divers : Jouets, Équipements radio, Équipements de protection individuelle (EPI), Appareils à gaz.' },
        { value: 5, label: 'Aucun de ces produits.' }
      ],
      value: q2,
      setValue: (v: number) => handleAnswer(2, v),
      condition: q1 === 9
    },
    {
      id: 3,
      q: "Pour ce produit spécifique, la législation de l'UE impose-t-elle une évaluation de conformité par un tiers (organisme notifié) avant la mise sur le marché ?",
      p: "Aide : En général, les produits les plus dangereux (ex: une scie circulaire, un pacemaker, un jouet complexe) nécessitent l'intervention d'un auditeur externe. Les produits moins dangereux (autocertification) ne sont pas \"Haut Risque\" au sens de l'article 6.1.",
      type: 'radio',
      options: [
        { value: 1, label: 'Oui, une évaluation par un tiers est requise pour ce produit.' },
        { value: 2, label: 'Non, le fabricant peut s\'autocertifier (contrôle interne) pour ce produit.' }
      ],
      value: q3,
      setValue: (v: number) => handleAnswer(3, v),
      condition: q2 !== null && q2 !== 5
    },
    {
      id: 4,
      q: "Le système d'IA est-il destiné à être utilisé dans l'un des cas suivants ?",
      p: "Objectif : Identifier les IA autonomes (\"Stand-alone\") dans des secteurs sensibles.",
      type: 'checkbox',
      options: [
        { value: 1, label: 'Biométrie : Identification biométrique à distance (a posteriori), vérification biométrique (sauf authentification simple), reconnaissance des émotions (hors travail/école).' },
        { value: 2, label: 'Infrastructures Critiques : Composant de sécurité pour la gestion de l\'eau, gaz, électricité, trafic routier.' },
        { value: 3, label: 'Éducation / Formation : Admission, affectation, évaluation des acquis, surveillance d\'examens.' },
        { value: 4, label: 'Emploi : Recrutement, sélection, analyse des candidatures, prise de décision sur la promotion/licenciement, surveillance des tâches.' },
        { value: 5, label: 'Services Essentiels (Publics & Privés) : Éligibilité aux aides sociales, évaluation de solvabilité/crédit, évaluation des risques en assurance vie/santé, tri des appels d\'urgence (pompiers/police).' },
        { value: 6, label: 'Autorités Répressives (Police) : Évaluation de fiabilité des preuves, profilage, prédiction de victimisation, etc.' },
        { value: 7, label: 'Migration / Asile : Polygraphes, examen des demandes, évaluation des risques sécuritaires.' },
        { value: 8, label: 'Justice / Démocratie : Assistance judiciaire à l\'interprétation des faits/lois, influence sur les élections.' },
        { value: 9, label: 'Aucun de ces cas.' }
      ],
      value: q4,
      setValue: (v: number[]) => handleAnswer(4, v),
      condition: q2 === 5 || (q3 !== null && q3 === 2)
    },
    {
      id: 5,
      q: "Le système effectue-t-il un profilage des personnes physiques ?",
      p: "Aide : Le profilage désigne le traitement automatisé de données pour évaluer des aspects personnels (rendement au travail, situation économique, santé, préférences, etc.).",
      type: 'radio',
      options: [
        { value: 1, label: 'Oui' },
        { value: 2, label: 'Non' }
      ],
      value: q5,
      setValue: (v: number) => handleAnswer(5, v),
      condition: q4.length > 0 && !q4.includes(9)
    },
    {
      id: 6,
      q: "Le système remplit-il l'une des conditions suivantes ?",
      p: "",
      type: 'radio',
      options: [
        { value: 1, label: 'Il est destiné à accomplir une tâche procédurale étroite (ex: trier des dossiers par date, convertir des formats).' },
        { value: 2, label: 'Il améliore le résultat d\'une activité humaine préalablement réalisée (ex: correction orthographique, amélioration du style).' },
        { value: 3, label: 'Il détecte des constantes ou des écarts par rapport à des décisions antérieures, sans se substituer à l\'évaluation humaine et sans l\'influencer sans examen.' },
        { value: 4, label: 'Il exécute une tâche préparatoire à une évaluation pertinente (ex: extraction de données brutes).' },
        { value: 5, label: 'Aucune de ces conditions.' }
      ],
      value: q6,
      setValue: (v: number) => handleAnswer(6, v),
      condition: q5 === 2
    },
    {
      id: 7,
      q: "Le système correspond-il à l'un des cas suivants ?",
      p: "Objectif : Identifier les obligations d'information (IA générative, Chatbots, Deepfakes).",
      type: 'checkbox',
      options: [
        { value: 1, label: 'Interaction : Système destiné à interagir directement avec des personnes physiques (ex: Chatbot, service client automatisé).' },
        { value: 2, label: 'Génération de contenu : Système générant du contenu de synthèse (audio, image, vidéo, texte).' },
        { value: 3, label: 'Deepfake : Système générant ou manipulant des images/sons ressemblant à des personnes/objets réels (hypertrucage).' },
        { value: 4, label: 'Reconnaissance d\'émotions / Catégorisation biométrique : (Dans les cas non interdits et non haut risque).' },
        { value: 5, label: 'Aucun de ces cas.' }
      ],
      value: q7,
      setValue: (v: number[]) => handleAnswer(7, v),
      condition: (q4.length > 0 && q4.includes(9)) || (q6 !== null && q6 !== 5)
    }
  ]
  
  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer le niveau de risque d&apos;un système d&apos;IA — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Déterminer le niveau de risque d&apos;un système d&apos;IA
          </h1>
          <p className="text-gray-600">
            Répondez à ce questionnaire pour identifier le niveau de risque de votre système d&apos;IA selon le Règlement européen sur l&apos;intelligence artificielle.
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openRefs && (
            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold mb-1">Article 5 (Pratiques interdites) :</div>
                <div className="text-xs md:text-sm">
                  « Les pratiques en matière d&apos;IA suivantes sont interdites : a) la mise sur le marché [...] d&apos;un système d&apos;IA qui a recours à des techniques subliminales [...] ; b) [...] qui exploite les éventuelles vulnérabilités dues à l&apos;âge, au handicap ou à la situation sociale ou économique [...] ; c) [...] pour l&apos;évaluation ou la classification de personnes physiques [...] (note sociale) [...] ; d) [...] pour mener des évaluations des risques [...] visant à évaluer ou à prédire le risque qu&apos;une personne physique commette une infraction pénale [...] ; e) [...] moissonnage non ciblé d&apos;images faciales [...] ; f) [...] pour inférer les émotions [...] sur le lieu de travail et dans les établissements d&apos;enseignement [...] ; h) l&apos;utilisation de systèmes d&apos;identification biométrique à distance en temps réel dans des espaces accessibles au public à des fins répressives, sauf [exceptions strictes]. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 6 (Classification des systèmes d&apos;IA comme systèmes à haut risque) :</div>
                <div className="text-xs md:text-sm">
                  « 1. Un système d&apos;IA [...] est considéré comme étant à haut risque lorsque les deux conditions suivantes sont remplies : a) le système d&apos;IA est destiné à être utilisé comme composant de sécurité d&apos;un produit couvert par la législation d&apos;harmonisation de l&apos;Union [...] ou le système d&apos;IA constitue lui-même un tel produit ; b) le produit [...] est soumis à une évaluation de conformité par un tiers [...]. 2. Outre les systèmes d&apos;IA à haut risque visés au paragraphe 1, les systèmes d&apos;IA visés à l&apos;annexe III [Biométrie, éducation, emploi, services essentiels, répression, etc.] sont considérés comme étant à haut risque. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 6 (3) (Dérogation pour absence de risque important) :</div>
                <div className="text-xs md:text-sm">
                  « Par dérogation au paragraphe 2, un système d&apos;IA visé à l&apos;annexe III n&apos;est pas considéré comme étant à haut risque lorsqu&apos;il ne présente pas de risque important de préjudice pour la santé, la sécurité ou les droits fondamentaux [...]. Le premier alinéa s&apos;applique lorsqu&apos;une des conditions suivantes est remplie : a) le système d&apos;IA est destiné à accomplir une tâche procédurale étroite ; b) [...] à améliorer le résultat d&apos;une activité humaine préalablement réalisée ; c) [...] à détecter les constantes en matière de prise de décision [...] ; ou d) [...] à exécuter une tâche préparatoire [...]. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 50 (Obligations de transparence pour certains systèmes d&apos;IA - Risque limité) :</div>
                <div className="text-xs md:text-sm">
                  « 1. Les fournisseurs veillent à ce que les systèmes d&apos;IA destinés à interagir directement avec des personnes physiques soient conçus et développés de manière que les personnes physiques concernées soient informées qu&apos;elles interagissent avec un système d&apos;IA [...]. 2. Les fournisseurs de systèmes d&apos;IA [...] qui génèrent des contenus de synthèse de type audio, image, vidéo ou texte, veillent à ce que les sorties des systèmes d&apos;IA soient marquées dans un format lisible par machine et identifiables comme ayant été générées ou manipulées par une IA. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Considérant 26 du RIA :</div>
                <div className="text-xs md:text-sm">
                  « Afin d&apos;introduire un ensemble proportionné et efficace de règles contraignantes pour les systèmes d&apos;IA, il convient de suivre une approche clairement définie fondée sur les risques. Cette approche devrait adapter le type et le contenu de ces règles à l&apos;intensité et à la portée des risques que les systèmes d&apos;IA peuvent générer. »
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire */}
        <div className="bg-white rounded-2xl shadow divide-y">
          {questions
            .filter(q => q.condition !== false)
            .map(item => {
              const isExpanded = expandedQuestions.has(item.id)
              const isAnswered = item.type === 'checkbox' 
                ? (item.value as number[]).length > 0
                : item.value !== null
              return (
                <div key={item.id} className="border-b last:border-b-0">
                  {/* Header de la question - toujours visible */}
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
                  {/* Contenu de la question - visible seulement si dépliée */}
                  {isExpanded && (
                    <div className="px-5 pb-5 transition-all duration-300 ease-in-out">
                      <div className="text-base font-medium text-gray-900 mb-3">{item.q}</div>
                      {item.p && (
                        <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                          {item.p}
                        </div>
                      )}
                      <div className="space-y-3">
                        {item.type === 'radio' ? (
                          item.options.map(option => (
                            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`q${item.id}`}
                                checked={item.value === option.value}
                                onChange={() => item.setValue(option.value)}
                                className="mt-1 h-4 w-4"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))
                        ) : (
                          item.options.map(option => (
                            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(item.value as number[]).includes(option.value)}
                                onChange={(e) => {
                                  const currentValue = item.value as number[]
                                  const newValue = e.target.checked
                                    ? [...currentValue, option.value]
                                    : currentValue.filter(v => v !== option.value)
                                  item.setValue(newValue)
                                }}
                                className="mt-1 h-4 w-4"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {/* Résultat */}
        {toutesQuestionsRepondues && resultat && (
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-2" style={{ borderColor: '#774792' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#774792' }}>Résultat</h2>
            {resultat === 'inacceptable' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-3">RISQUE INACCEPTABLE</h3>
                <p className="text-lg text-gray-800 mb-4">
                  <strong>Interdiction de mise sur le marché et d&apos;utilisation</strong> (Art. 5)
                </p>
                <p className="text-base text-gray-700 mb-6">
                  Ce système d&apos;IA est interdit par le Règlement IA. Il ne peut pas être mis sur le marché ni utilisé dans l&apos;Union européenne.
                </p>
              </div>
            )}
            {resultat === 'haut-risque' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-orange-600 mb-3">HAUT RISQUE</h3>
                <p className="text-lg text-gray-800">
                  Ce système d&apos;IA est classé &quot;Haut Risque&quot; au sens du Règlement IA.
                </p>
              </div>
            )}
            {resultat === 'risque-limite' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-amber-600 mb-3">RISQUE LIMITÉ (TRANSPARENCE)</h3>
                <p className="text-lg text-gray-800">
                  Ce système d&apos;IA est classé &quot;Risque Limité&quot; au sens du Règlement IA (Art. 50).
                </p>
              </div>
            )}
            {resultat === 'risque-minimal' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-3">RISQUE MINIMAL</h3>
                <p className="text-lg text-gray-800 mb-4">
                  <strong>Aucune obligation spécifique au titre du Règlement IA</strong>
                </p>
                <p className="text-base text-gray-700 mb-4">
                  Ce système d&apos;IA n&apos;est pas soumis aux obligations spécifiques du Règlement IA. Cependant :
                </p>
                <ul className="text-sm text-gray-700 text-left max-w-2xl mx-auto space-y-2 list-disc list-inside mb-6">
                  <li>Le RGPD et autres lois s&apos;appliquent toujours</li>
                  <li>Les codes de conduite volontaires sont encouragés</li>
                </ul>
              </div>
            )}
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
  )
}

export default VerifierNiveauRisquePage
