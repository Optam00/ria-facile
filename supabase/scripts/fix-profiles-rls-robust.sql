-- =============================================================================
-- SOLUTION ROBUSTE : Politiques RLS pour profiles avec vérification directe
-- Cette version évite les problèmes de récursion avec is_admin()
-- =============================================================================

-- 1. CRÉER UNE FONCTION is_admin() AMÉLIORÉE
-- =============================================================================
-- Cette fonction vérifie d'abord dans auth.users (pas de RLS), puis dans profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Si pas d'utilisateur authentifié, retourner false
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier d'abord dans auth.users.raw_user_meta_data (table système, pas de RLS)
  SELECT (raw_user_meta_data->>'role')::text INTO user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Si pas trouvé dans auth.users, vérifier dans profiles
  -- SECURITY DEFINER permet de bypasser les RLS lors de cette vérification
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. CRÉER UNE FONCTION ALTERNATIVE QUI VÉRIFIE DIRECTEMENT DANS AUTH.USERS
-- =============================================================================
-- Cette fonction est plus simple et évite complètement la table profiles
CREATE OR REPLACE FUNCTION public.is_admin_direct()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Si pas d'utilisateur authentifié, retourner false
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier directement dans auth.users (pas de RLS)
  SELECT (raw_user_meta_data->>'role')::text INTO user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$;

-- 3. S'ASSURER QUE RLS EST ACTIVÉ
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- =============================================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles - Accès utilisateur" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 5. CRÉER LES POLITIQUES RLS (VERSION ROBUSTE)
-- =============================================================================

-- SELECT : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT : Un admin peut lire TOUS les profils
-- On utilise is_admin_direct() qui vérifie directement dans auth.users
-- pour éviter tout problème de récursion avec RLS
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin_direct());

-- INSERT : Un utilisateur peut créer son propre profil
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE : Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE : Un admin peut mettre à jour tous les profils
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_direct())
  WITH CHECK (public.is_admin_direct());

-- DELETE : Un admin peut supprimer tous les profils
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin_direct());

-- 6. VÉRIFICATION FINALE
-- =============================================================================
SELECT '=== POLITIQUES RLS CRÉÉES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

SELECT '✅ Politiques RLS créées avec succès !' as message;
SELECT '✅ Utilisation de is_admin_direct() pour éviter les problèmes de récursion' as message;

-- 7. TEST RAPIDE
-- =============================================================================
SELECT '=== TEST : is_admin_direct() ===' as info;
SELECT public.is_admin_direct() as result;

SELECT '=== TEST : Lecture des adhérents (si admin) ===' as info;
SELECT COUNT(*) as nombre_adherents
FROM public.profiles
WHERE role = 'adherent';

