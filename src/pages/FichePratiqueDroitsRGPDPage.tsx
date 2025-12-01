import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const FichePratiqueDroitsRGPDPage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Gestion des droits RGPD dans les systèmes d'IA — Fiche pratique | RIA Facile</title>
        <meta
          name="description"
          content="Guide pratique pour organiser et sécuriser la gestion des droits RGPD (accès, rectification, effacement, opposition) dans les systèmes d'IA, en cohérence avec le Règlement IA."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Bouton retour */}
        <Link
          to="/fiches-pratiques"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Retour aux fiches pratiques</span>
        </Link>

        {/* En-tête */}
        <div
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-4 md:p-8 mb-8 border-2"
          style={{ borderColor: '#774792' }}
        >
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-4xl shrink-0">📄</span>
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 break-words overflow-wrap-anywhere"
                style={{ color: '#774792' }}
              >
                FICHE PRATIQUE : GESTION DES DROITS RGPD DANS LES SYSTÈMES D'IA
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['10', '13', '86'].map((article) => (
                    <span
                      key={article}
                      className="inline-block text-sm font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200"
                    >
                      Article {article}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="prose prose-lg max-w-none">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              1. RAPPEL DES PRINCIPES FONDAMENTAUX
            </h2>
            <p className="text-gray-700 mb-4">
              La complexité technique d'une IA (Deep Learning, LLM) ne constitue <strong>pas une exemption</strong> au
              respect des droits des personnes.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Le défi de l'absorption :</h3>
                <p className="text-gray-700">
                  Une fois entraîné, un modèle d'IA ne stocke plus des &quot;données&quot; au sens classique
                  (lignes/colonnes), mais des paramètres (poids mathématiques). Pourtant, si le modèle a{' '}
                  <strong>mémorisé des données personnelles</strong>, les droits RGPD s'appliquent toujours.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">L'obligation de résultat :</h3>
                <p className="text-gray-700">
                  Le responsable de traitement doit mettre en place les mesures techniques pour{' '}
                  <strong>identifier, extraire ou supprimer</strong> la donnée d'un individu, que ce soit dans le jeu de
                  données d'entraînement ou dans le modèle lui-même.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              2. LE CADRE EN BREF
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-4">
              <p className="font-semibold text-gray-900 mb-2">L'enjeu Business & Conformité :</p>
              <p className="text-gray-700 mb-4">
                L'incapacité à honorer une <strong>demande de droit à l'oubli</strong> (Art. 17 RGPD) sur un modèle
                d'IA est un risque de non-conformité structurel. Si vous ne pouvez pas retirer une donnée d'un modèle
                sans le détruire, votre <strong>dette technique</strong> devient une <strong>dette juridique</strong>.
              </p>
              <p className="text-gray-700">
                Sur le plan business, cela pose la question de la <strong>pérennité des modèles</strong> : un modèle
                entraîné sur des données illégales ou non-maîtrisées peut devoir être intégralement supprimé (cf.
                jurisprudence <em>FTC</em> aux USA ou décisions du <em>Garante</em> en Italie).
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. LE DÉCRYPTAGE : DÉFIS TECHNIQUES & SOLUTIONS
            </h2>
            <p className="text-gray-700 mb-6">
              Le CEPD (EDPS) identifie deux risques majeurs qui bloquent l'exercice effectif des droits :
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">L'identification incomplète (Risk 1) :</h3>
                <p className="text-gray-700 mb-2">
                  Difficulté de <strong>localiser la donnée d'un individu</strong> spécifique dans des datasets non
                  structurés (images, texte brut, logs) ou de savoir si le modèle l'a &quot;apprise par cœur&quot;.
                </p>
                <p className="text-gray-700 text-sm italic">
                  <strong>Solution :</strong> indexation stricte et ajout de métadonnées (identifiants, timestamps,
                  origine) lors de la constitution des datasets.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">L'effacement impossible (Risk 2) :</h3>
                <p className="text-gray-700 mb-2">
                  Comment supprimer &quot;Mme Michu&quot; d'un réseau de neurones ?
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>
                    <strong>Machine Unlearning :</strong> techniques (encore émergentes) pour faire &quot;oublier&quot;
                    une donnée au modèle sans tout réentraîner.
                  </li>
                  <li>
                    <strong>Output Filtering :</strong> si l'effacement dans le modèle est impossible, bloquer la sortie
                    (l'inférence) contenant la donnée personnelle via des <strong>filtres en sortie</strong>.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. PLAN D'ACTIONS (MATRICE OPÉRATIONNELLE)
            </h2>

            {/* Phase 1 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                PHASE 1 : BUILD (Conception &amp; Entraînement)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                <em>Applicable si vous entraînez vos propres modèles.</em>
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Action Concrète
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Réf. Juridique
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Détails Opérationnels (Source EDPS)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Traçabilité &amp; Métadonnées
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Créer des index permettant de retrouver instantanément les fichiers sources contenant les
                        données d'une personne (Risk 1, mesure 1). Sans cela, le <strong>droit d'accès</strong> est
                        pratiquement impossible à exercer.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Stratégie de &quot;Machine Unlearning&quot;
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 17)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Évaluer la faisabilité technique du désapprentissage (exact ou approximatif). Si impossible,
                        prévoir des <strong>cycles de réentraînement</strong> fréquents pour purger les données
                        supprimées.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Outils de récupération (Retrieval Tools)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 20)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Développer des scripts permettant d'extraire les données d'entraînement dans un format lisible
                        et structuré pour répondre aux demandes de <strong>portabilité</strong>.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">PHASE 2 : BUY (Achat &amp; Intégration)</h3>
              <p className="text-gray-600 mb-4 italic">
                <em>Applicable pour l'achat de solutions IA tierces.</em>
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Action Concrète
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Réf. Juridique
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Détails Opérationnels (Source EDPS)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Clause de garantie des droits
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 28)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Le contrat doit obliger le fournisseur à <strong>aider le déployeur</strong> à répondre aux
                        demandes (ex. : supprimer une donnée du modèle SaaS sous 30 jours).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Test de &quot;Mémorisation&quot;
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Vérifier si le modèle a tendance à <strong>régurgiter des données d'entraînement</strong>{' '}
                        (overfitting). Utiliser des outils comme <strong>MemHunter</strong> (cité par le CEPD) pour
                        auditer le risque de fuite de données.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Vérification des filtres
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 5)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        S'assurer que le fournisseur dispose de mécanismes de{' '}
                        <strong>filtrage en sortie (output filtering)</strong> pour empêcher l'IA de générer des données
                        personnelles qu'elle aurait dû oublier.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">PHASE 3 : RUN (Opérations courantes)</h3>
              <p className="text-gray-600 mb-4 italic">
                <em>Applicable lors de la gestion des demandes utilisateurs.</em>
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Action Concrète
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Réf. Juridique
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Détails Opérationnels (Source EDPS)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Procédure Droit d'Opposition
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 21)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si un utilisateur s'oppose au traitement, s'assurer que ses données ne sont{' '}
                        <strong>plus réinjectées</strong> dans les futurs cycles d'entraînement (continuous learning).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Rectification des sorties (Output)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 16)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si le modèle génère une information{' '}
                        <strong>fausse ou diffamatoire sur une personne</strong> et qu'on ne peut pas modifier le
                        modèle rapidement : mettre en place une <strong>règle de post-traitement</strong> pour corriger
                        ou bloquer cette réponse spécifique.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Documentation de la réponse
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 12)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si l'effacement est <strong>techniquement impossible</strong>, documenter les raisons (efforts
                        disproportionnés) et proposer des <strong>mesures compensatoires</strong> (suppression des
                        données sources, filtrage strict, limitation d'usage).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5 - Sources */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <button
              onClick={() => setSourcesOuvertes(!sourcesOuvertes)}
              className="w-full flex items-center justify-between text-left mb-6 hover:opacity-80 transition-opacity"
            >
              <h2 className="text-2xl font-bold" style={{ color: '#774792' }}>
                5. SOURCES ET RÉFÉRENCES
              </h2>
              <svg
                className={`w-6 h-6 text-purple-600 transition-transform ${sourcesOuvertes ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                sourcesOuvertes ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-gray-700 mb-6">
                Pour approfondir ou justifier ces actions auprès de votre direction :
              </p>
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">1. EDPS (CEPD) Guidelines</h3>
                  <p className="text-gray-700 mb-2">
                    <em>Guidance for Risk Management of Artificial Intelligence systems</em> (11/11/2025). Voir
                    spécifiquement la <strong>Section 5.5 &quot;Data subject’s rights&quot;</strong> qui détaille les
                    risques d'identification incomplète et d'effacement impossible.
                  </p>
                  <a
                    href="https://www.edps.europa.eu/system/files/2025-11/2025-11-11_ai_risks_management_guidance_en.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien Document
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">2. Règlement (UE) 2016/679 (RGPD)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 15 à 22 :</em> Droits des personnes concernées.</li>
                    <li>• <em>Art. 12 :</em> Transparence et modalités de l'exercice des droits.</li>
                  </ul>
                  <a
                    href="https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32016R0679"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien EUR-Lex
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">3. Règlement (UE) 2024/1689 (AI Act)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 86 :</em> Droit à l'explication d'une décision individuelle.</li>
                    <li>• <em>Art. 10 :</em> Gouvernance des données.</li>
                    <li>• <em>Art. 13 :</em> Transparence et fourniture d'informations.</li>
                  </ul>
                  <a
                    href="/consulter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Consulter le règlement
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bouton retour en bas */}
        <div className="mt-8 text-center">
          <Link
            to="/fiches-pratiques"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour aux fiches pratiques</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FichePratiqueDroitsRGPDPage


