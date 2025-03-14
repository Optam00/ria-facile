-- Ajouter les nouvelles colonnes
ALTER TABLE articles_ria
ADD COLUMN IF NOT EXISTS section_numero text,
ADD COLUMN IF NOT EXISTS section_titre text,
ADD COLUMN IF NOT EXISTS chapitre_titre text; 