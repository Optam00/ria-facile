import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { CollapsibleSection } from '../components/CollapsibleSection';

interface SearchFilters {
  reglement: boolean;
  documentation: boolean;
  doctrine: boolean;
  actualites: boolean;
  considerants?: boolean;
  annexes?: boolean;
  schemas: boolean;
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

// Définition des schémas pour la recherche locale
const SCHEMAS = [
  {
    id: 'calendrier',
    titre: "Calendrier d'entrée en application du règlement IA",
    texte: `La grande majorité des obligations du règlement deviennent applicables, notamment toutes les règles pour les systèmes d'IA classés à haut risque (à l'exception de ceux mentionnés au point suivant). ...`,
    image: '/schemas/Dates.png',
    url: '/schemas#date-mise-en-oeuvre',
  },
  {
    id: 'modele-vs-systeme',
    titre: "La distinction entre modèle d'IA et système d'IA",
    texte: `Le Modèle d'IA (Le Moteur) : il s'agit d'un système d'apprentissage automatique ou statistique qui génère des capacités d'IA, mais qui n'est pas directement déployé auprès des utilisateurs finaux. Le Système d'IA (Le Véhicule) : il intègre un ou plusieurs modèles d'IA et est déployé pour une finalité précise auprès des utilisateurs. Le Règlement IA encadre principalement les systèmes d'IA, mais certaines obligations s'appliquent aussi aux modèles d'IA à usage général (GPAI).`,
    image: '/schemas/modele%20vs%20systeme.png',
    url: '/schemas#modele-vs-systeme',
  },
  {
    id: 'gpai',
    titre: "Les différents modèles d'IA à usage général",
    texte: `La réglementation cible spécifiquement les Modèles d'IA à Usage Général (GPAI), c'est-à-dire les modèles pouvant être intégrés dans de nombreux systèmes d'IA différents. Les GPAI sont soumis à des obligations spécifiques de transparence, de documentation et de gestion des risques, notamment pour les modèles présentant un risque systémique élevé.`,
    image: '/schemas/GPAI.png',
    url: '/schemas#gpai',
  },
  {
    id: 'sias',
    titre: "Les niveaux de risques des systèmes d'IA",
    texte: `Le Règlement IA distingue quatre niveaux de risques pour les systèmes d'IA :
- Risque inacceptable : systèmes strictement interdits (ex : manipulation cognitive, scoring social).
- Risque élevé : systèmes soumis à des exigences strictes (ex : IA dans l'éducation, la santé, la justice, la sécurité).
- Risque limité : obligations de transparence (ex : chatbots, deepfakes).
- Risque minimal : usage libre, sans contrainte spécifique.
Chaque niveau de risque détermine le niveau d'obligations et de contrôle applicable.`,
    image: '/schemas/SIAs.png',
    url: '/schemas#sias',
  },
  {
    id: 'limite',
    titre: "Obligations pour les systèmes d'IA à risque limité",
    texte: `1. Systèmes d'Interaction avec les Humains (ex: Chatbots)
- Obligation : Les utilisateurs doivent être informés de manière claire qu'ils interagissent avec un système d'IA.
- Responsable : Le fournisseur doit concevoir le système dans ce but.
- Article de référence : Article 50, paragraphe 1.
- Exception : Cette obligation ne s'applique pas si l'interaction avec l'IA est "évidente" compte tenu des circonstances (par exemple, un avatar dans un jeu vidéo).

2. Systèmes de Reconnaissance des Émotions ou de Catégorisation Biométrique
- Obligation : Les personnes physiques exposées à un tel système doivent être informées de son fonctionnement.
- Responsable : Le déployeur (celui qui utilise le système).
- Article de référence : Article 50, paragraphe 3.
- Note : S'applique uniquement aux systèmes non interdits et non classés à haut risque.

3. Systèmes de Génération de Contenu Artificiel (ex: Deepfakes)
Obligation du Fournisseur :
- Marquer le contenu : Les systèmes doivent intégrer une solution technique pour que les sorties (images, audio, vidéo, texte) soient marquées dans un format lisible par machine, indiquant qu'elles ont été générées artificiellement.
- Article de référence : Article 50, paragraphe 2.
Obligation du Déployeur :
- Déclarer le contenu :
  - Pour les hypertrucages (images/audio/vidéo qui semblent réels), le déployeur doit clairement indiquer que le contenu est artificiel.
  - Pour le texte généré par IA et publié pour informer le public sur des sujets d'intérêt général, le déployeur doit également le signaler.
- Article de référence : Article 50, paragraphe 4.
- Exception : Pour les contenus manifestement artistiques, créatifs, ou satiriques, l'obligation se limite à une divulgation appropriée qui ne gêne pas l'œuvre.

Points Clés Communs à ces Obligations
- Comment informer ? L'information doit être claire, reconnaissable et fournie au plus tard lors de la première interaction ou exposition. (Article 50, paragraphe 5).
- Articulation avec les autres règles : Ces obligations de transparence sont un socle minimal et ne remplacent pas les exigences plus strictes pour les systèmes d'IA à haut risque. (Article 50, paragraphe 6).`,
    image: '/schemas/limite.png',
    url: '/schemas#limite',
  },
  {
    id: 'gouvernance',
    titre: "La gouvernance prévue par le RIA",
    texte: `Le Règlement IA prévoit une gouvernance à plusieurs niveaux :
- Au niveau européen : création d'un Bureau européen de l'IA chargé de la coordination, du suivi et de l'application du règlement.
- Un Comité européen de l'IA réunit les représentants des États membres pour harmoniser les pratiques.
- Au niveau national : chaque État membre désigne une ou plusieurs autorités compétentes pour superviser l'application du règlement.
Cette gouvernance vise à assurer une application cohérente et efficace du Règlement IA dans toute l'Union européenne.`,
    image: '/schemas/gouvernance.png',
    url: '/schemas#gouvernance',
  },
  {
    id: 'sanctions',
    titre: "Montant des sanctions prévus par le RIA",
    texte: `Le montant retenu est toujours le plus élevé entre la somme fixe et le pourcentage du chiffre d'affaires annuel mondial de l'exercice précédent (sauf pour les PME et jeunes pousses)

1. Niveau 1 : Jusqu'à 35 millions d'euros ou 7% du chiffre d'affaires mondial

Pour quelle infraction ? C'est la sanction la plus sévère, réservée au non-respect des pratiques d'IA interdites.

Exemples : Mettre sur le marché ou utiliser un système de notation sociale, de manipulation subliminale, etc.

Article de référence : Article 99, paragraphe 3.

2. Niveau 2 : Jusqu'à 15 millions d'euros ou 3% du chiffre d'affaires mondial

Pour quelle infraction ? Non-respect de la plupart des autres obligations clés du règlement, notamment :

Les obligations des fournisseurs d'IA à haut risque (exigences de qualité, de documentation, etc. - Art. 16).

Les obligations des déployeurs d'IA à haut risque (contrôle humain, surveillance, etc. - Art. 26).

Les obligations des organismes notifiés (organismes de certification).

Les obligations de transparence pour les IA à risque limité (chatbots, deepfakes - Art. 50).

Les obligations relatives aux fournisseurs de modèles d'IA à usage générale (Art. 101).

Article de référence : Article 99, paragraphe 4.

3. Niveau 3 : Jusqu'à 7,5 millions d'euros ou 1% du chiffre d'affaires mondial

Pour quelle infraction ? Fourniture d'informations incorrectes, incomplètes ou trompeuses aux organismes notifiés ou aux autorités nationales compétentes.

Article de référence : Article 99, paragraphe 5.`,
    image: '/schemas/sanctions.png',
    url: '/schemas#sanctions',
  },
  {
    id: 'exigences_SIAHR',
    titre: "Exigences concernant les systèmes d'IA à haut risque",
    texte: `Ces exigences s'appliquent aux systèmes, des obligations reposent sur les déployeurs et fournisseurs de ces systèmes (voir le schéma dédié)

Système de gestion des risques (Article 9)

Un processus continu d'identification, d'analyse et d'atténuation des risques pour la santé, la sécurité et les droits fondamentaux, qui doit être maintenu tout au long du cycle de vie du système.

Qualité et gouvernance des données (Article 10)

Les jeux de données utilisés pour l'entraînement, la validation et les tests doivent être de haute qualité : pertinents, représentatifs, exempts d'erreurs et complets. Des pratiques de gouvernance des données appropriées sont obligatoires pour prévenir et atténuer les biais discriminatoires.

Documentation technique (Article 11)

Une documentation complète doit être créée avant la mise sur le marché. Elle doit détailler le fonctionnement du système, ses capacités, ses limites et les processus de développement afin de permettre aux autorités d'évaluer sa conformité.

Tenue de registres (Journaux) (Article 12)

Le système doit être capable d'enregistrer automatiquement les événements ("logs") pendant son fonctionnement pour garantir la traçabilité des résultats et faciliter le suivi et les audits post-commercialisation.

Transparence et fourniture d'informations aux utilisateurs (Article 13)

Le système doit être suffisamment transparent pour que les utilisateurs (déployeurs) puissent en comprendre le fonctionnement. Il doit être accompagné d'une notice d'utilisation claire et complète.

Contrôle humain (Article 14)

Le système doit être conçu pour pouvoir être contrôlé efficacement par des humains. Ceux-ci doivent être en mesure de comprendre les sorties du système, de décider de ne pas les utiliser, d'ignorer ou d'annuler une décision, ou d'arrêter le système.

Exactitude, robustesse et cybersécurité (Article 15)

Le système doit atteindre un niveau approprié d'exactitude, être résilient aux erreurs ou aux incohérences, et être protégé contre les vulnérabilités et les attaques malveillantes (cybersécurité).`,
    image: '/schemas/exigences_SIAHR.png',
    url: '/schemas#exigences_SIAHR',
  },
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
    schemas: true,
  });
  const [results, setResults] = useState({
    reglement: [] as any[],
    documentation: [] as any[],
    doctrine: [] as any[],
    actualites: [] as any[],
    considerants: [] as any[],
    annexes: [] as any[],
    schemas: [] as any[],
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
      schemas: [] as any[],
    };

    try {
      // Recherche dans le règlement IA (articles)
      if (searchFilters.reglement) {
        const { data: reglement } = await supabase
          .from('article')
          .select('id_article, titre, numero, contenu')
          .or(`titre.ilike.%${searchQuery}%,contenu.ilike.%${searchQuery}%`);
        searchResults.reglement = reglement || [];
      }

      // Recherche dans la documentation
      if (searchFilters.documentation) {
        const { data: documentation } = await supabase
          .from('documentation')
          .select('id, titre, resume, themes')
          .or(`titre.ilike.%${searchQuery}%,resume.ilike.%${searchQuery}%,themes.ilike.%${searchQuery}%`);
        searchResults.documentation = documentation || [];
      }

      // Recherche dans la doctrine
      if (searchFilters.doctrine) {
        const { data: doctrine } = await supabase
          .from('doctrine')
          .select('id, titre, abstract, auteur')
          .or(`titre.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,auteur.ilike.%${searchQuery}%`);
        searchResults.doctrine = doctrine || [];
      }

      // Recherche dans les actualités
      if (searchFilters.actualites) {
        const { data: actualites } = await supabase
          .from('Actu')
          .select('id, Titre, Date, media, lien')
          .ilike('Titre', `%${searchQuery}%`);
        searchResults.actualites = actualites || [];
      }

      // Recherche dans les considérants (corrigé)
      const { data: considerants, error: considerantsError } = await supabase
        .from('considerant')
        .select('id_considerant, numero, contenu')
        .ilike('contenu', `%${searchQuery}%`);
      console.log('[DEBUG] Recherche considérants', { keyword: searchQuery, data: considerants, error: considerantsError });
      if (considerantsError) alert('Erreur considérants: ' + considerantsError.message);
      searchResults.considerants = considerants || [];

      // Recherche dans les annexes
      if (searchFilters.annexes) {
        // On cherche dans la table annexes (contenu) puis on récupère le titre dans liste_annexes
        const { data: annexesData, error: annexesError } = await supabase
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
          const { data: listeAnnexes } = await supabase
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

      // Recherche dans les schémas (locale)
      if (searchFilters.schemas) {
        const q = searchQuery.toLowerCase();
        searchResults.schemas = SCHEMAS.filter(s =>
          s.titre.toLowerCase().includes(q) ||
          s.texte.toLowerCase().includes(q)
        );
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
          Recherchez dans l'ensemble du site, le règlement IA, la documentation, la doctrine, les considérants et les annexes.
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

          {/* Section Schémas */}
          {filters.schemas && (
            <CollapsibleSection 
              title="Dans les schémas explicatifs" 
              resultCount={results.schemas.length}
              defaultOpen={false}
            >
              {results.schemas.length === 0 ? (
                <div className="text-gray-400">Aucun résultat trouvé.</div>
              ) : (
                <ul className="space-y-3">
                  {results.schemas.map(schema => (
                    <li key={schema.id} className="bg-gray-50 rounded-lg p-3 md:p-4 mb-2 md:mb-0 hover:bg-gray-100 transition-colors flex gap-4 items-center">
                      <a href={schema.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <img src={schema.image} alt={schema.titre} className="w-20 h-20 object-contain rounded-xl shadow" />
                      </a>
                      <div className="flex-1">
                        <a href={schema.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium hover:underline text-base">
                          <span dangerouslySetInnerHTML={{ __html: highlight(schema.titre, keyword) }} />
                        </a>
                        <div className="text-xs md:text-sm text-gray-600 mt-1">
                          <span dangerouslySetInnerHTML={{ __html: highlight(getExcerpt(schema.texte, keyword), keyword) }} />
                        </div>
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