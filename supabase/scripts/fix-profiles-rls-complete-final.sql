-- =============================================================================
-- CORRECTION COMPLÈTE ET DÉFINITIVE : Politiques RLS pour profiles
-- Permet aux admins de lire tous les profils (notamment les adhérents)
-- =============================================================================

-- 1. CRÉER/AMÉLIORER LA FONCTION is_admin() AVEC SECURITY DEFINER
-- =============================================================================
-- Cette fonction doit être SECURITY DEFINER pour bypasser RLS lors de la vérification
-- Elle vérifie d'abord dans auth.users (pas de RLS), puis dans profiles si nécessaire
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
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

-- 2. S'ASSURER QUE RLS EST ACTIVÉ SUR LA TABLE PROFILES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES (pour repartir à zéro)
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
DROP POLICY IF EXISTS "profiles - Accès utilisateur" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. CRÉER LES POLITIQUES RLS COMPLÈTES
-- =============================================================================

-- SELECT : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT : Un admin peut lire TOUS les profils (y compris tous les adhérents)
-- C'EST LA POLITIQUE MANQUANTE QUI CAUSAIT LE PROBLÈME !
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT : Un utilisateur peut créer son propre profil (lors de l'inscription)
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
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE : Un admin peut supprimer tous les profils
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. VÉRIFICATION FINALE
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
SELECT '✅ Les admins peuvent maintenant lire tous les profils (adhérents inclus)' as message;

