-- =============================================================================
-- DIAGNOSTIC COMPLET : Pourquoi les admins ne peuvent pas voir les adhérents
-- =============================================================================

-- 1. VÉRIFIER L'UTILISATEUR ACTUEL ET SON RÔLE
-- =============================================================================
SELECT '=== UTILISATEUR ACTUEL ===' as info;

SELECT 
  auth.uid() as user_id,
  auth.email() as user_email;

SELECT '=== RÔLE DANS AUTH.USERS ===' as info;

SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role_in_metadata,
  raw_user_meta_data as full_metadata
FROM auth.users
WHERE id = auth.uid();

SELECT '=== RÔLE DANS PROFILES ===' as info;

SELECT 
  id,
  email,
  role,
  nom,
  prenom
FROM public.profiles
WHERE id = auth.uid();

-- 2. TESTER LA FONCTION is_admin()
-- =============================================================================
SELECT '=== TEST is_admin() ===' as info;

SELECT 
  public.is_admin() as is_admin_result,
  auth.uid() as current_user_id;

-- 3. VÉRIFIER LES POLITIQUES RLS ACTIVES
-- =============================================================================
SELECT '=== POLITIQUES RLS POUR PROFILES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 4. TESTER SI ON PEUT LIRE LES ADHÉRENTS (simulation de la requête de l'app)
-- =============================================================================
SELECT '=== TEST LECTURE ADHÉRENTS ===' as info;

SELECT 
  id,
  email,
  prenom,
  nom,
  profession,
  created_at
FROM public.profiles
WHERE role = 'adherent'
ORDER BY created_at DESC
LIMIT 10;

-- 5. COMPTER LES ADHÉRENTS
-- =============================================================================
SELECT '=== NOMBRE D''ADHÉRENTS ===' as info;

SELECT COUNT(*) as total_adherents
FROM public.profiles
WHERE role = 'adherent';

-- 6. VÉRIFIER QUE RLS EST BIEN ACTIVÉ
-- =============================================================================
SELECT '=== RLS ACTIVÉ ? ===' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

