import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdherentOnlyOverlayProps {
  children: React.ReactNode;
  /** Hauteur du contenu visible sans overlay (ex: "55vh"). Si défini, seul le reste de la page est masqué par l'overlay. */
  revealHeight?: string;
}

export const AdherentOnlyOverlay: React.FC<AdherentOnlyOverlayProps> = ({ children, revealHeight }) => {
  const { isAdmin, isAdherent, loading } = useAuth();

  const hasAccess = isAdmin() || isAdherent();
  const showOverlay = !loading && !hasAccess;
  const partialReveal = showOverlay && revealHeight;

  return (
    <div className="relative">
      {/* Overlay pour les non-adhérents */}
      {showOverlay && (
        <>
          {partialReveal ? (
            /* Overlay partiel : ne couvre que la zone sous revealHeight */
            <div
              className="absolute left-0 right-0 bottom-0 z-50 flex items-start justify-center min-h-[60vh]"
              style={{ top: revealHeight }}
            >
              {/* Flou progressif : le flou monte plus vite (dégradés resserrés) */}
              <div
                className="absolute inset-0 rounded-b-3xl"
                style={{
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%)',
                  boxShadow: '0 -4px 24px rgba(119, 71, 146, 0.06)',
                }}
              />
              <div
                className="absolute inset-0 rounded-b-3xl"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  maskImage: 'linear-gradient(to bottom, transparent 5%, black 28%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 5%, black 28%)',
                }}
              />
              <div
                className="absolute inset-0 rounded-b-3xl"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  maskImage: 'linear-gradient(to bottom, transparent 15%, black 50%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 15%, black 50%)',
                }}
              />
              {/* Carte CTA sticky */}
              <div className="relative z-10 w-full max-w-md mx-4 pt-10 pb-8 sticky top-8">
                <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5" style={{ boxShadow: '0 25px 50px -12px rgba(119, 71, 146, 0.18), 0 0 0 1px rgba(119, 71, 146, 0.08)' }}>
                  {/* Liseré décoratif en haut */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-[#774792] to-indigo-500" />
                  <div className="flex flex-col items-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 shadow-inner ring-1 ring-white/80">
                      <svg className="h-8 w-8 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1.5">Suite réservée aux adhérents</h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
                      Connectez-vous ou créez un compte pour accéder à l&apos;intégralité de cette fiche et à toutes les ressources RIA Facile.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Link
                        to="/connexion"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 hover:opacity-95"
                      >
                        Se connecter
                      </Link>
                      <Link
                        to="/inscription"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#774792] bg-white px-5 py-3 text-sm font-semibold text-[#774792] transition hover:bg-purple-50"
                      >
                        Créer un compte
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Overlay plein (comportement historique) */
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gray-600/70 backdrop-blur-sm rounded-3xl" />
              <div className="relative z-10 w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5" style={{ boxShadow: '0 25px 50px -12px rgba(119, 71, 146, 0.18), 0 0 0 1px rgba(119, 71, 146, 0.08)' }}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-[#774792] to-indigo-500" />
                  <div className="flex flex-col items-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 shadow-inner ring-1 ring-white/80">
                      <svg className="h-8 w-8 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1.5">Contenu réservé aux adhérents</h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
                      Cette page est accessible uniquement aux membres de RIA Facile. Connectez-vous ou créez un compte pour y accéder.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                      <Link
                        to="/connexion"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 hover:opacity-95"
                      >
                        Se connecter
                      </Link>
                      <Link
                        to="/inscription"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#774792] bg-white px-5 py-3 text-sm font-semibold text-[#774792] transition hover:bg-purple-50"
                      >
                        Créer un compte
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Contenu : blur uniquement en mode overlay plein (pas en partialReveal) */}
      <div className={showOverlay && !partialReveal ? 'filter blur-sm pointer-events-none select-none' : ''}>
        {children}
      </div>
    </div>
  );
};
