// Configuration de GA via Tarteaucitron
tarteaucitron.user.gtagUa = 'G-7QV1MCQ879';
tarteaucitron.user.gtagMore = function () {
  // Configuration par défaut - consentement refusé
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });
};

// Ajouter le service à la file d'attente de tarteaucitron
(tarteaucitron.job = tarteaucitron.job || []).push('gtag');

// Google Analytics avec Consent Mode
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-7QV1MCQ879'); 