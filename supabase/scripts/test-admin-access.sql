-- =============================================================================
-- Test pour vérifier si un admin peut lire les adhérents
-- =============================================================================

-- Test 1: Vérifier si is_admin() retourne true
SELECT 
  'Test is_admin()' as test,
  public.is_admin() as result;

-- Test 2: Compter les adhérents (devrait fonctionner si admin)
SELECT 
  'Nombre d''adhérents' as test,
  COUNT(*) as count
FROM public.profiles
WHERE role = 'adherent';

-- Test 3: Lister les adhérents (devrait fonctionner si admin)
SELECT 
  'Liste des adhérents' as test,
  id,
  email,
  prenom,
  nom,
  role,
  created_at
FROM public.profiles
WHERE role = 'adherent'
ORDER BY created_at DESC
LIMIT 10;

