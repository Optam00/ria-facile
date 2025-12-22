-- =============================================================================
-- Test pour simuler ce que fait l'application client
-- Cette requête devrait fonctionner si les politiques RLS sont correctes
-- =============================================================================

-- Simuler la requête exacte que fait l'application
-- (en tant qu'utilisateur authentifié avec auth.uid() = '5e086d94-0196-4f23-94e0-d0632365ddd5')

-- Note: Cette requête doit être exécutée en tant qu'utilisateur authentifié
-- Dans le SQL Editor de Supabase, on est en tant que "postgres" (superuser)
-- donc ça fonctionnera toujours. Le problème est côté client.

-- Pour tester côté client, utilise la console du navigateur :
-- supabase.from('profiles').select('prenom, nom, profession').eq('id', '5e086d94-0196-4f23-94e0-d0632365ddd5').single()

-- Vérifier les politiques RLS actuelles
SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

