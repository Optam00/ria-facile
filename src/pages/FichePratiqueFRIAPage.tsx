import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueFRIAPage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Analyse d'impact sur les droits fondamentaux (FRIA) — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour réaliser une analyse d'impact sur les droits fondamentaux (FRIA) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act." />
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
                FICHE PRATIQUE : ANALYSE D'IMPACT SUR LES DROITS FONDAMENTAUX (FRIA)
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['13', '26', '27'].map((article) => (
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
              La <strong>Fundamental Rights Impact Assessment (FRIA)</strong> est l'exercice qui permet de passer de la{' '}
              <strong>&quot;conformité produit&quot;</strong> (Fournisseur) à la <strong>&quot;conformité d'usage&quot;</strong> (Déployeur).
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Obligation du Déployeur (Art. 27 §1) :
                </h3>
                <p className="text-gray-700">
                  C'est l'<strong>utilisateur professionnel</strong> (et non le fournisseur) qui doit évaluer l'impact de l'IA dans son
                  <strong> contexte spécifique</strong> avant la mise en service.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Périmètre étendu :
                </h3>
                <p className="text-gray-700">
                  Au-delà de la vie privée (RGPD), la FRIA couvre <strong>tous les droits fondamentaux</strong> : non-discrimination, liberté
                  d'expression, droits de l'enfant, droit à un recours effectif, etc.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Transparence (Art. 27 §3) :
                </h3>
                <p className="text-gray-700">
                  Les résultats de la FRIA doivent être notifiés à l'autorité de surveillance du marché.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Périmètre d'application (Critique) :</p>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="mb-2">
                    <strong>✅ Concerne uniquement certains Déployeurs de SIA à Haut Risque :</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li><strong>Organismes de droit public</strong> (Administrations, Hôpitaux, Éducation, Police).</li>
                    <li><strong>Entités privées assurant une mission de service public</strong> (ex: Transports, Énergie).</li>
                    <li><strong>Banques et Assurances</strong>, spécifiquement pour les SIA d'évaluation du crédit (scoring) et de tarification (vie/santé).</li>
                  </ol>
                </div>
                <div>
                  <p>
                    <strong>❌ Ne concerne pas :</strong> Les entreprises privées "classiques" (Retail, Industrie, Tech) utilisant des SIA à Haut Risque pour leurs besoins internes (ex: RH), sauf disposition nationale contraire.
                  </p>
                </div>
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
                Sans FRIA, l'utilisation d'un système à haut risque par un acteur public (ou assimilé) est <strong>illégale</strong>. La FRIA
                agit comme un <strong>&quot;permis d'opérer&quot;</strong> : elle transforme la documentation technique du fournisseur en une
                analyse d'impact sociétal concrète. Une FRIA absente ou bâclée expose à une interdiction d'utilisation et à un risque
                réputationnel majeur (accusation de discrimination algorithmique).
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
                  Le défi : Passer du "Labo" à la "Vraie Vie"
                </h3>
                <p className="text-gray-700 mb-4">
                  Le fournisseur a validé que son modèle fonctionne techniquement (via son RMS - Art. 9). Le déployeur ne peut pas
                  réaliser une FRIA sérieuse sans disposer de la <strong>notice d'utilisation</strong> (Art. 13) et des informations sur les{' '}
                  <strong>risques résiduels</strong>. Il doit ensuite valider que l'utilisation de ce modèle <em>dans son contexte précis</em>{' '}
                  ne va pas nuire aux droits fondamentaux.
                </p>
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg italic text-gray-700">
                  <strong>Exemple :</strong> Un algorithme de détection de fraude aux prestations sociales peut être techniquement robuste (Fournisseur), mais son déploiement peut créer une discrimination massive envers certaines populations précaires (Déployeur).
                </div>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  La convergence FRIA / AIPD (Vue EDPS)
                </h3>
                <p className="text-gray-700 mb-2">
                  L'AI Act (Art. 27 §4) et l'EDPS recommandent de ne pas multiplier les documents. Si une{' '}
                  <strong>Analyse d'Impact relative à la Protection des Données (AIPD)</strong> est déjà requise par le RGPD (Art. 35), la FRIA
                  doit venir la compléter, pas la remplacer.
                </p>
                <p className="text-gray-700">
                  <strong>Best Practice :</strong> Créer un <strong>&quot;Master Impact Assessment&quot;</strong> unique traitant la Data Privacy (RGPD)
                  + les autres droits fondamentaux (AI Act). Attention toutefois : l'<strong>AIPD</strong> est un document{' '}
                  <strong>&quot;vivant&quot;</strong> mis à jour régulièrement, alors que la <strong>FRIA</strong> est une photographie à un instant T
                  (avant déploiement), qui ne doit être révisée qu'en cas de changement substantiel.
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
              Ce tableau détaille la méthodologie pour réaliser une FRIA conforme, en s'appuyant sur le Chapitre 11 du Guide Académique et
              les exigences de l'Art. 27 (AI Act).
            </p>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2"><strong>Légende :</strong></p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>🔵 <strong>DÉPLOYEUR</strong> (Entité publique, Banque, Assurance...)</span>
                <span>🟢 <strong>FOURNISSEUR</strong> (Éditeur du SIA, en support)</span>
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
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>1. CADRAGE</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Vérifier l'éligibilité</strong><br />
                      Confirmer que l'entité et le cas d'usage relèvent bien de l'Art. 27 (Secteur public ou Banque/Assurance sur cas spécifiques).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (1)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Fournir les intrants</strong><br />
                      Transmettre la notice d'utilisation (Art. 13) et les résultats pertinents du RMS (risques résiduels). Sans ces éléments,
                      la FRIA ne peut pas être correctement réalisée.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 13</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={4}>2. ANALYSE &amp; CONSULTATION</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Décrire le contexte d'usage</strong><br />
                      Définir la finalité, les catégories de personnes affectées (ex: mineurs, personnes vulnérables) et la fréquence d'utilisation.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (1)(a-b)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Identifier les Droits Fondamentaux touchés</strong><br />
                      Au-delà de la vie privée : Dignité, Non-discrimination, Liberté de réunion, Accès aux services publics, etc.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (1)(c)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Évaluer les risques spécifiques</strong><br />
                      Croiser les risques techniques du fournisseur avec le contexte local (ex: biais de données vs démographie locale).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (1)(d)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Consultation obligatoire</strong><br />
                      Consulter les représentants des travailleurs ou les personnes concernées sur l'usage prévu du système, conformément
                      à l'Art. 27 (1). Cette étape est une exigence procédurale, pas un simple conseil.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (1)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>3. ATTÉNUATION</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Définir la Surveillance Humaine</strong><br />
                      Qui valide la décision ? A-t-il la compétence et l'autorité pour contredire l'IA ? (Lutte contre le biais d'automatisation).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 & 27 (1)(e)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Intégrer à l'AIPD (RGPD)</strong><br />
                      Si des données personnelles sont traitées, fusionner l'analyse FRIA avec l'AIPD existante pour éviter les doublons.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (4)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>4. GOUVERNANCE</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Notifier l'Autorité</strong><br />
                      Transmettre <strong>le résumé des résultats</strong> à l'autorité de surveillance du marché via le formulaire dédié (template AI
                      Office). L'intégralité du document FRIA n'est transmise qu'en cas de demande spécifique de l'autorité.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (3)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Révision périodique</strong><br />
                      Mettre à jour la FRIA si le contexte d'utilisation change ou si le fournisseur modifie substantiellement le système.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 (2)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span>
                <span style={{ color: '#774792' }}>Conseil de l'expert</span>
              </h3>
              <p className="text-gray-700 mb-3">
                Ne commencez pas une FRIA &quot;page blanche&quot;.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                <li>Partez de votre <strong>AIPD (RGPD)</strong> existante.</li>
                <li>Ajoutez une section "Autres Droits Fondamentaux" (Non-discrimination, Droit à un recours effectif).</li>
                <li>Utilisez la notice d'utilisation du fournisseur pour remplir les sections techniques (risques résiduels, limites connues).</li>
                <li>Formalisez la consultation (représentants du personnel, associations d'usagers) et conservez une trace de leurs retours.</li>
              </ol>
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
                    <li>• <em>Art. 27 :</em> Obligation de réaliser une analyse d'impact sur les droits fondamentaux (FRIA)</li>
                    <li>• <em>Art. 26 :</em> Obligations des déployeurs de systèmes à haut risque</li>
                    <li>• <em>Art. 13 :</em> Notice d'utilisation</li>
                    <li>• <em>Annexe III :</em> Liste des cas de Systèmes d'IA à Haut Risque concernés (dont crédit et assurance vie/santé)</li>
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
                    <li>• <em>Art. 35 :</em> Analyse d'impact relative à la protection des données</li>
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
                    <em>AI Risks Management Guidance (Nov 2025)</em> - Recommandations sur l'intégration des droits fondamentaux dans l'analyse de risque.
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
                    <li>• <em>Chapitre 11 :</em> Fundamental Rights Impact Assessment (FRIA) under the AI Act (M. Ho-Dac & L. Xenou)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-purple-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    AI Office – Modèle FRIA
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Modèle (template) standardisé que les déployeurs devront utiliser pour notifier les résultats de leur FRIA à
                    l'autorité de surveillance, conformément à l'Art. 27 (3).
                  </p>
                </div>
                <div className="border-l-4 border-blue-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    Charte des Droits Fondamentaux de l'Union européenne
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Référentiel pour identifier les droits touchés par le système (Dignité, Libertés, Égalité, Solidarité, Citoyenneté,
                    Justice).
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

export default FichePratiqueFRIAPage

