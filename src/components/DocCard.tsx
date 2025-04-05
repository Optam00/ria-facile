import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface DocCardProps {
  titre: string;
  auteur: string;
  lien: string;
  date: string;
  resume: string;
  themes: string;
  langue: string;
}

export const DocCard: React.FC<DocCardProps> = ({
  titre,
  auteur,
  lien,
  date,
  resume,
  themes,
  langue
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Convertir les chaînes en tableaux
  const themesArray = themes ? themes.split(',').map(t => t.trim()) : [];
  
  // Affiche exactement ce qui est dans la colonne langue (au singulier)
  const languesArray = langue ? langue.split(',').map(l => l.trim()) : [];
  
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-4 transition-all duration-300 transform hover:shadow-xl hover:scale-102">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-3 text-black text-center">{titre}</h3>
        <p className="text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {auteur}
        </p>
        <a 
          href={lien} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 flex items-center font-medium transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          Accéder au document
        </a>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
      >
        <span className="mr-2">Plus d'infos</span>
        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </button>

      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-4 border-t border-gray-200">
          <p className="text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Date:</span> {new Date(date).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-gray-700 mb-4 italic">{resume}</p>
          
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Thèmes:</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {themesArray.map((theme, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.20l-.86 2H12a1 1 0 110 2h-5.34l-.74 1.78a1 1 0 01-1.84 0L4.08 11H1a1 1 0 110-2h2.8l.86-2H3a1 1 0 110-2h3V3a1 1 0 011-1zm0 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Langues:</span>
            </div>
            {languesArray.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {languesArray.map((langue, index) => (
                  <span 
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {langue}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic mt-1">Non spécifié</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 