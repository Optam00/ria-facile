// import { motion } from 'framer-motion'

export const LegalNoticePage = () => {
  return (
    <div className="min-h-screen p-4">
      {/* <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      > */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Mentions légales</h1>

          <div className="space-y-8">
            {/* Éditeur */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Éditeur</h2>
              <p className="text-gray-700">
                Ce site est édité par RIA Facile
              </p>
            </section>

            {/* Directeur de la publication */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Directeur de la publication et réalisation éditoriale</h2>
              <p className="text-gray-700">
                Matthieu Polaina, fondateur de RIA Facile.
              </p>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Hébergement du site web</h2>
              <p className="text-gray-700">
                Vercel Inc.<br />
                440 N Barranca Avenue #4133<br />
                Covina, CA 91723<br />
                United States
              </p>
            </section>

            {/* Réutilisation des contenus */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Réutilisation des contenus et liens</h2>
              <p className="text-gray-700 mb-4">
                L'ensemble des éléments présents sur le site RIA Facile incluant notamment les textes, articles, images, et tout autre contenu, sont protégés par le droit de la propriété intellectuelle en vertu des dispositions du Code de la propriété intellectuelle français.
              </p>
              <p className="text-gray-700 mb-4">
                Sauf mention contraire, ces éléments sont la propriété exclusive de RIA Facile. Toute reproduction, représentation, modification, adaptation ou exploitation partielle ou totale du contenu du site, par quelque procédé que ce soit et sur quelque support que ce soit, sans autorisation écrite préalable de RIA Facile est interdite.
              </p>
              <p className="text-gray-700">
                Si vous souhaitez obtenir une autorisation pour l'utilisation d'un contenu du site, vous pouvez en faire la demande au moyen du formulaire de contact.
              </p>
            </section>
          </div>
        </div>
      {/* </motion.div> */}
    </div>
  )
} 