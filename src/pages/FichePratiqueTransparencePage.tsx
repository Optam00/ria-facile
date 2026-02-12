import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueTransparencePage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Transparence et information des utilisateurs — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la transparence et l'information des utilisateurs dans les systèmes d'IA. Croisement RGPD et AI Act." />
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
                FICHE PRATIQUE : TRANSPARENCE ET INFORMATION DES UTILISATEURS
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['13', '26', '50', '53'].map((article) => (
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
              La transparence dans l'AI Act opère à <strong>deux niveaux distincts</strong> qu'il ne faut pas confondre : la transparence{' '}
              <strong>technique (B2B)</strong> entre le fournisseur et le déployeur, et la transparence{' '}
              <strong>informationnelle (B2C)</strong> envers les personnes concernées.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Transparence technique pour les SIA Haut Risque (Art. 13) :
                </h3>
                <p className="text-gray-700">
                  Le <strong>fournisseur</strong> doit livrer un mode d'emploi complet (&quot;Instructions for Use&quot;) au{' '}
                  <strong>déployeur</strong>. C'est de la transparence <strong>technique</strong> (B2B) : explicabilité, traçabilité,
                  limites, risques résiduels.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Transparence informationnelle pour les IA conversationnelles et génératives (Art. 50) :
                </h3>
                <p className="text-gray-700">
                  Le <strong>déployeur</strong> doit informer l'<strong>utilisateur final</strong> qu'il interagit avec une IA ou qu'un
                  contenu est artificiel. C'est de la transparence <strong>B2C</strong>, orientée contre la manipulation et l'illusion
                  d'humanité.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Lien RGPD :
                </h3>
                <p className="text-gray-700">
                  Les informations techniques fournies par le fournisseur (AI Act, Art. 13 et 53) sont la matière première indispensable
                  pour rédiger les <strong>notices d'information RGPD</strong> (Art. 12-14) et pour respecter le droit à l'explication
                  (Art. 22 RGPD).
                </p>
              </div>
              <div className="border-l-4 border-teal-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Transparence dans la chaîne de valeur (GPAI, Art. 53) :
                </h3>
                <p className="text-gray-700">
                  Pour les <strong>modèles d'IA à usage général (GPAI)</strong>, la transparence vise à permettre aux{' '}
                  <strong>fournisseurs en aval</strong> de respecter à leur tour leurs propres obligations (documentation, information des
                  personnes, gestion des risques).
                </p>
              </div>
            </div>
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Périmètre d'application (Multi-niveaux) :</p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>✅ Systèmes à Haut Risque (SIA-HR) :</strong> Obligations lourdes de documentation et d'explicabilité (Art. 13).
                </p>
                <p>
                  <strong>✅ Systèmes à Risque Limité (IA générative, Chatbots, Deepfakes) :</strong> Obligations spécifiques de marquage et de divulgation (Art. 50).
                </p>
                <p>
                  <strong>✅ Modèles d'IA (GPAI) :</strong> Obligation de transparence envers les fournisseurs en aval (Art. 53).
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
                La transparence est le vecteur de la <strong>confiance</strong>. Pour le fournisseur, une documentation claire limite la
                responsabilité en cas de mésusage par le client. Pour le déployeur, informer les utilisateurs finaux (employés, clients)
                est une obligation légale stricte (amendes jusqu'à 15M€ ou 3% du CA pour violation de l'Art. 50) et un impératif éthique
                pour éviter le rejet de la technologie.
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
                  Le défi de l'Explicabilité &amp; de l'Interprétabilité (SIA Haut Risque)
                </h3>
                <p className="text-gray-700 mb-4">
                  Il ne suffit pas de livrer du code. L'Art. 13 exige que la notice d'utilisation soit &quot;concise, complète, correcte et
                  claire&quot;. Les lignes directrices de l'EDPS insistent : la transparence n'a de sens que si le système est
                  <strong> interprétable</strong>. Une <strong>boîte noire totale</strong> n'est pas seulement un problème d'opacité, c'est un
                  <strong> risque de sécurité</strong> (impossibilité de détecter les erreurs et dérives).
                </p>
                <p className="text-gray-700 mb-4">
                  La bonne pratique est de documenter le système via une <strong>&quot;System Card&quot; / &quot;Model Card&quot;</strong> : finalité,
                  données d'entraînement, métriques de performance, limites connues, risques résiduels et conditions d'usage.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  Le défi de l'Interaction Humain-Machine (Art. 50)
                </h3>
                <p className="text-gray-700 mb-3">
                  L'objectif est de briser l'illusion d'humanité (effet Eliza).
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li><strong>Chatbots :</strong> L'utilisateur doit savoir <em>dès le début</em> qu'il parle à une IA.</li>
                  <li>
                    <strong>Contenus synthétiques / Deepfakes :</strong> Tout contenu généré ou manipulé (image, son, vidéo) doit être
                    <strong> détectable par machine</strong> (watermarking technique) et <strong>identifiable par l'humain</strong> (label
                    visible).
                  </li>
                  <li><strong>Émotion :</strong> Les systèmes de reconnaissance des émotions (interdits au travail/école, autorisés ailleurs) doivent faire l'objet d'une information préalable.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. LE PLAN D'ACTIONS (FORMAT MATRICIEL)
            </h2>
            <p className="text-gray-700 mb-6">
              Ce tableau distingue les actions selon le type de système et le rôle, en séparant clairement ce qui relève de la{' '}
              <strong>transparence technique (B2B)</strong> et de la <strong>transparence informationnelle (B2C)</strong>.
            </p>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2"><strong>Légende :</strong></p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>🟢 <strong>FOURNISSEUR</strong> (Éditeur du système)</span>
                <span>🔵 <strong>DÉPLOYEUR</strong> (Entreprise utilisatrice)</span>
              </div>
            </div>

            {/* Tableau A */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">A. Pour les Systèmes à HAUT RISQUE (SIA-HR)</h3>
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
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>CONCEPTION</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Concevoir pour l'interprétabilité</strong><br />
                      Développer le système pour permettre l'interprétation des sorties (outputs) par l'utilisateur (éviter les &quot;black
                      box&quot; totales).
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 13 (1)</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Rédiger la Notice d'Utilisation / System Card</strong><br />
                      Inclure : finalité, données d'entraînement (catégories), métriques de performance, limites de performance, risques
                      résiduels, mesures de maintenance et procédure de surveillance humaine.
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 13 (2-3)</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={3}>DÉPLOIEMENT</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Informer les travailleurs</strong><br />
                        Avant la mise en service, informer les représentants du personnel et les employés concernés qu'ils seront soumis à un SIA-HR.
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 (7)</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Construire la Notice RGPD</strong><br />
                      Utiliser les informations techniques fournies par le fournisseur (logique, paramètres pertinents, limites) pour
                      rédiger la politique de confidentialité (Art. 12-14 RGPD) et préparer les explications en cas de décision
                      automatisée (Art. 22 RGPD).
                      </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 13 AI Act &amp; 12-14, 22 RGPD</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      <strong>Informer les personnes affectées</strong><br />
                      Si le SIA prend des décisions (ex: crédit, justice), notifier les personnes concernées, expliquer les critères
                      principaux et les droits de recours / contestation.
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 26 AI Act &amp; 22 RGPD</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tableau B */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">B. Pour les Systèmes à RISQUE LIMITÉ (Art. 50) & GÉNÉRATIFS</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cas d'usage</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Acteur Responsable</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Actions Concrètes à mener</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Référence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Chatbots & Service Client</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong><br />+<br />🔵 <strong>DÉPLOYEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Divulgation de l'identité</strong><br />
                        Afficher clairement : <em>"Je suis un assistant virtuel"</em> ou <em>"Réponse générée par IA"</em> dès le début de l'interaction.
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 50 (1)</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" rowSpan={2}>Deepfakes & Contenu Synthétique</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🟢 <strong>FOURNISSEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Marquage technique (machine-readable)</strong><br />
                        Intégrer des marqueurs lisibles par machine dans les métadonnées des fichiers générés (ex: C2PA, filigranes
                        robustes) pour permettre leur détection automatique.
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 50 (2)</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Étiquetage visible (human-readable)</strong><br />
                        Indiquer visiblement à l'audience que le contenu est artificiel (ex: bandeau &quot;Image générée par IA&quot;,
                        mention &quot;Contenu synthétique&quot; dans la légende).
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 50 (4)</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Reconnaissance des émotions</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">🔵 <strong>DÉPLOYEUR</strong></td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Information préalable</strong><br />
                        Informer les personnes physiques <em>avant</em> le traitement qu'un système analyse leurs émotions (hors cas interdits).
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Art. 50 (3)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span>
                <span style={{ color: '#774792' }}>Conseil de l'expert</span>
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Pour les <strong>Deepfakes</strong> : L'obligation de transparence ne s'applique pas si le contenu est manifestement
                  artistique, satirique ou créatif, MAIS des garanties doivent être prises pour ne pas tromper le public sur l'origine de
                  l'œuvre (Art. 50 §4).
                </p>
                <p>
                  Pour les <strong>GPAI</strong> (Modèles type GPT) : Le fournisseur du modèle doit fournir une documentation technique
                  structurée (souvent sous forme de <em>Model Card</em>) aux fournisseurs de systèmes en aval pour leur permettre de
                  respecter leurs propres obligations de transparence et d'information (Art. 53).
                </p>
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
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    Règlement (UE) 2024/1689 (AI Act)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 13 :</em> Notice d'utilisation pour les Systèmes d'IA à Haut Risque</li>
                    <li>• <em>Art. 50 :</em> Obligations de transparence pour les systèmes génératifs, chatbots et contenus synthétiques</li>
                    <li>• <em>Art. 53 :</em> Obligations de transparence pour les fournisseurs de modèles d'IA à usage général (GPAI)</li>
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
                    <li>• <em>Art. 12-14 :</em> Transparence et information</li>
                    <li>• <em>Art. 22 :</em> Droit à l'explication</li>
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
                    <li>• <em>Chapitre 7 :</em> Transparency Under the AI Act (Florence Guillaume)</li>
                    <li>• <em>Chapitre 14 :</em> Compliance with the AI Act from a Corporate Perspective (Axel Cypel) - <em>Voir section "2.2 Documentation"</em></li>
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
                    EDPS – Guidance on Generative AI and the EUDPR (2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Précisions sur l'information aux individus, la transparence sur les données d'entraînement et le marquage (watermarking)
                    des contenus générés.
                  </p>
                  <a 
                    href="https://www.edps.europa.eu/data-protection/our-work/publications/guidelines/2025-10-28-guidance-generative-ai-strengthening-data-protection-rapidly-changing-digital-era_en" 
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
                    EDPS – AI Risks Management Guidance (Nov. 2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Section 4 : interprétabilité comme condition de la transparence ; Section 5.2.5 : risque d&apos;information insuffisante
                    ou peu claire fournie par le fournisseur.
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

export default FichePratiqueTransparencePage

