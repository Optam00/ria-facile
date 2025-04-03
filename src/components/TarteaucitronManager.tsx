import { useEffect } from 'react';

declare global {
  interface Window {
    tarteaucitron: any;
  }
}

export const TarteaucitronManager = () => {
  useEffect(() => {
    const loadedElements: HTMLElement[] = [];

    // Charger les fichiers CSS s'ils ne sont pas déjà chargés
    if (!document.querySelector('link[href="/tarteaucitron/tarteaucitron.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/tarteaucitron/tarteaucitron.css';
      document.head.appendChild(link);
      loadedElements.push(link);
    }

    // Charger les scripts dans l'ordre s'ils ne sont pas déjà chargés
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(undefined);
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
        loadedElements.push(script);
      });
    };

    const initTarteaucitron = async () => {
      try {
        await loadScript('/tarteaucitron/tarteaucitron.js');
        await loadScript('/tarteaucitron/tarteaucitron.services.js');
        await loadScript('/tarteaucitron/tarteaucitron.fr.js');

        // Attendre un peu que tout soit bien chargé
        setTimeout(() => {
          if (window.tarteaucitron && !window.tarteaucitron.initialized) {
            window.tarteaucitron.init({
              "privacyUrl": "",
              "bodyPosition": "bottom",
              "hashtag": "#tarteaucitron",
              "cookieName": "tarteaucitron",
              "orientation": "middle",
              "groupServices": false,
              "showAlertSmall": false,
              "cookieslist": false,
              "closePopup": false,
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
              "readmoreLink": "",
              "mandatory": true,
              "mandatoryCta": true
            });
            window.tarteaucitron.initialized = true;
          } else if (!window.tarteaucitron) {
            console.error('Tarteaucitron nest pas disponible');
          }
        }, 500);
      } catch (error) {
        console.error('Erreur lors du chargement de Tarteaucitron:', error);
      }
    };

    initTarteaucitron();

    // En développement, on ne nettoie pas les scripts pour éviter les problèmes avec HMR
    if (import.meta.env.PROD) {
      return () => {
        loadedElements.forEach(element => {
          element.parentNode?.removeChild(element);
        });
      };
    }
  }, []);

  return null;
}; 