-- Ajout des colonnes manquantes
ALTER TABLE articles_ria
ADD COLUMN IF NOT EXISTS section_titre TEXT,
ADD COLUMN IF NOT EXISTS section_numero TEXT,
ADD COLUMN IF NOT EXISTS chapitre_titre TEXT; 