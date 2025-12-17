-- =============================================================================
-- Diagnostic complet des politiques RLS pour la table profiles
-- Vérifie INSERT, UPDATE, SELECT pour comprendre pourquoi l'upsert échoue
-- =============================================================================

-- 1. Vérifier si RLS est activé
SELECT '=== RLS ACTIVÉ ? ===' as section;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 2. Vérifier TOUTES les politiques RLS
SELECT '=== TOUTES LES POLITIQUES RLS ===' as section;
SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 3. Vérifier si l'utilisateur actuel a un profil
SELECT '=== PROFIL UTILISATEUR ACTUEL ===' as section;
SELECT 
  id,
  email,
  prenom,
  nom,
  profession,
  role,
  created_at
FROM public.profiles
WHERE id = auth.uid();

-- 4. Tester si l'utilisateur peut lire son propre profil
SELECT '=== TEST LECTURE PROFIL ===' as section;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid()
    ) THEN '✅ Peut lire son profil'
    ELSE '❌ Ne peut PAS lire son profil'
  END as can_read;

-- 5. Tester si l'utilisateur peut insérer son propre profil
SELECT '=== TEST INSERT PROFIL ===' as section;
-- On ne fait pas vraiment l'insertion, juste vérifier les permissions
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' 
        AND cmd = 'INSERT'
        AND (qual IS NULL OR qual::text LIKE '%auth.uid()%')
    ) THEN '✅ Politique INSERT existe'
    ELSE '❌ Aucune politique INSERT trouvée'
  END as has_insert_policy;

-- 6. Tester si l'utilisateur peut mettre à jour son propre profil
SELECT '=== TEST UPDATE PROFIL ===' as section;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' 
        AND cmd = 'UPDATE'
        AND (qual::text LIKE '%auth.uid()%' OR qual::text LIKE '%id%')
    ) THEN '✅ Politique UPDATE existe'
    ELSE '❌ Aucune politique UPDATE trouvée'
  END as has_update_policy;

