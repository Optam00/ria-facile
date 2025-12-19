import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Card {
  id: number
  title: string
  type: 'simple' | 'pyramid' | 'avatars' | 'timeline'
  content: any
  unlocked: boolean
  completed: boolean
}

const RIAEn5MinutesPage = () => {
  const cards: Card[] = [
    {
      id: 0,
      title: "Qu'est-ce que le Règlement IA ?",
      type: 'simple',
      content: {
        text: "Le Règlement sur l'Intelligence Artificielle (ou \"AI Act\") est la première législation transversale au monde visant à encadrer l'IA. Son objectif principal est d'assurer que les systèmes d'IA utilisés dans l'Union européenne soient sûrs, respectueux des droits fondamentaux et des valeurs de l'UE.",
        highlights: [
          "Renforce la confiance dans l'IA",
          "Promouvoir l'innovation",
          "Garantir le bon fonctionnement du marché intérieur",
          "Approche basée sur les risques"
        ]
      },
      unlocked: true,
      completed: false
    },
    {
      id: 1,
      title: "Qui est concerné ?",
      type: 'avatars',
      content: {
        roles: [
          { id: 0, name: "Fournisseur", description: "Développe un système d'IA en vue de le mettre sur le marché ou de le mettre en service sous son propre nom ou marque (Article 3, point 3)" },
          { id: 1, name: "Déployeur", description: "Utilise un système d'IA sous son autorité, sauf si l'usage est purement personnel (Article 3, point 4)" },
          { id: 2, name: "Autres", description: "Le règlement s'applique également aux importateurs (Article 3, point 6), distributeurs (Article 3, point 7) et mandataires (Article 3, point 5) de systèmes d'IA." }
        ]
      },
      unlocked: false,
      completed: false
    },
    {
      id: 2,
      title: "Quand entre-t-il en application ?",
      type: 'timeline',
      content: {
        dates: [
          { date: "1er août 2024", event: "Entrée en vigueur", description: "20 jours après publication au Journal Officiel (12 juillet 2024)" },
          { date: "2 février 2025", event: "Interdictions", description: "6 mois après entrée en vigueur - Application des pratiques d'IA inacceptables (Article 5)" },
          { date: "2 août 2025", event: "Gouvernance", description: "12 mois après - Règles pour les modèles d'IA à usage général" },
          { date: "2 août 2026", event: "Application générale", description: "24 mois après - Obligations pour les systèmes d'IA à haut risque" },
          { date: "2 août 2027", event: "Composants de sécurité", description: "36 mois après - Systèmes intégrés dans des produits réglementés (Annexe I, section A)" }
        ]
      },
      unlocked: false,
      completed: false
    },
    {
      id: 3,
      title: "Les 4 catégories de risques",
      type: 'pyramid',
      content: {
        levels: [
          { id: 0, level: "Risque inacceptable", color: "red", description: "Pratiques d'IA interdites car contraires aux valeurs de l'UE (Article 5)" },
          { id: 1, level: "Haut risque", color: "orange", description: "Systèmes d'IA soumis à des exigences strictes avant leur mise sur le marché et tout au long de leur cycle de vie (Articles 6 à 15)" },
          { id: 2, level: "Risque limité", color: "yellow", description: "Systèmes d'IA soumis à des obligations spécifiques de transparence (Article 50)" },
          { id: 3, level: "Risque minimal", color: "green", description: "Majorité des systèmes d'IA. Le règlement n'impose pas d'obligations, mais encourage l'adhésion volontaire à des codes de conduite (considérant 28)" }
        ]
      },
      unlocked: false,
      completed: false
    },
    {
      id: 4,
      title: "Pratiques d'IA interdites",
      type: 'simple',
      content: {
        text: "Le règlement interdit certaines utilisations de l'IA jugées contraires aux valeurs fondamentales de l'UE (Article 5), notamment :",
        highlights: [
          "Systèmes manipulant le comportement humain de manière subliminale ou trompeuse causant un préjudice",
          "Exploitation des vulnérabilités de groupes spécifiques (âge, handicap, situation sociale/économique) causant un préjudice",
          "Moissonnage non ciblé d'images faciales sur internet ou via vidéosurveillance pour créer des bases de données de reconnaissance faciale",
          "Notation sociale généralisée évaluant la fiabilité des personnes sur la base de leur comportement social ou de caractéristiques personnelles"
        ]
      },
      unlocked: false,
      completed: false
    },
    {
      id: 5,
      title: "Modèles d'IA à usage général",
      type: 'simple',
      content: {
        text: "Le Règlement introduit des règles spécifiques pour les modèles d'IA à usage général, capables d'accomplir une large gamme de tâches (Chapitre V) :",
        highlights: [
          "Tous les fournisseurs de modèles d'IA à usage général : obligations de transparence, documentation technique, politique de respect du droit d'auteur (Article 53)",
          "Modèles d'IA à usage général à risque systémique (>10^25 FLOPS ou désignés) : évaluations, atténuation des risques systémiques, cybersécurité, signalement d'incidents (Articles 51, 55)",
          "Codes de bonne pratique encouragés pour détailler la mise en œuvre (Article 56)"
        ]
      },
      unlocked: false,
      completed: false
    },
    {
      id: 6,
      title: "Sanctions",
      type: 'simple',
      content: {
        text: "Les États membres doivent établir des sanctions effectives, proportionnées et dissuasives (Article 99) :",
        highlights: [
          "Jusqu'à 35 millions d'€ ou 7% du CA annuel mondial - pratiques interdites (Article 5)",
          "Jusqu'à 15 millions d'€ ou 3% du CA annuel mondial - autres obligations (systèmes à haut risque, modèles d'IA à usage général, transparence...)",
          "Jusqu'à 7,5 millions d'€ ou 1,5% du CA annuel mondial - informations incorrectes aux autorités",
          "Seuils réduits pour les PME et jeunes pousses"
        ]
      },
      unlocked: false,
      completed: false
    }
  ]

  const [currentCard, setCurrentCard] = useState(0)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set())
  const [pyramidLevels, setPyramidLevels] = useState<Set<number>>(new Set())
  const [avatarBubbles, setAvatarBubbles] = useState<Set<number>>(new Set())
  const [unlockedCards, setUnlockedCards] = useState<Set<number>>(new Set([0]))
  const [hasStarted, setHasStarted] = useState(false)
  const CARD_HEIGHT = 384 // h-96
  const CARD_SPACING = 128 // space-y-32
  const VERTICAL_PADDING = 32 // py-8
  const ROBOT_SIZE = 24

  const getCardTop = (index: number) =>
    VERTICAL_PADDING + index * (CARD_HEIGHT + CARD_SPACING)

  const [robotPath, setRobotPath] = useState<number[]>([getCardTop(0)])
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const conclusionRef = useRef<HTMLDivElement | null>(null)
  const pyramidLevelRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  
  // Réinitialiser les interactions quand on change de carte
  useEffect(() => {
    setPyramidLevels(new Set())
    setAvatarBubbles(new Set())
  }, [currentCard])

  // Fonction de défilement personnalisée plus lente
  const smoothScrollTo = (element: HTMLElement, duration: number = 2000) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2) + (element.offsetHeight / 2)
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    let startTime: number | null = null

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      // Fonction d'easing easeInOut
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      window.scrollTo(0, startPosition + distance * ease)
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }
    
    requestAnimationFrame(animation)
  }

  // Défilement automatique quand une carte est complétée
  useEffect(() => {
    if (completedCards.size > 0) {
      const lastCompletedCard = Math.max(...Array.from(completedCards))
      const nextCardIndex = lastCompletedCard + 1
      
      if (nextCardIndex < cards.length && cardRefs.current[nextCardIndex]) {
        // Attendre un peu pour que l'animation du robot commence
        const scrollTimeout = setTimeout(() => {
          const cardElement = cardRefs.current[nextCardIndex]
          if (cardElement) {
            smoothScrollTo(cardElement, 2000) // 2 secondes pour correspondre à l'animation du robot
          }
        }, 200)
        
        return () => clearTimeout(scrollTimeout)
      } else if (completedCards.size === cards.length && conclusionRef.current) {
        // Toutes les cartes sont complétées : défilement vers l'encart de fin
        const scrollTimeout = setTimeout(() => {
          if (conclusionRef.current) {
            smoothScrollTo(conclusionRef.current, 2000)
          }
        }, 200)
        
        return () => clearTimeout(scrollTimeout)
      }
    }
  }, [completedCards, cards.length])

  const handleCardFlip = (cardId: number) => {
    if (!unlockedCards.has(cardId) || flippedCards.has(cardId)) return
    
    setFlippedCards(prev => new Set([...prev, cardId]))
  }

  const handleCardComplete = (cardId: number) => {
    // Marquer la carte comme complétée et débloquer la suivante
    setCompletedCards(prev => new Set([...prev, cardId]))

    // Chemin du robot : bord haut de la carte courante -> bord bas -> bord haut de la carte suivante
    const currentTop = getCardTop(cardId)
    const currentBottom = currentTop + CARD_HEIGHT - ROBOT_SIZE

    if (cardId < cards.length - 1) {
      const nextTop = getCardTop(cardId + 1)
      setRobotPath([currentTop, currentBottom, nextTop])
    } else {
      // Dernière carte : le robot va vers l'encart de fin
      // Position de l'encart de fin : bas de la dernière carte + mt-16 (64px)
      const lastCardBottom = currentTop + CARD_HEIGHT
      const conclusionTop = lastCardBottom + 64 // mt-16 = 64px
      // Chemin : bord haut -> bord bas de la carte -> bord haut de l'encart de fin
      setRobotPath([currentTop, currentBottom, lastCardBottom, conclusionTop])
    }

    if (cardId < cards.length - 1) {
      setUnlockedCards(prev => new Set([...prev, cardId + 1]))
      setCurrentCard(cardId + 1)
    } else {
      // Dernière carte complétée
      setCurrentCard(cardId)
    }
  }

  const handlePyramidClick = (levelId: number) => {
    setPyramidLevels(prev => new Set([...prev, levelId]))
    
    // Défilement automatique vers le niveau cliqué
    setTimeout(() => {
      const levelElement = pyramidLevelRefs.current[levelId]
      if (levelElement) {
        levelElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }, 100)
  }

  const handleAvatarClick = (avatarId: number) => {
    setAvatarBubbles(prev => new Set([...prev, avatarId]))
  }

  const canProceed = (cardId: number) => {
    const card = cards[cardId]
    if (card.type === 'pyramid' && cardId === 3) {
      return pyramidLevels.size === 4
    }
    if (card.type === 'avatars' && cardId === 1) {
      return avatarBubbles.size === 3
    }
    if (card.type === 'timeline') {
      return true
    }
    return true
  }

  const allCardsCompleted = completedCards.size === cards.length

  return (
    <>
      <Helmet>
        <title>Le RIA en 5 minutes | RIA Facile</title>
        <meta name="description" content="Découvrez le Règlement sur l'Intelligence Artificielle (RIA) en 5 minutes : parcours interactif avec des cartes à retourner." />
      </Helmet>
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md p-8 text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#774792' }}>
              Le RIA en 5 minutes
            </h1>
            <p className="text-gray-600 text-lg opacity-70">
              Parcourez les bases du Règlement sur l'Intelligence Artificielle
            </p>
          </div>

          {/* Section d'introduction */}
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-md p-6 text-center mb-8"
            >
              <div className="max-w-2xl mx-auto space-y-3">
                <div className="text-4xl mb-2">📚</div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Un parcours en {cards.length} étapes pour maîtriser les bases du Règlement IA
                </h2>
                <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-4">
                  Découvrez les fondamentaux du Règlement sur l'Intelligence Artificielle (AI Act) de manière ludique et progressive.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-[11px] md:text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>{cards.length} étapes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span>~5 min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🤖</span>
                    <span>Guidé</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => setHasStarted(true)}
                  className="bg-gradient-to-r from-[#774792] to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Commencer le parcours →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Parcours de cartes */}
          {hasStarted && (
            <div className="relative">
            {/* Ligne de parcours en pointillés */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, #774792 30%, rgba(119,71,146,0) 0%)',
                backgroundPosition: 'left top',
                backgroundSize: '1px 12px',
                backgroundRepeat: 'repeat-y'
              }}
            />

            {/* Indicateur animé qui se déplace de point en point */}
            <motion.div
              className="absolute left-1/2 z-10"
              style={{ 
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                marginLeft: '-16px'
              }}
              animate={{ y: robotPath }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut'
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-4 h-4 rounded-full bg-[#774792] border-2 border-white shadow-md"
              />
            </motion.div>

            <div className="space-y-32 py-8">
              {cards.map((card, index) => (
                <div 
                  key={card.id} 
                  className="relative"
                  ref={(el) => {
                    cardRefs.current[card.id] = el
                  }}
                >
                  {/* Connexion au parcours */}
                  {index > 0 && (
                    <div className="absolute left-1/2 -top-32 w-1 h-32 bg-gradient-to-b from-[#774792] to-indigo-500 transform -translate-x-1/2 opacity-30" />
                  )}

                  {/* Carte */}
                  <div className="flex justify-center">
                    <motion.div
                      className="w-full max-w-xl"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className={`relative h-96 cursor-pointer perspective-1000 ${!unlockedCards.has(card.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => unlockedCards.has(card.id) && !flippedCards.has(card.id) && handleCardFlip(card.id)}
                      >
                        <motion.div
                          className="absolute inset-0 preserve-3d"
                          animate={{ rotateY: flippedCards.has(card.id) ? 180 : 0 }}
                          transition={{ duration: 0.6 }}
                        >
                          {/* Face avant */}
                          <div className="absolute inset-0 backface-hidden">
                            <div className={`h-full rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center ${
                              !unlockedCards.has(card.id) 
                                ? 'bg-gray-300' 
                                : 'bg-gradient-to-br from-[#774792] to-indigo-600 text-white'
                            }`}>
                              {!unlockedCards.has(card.id) ? (
                                <div className="text-center">
                                  <div className="text-4xl mb-4">🔒</div>
                                  <p className="text-gray-600 font-semibold">Carte verrouillée</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="text-5xl mb-4">📋</div>
                                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                  <p className="text-xs md:text-sm opacity-90">Cliquez pour retourner</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Face arrière */}
                          <div className="absolute inset-0 backface-hidden transform rotate-y-180">
                            <div className="h-full rounded-2xl shadow-xl bg-white p-6 overflow-y-auto">
                              {card.type === 'simple' && (
                                <div>
                                  <h3 className="text-xl font-bold mb-4 text-gray-800">{card.title}</h3>
                                  <p className={`text-gray-700 text-xs md:text-sm ${card.id === 0 ? 'mb-2' : 'mb-4'}`}>{card.content.text}</p>
                                  {card.id === 0 && (
                                    <p className="text-xs md:text-sm font-semibold text-gray-800 mb-1">Objectifs</p>
                                  )}
                                  <ul className={card.id === 0 ? 'space-y-1.5' : 'space-y-2'}>
                                    {card.content.highlights?.map((highlight: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-[#774792] font-bold">•</span>
                                        <span className="text-gray-700 text-xs md:text-sm">{highlight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  {card.content.examples && (
                                    <p className="text-gray-600 text-xs md:text-sm mt-4 italic">{card.content.examples}</p>
                                  )}
                                  {canProceed(card.id) && (
                                    <motion.button
                                      className="mt-4 w-full bg-[#774792] text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCardComplete(card.id)
                                      }}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.5 }}
                                    >
                                      {card.id < cards.length - 1 ? 'Étape suivante →' : 'Terminer le parcours ✓'}
                                    </motion.button>
                                  )}
                                </div>
                              )}

                              {card.type === 'pyramid' && (
                                <div>
                                  <h3 className="text-xl font-bold mb-4 text-gray-800">{card.title}</h3>
                                  <p className="text-gray-700 mb-4 text-xs md:text-sm">Cliquez sur chaque niveau de la pyramide pour découvrir les détails :</p>
                                  <div className="flex flex-col items-center space-y-1 py-2">
                                    {card.content.levels.map((level: any, i: number) => {
                                      const colorClasses: Record<string, { bg: string, border: string, hover: string, gradient: string }> = {
                                        red: { 
                                          bg: 'bg-red-100', 
                                          border: 'border-red-500', 
                                          hover: 'hover:border-red-400',
                                          gradient: 'from-red-50 to-red-100'
                                        },
                                        orange: { 
                                          bg: 'bg-orange-100', 
                                          border: 'border-orange-500', 
                                          hover: 'hover:border-orange-400',
                                          gradient: 'from-orange-50 to-orange-100'
                                        },
                                        yellow: { 
                                          bg: 'bg-yellow-100', 
                                          border: 'border-yellow-500', 
                                          hover: 'hover:border-yellow-400',
                                          gradient: 'from-yellow-50 to-yellow-100'
                                        },
                                        green: { 
                                          bg: 'bg-green-100', 
                                          border: 'border-green-500', 
                                          hover: 'hover:border-green-400',
                                          gradient: 'from-green-50 to-green-100'
                                        }
                                      }
                                      const colors = colorClasses[level.color] || colorClasses.red
                                      const lightColors: Record<string, string> = {
                                        red: 'bg-red-50',
                                        orange: 'bg-orange-50',
                                        yellow: 'bg-yellow-50',
                                        green: 'bg-green-50'
                                      }
                                      
                                      // Largeurs progressives plus harmonieuses
                                      const widths = ['w-1/2', 'w-2/3', 'w-4/5', 'w-full'] // Du plus étroit (haut) au plus large (bas)
                                      const verticalOffsets = ['mt-0', '-mt-2', '-mt-4', '-mt-6'] // Chevauchement plus prononcé
                                      
                                      return (
                                        <motion.div
                                          key={level.id}
                                          ref={(el) => {
                                            pyramidLevelRefs.current[level.id] = el
                                          }}
                                          className={`${widths[i]} ${verticalOffsets[i]} p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                            pyramidLevels.has(level.id)
                                              ? `bg-gradient-to-br ${colors.gradient} ${colors.border} shadow-md`
                                              : `${lightColors[level.color] || 'bg-gray-50'} border-gray-200 ${colors.hover} shadow-sm`
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handlePyramidClick(level.id)
                                          }}
                                          whileHover={{ scale: 1.01, y: -2 }}
                                          whileTap={{ scale: 0.99 }}
                                        >
                                          <div className="flex items-center justify-center gap-2 mb-1">
                                            <span className={`text-2xl ${pyramidLevels.has(level.id) ? 'opacity-100' : 'opacity-50'}`}>
                                              {i === 0 ? '🔴' : i === 1 ? '🟠' : i === 2 ? '🟡' : '🟢'}
                                            </span>
                                            <span className={`font-semibold text-center ${pyramidLevels.has(level.id) ? 'text-gray-800' : 'text-gray-500'}`}>
                                              {level.level}
                                            </span>
                                            {pyramidLevels.has(level.id) && <span className="text-green-500 text-lg">✓</span>}
                                          </div>
                                          {pyramidLevels.has(level.id) && (
                                            <motion.p
                                              className="text-xs md:text-sm text-gray-700 mt-3 text-center leading-relaxed"
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              transition={{ duration: 0.3 }}
                                            >
                                              {level.description}
                                            </motion.p>
                                          )}
                                        </motion.div>
                                      )
                                    })}
                                  </div>
                                  {pyramidLevels.size === 4 && (
                                    <motion.button
                                      className="mt-4 w-full bg-[#774792] text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCardComplete(card.id)
                                      }}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                    >
                                      Étape suivante →
                                    </motion.button>
                                  )}
                                </div>
                              )}

                              {card.type === 'avatars' && (
                                <div>
                                  <h3 className="text-xl font-bold mb-4 text-gray-800">{card.title}</h3>
                                  <p className="text-gray-700 mb-4 text-xs md:text-sm">Cliquez sur chaque acteur pour découvrir son rôle :</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    {card.content.roles.map((role: any) => (
                                      <div
                                        key={role.id}
                                        className={`relative h-24 cursor-pointer perspective-1000 ${role.id === 2 ? 'col-span-2' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleAvatarClick(role.id)
                                        }}
                                      >
                                        <motion.div
                                          className="absolute inset-0 preserve-3d"
                                          animate={{ rotateY: avatarBubbles.has(role.id) ? 180 : 0 }}
                                          transition={{ duration: 0.6 }}
                                        >
                                          {/* Face avant - Avatar */}
                                          <div className="absolute inset-0 backface-hidden">
                                            <div className="h-full rounded-lg shadow-md p-3 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-2 border-transparent hover:from-indigo-600 hover:to-purple-700 transition-all">
                                              <div className="text-4xl mb-2">👤</div>
                                              <p className="font-semibold text-xs md:text-sm text-center">
                                                {role.name}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Face arrière - Description */}
                                          <div className="absolute inset-0 backface-hidden transform rotate-y-180">
                                            <div className="h-full rounded-lg shadow-md bg-white p-3 overflow-y-auto border-2 border-indigo-200">
                                              <p className="text-xs md:text-sm text-gray-700 leading-relaxed text-center">
                                                {role.description}
                                              </p>
                                            </div>
                                          </div>
                                        </motion.div>
                                      </div>
                                    ))}
                                  </div>
                                  {avatarBubbles.size === 3 && (
                                    <motion.button
                                      className="mt-4 w-full bg-[#774792] text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCardComplete(card.id)
                                      }}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                    >
                                      Étape suivante →
                                    </motion.button>
                                  )}
                                </div>
                              )}

                              {card.type === 'timeline' && (
                                <div>
                                  <h3 className="text-xl font-bold mb-4 text-gray-800">{card.title}</h3>
                                  <div className="space-y-2">
                                    {card.content.dates.map((dateItem: any, i: number) => (
                                      <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-3 h-3 rounded-full bg-[#774792] mt-1"></div>
                                          {i < card.content.dates.length - 1 && (
                                            <div className="w-0.5 h-8 bg-gray-300 ml-1.5"></div>
                                          )}
                                        </div>
                                        <div className="flex-1 pb-2">
                                          <p className="font-semibold text-gray-800">
                                            {dateItem.date} - <span className="text-xs md:text-sm font-medium text-[#774792]">{dateItem.event}</span>
                                          </p>
                                          <p className="text-xs md:text-sm text-gray-600 mt-1">{dateItem.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <motion.button
                                    className="mt-4 w-full bg-[#774792] text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCardComplete(card.id)
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    Étape suivante →
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Page de conclusion */}
          {allCardsCompleted && (
            <motion.div
              ref={conclusionRef}
              className="mt-16 bg-gradient-to-r from-[#774792] to-indigo-600 text-white p-8 rounded-2xl shadow-xl text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Ça y est, tu as les bases !</h2>
              <p className="text-lg mb-6 opacity-90">
                Tu connais maintenant les fondamentaux du Règlement sur l'Intelligence Artificielle. 
                Navigue sur le site pour en découvrir davantage !
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/schemas"
                  className="bg-white text-[#774792] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  📊 Le RIA en schémas
                </Link>
                <Link
                  to="/consulter"
                  className="bg-white text-[#774792] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  📖 Consulter le texte
                </Link>
                <Link
                  to="/assistant-ria"
                  className="bg-white text-[#774792] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  🤖 Assistant RIA
                </Link>
                <Link
                  to="/quiz"
                  className="bg-white text-[#774792] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  ❓ Quiz
                </Link>
                <Link
                  to="/verificateur/systeme-ia"
                  className="bg-white text-[#774792] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  ✅ Vérifier mon système
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  )
}

export { RIAEn5MinutesPage }
