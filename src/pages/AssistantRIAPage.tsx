import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import msgImage from '../assets/msg.jpeg';

const suggestions = [
  "Quelles sont les obligations pour les systèmes d'IA à haut risque ?",
  "Quels sont les risques inacceptables selon le règlement IA ?",
  "Comment se mettre en conformité avec le RIA ?",
  "Quelles sanctions en cas de non-conformité ?",
  "À qui s'applique le règlement IA ?"
];

export const AssistantRIAPage = () => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{question: string, answer: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder pour la réponse (sera remplacé par l'appel API plus tard)
  const getFakeAnswer = (q: string) => {
    return "(Réponse simulée) Cette fonctionnalité sera bientôt connectée à l'assistant IA spécialisé dans le règlement IA. Vous pourrez poser toutes vos questions sur la conformité, les obligations, les risques, etc.";
  };

  const handleAsk = async (q?: string) => {
    const userQuestion = q || question;
    if (!userQuestion.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setHistory(prev => [...prev, { question: userQuestion, answer: getFakeAnswer(userQuestion) }]);
      setQuestion('');
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Assistant RIA | RIA Facile</title>
        <meta name="description" content="Posez vos questions sur le règlement IA et obtenez des réponses instantanées grâce à notre assistant spécialisé." />
      </Helmet>
      {/* Encart titre/sous-titre */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-3xl shadow-md p-8 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#774792' }}>Assistant RIA</h1>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Posez vos questions sur le règlement européen sur l'intelligence artificielle (RIA, AI Act) et obtenez des réponses instantanées.<br/>
            <span className="text-gray-500 text-sm block mt-2">Cet assistant est conçu pour vous aider à comprendre vos obligations, les risques, et les bonnes pratiques en matière de conformité IA.</span>
          </p>
        </div>
      </div>

      {/* Encart chatbot et suggestions */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
            <img src={msgImage} alt="Assistant RIA" className="w-32 h-32 object-contain rounded-2xl shadow-lg bg-gradient-to-tr from-purple-100 to-blue-100" />
            <div className="w-full">
              {/* Suggestions */}
              <h2 className="text-lg font-semibold text-purple-800 mb-2">Suggestions de questions :</h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-100 transition"
                    onClick={() => handleAsk(s)}
                    disabled={isLoading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Historique */}
          <div className="mb-6 max-h-72 overflow-y-auto pr-2">
            {history.length === 0 && (
              <div className="text-gray-400 italic text-center">Aucune question posée pour l'instant.</div>
            )}
            {history.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="mb-4"
              >
                <div className="font-semibold text-[#774792]">Vous :</div>
                <div className="bg-purple-50 rounded-xl p-3 mb-1 text-gray-800">{item.question}</div>
                <div className="font-semibold text-blue-800">Assistant :</div>
                <div className="bg-blue-50 rounded-xl p-3 text-gray-700">{item.answer}</div>
              </motion.div>
            ))}
          </div>
          {/* Formulaire */}
          <form
            onSubmit={e => { e.preventDefault(); handleAsk(); }}
            className="flex gap-2 items-end"
          >
            <textarea
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring focus:ring-purple-100 focus:ring-opacity-50 transition-colors shadow-sm resize-none min-h-[56px]"
              placeholder="Posez votre question sur le règlement IA..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={isLoading}
              rows={2}
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-[#774792] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
          <div className="text-xs text-gray-400 mt-4 text-center">Prochainement : réponses en temps réel grâce à l’IA Google (Gemini) spécialisée RIA.</div>
        </div>
      </div>
    </div>
  );
};

export default AssistantRIAPage; 