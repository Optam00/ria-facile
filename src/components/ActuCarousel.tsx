import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Actu } from '../types/Actu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ActuCarousel = () => {
  const [actus, setActus] = useState<Actu[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    const fetchActus = async () => {
      try {
        const { data, error } = await supabase
          .from('Actu')
          .select('*')
          .order('Date', { ascending: false })
          .limit(9);

        if (error) {
          console.error('Erreur Supabase:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          return;
        }

        if (data) {
          setActus(data);
        }
      } catch (e) {
        console.error('Erreur inattendue lors de la récupération:', e);
      }
    };

    fetchActus();
  }, []);

  const handlePrevious = () => {
    if (window.innerWidth < 768) {
      setMobileIndex((prev) => (prev > 0 ? prev - 1 : actus.length - 1));
    } else {
      setCurrentPage((prev) => (prev > 0 ? prev - 1 : Math.floor((actus.length - 1) / 3)));
    }
  };

  const handleNext = () => {
    if (window.innerWidth < 768) {
      setMobileIndex((prev) => (prev < actus.length - 1 ? prev + 1 : 0));
    } else {
      setCurrentPage((prev) => (prev < Math.floor((actus.length - 1) / 3) ? prev + 1 : 0));
    }
  };

  if (actus.length === 0) return null;

  const currentActus = actus.slice(currentPage * 3, (currentPage * 3) + 3);
  const mobileActu = actus[mobileIndex]; // Utiliser l'index mobile pour accéder à n'importe quel article

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-[#774792] text-white py-4 md:py-6 rounded-lg mt-0 -mb-6">
      <div className="max-w-[90rem] mx-auto px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-12 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">L'actu en un clic</h2>
            </div>
            
            <div className="flex-grow relative overflow-hidden px-4 order-2 md:order-none">
              {/* Version mobile - un seul article */}
              <div className="block md:hidden">
                <div className="w-full flex flex-col justify-between min-h-[150px] bg-white/5 p-4 rounded-lg">
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-col space-y-1 text-gray-300 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{format(new Date(mobileActu.Date), 'dd MMM yyyy', { locale: fr })}</span>
                        <span>•</span>
                      </div>
                      <div className="text-sm">{mobileActu.media}</div>
                    </div>
                    <h3 className="font-semibold text-base leading-tight line-clamp-3 flex-grow">{mobileActu.Titre}</h3>
                  </div>
                  <a
                    href={mobileActu.lien}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-yellow-300 hover:text-yellow-200 transition-colors duration-200 text-sm font-medium mt-3"
                  >
                    Lire l'article
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Version desktop - trois articles */}
              <div className="hidden md:grid md:grid-cols-3 gap-8">
                {currentActus.map((actu) => (
                  <div
                    key={actu.id}
                    className="w-full flex flex-col justify-between min-h-[150px]"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col space-y-1 text-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{format(new Date(actu.Date), 'dd MMM yyyy', { locale: fr })}</span>
                          <span>•</span>
                        </div>
                        <div className="text-sm">{actu.media}</div>
                      </div>
                      <h3 className="font-semibold text-base leading-tight line-clamp-3 flex-grow">{actu.Titre}</h3>
                    </div>
                    <a
                      href={actu.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-yellow-300 hover:text-yellow-200 transition-colors duration-200 text-sm font-medium mt-3"
                    >
                      Lire l'article
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center justify-center space-x-3 mt-4 md:mt-0 md:ml-12 order-3 md:order-none">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 border border-white/20"
                aria-label="Articles précédents"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-sm font-medium min-w-[40px] text-center">
                <span className="block md:hidden">{mobileIndex + 1}/{actus.length}</span>
                <span className="hidden md:block">{currentPage + 1}/3</span>
              </span>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 border border-white/20"
                aria-label="Articles suivants"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 