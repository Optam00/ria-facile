import React from 'react'
import { Helmet } from 'react-helmet-async'

const FichesPratiquesPage: React.FC = () => {
  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Fiches pratiques — RIA Facile</title>
      </Helmet>
      <div className="bg-white rounded-3xl shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#774792' }}>Fiches pratiques</h1>
        <p className="text-gray-600">Contenu à venir. Retrouvez bientôt des guides pratiques pour appliquer le RIA.</p>
      </div>
    </div>
  )
}

export default FichesPratiquesPage


