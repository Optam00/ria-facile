/**
 * Script pour vérifier que l'infrastructure RAG est bien configurée
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifySetup() {
  console.log('🔍 Vérification de l\'infrastructure RAG...\n');

  // 1. Vérifier la table
  console.log('1️⃣  Vérification de la table rag_documents...');
  const { data: tableData, error: tableError } = await supabase
    .from('rag_documents')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error('   ❌ Erreur:', tableError.message);
    console.error('   💡 Assurez-vous d\'avoir exécuté create-rag-table.sql dans Supabase');
    return false;
  }
  console.log('   ✅ Table rag_documents existe');

  // 2. Vérifier la fonction de recherche
  console.log('\n2️⃣  Vérification de la fonction search_rag_documents...');
  const { data: funcData, error: funcError } = await supabase.rpc('search_rag_documents', {
    query_embedding: new Array(1536).fill(0), // Embedding factice pour tester
    source_types: null,
    match_threshold: 0.0,
    match_count: 1,
  });

  if (funcError) {
    console.error('   ❌ Erreur:', funcError.message);
    console.error('   💡 Assurez-vous d\'avoir exécuté create-rag-search-function.sql dans Supabase');
    return false;
  }
  console.log('   ✅ Fonction search_rag_documents existe');

  // 3. Compter les documents existants
  console.log('\n3️⃣  Comptage des documents existants...');
  const { count, error: countError } = await supabase
    .from('rag_documents')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('   ❌ Erreur:', countError.message);
    return false;
  }
  console.log(`   📊 Documents dans la base: ${count || 0}`);

  if (count && count > 0) {
    const { data: sources } = await supabase
      .from('rag_documents')
      .select('source_type')
      .limit(1000);

    const sourceCounts = (sources || []).reduce((acc: any, doc: any) => {
      acc[doc.source_type] = (acc[doc.source_type] || 0) + 1;
      return acc;
    }, {});

    console.log('   📈 Répartition par source:');
    Object.entries(sourceCounts).forEach(([type, count]) => {
      console.log(`      - ${type}: ${count}`);
    });
  }

  // 4. Vérifier OpenAI API Key
  console.log('\n4️⃣  Vérification de la clé OpenAI...');
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('   ❌ OPENAI_API_KEY manquante dans .env');
    console.error('   💡 Ajoutez OPENAI_API_KEY=sk-... dans votre fichier .env');
    console.error('   💡 Obtenez une clé sur: https://platform.openai.com/api-keys');
    return false;
  }
  console.log('   ✅ OPENAI_API_KEY trouvée');

  console.log('\n✅ Toutes les vérifications sont passées !');
  console.log('\n🚀 Vous pouvez maintenant ingérer des documents avec :');
  console.log('   pnpm tsx scripts/ingest-rag-documents.ts documents/votre-fichier.txt reglement "Nom du document"');
  
  return true;
}

verifySetup().catch(console.error);

