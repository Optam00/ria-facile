-- Ajouter l'option d'affichage de l'invitation LinkedIn en bas des articles de doctrine
-- (case à cocher dans l'admin, bloc affiché sous l'article si true)

ALTER TABLE public.doctrine
ADD COLUMN IF NOT EXISTS show_linkedin_cta BOOLEAN DEFAULT true NOT NULL;

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'doctrine'
  AND column_name = 'show_linkedin_cta';
