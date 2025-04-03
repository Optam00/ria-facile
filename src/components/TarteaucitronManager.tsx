import { useEffect } from 'react';

declare global {
  interface Window {
    tarteaucitron: any;
    gtag: any;
    dataLayer: any[];
  }
}

export const TarteaucitronManager = () => {
  useEffect(() => {
    const loadedElements: HTMLElement[] = [];

    // Charger les fichiers CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/tarteaucitron/tarteaucitron.css';
    document.head.appendChild(link);
    loadedElements.push(link);

    // Charger les scripts dans l'ordre
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = (e) => {
          console.error('Erreur de chargement du script:', src, e);
          reject(e);
        };
        document.body.appendChild(script);
        loadedElements.push(script);
      });
    };

    const initTarteaucitron = async () => {
      try {
        await loadScript('/tarteaucitron/tarteaucitron.js');
        await loadScript('/tarteaucitron/tarteaucitron.services.js');
        await loadScript('/tarteaucitron/tarteaucitron.fr.js');
        await loadScript('https://www.googletagmanager.com/gtag/js?id=G-7QV1MCQ879');

        // Initialiser dataLayer
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());

        // Configuration par défaut - consentement refusé
        gtag('consent', 'default', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });

        // Initialiser Tarteaucitron
        if (window.tarteaucitron) {
          window.tarteaucitron.init({
            "privacyUrl": "/politique-de-confidentialite",
            "hashtag": "#tarteaucitron",
            "cookieName": "tarteaucitron",
            "orientation": "middle",
            "groupServices": false,
            "showDetailsOnClick": true,
            "showIcon": true,
            "iconPosition": "BottomRight",
            "adblocker": false,
            "DenyAllCta": true,
            "AcceptAllCta": true,
            "highPrivacy": true,
            "handleBrowserDNTRequest": false,
            "removeCredit": false,
            "moreInfoLink": true,
            "useExternalCss": false,
            "useExternalJs": false,
            "googleConsentMode": true,
            "mandatory": true,
            "mandatoryCta": true,
            "lang": "fr"
          });

          // Configuration de GA via Tarteaucitron
          window.tarteaucitron.user.gtagUa = 'G-7QV1MCQ879';
          (window.tarteaucitron.job = window.tarteaucitron.job || []).push('gtag');
        } else {
          console.error('Tarteaucitron nest pas disponible');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de Tarteaucitron:', error);
      }
    };

    initTarteaucitron();

    // Nettoyage
    return () => {
      loadedElements.forEach(element => {
        element.parentNode?.removeChild(element);
      });
    };
  }, []);

  return null;
}; 