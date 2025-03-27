import React from 'react';

declare global {
  interface Window {
    tarteaucitron: {
      userInterface: {
        openPanel: () => void;
      };
    }
  }
}

const Cookies: React.FC = () => {
  const openCookiesPanel = () => {
    if (typeof window !== 'undefined' && window.tarteaucitron) {
      window.tarteaucitron.userInterface.openPanel();
    }
  };

  return (
    <div className="bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Politique cookies</h1>
        
        <section className="mb-4">
          <h2 className="text-xl font-bold mb-2">Qu'est-ce qu'un cookie ?</h2>
          <p className="mb-2">
            Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou mobile) 
            lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences 
            pendant une durée déterminée.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="text-xl font-bold mb-2">Comment utilisons-nous les cookies ?</h2>
          <p className="mb-2">
            RIA Facile utilise des cookies pour :
          </p>
          <ul className="list-disc pl-4 mb-2">
            <li className="mb-1">Analyser le trafic du site via Google Analytics</li>
            <li className="mb-1">Mémoriser vos préférences en matière de cookies</li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="text-xl font-bold mb-2">Types de cookies utilisés</h2>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Cookies essentiels</h3>
            <p className="mb-2">
              Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas 
              être désactivés dans nos systèmes. Il s'agit du cookie "tarteaucitron" qui 
              mémorise vos préférences concernant les cookies. Ce cookie est conservé pendant 12 mois maximum.
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Cookies analytiques (Google Analytics)</h3>
            <p className="mb-2">
              Nous utilisons Google Analytics pour comprendre comment les visiteurs 
              interagissent avec notre site. Ces cookies peuvent être désactivés et sont conservés pendant 12 mois maximum.
            </p>
            <div className="bg-gray-100 p-4">
              <h4 className="font-bold mb-2">Fonctionnement avec le mode de consentement :</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Si vous acceptez les cookies :</strong> Nous collectons des données détaillées 
                  sur votre navigation (pages visitées, temps passé, etc.)
                </li>
                <li>
                  <strong>Si vous refusez les cookies :</strong> Nous utilisons le Google Consent Mode 
                  qui nous permet d'obtenir des données agrégées et anonymisées :
                  <ul className="list-disc pl-4 mt-1">
                    <li>Nombre de visiteurs (estimé)</li>
                    <li>Pays d'origine</li>
                    <li>Type d'appareil</li>
                    <li>Source du trafic</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Gestion des cookies</h2>
          <p className="mb-2">
            Vous pouvez à tout moment revoir et modifier vos préférences en matière de cookies 
            en cliquant sur l'icône de cookies en bas à droite de votre écran.
          </p>
          <button 
            onClick={openCookiesPanel}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Gérer mes préférences
          </button>
        </section>
      </div>
    </div>
  );
};

export default Cookies; 