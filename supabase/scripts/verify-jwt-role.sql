-- =============================================================================
-- VÉRIFIER QUE LE RÔLE EST BIEN DANS AUTH.USERS POUR LE JWT
-- =============================================================================

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

-- 2. S'ASSURER QUE LE RÔLE EST BIEN DANS raw_user_meta_data
-- =============================================================================
-- Si le rôle n'est pas dans raw_user_meta_data, le JWT ne le contiendra pas
-- Décommentez et exécutez cette ligne pour mettre à jour votre rôle :
-- UPDATE auth.users
-- SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
-- WHERE id = auth.uid();

-- 3. VÉRIFIER AUSSI DANS PROFILES
-- =============================================================================
SELECT '=== RÔLE DANS PROFILES ===' as info;

SELECT 
  id,
  email,
  role
FROM public.profiles
WHERE id = auth.uid();

-- 4. METTRE À JOUR PROFILES SI NÉCESSAIRE
-- =============================================================================
-- Décommentez et exécutez cette ligne si le rôle n'est pas admin dans profiles :
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = auth.uid();

-- 5. VÉRIFICATION FINALE
-- =============================================================================
SELECT '=== VÉRIFICATION FINALE ===' as info;

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

SELECT '⚠️ IMPORTANT : Après avoir mis à jour le rôle, vous devez vous DÉCONNECTER et vous RECONNECTER pour que le nouveau JWT soit généré avec le bon rôle !' as message;

