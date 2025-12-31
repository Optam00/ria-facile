-- Table pour gérer quels fichiers sont disponibles pour les adhérents
CREATE TABLE IF NOT EXISTS public.adherent_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_adherent_files_file_name ON public.adherent_files(file_name);
CREATE INDEX IF NOT EXISTS idx_adherent_files_is_available ON public.adherent_files(is_available) WHERE is_available = true;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_adherent_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_adherent_files_updated_at ON public.adherent_files;
CREATE TRIGGER trigger_update_adherent_files_updated_at
  BEFORE UPDATE ON public.adherent_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_adherent_files_updated_at();

-- RLS: Les admins peuvent tout faire
ALTER TABLE public.adherent_files ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent lire, insérer, mettre à jour et supprimer
-- On crée des politiques séparées pour chaque opération pour plus de clarté
DROP POLICY IF EXISTS "Admins can select adherent files" ON public.adherent_files;
CREATE POLICY "Admins can select adherent files" ON public.adherent_files
  FOR SELECT
  USING (public.is_admin_for_storage() = true);

DROP POLICY IF EXISTS "Admins can insert adherent files" ON public.adherent_files;
CREATE POLICY "Admins can insert adherent files" ON public.adherent_files
  FOR INSERT
  WITH CHECK (public.is_admin_for_storage() = true);

DROP POLICY IF EXISTS "Admins can update adherent files" ON public.adherent_files;
CREATE POLICY "Admins can update adherent files" ON public.adherent_files
  FOR UPDATE
  USING (public.is_admin_for_storage() = true)
  WITH CHECK (public.is_admin_for_storage() = true);

DROP POLICY IF EXISTS "Admins can delete adherent files" ON public.adherent_files;
CREATE POLICY "Admins can delete adherent files" ON public.adherent_files
  FOR DELETE
  USING (public.is_admin_for_storage() = true);

-- Policy: Les adhérents peuvent uniquement lire les fichiers disponibles
DROP POLICY IF EXISTS "Adherents can view available files" ON public.adherent_files;
CREATE POLICY "Adherents can view available files" ON public.adherent_files
  FOR SELECT
  USING (
    is_available = true 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'adherent'
    )
  );

-- Commentaires
COMMENT ON TABLE public.adherent_files IS 'Gère quels fichiers du bucket admin-files sont disponibles pour téléchargement par les adhérents';
COMMENT ON COLUMN public.adherent_files.file_name IS 'Nom du fichier dans le bucket admin-files';
COMMENT ON COLUMN public.adherent_files.is_available IS 'Indique si le fichier est disponible pour les adhérents';

