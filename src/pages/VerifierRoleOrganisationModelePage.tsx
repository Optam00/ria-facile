import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

type RoleResultat =
  | 'fournisseur-modele'
  | 'fournisseur-en-aval'
  | 'mandataire-modele'
  | 'deployeur-systeme'
  | 'indetermine'
  | null

const VerifierRoleOrganisationModelePage: React.FC = () => {
  const [openRefs, setOpenRefs] = useState(false)

  const [q1, setQ1] = useState<number | null>(null) // MODEL_PROVIDER
  const [q2, setQ2] = useState<number | null>(null) // DOWNSTREAM_PROVIDER
  const [q3, setQ3] = useState<number | null>(null) // MODEL_AUTH_REP
  const [q4, setQ4] = useState<number | null>(null) // MODEL_END_USER

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([1]))

  const toggleQuestion = (id: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAnswer = (id: number, value: number) => {
    if (id === 1) {
      setQ1(value)
      if (value === 1) return
      setExpandedQuestions((prev) => new Set([...prev, 2]))
    } else if (id === 2) {
      setQ2(value)
      if (value === 1) return
      setExpandedQuestions((prev) => new Set([...prev, 3]))
    } else if (id === 3) {
      setQ3(value)
      if (value === 1) return
      setExpandedQuestions((prev) => new Set([...prev, 4]))
    } else if (id === 4) {
      setQ4(value)
    }
  }

  const resultat: RoleResultat = useMemo(() => {
    if (q1 === 1) return 'fournisseur-modele'
    if (q2 === 1) return 'fournisseur-en-aval'
    if (q3 === 1) return 'mandataire-modele'
    if (q4 === 1) return 'deployeur-systeme'
    if (q4 === 2) return 'indetermine'
    return null
  }, [q1, q2, q3, q4])

  const toutesQuestionsRepondues = useMemo(() => {
    if (q1 === null) return false
    if (q1 === 1) return true
    if (q2 === null) return false
    if (q2 === 1) return true
    if (q3 === null) return false
    if (q3 === 1) return true
    if (q4 === null) return false
    return true
  }, [q1, q2, q3, q4])

  const questions = [
    {
      id: 1,
      q: 'Avez-vous développé ce modèle (ou fait développer) et le mettez-vous sur le marché sous votre propre nom ou marque ?',
      p: "Inclut la publication (Hugging Face, API) ou la vente. Si vous partez d'un modèle existant (ex: Llama 3), que vous le modifiez/fine-tune et le redistribuez comme un nouveau modèle autonome sous votre marque, vous êtes aussi fournisseur.",
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
      q: "Intégrez-vous ce modèle d'IA dans un système d'IA (ou une application) que vous fournissez ensuite sous votre nom ?",
      p: "Vous ne vendez pas le modèle brut : il est le moteur d'un logiciel, chatbot ou outil que vous commercialisez ou déployez.",
      options: [
        { value: 1, label: 'Oui' },
        { value: 2, label: 'Non' }
      ],
      value: q2,
      setValue: (v: number) => handleAnswer(2, v),
      condition: q1 === 2
    },
    {
      id: 3,
      q: "Êtes-vous établi dans l'UE et mandaté par un fournisseur de modèle hors UE pour agir en son nom ?",
      p: 'Art. 54 : les fournisseurs de modèles d’IA à usage général établis hors UE doivent désigner un mandataire dans l’UE.',
      options: [
        { value: 1, label: 'Oui' },
        { value: 2, label: 'Non' }
      ],
      value: q3,
      setValue: (v: number) => handleAnswer(3, v),
      condition: q2 === 2
    },
    {
      id: 4,
      q: "Utilisez-vous simplement le modèle via une interface existante (ex: ChatGPT, Gemini) sans l'intégrer ni le modifier ?",
      p: '',
      options: [
        { value: 1, label: 'Oui' },
        { value: 2, label: 'Non (autre situation)' }
      ],
      value: q4,
      setValue: (v: number) => handleAnswer(4, v),
      condition: q3 === 2
    }
  ]

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Déterminer le rôle de mon organisation (modèle d&apos;IA) — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>
            Déterminer le rôle de mon organisation concernant un modèle d&apos;IA
          </h1>
          <p className="text-gray-600">
            Identifiez si vous êtes Fournisseur de modèle d&apos;IA à usage général, Fournisseur en aval, Mandataire ou simple utilisateur d&apos;un système.
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
                  « <strong>Fournisseur</strong> » : une personne [...] qui développe ou fait développer un système d’IA ou un <strong>modèle d’IA à usage général</strong> et le met sur le marché [...] sous son propre nom ou sa propre marque.
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 3 (68) du RIA (Définition Fournisseur en aval) :</div>
                <div className="text-xs md:text-sm">
                  « <strong>Fournisseur en aval</strong> » : un fournisseur d’un système d’IA [...] qui intègre un modèle d’IA, que le modèle d’IA soit fourni par lui-même ou non, et verticalement intégré ou fourni par une autre entité.
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 54 du RIA (Mandataire pour modèles) :</div>
                <div className="text-xs md:text-sm">
                  « Avant de mettre un modèle d’IA à usage général sur le marché de l’Union, les fournisseurs établis dans des pays tiers désignent, par mandat écrit, un <strong>mandataire</strong> établi dans l’Union. »
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Article 53 (1) (b) du RIA (Obligation vers l&apos;aval) :</div>
                <div className="text-xs md:text-sm">
                  « Les fournisseurs de modèles d’IA à usage général [...] mettent à disposition des informations [...] à l’intention des fournisseurs de systèmes d’IA qui envisagent d’intégrer le modèle [...] pour [leur] permettre [...] de se conformer aux obligations qui leur incombent. »
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
                      {isAnswered && <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Répondu</span>}
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
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-2" style={{ borderColor: '#774792' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: '#774792' }}>
              Résultat
            </h2>

            {resultat === 'fournisseur-modele' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-700 mb-3">FOURNISSEUR DE MODÈLE D&apos;IA À USAGE GÉNÉRAL</h3>
                <p className="text-lg text-gray-800">
                  Vous mettez un modèle d&apos;IA à usage général sur le marché sous votre nom ou votre marque.
                </p>
              </div>
            )}

            {resultat === 'fournisseur-en-aval' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-indigo-700 mb-3">FOURNISSEUR EN AVAL</h3>
                <p className="text-lg text-gray-800">
                  Vous intégrez le modèle dans un système d&apos;IA que vous fournissez sous votre nom.
                </p>
              </div>
            )}

            {resultat === 'mandataire-modele' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-3">MANDATAIRE (MODÈLE)</h3>
                <p className="text-lg text-gray-800">
                  Vous représentez un fournisseur de modèle d&apos;IA à usage général établi hors UE, sur mandat écrit.
                </p>
              </div>
            )}

            {resultat === 'deployeur-systeme' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-amber-700 mb-3">DÉPLOYEUR DE SYSTÈME</h3>
                <p className="text-lg text-gray-800">
                  Vous utilisez un système qui intègre un modèle d&apos;IA existant, sans intervenir sur le modèle lui-même.
                </p>
              </div>
            )}

            {resultat === 'indetermine' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">SITUATION À PRÉCISER</h3>
                <p className="text-lg text-gray-800">
                  Votre situation ne correspond pas clairement à un rôle défini. Consultez un juriste pour clarifier vos obligations.
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

export default VerifierRoleOrganisationModelePage

