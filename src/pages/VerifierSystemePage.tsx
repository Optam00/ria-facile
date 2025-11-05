import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const VerifierSystemePage: React.FC = () => {
  type Answer = 'oui' | 'non' | null
  const [openRefs, setOpenRefs] = useState<boolean>(false)
  const [answers, setAnswers] = useState<Record<number, Answer>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  })
  // État pour gérer quelles questions sont dépliées (accordéon)
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

  const setAnswer = (idx: number, value: Answer) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [idx]: value }
      // Si une réponse est donnée, déplier automatiquement la question suivante
      if (value !== null && idx < 5) {
        setExpandedQuestions(prev => new Set([...prev, idx + 1]))
      }
      return newAnswers
    })
  }

  const allAnswered = useMemo(
    () => Object.values(answers).every(v => v !== null),
    [answers]
  )

  // Règle de décision: Oui aux Q1, Q2, Q3, Q4, Q5 => système d'IA
  const isSystemIA = useMemo(() => {
    return (
      answers[1] === 'oui' &&
      answers[2] === 'oui' &&
      answers[3] === 'oui' &&
      answers[4] === 'oui' &&
      answers[5] === 'oui'
    )
  }, [answers])

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer si une solution est un système d’IA — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>Déterminer si une solution est un système d’IA</h1>
          <p className="text-gray-600">Répondez à ce questionnaire pour savoir si la solution en question est un système d'IA au sens du règlement européen sur l'intelligence artificielle.</p>
        </div>

        {/* Accordéon Références utiles */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setOpenRefs(v => !v)}
            aria-expanded={openRefs}
          >
            <span className="font-semibold text-gray-900">Références utiles</span>
            <svg className={`w-5 h-5 transition-transform ${openRefs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </button>
          {openRefs && (
            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold">Article 3 (1) du RIA :</div>
                <div>« système d’IA », un système automatisé qui est conçu pour fonctionner à différents niveaux d’autonomie et peut faire preuve d’une capacité d’adaptation après son déploiement, et qui, pour des objectifs explicites ou implicites, déduit, à partir des entrées qu’il reçoit, la manière de générer des sorties telles que des prédictions, du contenu, des recommandations ou des décisions qui peuvent influencer les environnements physiques ou virtuels;</div>
              </div>
              <div>
                <div className="font-semibold">Considérant 12 du RIA :</div>
                <div>“[…] La définition devrait être fondée sur les caractéristiques essentielles des systèmes d’IA qui la distinguent des systèmes logiciels ou des approches de programmation traditionnels plus simples, et ne devrait pas couvrir les systèmes fondés sur les règles définies uniquement par les personnes physiques pour exécuter automatiquement des opérations. […]”</div>
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire */}
        <div className="bg-white rounded-2xl shadow divide-y">
          {[
            {
              id: 1,
              q: "Le système est-il un système basé sur une machine ?",
              p: "L'outil fonctionne-t-il sur un support informatique (ordinateur, serveur, etc.) ?",
            },
            {
              id: 2,
              q: "Le système est-il conçu pour fonctionner avec différents niveaux d'autonomie ?",
              p: "L'outil peut-il réaliser des tâches ou prendre des décision avec une supervision humaine réduite pendant son fonctionnement ?",
            },
            {
              id: 3,
              q: "Le système déduit-il, à partir des données d'entrées qu'il reçoit, la manière de générer des sorties ?",
              p: "Précision sur cette notion d'inférence : le système va-t-il au-delà de la simple exécution de règles pré-programmées ? Utilise-t-il des approches (apprentissage automatique, logique, connaissances) pour déduire des patterns, raisonner ou modéliser afin de générer les sorties ?",
            },
            {
              id: 4,
              q: "Le système génère-t-il des sorties ?",
              p: "L'outil permet-il de produire des résultats, par exemple des prédictions, du contenu, des recommandations ou des décision ?",
            },
            {
              id: 5,
              q: "Ces sorties (prédictions, contenu, etc.) peuvent-elles influencer les environnements physiques ou virtuels ?",
              p: "Les éléments de sortie de l'outil peuvent-elles provoquer un changement, avoir un effet ou guider une action dans le monde réel ou dans un espace numérique (par exemple, modifier un affichage, contrôler un robot, influencer une décision humaine ayant un impact externe) ?",
            },
          ].map(item => {
            const isExpanded = expandedQuestions.has(item.id)
            const isAnswered = answers[item.id] !== null
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
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                      <div className="text-base font-medium text-gray-900 md:max-w-[70%]">{item.q}</div>
                      <div className="flex items-center gap-6">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`q${item.id}`}
                            checked={answers[item.id] === 'oui'}
                            onChange={() => setAnswer(item.id, 'oui')}
                            className="h-4 w-4"
                          />
                          <span>Oui</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`q${item.id}`}
                            checked={answers[item.id] === 'non'}
                            onChange={() => setAnswer(item.id, 'non')}
                            className="h-4 w-4"
                          />
                          <span>Non</span>
                        </label>
                      </div>
                    </div>
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
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-2" style={{ borderColor: '#774792' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#774792' }}>Résultat</h2>
          {!allAnswered && (
            <div className="text-center">
              <p className="text-lg text-gray-700">Veuillez répondre à chaque question pour obtenir une réponse.</p>
            </div>
          )}
          {allAnswered && isSystemIA && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                Il s'agit d'un système d'IA au sens du RIA.
              </p>
              <p className="text-base text-gray-700 mb-6">
                Veuillez compléter les questionnaires sur le champ d'application, le niveau de risque du SIA et votre rôle.
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
          {allAnswered && !isSystemIA && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg md:text-xl font-semibold text-gray-800">
                Il ne s'agit pas d'un système d'IA au sens du règlement, il n'est donc pas nécessaire de compléter d'autres questionnaires.
              </p>
            </div>
          )}
        </div>

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

export default VerifierSystemePage


