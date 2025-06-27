// import CookieConsent, { Cookies } from 'react-cookie-consent';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Types pour les cookies
interface CookieConsent {
  analytics: boolean;
  timestamp: number;
}

// Fonction pour réinitialiser les préférences de cookies
export const resetCookieConsent = () => {
  // Supprimer le consentement stocké
  localStorage.removeItem('cookieConsent');
  
  // Supprimer les cookies Google Analytics
  document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = '_ga_7QV1MCQ879=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Réinitialiser le consentement Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted'
    });
  }
  
  // Recharger la page pour afficher à nouveau la bannière
  window.location.reload();
};

// Fonction pour accepter les cookies
const acceptCookies = (analytics: boolean) => {
  const consent: CookieConsent = {
    analytics,
    timestamp: Date.now()
  };
  
  localStorage.setItem('cookieConsent', JSON.stringify(consent));
  
  // Mettre à jour le consentement Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': analytics ? 'granted' : 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted'
    });
  }
  
  // Si analytics accepté, déclencher un événement pageview
  if (analytics && window.gtag) {
    window.gtag('event', 'page_view');
  }
};

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement existe déjà
    const storedConsent = localStorage.getItem('cookieConsent');
    if (!storedConsent) {
      setShowBanner(true);
    } else {
      // Appliquer le consentement existant
      try {
        const consent: CookieConsent = JSON.parse(storedConsent);
        if (window.gtag) {
          window.gtag('consent', 'update', {
            'analytics_storage': consent.analytics ? 'granted' : 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied',
            'security_storage': 'granted'
          });
        }
      } catch (error) {
        console.error('Erreur lors du parsing du consentement:', error);
        setShowBanner(true);
      }
    }
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestion des cookies
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              Nous utilisons des cookies pour mesurer l'audience de notre site et améliorer votre expérience. 
              Vous pouvez choisir d'accepter ou de refuser les cookies d'analyse.
            </p>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Cookies Google Analytics :</strong> Ces cookies nous permettent de mesurer l'audience 
                  du site et de comprendre son utilisation. Ils sont déposés uniquement avec votre consentement 
                  et sont conservés maximum 13 mois.
                </p>
                <p>
                  Pour plus d'informations, consultez notre{' '}
                  <Link to="/politique-de-confidentialite" className="text-[#774792] hover:underline">
                    politique de confidentialité
                  </Link>.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showDetails ? 'Masquer les détails' : 'Voir les détails'}
            </button>
            
            <button
              onClick={() => {
                acceptCookies(false);
                setShowBanner(false);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refuser
            </button>
            
            <button
              onClick={() => {
                acceptCookies(true);
                setShowBanner(false);
              }}
              className="px-4 py-2 text-sm bg-[#774792] text-white rounded-lg hover:bg-[#663d7a] transition-colors"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 