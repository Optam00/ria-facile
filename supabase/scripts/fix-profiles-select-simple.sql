-- =============================================================================
-- CORRECTION SIMPLE : Politique SELECT pour profiles
-- Version ultra-simple sans fonction qui pourrait bloquer
-- =============================================================================

-- 1. SUPPRIMER TOUTES LES POLITIQUES SELECT EXISTANTES
-- =============================================================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles - Accès utilisateur" ON public.profiles;

-- 2. S'ASSURER QUE RLS EST ACTIVÉ
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CRÉER UNE POLITIQUE SELECT ULTRA-SIMPLE
-- =============================================================================
-- Politique : Un utilisateur peut lire son propre profil
-- Utilise uniquement auth.uid() = id (pas de fonction, pas de sous-requête)
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. VÉRIFICATION
-- =============================================================================
SELECT '=== POLITIQUES SELECT APRÈS CORRECTION ===' as info;

SELECT 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

SELECT '✅ Politique SELECT créée avec succès !' as message;
SELECT '⚠️ Testez maintenant la page Mon Espace pour voir si la requête fonctionne.' as next_step;

