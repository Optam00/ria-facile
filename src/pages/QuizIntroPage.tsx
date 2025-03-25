import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import presentationQuiz from '../assets/presentation_quiz.jpeg'

export const QuizIntroPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden">
      {/* Fond avec animation subtile */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-[2rem]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne de gauche - Texte */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl font-bold text-[#774792] mb-4"
              >
                Testez vos connaissances sur le Règlement IA
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    À propos du quiz
                  </h2>
                  <p className="text-gray-600">
                    Plongez dans notre quiz interactif sur le Règlement européen sur l'Intelligence Artificielle (RIA) ! 
                    Avec plus de 150 questions soigneusement sélectionnées, testez et approfondissez vos connaissances 
                    sur ce texte fondamental.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Prêt à relever le défi ?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Que vous soyez débutant ou expert, ce quiz vous permettra de tester vos connaissances 
                    et d'approfondir votre compréhension du RIA de manière ludique et interactive.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={() => navigate('/quiz/questions')}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 group"
                  >
                    <span className="text-lg">Démarrer le quiz</span>
                    <motion.svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 3, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </motion.svg>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Colonne de droite - Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative h-[500px] bg-white/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-indigo-100/20" />
              <img 
                src={presentationQuiz} 
                alt="Présentation du quiz RIA" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 