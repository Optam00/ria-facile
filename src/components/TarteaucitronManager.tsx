import { useEffect } from 'react';

declare global {
  interface Window {
    tarteaucitron: any;
  }
}

export const TarteaucitronManager = () => {
  useEffect(() => {
    const loadedElements: HTMLElement[] = [];
    const isDev = import.meta.env.DEV;
    const basePath = isDev ? '' : '';

    // Charger les fichiers CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${basePath}/tarteaucitron/tarteaucitron.css`;
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
        await loadScript(`${basePath}/tarteaucitron/tarteaucitron.js`);
        await loadScript(`${basePath}/tarteaucitron/tarteaucitron.services.js`);
        await loadScript(`${basePath}/tarteaucitron/tarteaucitron.fr.js`);

        // Attendre un peu que tout soit bien chargé
        setTimeout(() => {
          if (window.tarteaucitron) {
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
          } else {
            console.error('Tarteaucitron nest pas disponible');
          }
        }, 500);
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