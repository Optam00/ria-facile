import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

type RoleResultat = 'fournisseur-initial' | 'fournisseur-requalifie' | 'deployeur' | 'importateur' | 'distributeur' | 'mandataire' | null

const VerifierRoleOrganisationPage: React.FC = () => {
  const [openRefs, setOpenRefs] = useState<boolean>(false)

  // États des réponses
  const [q1, setQ1] = useState<number | null>(null) // ROLE_BRANDING
  const [q2, setQ2] = useState<number | null>(null) // ROLE_MODIFICATION
  const [q3, setQ3] = useState<number | null>(null) // ROLE_USAGE
  const [q4, setQ4] = useState<number | null>(null) // ROLE_INTERMEDIARY

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([1]))

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(idx)) newSet.delete(idx)
      else newSet.add(idx)
      return newSet
    })
  }

  const handleAnswer = (questionId: number, value: number) => {
    if (questionId === 1) {
      setQ1(value)
      // Si fournisseur initial, arrêt
      if (value === 1) return
      // Sinon passer à Q2
      setExpandedQuestions((prev) => new Set([...prev, 2]))
    } else if (questionId === 2) {
      setQ2(value)
      // Si requalification (1,2,3) arrêt, sinon Q3
      if ([1, 2, 3].includes(value)) return
      setExpandedQuestions((prev) => new Set([...prev, 3]))
    } else if (questionId === 3) {
      setQ3(value)
      // Si déployeur (oui) arrêt, sinon Q4
      if (value === 1) return
      setExpandedQuestions((prev) => new Set([...prev, 4]))
    } else if (questionId === 4) {
      setQ4(value)
    }
  }

  const resultat: RoleResultat = useMemo(() => {
    if (q1 === 1) return 'fournisseur-initial'
    if (q2 !== null && [1, 2, 3].includes(q2)) return 'fournisseur-requalifie'
    if (q3 === 1) return 'deployeur'
    if (q4 === 1) return 'importateur'
    if (q4 === 2) return 'distributeur'
    if (q4 === 3) return 'mandataire'
    return null
  }, [q1, q2, q3, q4])

  const toutesQuestionsRepondues = useMemo(() => {
    if (q1 === null) return false
    if (q1 === 1) return true
    if (q2 === null) return false
    if ([1, 2, 3].includes(q2!)) return true
    if (q3 === null) return false
    if (q3 === 1) return true
    if (q4 === null) return false
    return true
  }, [q1, q2, q3, q4])

  const questions = [
    {
      id: 1,
      q: "Votre organisation a-t-elle développé le système (ou l'a-t-elle fait développer) pour le mettre sur le marché ou le mettre en service sous son propre nom ou sa propre marque ?",
      p: "Inclut le white labelling (vous vendez sous votre marque), le développement interne pour usage propre (mise en service sous votre nom), et les fabricants de produits intégrant une IA sous leur marque.",
      options: [
        { value: 1, label: 'Oui' },
        { value: 2, label: 'Non' }
      ],
      value: q1,
      setValue: (v: number) => handleAnswer(1, v),
      condition: true
    },
    {
      id: 2,
      q: "Avez-vous réalisé l'une de ces actions sur un système d'IA existant (fourni par un tiers) ?",
      p: '',
      options: [
        { value: 1, label: 'Modification substantielle d’un système d’IA à haut risque (changement technique non prévu par le fournisseur initial).' },
        { value: 2, label: 'Modification de la destination (usage prévu) qui fait basculer le système en haut risque.' },
        { value: 3, label: 'Apposition de votre nom ou marque sur un système d’IA à haut risque existant (sans modification technique).' },
        { value: 4, label: 'Aucune de ces actions.' }
      ],
      value: q2,
      setValue: (v: number) => handleAnswer(2, v),
      condition: q1 === 2
    },
    {
      id: 3,
      q: "Utilisez-vous le système d'IA sous votre propre autorité dans le cadre de vos activités professionnelles ?",
      p: "Le déployeur est l'entité (entreprise, école, administration) qui décide d'utiliser l'IA. Un usage purement personnel et non professionnel n'entre pas dans la définition de déployeur.",
      options: [
        { value: 1, label: 'Oui (usage professionnel sous mon autorité).' },
        { value: 2, label: 'Non (simple transit, ou usage strictement personnel).' }
      ],
      value: q3,
      setValue: (v: number) => handleAnswer(3, v),
      condition: q2 === 4
    },
    {
      id: 4,
      q: 'Quelle est votre fonction dans la chaîne de distribution ?',
      p: '',
      options: [
        { value: 1, label: "Importateur : établi dans l'UE, je mets sur le marché de l'UE un système d'IA portant le nom d'une personne hors UE." },
        { value: 2, label: "Distributeur : je fais partie de la chaîne d'approvisionnement (hors fournisseur/importateur) et je mets un système d'IA à disposition sur le marché de l'UE." },
        { value: 3, label: "Mandataire : j'ai reçu un mandat écrit d'un fournisseur hors UE pour effectuer des tâches de conformité en son nom." }
      ],
      value: q4,
      setValue: (v: number) => handleAnswer(4, v),
      condition: q3 === 2
    }
  ]

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer le rôle de mon organisation — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Déterminer le rôle de mon organisation concernant un système d&apos;IA
          </h1>
          <p className="text-gray-600">
            Identifiez si vous êtes Fournisseur, Déployeur, Importateur, Distributeur ou Mandataire au sens du Règlement IA.
          </p>
        </div>

        {/* Références utiles */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setOpenRefs((v) => !v)}
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
                <div className="font-semibold mb-1">Article 3 (3) du RIA (Définition Fournisseur) :</div>
                <div className="text-xs md:text-sm">
                  « <strong>Fournisseur</strong> » : une personne physique ou morale [...] qui développe ou fait développer un système d’IA [...] et le met sur le marché ou met le système d’IA en service <strong>sous son propre nom ou sa propre marque</strong>, à titre onéreux ou gratuit. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 3 (4) du RIA (Définition Déployeur) :</div>
                <div className="text-xs md:text-sm">
                  « <strong>Déployeur</strong> » : une personne [...] utilisant <strong>sous sa propre autorité</strong> un système d’IA, sauf lorsque ce système est utilisé dans le cadre d’une activité personnelle à caractère non professionnel. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 25 (1) du RIA (Requalification en Fournisseur) :</div>
                <div className="text-xs md:text-sm">
                  « Tout distributeur, importateur, déployeur ou autre tiers est considéré comme un fournisseur [...] s'il : a) commercialise sous son propre nom ou sa propre marque un système d’IA à haut risque [...] ; b) apporte une <strong>modification substantielle</strong> à un système d’IA à haut risque [...] ; c) modifie la <strong>destination</strong> d’un système d’IA [...] de telle manière que le système d’IA concerné devient un système d’IA à haut risque. »
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questionnaire */}
        <div className="bg-white rounded-2xl shadow divide-y">
          {questions
            .filter((q) => q.condition !== false)
            .map((item) => {
              const isExpanded = expandedQuestions.has(item.id)
              const isAnswered = item.value !== null
              return (
                <div key={item.id} className="border-b last:border-b-0">
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-purple-600">Question {item.id}</span>
                      {isAnswered && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>
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
                  {isExpanded && (
                    <div className="px-5 pb-5 transition-all duration-300 ease-in-out">
                      <div className="text-base font-medium text-gray-900 mb-3">{item.q}</div>
                      {item.p && (
                        <div className="text-sm text-gray-600 bg-[#f3f1ff] border border-[#f3f1ff] rounded-xl p-4 mb-4">
                          {item.p}
                        </div>
                      )}
                      <div className="space-y-3">
                        {item.options.map((option) => (
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
          <div
            className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-2"
            style={{ borderColor: '#774792' }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#774792' }}>
              Résultat
            </h2>

            {resultat === 'fournisseur-initial' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-700 mb-3">FOURNISSEUR (PROVIDER)</h3>
                <p className="text-lg text-gray-800">
                  Vous mettez le système d&apos;IA sur le marché ou en service sous votre nom ou votre marque. Si vous l&apos;utilisez aussi en interne, vous cumulez les statuts de Fournisseur et de Déployeur.
                </p>
              </div>
            )}

            {resultat === 'fournisseur-requalifie' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-orange-700 mb-3">FOURNISSEUR (REQUALIFICATION ART. 25)</h3>
                <p className="text-lg text-gray-800">
                  Vos actions (modification substantielle, changement de destination ou rebranding) vous font devenir Fournisseur au sens de l&apos;article 25.
                </p>
              </div>
            )}

            {resultat === 'deployeur' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-indigo-700 mb-3">DÉPLOYEUR</h3>
                <p className="text-lg text-gray-800">
                  Vous utilisez le système d&apos;IA sous votre propre autorité dans un cadre professionnel.
                </p>
              </div>
            )}

            {resultat === 'importateur' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-3">IMPORTATEUR</h3>
                <p className="text-lg text-gray-800">
                  Vous mettez sur le marché de l&apos;UE un système d&apos;IA au nom d&apos;un acteur établi hors UE.
                </p>
              </div>
            )}

            {resultat === 'distributeur' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cyan-700 mb-3">DISTRIBUTEUR</h3>
                <p className="text-lg text-gray-800">
                  Vous mettez un système d&apos;IA à disposition sur le marché de l&apos;UE dans la chaîne d&apos;approvisionnement (hors fournisseur/importateur).
                </p>
              </div>
            )}

            {resultat === 'mandataire' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-teal-700 mb-3">MANDATAIRE</h3>
                <p className="text-lg text-gray-800">
                  Vous agissez sur mandat écrit d&apos;un fournisseur hors UE pour réaliser des tâches de conformité en son nom.
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

export default VerifierRoleOrganisationPage

