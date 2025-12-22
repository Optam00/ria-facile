-- =============================================================================
-- Mettre à jour les profils existants avec nom, prenom, profession depuis auth.users
-- =============================================================================

-- Mettre à jour les profils existants avec les données depuis raw_user_meta_data
UPDATE public.profiles p
SET
  nom = COALESCE(
    p.nom,  -- Garder la valeur existante si elle existe
    (u.raw_user_meta_data->>'nom')::TEXT  -- Sinon prendre depuis les métadonnées
  ),
  prenom = COALESCE(
    p.prenom,
    (u.raw_user_meta_data->>'prenom')::TEXT
  ),
  profession = COALESCE(
    p.profession,
    (u.raw_user_meta_data->>'profession')::TEXT
  )
FROM auth.users u
WHERE p.id = u.id
  AND (
    -- Mettre à jour seulement si au moins un champ est manquant dans profiles
    -- mais présent dans les métadonnées
    (p.nom IS NULL AND (u.raw_user_meta_data->>'nom') IS NOT NULL)
    OR (p.prenom IS NULL AND (u.raw_user_meta_data->>'prenom') IS NOT NULL)
    OR (p.profession IS NULL AND (u.raw_user_meta_data->>'profession') IS NOT NULL)
  );

