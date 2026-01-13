/**
 * Script pour ingérer plusieurs documents en batch dans le système RAG
 * 
 * Usage:
 *   pnpm tsx scripts/ingest-rag-batch.ts <dossier> <source_type>
 * 
 * Exemple:
 *   pnpm tsx scripts/ingest-rag-batch.ts documents/lignes-directrices lignes_directrices
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: pnpm tsx scripts/ingest-rag-batch.ts <dossier> <source_type>

Arguments:
  dossier        Chemin vers le dossier contenant les fichiers PDF/TXT
  source_type    Type de source: reglement | lignes_directrices | jurisprudence

Exemples:
  pnpm tsx scripts/ingest-rag-batch.ts documents/lignes-directrices lignes_directrices
  pnpm tsx scripts/ingest-rag-batch.ts documents/reglement reglement
    `);
  process.exit(1);
}

const [folderPath, sourceType] = args;

if (!['reglement', 'lignes_directrices', 'jurisprudence'].includes(sourceType)) {
  console.error('❌ source_type doit être: reglement, lignes_directrices, ou jurisprudence');
  process.exit(1);
}

try {
  // Lire les fichiers du dossier
  const files = readdirSync(folderPath)
    .filter(file => {
      const filePath = join(folderPath, file);
      const stats = statSync(filePath);
      return stats.isFile() && (file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.txt'));
    })
    .sort();

  if (files.length === 0) {
    console.error(`❌ Aucun fichier PDF ou TXT trouvé dans ${folderPath}`);
    process.exit(1);
  }

  console.log(`\n📁 Dossier: ${folderPath}`);
  console.log(`📄 ${files.length} fichier(s) trouvé(s):\n`);
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log(`\n🚀 Début de l'ingestion en batch...\n`);

  // Ingérer chaque fichier
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = join(folderPath, file);
    
    // Extraire le nom du fichier sans extension pour le source_name
    const fileName = file.replace(/\.(pdf|txt)$/i, '');
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Fichier ${i + 1}/${files.length}: ${file}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      execSync(
        `pnpm tsx scripts/ingest-rag-documents.ts "${filePath}" ${sourceType} "${fileName}"`,
        { stdio: 'inherit' }
      );
      console.log(`\n✅ ${file} ingéré avec succès !\n`);
    } catch (error) {
      console.error(`\n❌ Erreur lors de l'ingestion de ${file}:`, error);
      console.log(`\n⏭️  Passage au fichier suivant...\n`);
      // Continue avec le fichier suivant même en cas d'erreur
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Ingestion batch terminée !`);
  console.log(`📊 ${files.length} fichier(s) traité(s)`);
  console.log(`${'='.repeat(60)}\n`);

} catch (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}

