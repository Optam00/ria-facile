-- =============================================================================
-- Script de diagnostic pour le problème RLS avec les adhérents
-- =============================================================================

-- 1. Vérifier la fonction is_admin()
-- =============================================================================
SELECT 
  'Fonction is_admin()' as test,
  public.is_admin() as result;

-- 2. Vérifier l'utilisateur actuel dans auth.users
-- =============================================================================
SELECT 
  'Utilisateur actuel dans auth.users' as test,
  id,
  email,
  raw_user_meta_data->>'role' as role_in_auth_users,
  raw_user_meta_data as full_metadata
FROM auth.users
WHERE id = auth.uid();

-- 3. Vérifier l'utilisateur actuel dans profiles
-- =============================================================================
SELECT 
  'Utilisateur actuel dans profiles' as test,
  id,
  email,
  role
FROM public.profiles
WHERE id = auth.uid();

-- 4. Tester si on peut lire les profils avec role = 'adherent'
-- =============================================================================
SELECT 
  'Test lecture adhérents' as test,
  COUNT(*) as nombre_adherents
FROM public.profiles
WHERE role = 'adherent';

-- 5. Lister tous les adhérents (devrait fonctionner si admin)
-- =============================================================================
SELECT 
  'Liste des adhérents' as test,
  id,
  email,
  prenom,
  nom,
  role,
  created_at
FROM public.profiles
WHERE role = 'adherent'
ORDER BY created_at DESC
LIMIT 10;

-- 6. Vérifier les politiques RLS actives
-- =============================================================================
SELECT 
  'Politiques RLS actives' as test,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

