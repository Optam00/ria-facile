import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { supabasePublic } from '../lib/supabasePublic';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { CollapsibleSection } from '../components/CollapsibleSection';

interface SearchFilters {
  reglement: boolean;
  documentation: boolean;
  doctrine: boolean;
  actualites: boolean;
  considerants?: boolean;
  annexes?: boolean;
  fichesPratiques: boolean;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function highlight(text: string, keyword: string) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// Fonction utilitaire pour extraire un extrait centré sur le mot-clé
function removeDiacritics(str: string) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function getExcerpt(text: string, keyword: string, contextLength = 40) {
  if (!keyword) return text.slice(0, 200) + (text.length > 200 ? '…' : '');
  // Recherche insensible à la casse et aux accents
  const normalizedText = removeDiacritics(text.toLowerCase());
  const normalizedKeyword = removeDiacritics(keyword.toLowerCase());
  const index = normalizedText.indexOf(normalizedKeyword);
  if (index === -1) return text.slice(0, 200) + (text.length > 200 ? '…' : '');
  // Trouver l'index réel dans le texte original (pour ne pas couper un mot au milieu d'un accent)
  let realIndex = index;
  // On tente de retrouver la position réelle du mot-clé dans le texte original
  // (si le mot-clé contient des accents, la position peut différer)
  for (let i = 0, j = 0; i < text.length && j < index; i++) {
    if (removeDiacritics(text[i].toLowerCase()) === normalizedText[j]) {
      j++;
    }
    realIndex = i;
  }
  const start = Math.max(0, realIndex - contextLength);
  const end = Math.min(text.length, realIndex + keyword.length + contextLength);
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = '…' + excerpt;
  if (end < text.length) excerpt = excerpt + '…';
  return excerpt;
}

// Définition des fiches pratiques pour la recherche locale
const FICHES_PRATIQUES = [
  {
    id: 'exactitude',
    titre: "Gérer l'exactitude (Accuracy) dans les systèmes IA",
    description: "Guide pratique pour la mise en conformité opérationnelle du principe d'exactitude. Croisement RGPD et AI Act.",
    articlesRIA: ['10', '15']
  },
  {
    id: 'explicabilite',
    titre: "Explicabilité & Interprétabilité dans les systèmes IA",
    description: "Guide pratique pour la mise en conformité opérationnelle de l'explicabilité et l'interprétabilité. Croisement RGPD et AI Act.",
    articlesRIA: ['13', '14', '86']
  },
  {
    id: 'droits-rgpd',
    titre: "Gestion des droits RGPD dans les systèmes d'IA",
    description: "Guide pratique pour organiser l'exercice des droits RGPD (accès, rectification, effacement, opposition) dans les systèmes d'IA, en articulation avec le Règlement IA.",
    articlesRIA: ['10', '13', '86']
  },
  {
    id: 'rms',
    titre: "Le système de gestion des risques (RMS)",
    description: "Guide pratique pour la mise en place et la gestion du système de gestion des risques (RMS) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act.",
    articlesRIA: ['9', '16', '26', '27']
  },
  {
    id: 'fria',
    titre: "Analyse d'impact sur les droits fondamentaux (FRIA)",
    description: "Guide pratique pour réaliser une analyse d'impact sur les droits fondamentaux (FRIA) pour les systèmes d'IA à haut risque. Croisement RGPD et AI Act.",
    articlesRIA: ['13', '26', '27']
  },
  {
    id: 'transparence',
    titre: "Transparence et information des utilisateurs",
    description: "Guide pratique pour la transparence et l'information des utilisateurs dans les systèmes d'IA. Croisement RGPD et AI Act.",
    articlesRIA: ['13', '26', '50', '53']
  },
  {
    id: 'controle-humain',
    titre: "Le contrôle humain",
    description: "Guide pratique pour la mise en place du contrôle humain dans les systèmes d'IA à haut risque. Croisement RGPD et AI Act.",
    articlesRIA: ['14', '26']
  },
  {
    id: 'secteur-bancaire',
    titre: "L'AI Act dans le secteur bancaire & financier",
    description: "Guide pratique pour l'application de l'AI Act dans le secteur bancaire et financier (scoring crédit, assurance, biais, FRIA et intégration dans le cadre prudentiel).",
    articlesRIA: ['6', '17', '27']
  },
  {
    id: 'exception-haut-risque',
    titre: "L'exception de qualification \"Haut Risque\" (Article 6.3)",
    description: "Guide pratique sur l'exception de qualification Haut Risque (Art. 6.3 AI Act) : conditions, documentation, enregistrement et articulation avec le RGPD.",
    articlesRIA: ['6', '51']
  },
  {
    id: 'maitrise-ia',
    titre: "La maîtrise de l'IA (Article 4)",
    description: "Guide pratique sur l'obligation de maîtrise de l'IA (Art. 4 AI Act) : formation du personnel, approche contextuelle et plan d'actions pour la conformité.",
    articlesRIA: ['4']
  }
]

export const SearchResultsPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const initialKeyword = query.get('q')?.trim() || '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    reglement: true,
    documentation: true,
    doctrine: true,
    actualites: true,
    considerants: true,
    annexes: true,
    fichesPratiques: true,
  });
  const [results, setResults] = useState({
    reglement: [] as any[],
    documentation: [] as any[],
    doctrine: [] as any[],
    actualites: [] as any[],
    considerants: [] as any[],
    annexes: [] as any[],
    fichesPratiques: [] as any[],
  });

  useEffect(() => {
    if (initialKeyword) {
      performSearch(initialKeyword, filters);
    }
  }, [initialKeyword]);

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setKeyword(searchQuery);
    
    // Mettre à jour l'URL
    navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`, { replace: true });

    const searchResults = {
      reglement: [] as any[],
      documentation: [] as any[],
      doctrine: [] as any[],
      actualites: [] as any[],
      considerants: [] as any[],
      annexes: [] as any[],
      fichesPratiques: [] as any[],
    };

    try {
      // Recherche dans le règlement IA (articles)
      if (searchFilters.reglement) {
        const { data: reglement } = await supabasePublic
          .from('article')
          .select('id_article, titre, numero, contenu')
          .or(`titre.ilike.%${searchQuery}%,contenu.ilike.%${searchQuery}%`);
        searchResults.reglement = reglement || [];
      }

      // Recherche dans la documentation
      if (searchFilters.documentation) {
        const { data: documentation } = await supabasePublic
          .from('documentation')
          .select('id, titre, resume, themes')
          .or(`titre.ilike.%${searchQuery}%,resume.ilike.%${searchQuery}%,themes.ilike.%${searchQuery}%`);
        searchResults.documentation = documentation || [];
      }

      // Recherche dans la doctrine (articles publiés uniquement)
      if (searchFilters.doctrine) {
        const { data: doctrine } = await supabasePublic
          .from('doctrine')
          .select('id, titre, abstract, auteur')
          .eq('published', true)
          .or(`titre.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,auteur.ilike.%${searchQuery}%`);
        searchResults.doctrine = doctrine || [];
      }

      // Recherche dans les actualités
      if (searchFilters.actualites) {
        const { data: actualites } = await supabasePublic
          .from('Actu')
          .select('id, Titre, Date, media, lien')
          .ilike('Titre', `%${searchQuery}%`);
        searchResults.actualites = actualites || [];
      }

      // Recherche dans les considérants (corrigé)
      const { data: considerants, error: considerantsError } = await supabasePublic
        .from('considerant')
        .select('id_considerant, numero, contenu')
        .ilike('contenu', `%${searchQuery}%`);
      console.log('[DEBUG] Recherche considérants', { keyword: searchQuery, data: considerants, error: considerantsError });
      if (considerantsError) alert('Erreur considérants: ' + considerantsError.message);
      searchResults.considerants = considerants || [];

      // Recherche dans les annexes
      if (searchFilters.annexes) {
        // On cherche dans la table annexes (contenu) puis on récupère le titre dans liste_annexes
        const { data: annexesData, error: annexesError } = await supabasePublic
          .from('annexes')
          .select('id_annexe, titre_section, contenu')
          .ilike('contenu', `%${searchQuery}%`);
        if (annexesError) {
          alert('Erreur annexes: ' + annexesError.message);
        }
        let annexesResults: any[] = [];
        if (annexesData && annexesData.length > 0) {
          // Récupérer les titres et numéros des annexes
          const ids = annexesData.map(a => a.id_annexe);
          const { data: listeAnnexes } = await supabasePublic
            .from('liste_annexes')
            .select('id_annexe, titre, numero')
            .in('id_annexe', ids);
          annexesResults = annexesData.map(a => {
            const annexeInfo = listeAnnexes?.find(l => l.id_annexe === a.id_annexe);
            return {
              id_annexe: a.id_annexe,
              numero: annexeInfo?.numero || a.id_annexe,
              titre_annexe: annexeInfo?.titre || `Annexe ${a.id_annexe}`,
              titre_section: a.titre_section,
              contenu: a.contenu,
            };
          });
        }
        searchResults.annexes = annexesResults;
      }

      // Recherche dans les fiches pratiques (locale)
      if (searchFilters.fichesPratiques) {
        const q = removeDiacritics(searchQuery.toLowerCase());
        searchResults.fichesPratiques = FICHES_PRATIQUES.filter(fiche => {
          const titreNormalized = removeDiacritics(fiche.titre.toLowerCase());
          const descriptionNormalized = removeDiacritics(fiche.description.toLowerCase());
          return titreNormalized.includes(q) || descriptionNormalized.includes(q);
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string, searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    performSearch(searchQuery, searchFilters);
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