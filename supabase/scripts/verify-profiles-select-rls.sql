-- =============================================================================
-- Vérifier que les politiques RLS permettent la lecture des profils
-- =============================================================================

-- 1. VÉRIFIER LES POLITIQUES SELECT ACTUELLES
-- =============================================================================
SELECT '=== POLITIQUES SELECT POUR PROFILES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 2. VÉRIFIER QUE RLS EST ACTIVÉ
-- =============================================================================
SELECT '=== RLS ACTIVÉ ? ===' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 3. TESTER LA LECTURE (remplacer USER_ID par ton ID utilisateur)
-- =============================================================================
-- Pour tester, exécute cette requête en remplaçant USER_ID par ton ID :
-- SELECT id, email, role, nom, prenom, profession 
-- FROM public.profiles 
-- WHERE id = 'USER_ID';

-- 4. VÉRIFIER LES COLONNES DE LA TABLE
-- =============================================================================
SELECT '=== COLONNES DE LA TABLE PROFILES ===' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

