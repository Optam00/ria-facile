-- =============================================================================
-- Script pour synchroniser le rôle depuis profiles vers auth.users
-- À exécuter après avoir mis à jour les rôles dans profiles
-- =============================================================================

-- Synchroniser tous les rôles depuis profiles vers auth.users
UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE u.id = p.id
  AND (u.raw_user_meta_data->>'role' IS NULL 
       OR (u.raw_user_meta_data->>'role')::text != p.role);

-- Vérifier le résultat
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_auth_users,
  p.role as role_in_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.role IS NOT NULL
ORDER BY u.email;

