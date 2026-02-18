import React, { useEffect, useState } from 'react';
import { supabasePublic } from '../lib/supabasePublic';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// import { motion } from 'framer-motion';

interface DoctrineArticle {
  id: number;
  titre: string;
  abstract: string;
  date: string;
  theme: string;
  auteur: string;
  image_url?: string;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const DoctrinePage: React.FC = () => {
  const [articles, setArticles] = useState<DoctrineArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('doctrine')
          .select('id, titre, abstract, date, theme, auteur, image_url')
          .order('date', { ascending: false });

        if (error) throw error;
        // Debug: vérifier les données reçues
        console.log('Articles récupérés:', data);
        if (data) {
          data.forEach((article, index) => {
            console.log(`Article ${index + 1} (${article.titre}): image_url =`, article.image_url);
          });
        }
        setArticles(data || []);
      } catch (err) {
        console.error('Erreur lors de la récupération des articles:', err);
        setError('Impossible de charger les articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Helmet>
          <title>Doctrine - RIA Facile</title>
          <meta name="description" content="Articles de doctrine sur le Règlement sur l'Intelligence Artificielle" />
          <link rel="canonical" href="https://ria-facile.com/doctrine" />
        </Helmet>

        {/* En-tête de la page avec dégradé */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg p-8 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Doctrine
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Découvrez nos articles sur le règlement IA (RIA, IA act, AI act) et ses implications pratiques.
          </p>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid gap-8">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image à gauche */}
                  {article.image_url && (
                    <Link 
                      to={`/doctrine/${article.id}`}
                      className="md:w-1/3 h-64 md:h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={article.image_url}
                        alt={article.titre}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.error(`Erreur de chargement de l'image pour l'article ${article.id}:`, article.image_url);
                          console.error('Erreur:', e);
                        }}
                        onLoad={() => {
                          console.log(`Image chargée avec succès pour l'article ${article.id}:`, article.image_url);
                        }}
                      />
                    </Link>
                  )}
                  
                  {/* Contenu à droite */}
                  <div className={`p-8 ${article.image_url ? 'md:w-2/3' : 'w-full'}`}>
                  <div className="flex flex-col mb-6">
                      <Link 
                        to={`/doctrine/${article.id}`}
                        className="text-2xl font-semibold text-purple-800 hover:text-purple-900 transition-colors cursor-pointer"
                      >
                      {article.titre}
                      </Link>
                    <div className="flex items-center gap-3 mt-2">
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
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {article.abstract}
                  </p>
                  <div className="flex justify-between items-center">
                    {article.auteur && (
                      <span className="text-sm text-gray-600 italic">
                        Par {article.auteur}
                      </span>
                    )}
                    <Link 
                      to={`/doctrine/${article.id}`}
                      className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <span>Lire l'article</span>
                      <svg 
                        className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
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
            ))}

            {articles.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                <p className="text-gray-600">
                  Aucun article n'est disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctrinePage; 