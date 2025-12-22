-- =============================================================================
-- Solution ALTERNATIVE : Trigger pour ajouter automatiquement le rôle au JWT
-- Ce trigger met à jour les métadonnées utilisateur à chaque connexion
-- =============================================================================

-- Fonction qui met à jour les métadonnées utilisateur avec le rôle depuis profiles
CREATE OR REPLACE FUNCTION public.sync_user_metadata_with_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour raw_user_meta_data avec le rôle depuis profiles
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', COALESCE(
        (SELECT role FROM public.profiles WHERE id = NEW.id),
        'adherent'
      ))
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui se déclenche après chaque connexion
DROP TRIGGER IF EXISTS sync_user_metadata_on_signin ON auth.users;
CREATE TRIGGER sync_user_metadata_on_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.sync_user_metadata_with_profile();

-- Mettre à jour immédiatement tous les utilisateurs existants
UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', COALESCE(p.role, 'adherent'))
FROM public.profiles p
WHERE u.id = p.id;

-- Vérifier
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_metadata,
  p.role as role_in_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('promenadedepensees@gmail.com', 'polainapro@gmail.com');

