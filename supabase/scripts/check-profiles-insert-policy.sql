-- =============================================================================
-- Vérifier les politiques RLS INSERT pour la table profiles
-- L'upsert nécessite à la fois INSERT et UPDATE
-- =============================================================================

-- Vérifier les politiques INSERT actuelles
SELECT 'Politiques RLS actuelles pour INSERT:' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Vérifier si RLS est activé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

