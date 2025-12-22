-- =============================================================================
-- Script SIMPLIFIÉ pour corriger les politiques RLS
-- Utilise UNIQUEMENT auth.jwt() - pas de fallback
-- =============================================================================

-- 1. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
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

-- 2. CRÉER DES POLITIQUES ULTRA-SIMPLES
-- =============================================================================

-- Politique : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique : Un admin peut lire tous les profils
-- VERSION ULTRA-SIMPLE : utilise uniquement le JWT
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role')
    ) = 'admin'
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
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'raw_user_meta_data' ->> 'role')
    ) = 'admin'
  );

-- 3. VÉRIFICATION
-- =============================================================================
SELECT 'Politiques RLS simplifiées créées avec succès !' as message;

SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

