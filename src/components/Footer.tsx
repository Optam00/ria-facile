import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-white shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-center items-center gap-8">
          <Link 
            to="/mentions-legales" 
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Mentions légales
          </Link>
          <Link 
            to="/politique-de-confidentialite" 
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  )
} 