-- =============================================================================
-- SOLUTION ULTRA-PROPRE : Supprime TOUTES les politiques puis les recrée
-- =============================================================================

-- 1. CRÉER/AMÉLIORER LA FONCTION is_admin_direct()
-- =============================================================================
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
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT (raw_user_meta_data->>'role')::text INTO user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$;

-- 2. S'ASSURER QUE RLS EST ACTIVÉ
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES (méthode exhaustive)
-- =============================================================================
-- On supprime toutes les politiques en une seule fois avec une boucle
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

-- 4. CRÉER LES POLITIQUES RLS (VERSION PROPRE)
-- =============================================================================

-- SELECT : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT : Un admin peut lire TOUS les profils
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

-- 5. VÉRIFICATION FINALE
-- =============================================================================
SELECT '=== POLITIQUES RLS CRÉÉES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

SELECT '✅ Toutes les politiques ont été supprimées et recréées proprement !' as message;

-- 6. TEST RAPIDE
-- =============================================================================
SELECT '=== TEST : is_admin_direct() ===' as info;
SELECT public.is_admin_direct() as result;

SELECT '=== TEST : Nombre d''adhérents (si admin) ===' as info;
SELECT COUNT(*) as nombre_adherents
FROM public.profiles
WHERE role = 'adherent';

