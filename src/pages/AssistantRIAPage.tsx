import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';
import { supabase } from '../lib/supabase';

export const AssistantRIAPage = () => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{question: string, answer: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  const MAX_HISTORY = 5;

  // Appel réel à l'API Gemini via le backend Python
  const callGeminiAPI = async (question: string, history: {question: string, answer: string}[]) => {
    const recentHistory = history.slice(-MAX_HISTORY);
    const response = await fetch('https://assistant-ria-backend.onrender.com/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: recentHistory }),
    });
    const data = await response.json();
    return data.answer;
  };

  // Sauvegarde la question dans Supabase
  const saveQuestionToSupabase = async (question: string) => {
    try {
      await supabase.from('assistant_ria').insert([{ question }]);
    } catch (error) {
      // Optionnel : log ou gestion d'erreur
      console.error('Erreur lors de la sauvegarde de la question dans Supabase', error);
    }
  };

  const handleAsk = async (q?: string) => {
    const userQuestion = q || question;
    if (!userQuestion.trim()) return;
    setIsLoading(true);
    try {
      // Sauvegarde la question dans Supabase
      saveQuestionToSupabase(userQuestion);
      const answer = await callGeminiAPI(userQuestion, history);
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

  // Auto-expand textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Envoi avec Ctrl+Entrée ou Cmd+Entrée
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAsk();
    }
  };

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setLoadingTooLong(true), 15000); // 15 secondes
      return () => clearTimeout(timer);
    } else {
      setLoadingTooLong(false);
    }
  }, [isLoading]);

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
        {history.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="mb-4"
          >
            <div className="font-semibold text-[#774792]">Vous :</div>
            <div className="bg-white rounded-xl ria-bubble mb-1 text-gray-800 border border-gray-100">{item.question}</div>
            <div className="font-semibold text-blue-800 flex items-center gap-2">Assistant :
              <button
                onClick={() => handleCopy(item.answer, idx)}
                className="ml-2 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 transition text-blue-700 text-xs border border-blue-200"
                title="Copier la réponse"
              >
                {copiedIndex === idx ? (
                  <span>✔️ Copié !</span>
                ) : (
                  <span>📋 Copier la réponse</span>
                )}
              </button>
            </div>
            <div className="bg-white rounded-xl ria-bubble text-gray-700 prose-ria max-w-none border border-gray-100">
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
        className="flex items-center max-w-7xl mx-auto mb-2 bg-white rounded-xl border border-gray-100 shadow-sm px-2 py-1"
      >
        <textarea
          ref={textareaRef}
          className="flex-1 px-4 py-2 rounded-xl border-0 focus:ring-0 focus:outline-none resize-none min-h-[44px] text-sm bg-transparent leading-[1.7] flex items-center"
          placeholder="Posez votre question sur le règlement IA..."
          value={question}
          onChange={handleTextareaInput}
          onKeyDown={handleTextareaKeyDown}
          disabled={isLoading}
          rows={1}
          required
          style={{resize: 'none', display: 'flex', alignItems: 'center'}}
        />
        <button
          type="submit"
          className="ml-2 p-2 rounded-full bg-gradient-to-r from-blue-600 to-[#774792] text-white shadow hover:shadow-md transition-all duration-300 disabled:opacity-60 flex items-center justify-center"
          disabled={isLoading || !question.trim()}
          aria-label="Envoyer (Ctrl+Entrée ou Cmd+Entrée)"
          title="Envoyer (Ctrl+Entrée ou Cmd+Entrée)"
        >
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          )}
        </button>
      </form>
      {/* Bouton Nouvelle conversation centré sous la zone de saisie */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm border border-gray-300 shadow-sm transition disabled:opacity-60"
          onClick={() => setHistory([])}
          disabled={isLoading || history.length === 0}
          title="Démarrer une nouvelle conversation"
        >
          <span role="img" aria-label="nouvelle conversation">🗑️</span> Nouvelle conversation
        </button>
      </div>
      {/* Message d'attente pendant le chargement */}
      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          L’assistant réfléchit… Cela peut prendre quelques secondes.
        </div>
      )}
      {/* Message si attente trop longue */}
      {isLoading && loadingTooLong && (
        <div className="text-center text-sm text-red-500 mt-2">
          Le service est momentanément lent, merci de patienter ou de réessayer plus tard.
        </div>
      )}
      {history.length > MAX_HISTORY && (
        <div className="text-red-600 text-center mb-8 font-semibold text-base bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto px-4 py-3">
          ⚠️ <b>Attention&nbsp;:</b> Seules les <b>5 dernières questions</b> sont prises en compte par l'assistant.<br />
          Si vous posez une nouvelle question, <b>l'historique de l'échange ne sera plus pris en compte</b> et la cohérence des réponses ne sera plus garantie.<br />
          Pensez à démarrer une nouvelle conversation si besoin.
        </div>
      )}
    </div>
  );
};

export default AssistantRIAPage; 