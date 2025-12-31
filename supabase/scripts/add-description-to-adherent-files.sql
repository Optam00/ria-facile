-- Ajouter une colonne description optionnelle à la table adherent_files
ALTER TABLE public.adherent_files 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Commentaire
COMMENT ON COLUMN public.adherent_files.description IS 'Description optionnelle du fichier, visible par les adhérents';

