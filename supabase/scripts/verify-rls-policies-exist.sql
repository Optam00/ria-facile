-- =============================================================================
-- Vérifier que les politiques RLS existent (sans tester auth.uid())
-- =============================================================================

-- 1. Vérifier les politiques SELECT
SELECT '=== POLITIQUES SELECT ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 2. Vérifier les politiques INSERT
SELECT '=== POLITIQUES INSERT ===' as info;

SELECT 
  policyname, 
  cmd,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- 3. Vérifier les politiques UPDATE
SELECT '=== POLITIQUES UPDATE ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- 4. Vérifier que RLS est activé
SELECT '=== RLS ACTIVÉ ? ===' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 5. Vérifier les données dans profiles (sans RLS, car on est postgres)
SELECT '=== DONNÉES DANS PROFILES (sans RLS) ===' as info;

SELECT 
  id,
  email,
  nom,
  prenom,
  profession
FROM public.profiles 
WHERE id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

