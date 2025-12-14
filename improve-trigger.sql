-- Améliorer le trigger pour qu'il crée TOUJOURS un profil avec le rôle "adherent" par défaut
-- Même si les métadonnées ne sont pas définies

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer la fonction améliorée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Toujours créer un profil, avec le rôle depuis les métadonnées ou "adherent" par défaut
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::TEXT,
      'adherent'  -- Rôle par défaut si non spécifié
    )
  )
  ON CONFLICT (id) DO NOTHING; -- Éviter les erreurs si le profil existe déjà
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pour les utilisateurs existants qui n'ont pas de profil, créer les profils manquants
INSERT INTO public.profiles (id, email, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    (u.raw_user_meta_data->>'role')::TEXT,
    'adherent'
  )
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

