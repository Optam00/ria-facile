// import CookieConsent, { Cookies } from 'react-cookie-consent';
import React from 'react';
import { Link } from 'react-router-dom';

// Fonction pour réinitialiser les préférences de cookies
export const resetCookieConsent = () => {
  // Supprimer tous les cookies de consentement
  // Cookies.remove('CookieConsent');
  // Cookies.remove('tarteaucitron');
  // Supprimer les cookies de Google Analytics
  // Cookies.remove('_ga');
  // Cookies.remove('_ga_7QV1MCQ879');
  // Réinitialiser tous les consentements Google
  // window.gtag('consent', 'update', {
  //   'analytics_storage': 'denied',
  //   'ad_storage': 'denied',
  //   'functionality_storage': 'denied',
  //   'personalization_storage': 'denied',
  //   'security_storage': 'granted' // Toujours accordé pour la sécurité
  // });
  // Recharger la page pour afficher à nouveau la bannière
  // window.location.reload();
};

export const CookieConsentBanner: React.FC = () => {
  return null;
}; 