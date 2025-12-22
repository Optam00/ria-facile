-- =============================================================================
-- TEST DIRECT : Vérifier que la requête SELECT fonctionne
-- =============================================================================

-- Cette requête simule exactement ce que fait l'application
-- Elle devrait retourner les données si les politiques RLS sont correctes

-- Test 1 : Vérifier les politiques SELECT
SELECT '=== POLITIQUES SELECT ACTUELLES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Test 2 : Vérifier que RLS est activé
SELECT '=== RLS ACTIVÉ ? ===' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Test 3 : Vérifier les données pour ton utilisateur
SELECT '=== DONNÉES DANS PROFILES ===' as info;

SELECT 
  id,
  email,
  nom,
  prenom,
  profession
FROM public.profiles 
WHERE id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

-- Test 4 : Vérifier auth.uid() (doit être exécuté en tant qu'utilisateur authentifié)
-- Cette requête ne fonctionnera que si tu es connecté en tant que cet utilisateur
SELECT '=== TEST auth.uid() ===' as info;
SELECT auth.uid() as current_user_id;

