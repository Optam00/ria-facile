-- =============================================================================
-- Créer un trigger pour synchroniser profiles avec les métadonnées
-- =============================================================================

-- 1. Créer la fonction de synchronisation
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_profile_from_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour profiles avec les nouvelles métadonnées
  UPDATE public.profiles
  SET
    nom = (NEW.raw_user_meta_data->>'nom')::text,
    prenom = (NEW.raw_user_meta_data->>'prenom')::text,
    profession = (NEW.raw_user_meta_data->>'profession')::text,
    consentement_prospection = COALESCE((NEW.raw_user_meta_data->>'consentement_prospection')::boolean, false),
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer l'ancien trigger s'il existe
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- 3. Créer le trigger
-- =============================================================================
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    -- Déclencher seulement si les métadonnées ont changé
    OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
  )
  EXECUTE FUNCTION public.sync_profile_from_metadata();

-- 4. Synchroniser les profils existants avec les métadonnées actuelles
-- =============================================================================
UPDATE public.profiles p
SET
  nom = (u.raw_user_meta_data->>'nom')::text,
  prenom = (u.raw_user_meta_data->>'prenom')::text,
  profession = (u.raw_user_meta_data->>'profession')::text,
  consentement_prospection = COALESCE((u.raw_user_meta_data->>'consentement_prospection')::boolean, false),
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND (
    -- Mettre à jour seulement si les valeurs sont différentes
    p.nom IS DISTINCT FROM (u.raw_user_meta_data->>'nom')::text
    OR p.prenom IS DISTINCT FROM (u.raw_user_meta_data->>'prenom')::text
    OR p.profession IS DISTINCT FROM (u.raw_user_meta_data->>'profession')::text
    OR p.consentement_prospection IS DISTINCT FROM COALESCE((u.raw_user_meta_data->>'consentement_prospection')::boolean, false)
  );

-- 5. Vérification
-- =============================================================================
SELECT '✅ Trigger créé et profils synchronisés !' as message;

-- Vérifier les données pour ton utilisateur
SELECT 
  p.id,
  p.email,
  p.nom as nom_profiles,
  p.prenom as prenom_profiles,
  p.profession as profession_profiles,
  u.raw_user_meta_data->>'nom' as nom_metadata,
  u.raw_user_meta_data->>'prenom' as prenom_metadata,
  u.raw_user_meta_data->>'profession' as profession_metadata
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

