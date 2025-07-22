import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';

export const AssistantRIAPage = () => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{question: string, answer: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Appel réel à l'API Gemini via le backend Python
  const callGeminiAPI = async (question: string) => {
    const response = await fetch('https://assistant-ria-backend.onrender.com/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    return data.answer;
  };

  const handleAsk = async (q?: string) => {
    const userQuestion = q || question;
    if (!userQuestion.trim()) return;
    setIsLoading(true);
    try {
      const answer = await callGeminiAPI(userQuestion);
      setHistory(prev => [...prev, { question: userQuestion, answer }]);
    } catch (e) {
      setHistory(prev => [...prev, { question: userQuestion, answer: "Erreur lors de la connexion à l'assistant IA." }]);
    }
    setQuestion('');
    setIsLoading(false);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1200);
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
            Posez vos questions sur le règlement européen sur l'intelligence artificielle (RIA, AI Act) et obtenez des réponses instantanées.
          </p>
        </div>
      </div>

      {/* (Suggestions et image supprimées pour un rendu épuré) */}

      {/* Historique */}
      <div className="mb-6 max-w-7xl mx-auto mt-6 pr-2">
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
            <div className="bg-white rounded-xl p-3 mb-1 text-gray-800 border border-gray-100">{item.question}</div>
            <div className="font-semibold text-blue-800 flex items-center gap-2">Assistant :
              <button
                onClick={() => handleCopy(item.answer, idx)}
                className="ml-2 p-1 rounded hover:bg-blue-100 transition text-blue-700 text-xs border border-blue-200"
                title="Copier la réponse"
              >
                {copiedIndex === idx ? (
                  <span>✔️</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2h-5.586a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 007.586 2H6a2 2 0 00-2 2v16a2 2 0 002 2h2" /></svg>
                )}
              </button>
            </div>
            <div className="bg-white rounded-xl p-3 text-gray-700 prose-ria max-w-none border border-gray-100">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {item.answer.replace(/\n/g, '\n\n')}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Formulaire minimaliste façon ChatGPT */}
      <form
        onSubmit={e => { e.preventDefault(); handleAsk(); }}
        className="flex items-center max-w-7xl mx-auto mb-8 bg-white rounded-xl border border-gray-100 shadow-sm px-2 py-1"
      >
        <textarea
          className="flex-1 px-4 py-2 rounded-xl border-0 focus:ring-0 focus:outline-none resize-none min-h-[44px] text-sm bg-transparent"
          placeholder="Posez votre question sur le règlement IA..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={isLoading}
          rows={1}
          required
          style={{resize: 'none'}}
        />
        <button
          type="submit"
          className="ml-2 p-2 rounded-full bg-gradient-to-r from-blue-600 to-[#774792] text-white shadow hover:shadow-md transition-all duration-300 disabled:opacity-60 flex items-center justify-center"
          disabled={isLoading || !question.trim()}
          aria-label="Envoyer"
        >
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default AssistantRIAPage; 