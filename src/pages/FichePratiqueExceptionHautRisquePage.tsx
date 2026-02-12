import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueExceptionHautRisquePage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>L&apos;exception de qualification &quot;Haut Risque&quot; (Article 6.3) — Fiche pratique | RIA Facile</title>
        <meta
          name="description"
          content="Guide pratique sur l'exception de qualification Haut Risque (Art. 6.3 AI Act) : conditions, documentation, enregistrement et articulation avec le RGPD."
        />
      </Helmet>

      <AdherentOnlyOverlay>
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
                FICHE PRATIQUE : L&apos;EXCEPTION DE QUALIFICATION &quot;HAUT RISQUE&quot; (ARTICLE 6.3)
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['6', '51'].map((article) => (
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
              L&apos;<strong>Article 6(3)</strong> est un mécanisme de filtre. Il permet de sortir un système de la catégorie &quot;Haut Risque&quot;
              même s&apos;il figure dans l&apos;<strong>Annexe III</strong> (ex: RH, Banque), à condition qu&apos;il ne pose pas de risque significatif.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Le principe :</h3>
                <p className="text-gray-700">
                  La présomption de &quot;Haut Risque&quot; est <strong>réfragable</strong> (contestable).
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Les 4 conditions ALTERNATIVES (Il en suffit d&apos;une) :</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>
                    <strong>(a) Tâche procédurale :</strong> L&apos;IA exécute une tâche étroite et définie (ex: détection de doublons).
                  </li>
                  <li>
                    <strong>(b) Amélioration :</strong> L&apos;IA améliore le résultat d&apos;une activité humaine préalable (ex: lissage de son).
                  </li>
                  <li>
                    <strong>(c) Détection de motifs :</strong> L&apos;IA détecte des patterns sans décider (ex: détection d&apos;anomalies réseau).
                  </li>
                  <li>
                    <strong>(d) Tâche préparatoire :</strong> L&apos;IA prépare une donnée pour une évaluation future (ex: traduction de CV).
                  </li>
                </ul>
              </div>
              <div className="border-l-4 border-red-500 pl-6 py-2 bg-red-50 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Le &quot;Kill Switch&quot; (Verrou Profilage) :</h3>
                <p className="text-gray-700">
                  L&apos;exception est <strong>annulée</strong> si le système effectue du profilage de personnes physiques (Art. 4 RGPD), c&apos;est-à-dire
                  une évaluation automatisée des caractéristiques personnelles. Dès lors qu&apos;un système fait du profilage, il est{' '}
                  <strong>toujours considéré comme Haut Risque</strong>, même s&apos;il remplit l&apos;une des 4 conditions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              2. LE CADRE EN BREF : LA FAUSSE TRANQUILLITÉ
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">L&apos;avantage :</h3>
                <p className="text-gray-700">
                  Échapper aux obligations lourdes (Marquage CE, Système de Qualité, Logs complexes).
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Le risque :</h3>
                <p className="text-gray-700">
                  C&apos;est une <strong>auto-évaluation</strong>. Si l&apos;autorité de contrôle juge que vous avez tort, votre système devient{' '}
                  <strong>illégal du jour au lendemain</strong> (mise sur le marché sans conformité).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. DÉCRYPTAGE : LA POSITION DU CEPD (EDPS)
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  L&apos;autonomie des régimes : AI Act vs RGPD (Vue EDPS Guidance)
                </h3>
                <p className="text-gray-700 mb-4">
                  Dans ses <strong>Guidelines for Risk Management (2025)</strong>, le CEPD met en garde contre une confusion des risques :
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                  <p className="text-gray-700 font-semibold mb-2">⚠️ Point critique :</p>
                  <p className="text-gray-700">
                    Une IA peut bénéficier de l&apos;exception Art. 6(3) (car elle est techniquement simple) mais nécessiter tout de même une{' '}
                    <strong>AIPD (RGPD Art. 35)</strong> car elle traite des données sensibles à grande échelle.
                  </p>
                  <p className="text-gray-700 mt-2">
                    <strong>Exemple :</strong> Un outil de tri de CV par mots-clés.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                    <li>
                      <strong>AI Act :</strong> Exception possible (Tâche procédurale).
                    </li>
                    <li>
                      <strong>RGPD :</strong> Risque élevé (Discrimination, accès à l&apos;emploi). L&apos;AIPD reste obligatoire.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. PLAN D&apos;ACTIONS (FORMAT MATRICIEL)
            </h2>
            <p className="text-gray-700 mb-6">
              Ce plan structure les actions selon les <strong>phases de vie du système</strong> et les{' '}
              <strong>rôles (Fournisseur vs Déployeur)</strong>.
            </p>

            {/* Tableau A */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">A. Phase de Qualification (BUILD)</h3>
              <p className="text-gray-700 mb-3">Concerne le <strong>Fournisseur</strong> (celui qui conçoit l&apos;IA).</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre &amp; Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Test du profilage</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 6 §3)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            <strong>Question bloquante :</strong> L&apos;IA évalue-t-elle la fiabilité, le comportement ou les attributs
                            d&apos;une personne ?
                          </li>
                          <li>Si OUI ➔ Exception interdite.</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Justification technique</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 6)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Rédiger une note prouvant que l&apos;IA ne fait qu&apos;une tâche accessoire (a, b, c ou d) et n&apos;influence pas
                            significativement la décision finale.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Mapping RGPD</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">EDPS Guidance</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Vérifier si une <strong>AIPD est requise</strong> malgré l&apos;exception AI Act.
                          </li>
                          <li>Ne pas baisser la garde sur la protection des données.</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tableau B */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">B. Phase de Documentation &amp; Enregistrement (COMPLIANCE)</h3>
              <p className="text-gray-700 mb-3">Concerne le <strong>Fournisseur</strong>.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre &amp; Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Justification écrite</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 6 §3)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Rédiger une <strong>note technique</strong> expliquant précisément quelle condition (a, b, c ou d) est remplie et
                            pourquoi le risque n&apos;est pas significatif.
                          </li>
                          <li>Tenir ce document à disposition des autorités.</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Enregistrement UE</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 51 &amp; 60)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            <strong>Obligatoire :</strong> S&apos;inscrire dans la base de données de l&apos;UE.
                          </li>
                          <li>Cocher la déclaration de dérogation Art. 6(3) et uploader la justification sommaire.</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Documentation</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Annexe IV)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Garder la documentation technique à disposition des autorités pendant <strong>10 ans</strong>, prouvant la validité de
                            l&apos;exception.
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tableau C */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">C. Phase d&apos;Acquisition (BUY)</h3>
              <p className="text-gray-700 mb-3">Concerne le <strong>Déployeur</strong> (Client).</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre &amp; Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Challenge fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 26)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Si un vendeur prétend &quot;Pas de Haut Risque&quot;, demandez la preuve de l&apos;enregistrement Art. 6(3).
                          </li>
                          <li>Vérifiez que l&apos;outil ne fait pas de profilage caché (ex: scoring de candidats).</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Clause de garantie</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Contrat</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Insérer une clause : &quot;Le fournisseur garantit la qualification juridique. En cas de requalification par
                            l&apos;autorité, il assume les frais de mise en conformité.&quot;
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <button
              onClick={() => setSourcesOuvertes(!sourcesOuvertes)}
              className="w-full flex items-center justify-between text-left mb-6 hover:opacity-80 transition-opacity"
            >
              <h2 className="text-2xl font-bold" style={{ color: '#774792' }}>
                5. SOURCES ET RÉFÉRENCES ACTUALISÉES (2025)
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
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Règlement (UE) 2024/1689 (AI Act)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 6 :</em> Classification &amp; Exception</li>
                    <li>• <em>Art. 51 :</em> Enregistrement</li>
                    <li>• <em>Annexe III :</em> Cas d&apos;usage</li>
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
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    EDPS (CEPD) – Guidance for Risk Management of AI Systems (11 Nov 2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Apport : Clarifie que la baisse du niveau de risque &quot;AI Act&quot; n&apos;entraîne pas automatiquement une baisse du niveau
                    de risque &quot;RGPD&quot;.
                  </p>
                  <a
                    href="https://www.edps.europa.eu/system/files/2025-11/2025-11-11_ai_risks_management_guidance_en.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien vers le document
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
                <div className="border-l-4 border-purple-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    Commission Européenne – Guidelines on Article 6(3)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Note :</strong> La Commission doit publier des exemples concrets pour les conditions a, b, c, d. (Document attendu, à
                    surveiller).
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Règlement (UE) 2016/679 (RGPD)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 4 :</em> Définition du profilage</li>
                    <li>• <em>Art. 35 :</em> AIPD</li>
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
                <div className="border-l-4 border-purple-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    Commission Européenne – Guidelines on Article 6(3)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Note :</strong> La Commission doit publier des lignes directrices détaillées avec des exemples concrets pour chaque
                    condition (a, b, c, d). À surveiller impérativement.
                  </p>
                </div>
                <div className="border-l-4 border-indigo-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">The Academic Guide to AI Act Compliance (2025)</h3>
                  <p className="text-gray-700 mb-2">
                    Apport : Analyse juridique de la notion de &quot;tâche procédurale étroite&quot; et de &quot;profilage&quot;.
                  </p>
                  <a
                    href="https://www.ucly.fr/wp-content/uploads/2025/11/the-academic-guide-to-ai-act-compliance-2025-ed.-mhodac-cp.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien vers le guide académique
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

        {/* Disclaimer */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Important :</strong> Cette fiche pratique peut impliquer des simplifications pour faciliter la
                compréhension. Une lecture attentive du texte officiel du Règlement IA est nécessaire pour une application complète et précise.
              </p>
              <p className="text-gray-700">
                Pour bénéficier d&apos;un accompagnement personnalisé par des experts,{' '}
                <Link to="/contact" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                  contactez-nous via le formulaire
                </Link>
                .
              </p>
            </div>
          </div>
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
      </AdherentOnlyOverlay>
    </div>
  )
}

export default FichePratiqueExceptionHautRisquePage

