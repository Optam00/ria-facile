import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

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
              respect des droits des personnes. Le CEPD (EDPS) rappelle que la structure en <em>boîte noire</em> des réseaux de neurones
              n'exonère pas le responsable de traitement de ses obligations.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Le défi de l'absorption :</h3>
                <p className="text-gray-700">
                  Une fois entraîné, un modèle d'IA ne stocke plus des &quot;fiches clients&quot; mais des paramètres
                  probabilistes. Pourtant, si le modèle est capable de <strong>restituer une donnée personnelle</strong> (mémorisation),
                  les droits RGPD (accès, effacement, opposition) continuent de s'appliquer.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">La distinction Entraînement / Inférence :</h3>
                <p className="text-gray-700">
                  Les droits doivent être gérés à deux niveaux :<br />
                  • Dans le <strong>dataset d'entraînement</strong> (avant ou pendant l'entraînement du modèle).<br />
                  • Dans les <strong>sorties générées</strong> (prompts et réponses en production).<br />
                  L'<strong>Article 10 de l'AI Act</strong> (gouvernance des données) est le levier technique qui permet d'assurer cette
                  maîtrise : sans bonne gouvernance, pas de respect effectif des droits RGPD.
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
                Selon l'Avis 28/2024 de l'EDPB, si les données d'entraînement ont été collectées sans permettre l'exercice effectif
                des droits (ex : droit d'opposition non respecté lors du scraping), le <strong>modèle résultant peut être considéré
                comme illégal</strong>.
              </p>
              <p className="text-gray-700">
                Conséquence : l'autorité peut ordonner la <strong>suppression du modèle complet</strong>, pas seulement de la donnée
                brute. Enjeu business majeur : la <strong>traçabilité</strong> et la gouvernance des données conditionnent la
                pérennité de vos modèles.
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
                  <strong>Solution :</strong> mettre en place des <strong>Data Retrieval Tools</strong> : indexation stricte, métadonnées
                  riches (identifiants, timestamps, sources) et outils de recherche permettant de retrouver instantanément toutes les
                  occurrences d'une personne.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">L'effacement impossible (Risk 2) :</h3>
                <p className="text-gray-700 mb-2">
                  Comment supprimer &quot;Mme Michu&quot; d'un réseau de neurones ?
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>
                    <strong>Machine Unlearning :</strong> techniques (encore émergentes) pour faire &quot;oublier&quot; une donnée au
                    modèle sans tout réentraîner. L'<em>unlearning exact</em> (réentraînement complet) est coûteux ; les approches
                    <em> approximatives</em> sont plus réalistes mais laissent un risque résiduel qu'il faut documenter.
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
                <em>Applicable si vous entraînez ou fine-tunez vos propres modèles.</em>
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
                        Indexation &amp; Métadonnées
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 10)<br />
                        <strong>RGPD</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Créer des index et métadonnées permettant de retrouver instantanément les fichiers sources contenant les
                        données d'une personne (Risk 1, mesure 1). Sans cela, le <strong>droit d'accès</strong> et la traçabilité
                        nécessaires à l'AI Act sont pratiquement impossibles à exercer.
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
                        Évaluer la faisabilité technique du désapprentissage (exact vs approximatif). Si l'unlearning exact n'est
                        pas réaliste, prévoir des <strong>cycles de réentraînement réguliers</strong> pour purger les données
                        supprimées et documenter les limites de l'unlearning approximatif.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Outils de récupération (Retrieval Tools)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 15 &amp; 20)<br />
                        <strong>EDPS</strong> – GenAI &amp; Risk Management
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Développer des outils dédiés (scripts, consoles d'admin) permettant d'<strong>extraire</strong> rapidement
                        les données d'entraînement et, le cas échéant, les segments de fine-tuning d'un individu dans un format lisible
                        et structuré (droit d'accès &amp; portabilité).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Gestion du droit d'opposition en amont
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur / RT</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 21)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Lorsque l'entraînement repose sur l'<strong>intérêt légitime</strong>, purger les données des personnes
                        ayant exercé leur opt-out <strong>avant</strong> de fixer les poids du modèle. À défaut, vous vous exposez
                        au risque de devoir « désapprendre » ou détruire le modèle (modèle « empoisonné »).
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
                        Clause de &quot;Droit à l'Oubli&quot; &amp; Réversibilité
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 28)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Le contrat doit garantir que le fournisseur supprimera les données transmises (fine-tuning, RAG) sur
                        demande, y compris dans ses sauvegardes, et prévoir des <strong>clauses de réversibilité</strong> :
                        possibilité de récupérer les données d'apprentissage si vous changez de prestataire.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Test de &quot;Mémorisation&quot; du modèle
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Vérifier si le modèle a tendance à <strong>régurgiter des données d'entraînement</strong>{' '}
                        (overfitting). Utiliser des outils d'audit (ex : <em>membership inference</em>, MemHunter) pour
                        évaluer le risque de fuite de données personnelles.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Cloisonnement des données &amp; filtres
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 5 &amp; 6)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Vérifier que les <strong>prompts</strong> (questions des utilisateurs) ne sont pas réutilisés pour
                        réentraîner le modèle sans base légale distincte.<br />
                        • S'assurer que le fournisseur dispose de mécanismes de <strong>filtrage en sortie</strong> (output
                        filtering) pour empêcher l'IA de divulguer des données d'autres clients ou des données qui auraient dû
                        être effacées.
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
                <em>Applicable lors de la gestion des demandes utilisateurs et de l'exploitation au quotidien.</em>
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
                        Procédure Droit d'Opposition (RUN)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 21)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si un utilisateur s'oppose au traitement, s'assurer que ses données ne sont{' '}
                        <strong>plus réutilisées</strong> pour de futurs entraînements ou fine-tuning (continuous learning)
                        et qu'elles sont retirées des jeux de données opérationnels.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Filtrage en sortie &amp; System Prompts
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>EDPS</strong> – GenAI (Sec. 14)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Mettre en place des <strong>filtres techniques</strong> et des <strong>system prompts</strong> pour empêcher la
                        génération de données personnelles sensibles (ex : emails internes, numéros de sécurité sociale) ou
                        d'informations issues d'autres jeux de données. Tester régulièrement ces garde-fous.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Rectification via sources externes (RAG)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 16)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si le modèle génère une information fausse sur une personne, ne pas forcément toucher au modèle : mettre
                        à jour la <strong>base de connaissances</strong> utilisée en RAG ou les règles métier, afin que la prochaine
                        réponse soit correcte.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Documentation de l'impossibilité technique
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 12)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si l'effacement dans le modèle est <strong>techniquement impossible</strong> ou exigerait des efforts
                        disproportionnés, documenter les raisons de manière transparente et mettre en place des
                        <strong> mesures compensatoires</strong> (suppression des entrées, filtrage renforcé, limitation forte
                        des usages).
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
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">1. EDPS (CEPD) – Guidance for Risk Management of AI Systems (11 nov. 2025)</h3>
                  <p className="text-gray-700 mb-2">
                    Voir spécifiquement la <strong>Section 5.5 &quot;Data subject’s rights&quot;</strong> qui détaille les
                    risques d'identification incomplète et d'effacement impossible, ainsi que l'importance des outils de récupération.
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
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">2. EDPS (CEPD) – Generative AI and the EUDPR (oct. 2025)</h3>
                  <p className="text-gray-700 mb-2">
                    Clarifie la gestion des droits sur les <strong>données d'entraînement</strong> vs les <strong>données générées</strong>
                    (Section 14) et insiste sur les risques de fuite via les prompts.
                  </p>
                  <a
                    href="https://www.edps.europa.eu/data-protection/our-work/publications/guidelines/2025-10-28-guidance-generative-ai-strengthening-data-protection-rapidly-changing-digital-era_en"
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
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">3. EDPB Support Pool – AI Privacy Risks &amp; Mitigations (2025)</h3>
                  <p className="text-gray-700 mb-2">
                    Apporte des précisions techniques sur le <strong>Machine Unlearning</strong> (exact vs approximatif) et les
                    attaques par <em>membership inference</em> pour tester la mémorisation des modèles.
                  </p>
                  <a
                    href="https://www.edpb.europa.eu/system/files/2025-04/ai-privacy-risks-and-mitigations-in-llms.pdf"
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
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">4. Règlement (UE) 2016/679 (RGPD)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 12-22 :</em> Droits des personnes concernées (information, accès, rectification, effacement, opposition, limitation, portabilité).</li>
                    <li>• <em>Art. 12 :</em> Transparence et modalités d'exercice de ces droits.</li>
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
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">5. Règlement (UE) 2024/1689 (AI Act)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 10 :</em> Gouvernance des données.</li>
                    <li>• <em>Art. 13 :</em> Transparence et fourniture d'informations.</li>
                    <li>• <em>Art. 86 :</em> Droit à l'explication d'une décision individuelle.</li>
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

export default FichePratiqueDroitsRGPDPage


