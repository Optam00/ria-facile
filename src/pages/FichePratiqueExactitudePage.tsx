import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueExactitudePage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Gérer l'exactitude (Accuracy) dans les systèmes IA — Fiche pratique | RIA Facile</title>
        <meta name="description" content="Guide pratique pour la mise en conformité opérationnelle du principe d'exactitude dans les systèmes IA. Croisement RGPD et AI Act." />
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
              L'exactitude se joue sur deux tableaux juridiques distincts qu'il est essentiel de ne pas confondre :
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  1) Exactitude des données (RGPD – Art. 5(1)(d) & 16) :
                </h3>
                <p className="text-gray-700">
                  Une donnée personnelle (ex : adresse, âge, montant de salaire) doit être factuellement correcte. C'est une obligation binaire : la donnée est
                  <strong> vraie ou fausse</strong>. Le responsable de traitement doit corriger ou effacer sans délai les données inexactes.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  2) Précision statistique du modèle (AI Act – Art. 10 & 15) :
                </h3>
                <p className="text-gray-700">
                  Le modèle doit produire des résultats fiables avec un <strong>taux d'erreur maîtrisé</strong>. L'exactitude est ici probabiliste (métriques de
                  performance, niveau de confiance), et se gère via la qualité des données, la robustesse et la surveillance continue.
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
              Le Contrôleur Européen de la Protection des Données (EDPS/CEPD) souligne que le risque principal réside dans le
              <strong> décalage entre la performance globale du modèle et la réalité individuelle</strong>.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-4">
              <p className="font-semibold text-gray-900 mb-2">Le constat :</p>
              <p className="text-gray-700 mb-4">
                Un modèle peut afficher 98&nbsp;% de réussite et être jugé non conforme s'il
                <strong> hallucine</strong> des faits sur une personne, ou s'il se trompe systématiquement sur une population (ex : minorités,
                profils atypiques) faute de représentativité des données.
              </p>
              <p className="font-semibold text-gray-900 mb-2">L'enjeu :</p>
              <p className="text-gray-700">
                Passer d'une simple vérification ponctuelle de la donnée à une <strong>gouvernance continue de l'exactitude</strong> :
                qualité des données en entrée, robustesse technique du modèle, supervision humaine et procédures de rectification en sortie.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. DÉCRYPTAGE OPÉRATIONNEL : LES 3 DIMENSIONS
            </h2>
            <p className="text-gray-700 mb-6">
              Selon les guidelines 2025 du CEPD, l'exactitude se gère à trois niveaux complémentaires :
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-3xl mb-3">1️⃣</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Input (Données d'entraînement)</h3>
                <p className="text-gray-700 text-sm">
                  Les données sont-elles <strong>complètes, pertinentes et représentatives</strong> ? Ont-elles été mises à jour récemment ?
                  Cette étape conditionne la performance statistique du modèle. <em>(AI Act Art. 10)</em>.
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
                <div className="text-3xl mb-3">2️⃣</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Processing (Le Modèle)</h3>
                <p className="text-gray-700 text-sm">
                  Le modèle est-il <strong>robuste</strong> face aux erreurs, aux données bruitées et aux attaques (ex : data poisoning) ?
                  Ses métriques (accuracy, recall, F1) sont-elles suivies dans le temps ? <em>(AI Act Art. 15)</em>.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-3xl mb-3">3️⃣</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Output (La Décision/Inférence)</h3>
                <p className="text-gray-700 text-sm">
                  Le système permet-il de <strong>corriger une erreur</strong> sans réentraîner tout le modèle (ex : filtres, RAG,
                  base de connaissances de référence) ? Comment sont gérés les droits des personnes (rectification, contestation) ?
                  <em>(RGPD Art. 16 & 22)</em>.
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
              Ce plan distingue les actions selon que vous <strong>construisez</strong> l'IA (Fournisseur) ou que vous
              l'<strong>utilisez</strong> (Déployeur/RT), en précisant le cadre légal applicable.
            </p>

            {/* Phase A */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                A. Phase de Conception & Développement (BUILD)
              </h3>
              <p className="text-gray-600 mb-4 italic">
                Concerne le <strong>Fournisseur</strong> (ou le RT qui entraîne un modèle en interne).
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
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Gouvernance des Données</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 10)<br />
                        <strong>RGPD</strong> (Art. 5)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • S'assurer que les jeux de données sont <strong>pertinents, représentatifs et sans erreurs dans la mesure du possible</strong> (clause clé de l'Art. 10).<br />
                        • Documenter la <strong>source</strong>, la <strong>période de collecte</strong> et les principales limites.<br />
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
                        • Aller au-delà du seul taux d'<em>accuracy</em> global.<br />
                        • Mesurer les performances par <strong>sous-groupes</strong> (genre, âge, zone géographique).<br />
                        • <strong>Livrable :</strong> Rapport de validation technique incluant les métriques désagrégées.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Design for Rectification (RAG & filtres)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Fournisseur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>EDPS</strong> – Generative AI Guidance<br />
                        <strong>RGPD</strong> (Art. 25)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Pour l'IA générative, privilégier le <strong>RAG (Retrieval-Augmented Generation)</strong> : connecter le modèle à une base de connaissances fiable pour corriger les faits sans réentraînement complet.<br />
                        • Prévoir des <strong>filtres</strong> ou règles métier pour bloquer certaines réponses (listes noires, topics interdits).<br />
                        • Si une correction technique est impossible, documenter clairement cette limite.
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
                        • Créer une <strong>Model Card</strong> : cas d'usage couverts, métriques, limites connues, contextes déconseillés.<br />
                        • Documenter les arbitrages sur la qualité des données (quelles données ont été exclues, pourquoi).
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
                Concerne le <strong>Déployeur</strong> (l'organisation qui utilise l'IA), souvent <strong>Responsable de Traitement (RT)</strong>.
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
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Due Diligence & Biais</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur (RT)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 28)<br />
                        <strong>AI Act</strong> (Art. 26)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Demander les métriques de performance et la description des jeux de données d'entraînement.<br />
                        • Vérifier la pertinence des données par rapport à <em>votre</em> population (ex : éviter un modèle RH entraîné aux USA pour recruter en France).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Double Analyse d'Impact</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur (RT)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 35)<br />
                        <strong>AI Act</strong> (Art. 27)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • <strong>DPIA (RGPD)</strong> : obligatoire en cas de risque élevé pour la vie privée (profilage, décisions automatisées).<br />
                        • <strong>FRIA (AI Act)</strong> : obligatoire uniquement pour certains déployeurs (organismes publics, banques, assurances) utilisant des SIA à haut risque, pour évaluer l'impact sur <strong>tous les droits fondamentaux</strong>.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Configuration des Seuils</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 15)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Ne pas accepter les réglages par défaut. Définir un <strong>seuil de confiance</strong> adapté (ex : en dessous de 85&nbsp;% de confiance, escalade humaine obligatoire).<br />
                        • Désactiver les fonctionnalités non nécessaires (réduction de surface de risque).
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
                Concerne le <strong>Déployeur</strong> au quotidien (exploitation, supervision, mises à jour).
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
                        • Former les opérateurs au <strong>biais d'automatisation</strong> (tendance à suivre aveuglément la machine).<br />
                        • L'humain doit pouvoir <strong>bloquer ou corriger</strong> toute décision critique (recrutement, crédit, santé).
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Transparence & Présentation des Résultats</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>AI Act</strong> (Art. 13, 50)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Indiquer clairement « <strong>Généré par IA</strong> » ou « Décision assistée par IA ».<br />
                        • Afficher le <strong>score de confiance</strong> ou une échelle qualitative (faible / moyen / élevé) lorsque c'est pertinent.
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Gestion du "Droit à la Rectification"</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur (RT)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>RGPD</strong> (Art. 16)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>Procédure critique :</strong> Si une personne conteste une décision ou signale une erreur :<br />
                        1. Vérifier manuellement la donnée ou la décision.<br />
                        2. Corriger la décision et consigner la modification.<br />
                        3. Mettre à jour la base de connaissances (RAG) ou ajouter un filtre pour empêcher la récidive.
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Monitoring du « Data Drift »</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">Déployeur</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <strong>EDPS</strong> – Risk Management Guidance<br />
                        <strong>AI Act</strong> (Chap. IX – Suivi post-commercialisation)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        • Mettre en place des <strong>revues périodiques</strong> (ex : trimestrielles) pour vérifier que les performances restent stables sur des échantillons récents.<br />
                        • Définir un seuil d'alerte : si la performance chute au-delà d'un certain niveau, enclencher une <strong>réévaluation complète</strong> (réentraînement, recalibrage des seuils, suspension).
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
                <span style={{ color: '#774792' }}>Focus : Types de systèmes et niveau d'effort</span>
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li>
                  <strong className="text-gray-900">Systèmes d'IA à Haut Risque</strong> (Annexe III AI Act – ex : RH, scoring, biométrie) :<br />
                  Toutes les actions du plan ci-dessus deviennent <strong>obligatoires</strong>, avec un niveau d'exigence maximal sur la qualité des données, la robustesse et la supervision.
                </li>
                <li>
                  <strong className="text-gray-900">Systèmes d'IA à Risque Limité</strong> (ex : chatbots, assistants IA internes) :<br />
                  L'accent est mis sur la <strong>transparence</strong> et la <strong>capacité de rectification</strong> plutôt que sur des métriques de performance très fines.
                </li>
                <li>
                  <strong className="text-gray-900">Modèles d'IA à usage général (GPAI)</strong> :<br />
                  Le fournisseur doit documenter les limites et les risques (Art. 53 AI Act) ; le déployeur doit prévoir des <strong>garde-fous</strong> (RAG, filtres, supervision humaine) pour maîtriser les erreurs factuelles et les hallucinations.
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
                    1. EDPS (CEPD) – Guidance for Risk Management of AI Systems (11 nov. 2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Définit la méthodologie de gestion des risques, le concept de <strong>Data Drift</strong> et la distinction entre
                    exactitude statistique et exactitude des données.
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
                    2. EDPS – Generative AI and the EUDPR (oct. 2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Recommande l'usage du <strong>RAG</strong> et de filtres pour gérer l'exactitude et les hallucinations dans les modèles de type LLM.
                  </p>
                  <a 
                    href="https://www.edps.europa.eu/data-protection/our-work/publications/guidelines/2025-10-28-guidance-generative-ai-strengthening-data-protection-rapidly-changing-digital-era_en" 
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
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    3. EDPB – Opinion 28/2024 on AI Models
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Précise la base légale et la chaîne de responsabilité entre <strong>fournisseurs</strong> de modèles et <strong>déployeurs</strong> de systèmes.
                  </p>
                  <a 
                    href="https://www.edpb.europa.eu/system/files/2024-12/edpb_opinion_202428_ai-models_en.pdf" 
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
                    4. Règlement (UE) 2024/1689 (AI Act)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 10 :</em> Données et gouvernance des données.</li>
                    <li>• <em>Art. 15 :</em> Exactitude, robustesse et cybersécurité.</li>
                    <li>• <em>Art. 27 :</em> FRIA (analyse d'impact sur les droits fondamentaux).</li>
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
                    5. Règlement (UE) 2016/679 (RGPD)
                  </h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 5(1)(d) :</em> Principe d'exactitude.</li>
                    <li>• <em>Art. 16 :</em> Droit de rectification.</li>
                    <li>• <em>Art. 35 :</em> AIPD / DPIA.</li>
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
      </AdherentOnlyOverlay>
    </div>
  )
}

export default FichePratiqueExactitudePage

