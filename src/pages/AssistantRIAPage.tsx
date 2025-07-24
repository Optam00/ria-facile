// Forcer un build Vercel propre - test synchro prod/dev
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import assistantRiaImg from '../assets/assistant_ria.jpeg';

export const AssistantRIAPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Assistant RIA | RIA Facile</title>
        <meta name="description" content="Présentation de l'assistant RIA, votre expert du règlement européen sur l'intelligence artificielle." />
        <meta property="og:title" content="Assistant RIA | RIA Facile" />
        <meta property="og:description" content="Présentation de l'assistant RIA, votre expert du règlement européen sur l'intelligence artificielle." />
      </Helmet>
      <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Colonne de gauche - Texte */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6"
              >
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl font-bold text-[#774792] mb-4"
                >
                  Assistant RIA
                </motion.h1>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-gray-600 text-justify">
                      Une IA qui vous aide à mettre en conformité vos IA au RIA, ça semble fou, mais ça existe ! L'assitant RIA est là pour répondre à vos interrogations sur la règlementation sur l'IA. N'hésitez pas à nous faire part de vos avis/suggestions sur l'assistant RIA dans le formulaire de contact !
                    </p>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 mt-6">
                      À propos de l'assistant
                    </h2>
                    <p className="text-gray-500 text-sm italic mt-2 text-justify">
                      L'assistant RIA est fondé sur le modèle d'IA gemini 2.5 pro. En raison de la gratuité de l'assistant RIA, il est possible que la génération des réponses soit assez longue.<br />
                      Pour des raisons de confidentialité, RIA facile n'a pas accès et ne conserve pas vos échanges avec l'assistant RIA. Vous ne pouvez donc pas accéder à l'historique de vos échanges. Chaque rafraichissement de la page assure la suppression des données. Malgré tout, veuillez ne pas renseigner de données à caractère personnel et de données sensibles pour votre organisation.
                    </p>
                  </div>

                  <div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      onClick={() => navigate('/assistant-ria/conversation')}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 group"
                    >
                      <span className="text-lg">Démarrer une conversation</span>
                      <motion.svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </motion.svg>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Colonne de droite - Image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative h-[500px] bg-white/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-indigo-100/20" />
                <img 
                  src={assistantRiaImg} 
                  alt="Présentation de l'assistant RIA" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssistantRIAPage; 