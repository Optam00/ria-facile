import { Link } from 'react-router-dom'
import consulterImage from '../assets/consulter.jpeg'
import quizImage from '../assets/quiz.jpeg'
import msgImage from '../assets/msg.jpeg'
import accueilImage from '../assets/accueil.jpeg'
import { ActuCarousel } from '../components/ActuCarousel'
import { LastDoctrineArticle } from '../components/LastDoctrineArticle'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { SchemaPreviewHome } from '../components/SchemaPreviewHome'
import { Helmet } from 'react-helmet'

export const HomePage = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  const faqItems = [
    {
      question: "Qu'est-ce que le Règlement IA et quel est son objectif ?",
      answer: "Le <strong>Règlement sur l'Intelligence Artificielle</strong> (ou \"AI Act\") est la première législation transversale au monde visant à encadrer l'IA. Son objectif principal est d'assurer que les systèmes d'IA utilisés dans l'Union européenne soient <strong>sûrs</strong>, <strong>respectueux des droits fondamentaux</strong> et des valeurs de l'UE. Il vise également à renforcer la confiance dans l'IA, à promouvoir l'innovation et à garantir le bon fonctionnement du marché intérieur pour les systèmes d'IA (Article 1). Il adopte une approche basée sur les risques."
    },
    {
      question: "Qui est concerné par le Règlement IA ?",
      answer: "Le règlement s'applique à un large éventail d'acteurs :\n\n- Les <strong>fournisseurs</strong> de systèmes d'IA (ceux qui développent un système d'IA en vue de le mettre sur le marché ou de le mettre en service sous leur propre nom ou marque) (Article 3, point 3).\n- Les <strong>déployeurs</strong> de systèmes d'IA (ceux qui utilisent un système d'IA sous leur autorité, sauf si l'usage est purement personnel) (Article 3, point 4).\n- Les <strong>importateurs</strong> et <strong>distributeurs</strong> de systèmes d'IA (Article 3, points 6 et 7).\n- Les <strong>mandataires</strong> des fournisseurs non établis dans l'UE (Article 3, point 5).\n\nCela concerne les acteurs des secteurs public et privé. Géographiquement, il s'applique aux acteurs situés dans l'UE, mais aussi à ceux situés en dehors de l'UE si leur système d'IA est mis sur le marché ou en service dans l'UE, ou si les sorties produites par le système sont utilisées dans l'UE (Article 2)."
    },
    {
      question: "Quand le Règlement IA entre-t-il en application ?",
      answer: "Le Règlement entre en vigueur 20 jours après sa publication au Journal Officiel (publié le 12 juillet 2024, donc entrée en vigueur le 1er août 2024). Cependant, son application est progressive (Article 113) :\n\n- <strong>6 mois</strong> après l'entrée en vigueur (2 février 2025) : Application des interdictions concernant les pratiques d'IA inacceptables (Article 5). Application des dispositions générales (Chapitres I et II).\n- <strong>12 mois</strong> après l'entrée en vigueur (2 août 2025) : Application des règles concernant la gouvernance et les obligations pour les modèles d'IA à usage général (GPAI) (Chapitre V). Application des sanctions (sauf pour les points ci-dessous).\n- <strong>24 mois</strong> après l'entrée en vigueur (2 août 2026) : Application générale du règlement, y compris les obligations pour les systèmes d'IA à haut risque (sauf exception ci-dessous).\n- <strong>36 mois</strong> après l'entrée en vigueur (2 août 2027) : Application des obligations pour les systèmes d'IA à haut risque qui sont des composants de sécurité de produits déjà couverts par une législation sectorielle listée à l'Annexe I, section A (Article 6, paragraphe 1)."
    },
    {
      question: "Comment le Règlement IA classe-t-il les systèmes d'IA ?",
      answer: "Le Règlement adopte une approche basée sur les risques, classant les systèmes d'IA en quatre catégories principales :\n\n- <strong>Risque inacceptable</strong> : Pratiques d'IA interdites car contraires aux valeurs de l'UE (Article 5).\n- <strong>Haut risque</strong> : Systèmes d'IA soumis à des exigences strictes avant leur mise sur le marché et tout au long de leur cycle de vie (Articles 6 à 15 et obligations connexes).\n- <strong>Risque limité</strong> : Systèmes d'IA soumis à des obligations spécifiques de transparence (Article 50).\n- <strong>Risque minimal</strong> : Majorité des systèmes d'IA. Le règlement n'impose pas d'obligations, mais encourage l'adhésion volontaire à des codes de conduite (considérant 28)."
    },
    {
      question: "Quelles sont les pratiques d'IA interdites (risque inacceptable) ?",
      answer: "Le règlement interdit certaines utilisations de l'IA jugées contraires aux valeurs fondamentales de l'UE (Article 5). Celles-ci incluent notamment :\n\n- Les systèmes manipulant le comportement humain de manière <strong>subliminale</strong> ou <strong>trompeuse</strong> causant un préjudice.\n- L'exploitation des <strong>vulnérabilités</strong> de groupes spécifiques (âge, handicap, situation sociale/économique) causant un préjudice.\n- La <strong>notation sociale généralisée</strong> par les autorités publiques ou à leur demande.\n- L'identification biométrique à distance « en temps réel » dans des espaces accessibles au public à des fins répressives, sauf exceptions très strictes et encadrées.\n- La catégorisation biométrique inférant des données sensibles (origine raciale, opinions politiques, convictions religieuses, orientation sexuelle...), sauf exceptions limitées dans le domaine répressif.\n- Le \"moissonnage\" non ciblé d'images faciales sur internet ou via vidéosurveillance pour créer des bases de données de reconnaissance faciale.\n- La reconnaissance des émotions sur le lieu de travail et dans les établissements d'enseignement (sauf raisons médicales ou de sécurité)."
    },
    {
      question: "Qu'est-ce qu'un système d'IA à \"haut risque\" ?",
      answer: "Un système d'IA est considéré comme à haut risque s'il remplit l'une des deux conditions suivantes (Article 6) :\n\n- Il est un <strong>composant de sécurité</strong> d'un produit (ou est lui-même un produit) couvert par la législation d'harmonisation de l'UE listée à l'Annexe I (ex: machines, jouets, dispositifs médicaux...) ET ce produit requiert une évaluation de conformité par un tiers.\n- Il appartient à l'un des <strong>domaines critiques</strong> listés à l'Annexe III et présente un risque significatif pour la santé, la sécurité ou les droits fondamentaux. L'Annexe III couvre des domaines tels que :\n  - Biométrie (identification, catégorisation)\n  - Infrastructures critiques (gestion, exploitation)\n  - Éducation et formation professionnelle (accès, évaluation, surveillance)\n  - Emploi et gestion des travailleurs (recrutement, évaluation, promotion, résiliation)\n  - Accès aux services essentiels (publics et privés), y compris évaluation de crédit et tarification d'assurance (sauf exceptions)\n  - Répression (évaluation des risques, analyse de preuves, police prédictive ciblée sur individus - si non interdite, etc.)\n  - Migration, asile et contrôle aux frontières (évaluation des risques, vérification de documents, examen des demandes)\n  - Administration de la justice et processus démocratiques (aide à la recherche juridique, influence des élections - si non visé par l'Art 50)\n\nUn système listé à l'Annexe III n'est pas à haut risque s'il ne pose pas de risque significatif de préjudice (par exemple, tâche purement procédurale, amélioration d'une activité humaine préalable, détection de constantes, tâche préparatoire) ET n'effectue pas de profilage (Article 6, paragraphe 3). Le fournisseur doit documenter cette évaluation (Article 6, paragraphe 4)."
    },
    {
      question: "Quelles sont les principales obligations pour les systèmes d'IA à haut risque ?",
      answer: "Les systèmes d'IA à haut risque doivent respecter des exigences strictes tout au long de leur cycle de vie (Chapitre III, Section 2 - Articles 8 à 15). Celles-ci incluent :\n\n- Mise en place d'un <strong>système de gestion des risques</strong> (Article 9).\n- <strong>Gouvernance des données</strong> (qualité, pertinence, représentativité des jeux de données d'entraînement, de validation et de test) (Article 10).\n- <strong>Documentation technique</strong> détaillée (Article 11 et Annexe IV).\n- Capacités d'<strong>enregistrement automatique des événements</strong> (logs) (Article 12).\n- <strong>Transparence</strong> et fourniture d'informations claires aux déployeurs (notice d'utilisation) (Article 13).\n- Mise en place de mesures pour permettre une <strong>surveillance humaine</strong> effective (Article 14).\n- Assurer un niveau approprié d'<strong>exactitude</strong>, de <strong>robustesse</strong> et de <strong>cybersécurité</strong> (Article 15).\n\nDe plus, les fournisseurs doivent mettre en place un système de gestion de la qualité (Article 17), effectuer une évaluation de la conformité (Article 43), apposer le marquage CE (Article 48) et enregistrer le système dans une base de données européenne (Article 49)."
    },
    {
      question: "Quelles sont les obligations spécifiques des déployeurs de systèmes d'IA à haut risque ?",
      answer: "Les déployeurs ont également des obligations importantes (Article 26), notamment :\n\n- Utiliser le système conformément à sa <strong>notice d'utilisation</strong>.\n- Assurer une <strong>surveillance humaine</strong> par du personnel compétent et formé.\n- S'assurer que les <strong>données d'entrée</strong> sous leur contrôle sont pertinentes pour l'usage prévu.\n- <strong>Surveiller le fonctionnement</strong> du système et informer le fournisseur/distributeur en cas de risque ou d'incident grave.\n- Conserver les <strong>logs</strong> générés par le système (si sous leur contrôle).\n- Informer les personnes concernées lorsqu'elles font l'objet d'une décision basée sur un système d'IA à haut risque (sauf exceptions).\n- Pour certains déployeurs (organismes publics, certains acteurs privés fournissant des services publics, etc.), réaliser une <strong>analyse d'impact sur les droits fondamentaux (AIDF)</strong> avant le déploiement (Article 27)."
    },
    {
      question: "Qu'en est-il des modèles d'IA à usage général ?",
      answer: "Le Règlement introduit des règles spécifiques pour les modèles d'IA à usage général (Chapitre V), qui sont des modèles capables d'accomplir une large gamme de tâches (comme les grands modèles de langage).\n\n- Tous les fournisseurs de modèles d'IA à usage général doivent respecter des obligations de transparence, notamment fournir une documentation technique aux fournisseurs en aval (qui intègrent le modèle dans leur propre système IA) (Article 53 et Annexe XII), et mettre en place une politique de respect du droit d'auteur de l'UE (notamment pour l'entraînement).\n- Les modèles d'IA à usage général présentant des risques systémiques (basés sur des capacités élevées, comme un seuil de calcul d'entraînement - initialement >10^25 FLOPS - ou désignés par la Commission) (Article 51) sont soumis à des obligations supplémentaires (Article 55), comme réaliser des évaluations de modèle, évaluer et atténuer les risques systémiques, assurer un niveau adéquat de cybersécurité et signaler les incidents graves.\n- Des codes de bonne pratique sont encouragés pour détailler la mise en œuvre de ces obligations (Article 56).\n\nCes modèles d'IA à usage général sont parfois appelés \"GPAI\", ce qui est l'abréviation du terme en anglais : General Purpose AI model."
    },
    {
      question: "Quelles sont les obligations de transparence spécifiques ?",
      answer: "Au-delà des systèmes à haut risque, certains systèmes d'IA présentent des risques de manipulation ou de tromperie et sont soumis à des obligations de transparence spécifiques (Article 50) :\n\n- Les utilisateurs doivent être informés qu'ils interagissent avec un <strong>système d'IA</strong> (ex: chatbots), sauf si c'est évident.\n- Les contenus audio, image, vidéo ou texte générés ou manipulés par IA qui constituent des \"<strong>hypertrucages</strong>\" (deep fakes) doivent être marqués comme artificiels.\n- Les textes générés par IA et publiés dans le but d'informer le public sur des questions d'intérêt public doivent indiquer qu'ils ont été générés artificiellement (sauf s'il y a eu un contrôle éditorial humain significatif).\n- Les sorties des systèmes d'IA génératifs doivent être marquées de manière lisible par machine comme étant générées ou manipulées artificiellement."
    },
    {
      question: "Comment le Règlement IA sera-t-il appliqué et contrôlé ?",
      answer: `La gouvernance est structurée à plusieurs niveaux (Chapitre VII) :\n\n- Un Bureau européen de l'IA (AI Office) au sein de la Commission européenne, avec un rôle central, notamment pour la surveillance des modèles d'IA à usage général et la coordination. (Article 64)\n- Un Comité européen de l'intelligence artificielle (Comité IA), composé de représentants des États membres, pour assurer une application cohérente. (Article 65)\n- Des autorités nationales compétentes désignées par chaque État membre (autorité notifiante et autorité de surveillance du marché). (Article 70)\n- Un forum consultatif et un groupe scientifique d'experts indépendants pour fournir une expertise. (Articles 67 et 68)`,
    },
    {
      question: "Quelles sont les sanctions en cas de non-conformité ?",
      answer: `Les États membres doivent établir des sanctions effectives, proportionnées et dissuasives (Article 99). Le règlement fixe des plafonds pour les amendes administratives :
- Jusqu'à 35 millions d'euros ou 7% du chiffre d'affaires annuel mondial (le montant le plus élevé étant retenu) pour les infractions aux pratiques interdites (Article 5).
- Jusqu'à 15 millions d'euros ou 3% du chiffre d'affaires annuel mondial pour la non-conformité à la plupart des autres obligations du règlement (y compris celles pour les systèmes à haut risque, les modèles d'IA à usage général, la transparence...).
- Jusqu'à 7,5 millions d'euros ou 1,5% du chiffre d'affaires annuel mondial pour la fourniture d'informations incorrectes, incomplètes ou trompeuses aux autorités ou organismes notifiés.`,
    }
  ]

  // Données structurées pour la FAQ
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer.replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      }
    }))
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>RIA Facile - Comprendre et appliquer le Règlement IA (AI Act, IA Act, RIA)</title>
        <meta name="description" content="RIA Facile vous aide à comprendre et appliquer le Règlement européen sur l'Intelligence Artificielle. Outils interactifs, quiz, schémas explicatifs et documentation complète." />
        <meta name="keywords" content="RIA, AI Act, règlement IA, intelligence artificielle, conformité, Europe, GPAI, systèmes d'IA haut risque, deepfakes, chatbots" />
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>
      
      {/* Carrousel d'actualités */}
      <div className="max-w-5xl mx-auto">
        <ActuCarousel />
      </div>

      {/* Bandeau */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#774792' }}>
                Comprenez et appliquez le Règlement IA en toute simplicité
              </h1>
              <p className="text-xl text-gray-600">
                RIA Facile a été créé pour vous aider dans votre mise en conformité au règlement européen sur l'intelligence artificielle (RIA, AI act, IA act).
              </p>
            </div>
            <div className="hidden md:block h-64 md:h-96 rounded-2xl overflow-hidden">
              <img 
                src={accueilImage}
                alt="Présentation RIA Facile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dernier article de doctrine */}
      <div className="mb-8 max-w-5xl mx-auto">
        <LastDoctrineArticle />
      </div>

      {/* Section des cartes */}
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="inline-block text-3xl font-bold text-purple-800 mb-2 px-4 py-1 bg-white rounded-lg">
              Les fonctionnalités de RIA Facile
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Consulter le RIA */}
            <Link to="/consulter" className="group h-full">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 h-full flex flex-col">
                <div className="flex-shrink-0 p-6 pt-8">
                  <img 
                    src={consulterImage} 
                    alt="Consulter le RIA" 
                    className="w-full h-48 object-contain" 
                  />
                </div>
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Consulter le RIA</h2>
                  <p className="text-gray-600">
                    Explorez le Règlement sur l'Intelligence Artificielle de l'UE de manière simple et intuitive.
                  </p>
                </div>
              </div>
            </Link>

            {/* Quiz */}
            <Link to="/quiz" className="group h-full">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 h-full flex flex-col">
                <div className="flex-shrink-0 p-6 pt-8">
                  <img 
                    src={quizImage} 
                    alt="Quiz sur le RIA" 
                    className="w-full h-48 object-contain" 
                  />
                </div>
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz sur le RIA</h2>
                  <p className="text-gray-600">
                    Testez vos connaissances sur le RIA avec notre quiz interactif.
                  </p>
                </div>
              </div>
            </Link>

            {/* Documentation */}
            <Link to="/documentation" className="group h-full">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 h-full flex flex-col">
                <div className="flex-shrink-0 p-6 pt-8">
                  <img 
                    src={msgImage} 
                    alt="Documentation utile" 
                    className="w-full h-48 object-contain" 
                  />
                </div>
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Documentation utile</h2>
                  <p className="text-gray-600">
                    Découvrez tous les documents utiles pour comprendre le règlement (lignes directrices, etc.)
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Aperçu schéma aléatoire */}
      <div className="mb-8 max-w-5xl mx-auto">
        <SchemaPreviewHome />
      </div>

      {/* Section FAQ */}
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="inline-block text-3xl font-bold text-purple-800 mb-2 px-4 py-1 bg-white rounded-lg">
              FAQ
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full" />
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
                initial={false}
                animate={{ height: openQuestion === index ? 'auto' : 'auto' }}
              >
                <motion.button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-gray-800">{item.question}</span>
                  <motion.div
                    animate={{ rotate: openQuestion === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {openQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <div className="text-gray-600 whitespace-pre-line [&>ul]:list-none [&>ul]:pl-0 [&>ul]:space-y-2 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 [&>ul>li]:before:content-['•'] [&>ul>li]:before:text-purple-500 [&>ul>li]:before:font-bold [&>ul>li]:before:flex-shrink-0 [&>ul>li]:before:mt-1">
                        {(() => {
                          const cleanAnswer = item.answer.replace(/<strong>|<\/strong>/g, '');
                          const lines = cleanAnswer.split('\n');
                          const elements = [];
                          let listItems = [];
                          let currentLi = null;
                          let inList = false;
                          let intro = [];
                          let outro = [];
                          let afterList = false;
                          lines.forEach((line, i) => {
                            if (line.startsWith('- ')) {
                              if (!inList && !afterList) {
                                afterList = true;
                              }
                              if (currentLi !== null) {
                                listItems.push(currentLi);
                              }
                              currentLi = line.substring(2);
                              inList = true;
                            } else if (inList && (line.trim() === '' || i === lines.length - 1)) {
                              if (i === lines.length - 1 && line.trim() !== '') {
                                currentLi += ' ' + line.trim();
                              }
                              if (currentLi !== null) {
                                listItems.push(currentLi);
                                currentLi = null;
                              }
                              inList = false;
                            } else if (inList) {
                              currentLi += ' ' + line.trim();
                            } else if (!afterList && line.trim() !== '') {
                              intro.push(<p key={`intro-${i}`}>{line}</p>);
                            } else if (afterList && line.trim() !== '') {
                              outro.push(<p key={`outro-${i}`}>{line}</p>);
                            }
                          });
                          if (currentLi !== null) {
                            listItems.push(currentLi);
                          }
                          elements.push(...intro);
                          if (listItems.length > 0) {
                            elements.push(
                              <ul key={`ul-end`}>
                                {listItems.map((li, idx) => (
                                  <li key={idx}>{li}</li>
                                ))}
                              </ul>
                            );
                          }
                          elements.push(...outro);
                          return elements;
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 