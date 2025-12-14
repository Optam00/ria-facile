import React from 'react';
import { Link } from 'react-router-dom';
import { resetCookieConsent } from './CookieConsent';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-base font-semibold mb-2">À propos</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/mentions-legales" className="text-gray-600 hover:text-[#774792] text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/connexion" className="text-gray-600 hover:text-[#774792] text-sm">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2">Liens utiles</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/actualites" className="text-gray-600 hover:text-[#774792] text-sm">
                  Actualités
                </Link>
              </li>
              <li>
                <Link to="/lexique" className="text-gray-600 hover:text-[#774792] text-sm">
                  Lexique français-anglais
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2">Confidentialité</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={resetCookieConsent}
                  className="text-gray-600 hover:text-[#774792] cursor-pointer text-sm"
                >
                  Gérer les cookies
                </button>
              </li>
              <li>
                <Link to="/politique-de-confidentialite" className="text-gray-600 hover:text-[#774792] text-sm">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}; 