import { useEffect } from 'react';

export const TarteaucitronManager = () => {
  useEffect(() => {
    // Charger les fichiers CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/tarteaucitron/tarteaucitron.css';
    document.head.appendChild(link);

    // Charger les scripts dans l'ordre
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initTarteaucitron = async () => {
      try {
        await loadScript('/tarteaucitron/tarteaucitron.js');
        await loadScript('/tarteaucitron/tarteaucitron.services.js');
        await loadScript('/tarteaucitron/tarteaucitron.fr.js');

        // @ts-ignore
        window.tarteaucitron?.init({
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
      } catch (error) {
        console.error('Erreur lors du chargement de Tarteaucitron:', error);
      }
    };

    initTarteaucitron();

    // Nettoyage
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null;
}; 