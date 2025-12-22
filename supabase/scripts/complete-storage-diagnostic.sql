-- =============================================================================
-- DIAGNOSTIC COMPLET DU STORAGE
-- =============================================================================

-- 1. Vérifier que le bucket existe
-- =============================================================================
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE name = 'admin-files';

-- 2. Vérifier toutes les politiques du bucket
-- =============================================================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%admin-files%'
ORDER BY policyname;

-- 3. Vérifier la fonction is_admin()
-- =============================================================================
SELECT 
  proname as function_name,
  prosrc as function_body,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'is_admin' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Tester la fonction is_admin() avec un user_id spécifique
-- =============================================================================
-- Remplacez 'bf9ab9d6-4b11-437f-89ff-67431b5e496f' par votre user_id si différent
SELECT 
  'Test is_admin()' as test,
  public.is_admin() as resultat,
  auth.uid() as current_user_id;

-- 5. Vérifier votre profil
-- =============================================================================
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE id = 'bf9ab9d6-4b11-437f-89ff-67431b5e496f';

-- 6. Vérifier les permissions sur le bucket
-- =============================================================================
SELECT 
  'Bucket permissions' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'admin-files' AND public = false)
    THEN '✅ Bucket est privé (correct)'
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'admin-files' AND public = true)
    THEN '⚠️ Bucket est public (moins sécurisé)'
    ELSE '❌ Bucket n''existe pas'
  END as bucket_status;

