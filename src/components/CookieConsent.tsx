import React from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import { Link } from 'react-router-dom';

// Fonction pour réinitialiser les préférences de cookies
export const resetCookieConsent = () => {
  // Supprimer tous les cookies de consentement
  Cookies.remove('CookieConsent');
  Cookies.remove('tarteaucitron');
  // Supprimer les cookies de Google Analytics
  Cookies.remove('_ga');
  Cookies.remove('_ga_7QV1MCQ879');
  // Réinitialiser tous les consentements Google
  window.gtag('consent', 'update', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted' // Toujours accordé pour la sécurité
  });
  // Recharger la page pour afficher à nouveau la bannière
  window.location.reload();
};

export const CookieConsentBanner: React.FC = () => {
  const handleAccept = () => {
    // Mettre à jour tous les consentements Google
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'functionality_storage': 'granted',
      'personalization_storage': 'granted',
      'security_storage': 'granted'
    });
  };

  const handleDecline = () => {
    // Refuser tous les consentements sauf sécurité
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted' // Toujours accordé pour la sécurité
    });
    // Supprimer les cookies existants
    Cookies.remove('_ga');
    Cookies.remove('_ga_7QV1MCQ879');
  };

  return (
    <CookieConsent
      location="middle"
      buttonText="Accepter"
      declineButtonText="Refuser"
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      style={{
        background: '#fff',
        color: '#4B5563',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
      buttonStyle={{
        background: '#774792',
        color: '#fff',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
      }}
      declineButtonStyle={{
        background: '#EDE9FE',
        color: '#4B5563',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
      }}
    >
      Nous utilisons des cookies pour mesurer l'audience de notre site et améliorer son contenu. 
      Pour en savoir plus, consultez notre{' '}
      <Link to="/politique-de-confidentialite" className="text-[#774792] hover:underline">
        politique de confidentialité
      </Link>
      .
    </CookieConsent>
  );
}; 