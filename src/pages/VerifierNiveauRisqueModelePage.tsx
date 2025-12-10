import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

type RisqueResultat = 'systemique' | 'gpai-complet' | 'gpai-allege' | 'hors-categorie' | null

const VerifierNiveauRisqueModelePage: React.FC = () => {
  const [openRefs, setOpenRefs] = useState<boolean>(false)
  
  // État pour les réponses
  const [q1, setQ1] = useState<number | null>(null) // QUALIFICATION_USAGE_GENERAL
  const [q2, setQ2] = useState<number | null>(null) // SYSTEMIC_FLOPS
  const [q3, setQ3] = useState<number | null>(null) // SYSTEMIC_DESIGNATION
  const [q4, setQ4] = useState<number | null>(null) // MODELE_OPEN_SOURCE
  
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
  const handleAnswer = (questionId: number, value: number) => {
    if (questionId === 1) {
      setQ1(value)
      if (value === 1) {
        // IA Étroite = Hors catégorie, on arrête
        return
      }
      // Sinon, déplier Q2
      setExpandedQuestions(prev => new Set([...prev, 2]))
    } else if (questionId === 2) {
      setQ2(value)
      if (value === 2) {
        // Risque systémique par seuil, on arrête
        return
      }
      // Sinon, continuer vers Q3
      setExpandedQuestions(prev => new Set([...prev, 3]))
    } else if (questionId === 3) {
      setQ3(value)
      if (value === 1) {
        // Risque systémique par désignation, on arrête
        return
      }
      // Sinon, continuer vers Q4
      setExpandedQuestions(prev => new Set([...prev, 4]))
    } else if (questionId === 4) {
      setQ4(value)
    }
  }
  
  // Calcul du résultat
  const resultat: RisqueResultat = useMemo(() => {
    // Étape 1 : Qualification
    if (q1 === 1) {
      return 'hors-categorie'
    }
    
    // Étape 2 : Seuil de calcul
    if (q2 === 2) {
      return 'systemique'
    }
    
    // Étape 3 : Désignation
    if (q3 === 1) {
      return 'systemique'
    }
    
    // Étape 4 : Licence
    if (q4 === 1) {
      return 'gpai-allege'
    }
    if (q4 === 2) {
      return 'gpai-complet'
    }
    
    return null
  }, [q1, q2, q3, q4])
  
  // Vérifier si toutes les questions nécessaires sont répondues
  const toutesQuestionsRepondues = useMemo(() => {
    if (q1 === null) return false
    if (q1 === 1) return true // Hors catégorie, on arrête
    
    if (q2 === null) return false
    if (q2 === 2) return true // Risque systémique par seuil, on arrête
    
    if (q3 === null) return false
    if (q3 === 1) return true // Risque systémique par désignation, on arrête
    
    if (q4 === null) return false
    return true
  }, [q1, q2, q3, q4])
  
  // Structure des questions
  const questions = [
    {
      id: 1,
      q: "Le modèle présente-t-il une \"généralité significative\" ?",
      p: "Aide : Est-il capable d'exécuter de manière compétente un large éventail de tâches distinctes (ex: générer du texte, du code, traduire, résumer) ou est-il conçu pour une tâche unique et spécifique (ex: uniquement détecter des fraudes bancaires) ?",
      type: 'radio',
      options: [
        { value: 1, label: 'IA Étroite : Le modèle est spécialisé pour une tâche unique ou un domaine très restreint.' },
        { value: 2, label: 'Modèle d\'IA à usage général : Le modèle est polyvalent et peut être utilisé pour de nombreuses tâches différentes ou intégré dans divers systèmes en aval.' }
      ],
      value: q1,
      setValue: (v: number) => handleAnswer(1, v),
      condition: true
    },
    {
      id: 2,
      q: "Quelle est la quantité cumulée de calcul utilisée pour l'entraînement du modèle (mesurée en opérations en virgule flottante - FLOPS) ?",
      p: "Aide : Ce seuil cible les modèles les plus puissants au monde (type GPT-4, Gemini Ultra).",
      type: 'radio',
      options: [
        { value: 1, label: 'Inférieure à 10^25 FLOPS.' },
        { value: 2, label: 'Supérieure à 10^25 FLOPS.' }
      ],
      value: q2,
      setValue: (v: number) => handleAnswer(2, v),
      condition: q1 === 2
    },
    {
      id: 3,
      q: "Le modèle a-t-il fait l'objet d'une décision de désignation par la Commission européenne ou présente-t-il des capacités à fort impact équivalentes ?",
      p: "Aide : Critères : nombre de paramètres très élevé, qualité exceptionnelle des données, impact majeur sur le marché intérieur, portée massive (ex: > 10 000 utilisateurs professionnels dans l'UE).",
      type: 'radio',
      options: [
        { value: 1, label: 'Oui, il a été désigné comme tel ou possède des capacités équivalentes.' },
        { value: 2, label: 'Non.' }
      ],
      value: q3,
      setValue: (v: number) => handleAnswer(3, v),
      condition: q2 === 1
    },
    {
      id: 4,
      q: "Le modèle est-il mis à disposition sous une licence libre et ouverte ?",
      p: "Aide : La licence doit permettre l'accès, l'utilisation, la modification et la redistribution du modèle (y compris ses paramètres/poids).",
      type: 'radio',
      options: [
        { value: 1, label: 'Oui (Licence libre et ouverte).' },
        { value: 2, label: 'Non (Modèle propriétaire / fermé).' }
      ],
      value: q4,
      setValue: (v: number) => handleAnswer(4, v),
      condition: q3 === 2
    }
  ]
  
  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer le niveau de risque d&apos;un modèle d&apos;IA — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Déterminer le niveau de risque d&apos;un modèle d&apos;IA
          </h1>
          <p className="text-gray-600">
            Répondez à ce questionnaire pour identifier le niveau de risque de votre modèle d&apos;IA selon le Règlement européen sur l&apos;intelligence artificielle.
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
                <div className="font-semibold mb-1">Article 3 (63) du RIA (Définition) :</div>
                <div className="text-xs md:text-sm">
                  « <strong>Modèle d&apos;IA à usage général</strong> » : un modèle d&apos;IA [...] qui présente une généralité significative et est capable d&apos;exécuter de manière compétente un large éventail de tâches distinctes [...] et qui peut être intégré dans une variété de systèmes ou d&apos;applications en aval.
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 51 du RIA (Risque Systémique) :</div>
                <div className="text-xs md:text-sm">
                  « Un modèle d&apos;IA à usage général est classé comme [...] présentant un risque systémique s&apos;il remplit l&apos;une des conditions suivantes : a) il dispose de <strong>capacités à fort impact</strong> [...] ; b) sur la base d&apos;une décision de la Commission [...]. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 51 (2) du RIA (Seuil de calcul) :</div>
                <div className="text-xs md:text-sm">
                  « Un modèle d&apos;IA à usage général est présumé avoir des capacités à fort impact [...] lorsque la quantité cumulée de calcul utilisée pour son entraînement [...] est supérieure à <strong>10^25 opérations en virgule flottante (FLOPS)</strong>. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 53 (2) du RIA (Exception Open Source) :</div>
                <div className="text-xs md:text-sm">
                  « Les obligations [de documentation technique] ne s&apos;appliquent pas aux fournisseurs de modèles d&apos;IA qui sont publiés dans le cadre d&apos;une <strong>licence libre et ouverte</strong> [...]. Cette exception ne s&apos;applique pas aux modèles d&apos;IA à usage général présentant un risque systémique. »
                </div>
                <div className="text-xs md:text-sm mt-2 italic text-gray-600">
                  Note : Le respect du droit d&apos;auteur et le résumé des données d&apos;entraînement restent obligatoires même en Open Source.
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
              const isAnswered = item.value !== null
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
                        {item.options.map(option => (
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
                        ))}
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
            {resultat === 'systemique' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-orange-600 mb-3">MODÈLE À RISQUE SYSTÉMIQUE</h3>
                <p className="text-lg text-gray-800">
                  Ce modèle d&apos;IA à usage général présente un risque systémique au sens du Règlement IA (Art. 51).
                </p>
              </div>
            )}
            {resultat === 'gpai-complet' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-600 mb-3">MODÈLE D&apos;IA À USAGE GÉNÉRAL (RÉGIME COMPLET)</h3>
                <p className="text-lg text-gray-800">
                  Ce modèle d&apos;IA à usage général est soumis au régime complet d&apos;obligations (Art. 53).
                </p>
              </div>
            )}
            {resultat === 'gpai-allege' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-indigo-600 mb-3">MODÈLE D&apos;IA À USAGE GÉNÉRAL (RÉGIME ALLÉGÉ / OPEN SOURCE)</h3>
                <p className="text-lg text-gray-800">
                  Ce modèle d&apos;IA à usage général bénéficie du régime allégé pour les modèles Open Source (Art. 53.2).
                </p>
              </div>
            )}
            {resultat === 'hors-categorie' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">HORS CATÉGORIE (MODÈLE ÉTROIT)</h3>
                <p className="text-lg text-gray-800 mb-4">
                  Ce modèle est une IA étroite/spécialisée.
                </p>
                <p className="text-base text-gray-700">
                  Il n&apos;est pas régulé en tant que &quot;Modèle&quot; par le Chapitre V du Règlement IA. Attention : s&apos;il est intégré dans un système à haut risque, le système sera régulé.
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

export default VerifierNiveauRisqueModelePage

