export const LegalPage = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Mentions légales
          </h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">Présentation du site</h2>
              <p className="mb-4">
                RIA Facile est un site web dédié à la consultation et à la compréhension du Règlement sur l'Intelligence Artificielle 
                de l'Union Européenne (Règlement (UE) 2024/1689).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Propriété intellectuelle</h2>
              <p className="mb-4">
                Le contenu réglementaire présenté sur ce site est issu du Règlement (UE) 2024/1689 du Parlement européen 
                et du Conseil. La mise en forme, l'interface utilisateur et les fonctionnalités de navigation sont la 
                propriété exclusive de leurs auteurs respectifs.
              </p>
              <p className="mb-4">
                Toute reproduction ou représentation, en tout ou partie, à d'autres fins que la consultation personnelle 
                est interdite sans autorisation préalable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Protection des données personnelles</h2>
              <p className="mb-4">
                RIA Facile s'engage à protéger votre vie privée. Le site ne collecte aucune donnée personnelle. 
                Les préférences d'affichage (taille de police, thème, etc.) sont stockées localement dans votre 
                navigateur et ne sont pas transmises à nos serveurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Cookies et stockage local</h2>
              <p className="mb-4">
                Ce site utilise uniquement le stockage local (localStorage) de votre navigateur pour sauvegarder vos 
                préférences d'affichage et améliorer votre expérience de navigation. Aucun cookie tiers n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Liens hypertextes</h2>
              <p className="mb-4">
                RIA Facile peut contenir des liens vers d'autres sites. Nous n'exerçons aucun contrôle sur ces sites 
                et ne sommes pas responsables de leur contenu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Limitation de responsabilité</h2>
              <p className="mb-4">
                Les informations disponibles sur ce site sont fournies à titre informatif. Bien que nous nous efforcions 
                d'assurer l'exactitude des informations, nous ne pouvons garantir qu'elles sont complètes, exactes et à jour. 
                En cas de doute, nous vous recommandons de consulter la version officielle du règlement publiée au Journal 
                officiel de l'Union européenne.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Droit applicable</h2>
              <p className="mb-4">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français 
                seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Mise à jour</h2>
              <p>
                Les présentes mentions légales peuvent être mises à jour à tout moment. Nous vous invitons à les consulter 
                régulièrement.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 