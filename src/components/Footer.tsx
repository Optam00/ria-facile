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
            <p className="text-gray-600 text-sm">
              RIA Facile vous aide à comprendre et à appliquer la réglementation sur l'Intelligence Artificielle.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2">Liens utiles</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/mentions-legales" className="text-gray-600 hover:text-[#774792] text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/politique-de-confidentialite" className="text-gray-600 hover:text-[#774792] text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/lexique" className="text-gray-600 hover:text-[#774792] text-sm">
                  Lexique français-anglais
                </Link>
              </li>
              <li>
                <button
                  onClick={resetCookieConsent}
                  className="text-gray-600 hover:text-[#774792] cursor-pointer text-sm"
                >
                  Gérer les cookies
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2">Contact</h3>
            <p className="text-gray-600 text-sm">
              Des questions ? N'hésitez pas à nous contacter via notre{' '}
              <Link to="/contact" className="text-[#774792] hover:underline">
                formulaire de contact
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 