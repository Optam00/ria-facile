import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const FichePratiqueExactitudePage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Gérer l'exactitude (Accuracy) dans les systèmes IA — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la mise en conformité opérationnelle du principe d'exactitude dans les systèmes IA. Croisement RGPD et AI Act." />
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
                FICHE PRATIQUE : GÉRER L'EXACTITUDE ("ACCURACY") DANS LES SYSTÈMES IA
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['10', '15'].map((article) => (
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
              L'exactitude se joue sur deux tableaux juridiques distincts mais complémentaires :
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  L'approche "Droits des personnes" (RGPD, art. 5(1)(d)) :
                </h3>
                <p className="text-gray-700">
                  Toute donnée personnelle traitée doit être exacte. Le Responsable de Traitement (RT) doit garantir que les données sont correctes et, si nécessaire, rectifiées ou effacées.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  L'approche "Sécurité du produit" (AI Act, art. 10 & 15) :
                </h3>
                <p className="text-gray-700">
                  Pour les systèmes à haut risque, l'exactitude est une exigence technique. Le système doit être entraîné sur des données de qualité et maintenir un niveau de performance (métriques) constant pour éviter les risques de sécurité ou de biais.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              2. LE CADRE EN BREF
            </h2>
            <p className="text-gray-700 mb-4">
              L'exactitude n'est plus binaire ("vrai ou faux"). Le CEPD souligne que dans l'IA, l'exactitude est statistique.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-4">
              <p className="font-semibold text-gray-900 mb-2">Le constat :</p>
              <p className="text-gray-700 mb-4">
                Un modèle peut être globalement "performant" (98% de réussite) mais juridiquement "inexact" s'il échoue systématiquement sur une population spécifique ou s'il produit des résultats faux (hallucinations) sans recours possible.
              </p>
              <p className="font-semibold text-gray-900 mb-2">L'enjeu :</p>
              <p className="text-gray-700">
                Passer d'une obligation de résultat (la donnée est vraie) à une obligation de moyens renforcée (gouvernance des données, tests de robustesse et supervision humaine).
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. DÉCRYPTAGE OPÉRATIONNEL : LES 3 DIMENSIONS
            </h2>
            <p className="text-gray-700 mb-6">
              Le CEPD recommande de traiter l'exactitude à trois niveaux distincts :
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-3xl mb-3">1️⃣</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Input (Données d'entraînement)</h3>
                <p className="text-gray-700 text-sm">
                  La "matière première" est-elle fiable, représentative et sans biais ? <em>(AI Act Art. 10)</em>.
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
                <div className="text-3xl mb-3">2️⃣</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Processing (Le Modèle)</h3>
                <p className="text-gray-700 text-sm">
                  Le moteur statistique est-il robuste ? Résiste-t-il aux erreurs ? <em>(AI Act Art. 15)</em>.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-3xl mb-3">3️⃣</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Output (La Décision/Inférence)</h3>
                <p className="text-gray-700 text-sm">
                  Le résultat affiché est-il présenté comme une vérité ou une probabilité ? Peut-on le corriger ? <em>(RGPD Art. 16 & 22)</em>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. PLAN D'ACTIONS MATRICIEL
            </h2>
            <p className="text-gray-700 mb-6">
              Cette section distingue les actions selon que vous <strong>construisez</strong> l'IA (Fournisseur) ou que vous l'<strong>utilisez</strong> (Déployeur/RT), en précisant le cadre légal applicable.
            </p>

            {/* Phase A */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                A. Phase de Conception & Développement (BUILD)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                Cette phase concerne principalement le <strong>Fournisseur</strong> (celui qui entraîne le modèle) ou le <strong>RT</strong> qui développe une IA en interne.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle Principal</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre & Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails Opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Curation des Données (Data Governance)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 10)<br />
                        <strong>RGPD</strong> (Art. 5)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Vérifier la source et la fraîcheur des datasets.<br />
                        • Identifier et mitiger les biais (ex: sous-représentation de genre/ethnie).<br />
                        • <strong>Livrable :</strong> Fiche de traçabilité des données (Datasheet).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Définition des Métriques de "Vérité"</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Ne pas viser seulement l'<em>Accuracy</em> globale.<br />
                        • Tester la <em>Précision</em> et le <em>Rappel</em> par sous-groupes.<br />
                        • <strong>Livrable :</strong> Rapport de validation technique.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Design for Rectification</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 25)<br />
                        Privacy by Design
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Prévoir techniquement la possibilité d'exclure une donnée (Machine Unlearning) ou de forcer une correction en sortie.<br />
                        • Si impossible, documenter pourquoi (limite technique).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Documentation Technique</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 11)<br />
                        <strong>RGPD</strong> (Art. 30)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Documenter les choix de nettoyage des données (pourquoi telle donnée a été exclue ?).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase B */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                B. Phase d'Acquisition & Déploiement (BUY & SETUP)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                Cette phase concerne le <strong>Déployeur</strong> (l'entreprise qui achète/utilise l'IA) qui agit souvent comme <strong>Responsable de Traitement (RT)</strong>.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle Principal</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre & Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails Opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Due Diligence Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur (RT)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 28)<br />
                        <strong>AI Act</strong> (Art. 26)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Demander les métriques de performance au fournisseur.<br />
                        • L'IA a-t-elle été entraînée sur des données pertinentes pour <em>mon</em> contexte (ex: données FR vs US) ?
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Analyse d'Impact (AIPD/DPIA)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur (RT)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 35)<br />
                        <strong>AI Act</strong> (Art. 27)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Évaluer le risque d'inexactitude pour les personnes (ex: refus de crédit à tort).<br />
                        • Définir les mesures d'atténuation.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Configuration des Seuils</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 26)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Ne pas accepter les réglages par défaut. Définir le seuil de confiance (ex: "Si confiance &lt; 80%, ne pas afficher de résultat").
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase C */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                C. Phase d'Utilisation & Maintenance (RUN)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                Concerne le <strong>Déployeur</strong> au quotidien.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Rôle Principal</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre & Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails Opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Supervision Humaine (HITL)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 14)<br />
                        <strong>RGPD</strong> (Art. 22)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Former les opérateurs à ne pas faire une confiance aveugle à l'IA (Automation Bias).<br />
                        • L'humain doit avoir le dernier mot pour les décisions critiques.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Transparence & Output</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 13)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Indiquer clairement "Généré par IA".<br />
                        • Afficher le score de confiance si pertinent pour l'utilisateur.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Gestion du "Droit à la Rectification"</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur (RT)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 16)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Procédure critique :</strong> Si une personne conteste une décision/donnée IA :<br />
                        1. Vérifier manuellement.<br />
                        2. Corriger la décision (effet juridique).<br />
                        3. Mettre en place un filtre (patch) pour que l'IA ne répète pas l'erreur.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Monitoring de la Dérive (Drift)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. Post-Market)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Vérifier tous les X mois que le modèle est toujours exact sur les nouvelles données réelles.<br />
                        • Si dérive &gt; Seuil alerte : Arrêt ou demande de réentraînement au fournisseur.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Focus Risques */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span>
                <span style={{ color: '#774792' }}>Focus : Gestion des Risques (Niveaux)</span>
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li>
                  <strong className="text-gray-900">IA à Haut Risque</strong> (AI Act Annexe III - ex: RH, Scoring, Biométrie) : 
                  Toutes les actions ci-dessus sont <strong>obligatoires</strong>. Le non-respect de l'art. 10 (Données) ou 15 (Exactitude) est passible de lourdes sanctions.
                </li>
                <li>
                  <strong className="text-gray-900">IA à Risque Limité</strong> (ex: Chatbot service client) : 
                  Focus prioritaire sur la <strong>Transparence</strong> (Art. 50 AI Act) et le <strong>Droit à la rectification</strong> (RGPD). 
                  L'exigence de robustesse technique est moindre, mais l'impact sur l'image de marque reste fort.
                </li>
                <li>
                  <strong className="text-gray-900">GPAI (IA à usage général)</strong> : 
                  Le fournisseur a des obligations de documentation (Art. 53 AI Act), le déployeur doit gérer les risques d'hallucinations via l'humain.
                </li>
              </ul>
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
                  <em>Generative AI and other AI Risks management guidance</em> (11/11/2025). Focus sur la méthodologie de gestion des risques.
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
                  <li>• <em>Art. 10 :</em> Données et gouvernance des données.</li>
                  <li>• <em>Art. 15 :</em> Exactitude, robustesse et cybersécurité.</li>
                  <li>• <em>Art. 26 :</em> Obligations des déployeurs.</li>
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
                  <li>• <em>Art. 5(1)(d) :</em> Principe d'exactitude.</li>
                  <li>• <em>Art. 16 :</em> Droit de rectification.</li>
                  <li>• <em>Art. 22 :</em> Décision individuelle automatisée.</li>
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

export default FichePratiqueExactitudePage

