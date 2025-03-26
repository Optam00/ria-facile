import { Link } from 'react-router-dom'
import consulterImage from '../assets/consulter.jpeg'
import quizImage from '../assets/quiz.jpeg'
import msgImage from '../assets/msg.jpeg'

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Bandeau */}
      <div className="w-full bg-white py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Comprenez et appliquez le Règlement IA en toute simplicité
              </h1>
              <p className="text-lg text-gray-600">
                RIA Facile a été créé pour vous aider dans votre mise en conformité au règlement européen sur l'intelligence artificielle (RIA, AI act, IA act).
              </p>
            </div>
            <div className="h-64 md:h-96 bg-gray-100 rounded-2xl">
              {/* Emplacement pour l'image du bandeau */}
            </div>
          </div>
        </div>
      </div>

      {/* Section des cartes */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
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

            {/* Contact */}
            <Link to="/contact" className="group h-full">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 h-full flex flex-col">
                <div className="flex-shrink-0 p-6 pt-8">
                  <img 
                    src={msgImage} 
                    alt="Nous contacter" 
                    className="w-full h-48 object-contain" 
                  />
                </div>
                <div className="p-6 flex-grow">
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
    </div>
  )
} 