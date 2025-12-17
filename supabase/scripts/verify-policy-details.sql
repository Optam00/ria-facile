-- Vérifier les détails de la politique profiles_select_admin
SELECT 
  policyname,
  cmd,
  qual as condition_using,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname = 'profiles_select_admin';

