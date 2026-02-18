import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

type RisqueResultat = 'inacceptable' | 'haut-risque' | 'risque-limite-derogation' | 'risque-limite-transparence' | 'risque-minimal' | null

// Types pour les détails des domaines
type DomaineDetail = {
  id: number
  label: string
  exceptions?: string
  condition?: string
}

type Domaine = {
  id: number
  label: string
  details: DomaineDetail[]
}

const VerifierNiveauRisquePage: React.FC = () => {
  const [openRefs, setOpenRefs] = useState<boolean>(false)
  
  // État pour les réponses
  const [q1, setQ1] = useState<number | null>(null) // RISK_PROHIBITED
  const [q2, setQ2] = useState<number | null>(null) // RISK_SAFETY_COMP
  const [q3, setQ3] = useState<number | null>(null) // RISK_3RD_PARTY
  const [q4Domaines, setQ4Domaines] = useState<number[]>([]) // Domaines sélectionnés
  const [q4Details, setQ4Details] = useState<Record<number, number[]>>({}) // Détails cochés par domaine
  const [q5, setQ5] = useState<number | null>(null) // DEROGATION_PROFILING
  const [q6, setQ6] = useState<number | null>(null) // DEROGATION_CRITERIA
  const [q7, setQ7] = useState<number[]>([]) // RISK_TRANSPARENCY
  
  // État pour gérer quelles questions sont dépliées
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([1]))
  
  // Définir les domaines et leurs détails
  const domaines: Domaine[] = [
    {
      id: 1,
      label: 'Biométrie',
      details: [
        { id: 1, label: 'Identification à distance : Identification biométrique à distance (a posteriori)', exceptions: 'EXCEPTION : Ne cochez PAS si le système sert uniquement à l\'authentification biométrique (vérification 1:1).' },
        { id: 2, label: 'Catégorisation biométrique : Inférence de caractéristiques (si non interdit par l\'Art. 5)' },
        { id: 3, label: 'Reconnaissance des émotions : (Hors cas interdits)', exceptions: 'EXCEPTION : Ne cochez PAS si le système est utilisé à des fins médicales ou de sécurité.' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 2,
      label: 'Infrastructures Critiques',
      details: [
        { id: 1, label: 'Composant de sécurité : Gestion du trafic (routier, fer, air) ou fourniture d\'eau, gaz, chauffage, électricité ou infrastructures numériques critiques', condition: 'CONDITION : La défaillance doit mettre en danger la vie/santé des personnes ou causer des dommages matériels graves.' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 3,
      label: 'Éducation et Formation',
      details: [
        { id: 1, label: 'Admission, affectation dans les établissements' },
        { id: 2, label: 'Évaluation des acquis ou du niveau d\'éducation' },
        { id: 3, label: 'Surveillance d\'examens (proctoring)' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 4,
      label: 'Emploi et Gestion des travailleurs',
      details: [
        { id: 1, label: 'Recrutement (tri CV, offres ciblées, évaluation candidats)' },
        { id: 2, label: 'Prise de décision (promotion, affectation, licenciement)' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 5,
      label: 'Accès aux services essentiels (Publics & Privés)',
      details: [
        { id: 1, label: 'Aides publiques : Éligibilité, octroi, révocation des prestations sociales' },
        { id: 2, label: 'Solvabilité / Crédit : Évaluation de la solvabilité', exceptions: 'EXCEPTION : Ne cochez PAS si le système sert exclusivement à la détection de la fraude financière.' },
        { id: 3, label: 'Assurance : Évaluation des risques/tarification en assurance vie et santé' },
        { id: 4, label: 'Urgence : Tri et gestion des appels d\'urgence (Pompiers, Police, etc.)' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 6,
      label: 'Autorités répressives (Police)',
      details: [
        { id: 1, label: 'Prédiction de risque de victimisation ou récidive' },
        { id: 2, label: 'Polygraphes / Détection d\'état émotionnel' },
        { id: 3, label: 'Évaluation de la fiabilité des preuves' },
        { id: 4, label: 'Évaluation du risque de récidive' },
        { id: 5, label: 'Profilage' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 7,
      label: 'Migration, Asile et Frontières',
      details: [
        { id: 1, label: 'Polygraphes / Détection d\'état émotionnel' },
        { id: 2, label: 'Examen des demandes d\'asile, visa, titres de séjour' },
        { id: 3, label: 'Évaluation des risques sécuritaires ou sanitaires aux frontières' },
        { id: 4, label: 'Contrôles aux frontières, aux fins de la détection, de la reconnaissance ou de l\'identification des personnes physiques sauf vérification des documents de voyage.' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    },
    {
      id: 8,
      label: 'Justice et Démocratie',
      details: [
        { id: 1, label: 'Assistance judiciaire (recherche/interprétation faits ou droit)' },
        { id: 2, label: 'Influence sur les élections ou le comportement électoral' },
        { id: 999, label: 'Aucun de ces cas.' }
      ]
    }
  ]
  
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
  
  // Vérifier si au moins un cas spécifique (pas "Aucun de ces cas") est coché dans les domaines sélectionnés
  const hasAnnexIIICase = useMemo(() => {
    if (q4Domaines.length === 0 || q4Domaines.includes(9)) return false
    return q4Domaines.some(domaineId => {
      const details = q4Details[domaineId] || []
      // Vérifier qu'il y a au moins un détail coché ET que ce n'est pas uniquement "Aucun de ces cas" (id: 999)
      return details.length > 0 && !(details.length === 1 && details[0] === 999)
    })
  }, [q4Domaines, q4Details])
  
  // Déplier automatiquement la question suivante quand on répond
  const handleAnswer = (questionId: number, value: number | number[]) => {
    if (questionId === 1) {
      setQ1(value as number)
      if (value !== 9) {
        return
      }
      setExpandedQuestions(prev => new Set([...prev, 2]))
    } else if (questionId === 2) {
      setQ2(value as number)
      if (value === 5) {
        setExpandedQuestions(prev => new Set([...prev, 4]))
      } else {
        setExpandedQuestions(prev => new Set([...prev, 3]))
      }
    } else if (questionId === 3) {
      setQ3(value as number)
      if (value === 1) {
        // Haut Risque Art. 6.1, passer à transparence
        setExpandedQuestions(prev => new Set([...prev, 7]))
        return
      }
      setExpandedQuestions(prev => new Set([...prev, 4]))
    } else if (questionId === 4) {
      // Gestion des domaines sélectionnés
      const domainesArray = value as number[]
      setQ4Domaines(domainesArray)
      
      // Si aucun domaine ou "Aucun", passer à transparence
      if (domainesArray.length === 0 || domainesArray.includes(9)) {
        setExpandedQuestions(prev => new Set([...prev, 7]))
      }
      // Sinon, on attend que l'utilisateur coche des détails
    } else if (questionId === 4.5) {
      // Gestion des détails cochés - vérifier si on peut passer à l'étape suivante
      if (hasAnnexIIICase) {
        setExpandedQuestions(prev => new Set([...prev, 5]))
      } else if (q4Domaines.length === 0 || q4Domaines.includes(9)) {
        setExpandedQuestions(prev => new Set([...prev, 7]))
      }
    } else if (questionId === 5) {
      setQ5(value as number)
      if (value === 1) {
        // Profilage = Haut Risque, passer à transparence
        setExpandedQuestions(prev => new Set([...prev, 7]))
        return
      }
      setExpandedQuestions(prev => new Set([...prev, 6]))
    } else if (questionId === 6) {
      setQ6(value as number)
      if (value === 5) {
        // Haut Risque, passer à transparence
        setExpandedQuestions(prev => new Set([...prev, 7]))
        return
      }
      // Dérogation applicable, passer à transparence
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
    if (hasAnnexIIICase) {
      // Vérifier la dérogation
      if (q5 === 1) {
        // Profilage = Haut Risque
        return 'haut-risque'
      }
      if (q6 === 5) {
        // Pas de condition remplie = Haut Risque
        return 'haut-risque'
      }
      if (q6 !== null && q6 !== 5) {
        // Dérogation applicable
        if (q7.length > 0 && !q7.includes(5)) {
          return 'risque-limite-derogation' // Avec transparence
        }
        return 'risque-limite-derogation'
      }
    }
    
    // Étape 5 : Risque de transparence seule
    if (q7.length > 0 && !q7.includes(5) && !hasAnnexIIICase) {
      return 'risque-limite-transparence'
    }
    
    // Par défaut : Risque minimal
    if (q1 === 9 && (q2 === 5 || (q3 !== null && q3 === 2)) && !hasAnnexIIICase && (q7.length === 0 || q7.includes(5))) {
      return 'risque-minimal'
    }
    
    return null
  }, [q1, q2, q3, q4Domaines, q4Details, q5, q6, q7, hasAnnexIIICase])
  
  // Vérifier si toutes les questions nécessaires sont répondues
  const toutesQuestionsRepondues = useMemo(() => {
    if (q1 === null) return false
    if (q1 !== 9) return true // Pratique interdite, on arrête
    
    if (q2 === null) return false
    if (q2 === 5) {
      // Passer à Q4
      if (q4Domaines.length === 0) return false
      if (q4Domaines.includes(9)) {
        // Aucun domaine, passer à transparence
        return q7.length > 0
      }
      // Vérifier si au moins un cas spécifique est coché (pas uniquement "Aucun")
      if (!hasAnnexIIICase) {
        // Tous les domaines ont "Aucun de ces cas" ou aucun détail coché, passer à transparence
        return q7.length > 0
      }
      // Sinon, vérifier dérogation
      if (q5 === null) return false
      if (q5 === 1) return q7.length > 0 // Profilage = Haut Risque, mais on peut avoir transparence
      if (q6 === null) return false
      if (q6 === 5) return q7.length > 0 // Haut Risque, mais on peut avoir transparence
      return q7.length > 0
    }
    
    if (q3 === null) return false
    if (q3 === 1) return q7.length > 0 // Haut Risque Art. 6.1, mais on peut avoir transparence
    
    // Passer à Q4
    if (q4Domaines.length === 0) return false
    if (q4Domaines.includes(9)) {
      // Aucun domaine, passer à transparence
      return q7.length > 0
    }
    // Vérifier si au moins un cas spécifique est coché (pas uniquement "Aucun")
    if (!hasAnnexIIICase) {
      // Tous les domaines ont "Aucun de ces cas" ou aucun détail coché, passer à transparence
      return q7.length > 0
    }
    // Sinon, vérifier dérogation
    if (q5 === null) return false
    if (q5 === 1) return q7.length > 0
    if (q6 === null) return false
    if (q6 === 5) return q7.length > 0
    return q7.length > 0
  }, [q1, q2, q3, q4Domaines, q4Details, q5, q6, q7, hasAnnexIIICase])
  
  // Gérer la sélection d'un détail de domaine
  const handleDetailToggle = (domaineId: number, detailId: number) => {
    setQ4Details(prev => {
      const current = prev[domaineId] || []
      let newDetails: number[]
      
      // Si on coche "Aucun de ces cas" (999), décocher tous les autres détails de ce domaine
      if (detailId === 999) {
        if (current.includes(999)) {
          newDetails = []
        } else {
          newDetails = [999]
        }
      } else {
        // Si on coche un autre détail, décocher "Aucun de ces cas" (999)
        newDetails = current.includes(detailId)
          ? current.filter(id => id !== detailId)
          : [...current.filter(id => id !== 999), detailId]
      }
      
      const newState = { ...prev, [domaineId]: newDetails }
      
      // Vérifier si on peut passer à l'étape suivante avec la nouvelle valeur
      // Vérifier qu'il y a au moins un cas spécifique (pas uniquement "Aucun")
      const hasCase = Object.values(newState).some(details => 
        details.length > 0 && !(details.length === 1 && details[0] === 999)
      )
      
      // Utiliser setTimeout pour s'assurer que le state est mis à jour
      setTimeout(() => {
        if (hasCase && q4Domaines.length > 0 && !q4Domaines.includes(9)) {
          // Au moins un cas spécifique coché, passer à la dérogation (Q5)
          setExpandedQuestions(prev => new Set([...prev, 5]))
        } else {
          // Si aucun cas spécifique (seulement "Aucun de ces cas" ou rien) OU aucun domaine sélectionné, passer à transparence (Q7)
          setExpandedQuestions(prev => new Set([...prev, 7]))
        }
      }, 0)
      
      return newState
    })
  }
  
  // Vérifier si la transparence s'applique
  const hasTransparency = useMemo(() => {
    return q7.length > 0 && !q7.includes(5)
  }, [q7])
  
  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer le niveau de risque d&apos;un système d&apos;IA — RIA Facile</title>
        <link rel="canonical" href="https://ria-facile.com/verificateur/niveau-risque" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Déterminer le niveau de risque pour votre conformité IA
          </h1>
          <p className="text-gray-600">
            Répondez à ce questionnaire pour identifier le niveau de risque de votre système d&apos;IA selon le Règlement européen sur l&apos;intelligence artificielle et assurer votre conformité IA.
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
          {/* Question 1 */}
          {q1 === null || q1 === 9 ? (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(1)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 1</span>
                  {q1 !== null && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(1) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(1) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Le système d&apos;IA effectue-t-il l&apos;une des fonctions suivantes ?
                  </div>
                  <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                    Objectif : Identifier immédiatement les &quot;lignes rouges&quot;.
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(val => (
                      <label key={val} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="q1"
                          checked={q1 === val}
                          onChange={() => handleAnswer(1, val)}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">
                          {val === 1 && 'Manipulation : Techniques subliminales ou manipulatrices altérant le comportement de manière nuisible.'}
                          {val === 2 && 'Exploitation : Exploitation des vulnérabilités (âge, handicap, situation sociale/économique).'}
                          {val === 3 && 'Notation Sociale : Évaluation selon le comportement social ou les caractéristiques menant à un traitement défavorable.'}
                          {val === 4 && 'Police Prédictive : Évaluation du risque criminel basée uniquement sur le profilage ou les traits de personnalité.'}
                          {val === 5 && 'Scraping Facial : Constitution ou extension de bases de données faciales par moissonnage non ciblé d\'internet ou de vidéosurveillance (CCTV).'}
                          {val === 6 && 'Émotions (Travail/École) : Reconnaissance des émotions sur le lieu de travail ou dans l\'enseignement (sauf raison médicale/sécurité).'}
                          {val === 7 && 'Catégorisation Biométrique : Classement selon des données sensibles (race, opinions, religion, orientation sexuelle).'}
                          {val === 8 && 'Identification Biométrique Temps Réel : Identification à distance dans des espaces publics à des fins répressives (sauf exceptions strictes type terrorisme/enlèvement).'}
                          {val === 9 && 'Aucune de ces fonctions.'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Question 2 */}
          {q1 === 9 && (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(2)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 2</span>
                  {q2 !== null && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(2) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(2) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Le système d&apos;IA est-il un composant de sécurité (ou le produit lui-même) relevant de l&apos;une des législations suivantes ?
                  </div>
                  <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                    Objectif : Identifier les IA intégrées dans des produits réglementés (Marquage CE existant).
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(val => (
                      <label key={val} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="q2"
                          checked={q2 === val}
                          onChange={() => handleAnswer(2, val)}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">
                          {val === 1 && 'Industrie : Machines, Ascenseurs, ATEX, Équipements sous pression, Installations à câbles.'}
                          {val === 2 && 'Santé : Dispositifs médicaux ou Diagnostic in vitro.'}
                          {val === 3 && 'Transports : Aviation civile, Marine, Ferroviaire, Véhicules à moteur (voitures, agricoles).'}
                          {val === 4 && 'Grand Public : Jouets, Équipements radio, EPI, Appareils à gaz.'}
                          {val === 5 && 'Aucun de ces produits.'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question 3 */}
          {q2 !== null && q2 !== 5 && (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(3)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 3</span>
                  {q3 !== null && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(3) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(3) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Pour ce produit spécifique, la législation sectorielle impose-t-elle une évaluation de conformité par un tiers (organisme notifié) ?
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map(val => (
                      <label key={val} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="q3"
                          checked={q3 === val}
                          onChange={() => handleAnswer(3, val)}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">
                          {val === 1 && 'Oui'}
                          {val === 2 && 'Non (Autocertification possible)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question 4 - Domaines */}
          {(q2 === 5 || (q3 !== null && q3 === 2)) && (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(4)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 4</span>
                  {q4Domaines.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(4) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(4) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Le système d&apos;IA est-il destiné à être utilisé dans l&apos;un des grands domaines suivants ?
                  </div>
                  <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                    Instruction : Sélectionnez un domaine pour afficher les cas d&apos;usage précis et les exceptions.
                  </div>
                  <div className="space-y-3 mb-6">
                    {domaines.map(domaine => (
                      <label key={domaine.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q4Domaines.includes(domaine.id)}
                          onChange={(e) => {
                            const newDomaines = e.target.checked
                              ? [...q4Domaines, domaine.id]
                              : q4Domaines.filter(id => id !== domaine.id)
                            handleAnswer(4, newDomaines)
                          }}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">{domaine.label}</span>
                      </label>
                    ))}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q4Domaines.includes(9)}
                        onChange={(e) => {
                          const newDomaines = e.target.checked
                            ? [...q4Domaines, 9]
                            : q4Domaines.filter(id => id !== 9)
                          handleAnswer(4, newDomaines)
                        }}
                        className="mt-1 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Aucun de ces domaines.</span>
                    </label>
                  </div>
                  
                  {/* Détails des domaines sélectionnés */}
                  {q4Domaines.length > 0 && !q4Domaines.includes(9) && (
                    <div className="mt-6 space-y-6">
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Détails des domaines sélectionnés :
                      </div>
                      {q4Domaines.filter(id => id !== 9).map(domaineId => {
                        const domaine = domaines.find(d => d.id === domaineId)
                        if (!domaine) return null
                        return (
                          <div key={domaineId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="font-semibold text-gray-900 mb-3">
                              Domaine {domaineId} : {domaine.label}
                            </div>
                            <div className="text-xs text-gray-600 italic mb-3">
                              Cochez si votre système correspond à l&apos;un de ces cas :
                            </div>
                            <div className="space-y-3">
                              {domaine.details.map(detail => (
                                <div key={detail.id}>
                                  <label className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={(q4Details[domaineId] || []).includes(detail.id)}
                                      onChange={() => handleDetailToggle(domaineId, detail.id)}
                                      className="mt-1 h-4 w-4"
                                    />
                                    <div className="flex-1">
                                      <span className="text-sm text-gray-700">{detail.label}</span>
                                      {detail.exceptions && (
                                        <div className="text-xs text-amber-700 mt-1 italic">
                                          {detail.exceptions}
                                        </div>
                                      )}
                                      {detail.condition && (
                                        <div className="text-xs text-blue-700 mt-1 italic">
                                          {detail.condition}
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Question 5 - Profilage */}
          {hasAnnexIIICase && (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(5)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 5</span>
                  {q5 !== null && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(5) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(5) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Le système effectue-t-il un profilage des personnes physiques ?
                  </div>
                  <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                    Aide : Traitement automatisé pour évaluer des aspects personnels (rendement, santé, préférences, etc.).
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map(val => (
                      <label key={val} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="q5"
                          checked={q5 === val}
                          onChange={() => handleAnswer(5, val)}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">
                          {val === 1 && 'Oui'}
                          {val === 2 && 'Non'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question 6 - Critères de dérogation */}
          {q5 === 2 && (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(6)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 6</span>
                  {q6 !== null && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(6) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(6) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Le système remplit-il l&apos;une des conditions suivantes ?
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(val => (
                      <label key={val} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="q6"
                          checked={q6 === val}
                          onChange={() => handleAnswer(6, val)}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">
                          {val === 1 && 'Il accomplit une tâche procédurale étroite.'}
                          {val === 2 && 'Il améliore le résultat d\'une activité humaine préalablement réalisée.'}
                          {val === 3 && 'Il détecte des constantes/écarts sans se substituer à l\'évaluation humaine (pas de décision).'}
                          {val === 4 && 'Il exécute une tâche préparatoire uniquement.'}
                          {val === 5 && 'Aucune de ces conditions.'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question 7 - Transparence */}
          {((q3 === 1) || 
            (q4Domaines.length > 0 && (q4Domaines.includes(9) || !hasAnnexIIICase)) || 
            (hasAnnexIIICase && (q5 === 1 || q6 !== null)) ||
            (q4Domaines.length > 0 && Object.values(q4Details).some(details => 
              details.length > 0 && details.length === 1 && details[0] === 999
            ))) && (
            <div className="border-b">
              <button
                onClick={() => toggleQuestion(7)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-purple-600">Question 7</span>
                  {q7.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.has(7) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(7) && (
                <div className="px-5 pb-5">
                  <div className="text-base font-medium text-gray-900 mb-3">
                    Le système correspond-il à l&apos;un des cas suivants ?
                  </div>
                  <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                    Objectif : Identifier les obligations d&apos;information (cumulables avec le Haut Risque).
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(val => (
                      <label key={val} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q7.includes(val)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...q7, val]
                              : q7.filter(v => v !== val)
                            handleAnswer(7, newValue)
                          }}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">
                          {val === 1 && 'Interaction : Système destiné à interagir directement avec des personnes (Chatbot, etc.).'}
                          {val === 2 && 'Génération de contenu : Système générant du texte, audio, vidéo, image.'}
                          {val === 3 && 'Deepfake : Génération/manipulation réaliste (Hypertrucage).'}
                          {val === 4 && 'Reconnaissance d\'émotions / Catégorisation biométrique : (Dans les cas autorisés et non Haut Risque).'}
                          {val === 5 && 'Aucun de ces cas.'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
                <h3 className="text-2xl font-bold text-orange-600 mb-3">SYSTÈME À HAUT RISQUE</h3>
                <p className="text-lg text-gray-800 mb-4">
                  Consultez la <Link to="/matrice-des-obligations" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">matrice des obligations</Link> pour connaître vos obligations.
                </p>
                {hasTransparency && (
                  <p className="text-base text-amber-700 mt-4 p-3 bg-amber-50 rounded-lg">
                    <strong>ATTENTION :</strong> Vous avez également des obligations de transparence (Art. 50) : consultez la <Link to="/matrice-des-obligations" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">matrice des obligations</Link> pour connaître vos obligations.
                  </p>
                )}
              </div>
            )}
            {resultat === 'risque-limite-derogation' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-amber-600 mb-3">SYSTÈME SOUS DÉROGATION (ART. 6.3)</h3>
                <p className="text-lg text-gray-800 mb-4">
                  Votre système relève d&apos;un domaine critique (Annexe III) mais votre réponse indique qu&apos;il remplit les conditions de l&apos;article 6.3 pour ne pas être qualifié de &quot;Haut Risque&quot;.
                </p>
                <p className="text-base text-gray-700 mb-4">
                  Consultez la <Link to="/matrice-des-obligations" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">matrice des obligations</Link> pour connaître vos obligations.
                </p>
                {hasTransparency && (
                  <p className="text-base text-amber-700 mt-4 p-3 bg-amber-50 rounded-lg">
                    N&apos;oubliez pas vos obligations de transparence (Art. 50).
                  </p>
                )}
              </div>
            )}
            {resultat === 'risque-limite-transparence' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-amber-600 mb-3">RISQUE LIMITÉ (OBLIGATIONS DE TRANSPARENCE)</h3>
                <p className="text-lg text-gray-800 mb-4">
                  Consultez la <Link to="/matrice-des-obligations" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">matrice des obligations</Link> pour connaître vos obligations.
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
                  Votre système ne rentre dans aucune catégorie réglementée spécifique du Règlement IA. Ce texte n&apos;impose aucune obligation particulière mais d&apos;autres textes sont applicables (ex : applicabilité du RGPD concernant la gestion des droits, l&apos;exactitude des données, etc.)
                </p>
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
