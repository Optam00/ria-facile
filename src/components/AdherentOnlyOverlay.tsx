import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdherentOnlyOverlayProps {
  children: React.ReactNode;
}

export const AdherentOnlyOverlay: React.FC<AdherentOnlyOverlayProps> = ({ children }) => {
  const { isAdmin, isAdherent, loading } = useAuth();
  
  // L'utilisateur a accès s'il est admin ou adhérent
  const hasAccess = isAdmin() || isAdherent();

  return (
    <div className="relative">
      {/* Overlay pour les non-adhérents */}
      {!loading && !hasAccess && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-8">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-70 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center mt-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Contenu réservé aux adhérents</h2>
            <p className="text-gray-600 mb-6">
              Cette page est accessible uniquement aux membres de RIA Facile. Connectez-vous ou créez un compte pour y accéder.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/connexion"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                Se connecter
              </Link>
              <Link
                to="/inscription"
                className="px-6 py-3 rounded-xl border-2 border-[#774792] text-[#774792] font-medium hover:bg-purple-50 transition-all"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contenu avec blur si pas d'accès */}
      <div className={!loading && !hasAccess ? 'filter blur-sm pointer-events-none select-none' : ''}>
        {children}
      </div>
    </div>
  );
};
