-- =============================================================================
-- Script V2 pour corriger les politiques RLS de la table profiles
-- Version alternative qui utilise le JWT pour éviter toute dépendance circulaire
-- =============================================================================

-- 1. CRÉER UNE FONCTION POUR VÉRIFIER SI L'UTILISATEUR EST ADMIN
-- Cette version essaie d'abord le JWT, puis la table profiles en dernier recours
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Essayer d'abord de récupérer le rôle depuis le JWT (pas de requête DB)
  user_role := COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::TEXT,
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role')::TEXT
  );
  
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Si le rôle n'est pas dans le JWT, vérifier dans la table profiles
  -- SECURITY DEFINER permet de bypasser les RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- =============================================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles - Accès utilisateur" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. CRÉER LES NOUVELLES POLITIQUES RLS
-- =============================================================================

-- Politique : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique : Un admin peut lire tous les profils
-- (séparée pour éviter toute dépendance circulaire)
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Politique : Un utilisateur peut créer son propre profil
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique : Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique : Les admins peuvent mettre à jour tous les profils
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Politique : Les admins peuvent supprimer des profils
CREATE POLICY "profiles_admin_delete"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. VÉRIFICATION
-- =============================================================================
SELECT 'Politiques RLS mises à jour avec succès (V2) !' as message;

SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

