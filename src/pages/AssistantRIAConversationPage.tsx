import React, { useState, useRef, useEffect } from 'react';
import assistantRiaImg from '../assets/assistant_ria.jpeg';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';
import { supabase } from '../lib/supabase';

const MAX_HISTORY = 5;

const AssistantRIAConversationPage = () => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{question: string, answer: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loadingTooLong, setLoadingTooLong] = useState(false);

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

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userQuestion = question;
    if (!userQuestion.trim()) return;
    setIsLoading(true);
    try {
      saveQuestionToSupabase(userQuestion);
      const answer = await callGeminiAPI(userQuestion, history);
      setHistory(prev => [...prev, { question: userQuestion, answer }]);
    } catch (e) {
      setHistory(prev => [...prev, { question: userQuestion, answer: "Le service est momentanément saturé en raison d’un grand nombre de demandes. Merci de réessayer dans quelques instants." }]);
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-white py-12 rounded-3xl">
      {/* Image uniquement si aucune question posée */}
      {history.length === 0 && (
        <img
          src={assistantRiaImg}
          alt="Assistant RIA"
          className="w-24 h-24 mb-8 rounded-full shadow-md object-cover"
        />
      )}
      {/* Historique des échanges */}
      <div className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-4 flex flex-col items-center px-2 sm:px-0">
        {history.map((item, idx) => (
          <div key={idx} className="mb-6 w-full">
            <div className="font-semibold text-[#774792] mb-1">Vous :</div>
            <div className="bg-white rounded-xl border border-[#d1b3f7] px-4 py-2 mb-2 text-gray-800">{item.question}</div>
            <div className="font-semibold text-blue-800 flex items-center gap-2 mb-1">Assistant RIA :
              <button
                onClick={() => handleCopy(item.answer, idx)}
                className="ml-2 px-3 py-1 rounded-full bg-[#ede6fa] hover:bg-[#d1b3f7] transition text-[#774792] text-xs font-medium flex items-center gap-1 border border-[#d1b3f7] shadow-sm hover:shadow-md focus:outline-none"
                title="Copier la réponse"
              >
                <span className="text-base">📋</span>
                {copiedIndex === idx ? (
                  <span>Copié !</span>
                ) : (
                  <span>Copier la réponse</span>
                )}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#d1b3f7] px-4 py-2 text-gray-700 prose-ria max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: (props) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#774792] underline hover:text-violet-900 transition-colors"
                    >
                      {props.children}
                    </a>
                  ),
                }}
              >
                {item.answer.replace(/\n/g, '\n\n')}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      {/* Zone de saisie toujours en bas */}
      <form
        onSubmit={handleAsk}
        className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-6 bg-[#f6f0fa] rounded-xl border-2 border-[#774792] shadow-sm px-2 sm:px-4 py-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        style={{ position: 'sticky', bottom: 0, zIndex: 10 }}
      >
        <textarea
          ref={textareaRef}
          className="flex-1 px-4 py-2 rounded-xl border-0 focus:outline-none resize-none min-h-[80px] sm:min-h-[44px] text-lg bg-transparent leading-[1.7] flex items-center"
          placeholder="Posez votre question"
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
          className="sm:ml-2 p-2 rounded-full bg-gradient-to-r from-indigo-500 to-[#774792] text-white shadow hover:shadow-md transition-all duration-300 disabled:opacity-60 flex items-center justify-center self-end sm:self-auto"
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
      {/* Message et bouton pour nouvelle discussion si l'historique dépasse MAX_HISTORY */}
      {history.length > MAX_HISTORY && (
        <div className="flex flex-col items-center mt-2">
          <div className="text-sm text-gray-600 mb-2 text-center">
            Seuls les 5 derniers échanges sont pris en compte pour chaque nouvelle question.<br />
            Pour repartir sur une nouvelle base, commencez une nouvelle discussion.
          </div>
          <button
            className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-[#774792] text-white shadow hover:shadow-md transition-all duration-300 text-sm"
            onClick={() => setHistory([])}
          >
            Commencer une nouvelle discussion
          </button>
        </div>
      )}
      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          L’assistant réfléchit… Cela peut prendre plusieurs dizaines de secondes.
        </div>
      )}
    </div>
  );
};

export default AssistantRIAConversationPage; 