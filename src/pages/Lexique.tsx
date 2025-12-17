import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const lexiqueData = [
  ["Réglage fin", "Fine-tuning"],
  ["Analyse d'impact relative aux droits fondamentaux", "Fundamental rights impact assessment"],
  ["Autorité de surveillance du marché", "Market surveillance authority"],
  ["Autorité notifiante", "Notifying authority"],
  ["Bac à sable réglementaire de l'IA", "AI regulatory sandbox"],
  ["Biais", "Bias"],
  ["Biais d'automatisation", "Automation bias"],
  ["Catégorisation biométrique", "Biometric categorisation"],
  ["Composant de sécurité", "Safety component"],
  ["Consentement éclairé", "Informed consent"],
  ["Déclaration UE de conformité", "EU declaration of conformity"],
  ["Déployeur", "Deployer"],
  ["Fournisseur en aval", "Downstream provider"],
  ["Distributeur", "Distributor"],
  ["Données d'entraînement", "Training data"],
  ["Données d'entrée", "Input data"],
  ["Données de test", "Testing data"],
  ["Données de validation", "Validation data"],
  ["Espace accessible au public", "Publicly accessible space"],
  ["Essais en conditions réelles", "Testing in real-world conditions"],
  ["Évaluation de la conformité", "Conformity assessment"],
  ["Fournisseur", "Provider"],
  ["Hypertrucage (“Deep fake”)", "Deep fake"],
  ["Identification biométrique", "Biometric identification"],
  ["Importateur", "Importer"],
  ["Incident grave", "Serious incident"],
  ["Mandataire", "Authorised representative"],
  ["Marquage CE", "CE marking"],
  ["Mise à disposition sur le marché", "Making available on the market"],
  ["Mise en service", "Putting into service"],
  ["Mise sur le marché", "Placing on the market"],
  ["Modèle d'IA à usage général", "General-purpose AI model"],
  ["Modification substantielle", "Substantial modification"],
  ["Notice d'utilisation", "Instructions for use"],
  ["Opérateur", "Operator"],
  ["Organisme notifié", "Notified body"],
  ["Performance d'un système d'IA", "Performance of an AI system"],
  ["Pratiques d'IA interdites", "Prohibited AI practices"],
  ["Rappel d'un système d'IA", "Recall of an AI system"],
  ["Retrait d'un système d'IA", "Withdrawal of an AI system"],
  ["Risque", "Risk"],
  ["Risque systémique", "Systemic risk"],
  ["Système d'IA", "AI system"],
  ["Système d'IA à haut risque", "High-risk AI system"],
  ["Système d'IA à usage général", "General-purpose AI system"],
  ["Système de catégorisation biométrique", "Biometric categorisation system"],
  ["Système de gestion de la qualité", "Quality management system"],
  ["Système de gestion des risques", "Risk management system"],
  ["Système de reconnaissance des émotions", "Emotion recognition system"],
  ["Système d'identification biométrique à distance", "Remote biometric identification system"],
];

const LexiquePage = () => {
  const { isAdmin, isAdherent, loading } = useAuth();
  
  // L'utilisateur a accès s'il est admin ou adhérent
  const hasAccess = isAdmin() || isAdherent();

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 relative">
      {/* Overlay pour les non-adhérents */}
      {!loading && !hasAccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ top: '120px' }}>
          <div className="absolute inset-0 bg-gray-600 bg-opacity-70 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#774792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Contenu réservé aux adhérents</h2>
            <p className="text-gray-600 mb-6">
              Cette page est accessible uniquement aux membres de RIA Facile. Connectez-vous ou créez un compte pour y accéder.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/connexion"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-[#774792] text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                Se connecter
              </Link>
              <Link
                to="/inscription"
                className="px-6 py-3 rounded-xl border-2 border-[#774792] text-[#774792] font-medium hover:bg-purple-50 transition-all"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-md p-8 text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#774792' }}>
          Lexique français-anglais du Règlement IA
        </h1>
        <div className="text-gray-600 text-lg opacity-70 mb-2">
          Retrouvez les principaux termes du Règlement IA en français et en anglais.
        </div>
      </div>
      <div className={`pt-8 pb-8 ${!loading && !hasAccess ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        <div className="max-w-2xl mx-auto overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 rounded-xl table-fixed">
            <thead>
              <tr>
                <th className="w-1/2 px-4 py-2 bg-violet-100 text-purple-800 font-bold border border-gray-300 text-center rounded-l-xl bg-white break-words whitespace-normal">Français</th>
                <th className="w-1/2 px-4 py-2 bg-violet-100 text-purple-800 font-bold border border-gray-300 text-center rounded-r-xl bg-white break-words whitespace-normal">Anglais</th>
              </tr>
            </thead>
            <tbody>
              {lexiqueData.map((row, idx) => (
                <tr key={idx} className="hover:bg-violet-50 transition-all">
                  <td className="w-1/2 px-4 py-2 font-medium text-gray-900 border border-gray-300 text-center bg-white break-words whitespace-normal">{row[0]}</td>
                  <td className="w-1/2 px-4 py-2 text-gray-700 border border-gray-300 text-center bg-white break-words whitespace-normal">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LexiquePage; 