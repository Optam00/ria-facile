import React from 'react';

const Cookies: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6">Politique cookies</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Qu'est-ce qu'un cookie ?</h2>
          <p className="mb-4">
            Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou mobile) 
            lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences 
            pendant une durée déterminée.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Comment utilisons-nous les cookies ?</h2>
          <p className="mb-4">
            RIA Facile utilise des cookies pour :
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Analyser le trafic du site via Google Analytics</li>
            <li className="mb-2">Mémoriser vos préférences en matière de cookies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Types de cookies utilisés</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Cookies essentiels</h3>
            <p className="mb-4">
              Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas 
              être désactivés dans nos systèmes. Il s'agit du cookie "tarteaucitron" qui 
              mémorise vos préférences concernant les cookies. Ce cookie est conservé pendant 12 mois maximum.
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Cookies analytiques (Google Analytics)</h3>
            <p className="mb-4">
              Nous utilisons Google Analytics pour comprendre comment les visiteurs 
              interagissent avec notre site. Ces cookies peuvent être désactivés et sont conservés pendant 12 mois maximum.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Fonctionnement avec le mode de consentement :</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Si vous acceptez les cookies :</strong> Nous collectons des données détaillées 
                  sur votre navigation (pages visitées, temps passé, etc.)
                </li>
                <li>
                  <strong>Si vous refusez les cookies :</strong> Nous utilisons le Google Consent Mode 
                  qui nous permet d'obtenir des données agrégées et anonymisées :
                  <ul className="list-disc pl-6 mt-2">
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
          <h2 className="text-2xl font-semibold mb-4">Gestion des cookies</h2>
          <p className="mb-4">
            Vous pouvez à tout moment revoir et modifier vos préférences en matière de cookies 
            en cliquant sur l'icône de cookies en bas à droite de votre écran.
          </p>
          <button 
            onClick={() => {
              if (typeof tarteaucitron !== 'undefined') {
                tarteaucitron.userInterface.openPanel();
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gérer mes préférences
          </button>
        </section>
      </div>
    </div>
  );
};

export default Cookies; 