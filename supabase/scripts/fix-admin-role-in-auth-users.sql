-- =============================================================================
-- CORRIGER LE RÔLE ADMIN DANS AUTH.USERS POUR QUE LE JWT LE CONTIENNE
-- =============================================================================
-- ⚠️ IMPORTANT : Après avoir exécuté ce script, vous devez vous DÉCONNECTER
-- et vous RECONNECTER pour que le nouveau JWT soit généré avec le bon rôle.
-- =============================================================================

-- 1. VÉRIFIER L'ÉTAT ACTUEL
-- =============================================================================
SELECT '=== ÉTAT ACTUEL ===' as info;

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_auth_users,
  p.role as role_in_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = auth.uid();

-- 2. METTRE À JOUR LE RÔLE DANS AUTH.USERS (pour tous les admins)
-- =============================================================================
-- Cette requête met à jour tous les utilisateurs qui ont role='admin' dans profiles
UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'admin')
FROM public.profiles p
WHERE u.id = p.id 
  AND p.role = 'admin'
  AND (u.raw_user_meta_data->>'role' IS NULL OR u.raw_user_meta_data->>'role' != 'admin');

-- 3. METTRE À JOUR LE RÔLE DANS PROFILES (pour tous les admins dans auth.users)
-- =============================================================================
-- Cette requête met à jour tous les utilisateurs qui ont role='admin' dans auth.users
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id 
  AND u.raw_user_meta_data->>'role' = 'admin'
  AND p.role != 'admin';

-- 4. VÉRIFICATION APRÈS MISE À JOUR
-- =============================================================================
SELECT '=== VÉRIFICATION APRÈS MISE À JOUR ===' as info;

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_auth_users,
  p.role as role_in_profiles,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'admin' AND p.role = 'admin' THEN '✅ OK'
    ELSE '❌ PROBLÈME'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = auth.uid();

-- 5. LISTER TOUS LES ADMINS
-- =============================================================================
SELECT '=== TOUS LES ADMINS ===' as info;

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_auth_users,
  p.role as role_in_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.raw_user_meta_data->>'role' = 'admin' OR p.role = 'admin';

-- 6. MESSAGE IMPORTANT
-- =============================================================================
SELECT '⚠️ IMPORTANT : Vous devez maintenant vous DÉCONNECTER et vous RECONNECTER pour que le nouveau JWT soit généré avec le rôle admin !' as message;

