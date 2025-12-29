-- =============================================================================
-- S'ASSURER QUE L'UTILISATEUR ACTUEL A LE RÔLE ADMIN
-- =============================================================================
-- Remplacez 'VOTRE_EMAIL@example.com' par votre email admin

-- 1. VÉRIFIER L'UTILISATEUR ACTUEL
-- =============================================================================
SELECT '=== UTILISATEUR ACTUEL ===' as info;

SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role_in_metadata,
  raw_user_meta_data as full_metadata
FROM auth.users
WHERE id = auth.uid();

-- 2. METTRE À JOUR LE RÔLE DANS AUTH.USERS (si nécessaire)
-- =============================================================================
-- Décommentez et modifiez cette ligne pour mettre à jour votre rôle :
-- UPDATE auth.users
-- SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
-- WHERE id = auth.uid();

-- 3. METTRE À JOUR LE RÔLE DANS PROFILES (si nécessaire)
-- =============================================================================
-- Décommentez et modifiez cette ligne pour mettre à jour votre rôle dans profiles :
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = auth.uid();

-- 4. VÉRIFIER APRÈS MISE À JOUR
-- =============================================================================
SELECT '=== VÉRIFICATION APRÈS MISE À JOUR ===' as info;

SELECT 
  'auth.users' as source,
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id = auth.uid()

UNION ALL

SELECT 
  'profiles' as source,
  id,
  email,
  role
FROM public.profiles
WHERE id = auth.uid();

-- 5. TESTER is_admin_direct()
-- =============================================================================
SELECT '=== TEST is_admin_direct() ===' as info;
SELECT public.is_admin_direct() as result;

