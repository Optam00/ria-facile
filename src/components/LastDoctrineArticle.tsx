import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface DoctrineArticle {
  id: number;
  titre: string;
  abstract: string;
  date: string;
  theme: string;
  auteur: string;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export const LastDoctrineArticle: React.FC = () => {
  const [article, setArticle] = useState<DoctrineArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('doctrine')
          .select('id, titre, abstract, date, theme, auteur')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Erreur lors de la récupération du dernier article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLastArticle();
  }, []);

  if (loading || !article) return null;

  return (
    <div className="relative py-6">
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="inline-block text-3xl font-bold text-purple-800 mb-2 px-4 py-1 bg-white rounded-lg">
            Notre dernier article
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full" />
        </div>

        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="p-6">
            <div className="flex flex-col mb-4">
              <h3 className="text-2xl font-semibold text-purple-800 mb-2">
                {article.titre}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {formatDate(article.date)}
                </span>
                {article.theme && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {article.theme}
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {article.abstract}
            </p>
            <div className="flex justify-between items-center">
              {article.auteur && (
                <span className="text-sm text-gray-600 italic">
                  Par {article.auteur}
                </span>
              )}
              <div className="flex items-center gap-4">
                <Link 
                  to="/doctrine"
                  className="text-purple-600 hover:text-purple-800 text-sm transition-colors duration-300"
                >
                  Voir tous les articles
                </Link>
                <Link 
                  to={`/doctrine/${article.id}`}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span>Lire l'article</span>
                  <svg 
                    className="w-5 h-5 ml-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 