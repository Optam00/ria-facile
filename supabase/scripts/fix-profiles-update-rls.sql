-- =============================================================================
-- Script pour corriger les politiques RLS UPDATE de la table profiles
-- Permet aux adhérents de mettre à jour leur propre profil
-- =============================================================================

-- 1. VÉRIFIER LES POLITIQUES ACTUELLES
-- =============================================================================
SELECT 'Politiques RLS actuelles pour UPDATE:' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES UPDATE
-- =============================================================================
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. CRÉER LA POLITIQUE UPDATE POUR LES UTILISATEURS
-- =============================================================================
-- Politique : Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. CRÉER LA POLITIQUE UPDATE POUR LES ADMINS (optionnel, pour permettre aux admins de modifier tous les profils)
-- =============================================================================
-- Politique : Un admin peut mettre à jour tous les profils
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Vérifier d'abord dans le JWT (user_metadata)
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    OR
    -- Sinon vérifier dans raw_user_meta_data du JWT
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'admin'
    OR
    -- En dernier recours, utiliser la fonction is_admin()
    public.is_admin()
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role')::text = 'admin'
    OR
    public.is_admin()
  );

-- 5. VÉRIFICATION FINALE
-- =============================================================================
SELECT 'Politiques RLS UPDATE créées avec succès !' as message;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

