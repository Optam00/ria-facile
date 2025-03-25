import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

interface Question {
  Id: number
  Question: string
  BR: string
  MR1: string
  MR2: string
  MR3: string
  Explication: string
  Theme: string
}

export const QuizPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (questions[currentQuestion]) {
      const answers = [
        questions[currentQuestion].BR,
        questions[currentQuestion].MR1,
        questions[currentQuestion].MR2,
        questions[currentQuestion].MR3
      ].sort(() => Math.random() - 0.5)
      setShuffledAnswers(answers)
    }
  }, [currentQuestion, questions])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')

      if (error) {
        setError(`Erreur: ${error.message}`)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError('Aucune question trouvée dans la base de données')
        setLoading(false)
        return
      }
      
      const shuffledQuestions = data
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(10, data.length))

      setQuestions(shuffledQuestions)
      setLoading(false)
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération des questions')
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answer)
    setShowExplanation(true)
    
    if (answer === questions[currentQuestion].BR) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4 text-gray-800">Chargement du quiz...</h1>
          <p className="text-sm text-gray-600">Connexion à la base de données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl mb-4 text-gray-800">Erreur</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchQuestions}
            className="btn btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const percentage = (score / 10) * 100
    let badge = ""
    if (percentage >= 80) {
      badge = "🏆 Expert du RIA"
    } else if (percentage >= 60) {
      badge = "🎯 Bon niveau sur le RIA"
    } else if (percentage >= 40) {
      badge = "📚 En progression sur le RIA"
    } else {
      badge = "🎓 En apprentissage du RIA"
    }

    const handleShare = () => {
      const text = `${badge} - J'ai obtenu ${score}/10 au quiz sur le Règlement européen sur l'Intelligence Artificielle ! Testez vos connaissances sur https://riafacile.com #RIA #IA #Europe`
      window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank')
    }

    return (
      <div className="min-h-[calc(100vh-5rem)] p-4 flex items-center">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl shadow-sm">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Quiz terminé !</h2>
            <div className="text-xl text-center mb-6 text-gray-700">{badge}</div>
            
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-blue-500"
                    strokeDasharray={`${(percentage / 100) * 553} 553`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800">{score}/10</div>
                    <div className="text-sm text-gray-600">{percentage}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setCurrentQuestion(0)
                  setSelectedAnswer(null)
                  setShowExplanation(false)
                  setScore(0)
                  setQuizCompleted(false)
                  setShuffledAnswers([])
                }}
                className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-gray-800 px-8 py-3 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 group hover:scale-105"
              >
                <span>J'essaie un nouveau quiz</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button
                onClick={handleShare}
                className="w-full bg-[#0077B5] px-8 py-3 rounded-xl hover:bg-[#006399] transition-all duration-300 text-white text-sm flex items-center justify-center gap-2 group hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Partager mon score sur LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <div className="mb-6">
            <span className="text-base font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg shadow-sm">
              Question {currentQuestion + 1}/10
            </span>
          </div>
          
          {questions[currentQuestion] && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 shadow-md border border-blue-100">
                <h2 className="text-lg text-gray-800 animate-fade-in font-medium">
                  {questions[currentQuestion].Question}
                </h2>
              </div>

              <div className="space-y-4 p-6 rounded-xl bg-white shadow-lg border border-gray-100">
                {shuffledAnswers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(answer)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-xl text-gray-700 text-sm transition-all duration-300 transform hover:scale-[1.01] ${
                      selectedAnswer === answer
                        ? answer === questions[currentQuestion].BR
                          ? 'bg-green-50 text-green-800 border-2 border-green-200 shadow-md'
                          : 'bg-red-50 text-red-800 border-2 border-red-200 shadow-md'
                        : 'bg-white hover:bg-gray-50 shadow-md border border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    {answer}
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className="mt-6 animate-fade-in space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
                    <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
                      selectedAnswer === questions[currentQuestion].BR
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {selectedAnswer === questions[currentQuestion].BR
                        ? '✅ Bonne réponse !'
                        : '❌ Mauvaise réponse'}
                    </div>
                    <h3 className="font-bold mb-3 text-base text-gray-800">Explication :</h3>
                    <p className="text-sm leading-relaxed text-gray-700">{questions[currentQuestion].Explication}</p>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswer}
                      className="px-6 py-2 bg-[#774792] text-white rounded-lg hover:bg-[#8a5ba3] transition-colors disabled:opacity-50"
                    >
                      {currentQuestion < 9 ? 'Question suivante' : 'Terminer le quiz'}
                    </button>
                  </div>

                  {/* Bouton discret pour consulter le RIA */}
                  <div className="mt-8 text-center">
                    <a 
                      href="/consulter" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    >
                      Consulter le règlement IA dans un autre onglet
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 