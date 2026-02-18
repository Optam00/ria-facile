import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabasePublic } from '../lib/supabasePublic';
import { Helmet } from 'react-helmet-async';

interface DoctrineArticleComplet {
  id: number;
  titre: string;
  date: string;
  abstract: string;
  intro: string;
  titre1: string;
  'sous-titre1': string;
  contenu1: string;
  'sous-titre2': string;
  contenu2: string;
  titre2: string;
  'sous-titre3': string;
  contenu3: string;
  'sous-titre4': string;
  contenu4: string;
  conclusion: string;
  references: string;
  auteur: string;
  image_url?: string;
  image_contenu_url?: string;
}

const DoctrineArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<DoctrineArticleComplet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('doctrine')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'article:', err);
        setError('Impossible de charger l\'article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Article non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>{article.titre} - RIA Facile</title>
        <meta name="description" content={article.abstract} />
        {/* Open Graph */}
        <meta property="og:title" content={article.titre + ' - RIA Facile'} />
        <meta property="og:description" content={article.abstract} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
        {/* Image Open Graph */}
        <meta property="og:image" content={article.image_url || "https://www.ria-facile.com/favicon.ico"} />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.titre + ' - RIA Facile'} />
        <meta name="twitter:description" content={article.abstract} />
        <meta name="twitter:image" content={article.image_url || "https://www.ria-facile.com/favicon.ico"} />
      </Helmet>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Lien retour discret en haut */}
          <div className="mb-4">
            <Link 
              to="/doctrine"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-300 text-sm"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              <span>Voir tous les articles</span>
            </Link>
          </div>

          {/* Titre en haut */}
          <h1 className="text-4xl font-bold text-center mb-8" style={{ color: '#774792' }}>
          {article.titre}
        </h1>

          {/* Image à gauche et résumé à droite */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
            {/* Image à gauche */}
            {article.image_url && (
              <div className="md:w-1/3 flex-shrink-0 flex items-center">
                <img
                  src={article.image_url}
                  alt={article.titre}
                  className="w-full h-auto rounded-lg object-cover shadow-md"
                  loading="eager"
                />
        </div>
            )}

            {/* Résumé à droite */}
            <div className={`${article.image_url ? 'md:w-2/3' : 'w-full'} flex items-center`}>
              <div className="bg-gray-50 p-6 rounded-lg text-gray-700 italic w-full">
          {article.abstract}
              </div>
            </div>
        </div>

        {/* Introduction */}
        <div className="mb-8 text-gray-700 leading-relaxed">
          {article.intro}
        </div>

        {/* Image de contenu (schéma explicatif) - après l'introduction */}
        {article.image_contenu_url && (
          <div className="mb-8 flex justify-center">
            <img
              src={article.image_contenu_url}
              alt="Schéma explicatif"
              className="max-w-full h-auto rounded-lg shadow-md"
              loading="lazy"
            />
          </div>
        )}

        {/* Partie 1 */}
        <h2 className="text-2xl font-bold uppercase mb-6" style={{ color: '#774792' }}>
          {article.titre1}
        </h2>

        {/* Sous-partie 1.1 */}
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {article['sous-titre1']}
        </h3>
        <div className="mb-8 text-gray-700 leading-relaxed">
          {article.contenu1}
        </div>

        {/* Sous-partie 1.2 */}
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {article['sous-titre2']}
        </h3>
        <div className="mb-8 text-gray-700 leading-relaxed">
          {article.contenu2}
        </div>

        {/* Partie 2 */}
        <h2 className="text-2xl font-bold uppercase mb-6" style={{ color: '#774792' }}>
          {article.titre2}
        </h2>

        {/* Sous-partie 2.1 */}
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {article['sous-titre3']}
        </h3>
        <div className="mb-8 text-gray-700 leading-relaxed">
          {article.contenu3}
        </div>

        {/* Sous-partie 2.2 */}
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {article['sous-titre4']}
        </h3>
        <div className="mb-8 text-gray-700 leading-relaxed">
          {article.contenu4}
        </div>

        {/* Conclusion */}
        <div className="mb-8 text-gray-700 leading-relaxed">
          {article.conclusion}
        </div>

        {/* Références */}
        <div className="text-sm italic mb-4 text-gray-600 border-t pt-4">
          {article.references.split('\n').map((reference, index) => (
            <p key={index} className="mb-2">
              {reference}
            </p>
          ))}
        </div>

        {/* Auteur et date */}
        <div className="text-right text-gray-800 font-semibold">
          {article.auteur}
          <span className="text-gray-400 text-sm font-normal ml-2">
            • {new Date(article.date).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Lien retour liste articles */}
        <div className="mt-8 text-center">
          <Link 
            to="/doctrine"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-300"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Voir tous les articles de doctrine
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DoctrineArticlePage; 