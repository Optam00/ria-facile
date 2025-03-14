import React from 'react'

export const ArticlesPage = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm inline-block">
            Articles sur le RIA
          </h1>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
              <p className="text-lg leading-relaxed text-gray-800">
                Bienvenue dans notre section dédiée aux articles sur le Règlement européen sur l'Intelligence Artificielle (RIA).
              </p>
            </div>

            <div className="bg-white shadow-lg border border-gray-100 p-8 rounded-xl">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-sm inline-block">
                Pourquoi des articles sur le RIA ?
              </h2>
              <ul className="space-y-4 list-none">
                <li className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span className="text-gray-700">Décryptage approfondi des différents aspects du règlement</span>
                </li>
                <li className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span className="text-gray-700">Analyses d'experts sur les implications pour les entreprises</span>
                </li>
                <li className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span className="text-gray-700">Mises à jour régulières sur l'évolution de la réglementation</span>
                </li>
                <li className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span className="text-gray-700">Cas pratiques et exemples concrets d'application</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
              <p className="text-base text-gray-700">
                Cette section sera régulièrement mise à jour avec de nouveaux articles pour vous tenir informé des dernières actualités et analyses concernant le RIA.
              </p>
            </div>

            <div className="bg-white shadow-lg border border-gray-100 p-8 rounded-xl">
              <p className="text-center text-lg italic text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                Les articles seront bientôt disponibles. Revenez nous voir prochainement !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 