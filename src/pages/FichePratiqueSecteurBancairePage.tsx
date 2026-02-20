import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { AdherentOnlyOverlay } from '../components/AdherentOnlyOverlay'

const FichePratiqueSecteurBancairePage: React.FC = () => {
  const [sourcesOuvertes, setSourcesOuvertes] = useState(false)

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>L&apos;AI Act dans le secteur bancaire &amp; financier — Fiche pratique | RIA Facile</title>
        <meta
          name="description"
          content="Guide pratique pour appliquer l'AI Act dans le secteur bancaire et financier : scoring crédit, assurance, biais, FRIA et intégration au cadre prudentiel."
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
                FICHE PRATIQUE : L&apos;AI ACT DANS LE SECTEUR BANCAIRE &amp; FINANCIER
              </h1>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Articles RIA associés :</p>
                <div className="flex flex-wrap gap-2">
                  {['6', '17', '27', '86'].map((article) => (
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
              Le <strong>secteur bancaire et financier</strong> bénéficie d&apos;un <strong>régime d&apos;intégration</strong> spécifique
              (Art. 17), mais fait l&apos;objet d&apos;une <strong>surveillance renforcée</strong> sur les risques de biais, d&apos;exclusion
              financière et de dérive des modèles.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Périmètre Haut Risque (Annexe III, point 5) :</h3>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>
                    <strong>✅ Scoring &amp; solvabilité :</strong> systèmes évaluant la capacité de remboursement ou la note de crédit des
                    personnes physiques.
                  </li>
                  <li>
                    <strong>✅ Assurance :</strong> systèmes d&apos;évaluation des risques et de tarification en assurance{' '}
                    <strong>Vie &amp; Santé</strong>.
                  </li>
                  <li>
                    <strong>❌ Fraude &amp; Blanchiment (AML) :</strong> non classés haut risque par défaut (sauf recours à la biométrie ou
                    à des formes de profilage très sensibles), ce qui allège la charge de conformité au titre de l&apos;AI Act.
                  </li>
                </ul>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6 py-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Le guichet unique (Art. 17 AI Act) :</h3>
                <p className="text-gray-700">
                  Les banques et assureurs ne se voient pas imposer une nouvelle autorité spécialisée IA : la conformité à l&apos;AI Act
                  est intégrée dans la <strong>supervision prudentielle existante</strong>.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>
                    les exigences IA sont prises en compte dans le <strong>SREP</strong> (Supervisory Review and Evaluation Process) ;
                  </li>
                  <li>
                    l&apos;autorité de surveillance de l&apos;IA est l&apos;<strong>ACPR/BCE</strong> ou l&apos;autorité financière compétente,
                    pas une nouvelle structure autonome.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2L font-bold mb-6" style={{ color: '#774792' }}>
              2. LE CADRE EN BREF : LA DOUBLE CASQUETTE
            </h2>
            <p className="text-gray-700 mb-4">
              Une banque ne se contente pas d&apos;acheter des logiciels : elle est souvent à la fois <strong>Déployeur</strong> et{' '}
              <strong>Fournisseur</strong> de systèmes d&apos;IA.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                <strong>Déployeur (Utilisateur)</strong> : lorsqu&apos;elle achète un chatbot, un outil de cybersécurité ou un moteur de
                recommandation.
              </li>
              <li>
                <strong>Fournisseur (Fabricant)</strong> : lorsqu&apos;elle développe en interne son propre algorithme de{' '}
                <strong>credit scoring</strong> ou de tarification.
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              Conséquence : la banque doit assumer simultanément les obligations lourdes de <strong>conception</strong> (Art. 16 : gestion
              des données, logs, documentation technique) et celles de <strong>déploiement</strong> (Art. 26 : surveillance, information,
              supervision humaine).
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="font-semibold text-gray-900 mb-2">Un cadre multi-normes :</p>
              <p className="text-gray-700 mb-2">
                L&apos;AI Act ne vit pas en vase clos : il doit être articulé avec d&apos;autres textes sectoriels.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  <strong>RGPD</strong> : droits des personnes, transparence et droit à l&apos;explication (Art. 13–15 &amp; 22).
                </li>
                <li>
                  <strong>Régulation financière</strong> (CRD IV/CRR, Solvabilité II, lignes directrices EBA/EIOPA) : gouvernance, appétit
                  au risque, modèles internes.
                </li>
                <li>
                  <strong>Directive Crédit à la Consommation (CCD révisée)</strong> : règles spécifiques sur l&apos;évaluation de la
                  solvabilité, à coordonner avec les exigences de l&apos;AI Act.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              3. DÉCRYPTAGE : LES RISQUES CIBLÉS PAR L&apos;EDPS (GUIDANCE 2025)
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Le biais historique (Historical Bias)
                </h3>
                <p className="text-gray-700 mb-4">
                  Les données historiques de crédit reflètent souvent des <strong>décennies de discriminations</strong> implicites
                  (territoires défavorisés, profils atypiques, minorités, femmes). En entraînant un modèle sur 10 ou 20 ans
                  d&apos;historique sans correctif, on reproduit mathématiquement ce <strong>historical bias</strong>.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Les variables de substitution (Proxy Variables)
                </h3>
                <p className="text-gray-700 mb-4">
                  Supprimer la variable &quot;sexe&quot; ou &quot;origine&quot; ne suffit pas si le modèle continue d&apos;utiliser des{' '}
                  <strong>variables corrélées</strong> (code postal, habitudes d&apos;achat, type de contrat, canal de souscription, etc.).
                  L&apos;EDPS (section 5.1) alerte spécifiquement sur ces <strong>Proxy Variables</strong> qui perpétuent la discrimination
                  de manière cachée.
                </p>
                <p className="text-gray-700">
                  Les auditeurs attendent donc des <strong>tests dédiés</strong> pour identifier ces corrélations et prouver que le modèle
                  ne discrimine pas indirectement des groupes protégés.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  La dérive (Data Drift) dans un environnement macro-économique instable
                </h3>
                <p className="text-gray-700 mb-4">
                  Les modèles de scoring et de tarification sont <strong>très sensibles au contexte économique</strong>. Un modèle entraîné
                  en période de croissance peut devenir inadapté en période de crise (inflation forte, hausse soudaine des taux,
                  changement de comportement des emprunteurs).
                </p>
                <p className="text-gray-700">
                  L&apos;EDPS insiste sur la nécessité d&apos;un <strong>monitoring continu</strong> (section 5.2.4 de la guidance Risk
                  Management) avec des seuils d&apos;alerte clairs : si les performances se dégradent ou si des populations sont de plus en
                  plus exclues, le modèle doit être <strong>réévalué, corrigé ou suspendu</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#774792' }}>
              4. PLAN D&apos;ACTIONS (FORMAT MATRICIEL)
            </h2>
            <p className="text-gray-700 mb-6">
              Ce plan structure les actions selon les <strong>phases de vie du modèle</strong> et les{' '}
              <strong>cadres juridiques</strong> applicables (AI Act, RGPD, régulation financière).
            </p>

            {/* Tableau A : Conception */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">A. Phase de Conception (BUILD)</h3>
              <p className="text-gray-700 mb-3">Cas fréquent : la banque développe elle-même son modèle de scoring ou de tarification.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre &amp; Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Nettoyage des biais &amp; Proxy Variables</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        AI Act (Art. 10) <br />
                        EDPS Risk Guidance (section 5.1)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Identifier et réduire les <strong>biais historiques</strong> dans les jeux de données (sexe, origine, territoire,
                            statut socio-économique, type de contrat).
                          </li>
                          <li>
                            Chasser les <strong>Proxy Variables</strong> : tester l&apos;impact de variables comme le code postal ou les
                            habitudes d&apos;achat et documenter les arbitrages.
                          </li>
                          <li>
                            Utiliser des <strong>métriques de fairness</strong> (ex. demographic parity, equal opportunity) pour valider
                            le dataset et les sorties.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Documentation technique</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        AI Act (Annexe IV) <br />
                        Art. 16 AI Act
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Constituer en interne le <strong>dossier technique complet</strong> (données, métriques, robustesse, sécurité) si
                            le modèle est développé par la banque elle-même.
                          </li>
                          <li>
                            Intégrer cette documentation au dispositif de <strong>contrôle interne</strong> et au{' '}
                            <strong>catalogue des modèles</strong> utilisé par la fonction risque.
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tableau B : Mise en conformité */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">B. Phase de Mise en Conformité (SETUP)</h3>
              <p className="text-gray-700 mb-3">Avant la mise en production des modèles de scoring ou d&apos;assurance.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre &amp; Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        FRIA (Analyse d&apos;impact droits fondamentaux)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 27)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Obligatoire pour les <strong>systèmes de scoring crédit</strong> et d&apos;
                            <strong>assurance vie/santé</strong>.
                          </li>
                          <li>
                            Évaluer l&apos;impact sur la <strong>non-discrimination</strong>, l&apos;
                            <strong>exclusion financière</strong> et l&apos;accès aux services essentiels.
                          </li>
                          <li>
                            Si possible, <strong>consulter des représentants des clients</strong> ou associations d&apos;usagers.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                        Définition du &quot;Human-in-the-loop&quot;
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">AI Act (Art. 14) &amp; RGPD (Art. 22)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Définir le rôle du <strong>conseiller bancaire / souscripteur</strong> : il ne doit pas être un simple
                            &quot;clique-bouton&quot;.
                          </li>
                          <li>
                            Formaliser sa capacité à <strong>overrider</strong> (ignorer) le score en s&apos;appuyant sur des éléments
                            qualitatifs (connaissance du client, contexte spécifique).
                          </li>
                          <li>
                            Former les conseillers au <strong>biais d&apos;automatisation</strong> : ne pas accepter systématiquement la
                            recommandation de l&apos;IA sans analyse critique.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Documentation technique (achat de modèle)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        AI Act (Annexe IV) <br />
                        The Academic Guide to AI Act Compliance
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        Si la banque utilise un modèle tiers (Fintech, fournisseur GPAI) :
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>exiger une <strong>System Card / Model Card</strong> documentant données, métriques, limites ;</li>
                          <li>
                            vérifier la compatibilité avec les exigences internes de <strong>modèle risk management</strong>.
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tableau C : Exploitation */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">C. Phase d&apos;Exploitation (RUN)</h3>
              <p className="text-gray-700 mb-3">Pendant la vie opérationnelle du modèle.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Cadre &amp; Réf.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Détails opérationnels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Explication contrefactuelle</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        AI Act (Art. 86) <br />
                        RGPD (Art. 13–15 &amp; 22)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            En cas de <strong>refus de crédit</strong> ou de tarification défavorable, fournir une{' '}
                            <strong>explication contrefactuelle</strong> : indiquer ce qui aurait dû changer pour que la demande soit
                            acceptée (ex. &quot;si votre taux d&apos;endettement était inférieur à 30%, le prêt aurait été accepté&quot;).
                          </li>
                          <li>Éviter le jargon technique et les explications purement statistiques.</li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Monitoring de la dérive</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">EDPS Risk Guidance (section 5.2.4)</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Suivre les performances du modèle par segment de clientèle, produit, région, etc.</li>
                          <li>
                            Définir des <strong>seuils d&apos;alerte</strong> (hausse des défauts, refus massifs pour un segment) déclenchant
                            une revue ou un ré-entraînement.
                          </li>
                          <li>
                            En cas de dérive importante, repasser temporairement en <strong>mode manuel</strong> ou hybride.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">Gestion des plaintes</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        AI Act (Art. 86) <br />
                        RGPD (Art. 22)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Mettre en place un <strong>canal de contestation</strong> permettant au client de demander un réexamen humain
                            de la décision.
                          </li>
                          <li>
                            S&apos;assurer que la plainte déclenche une réelle <strong>intervention humaine</strong> (et non une simple
                            ré-exécution automatique du modèle).
                          </li>
                        </ul>
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
                5. SOURCES ET RÉFÉRENCES ACTUALISÉES (2025)
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
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">The Academic Guide to AI Act Compliance (2025)</h3>
                  <p className="text-gray-700 mb-2">
                    Apport : analyse détaillée de l&apos;<strong>Annexe III</strong> (Haut Risque) et de l&apos;articulation avec les
                    régulations sectorielles, en particulier le <strong>chapitre sur les services financiers</strong>.
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
                <div className="border-l-4 border-blue-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    EDPS (CEPD) – Guidance for Risk Management of AI Systems (11 nov. 2025)
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Apport : mise en avant du <strong>risque de biais</strong> (section 5.1) et du <strong>Data Drift</strong> (section
                    5.2.4), critiques pour les modèles de scoring et d&apos;assurance.
                  </p>
                  <a
                    href="https://www.edps.europa.eu/system/files/2025-11/2025-11-11_ai_risks_management_guidance_en.pdf"
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
                <div className="border-l-4 border-purple-500 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Règlement (UE) 2024/1689 (AI Act)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>
                      • <em>Art. 6 &amp; Annexe III :</em> classification des systèmes d&apos;IA à haut risque (dont scoring et assurance).
                    </li>
                    <li>• <em>Art. 17 :</em> intégration de la supervision IA dans la supervision bancaire et financière.</li>
                    <li>• <em>Art. 27 :</em> FRIA obligatoire pour les cas d&apos;usage financiers visés.</li>
                    <li>• <em>Art. 86 :</em> information sur les décisions significatives, support de l&apos;explication contrefactuelle.</li>
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
                <div className="border-l-4 border-blue-400 pl-6 py-3">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Règlement (UE) 2016/679 (RGPD)</h3>
                  <ul className="text-gray-700 mb-2 space-y-1">
                    <li>• <em>Art. 22 :</em> décision automatisée et profilage (dont octroi de crédit et tarification d&apos;assurance).</li>
                    <li>• <em>Art. 13–15 :</em> transparence et information des personnes concernées.</li>
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
                <strong className="text-gray-900">Important :</strong> Cette fiche pratique peut impliquer des simplifications pour
                faciliter la compréhension. Une lecture attentive du texte officiel du Règlement IA et des régulations financières est
                nécessaire pour une application complète et précise.
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

export default FichePratiqueSecteurBancairePage


