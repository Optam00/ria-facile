-- =============================================================================
-- Script de diagnostic pour vérifier l'infrastructure RAG
-- =============================================================================

-- 1. Vérifier si l'extension pgvector est activée
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
    THEN '✅ Extension pgvector est activée'
    ELSE '❌ Extension pgvector n''est PAS activée'
  END as pgvector_status;

-- 2. Vérifier si la table rag_documents existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rag_documents')
    THEN '✅ Table rag_documents existe'
    ELSE '❌ Table rag_documents n''existe PAS'
  END as table_status;

-- 3. Vérifier la structure de la table (si elle existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rag_documents') THEN
    RAISE NOTICE 'Structure de la table rag_documents:';
    PERFORM 1; -- Juste pour avoir un bloc valide
  END IF;
END $$;

SELECT 
  column_name, 
  data_type,
  CASE 
    WHEN data_type = 'USER-DEFINED' THEN udt_name
    ELSE data_type
  END as actual_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'rag_documents'
ORDER BY ordinal_position;

-- 4. Vérifier si la fonction search_rag_documents existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
        AND p.proname = 'search_rag_documents'
    )
    THEN '✅ Fonction search_rag_documents existe'
    ELSE '❌ Fonction search_rag_documents n''existe PAS'
  END as function_status;

-- 5. Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'rag_documents';

-- 6. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'rag_documents';

-- 7. Compter les documents (si la table existe)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rag_documents')
    THEN (SELECT COUNT(*)::text || ' documents dans la table' FROM public.rag_documents)
    ELSE 'Table n''existe pas'
  END as document_count;

-- 8. Vérifier les types de sources (si des documents existent)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rag_documents')
    THEN (
      SELECT COALESCE(
        string_agg(source_type || ': ' || count::text, ', '), 
        'Aucun document'
      )
      FROM (
        SELECT source_type, COUNT(*) as count
        FROM public.rag_documents
        GROUP BY source_type
      ) sub
    )
    ELSE 'Table n''existe pas'
  END as sources_distribution;

