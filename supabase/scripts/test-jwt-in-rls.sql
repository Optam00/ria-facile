-- =============================================================================
-- TESTER LE JWT DANS LE CONTEXTE RLS
-- =============================================================================

-- 1. VÉRIFIER LE CONTENU DU JWT
-- =============================================================================
SELECT '=== CONTENU DU JWT ===' as info;

SELECT 
  auth.uid() as user_id,
  auth.jwt() as jwt_full,
  auth.jwt() -> 'user_metadata' as user_metadata,
  auth.jwt() -> 'user_metadata' ->> 'role' as role_in_user_metadata,
  auth.jwt() -> 'raw_user_meta_data' as raw_user_meta_data,
  auth.jwt() -> 'raw_user_meta_data' ->> 'role' as role_in_raw_metadata;

-- 2. TESTER is_admin_from_jwt()
-- =============================================================================
SELECT '=== TEST is_admin_from_jwt() ===' as info;
SELECT public.is_admin_from_jwt() as result;

-- 3. TESTER LA LECTURE DES ADHÉRENTS
-- =============================================================================
SELECT '=== TEST LECTURE ADHÉRENTS ===' as info;

SELECT 
  id,
  email,
  prenom,
  nom,
  role
FROM public.profiles
WHERE role = 'adherent'
ORDER BY created_at DESC
LIMIT 5;

-- 4. COMPTER LES ADHÉRENTS
-- =============================================================================
SELECT '=== NOMBRE D''ADHÉRENTS ===' as info;
SELECT COUNT(*) as total
FROM public.profiles
WHERE role = 'adherent';

