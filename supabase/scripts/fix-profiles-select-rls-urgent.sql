-- =============================================================================
-- CORRECTION URGENTE : Politiques RLS pour permettre la lecture des profils
-- =============================================================================

-- 1. VÉRIFIER LES POLITIQUES ACTUELLES
-- =============================================================================
SELECT '=== POLITIQUES SELECT ACTUELLES ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 2. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES SELECT (pour repartir à zéro)
-- =============================================================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles - Accès utilisateur" ON public.profiles;

-- 3. CRÉER UNE POLITIQUE SELECT SIMPLE ET EFFICACE
-- =============================================================================
-- Politique : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. VÉRIFIER QUE RLS EST ACTIVÉ
-- =============================================================================
SELECT '=== RLS ACTIVÉ ? ===' as info;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Si RLS n'est pas activé, l'activer :
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. VÉRIFICATION FINALE
-- =============================================================================
SELECT '=== POLITIQUES APRÈS CORRECTION ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

SELECT '✅ Politique SELECT créée avec succès !' as message;

