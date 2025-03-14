import { useNavigate } from 'react-router-dom'

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
          Bienvenue sur RIA Facile
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Votre guide interactif pour comprendre et maîtriser le Règlement européen sur l'Intelligence Artificielle
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Consulter Section */}
          <div 
            onClick={() => navigate('/consulter')}
            className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Consulter le RIA</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Parcourez le Règlement sur l'Intelligence Artificielle article par article. Une lecture claire et structurée pour comprendre chaque aspect du règlement.
            </p>
            <span className="text-indigo-500 font-medium flex items-center group">
              Accéder au règlement
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>

          {/* Quiz Section */}
          <div 
            onClick={() => navigate('/quiz')}
            className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Quiz Interactif</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Testez vos connaissances sur le RIA avec notre quiz interactif ! Plus de 150 questions couvrant tous les aspects du règlement, des explications détaillées et un système de badges pour suivre votre progression.
            </p>
            <span className="text-blue-500 font-medium flex items-center group">
              Commencer le quiz
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>

          {/* Articles Section */}
          <div 
            onClick={() => navigate('/articles')}
            className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Articles</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Restez informé avec nos articles d'analyse et de décryptage. Comprendre les implications concrètes du RIA, ses évolutions et son impact sur votre activité n'aura jamais été aussi simple.
            </p>
            <span className="text-purple-500 font-medium flex items-center group">
              Lire nos articles
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>

          {/* Contact Section */}
          <div 
            onClick={() => navigate('/contact')}
            className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Contact</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Une question ? Un besoin spécifique ? Notre équipe est là pour vous accompagner dans votre compréhension du RIA. N'hésitez pas à nous contacter pour toute demande d'information.
            </p>
            <span className="text-green-500 font-medium flex items-center group">
              Nous contacter
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 