-- =============================================================================
-- Vérifier les politiques RLS pour deletion_requests
-- =============================================================================

-- 1. Vérifier que RLS est activé
-- =============================================================================
SELECT '=== RLS ACTIVÉ SUR DELETION_REQUESTS ? ===' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'deletion_requests';

-- 2. Vérifier les politiques RLS existantes
-- =============================================================================
SELECT '=== POLITIQUES RLS POUR DELETION_REQUESTS ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'deletion_requests' 
ORDER BY policyname;

-- 3. Vérifier que la table existe et sa structure
-- =============================================================================
SELECT '=== STRUCTURE DE LA TABLE DELETION_REQUESTS ===' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'deletion_requests'
ORDER BY ordinal_position;

-- 4. Vérifier les contraintes
-- =============================================================================
SELECT '=== CONTRAINTES DE LA TABLE ===' as info;

SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.deletion_requests'::regclass;

