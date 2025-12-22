-- =============================================================================
-- Vérifier le contenu du JWT actuel
-- =============================================================================

-- Afficher tout le contenu du JWT
SELECT 
  'Contenu du JWT' as info,
  auth.jwt() as jwt_full,
  auth.jwt() -> 'user_metadata' as user_metadata,
  auth.jwt() -> 'user_metadata' ->> 'role' as role_in_user_metadata,
  auth.jwt() -> 'raw_user_meta_data' as raw_user_meta_data,
  auth.jwt() -> 'raw_user_meta_data' ->> 'role' as role_in_raw_metadata,
  auth.uid() as current_user_id;

