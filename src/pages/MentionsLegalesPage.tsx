import React from 'react'

export const MentionsLegalesPage = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-medium text-gray-800 mb-6">Mentions Légales</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-medium text-gray-800 mb-3">Éditeur du site</h2>
              <p>
                Ce site est édité par [Votre nom ou celui de votre organisation]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-800 mb-3">Hébergement</h2>
              <p>
                Ce site est hébergé par [Nom de l'hébergeur]<br />
                [Adresse de l'hébergeur]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-800 mb-3">Propriété intellectuelle</h2>
              <p>
                Le contenu de ce site est basé sur le Règlement (UE) 2024/1689 du Parlement européen et du Conseil.
                La mise en forme et l'interface utilisateur sont la propriété de [Votre nom ou celui de votre organisation].
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-800 mb-3">Protection des données personnelles</h2>
              <p>
                Ce site ne collecte aucune donnée personnelle. Les préférences d'affichage sont stockées localement 
                dans votre navigateur et ne sont pas transmises à un serveur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-800 mb-3">Cookies</h2>
              <p>
                Ce site utilise uniquement le stockage local (localStorage) de votre navigateur pour sauvegarder 
                vos préférences d'affichage. Aucun cookie tiers n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-gray-800 mb-3">Contact</h2>
              <p>
                Pour toute question concernant ce site, vous pouvez nous contacter à :<br />
                [Votre email ou formulaire de contact]
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 