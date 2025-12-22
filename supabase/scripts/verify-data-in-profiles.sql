-- =============================================================================
-- Vérifier que les données sont bien dans la table profiles
-- =============================================================================

-- Vérifier les données pour ton utilisateur
SELECT 
  id,
  email,
  role,
  nom,
  prenom,
  profession,
  created_at,
  updated_at
FROM public.profiles 
WHERE id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

-- Comparer avec les métadonnées
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'nom' as nom_metadata,
  u.raw_user_meta_data->>'prenom' as prenom_metadata,
  u.raw_user_meta_data->>'profession' as profession_metadata
FROM auth.users u
WHERE u.id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

