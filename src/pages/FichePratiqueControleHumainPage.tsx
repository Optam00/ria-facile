import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const FichePratiqueControleHumainPage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Le contrôle humain — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la mise en place du contrôle humain dans les systèmes d'IA à haut risque. Croisement RGPD et AI Act." />
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
                FICHE PRATIQUE : LE CONTRÔLE HUMAIN
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['14', '26'].map((article) => (
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
              Le <strong>contrôle humain</strong> est la garantie que l'IA reste un outil et ne devient pas un décideur autonome
              incontrôlable. C'est une <strong>obligation de moyens renforcée</strong>.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Principe "Human-centric" :
                </h3>
                <p className="text-gray-700">
                  Les Systèmes d'IA à Haut Risque (SIA-HR) doivent être conçus (Fournisseur) et utilisés (Déployeur) de manière à pouvoir
                  être surveillés par des personnes physiques.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Double exigence RGPD / AI Act (vue APD Belge) :
                </h3>
                <p className="text-gray-700">
                  • <strong>AI Act (Art. 14)</strong> : une <strong>surveillance continue</strong> et organisationnelle pour éviter les
                  dérives (biais, erreurs techniques).<br />
                  • <strong>RGPD (Art. 22)</strong> : un <strong>droit individuel</strong> pour chaque personne à faire réexaminer une
                  décision automatisée qui l'affecte.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Compétence et autorité du superviseur (Art. 14 &amp; 26) :
                </h3>
                <p className="text-gray-700">
                  Le contrôle ne doit pas être théorique. Il doit être effectué par des personnes physiques disposant de la{' '}
                  <strong>compétence</strong>, de la <strong>formation</strong> (AI literacy) et de l'<strong>autorité</strong> nécessaires
                  pour <strong>contredire</strong> l'IA.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Périmètre d'application :</p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>✅ Concerne exclusivement :</strong> Les <strong>Systèmes d'IA à Haut Risque (SIA-HR)</strong> visés par l'Art. 6 et l'Annexe III (ex: Recrutement, Santé, Justice, Biométrie, Infrastructures critiques).
                </p>
                <p>
                  <strong>❌ Ne concerne pas :</strong> Les IA à risque limité ou minimal (sauf choix volontaire de l'entreprise pour des raisons éthiques ou de qualité).
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
                Le régulateur chasse le <strong>&quot;Rubber-stamping&quot;</strong> : un contrôle de façade où l'humain se contente de
                cliquer sur &quot;OK&quot; sans réfléchir. Le superviseur doit avoir la <strong>compétence</strong>, la{' '}
                <strong>formation</strong> et l'<strong>autorité</strong> pour refuser une suggestion de l'IA. Si, dans les faits, 100% des
                décisions de l'IA sont validées sans examen, l'autorité considérera que le système est de facto
                <strong> entièrement automatisé</strong>, avec les conséquences du RGPD (Art. 22).
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
                  Le défi du Biais d'Automatisation
                </h3>
                <p className="text-gray-700 mb-4">
                  C'est le risque majeur identifié par le régulateur : l'opérateur humain, par fatigue ou excès de confiance, valide
                  systématiquement les propositions de l'IA (&quot;Rubber-stamping&quot;). L'Art. 14 exige des mesures concrètes pour
                  contrer ce <strong>biais psychologique documenté</strong> : formation, procédures, indicateurs.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Les 3 niveaux de contrôle (vue EDPS)
                </h3>
                <p className="text-gray-700 mb-3">
                  Selon l'EDPS, le contrôle humain se déploie à <strong>trois moments clés</strong> :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                  <li>
                    <strong>Pre-deployment review :</strong> Validation avant mise en production (tests, revue de la notice, vérification
                    des scénarios de risques).
                  </li>
                  <li>
                    <strong>Human In The Loop (HITL) :</strong> Intervention en temps réel. L'IA prépare la décision, l'humain valide ou
                    modifie (ex: diagnostic médical, recrutement).
                  </li>
                  <li>
                    <strong>Post-decision review :</strong> Audit a posteriori. Révision périodique d'un échantillon de décisions pour
                    détecter des dérives (biais, erreurs systématiques).
                  </li>
                </ol>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Lien avec la Transparence et le RGPD
                </h3>
                <p className="text-gray-700">
                  Le contrôle humain est impossible sans <strong>explicabilité</strong> (Art. 13 AI Act). Et même si la surveillance
                  continue est en place (AI Act), il faut conserver la capacité de <strong>réexaminer une décision individuelle</strong>{' '}
                  contestée par une personne (Art. 22 RGPD). Les deux logiques sont <strong>complémentaires</strong>, pas substituables.
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
              Ce tableau structure la mise en place du contrôle humain en distinguant la <strong>conception</strong> (Fournisseur),{' '}
              <strong>l'organisation</strong> et <strong>l'opération</strong> (Déployeur), en intégrant les trois niveaux de contrôle
              identifiés par l'EDPS.
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
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>1. CONCEPTION (Design)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Intégrer les outils de supervision</strong><br />
                      Développer une interface permettant à l'humain de comprendre les outputs et d'intervenir (ex: bouton &quot;Stop&quot;,
                      modification des paramètres).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 (3)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Définir les mesures de contrôle</strong><br />
                      Identifier dans la documentation technique les mesures de surveillance appropriées au risque (ex: double validation requise).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 (2)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Mettre en place la journalisation (logging)</strong><br />
                      Prévoir l'enregistrement des interactions clés : qui a validé, qui a rejeté, quels paramètres étaient actifs. Sans
                      traces, aucun contrôle a posteriori n'est possible.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 12 &amp; 14 AI Act</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>2. ORGANISATION (Setup)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Nommer les superviseurs</strong><br />
                      Affecter des personnes physiques spécifiques à la tâche de surveillance. S'assurer qu'elles ont l'autorité pour contredire l'IA.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 (2)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Former les équipes (AI Literacy)</strong><br />
                      Former les superviseurs à comprendre le système et surtout à reconnaître le <strong>biais d'automatisation</strong> (ne pas faire confiance par défaut).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 4 & Art. 26 (2)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>3. OPÉRATION (Run)</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Contrôle en temps réel (HITL)</strong><br />
                      Analyser les résultats de l'IA et décider au cas par cas : valider, modifier ou rejeter. En cas de doute ou
                      d'anomalie, ignorer la suggestion de l'IA (&quot;Override&quot;).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 (4)(d)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Activer le "Kill Switch"</strong><br />
                      Interrompre ou arrêter le système immédiatement en cas de dysfonctionnement ou de risque grave identifié.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 (4)(e)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Revue a posteriori &amp; droits individuels</strong><br />
                      Mettre en place des revues périodiques d'échantillons de décisions (Post-decision review) et un processus permettant
                      à une personne de faire réexaminer sa situation par un humain en cas de contestation (Art. 22 RGPD).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 AI Act &amp; 22 RGPD</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">4. CAS SPÉCIFIQUE</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Identification Biométrique à distance</strong><br />
                      Pour ce cas d'usage très sensible, imposer une validation par <strong>deux personnes</strong> distinctes avant toute action (principe des "4 yeux").
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 (5)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span>
                <span style={{ color: '#774792' }}>Conseil de l'expert</span>
              </h3>
              <p className="text-gray-700">
                Ne vous contentez pas de nommer un superviseur sur le papier. Vous devez prouver sa <strong>compétence</strong> et l'effectivité
                du contrôle : formation, décisions effectivement corrigées, indicateurs de rejet des recommandations de l'IA. Lors d'un audit,
                si le superviseur ne sait pas expliquer comment fonctionne l'outil ou n'a jamais contredit l'IA en 6 mois, l'autorité
                considérera que le contrôle humain est inefficace et donc non conforme.
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
                    <li>• <em>Art. 14 :</em> Contrôle humain</li>
                    <li>• <em>Art. 26 :</em> Obligations des déployeurs</li>
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
                    <li>• <em>Art. 22 :</em> Décision individuelle automatisée</li>
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
                    The Academic Guide to AI Act Compliance (2025)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Chapitre 7 :</em> Transparency Under the AI Act (Florence Guillaume) - <em>Section &quot;2.5 Human Oversight&quot;</em></li>
                    <li>• <em>Chapitre 11 :</em> Fundamental Rights Impact Assessment (M. Ho-Dac &amp; L. Xenou) - <em>Section &quot;3.3 Phase 3&quot; sur les mesures d'atténuation</em></li>
                  </ul>
                  <a 
                    href="https://www.ucly.fr/wp-content/uploads/2025/11/the-academic-guide-to-ai-act-compliance-2025-ed.-mhodac-cp.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien vers le guide académique
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="border-l-4 border-purple-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    EDPS – AI Risks Management Guidance (Nov. 2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Note de bas de page 69 : typologie des contrôles (Pre-deployment review, Human In The Loop, Post-decision review) et
                    articulation avec l'exactitude et la surveillance continue.
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
                <div className="border-l-4 border-blue-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    APD Belge – Brochure &quot;IA et RGPD&quot; (2024)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Clarifie la distinction entre le contrôle de <strong>gouvernance</strong> (AI Act, surveillance continue) et le{' '}
                    <strong>droit individuel</strong> au réexamen d'une décision (Art. 22 RGPD), notamment page 11.
                  </p>
                  <a 
                    href="https://www.autoriteprotectiondonnees.be/publications/brochure-d-information-sur-les-systemes-d-intelligence-artificielle-et-le-rgpd.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    Lien vers la brochure
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

export default FichePratiqueControleHumainPage

