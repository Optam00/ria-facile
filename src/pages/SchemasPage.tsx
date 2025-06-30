import React, { useRef } from 'react'
import { Helmet } from 'react-helmet-async'

export const SchemasPage = () => {
  // Référence pour la section du schéma
  const refDateMiseEnOeuvre = useRef<HTMLDivElement>(null)
  const refModeleVsSysteme = useRef<HTMLDivElement>(null)
  const refGPAI = useRef<HTMLDivElement>(null)

  // Fonction de scroll fluide
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Le RIA en schémas - RIA Facile</title>
        <meta name="description" content="Visualisez le règlement IA en schémas et infographies." />
      </Helmet>

      {/* En-tête inspiré de Doctrine/Documentation */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg p-8 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Le RIA en schémas
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Retrouvez ici des schémas et infographies pour mieux comprendre le Règlement IA (AI Act).
          </p>
        </div>
      </div>

      {/* Sommaire dépliant */}
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <details className="bg-white rounded-2xl shadow-md p-6 mb-6" open>
          <summary className="text-xl font-bold text-purple-800 cursor-pointer select-none mb-4 outline-none focus:ring-2 focus:ring-purple-400">
            Sommaire des schémas
          </summary>
          <ul className="space-y-2 pl-2">
            <li>
              <button
                className="text-left text-base text-purple-700 hover:underline focus:outline-none"
                onClick={() => scrollToSection(refDateMiseEnOeuvre)}
              >
                Calendrier d'entrée en application du règlement IA
              </button>
            </li>
            <li>
              <button
                className="text-left text-base text-purple-700 hover:underline focus:outline-none"
                onClick={() => scrollToSection(refModeleVsSysteme)}
              >
                La distinction entre modèle d'IA et système d'IA
              </button>
            </li>
            <li>
              <button
                className="text-left text-base text-purple-700 hover:underline focus:outline-none"
                onClick={() => scrollToSection(refGPAI)}
              >
                Les différents modèles d'IA à usage général
              </button>
            </li>
          </ul>
        </details>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <section className="mb-12" ref={refDateMiseEnOeuvre} id="date-mise-en-oeuvre">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Calendrier d'entrée en application du règlement IA</h2>
            <img src="/src/assets/schemas/Dates.png" alt="Calendrier de mise en œuvre du Règlement IA" className="mx-auto rounded-xl shadow-md max-w-full h-auto mb-8" />

            <ol className="space-y-8 text-gray-800">
              <li>
                <div className="font-semibold text-purple-700 mb-1">1. 2 février 2025 (6 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Interdiction des pratiques d'IA inacceptables.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span> Les règles interdisant les systèmes d'IA qui présentent un risque inacceptable, comme la notation sociale par les gouvernements, la manipulation des comportements ou l'exploitation des vulnérabilités des personnes, deviennent applicables.</div>
                <div className="mb-1"><span className="font-semibold">Articles concernés :</span> Chapitre II (Article 5).</div>
              </li>
              <li>
                <div className="font-semibold text-purple-700 mb-1">2. 2 août 2025 (12 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Gouvernance, modèles d'IA à usage général (GPAI) et sanctions.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span></div>
                <ul className="list-disc ml-8 mb-1">
                  <li>Les obligations pour les fournisseurs de modèles d'IA à usage général (GPAI), comme la documentation technique, la transparence et le respect du droit d'auteur, s'appliquent.</li>
                  <li>La structure de gouvernance (Bureau de l'IA, Comité IA, etc.) doit être fonctionnelle.</li>
                  <li>Les États membres doivent avoir mis en place le régime des sanctions.</li>
                  <li>Les règles sur les organismes notifiés (chargés de la certification des IA à haut risque) entrent en application.</li>
                </ul>
                <div className="mb-1"><span className="font-semibold">Articles concernés :</span></div>
                <ul className="list-disc ml-8">
                  <li>Chapitre V (Articles 51-56) pour les modèles d'IA à usage général.</li>
                  <li>Chapitre VII (Articles 64-70) pour la gouvernance.</li>
                  <li>Chapitre XII (Article 99) pour les sanctions.</li>
                  <li>Chapitre III, Section 4 (Articles 28-39) pour les organismes notifiés.</li>
                </ul>
              </li>
              <li>
                <div className="font-semibold text-purple-700 mb-1">3. 2 août 2026 (24 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Application générale du règlement.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span> La grande majorité des obligations du règlement deviennent applicables, notamment toutes les règles pour les systèmes d'IA classés à haut risque (à l'exception de ceux mentionnés au point suivant).</div>
                <div className="mb-1"><span className="font-semibold">Article concerné :</span> Article 113, qui fixe cette date comme date d'application générale par défaut.</div>
              </li>
              <li>
                <div className="font-semibold text-purple-700 mb-1">4. 2 août 2027 (36 mois après l'entrée en vigueur)</div>
                <div className="mb-1"><span className="font-semibold">Sujet :</span> Systèmes d'IA à haut risque intégrés dans des produits déjà réglementés.</div>
                <div className="mb-1"><span className="font-semibold">Détails :</span> Les obligations pour les systèmes d'IA à haut risque qui sont des composants de sécurité de produits déjà couverts par une autre législation de l'Union (listée à l'Annexe I, comme les jouets, les dispositifs médicaux, les machines, etc.) deviennent applicables.</div>
                <div className="mb-1"><span className="font-semibold">Article concerné :</span> Article 6, paragraphe 1.</div>
              </li>
            </ol>
          </div>
        </section>

        {/* Nouvelle section : Modèle vs Système */}
        <section className="mb-12" ref={refModeleVsSysteme} id="modele-vs-systeme">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">La distinction entre modèle d'IA et système d'IA</h2>
            <img src="/src/assets/schemas/modele%20vs%20systeme.png" alt="Schéma Modèle vs Système d'IA" className="mx-auto rounded-xl shadow-md max-w-full h-auto mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              {/* Modèle d'IA */}
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">Le Modèle d'IA (Le Moteur)</h3>
                <ul className="list-disc ml-5 text-gray-800 space-y-2 mb-4">
                  <li><span className="font-semibold">Nature :</span> C'est un composant, un "cerveau" algorithmique.</li>
                  <li><span className="font-semibold">Fonction :</span> Il est généraliste et adaptable. Il est le résultat d'un processus d'entraînement et peut être intégré dans de multiples applications.</li>
                  <li><span className="font-semibold">Réglementation :</span> Il est réglementé à la source, au niveau de ses fournisseurs. Les règles se concentrent sur la transparence technique et la gestion des risques systémiques potentiels.</li>
                  <li><span className="font-semibold">Exemple :</span> Le modèle de langage GPT-4 en lui-même.</li>
                  <li><span className="font-semibold">Article de définition :</span> Article 3, point 63 (définit le "modèle d'IA à usage général").</li>
                </ul>
              </div>
              {/* Système d'IA */}
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Le Système d'IA (Le Véhicule)</h3>
                <ul className="list-disc ml-5 text-gray-800 space-y-2 mb-4">
                  <li><span className="font-semibold">Nature :</span> C'est le produit final que l'utilisateur déploie ou utilise.</li>
                  <li><span className="font-semibold">Fonction :</span> Il a une finalité précise ("destination") définie par son fournisseur. C'est cette finalité qui détermine son niveau de risque.</li>
                  <li><span className="font-semibold">Réglementation :</span> Il est réglementé en fonction de son risque d'usage. Les règles varient drastiquement selon qu'il est classé comme à risque inacceptable, élevé ou limité.</li>
                  <li><span className="font-semibold">Exemple :</span> Un chatbot de service client qui utilise le modèle GPT-4.</li>
                  <li><span className="font-semibold">Article de définition :</span> Article 3, point 1 (définit le "système d'IA").</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Nouvelle section : GPAI */}
        <section className="mb-12" ref={refGPAI} id="gpai">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Les différents modèles d'IA à usage général</h2>
            <img src="/src/assets/schemas/GPAI.png" alt="Schéma GPAI" className="mx-auto rounded-xl shadow-md max-w-full h-auto mb-8" />
            <div className="text-gray-800 space-y-6">
              <p>La réglementation cible spécifiquement les Modèles d'IA à Usage Général (GPAI - General-Purpose AI models), définis comme des modèles capables d'exécuter un large éventail de tâches distinctes et pouvant être intégrés dans une multitude de systèmes en aval.</p>
              <div className="mb-2"><span className="font-semibold">Article de définition clé :</span> Article 3, point 63.</div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">1. Le Modèle d'IA à Usage Général (Catégorie par défaut)</h3>
                  <ul className="list-disc ml-6 space-y-1 mb-2">
                    <li><span className="font-semibold">Description :</span> C'est la catégorie de base pour tout modèle d'IA à usage général mis sur le marché.</li>
                    <li><span className="font-semibold">Exemples :</span> La plupart des grands modèles de langage (LLM) ou des modèles de génération d'images.</li>
                  </ul>
                  <div className="mb-1 font-semibold">Obligations principales :</div>
                  <ul className="list-disc ml-8 mb-2">
                    <li>Élaborer et tenir à jour une documentation technique pour les développeurs qui intégreront le modèle.</li>
                    <li>Mettre en place une politique de respect du droit d'auteur de l'Union, notamment pour l'entraînement.</li>
                  </ul>
                  <div className="mb-2"><span className="font-semibold">Article clé pour les obligations :</span> Article 53.</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-2">2. Le Modèle d'IA à Usage Général présentant un Risque Systémique</h3>
                  <ul className="list-disc ml-6 space-y-1 mb-2">
                    <li><span className="font-semibold">Description :</span> Il s'agit d'une sous-catégorie des modèles à usage général. Ces modèles sont si puissants ("capacités à fort impact") qu'ils pourraient poser des risques graves à l'échelle de la société (sécurité publique, santé, etc.).</li>
                    <li><span className="font-semibold">Identification :</span> Un modèle est classé dans cette catégorie s'il atteint un seuil très élevé de capacité, présumé lorsque la puissance de calcul utilisée pour son entraînement dépasse 10^25 FLOPs, ou s'il est désigné comme tel par la Commission.</li>
                  </ul>
                  <div className="mb-1 font-semibold">Obligations supplémentaires (en plus de celles de la catégorie 1) :</div>
                  <ul className="list-disc ml-8 mb-2">
                    <li>Réaliser des évaluations du modèle (y compris des tests contradictoires ou "red-teaming").</li>
                    <li>Évaluer et atténuer les risques systémiques.</li>
                    <li>Assurer un haut niveau de cybersécurité.</li>
                    <li>Signaler les incidents graves au Bureau de l'IA.</li>
                  </ul>
                  <div className="mb-2"><span className="font-semibold">Articles clés :</span> Article 51 (classification) et Article 55 (obligations supplémentaires).</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Cas Particulier : Les Modèles sous Licence Libre et Ouverte (Open-Source)</h3>
                  <ul className="list-disc ml-6 space-y-1 mb-2">
                    <li><span className="font-semibold">Traitement :</span> Ils bénéficient d'une exemption significative. En règle générale, ils ne sont pas soumis aux obligations de l'Article 53 (notamment la documentation technique) si leurs paramètres et architecture sont publiquement accessibles.</li>
                    <li><span className="font-semibold">L'exception à l'exemption :</span> Cette exemption ne s'applique pas si un modèle open-source est classé comme présentant un risque systémique. Dans ce cas, il doit se conformer aux obligations supplémentaires.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SchemasPage; 