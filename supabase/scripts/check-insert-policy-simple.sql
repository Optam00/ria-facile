-- =============================================================================
-- Vérifier rapidement si la politique INSERT existe pour profiles
-- =============================================================================

-- Vérifier toutes les politiques INSERT
SELECT '=== POLITIQUES INSERT ===' as info;
SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Si aucune politique INSERT n'existe, on la crée
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
      AND cmd = 'INSERT'
  ) THEN
    -- Créer la politique INSERT
    CREATE POLICY "profiles_insert"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE '✅ Politique INSERT créée avec succès !';
  ELSE
    RAISE NOTICE '✅ Politique INSERT existe déjà';
  END IF;
END $$;

-- Afficher toutes les politiques après création
SELECT '=== TOUTES LES POLITIQUES (après vérification) ===' as info;
SELECT 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

