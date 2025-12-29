-- =============================================================================
-- TRIGGER POUR SYNCHRONISER LE RÔLE DANS AUTH.USERS À CHAQUE CONNEXION
-- =============================================================================
-- Ce trigger garantit que le rôle dans auth.users.raw_user_meta_data est
-- toujours synchronisé avec profiles.role, même après un rafraîchissement de token

-- 1. FONCTION QUI SYNCHRONISE LE RÔLE DEPUIS PROFILES VERS AUTH.USERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_role_to_auth_users()
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

-- 2. TRIGGER QUI SE DÉCLENCHE À CHAQUE MISE À JOUR DE PROFILES
-- =============================================================================
DROP TRIGGER IF EXISTS sync_role_on_profile_update ON public.profiles;
CREATE TRIGGER sync_role_on_profile_update
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.sync_role_to_auth_users();

-- 3. TRIGGER QUI SE DÉCLENCHE À CHAQUE CONNEXION (via last_sign_in_at)
-- =============================================================================
DROP TRIGGER IF EXISTS sync_role_on_signin ON auth.users;
CREATE TRIGGER sync_role_on_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.sync_role_to_auth_users();

-- 4. SYNCHRONISER IMMÉDIATEMENT TOUS LES UTILISATEURS EXISTANTS
-- =============================================================================
UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', COALESCE(p.role, 'adherent'))
FROM public.profiles p
WHERE u.id = p.id
  AND (u.raw_user_meta_data->>'role' IS NULL 
       OR u.raw_user_meta_data->>'role' != p.role);

-- 5. VÉRIFICATION
-- =============================================================================
SELECT '=== VÉRIFICATION ===' as info;

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role_in_auth_users,
  p.role as role_in_profiles,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = p.role THEN '✅ Synchronisé'
    ELSE '❌ Non synchronisé'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.role IS NOT NULL
ORDER BY status, u.email;

SELECT '✅ Triggers créés pour synchroniser automatiquement le rôle à chaque connexion !' as message;

