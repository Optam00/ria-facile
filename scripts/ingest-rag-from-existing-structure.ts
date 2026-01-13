/**
 * Script pour ingérer les documents RAG depuis la structure existante (articles, subdivisions, etc.)
 * 
 * Ce script utilise les tables déjà structurées du règlement pour créer des chunks intelligents
 * au lieu de découper par taille fixe.
 * 
 * Usage:
 *   pnpm tsx scripts/ingest-rag-from-existing-structure.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY manquante');
  process.exit(1);
}

/**
 * Génère un embedding pour un texte via OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erreur OpenAI: ${error.error?.message || JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Extrait le numéro numérique d'un article (ex: "Art. 3" -> 3, "3" -> 3)
 */
function extractArticleNumber(numero: string): number {
  const match = numero.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/**
 * Détermine la catégorie d'un contenu
 */
function determineCategory(articleNumero: number | string, contenu: string): string {
  const contenuLower = contenu.toLowerCase();
  const num = typeof articleNumero === 'string' ? parseInt(articleNumero) : articleNumero;
  
  // Article 3 = définitions
  if (num === 3) {
    return 'definition';
  }
  
  // Chercher des indices dans le contenu
  if (contenuLower.includes('obligation') || contenuLower.includes('doit') || contenuLower.includes('est tenu')) {
    return 'obligation';
  }
  
  if (contenuLower.includes('sanction') || contenuLower.includes('amende') || contenuLower.includes('pénal')) {
    return 'sanction';
  }
  
  if (contenuLower.includes('considérant') || contenuLower.includes('vu')) {
    return 'recital';
  }
  
  return 'article';
}

/**
 * Construit le contenu enrichi pour un chunk
 */
function buildEnrichedContent(
  type: 'article' | 'subdivision' | 'considerant' | 'annexe',
  articleNumero: number | null,
  titre: string | null,
  contenu: string,
  subdivisionNumero?: string
): string {
  let prefix = '';
  
  if (type === 'article') {
    prefix = `Règlement IA - Article ${articleNumero}${titre ? ` - ${titre}` : ''}:\n\n`;
  } else if (type === 'subdivision' && articleNumero) {
    prefix = `Règlement IA - Article ${articleNumero}${subdivisionNumero ? `, ${subdivisionNumero}` : ''}${titre ? ` - ${titre}` : ''}:\n\n`;
  } else if (type === 'considerant') {
    prefix = `Règlement IA - Considérant ${articleNumero}:\n\n`;
  } else if (type === 'annexe') {
    prefix = `Règlement IA - Annexe ${titre || articleNumero}:\n\n`;
  }
  
  return prefix + contenu;
}

/**
 * Traite l'Article 3 spécialement (définitions)
 * Les définitions sont dans le contenu de l'article, formatées comme : «terme», définition
 */
async function processArticle3Definitions() {
  console.log('\n📋 Traitement spécial de l\'Article 3 (Définitions)...');
  
  // Récupérer l'article 3 (format peut être "3", "Art. 3", etc.)
  const { data: article3, error: articleError } = await supabase
    .from('article')
    .select('id_article, numero, titre, contenu')
    .ilike('numero', '%3%')
    .limit(1)
    .single();
  
  if (articleError || !article3) {
    console.error('❌ Article 3 non trouvé:', articleError);
    return;
  }
  
  if (!article3.contenu) {
    console.error('❌ Article 3 sans contenu');
    return;
  }
  
  // Extraire les définitions du contenu
  // Format attendu : numéro) «terme», définition
  // Exemple : 68) «fournisseur en aval», un fournisseur d'un système d'IA...
  const definitions: Array<{ numero: string; terme: string; definition: string }> = [];
  
  // Pattern amélioré pour trouver les définitions numérotées
  // Format: numéro) «terme», définition (jusqu'à la prochaine définition ou fin)
  const definitionPattern = /(\d+)\)\s*«([^»]+)»\s*[,\-:]?\s*([^«]+?)(?=\d+\)\s*«|$)/gs;
  let match;
  
  while ((match = definitionPattern.exec(article3.contenu)) !== null) {
    const definition = match[3].trim();
    // Nettoyer la définition (enlever les espaces multiples, sauts de ligne)
    const cleanedDefinition = definition.replace(/\s+/g, ' ').trim();
    
    if (cleanedDefinition.length > 10) { // Ignorer les définitions trop courtes (probablement des erreurs)
      definitions.push({
        numero: match[1],
        terme: match[2].trim(),
        definition: cleanedDefinition,
      });
    }
  }
  
  // Si le pattern ne fonctionne pas, essayer un pattern plus simple
  if (definitions.length === 0) {
    console.log('   ⚠️  Pattern numéroté n\'a pas fonctionné, essai avec pattern simple...');
    // Chercher toutes les occurrences de «terme», définition
    const simplePattern = /«([^»]+)»\s*[,\-:]?\s*([^«]+?)(?=«|$)/gs;
    let simpleMatch;
    let index = 1;
    
    while ((simpleMatch = simplePattern.exec(article3.contenu)) !== null) {
      const definition = simpleMatch[2].trim().replace(/^\d+\)\s*/, ''); // Enlever le numéro si présent
      const cleanedDefinition = definition.replace(/\s+/g, ' ').trim();
      
      if (cleanedDefinition.length > 10) {
        definitions.push({
          numero: index.toString(),
          terme: simpleMatch[1].trim(),
          definition: cleanedDefinition,
        });
        index++;
      }
    }
  }
  
  if (definitions.length === 0) {
    console.log('⚠️  Aucune définition trouvée dans l\'Article 3');
    console.log('   Le contenu sera traité comme un article normal');
    return;
  }
  
  console.log(`   ${definitions.length} définitions extraites`);
  
  const BATCH_SIZE = 10;
  let totalInserted = 0;
  
  // Traiter chaque définition comme un chunk séparé
  for (let i = 0; i < definitions.length; i += BATCH_SIZE) {
    const batch = definitions.slice(i, i + BATCH_SIZE);
    const documents = [];
    
    console.log(`   Traitement des définitions ${i + 1}-${Math.min(i + BATCH_SIZE, definitions.length)}...`);
    
    for (const def of batch) {
      const fullDefinition = `«${def.terme}», ${def.definition}`;
      
      const enrichedContent = buildEnrichedContent(
        'subdivision',
        3,
        `Définition de «${def.terme}»`,
        fullDefinition,
        def.numero
      );
      
      console.log(`      Définition ${def.numero}: «${def.terme}»`);
      
      try {
        const embedding = await generateEmbedding(enrichedContent);
        
        documents.push({
          content: enrichedContent,
          embedding: embedding,
          source_type: 'reglement',
          source_name: `Règlement UE 2024/1689 - Article 3, ${def.numero}`,
          chunk_index: parseInt(def.numero) || i,
          article_number: '3',
          category: 'definition',
          metadata: {
            article_number: '3',
            category: 'definition',
            subdivision_number: def.numero,
            terme_defini: def.terme,
            type: 'definition',
          },
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`      ❌ Erreur pour la définition ${def.numero}:`, error);
      }
    }
    
    // Insérer le lot
    if (documents.length > 0) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rag_documents`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        } as Record<string, string>,
        body: JSON.stringify(documents),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur Supabase:', response.status, errorText);
      } else {
        const data = await response.json();
        totalInserted += Array.isArray(data) ? data.length : 1;
        console.log(`   ✅ ${Array.isArray(data) ? data.length : 1} définitions insérées`);
      }
    }
  }
  
  console.log(`\n✅ ${totalInserted} définitions de l'Article 3 insérées`);
}

/**
 * Traite tous les articles (sauf l'Article 3 qui est traité séparément)
 * Les articles sont stockés dans la table 'article' avec id_article, numero, titre, contenu
 */
async function processArticles() {
  console.log('\n📄 Traitement des articles...');
  
  // Récupérer tous les articles sauf l'article 3
  const { data: articles, error: articlesError } = await supabase
    .from('article')
    .select('id_article, numero, titre, contenu')
    .not('numero', 'ilike', '%3%')
    .order('id_article');
  
  if (articlesError) {
    console.error('❌ Erreur lors de la récupération des articles:', articlesError);
    return;
  }
  
  if (!articles || articles.length === 0) {
    console.log('⚠️  Aucun article trouvé');
    return;
  }
  
  console.log(`   ${articles.length} articles à traiter`);
  
  const BATCH_SIZE = 5; // Plus petit car les articles peuvent être longs
  let totalInserted = 0;
  
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const documents = [];
    
    console.log(`   Traitement des articles ${i + 1}-${Math.min(i + BATCH_SIZE, articles.length)}...`);
    
    for (const article of batch) {
      if (!article.contenu) {
        console.log(`      ⚠️  Article ${article.numero} sans contenu, ignoré`);
        continue;
      }
      
      // Pour chaque article, créer un chunk
      // Si l'article est très long, on pourrait le découper par paragraphes
      // Mais pour l'instant, on crée un chunk par article
      const articleNumero = extractArticleNumber(article.numero);
      const enrichedContent = buildEnrichedContent(
        'article',
        articleNumero,
        article.titre,
        article.contenu
      );
      
      try {
        const embedding = await generateEmbedding(enrichedContent);
        const category = determineCategory(articleNumero, article.contenu);
        
        documents.push({
          content: enrichedContent,
          embedding: embedding,
          source_type: 'reglement',
          source_name: `Règlement UE 2024/1689 - Article ${article.numero}`,
          chunk_index: 0,
          article_number: articleNumero.toString(),
          category: category,
          metadata: {
            article_number: articleNumero.toString(),
            category: category,
            type: 'article',
            id_article: article.id_article,
            numero_original: article.numero,
          },
        });
        
        console.log(`      ✅ Article ${article.numero}: ${article.titre || 'Sans titre'}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`      ❌ Erreur pour l'article ${article.numero}:`, error);
      }
    }
    
    // Insérer le lot
    if (documents.length > 0) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rag_documents`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        } as Record<string, string>,
        body: JSON.stringify(documents),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur Supabase:', response.status, errorText);
      } else {
        const data = await response.json();
        const inserted = Array.isArray(data) ? data.length : 1;
        totalInserted += inserted;
        console.log(`   ✅ ${inserted} chunks insérés (total: ${totalInserted})`);
      }
    }
  }
  
  console.log(`\n✅ ${totalInserted} chunks d'articles insérés`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Début de l\'ingestion depuis la structure existante...\n');
  
  try {
    // 1. Traiter l'Article 3 spécialement (définitions)
    await processArticle3Definitions();
    
    // 2. Traiter tous les autres articles
    await processArticles();
    
    // TODO: Ajouter le traitement des considérants et annexes si nécessaire
    
    console.log('\n✅ Ingestion terminée avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'ingestion:', error);
    process.exit(1);
  }
}

main();

