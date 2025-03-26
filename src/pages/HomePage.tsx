import { Link } from 'react-router-dom'
import accueilImage from '@/assets/accueil.jpeg'
import consulterImage from '@/assets/consulter.jpeg'
import quizImage from '@/assets/quiz.jpeg'

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Consulter le RIA */}
          <Link to="/consulter" className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
              <img src={consulterImage} alt="Consulter le RIA" className="w-full h-48 object-cover p-8" />
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
              <img src={quizImage} alt="Quiz sur le RIA" className="w-full h-48 object-cover p-8" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz sur le RIA</h2>
                <p className="text-gray-600">
                  Testez vos connaissances sur le RIA avec notre quiz interactif.
                </p>
              </div>
            </div>
          </Link>

          {/* Accueil */}
          <Link to="/contact" className="group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
              <img src={accueilImage} alt="Nous contacter" className="w-full h-48 object-cover p-8" />
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