import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const FichePratiqueRMSPage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Le système de gestion des risques (RMS) — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la mise en place et la gestion du système de gestion des risques (RMS) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act." />
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
              Le <strong>Risk Management System (RMS)</strong> est un processus continu et itératif. Selon l'EDPS, il ne doit pas se limiter à la sécurité technique (safety) mais placer les <strong>droits fondamentaux</strong> au cœur de l'analyse.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Approche Holistique (Art. 9) :
                </h3>
                <p className="text-gray-700">
                  Le fournisseur doit traiter les risques pour la santé, la sécurité, mais aussi la non-discrimination, la protection des données et la démocratie.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Cycle de vie complet :
                </h3>
                <p className="text-gray-700">
                  Le RMS démarre à la conception et ne s'arrête qu'au retrait du système du marché. Il doit être mis à jour en continu (Art. 9 §2).
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Double Conformité (EDPS Guidance) :
                </h3>
                <p className="text-gray-700">
                  La conformité à l'AI Act ne garantit pas automatiquement la conformité au RGPD. Les deux analyses (RMS/FRIA et AIPD) doivent être menées de front.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Périmètre d'application :</p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>✅ Concerne :</strong> Les <strong>Systèmes d'IA à Haut Risque (SIA-HR)</strong> visés par l'Art. 6 et l'Annexe III (ex: Recrutement, Santé, Justice, Biométrie, Services publics essentiels).
                </p>
                <p>
                  <strong>❌ Ne concerne pas :</strong> Les IA à risque limité (Chatbots, Deepfakes), les IA à risque minimal, ni les Modèles d'IA (GPAI) seuls (sauf s'ils sont intégrés dans un SIA-HR).
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
                Le RMS est le "moteur" de la conformité : sans lui, pas de marquage CE. Pour le secteur public et les entreprises régulées, c'est la preuve de la maîtrise de l'outil. Une gestion des risques défaillante expose à des sanctions massives (jusqu'à 35M€) et, selon l'EDPS, à une interdiction d'exploitation par les autorités de contrôle.
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
                  Le concept clé : Le Risque Résiduel & la Transparence
                </h3>
                <p className="text-gray-700 mb-4">
                  L'AI Act tolère un risque résiduel s'il est jugé acceptable. Le fournisseur doit le documenter et le communiquer au déployeur. L'EDPS insiste : cette communication doit être intelligible pour permettre au déployeur de mettre en place des mesures organisationnelles (formation, double validation).
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
              Ce tableau intègre les recommandations de l'EDPS pour une gestion des risques "Fundamental Rights-centric".
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
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Phase du Cycle de Vie</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Acteur Responsable</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Actions Concrètes à mener</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Référence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>1. INITIALISATION</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Cartographie des Risques "Droits Fondamentaux"</strong><br />
                      Identifier les impacts potentiels sur la discrimination, la vie privée et les groupes vulnérables (enfants, handicap), au-delà de la simple sécurité physique.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 9 (2)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Gouvernance des Données (Data Quality)</strong><br />
                      Auditer les jeux de données pour la représentativité et les biais. Documenter la provenance des données (EDPS focus).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 10</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>2. DÉVELOPPEMENT</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Implémenter la hiérarchie des mesures</strong><br />
                      1. Design (Safe by design).<br />
                      2. Protection technique (ex: filtres).<br />
                      3. Information (Notice).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 9 (4)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Tests de Robustesse & Cybersécurité</strong><br />
                      Valider la résistance aux attaques adverses et aux tentatives de manipulation du modèle.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 15</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>3. DÉPLOIEMENT</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Vérifier l'obligation de FRIA</strong><br />
                      • <strong>Secteur Public / Banque / Assurance :</strong> Réaliser la FRIA (Art. 27).<br />
                      • <strong>Autres :</strong> Réaliser une AIPD (RGPD) si données personnelles, en utilisant les infos du RMS fournisseur.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 27 & Art. 35 RGPD</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Définir la Surveillance Humaine (Human-in-the-loop)</strong><br />
                      Définir qui valide la décision de l'IA. Former les opérateurs à détecter le "biais d'automatisation" (tendance à trop faire confiance à la machine).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 14 & 26</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>4. RUN & SUIVI</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Monitoring en conditions réelles</strong><br />
                      Surveiller les logs pour détecter les dérives (ex: biais apparaissant sur une nouvelle population).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 (5)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Feedback Loop (Rétroaction)</strong><br />
                      Remonter systématiquement les incidents et anomalies au fournisseur pour qu'il corrige le modèle.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 (5)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Mise à jour du RMS (Post-Market)</strong><br />
                      Réévaluer la matrice des risques en fonction des retours terrain. Si le risque n'est plus acceptable → Correctif ou retrait.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 61</td>
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

export default FichePratiqueRMSPage

