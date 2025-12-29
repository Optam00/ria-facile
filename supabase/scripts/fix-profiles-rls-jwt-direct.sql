-- =============================================================================
-- SOLUTION ALTERNATIVE : Utiliser directement le JWT au lieu de is_admin()
-- Cette approche évite les problèmes de récursion et fonctionne avec le JWT
-- =============================================================================

-- 1. CRÉER UNE FONCTION QUI VÉRIFIE LE RÔLE DEPUIS LE JWT
-- =============================================================================
-- Cette fonction lit directement depuis le JWT, pas besoin de requête DB
CREATE OR REPLACE FUNCTION public.is_admin_from_jwt()
RETURNS BOOLEAN 
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  -- Si pas d'utilisateur authentifié, retourner false
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Lire le rôle directement depuis le JWT
  jwt_role := COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::TEXT,
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role')::TEXT
  );
  
  RETURN jwt_role = 'admin';
END;
$$;

-- 2. S'ASSURER QUE RLS EST ACTIVÉ
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- =============================================================================
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

-- 4. CRÉER LES POLITIQUES RLS (VERSION JWT DIRECT)
-- =============================================================================

-- SELECT : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT : Un admin peut lire TOUS les profils
-- On utilise is_admin_from_jwt() qui lit directement depuis le JWT
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin_from_jwt());

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
  USING (public.is_admin_from_jwt())
  WITH CHECK (public.is_admin_from_jwt());

-- DELETE : Un admin peut supprimer tous les profils
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin_from_jwt());

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

SELECT '✅ Politiques RLS créées avec is_admin_from_jwt() !' as message;

-- 6. TEST RAPIDE
-- =============================================================================
SELECT '=== TEST : is_admin_from_jwt() ===' as info;
SELECT public.is_admin_from_jwt() as result;

SELECT '=== TEST : Contenu du JWT ===' as info;
SELECT 
  auth.jwt() -> 'user_metadata' ->> 'role' as role_in_user_metadata,
  auth.jwt() -> 'raw_user_meta_data' ->> 'role' as role_in_raw_metadata,
  auth.uid() as current_user_id;

SELECT '=== TEST : Nombre d''adhérents (si admin) ===' as info;
SELECT COUNT(*) as nombre_adherents
FROM public.profiles
WHERE role = 'adherent';

