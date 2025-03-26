import { Link } from 'react-router-dom'

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Consulter le RIA */}
          <Link to="/consulter" className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img 
                  src="/images/consulter.jpeg" 
                  alt="Consulter le RIA" 
                  className="w-full h-64 object-contain p-4" 
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Consulter le RIA</h2>
                <p className="text-gray-600">
                  Explorez le Règlement sur l'Intelligence Artificielle de l'UE de manière simple et intuitive.
                </p>
              </div>
            </div>
          </Link>

          {/* Quiz */}
          <Link to="/quiz" className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img 
                  src="/images/quiz.jpeg" 
                  alt="Quiz sur le RIA" 
                  className="w-full h-64 object-contain p-4" 
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz sur le RIA</h2>
                <p className="text-gray-600">
                  Testez vos connaissances sur le RIA avec notre quiz interactif.
                </p>
              </div>
            </div>
          </Link>

          {/* Contact */}
          <Link to="/contact" className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img 
                  src="/images/accueil.jpeg" 
                  alt="Nous contacter" 
                  className="w-full h-64 object-contain p-4" 
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Nous contacter</h2>
                <p className="text-gray-600">
                  Des questions ? N'hésitez pas à nous contacter pour plus d'informations.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 