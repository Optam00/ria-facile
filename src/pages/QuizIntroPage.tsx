import { useNavigate } from 'react-router-dom'

export const QuizIntroPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Testez vos connaissances sur le RIA
          </h1>

          <div className="space-y-6 text-gray-700">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                À propos du quiz
              </h2>
              <p className="mb-4">
                Plongez dans notre quiz interactif sur le Règlement européen sur l'Intelligence Artificielle (RIA) ! 
                Avec plus de 150 questions soigneusement sélectionnées, testez et approfondissez vos connaissances 
                sur ce texte fondamental.
              </p>
              <p>
                Chaque session de quiz comprend 20 questions tirées au hasard, couvrant différents aspects du RIA.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Comment ça marche ?
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>20 questions aléatoires parmi notre base de données</li>
                <li>Des explications détaillées pour chaque réponse</li>
                <li>Un score final et un badge en fonction de votre performance</li>
                <li>Possibilité de partager vos résultats sur LinkedIn</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Prêt à relever le défi ?
              </h2>
              <p className="mb-6">
                Que vous soyez débutant ou expert, ce quiz vous permettra de tester vos connaissances 
                et d'approfondir votre compréhension du RIA de manière ludique et interactive.
              </p>
              <button
                onClick={() => navigate('/quiz/start')}
                className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-gray-800 font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md border border-blue-200 flex items-center justify-center gap-2 group"
              >
                <span>Démarrer le quiz</span>
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 