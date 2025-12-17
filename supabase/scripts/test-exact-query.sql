-- =============================================================================
-- Test de la requête exacte utilisée par l'application
-- =============================================================================

-- Cette requête simule exactement ce que fait l'application
SELECT 
  id, 
  email, 
  prenom, 
  nom, 
  profession, 
  created_at
FROM public.profiles
WHERE role = 'adherent'
ORDER BY created_at DESC;

-- Vérifier aussi avec un count pour voir si les politiques permettent au moins le count
SELECT COUNT(*) as total
FROM public.profiles
WHERE role = 'adherent';

