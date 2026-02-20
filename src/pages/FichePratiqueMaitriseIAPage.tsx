import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueMaitriseIAPage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>La maîtrise de l&apos;IA (Article 4) — Fiche pratique | RIA Facile</title>
        <meta
          name="description"
          content="Guide pratique sur l'obligation de maîtrise de l'IA (Art. 4 AI Act) : formation du personnel, approche contextuelle et plan d'actions pour la conformité."
        />
      </Helmet>

      <AdherentOnlyOverlay revealHeight="55vh">
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
                FICHE PRATIQUE : LA MAÎTRISE DE L&apos;IA
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['4'].map((article) => (
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
              L&apos;<strong>article 4</strong> impose une obligation générale de compétence pour garantir une utilisation éthique et sûre de
              l&apos;IA.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Obligation de moyens (Art. 4) :</h3>
                <p className="text-gray-700">
                  Les fournisseurs et déployeurs doivent prendre des mesures pour assurer un niveau &quot;suffisant&quot; de maîtrise de
                  l&apos;IA à leur personnel.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Approche contextuelle (Art. 4) :</h3>
                <p className="text-gray-700">
                  Le niveau de formation doit être adapté aux connaissances techniques, à l&apos;expérience, à l&apos;éducation du personnel et au
                  contexte d&apos;utilisation du SIA.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Définition large (Art. 3 §56) :</h3>
                <p className="text-gray-700">
                  La maîtrise de l&apos;IA ne se limite pas au code. Elle inclut la compréhension des opportunités, des risques, et des
                  droits/obligations liés au Règlement.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              2. LE CADRE EN BREF
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">L&apos;enjeu Business &amp; Conformité :</h3>
                <p className="text-gray-700">
                  L&apos;obligation est <strong>immédiate</strong> (depuis fév. 2025). Il ne s&apos;agit pas de transformer tous les employés en
                  Data Scientists, mais de garantir que ceux qui utilisent ou supervisent l&apos;IA comprennent ce qu&apos;ils font pour éviter
                  les incidents (hallucinations, biais, fuites de données). C&apos;est le prérequis indispensable pour rendre effectives les
                  mesures de transparence et de surveillance humaine.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Périmètre d&apos;application :</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    ✅ <strong>Concerne :</strong> Tous les <strong>Fournisseurs</strong> et <strong>Déployeurs</strong> de systèmes d&apos;IA
                    (SIA), quel que soit le niveau de risque (Haut Risque, Limité, Minimal).
                  </li>
                  <li>
                    ✅ <strong>Public cible :</strong> Employés, mais aussi sous-traitants, prestataires et toute personne opérant l&apos;IA
                    pour le compte de l&apos;organisation.
                  </li>
                  <li>
                    📅 <strong>Entrée en vigueur :</strong> <strong>2 février 2025</strong>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. LE DÉCRYPTAGE
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Pas de &quot;Taille Unique&quot; (One size fits all)</h3>
                <p className="text-gray-700 mb-4">
                  Selon la FAQ de la Commission, il n&apos;y a pas de curriculum standard imposé. L&apos;entreprise a la flexibilité de définir
                  ses programmes.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                  <p className="text-gray-700">
                    <strong>Exemple :</strong> Un développeur a besoin d&apos;une formation technique pointue sur les biais. Un recruteur
                    utilisant un outil de tri de CV a besoin de comprendre les limites de l&apos;outil et le risque de discrimination.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Extension aux tiers</h3>
                <p className="text-gray-700">
                  L&apos;obligation couvre le personnel et &quot;les autres personnes traitant de l&apos;opération et de l&apos;utilisation des
                  systèmes d&apos;IA pour leur compte&quot; (Art. 4). Cela inclut les <strong>contractants et prestataires externes</strong>.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Preuve de conformité</h3>
                <p className="text-gray-700">
                  Bien qu&apos;il n&apos;y ait pas d&apos;obligation de certification formelle, l&apos;entreprise doit pouvoir documenter ses
                  actions (registre de formation, supports) en cas de contrôle par une autorité de surveillance nationale.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. LE PLAN D&apos;ACTIONS (FORMAT MATRICIEL)
            </h2>
            <p className="text-gray-700 mb-6">
              Ce tableau structure la mise en conformité &quot;AI Literacy&quot; selon les recommandations de la Commission.
            </p>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Légende :</strong>
              </p>
              <p className="text-sm text-gray-600">🏢 <strong>ORGANISATION</strong> (Fournisseur ou Déployeur)</p>
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
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">1. DIAGNOSTIC</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 RH / Compliance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Cartographier les populations cibles</strong>
                      <br />
                      Identifier qui interagit avec l&apos;IA : Développeurs, Opérateurs métiers (RH, Marketing), Juristes, Décideurs.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 4</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">1. DIAGNOSTIC</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 RH / Compliance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Évaluer le besoin par profil</strong>
                      <br />
                      Adapter le niveau requis selon le risque du système utilisé (ex: formation renforcée pour les SIA Haut Risque).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 4 (&quot;taking into account the context&quot;)</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">2. CONCEPTION</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 Formation / DSI</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Définir le socle commun (Sensibilisation)</strong>
                      <br />
                      Module pour tous : Qu&apos;est-ce que l&apos;IA ? Risques (hallucinations, confidentialité), Éthique de base.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 3 (56)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">2. CONCEPTION</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 Formation / DSI</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Créer des parcours spécifiques</strong>
                      <br />
                      • <em>Profil Technique :</em> Robustesse, Biais, Documentation technique.
                      <br />• <em>Profil Opérationnel :</em> Interprétation des résultats, Surveillance humaine, &quot;Kill switch&quot;.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 4</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">3. DÉPLOIEMENT</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 Management</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Former les collaborateurs et prestataires</strong>
                      <br />
                      Intégrer la &quot;Maîtrise de l&apos;IA&quot; dans l&apos;onboarding des nouveaux arrivants et les contrats de prestation.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 4 (&quot;staff and other persons&quot;)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">3. DÉPLOIEMENT</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 Compliance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Documenter les actions</strong>
                      <br />
                      Tenir un registre interne des formations suivies et des supports diffusés (Preuve de &quot;best effort&quot;).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">FAQ Commission</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">4. SUIVI</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🏢 Compliance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Mise à jour continue</strong>
                      <br />
                      L&apos;IA évolue vite. Actualiser les formations lors de l&apos;adoption de nouveaux outils (ex: passage à un nouveau LLM).
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 4</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-purple-50 border-l-4 border-purple-400 p-6 rounded-r-lg">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">💡 Conseil de l&apos;expert</h3>
              <p className="text-gray-700 mb-2">
                Pour les <strong>SIA à Haut Risque</strong>, la formation est critique pour valider l&apos;article 26 (Surveillance humaine). Si
                un opérateur ne comprend pas comment l&apos;IA fonctionne, il ne peut pas exercer de contrôle effectif.
              </p>
              <p className="text-gray-700">
                <em>
                  Astuce : Utilisez les ressources gratuites de l&apos;UE (Digital Skills and Jobs Platform) citées dans la FAQ pour construire
                  votre socle de base à moindre coût.
                </em>
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
              className={`overflow-hidden transition-all duration-300 ${
                sourcesOuvertes ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Règlement (UE) 2024/1689 (AI Act)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 4 :</em> Obligation de maîtrise de l&apos;IA</li>
                    <li>• <em>Art. 3 §56 :</em> Définition de la maîtrise de l&apos;IA</li>
                  </ul>
                  <a
                    href="/consulter?numero=4"
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
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Commission Européenne</h3>
                  <p className="text-gray-700 mb-2">
                    <em>AI Literacy - Questions &amp; Answers</em> - Clarifications sur le périmètre, le contenu et l&apos;application de
                    l&apos;article 4.
                  </p>
                  <a
                    href="https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers"
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
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">The Academic Guide to AI Act Compliance (2025)</h3>
                  <p className="text-gray-700 mb-2">
                    <em>Chapter 8 - AI literacy under Article 4 of the AI Act</em> (Nathalie Nevejans)
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

export default FichePratiqueMaitriseIAPage

