-- =============================================================================
-- Script complet pour mettre à jour le rôle admin dans auth.users
-- Met à jour à la fois raw_user_meta_data ET user_metadata
-- =============================================================================

-- Mettre à jour les deux champs de métadonnées
UPDATE auth.users 
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
  user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
  updated_at = NOW()
WHERE email = 'promenadedepensees@gmail.com';

-- Vérifier que c'est bien mis à jour
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role_in_raw_metadata,
  user_metadata->>'role' as role_in_user_metadata,
  updated_at
FROM auth.users
WHERE email = 'promenadedepensees@gmail.com';

