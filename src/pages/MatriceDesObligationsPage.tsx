import React from 'react'
import { Helmet } from 'react-helmet-async'

const MatriceDesObligationsPage: React.FC = () => {
  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Matrice des obligations — RIA Facile</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Bandeau */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#774792' }}>Matrice des obligations</h1>
          <p className="text-gray-600">Renseignez le niveau de risque de votre IA et votre rôle pour obtenir la liste des obligations applicables.</p>
        </div>

        {/* Contenu à venir */}
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-gray-600">Cette page est en cours de développement.</p>
        </div>
      </div>
    </div>
  )
}

export default MatriceDesObligationsPage

