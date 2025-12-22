-- =============================================================================
-- Script complet pour corriger les politiques RLS UPDATE/INSERT de la table profiles
-- Permet aux adhérents de mettre à jour leur propre profil
-- =============================================================================

-- 1. VÉRIFIER LES POLITIQUES ACTUELLES
-- =============================================================================
SELECT '=== POLITIQUES RLS ACTUELLES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY cmd, policyname;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES (pour éviter les conflits)
-- =============================================================================
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. CRÉER LA POLITIQUE INSERT POUR LES UTILISATEURS
-- =============================================================================
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. CRÉER LA POLITIQUE UPDATE POUR LES UTILISATEURS
-- =============================================================================
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. CRÉER LA POLITIQUE UPDATE POUR LES ADMINS (optionnel)
-- =============================================================================
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. VÉRIFICATION FINALE
-- =============================================================================
SELECT '=== POLITIQUES RLS APRÈS CORRECTION ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd IN ('INSERT', 'UPDATE')
ORDER BY cmd, policyname;

SELECT '✅ Politiques RLS corrigées avec succès !' as message;

