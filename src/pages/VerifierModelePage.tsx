import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const VerifierModelePage: React.FC = () => {
  type Answer = 'oui' | 'non' | null
  const [openRefs, setOpenRefs] = useState<boolean>(false)
  const [answers, setAnswers] = useState<Record<number, Answer>>({
    1: null,
    2: null,
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
      if (value !== null && idx < 2) {
        setExpandedQuestions(prev => new Set([...prev, idx + 1]))
      }
      return newAnswers
    })
  }

  const allAnswered = useMemo(
    () => Object.values(answers).every(v => v !== null),
    [answers]
  )

  // Règle de décision: Oui aux Q1 et Q2 => modèle d'IA à usage général
  const isModeleIAGeneral = useMemo(() => {
    return (
      answers[1] === 'oui' &&
      answers[2] === 'oui'
    )
  }, [answers])

  return (
    <AdherentOnlyOverlay revealHeight="55vh">
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer si une solution est un modèle d'IA à usage général — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>Déterminer si une solution est un modèle d'IA à usage général</h1>
          <p className="text-gray-600">Répondez à ce questionnaire pour savoir si la solution en question est un modèle d'IA à usage général au sens du règlement européen sur l'intelligence artificielle.</p>
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
                <div className="font-semibold">Article 3 (63) du RIA :</div>
                <div>«modèle d'IA à usage général», un modèle d'IA, y compris lorsque ce modèle d'IA est entraîné à l'aide d'un grand nombre de données utilisant l'auto-supervision à grande échelle, qui présente une généralité significative et est capable d'exécuter de manière compétente un large éventail de tâches distinctes, indépendamment de la manière dont le modèle est mis sur le marché, et qui peut être intégré dans une variété de systèmes ou d'applications en aval, à l'exception des modèles d'IA utilisés pour des activités de recherche, de développement ou de prototypage avant leur mise sur le marché;</div>
              </div>
              <div>
                <div className="font-semibold">Considérant 97 du RIA :</div>
                <div>"La notion de modèles d'IA à usage général devrait être clairement définie et distincte de la notion de systèmes d'IA afin de garantir la sécurité juridique. <strong>La définition devrait se fonder sur les principales caractéristiques fonctionnelles d'un modèle d'IA à usage général, en particulier la généralité et la capacité d'exécuter de manière compétente un large éventail de tâches distinctes.</strong> Ces modèles sont généralement entraînés avec de grandes quantités de données, au moyen de diverses méthodes, telles que l'apprentissage auto-supervisé, non supervisé ou par renforcement. Les modèles d'IA à usage général peuvent être mis sur le marché de différentes manières, notamment au moyen de bibliothèques, d'interfaces de programmation d'applications (API), de téléchargements directs ou de copies physiques. Ces modèles peuvent être modifiés ou affinés et ainsi se transformer en nouveaux modèles. Bien que les modèles d'IA soient des composants essentiels des systèmes d'IA, ils ne constituent pas en soi des systèmes d'IA. Les modèles d'IA nécessitent l'ajout d'autres composants, tels qu'une interface utilisateur, pour devenir des systèmes d'IA. Les modèles d'IA sont généralement intégrés dans les systèmes d'IA et en font partie. […]"</div>
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire */}
        <div className="bg-white rounded-2xl shadow divide-y">
          {[
            {
              id: 1,
              q: "Le modèle d'IA est-il capable d'accomplir une large gamme de tâches distinctes ?",
              p: "Le modèle est-il spécialisé ou permet-il de faire des choses variées (ex : générer du texte, traduire, résumer, créer des images, etc.) ?",
            },
            {
              id: 2,
              q: "Le modèle d'IA est-il conçu pour être intégré dans de multiples systèmes d'IA en aval ?",
              p: "Le modèle est une \"brique\" technologique fondamentale destinée à être utilisée par d'autres développeurs pour construire leurs propres applications ?",
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
          {allAnswered && isModeleIAGeneral && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                Il s'agit d'un modèle d'IA à usage général au sens du RIA.
              </p>
              <p className="text-base text-gray-700 mb-6">
                Veuillez compléter les questionnaires sur le champ d'application, le niveau de risque du modèle d'IA et votre rôle.
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
          {allAnswered && !isModeleIAGeneral && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg md:text-xl font-semibold text-gray-800">
                Il ne s'agit pas d'un modèle d'IA à usage général au sens du RIA, il n'est donc pas nécessaire de compléter d'autres questionnaires.
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
    </AdherentOnlyOverlay>
  )
}

export default VerifierModelePage

