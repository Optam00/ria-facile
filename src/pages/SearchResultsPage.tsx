import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabasePublic } from '../lib/supabasePublic';
import { performSearch, defaultSearchFilters, highlight, getExcerpt, type SearchFilters } from '../lib/searchRIA';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { CollapsibleSection } from '../components/CollapsibleSection';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const SearchResultsPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const initialKeyword = query.get('q')?.trim() || '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [results, setResults] = useState<Awaited<ReturnType<typeof performSearch>>>({
    reglement: [],
    documentation: [],
    doctrine: [],
    actualites: [],
    considerants: [],
    annexes: [],
    fichesPratiques: [],
  });

  useEffect(() => {
    if (!initialKeyword) return;
    setKeyword(initialKeyword);
    setLoading(true);
    performSearch(supabasePublic, initialKeyword, filters)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [initialKeyword]);

  const runSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setKeyword(searchQuery);
    navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`, { replace: true });
    try {
      const searchResults = await performSearch(supabasePublic, searchQuery, searchFilters);
      setResults(searchResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string, searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    runSearch(searchQuery, searchFilters);
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  console.log('Résultats considérants', results.considerants);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* En-tête harmonisé */}
      <div className="bg-white rounded-3xl shadow-md p-8 text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Recherche
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Recherchez dans l'ensemble du site, le règlement IA, la documentation, la doctrine, les considérants, les annexes et les fiches pratiques.
        </p>
      </div>
      
      {/* Composant de recherche avancée */}
      <AdvancedSearch onSearch={handleSearch} isLoading={loading} />

      {/* Résultats */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Recherche en cours…</div>
        </div>
      )}

      {!loading && keyword && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Résultats pour <span className="text-blue-700">"{keyword}"</span>
              {totalResults > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({totalResults} résultat{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>

          {totalResults === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">
                Aucun résultat trouvé pour votre recherche.<br />
                <span className="text-sm">Vérifiez l'orthographe ou essayez un autre mot-clé.</span>
              </div>
            </div>
          )}

          {/* Section Règlement IA */}
          {filters.reglement && (
            <CollapsibleSection 
              title="Dans le règlement IA" 
              resultCount={results.reglement.length}
              defaultOpen={false}
            >
              {results.reglement.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.reglement.map(article => (
                    <li key={article.id_article} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors">
                      <a href={`/consulter?type=article&id=${article.id_article}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium hover:underline text-sm md:text-base flex items-center gap-2">
                        <span className="text-xs md:text-sm font-semibold text-gray-500 shrink-0">{article.numero}</span>
                        <span dangerouslySetInnerHTML={{ __html: highlight(article.titre.replace(/^Art\.? ?\d+\s*-?\s*/i, ''), keyword) }} />
                      </a>
                      <div className="text-xs md:text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlight(getExcerpt(article.contenu, keyword), keyword) }} />
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}

          {/* Section Considérants juste après Règlement IA */}
          {filters.considerants && (
            <CollapsibleSection 
              title="Dans les considérants" 
              resultCount={results.considerants.length}
              defaultOpen={false}
            >
              {results.considerants.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.considerants.map(considerant => (
                    <li key={considerant.id_considerant} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors">
                      <a
                        href={`/consulter?type=considerant&id=${considerant.id_considerant}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-medium hover:underline text-sm md:text-base flex items-center gap-2"
                      >
                        <span className="text-xs md:text-sm font-semibold text-gray-500 shrink-0">Consid. {considerant.numero}</span>
                        <span className="truncate max-w-[60vw] md:max-w-none">{considerant.contenu.slice(0, 60)}{considerant.contenu.length > 60 ? '…' : ''}</span>
                      </a>
                      <div className="text-xs md:text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlight(getExcerpt(considerant.contenu, keyword), keyword) }} />
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}

          {/* Section Annexes juste après Considérants */}
          {filters.annexes && (
            <CollapsibleSection
              title="Dans les annexes"
              resultCount={results.annexes.length}
              defaultOpen={false}
            >
              <div className="space-y-4">
                {results.annexes.map((annexe, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-1"
                  >
                    <div className="font-bold text-gray-800 text-base mb-1">
                      {annexe.titre_annexe || `Annexe ${annexe.numero}`}
                    </div>
                    {annexe.titre_section && (
                      <div className="italic text-purple-700 text-sm mb-1">
                        {annexe.titre_section}
                      </div>
                    )}
                    <div className="text-gray-700 text-sm mb-2">
                      {getExcerpt(annexe.contenu, keyword)}
                      {annexe.contenu && annexe.contenu.length > 200 && '…'}
                    </div>
                    <a
                      href={`/consulter?type=annexe&id=${annexe.id_annexe}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-medium hover:underline text-sm md:text-base flex items-center gap-2"
                    >
                      Consulter cette annexe
                    </a>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Section Documentation */}
          {filters.documentation && (
            <CollapsibleSection 
              title="Dans la documentation utile" 
              resultCount={results.documentation.length}
              defaultOpen={false}
            >
              {results.documentation.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.documentation.map(doc => (
                    <li key={doc.id} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors">
                      <a href={`/documentation?id=${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium hover:underline text-sm md:text-base">
                        <span dangerouslySetInnerHTML={{ __html: highlight(doc.titre, keyword) }} />
                      </a>
                      <div className="text-xs md:text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlight(getExcerpt(doc.resume || '', keyword), keyword) }} />
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}

          {/* Section Doctrine */}
          {filters.doctrine && (
            <CollapsibleSection 
              title="Dans la doctrine" 
              resultCount={results.doctrine.length}
              defaultOpen={false}
            >
              {results.doctrine.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.doctrine.map(doc => (
                    <li key={doc.id} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors">
                      <a href={`/doctrine/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium hover:underline text-sm md:text-base">
                        <span dangerouslySetInnerHTML={{ __html: highlight(doc.titre, keyword) }} />
                      </a>
                      <div className="text-xs md:text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlight(getExcerpt(doc.abstract || '', keyword), keyword) }} />
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}

          {/* Section Fiches pratiques */}
          {filters.fichesPratiques && (
            <CollapsibleSection 
              title="Dans les fiches pratiques" 
              resultCount={results.fichesPratiques.length}
              defaultOpen={false}
            >
              {results.fichesPratiques.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.fichesPratiques.map(fiche => (
                    <li key={fiche.id} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors">
                      <a 
                        href={`/fiches-pratiques/${fiche.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-700 font-medium hover:underline text-sm md:text-base flex items-center gap-2"
                      >
                        <span dangerouslySetInnerHTML={{ __html: highlight(fiche.titre, keyword) }} />
                      </a>
                      <div className="text-xs md:text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: highlight(getExcerpt(fiche.description, keyword), keyword) }} />
                      {fiche.articlesRIA && fiche.articlesRIA.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {fiche.articlesRIA.map((article) => (
                            <span
                              key={article}
                              className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
                            >
                              Art. {article}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}

          {/* Section Actualités */}
          {filters.actualites && (
            <CollapsibleSection 
              title="Dans les actualités" 
              resultCount={results.actualites.length}
              defaultOpen={false}
            >
              {results.actualites.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.actualites.map(actu => (
                    <li key={actu.id} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-0">
                        <div className="flex-1">
                          <a 
                            href={actu.lien}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-medium hover:underline text-sm md:text-base"
                          >
                            <span dangerouslySetInnerHTML={{ __html: highlight(actu.Titre, keyword) }} />
                          </a>
                          <div className="text-xs md:text-sm text-gray-500 mt-1">
                            {new Date(actu.Date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} • {actu.media}
                          </div>
                        </div>
                        <a 
                          href={actu.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#774792] hover:text-[#8a5ba3] ml-0 md:ml-4 text-xs md:text-sm mt-2 md:mt-0"
                        >
                          Lire →
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleSection>
          )}
        </>
      )}

      {!loading && !keyword && (
        <div className="text-center py-8">
          <div className="text-gray-500">Utilisez la barre de recherche ci-dessus pour commencer votre recherche.</div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage; 