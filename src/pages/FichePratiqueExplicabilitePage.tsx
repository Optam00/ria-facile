import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const FichePratiqueExplicabilitePage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Explicabilité & Interprétabilité dans les systèmes IA — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la mise en conformité opérationnelle de l'explicabilité et l'interprétabilité dans les systèmes IA. Croisement RGPD et AI Act." />
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
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-4 md:p-8 mb-8 border-2" style={{ borderColor: '#774792' }}>
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-4xl shrink-0">📄</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 break-words overflow-wrap-anywhere" style={{ color: '#774792' }}>
                FICHE PRATIQUE : EXPLICABILITÉ & INTERPRÉTABILITÉ
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['13', '14', '86'].map((article) => (
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
              Selon le CEPD (EDPS), l'explicabilité et l'interprétabilité sont des conditions <strong>"sine qua non"</strong> pour opérer un système d'IA traitant des données personnelles.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  RGPD (Focus Droits) :
                </h3>
                <p className="text-gray-700">
                  Le responsable de traitement doit pouvoir expliquer la "logique sous-jacente" d'une décision automatisée. L'opacité totale ("Black Box") empêche l'exercice des droits de contestation et de rectification.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  AI Act (Focus Sécurité) :
                </h3>
                <p className="text-gray-700">
                  Pour les systèmes à haut risque, la transparence doit permettre aux déployeurs de comprendre les résultats pour exercer un contrôle humain effectif (Art. 14) et détecter les biais.
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
              <p className="text-gray-700">
                Un modèle inexpliqué est un <strong>passif juridique</strong> (non-conformité RGPD/AI Act) et un <strong>risque opérationnel</strong> (impossibilité de corriger des erreurs ou des biais). L'explicabilité n'est pas qu'une contrainte légale, c'est le levier de confiance nécessaire à l'adoption de l'outil par les métiers et les utilisateurs finaux. Sans explicabilité, pas d'auditabilité.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. LE DÉCRYPTAGE : CONCEPTS & DÉFIS
            </h2>
            <p className="text-gray-700 mb-6">
              Le CEPD distingue deux niveaux de compréhension souvent confondus :
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Interprétabilité ("White Box" - Niveau Expert)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Capacité à comprendre la mécanique interne du modèle (poids, paramètres). C'est un enjeu pour les Data Scientists et les auditeurs.
                </p>
                <p className="text-gray-600 text-xs italic">
                  <strong>Défi :</strong> Plus le modèle est performant (Deep Learning), moins il est nativement interprétable.
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Explicabilité ("Post-hoc" - Niveau Utilisateur)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Capacité à justifier une décision précise dans un langage clair (ex: "Refus car revenu &lt; seuil"). C'est un enjeu pour le DPO et le client final.
                </p>
                <p className="text-gray-600 text-xs italic">
                  <strong>Solution :</strong> Utilisation de méthodes comme LIME ou SHAP.
                </p>
              </div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Le Risque (EDPS Risk 1) :</p>
              <p className="text-gray-700">
                Le déploiement de systèmes "boîte noire" où ni le développeur ni l'utilisateur ne comprennent la génération des sorties, rendant impossible la détection de "hallucinations" ou de discriminations.
              </p>
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
                PHASE 1 : BUILD (Conception & Développement)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                <em>Pour les modèles développés en interne.</em>
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action Concrète</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Réf. Juridique</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails Opérationnels (Source EDPS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Arbitrage Complexité / Interprétabilité</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 13)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Privilégier des modèles simples (arbres de décision, régression) si la performance est équivalente. Si un modèle complexe est requis, justifier ce choix dans la documentation technique.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Implémentation XAI (Explainable AI)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 22)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Intégrer nativement des librairies d'explicabilité comme <strong>LIME</strong> ou <strong>SHAP</strong> (cités par le CEPD) pour générer des cartes de chaleur ou des poids de décision intelligibles.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Documentation de l'architecture</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 11)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Documenter non seulement comment le modèle fonctionne, mais aussi ses <strong>limitations</strong> connues et les cas où il ne doit pas être utilisé (Risk 1, mesure 1).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                PHASE 2 : BUY (Achat & Appel d'offres)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                <em>Pour l'acquisition de solutions SaaS / Progiciels.</em>
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action Concrète</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Réf. Juridique</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails Opérationnels (Source EDPS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Critère "No Black Box"</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 26)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Exiger du fournisseur une documentation sur la logique du modèle et la provenance des données d'entraînement. <strong>Refuser les solutions qui invoquent le "secret des affaires" pour masquer une opacité totale.</strong>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Validation des métriques</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Demander les rapports de validation statistique (Accuracy, F1 Score) et tester le modèle sur des cas limites (Edge cases) pour vérifier la cohérence des explications fournies.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                PHASE 3 : RUN (Utilisation & Maintenance)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                <em>Pour le déploiement opérationnel.</em>
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action Concrète</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Réf. Juridique</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails Opérationnels (Source EDPS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Formation au Biais d'Interprétation</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 4)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Former les équipes à ne pas sur-interpréter les résultats (Risk 5 EDPS). Un score de probabilité de 80% ne doit pas être pris pour une vérité absolue sans vérification humaine.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Procédure de réponse aux droits</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Art. 86 AI Act</strong> / <strong>RGPD</strong>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Mettre en place un processus pour extraire une explication "lisible" en cas de demande d'un individu impacté par une décision.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Monitoring de la dérive (Drift)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 26)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Surveiller la qualité des données en entrée. Une dérive des données (Data Drift) invalide l'explicabilité initiale et nécessite un réentraînement (Risk 1 Accuracy).
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
              className={`overflow-hidden transition-all duration-300 ${sourcesOuvertes ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-gray-700 mb-6">
                Pour approfondir ou justifier ces actions auprès de votre direction :
              </p>
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    1. EDPS (CEPD) Guidelines
                  </h3>
                  <p className="text-gray-700 mb-2">
                    <em>Guidance for Risk Management of Artificial Intelligence systems</em> (11/11/2025). Document de référence pour l'analyse des risques techniques (Section 4 sur l'explicabilité).
                  </p>
                  <a 
                    href="https://www.edps.europa.eu/system/files/2025-11/2025-11-11_ai_risks_management_guidance_en.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien Document
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    2. Règlement (UE) 2024/1689 (AI Act)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 13 :</em> Transparence et fourniture d'informations aux déployeurs.</li>
                    <li>• <em>Art. 86 :</em> Droit à l'explication des décisions individuelles.</li>
                    <li>• <em>Art. 14 :</em> Contrôle humain.</li>
                  </ul>
                  <a 
                    href="/consulter" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Consulter le règlement
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    3. Règlement (UE) 2016/679 (RGPD)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 13-15 :</em> Informations à fournir et droit d'accès (logique du traitement).</li>
                    <li>• <em>Art. 22 :</em> Droit de ne pas faire l'objet d'une décision fondée exclusivement sur un traitement automatisé.</li>
                  </ul>
                  <a 
                    href="https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32016R0679" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien EUR-Lex
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                <strong className="text-gray-900">Important :</strong> Cette fiche pratique peut impliquer des simplifications pour faciliter la compréhension. Une lecture attentive du texte officiel du Règlement IA est nécessaire pour une application complète et précise.
              </p>
              <p className="text-gray-700">
                Pour bénéficier d'un accompagnement personnalisé par des experts,{' '}
                <Link to="/contact" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                  contactez-nous via le formulaire
                </Link>.
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
    </div>
  )
}

export default FichePratiqueExplicabilitePage

