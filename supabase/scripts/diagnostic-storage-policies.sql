-- =============================================================================
-- Script de diagnostic pour vérifier la configuration Storage
-- =============================================================================

-- 1. Vérifier que la fonction is_admin() existe et fonctionne
-- =============================================================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
    THEN '✅ La fonction public.is_admin() existe'
    ELSE '❌ La fonction public.is_admin() n''existe pas'
  END as fonction_status;

-- Tester la fonction (remplacez 'bf9ab9d6-4b11-437f-89ff-67431b5e496f' par votre user_id)
SELECT 
  'Test is_admin() pour votre utilisateur:' as test,
  public.is_admin() as resultat;

-- 2. Vérifier que le bucket existe
-- =============================================================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'admin-files')
    THEN '✅ Le bucket "admin-files" existe'
    ELSE '❌ Le bucket "admin-files" n''existe pas'
  END as bucket_status;

-- 3. Vérifier les politiques Storage (si accessible)
-- =============================================================================
-- Note: Les politiques Storage ne sont pas directement accessibles via SQL standard
-- Mais on peut vérifier via les vues système si disponibles

-- 4. Vérifier votre profil
-- =============================================================================
SELECT 
  id,
  email,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ Vous êtes admin'
    ELSE '❌ Vous n''êtes pas admin'
  END as status
FROM public.profiles
WHERE id = auth.uid();

-- 5. Vérifier que auth.uid() retourne bien votre ID
-- =============================================================================
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ auth.uid() fonctionne'
    ELSE '❌ auth.uid() est NULL - vous n''êtes pas connecté'
  END as auth_status;

