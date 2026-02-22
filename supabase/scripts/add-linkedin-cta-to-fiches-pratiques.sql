-- Ajouter les champs pour l'invitation LinkedIn en bas des fiches pratiques
-- (affichage optionnel, texte personnalisable — comme le disclaimer)

ALTER TABLE public.fiches_pratiques
ADD COLUMN IF NOT EXISTS show_linkedin_cta BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE public.fiches_pratiques
ADD COLUMN IF NOT EXISTS linkedin_cta_text TEXT;

-- Optionnel : vérifier le résultat
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'fiches_pratiques'
  AND column_name IN ('show_linkedin_cta', 'linkedin_cta_text');
