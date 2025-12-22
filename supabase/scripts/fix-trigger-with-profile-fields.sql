-- =============================================================================
-- Améliorer le trigger pour copier nom, prenom, profession depuis les métadonnées
-- =============================================================================

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer la fonction améliorée qui copie TOUS les champs depuis les métadonnées
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer un profil avec tous les champs depuis les métadonnées
  INSERT INTO public.profiles (id, email, role, nom, prenom, profession, consentement_prospection)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::TEXT,
      'adherent'  -- Rôle par défaut si non spécifié
    ),
    (NEW.raw_user_meta_data->>'nom')::TEXT,
    (NEW.raw_user_meta_data->>'prenom')::TEXT,
    (NEW.raw_user_meta_data->>'profession')::TEXT,
    COALESCE((NEW.raw_user_meta_data->>'consentement_prospection')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Si le profil existe déjà (créé manuellement), mettre à jour avec les métadonnées
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, profiles.role),
    nom = COALESCE(EXCLUDED.nom, profiles.nom),
    prenom = COALESCE(EXCLUDED.prenom, profiles.prenom),
    profession = COALESCE(EXCLUDED.profession, profiles.profession),
    consentement_prospection = COALESCE(EXCLUDED.consentement_prospection, profiles.consentement_prospection);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

