import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';
import assistantRiaImg from '../assets/assistant_ria.jpeg';
import { useAuth } from '../contexts/AuthContext';
import { supabasePublic } from '../lib/supabasePublic';

const MAX_HISTORY = 5;

type SourceType = 'reglement' | 'lignes_directrices' | 'jurisprudence';
type ResponseMode = 'quick' | 'balanced' | 'detailed';

interface HistoryItem {
  question: string;
  answer: string;
  sources: SourceType[];
  retrievedDocs: Array<{
    content: string;
    source?: string;
    sourceType?: string;
    score?: number;
  }>;
}

const SOURCE_OPTIONS: Record<SourceType, string> = {
  reglement: 'Règlement européen sur l\'IA',
  lignes_directrices: 'Lignes directrices officielles',
  jurisprudence: 'Jurisprudence',
};

/**
 * Nettoie le texte pour supprimer les caractères indésirables et corriger les problèmes d'encodage
 */
function cleanAnswerText(text: string): string {
  return text
    // Supprimer les caractères de contrôle non-standard
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Corriger les problèmes d'encodage courants
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, '—')
    .replace(/â€"/g, '–')
    .replace(/â€¦/g, '…')
    // Normaliser les espaces multiples
    .replace(/[ \t]+/g, ' ')
    // Normaliser les sauts de ligne multiples (garder max 2)
    .replace(/\n{3,}/g, '\n\n')
    // Supprimer les espaces en début/fin de ligne
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

const RAGTestPage: React.FC = () => {
  const { isAdmin, isAdherent, loading } = useAuth();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [hasGuidelines, setHasGuidelines] = useState(true);
  const [hasJurisprudence, setHasJurisprudence] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSourceInfo, setShowSourceInfo] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const [expandedSourceGroups, setExpandedSourceGroups] = useState<Record<string, boolean>>({});
  const [expandedSourceItems, setExpandedSourceItems] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mode de réponse : rapide, équilibrée, complète
  const [responseMode, setResponseMode] = useState<ResponseMode>('detailed');

  // L'utilisateur a accès s'il est admin ou adhérent
  const hasAccess = isAdmin() || isAdherent();

  // Fonction pour gérer le compteur de questions par jour pour les non-adhérents
  const getQuestionCountToday = (): number => {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const key = `rag-questions-${today}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  };

  const incrementQuestionCount = (): void => {
    const today = new Date().toISOString().split('T')[0];
    const key = `rag-questions-${today}`;
    const currentCount = getQuestionCountToday();
    localStorage.setItem(key, (currentCount + 1).toString());
  };

  const canAskQuestion = (): boolean => {
    // Les administrateurs et adhérents n'ont pas de limite
    if (isAdmin() || isAdherent()) {
      return true;
    }
    // Les non-adhérents sont limités à 2 questions par jour
    return getQuestionCountToday() < 2;
  };

  const getRemainingQuestions = (): number => {
    // Les administrateurs et adhérents n'ont pas de limite
    if (isAdmin() || isAdherent()) {
      return Infinity;
    }
    return Math.max(0, 2 - getQuestionCountToday());
  };

  // Sauvegarder la question dans Supabase (pour analytics)
  const saveQuestionToSupabase = async (question: string, sources: SourceType[]) => {
    try {
      console.log('💾 Sauvegarde de la question RAG dans Supabase');
      const { error } = await supabasePublic
        .from('rag_questions')
        .insert([{ 
          question,
          sources: sources // Tableau des sources utilisées
        }]);
      if (error) {
        console.error('❌ Erreur sauvegarde question RAG:', error);
      } else {
        console.log('✅ Question RAG sauvegardée avec succès');
      }
    } catch (error) {
      // On continue même si la sauvegarde échoue
      console.error('❌ Erreur sauvegarde question RAG:', error);
    }
  };

  // Le règlement est toujours inclus
  const selectedSources: SourceType[] = [
    'reglement',
    ...(hasGuidelines ? (['lignes_directrices'] as SourceType[]) : []),
    ...(hasJurisprudence ? (['jurisprudence'] as SourceType[]) : []),
  ];

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    // Effacer le message d'erreur quand l'utilisateur tape
    if (limitError) {
      setLimitError(null);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    // Vérifier la limite pour les non-adhérents
    if (!canAskQuestion()) {
      setLimitError('Vous avez atteint la limite de 2 questions par jour.');
      return;
    }

    setLimitError(null);
    setIsLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante');
      }

      // Préparer l'historique récent (max 5 derniers échanges)
      const recentHistory = history.slice(-MAX_HISTORY).map(item => ({
        question: item.question,
        answer: item.answer,
      }));

      const response = await fetch(`${supabaseUrl}/functions/v1/rag-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          question: question.trim(),
          sources: selectedSources,
          history: recentHistory,
          mode: responseMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Incrémenter le compteur uniquement pour les non-adhérents et non-admins (même si ça échoue, on compte la tentative)
      if (!isAdmin() && !isAdherent()) {
        incrementQuestionCount();
      }
      
      // Sauvegarder la question dans Supabase
      await saveQuestionToSupabase(question.trim(), selectedSources);
      
      const cleanedAnswer = data.answer ? cleanAnswerText(data.answer) : 'Aucune réponse générée';
      const retrievedDocs = (data.documents || []).map((doc: any) => ({
        content: doc.content,
        source: doc.source,
        sourceType: doc.sourceType,
        score: doc.score,
      }));

      // Ajouter à l'historique
      setHistory(prev => [...prev, {
        question: question.trim(),
        answer: cleanedAnswer,
        sources: selectedSources,
        retrievedDocs,
      }]);

      setQuestion('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Erreur RAG:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche RAG');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white py-12 rounded-3xl relative">
      <Helmet>
        <title>RAG — RIA Facile</title>
        <meta name="description" content="Recherche augmentée par génération (RAG) sur le Règlement européen sur l'IA" />
      </Helmet>

      {/* Overlay pour les non-adhérents */}
      {!loading && !hasAccess && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-8">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-70 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center mt-4">
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

      {/* Image uniquement si aucune question posée */}
      {history.length === 0 && (
        <img
          src={assistantRiaImg}
          alt="RAG"
          className={`w-24 h-24 mb-8 rounded-full shadow-md object-cover ${!loading && !hasAccess ? 'filter blur-sm pointer-events-none select-none' : ''}`}
        />
      )}

      {/* Historique des échanges */}
      <div className={`w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-4 flex flex-col items-center px-2 sm:px-0 ${!loading && !hasAccess ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        {history.map((item, idx) => (
          <div key={idx} className="mb-6 w-full">
            {/* Question */}
            <div className="font-semibold text-[#774792] flex items-center gap-2 mb-1">
              Vous :
              <button
                onClick={() => handleCopy(item.question, idx)}
                className="ml-2 px-2 py-0.5 rounded-full bg-[#f6f0fa] hover:bg-[#ede6fa] transition text-[#a58fd6] text-[11px] font-normal flex items-center gap-1 border border-[#e5d8fa] shadow-none hover:shadow focus:outline-none"
                title="Copier la question"
              >
                <span className="text-xs">📋</span>
                {copiedIndex === idx ? (
                  <span>Copié !</span>
                ) : (
                  <span>Copier la question</span>
                )}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#d1b3f7] px-4 py-2 mb-2 text-gray-800">
              {item.question}
            </div>

            {/* Réponse */}
            <div className="font-semibold text-blue-800 flex items-center gap-2 mb-1">
              RAG :
              <button
                onClick={() => handleCopy(item.answer, idx)}
                className="ml-2 px-2 py-0.5 rounded-full bg-[#f6f0fa] hover:bg-[#ede6fa] transition text-[#a58fd6] text-[11px] font-normal flex items-center gap-1 border border-[#e5d8fa] shadow-none hover:shadow focus:outline-none"
                title="Copier la réponse"
              >
                <span className="text-xs">📋</span>
                {copiedIndex === idx ? (
                  <span>Copié !</span>
                ) : (
                  <span>Copier la réponse</span>
                )}
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#d1b3f7] px-4 py-2 mb-2 text-gray-700 prose-ria max-w-none
              [&>p]:mb-6 [&>p]:leading-relaxed
              [&>ul]:mb-6 [&>ul]:ml-6 [&>ul]:list-disc [&>ul]:space-y-2
              [&>ol]:mb-6 [&>ol]:ml-6 [&>ol]:list-decimal [&>ol]:space-y-2
              [&>ul>li]:ml-2 [&>ol>li]:ml-2
              [&>ul>li>ul]:mt-2 [&>ul>li>ul]:ml-6 [&>ul>li>ul]:list-disc
              [&>ol>li>ol]:mt-2 [&>ol>li>ol]:ml-6 [&>ol>li>ol]:list-decimal
              [&>strong]:font-semibold [&>strong]:text-gray-900
              [&>em]:italic [&>em]:text-gray-700">
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
                  p: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="mb-6 ml-6 list-disc space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-6 ml-6 list-decimal space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-2 leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">{children}</em>
                  ),
                }}
              >
                {cleanAnswerText(item.answer).replace(/\n/g, '\n\n')}
              </ReactMarkdown>
            </div>

            {/* Sources pertinentes - Section dépliable */}
            {item.retrievedDocs.length > 0 && (() => {
              const isExpanded = expandedSources[idx] ?? false;
              
              // Trier les documents par score décroissant
              const sortedDocs = [...item.retrievedDocs].sort((a, b) => (b.score || 0) - (a.score || 0));
              
              // Regrouper par type de source
              const groupedDocs: Record<string, typeof sortedDocs> = {};
              sortedDocs.forEach(doc => {
                const type = doc.sourceType || 'autre';
                if (!groupedDocs[type]) {
                  groupedDocs[type] = [];
                }
                groupedDocs[type].push(doc);
              });
              
              // Fonction pour obtenir le score de pertinence visuel
              const getScoreColor = (score: number) => {
                if (score >= 0.7) return 'bg-green-500';
                if (score >= 0.5) return 'bg-yellow-500';
                if (score >= 0.3) return 'bg-orange-500';
                return 'bg-gray-400';
              };
              
              // Fonction pour obtenir l'icône du type
              const getSourceIcon = (type: string) => {
                if (type === 'reglement') return '📋';
                if (type === 'lignes_directrices') return '📘';
                if (type === 'jurisprudence') return '⚖️';
                return '📄';
              };
              
              // Fonction pour extraire les métadonnées du contenu
              const extractMetadata = (content: string, source: string | undefined) => {
                // Chercher Article X, Paragraphe Y, etc.
                const articleMatch = content.match(/Article\s+(\d+)/i) || source?.match(/Article\s+(\d+)/i);
                const paragraphMatch = content.match(/Paragraphe\s*\((\d+)\)/i) || source?.match(/Paragraphe\s*\((\d+)\)/i);
                const definitionMatch = content.match(/Définition de\s*«([^»]+)»/i);
                
                return {
                  article: articleMatch ? articleMatch[1] : null,
                  paragraph: paragraphMatch ? paragraphMatch[1] : null,
                  definition: definitionMatch ? definitionMatch[1] : null,
                  sourceText: source || null,
                };
              };
              
              return (
                <div className="mt-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedSources(prev => ({ ...prev, [idx]: !isExpanded }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-violet-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{isExpanded ? '📚' : '📖'}</span>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Sources pertinentes ({item.retrievedDocs.length})
                      </h3>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {Object.entries(groupedDocs).map(([type, docs]) => {
                        const groupKey = `${idx}-${type}`;
                        const isGroupExpanded = expandedSourceGroups[groupKey] ?? true;
                        const sourceTypeLabel = SOURCE_OPTIONS[type as SourceType] || type;
                        const sourceTypeColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
                          'reglement': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: '📋' },
                          'lignes_directrices': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: '📘' },
                          'jurisprudence': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '⚖️' }
                        };
                        const colors = sourceTypeColors[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: '📄' };
                        
                        return (
                          <div key={type} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                            <button
                              onClick={() => setExpandedSourceGroups(prev => ({ ...prev, [groupKey]: !isGroupExpanded }))}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{colors.icon}</span>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                  {sourceTypeLabel}
                                </span>
                                <span className="text-xs text-gray-500">({docs.length} source{docs.length > 1 ? 's' : ''})</span>
                              </div>
                              <svg
                                className={`w-4 h-4 text-gray-600 transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {isGroupExpanded && (
                              <div className="px-4 pb-3 space-y-3">
                                {docs.map((doc, docIdx) => {
                                  const itemKey = `${groupKey}-${docIdx}`;
                                  const isItemExpanded = expandedSourceItems[itemKey] ?? false;
                                  const metadata = extractMetadata(doc.content, doc.source);
                                  const score = doc.score || 0;
                                  const scorePercent = (score * 100).toFixed(1);
                                  const previewLength = 150;
                                  const shouldTruncate = doc.content.length > previewLength;
                                  const displayContent = isItemExpanded || !shouldTruncate 
                                    ? doc.content 
                                    : doc.content.substring(0, previewLength) + '...';
                                  
                                  return (
                                    <div key={docIdx} className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:border-violet-300 transition-colors">
                                      {/* En-tête avec métadonnées et score */}
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 mb-1">
                                            {metadata.article && (
                                              <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
                                                Article {metadata.article}
                                              </span>
                                            )}
                                            {metadata.paragraph && (
                                              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                Paragraphe {metadata.paragraph}
                                              </span>
                                            )}
                                            {metadata.definition && (
                                              <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                                                Définition «{metadata.definition}»
                                              </span>
                                            )}
                                            {metadata.sourceText && !metadata.article && (
                                              <span className="text-xs font-medium text-gray-600">
                                                {metadata.sourceText}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                          {/* Barre de score */}
                                          <div className="flex items-center gap-1.5">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full ${getScoreColor(score)} transition-all`}
                                                style={{ width: `${Math.min(score * 100, 100)}%` }}
                                              />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-right">
                                              {scorePercent}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Contenu */}
                                      <div className="mb-2">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                          {displayContent}
                                        </p>
                                        {shouldTruncate && (
                                          <button
                                            onClick={() => setExpandedSourceItems(prev => ({ ...prev, [itemKey]: !isItemExpanded }))}
                                            className="mt-2 text-xs text-violet-600 hover:text-violet-800 font-medium underline"
                                          >
                                            {isItemExpanded ? 'Lire moins' : 'Lire plus'}
                                          </button>
                                        )}
                                      </div>
                                      
                                      {/* Actions */}
                                      <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-200">
                                        <button
                                          onClick={async () => {
                                            try {
                                              await navigator.clipboard.writeText(doc.content);
                                              setCopiedIndex(idx * 1000 + docIdx);
                                              setTimeout(() => setCopiedIndex(null), 2000);
                                            } catch (err) {
                                              console.error('Erreur lors de la copie:', err);
                                            }
                                          }}
                                          className="text-xs px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors flex items-center gap-1"
                                          title="Copier l'extrait"
                                        >
                                          <span>📋</span>
                                          {copiedIndex === idx * 1000 + docIdx ? 'Copié !' : 'Copier'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Message et bouton pour nouvelle discussion si l'historique dépasse MAX_HISTORY */}
      {history.length > MAX_HISTORY && (
        <div className="flex flex-col items-center mt-2 w-full max-w-xs sm:max-w-2xl lg:max-w-4xl">
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

      {/* Message d'erreur */}
      {error && (
        <div className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-4 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* Message d'erreur de limite */}
      {limitError && (
        <div className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-4 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {limitError}{' '}
          <Link to="/inscription" className="text-red-800 font-semibold hover:underline">
            Devenez adhérent
          </Link>
          {' '}pour poser des questions illimitées !
        </div>
      )}

      {/* Indicateur de questions restantes pour les non-adhérents (pas pour les admins) */}
      {!isAdmin() && !isAdherent() && (
        <div className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-2 mb-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm text-center">
          {getRemainingQuestions() > 0 ? (
            <>Questions restantes aujourd'hui : <strong>{getRemainingQuestions()}</strong> / 2</>
          ) : (
            <>
              Vous avez atteint votre limite quotidienne.{' '}
              <Link to="/inscription" className="text-blue-800 font-semibold hover:underline">
                Devenez adhérent
              </Link>
              {' '}pour des questions illimitées !
            </>
          )}
        </div>
      )}

      {/* Zone de saisie avec sélection de sources */}
      <div className={`w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mt-6 ${!loading && !hasAccess ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        {/* Sélection des sources de recherche */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Rechercher dans :
          </label>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <button
              type="button"
              disabled={true}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                hasGuidelines
                  ? 'bg-gradient-to-r from-[#774792] to-violet-600 text-white shadow-md'
                  : 'bg-[#774792] text-white shadow-sm'
              } cursor-default`}
              title="Toujours inclus"
            >
              📋 Règlement
            </button>
            <span className="text-gray-400 text-xs">+</span>
            <button
              type="button"
              onClick={() => setHasGuidelines(!hasGuidelines)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                hasGuidelines
                  ? 'bg-gradient-to-r from-[#774792] to-violet-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              📘 Lignes directrices
            </button>
            <span className="text-gray-400 text-xs">+</span>
            <button
              type="button"
              onClick={() => setHasJurisprudence(!hasJurisprudence)}
              disabled={true}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed whitespace-nowrap"
              title="Bientôt disponible"
            >
              Jurisprudence
              <span className="ml-1 text-[10px]">🔒</span>
            </button>
          </div>
          
          {/* Lien "En savoir plus sur les sources" */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowSourceInfo(!showSourceInfo)}
              className="text-xs text-[#774792] hover:text-violet-900 underline transition-colors"
            >
              {showSourceInfo ? 'Masquer' : 'En savoir plus sur les sources'}
            </button>
          </div>

          {/* Informations sur les sources */}
          {showSourceInfo && (
            <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <h4 className="font-semibold text-gray-900 mb-3">Sources utilisées :</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 mb-1">📋 Règlement européen sur l'IA</p>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Titre :</strong> Règlement (UE) 2024/1689 du Parlement européen et du Conseil du 13 juin 2024 relatif à l'établissement de règles harmonisées concernant l'intelligence artificielle
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Lien :</strong>{' '}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1689" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#774792] hover:underline"
                    >
                      https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1689
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">📘 Lignes directrices officielles</p>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Note importante :</strong> Seules les lignes directrices officielles publiées par la Commission européenne sont prises en compte. Les drafts, FAQ et autres documents non officiels ne sont pas inclus.
                  </p>
                  <div className="space-y-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-gray-800 mb-1">
                        • Commission guidelines on the definition of an artificial intelligence system established by Regulation (EU) 2024/1689 (AI Act)
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Lien :</strong>{' '}
                        <a 
                          href="https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-08/commission_guidelines_on_the_definition_of_an_artificial_intelligence_system_established_by_regulation_eu_20241689_ai_actenglish_nf2skcqfrtjdfggjavcodopcwz4_112455.PDF" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#774792] hover:underline break-all"
                        >
                          https://ai-act-service-desk.ec.europa.eu/.../commission_guidelines_on_the_definition...
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800 mb-1">
                        • Guidelines on prohibited artificial intelligence practices established by Regulation (EU) 2024/1689 (AI Act)
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Lien :</strong>{' '}
                        <a 
                          href="https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-08/guidelines_on_prohibited_artificial_intelligence_practices_established_by_regulation_eu_20241689_ai_act_english_ied3r5nwo50xggpcfmwckm3nuc_112367-1.PDF" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#774792] hover:underline break-all"
                        >
                          https://ai-act-service-desk.ec.europa.eu/.../guidelines_on_prohibited_artificial...
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800 mb-1">
                        • Guidelines on the scope of the obligations for general-purpose AI models established by Regulation (EU) 2024/1689 (AI Act)
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Lien :</strong>{' '}
                        <a 
                          href="https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-07/guidelines_on_the_scope_of_the_obligations_for_generalpurpose_ai_models_established_by_regulation_1cx2atxgq79us4n3x8jfgyy1qlm_118340-3.pdf" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#774792] hover:underline break-all"
                        >
                          https://ai-act-service-desk.ec.europa.eu/.../guidelines_on_the_scope_of_the_obligations...
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">⚖️ Jurisprudence</p>
                  <p className="text-xs text-gray-600 italic">
                    Bientôt disponible
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-600">
                  Vous souhaitez proposer de nouvelles sources ?{' '}
                  <a 
                    href="/contact" 
                    className="text-[#774792] hover:underline font-medium"
                  >
                    Contactez-nous
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sélecteur de mode de réponse */}
        <div className="mb-3 px-2 sm:px-0">
          <div className="flex justify-between items-center text-[11px] text-gray-600 mb-1">
            <span className={responseMode === 'quick' ? 'font-semibold text-[#774792]' : ''}>
              Réponse rapide
            </span>
            <span className={responseMode === 'balanced' ? 'font-semibold text-[#774792]' : ''}>
              Équilibrée
            </span>
            <span className={responseMode === 'detailed' ? 'font-semibold text-[#774792]' : ''}>
              Réponse complète
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 whitespace-nowrap">Vitesse</span>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={responseMode === 'quick' ? 0 : responseMode === 'balanced' ? 1 : 2}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val === 0) setResponseMode('quick');
                else if (val === 1) setResponseMode('balanced');
                else setResponseMode('detailed');
              }}
              className="flex-1 accent-[#774792]"
            />
            <span className="text-[10px] text-gray-500 whitespace-nowrap">Complétude</span>
          </div>
        </div>

        {/* Formulaire de saisie */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#f6f0fa] rounded-xl border-2 border-[#774792] shadow-sm px-2 sm:px-4 py-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          style={{ position: 'sticky', bottom: 0, zIndex: 10 }}
        >
          <textarea
            ref={textareaRef}
            className={`flex-1 px-4 py-2 rounded-xl border-0 focus:outline-none resize-none ${history.length > 0 ? 'min-h-[36px]' : 'min-h-[80px]'} sm:min-h-[44px] text-lg bg-transparent leading-[1.7] flex items-center`}
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
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RAGTestPage;
