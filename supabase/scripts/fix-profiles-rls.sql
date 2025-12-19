-- =============================================================================
-- Script pour corriger les politiques RLS de la table profiles
-- Résout le problème de boucle infinie
-- =============================================================================

-- 1. CRÉER UNE FONCTION POUR VÉRIFIER SI L'UTILISATEUR EST ADMIN
-- (avec SECURITY DEFINER pour bypasser les RLS)
-- Cette fonction vérifie d'abord dans auth.users, puis dans profiles si nécessaire
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- D'abord, vérifier dans auth.users.raw_user_meta_data (table système, pas de RLS)
  SELECT (raw_user_meta_data->>'role')::text INTO user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Si pas trouvé dans auth.users, vérifier dans profiles (avec SECURITY DEFINER pour bypasser RLS)
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
-- (vérifie le rôle depuis le JWT directement - plus rapide et évite les timeouts)
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Vérifier d'abord dans le JWT (user_metadata)
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    OR
    -- Sinon vérifier dans raw_user_meta_data du JWT
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'admin'
    OR
    -- En dernier recours, utiliser la fonction is_admin() (qui lit auth.users avec SECURITY DEFINER)
    public.is_admin()
  );

-- Politique : Un utilisateur peut créer son propre profil
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique : Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "profiles_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique : Les admins peuvent supprimer des profils
CREATE POLICY "profiles_admin_delete"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. VÉRIFICATION
-- =============================================================================
SELECT 'Politiques RLS mises à jour avec succès !' as message;

SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

