import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueRMSPage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Le système de gestion des risques (RMS) — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la mise en place et la gestion du système de gestion des risques (RMS) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act." />
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
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-4 md:p-8 mb-8 border-2" style={{ borderColor: '#774792' }}>
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-4xl shrink-0">📄</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 break-words overflow-wrap-anywhere" style={{ color: '#774792' }}>
                FICHE PRATIQUE : LE SYSTÈME DE GESTION DES RISQUES (RMS)
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['9', '16', '26', '27'].map((article) => (
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
              Le <strong>Risk Management System (RMS)</strong> est la colonne vertébrale de la conformité IA. Selon les guidelines 2025 du CEPD (EDPS), il doit
              s'aligner sur la norme <strong>ISO 31000:2018</strong>.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Approche Holistique :
                </h3>
                <p className="text-gray-700">
                  Le RMS ne traite pas que les bugs techniques. Il doit couvrir les risques pour la <strong>santé</strong>, la
                  <strong> sécurité</strong> et les <strong>droits fondamentaux</strong> (non-discrimination, vie privée, liberté d'expression, etc.).
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Cycle de vie continu :
                </h3>
                <p className="text-gray-700">
                  Le RMS démarre à la <strong>conception</strong> et ne s'arrête qu'au <strong>retrait</strong> du système du marché. Il doit être mis à jour en
                  continu tout au long du cycle de vie (Art. 9 §2 AI Act).
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Double périmètre :
                </h3>
                <p className="text-gray-700">
                  • <strong>AI Act (Art. 9)</strong> : RMS obligatoire et formalisé pour les <strong>Systèmes d'IA à Haut Risque (SIA-HR)</strong>.<br />
                  • <strong>RGPD (Art. 24 &amp; 32)</strong> : une gestion des risques est requise pour <strong>toute</strong> IA traitant des données personnelles,
                  même si elle n'est pas &quot;Haut Risque&quot; au sens de l'AI Act.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Périmètre d'application :</p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>✅ Concerne (AI Act – RMS formalisé) :</strong> Les <strong>Systèmes d'IA à Haut Risque (SIA-HR)</strong> visés par l'Art. 6 et l'Annexe III (ex:
                  Recrutement, Santé, Justice, Biométrie, Services publics essentiels).
                </p>
                <p>
                  <strong>ℹ️ RGPD :</strong> Une <strong>gestion des risques</strong> (Art. 24 &amp; 32) reste attendue pour toute IA traitant des données
                  personnelles, y compris les IA à risque limité.
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
                Le RMS est le &quot;moteur&quot; de la conformité : sans lui, pas de marquage CE pour les SIA-HR. Pour le secteur public et les
                entreprises régulées, c'est la preuve de la maîtrise de l'outil. Une gestion des risques défaillante expose à des sanctions
                massives (jusqu'à 35M€) et, selon l'EDPS, à une interdiction d'exploitation par les autorités de contrôle.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. LE DÉCRYPTAGE
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Le concept clé : Risque inhérent vs Risque résiduel
                </h3>
                <p className="text-gray-700 mb-4">
                  La méthodologie ISO 31000 (reprise par l'EDPS) distingue :<br />
                  • Le <strong>risque inhérent</strong> : niveau de risque avant contrôle (lié à la nature même du système).<br />
                  • Le <strong>risque résiduel</strong> : risque restant après mise en place des mesures de maîtrise.<br />
                  Le <strong>fournisseur</strong> gère le risque inhérent et livre un système avec un risque résiduel documenté ; le
                  <strong> déployeur</strong> doit ensuite gérer ce risque résiduel dans son propre contexte (organisation, processus, supervision).
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Le défi de la "Boucle de Rétroaction" (Feedback Loop)
                </h3>
                <p className="text-gray-700">
                  Le RMS n'est pas statique. Le déployeur a l'obligation de remonter les données de performance et les incidents au fournisseur (Art. 26). Le fournisseur doit utiliser ces données pour mettre à jour son RMS (Art. 61). Sans cette boucle, le système devient non-conforme avec le temps (dérive du modèle).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. LE PLAN D'ACTIONS (FORMAT MATRICIEL)
            </h2>
            <p className="text-gray-700 mb-6">
              Ce plan d'actions suit la structure <strong>BUILD (Fournisseur)</strong> → <strong>BUY (Acquisition par le déployeur)</strong> →
              <strong> RUN (Utilisation &amp; suivi)</strong>, en intégrant la méthode ISO 31000 (Source → Événement → Conséquence → Contrôle).
            </p>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2"><strong>Légende :</strong></p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>🟢 <strong>FOURNISSEUR</strong> (Éditeur du SIA-HR)</span>
                <span>🔵 <strong>DÉPLOYEUR</strong> (Utilisateur du SIA-HR)</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Phase</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Acteur Responsable</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Actions Concrètes à mener</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Référence</th>
                  </tr>
                </thead>
                <tbody>
                  {/* BUILD – Fournisseur */}
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>A. BUILD (Conception)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Cartographie des Risques (ISO 31000)</strong><br />
                      Identifier les risques en suivant la chaîne <strong>Source → Événement → Conséquence → Contrôle</strong>
                      (ex : Dataset biaisé → Score de crédit défavorable pour les femmes → Discrimination → Rééquilibrage + supervision humaine).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 9 (2) AI Act</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Gouvernance des Données (Data Quality)</strong><br />
                      Auditer les jeux de données pour la représentativité, les biais et la qualité. Documenter la provenance et les
                      limites (EDPS focus).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 10 AI Act</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Tests de Robustesse &amp; Cybersécurité</strong><br />
                      Réaliser des tests de type <em>red teaming</em> : data poisoning, model inversion, attaques adverses. Documenter
                      les risques résiduels acceptés.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 15 AI Act</td>
                  </tr>

                  {/* BUY – Acquisition */}
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>B. BUY (Acquisition / Procurement)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Audit du RMS Fournisseur</strong><br />
                      Demander la documentation du RMS (métriques de performance, scénarios de risque, risques résiduels). Refuser
                      les solutions &quot;boîte noire&quot; sans information sur les risques.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 AI Act</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Vérification des Métriques</strong><br />
                      Examiner les métriques clés (Accuracy, F1, taux d'erreur par sous-groupes) et demander des tests spécifiques
                      dans votre contexte (données de test internes).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">EDPS – Annexes tests RMS</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Intégration contractuelle</strong><br />
                      Inclure des clauses obligeant le fournisseur à signaler toute nouvelle faille ou biais, à corriger le système et à
                      mettre à jour la documentation du RMS (post-market).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 28 RGPD &amp; 26 AI Act</td>
                  </tr>

                  {/* RUN – Utilisation */}
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>C. RUN (Utilisation &amp; Suivi)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Analyses d'Impact (FRIA / AIPD)</strong><br />
                      Utiliser les éléments du RMS fournisseur comme intrants pour :<br />
                      • une <strong>AIPD RGPD</strong> (Art. 35) ;<br />
                      • une <strong>FRIA AI Act</strong> (Art. 27) pour les déployeurs concernés (secteur public, banque, assurance...).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 AI Act &amp; 35 RGPD</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Mesures organisationnelles</strong><br />
                      Mettre en place les contrôles humains nécessaires (principe des 4 yeux, procédures de revue, formation au biais
                      d'automatisation) pour gérer le risque résiduel.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14, 26 &amp; 29 AI Act</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 / 🔵 <strong>FOURNISSEUR &amp; DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Boucle de rétroaction (Feedback Loop)</strong><br />
                      • Déployeur : surveiller les incidents (biais, Data Drift) et les remonter.<br />
                      • Fournisseur : mettre à jour le RMS et, si nécessaire, le système (correctifs, retrait partiel ou complet).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 (5) &amp; 61 AI Act</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span>
                <span style={{ color: '#774792' }}>Conseil de l'expert (Vue EDPS)</span>
              </h3>
              <p className="text-gray-700">
                Pour les acteurs publics et les entités soumises à la FRIA : Ne traitez pas la FRIA (AI Act) et l'AIPD (RGPD) en silos. L'EDPS recommande une approche unifiée. Utilisez la méthodologie de l'AIPD comme socle et élargissez-la aux autres droits fondamentaux (liberté d'expression, non-discrimination) pour couvrir l'exigence FRIA.
              </p>
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
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    Règlement (UE) 2024/1689 (AI Act)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 9 :</em> Système de gestion des risques</li>
                    <li>• <em>Art. 27 :</em> Analyse d'impact sur les droits fondamentaux</li>
                    <li>• <em>Art. 16 :</em> Obligations Fournisseur</li>
                    <li>• <em>Art. 26 :</em> Obligations Déployeur</li>
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
                    Règlement (UE) 2016/679 (RGPD)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    EDPS Guidance
                  </h3>
                  <p className="text-gray-700 mb-2">
                    <em>AI Risks Management Guidance (Nov 2025)</em> - Focus sur l'intersection entre gestion des risques IA et droits fondamentaux.
                  </p>
                  <a 
                    href="https://www.edps.europa.eu/system/files/2025-11/2025-11-11_ai_risks_management_guidance_en.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien vers le document
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    The Academic Guide to AI Act Compliance (2025)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Chapitre 5 :</em> Risk Management System Under The AI Act (Amélie Favreau)</li>
                    <li>• <em>Chapitre 11 :</em> Fundamental Rights Impact Assessment (M. Ho-Dac & L. Xenou)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-purple-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    Norme ISO 31000:2018
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Standard international de référence pour la gestion des risques, explicitement mobilisé par l'EDPS pour structurer
                    le RMS : <em>Source du risque → Événement → Conséquence → Contrôle</em>.
                  </p>
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
      </AdherentOnlyOverlay>
    </div>
  )
}

export default FichePratiqueRMSPage

