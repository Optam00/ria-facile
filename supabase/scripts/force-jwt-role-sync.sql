-- =============================================================================
-- FORCER LA SYNCHRONISATION DU RÔLE DANS LE JWT
-- =============================================================================
-- Ce script met à jour user_metadata ET raw_user_meta_data pour que le rôle
-- soit présent dans le JWT lors de la prochaine connexion

-- 1. METTRE À JOUR raw_user_meta_data POUR TOUS LES ADMINS
-- =============================================================================
-- Note: user_metadata n'existe pas dans auth.users, seulement raw_user_meta_data
-- Le JWT génère user_metadata automatiquement à partir de raw_user_meta_data
UPDATE auth.users u
SET 
  raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'admin')
FROM public.profiles p
WHERE u.id = p.id 
  AND p.role = 'admin'
  AND (u.raw_user_meta_data->>'role' IS NULL OR u.raw_user_meta_data->>'role' != 'admin');

-- 2. VÉRIFICATION
-- =============================================================================
SELECT '=== VÉRIFICATION ===' as info;

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_raw_metadata,
  p.role as role_in_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin' OR u.raw_user_meta_data->>'role' = 'admin';

SELECT '⚠️ IMPORTANT : Vous devez vous DÉCONNECTER et vous RECONNECTER pour que le nouveau JWT soit généré avec le rôle admin ! Le JWT contiendra automatiquement user_metadata.role à partir de raw_user_meta_data.role.' as message;

