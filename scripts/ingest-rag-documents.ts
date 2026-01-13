/**
 * Script pour ingérer des documents dans le système RAG
 * 
 * Formats supportés: .txt, .pdf
 * 
 * Usage:
 *   pnpm tsx scripts/ingest-rag-documents.ts <fichier> <source_type> [source_name]
 * 
 * Exemples:
 *   pnpm tsx scripts/ingest-rag-documents.ts documents/reglement.txt reglement "Règlement UE 2024/1689"
 *   pnpm tsx scripts/ingest-rag-documents.ts documents/reglement.pdf reglement "Règlement UE 2024/1689"
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Charger les variables d'environnement
config();

// Support des variables VITE_* (pour compatibilité) et des variables standard
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

// Configuration OpenAI pour les embeddings
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY manquante dans les variables d\'environnement');
  process.exit(1);
}

// Taille des chunks (en tokens approximatifs, ~4 caractères = 1 token)
const CHUNK_SIZE = 1000; // ~4000 caractères
const CHUNK_OVERLAP = 200; // Chevauchement pour préserver le contexte

/**
 * Découpe un texte en chunks avec chevauchement
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  // S'assurer que overlap < chunkSize pour éviter les problèmes
  const safeOverlap = Math.min(overlap, chunkSize - 1);
  const stepSize = chunkSize - safeOverlap; // Taille du pas entre les chunks

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    if (chunk.length === 0) break; // Éviter les chunks vides
    
    chunks.push(chunk);
    
    // Si on a atteint la fin du texte, on s'arrête
    if (end >= text.length) {
      break;
    }
    
    // Avancer de stepSize caractères
    const nextStart = start + stepSize;
    
    // Protection contre les boucles infinies : on doit toujours avancer
    if (nextStart <= start) {
      start = end; // Force l'avancement à la fin du chunk actuel
    } else {
      start = nextStart;
    }
  }

  return chunks;
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
 * Ingère un document dans le RAG
 */
async function ingestDocument(
  filePath: string,
  sourceType: 'reglement' | 'lignes_directrices' | 'jurisprudence',
  sourceName?: string
) {
  console.log(`\n📄 Lecture du fichier: ${filePath}`);
  
  // Détecter si c'est un PDF
  const isPdf = filePath.toLowerCase().endsWith('.pdf');
  
  let content: string;
  if (isPdf) {
    console.log(`   Format: PDF (extraction du texte en cours...)`);
    const pdfBuffer = readFileSync(filePath);
    
    // Convertir Buffer en Uint8Array pour pdfjs-dist
    const pdfData = new Uint8Array(pdfBuffer);
    
    // Charger le document PDF
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    console.log(`   Pages à extraire: ${numPages}`);
    
    // Extraire le texte de toutes les pages
    const textParts: string[] = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      textParts.push(pageText);
      
      if (pageNum % 10 === 0 || pageNum === numPages) {
        console.log(`   Pages extraites: ${pageNum}/${numPages}`);
      }
    }
    
    content = textParts.join('\n\n');
    console.log(`   Pages extraites: ${numPages}`);
  } else {
    content = readFileSync(filePath, 'utf-8');
  }
  
  console.log(`   Taille: ${content.length} caractères`);

  console.log(`\n✂️  Découpage en chunks...`);
  const chunks = chunkText(content, CHUNK_SIZE, CHUNK_OVERLAP);
  console.log(`   ${chunks.length} chunks créés`);

  console.log(`\n🔮 Génération des embeddings et insertion par lots...`);
  const BATCH_SIZE = 10; // Insérer par lots de 10 pour éviter les problèmes de mémoire
  let totalInserted = 0;
  
  for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length);
    const batch: Array<{
      content: string;
      embedding: number[];
      source_type: string;
      source_name: string;
      chunk_index: number;
      metadata: { total_chunks: number; chunk_size: number };
    }> = [];
    
    console.log(`   Traitement du lot ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} (chunks ${batchStart + 1}-${batchEnd})...`);
    
    // Générer les embeddings pour ce lot
    for (let i = batchStart; i < batchEnd; i++) {
      const chunk = chunks[i];
      console.log(`      Chunk ${i + 1}/${chunks.length}...`);
      
      try {
        const embedding = await generateEmbedding(chunk);
        
        batch.push({
          content: chunk,
          embedding: embedding,
          source_type: sourceType,
          source_name: sourceName || filePath,
          chunk_index: i,
          metadata: {
            total_chunks: chunks.length,
            chunk_size: chunk.length,
          },
        });

        // Petite pause pour éviter de surcharger l'API OpenAI
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`      ❌ Erreur pour le chunk ${i + 1}:`, error);
        throw error;
      }
    }

    // Insérer ce lot dans Supabase via REST API
    console.log(`   💾 Insertion du lot dans Supabase...`);
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY est manquante');
    }
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rag_documents`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      } as Record<string, string>,
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Supabase:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    totalInserted += Array.isArray(data) ? data.length : 1;
    console.log(`   ✅ ${Array.isArray(data) ? data.length : 1} documents insérés (total: ${totalInserted}/${chunks.length})`);
  }

  console.log(`\n✅ ${totalInserted} documents insérés avec succès !`);
  return { count: totalInserted };
}

// Point d'entrée
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: pnpm tsx scripts/ingest-rag-documents.ts <fichier> <source_type> [source_name]

Arguments:
  fichier        Chemin vers le fichier texte à ingérer
  source_type    Type de source: reglement | lignes_directrices | jurisprudence
  source_name    (optionnel) Nom de la source (ex: "RIA Article 5")

Exemples:
  pnpm tsx scripts/ingest-rag-documents.ts documents/reglement.txt reglement "Règlement UE 2024/1689"
  pnpm tsx scripts/ingest-rag-documents.ts documents/lignes-directrices.txt lignes_directrices
    `);
    process.exit(1);
  }

  const [filePath, sourceType, sourceName] = args;

  if (!['reglement', 'lignes_directrices', 'jurisprudence'].includes(sourceType)) {
    console.error('❌ source_type doit être: reglement, lignes_directrices, ou jurisprudence');
    process.exit(1);
  }

  try {
    await ingestDocument(filePath, sourceType as any, sourceName);
    console.log('\n✅ Ingestion terminée avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'ingestion:', error);
    process.exit(1);
  }
}

main();

