-- Script de correction des politiques RLS pour adherent_files
-- À exécuter après create-adherent-files-table.sql

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Admins can manage adherent files" ON public.adherent_files;
DROP POLICY IF EXISTS "Admins can select adherent files" ON public.adherent_files;
DROP POLICY IF EXISTS "Admins can insert adherent files" ON public.adherent_files;
DROP POLICY IF EXISTS "Admins can update adherent files" ON public.adherent_files;
DROP POLICY IF EXISTS "Admins can delete adherent files" ON public.adherent_files;
DROP POLICY IF EXISTS "Adherents can view available files" ON public.adherent_files;

-- Policy: Les admins peuvent lire
CREATE POLICY "Admins can select adherent files" ON public.adherent_files
  FOR SELECT
  USING (public.is_admin_for_storage() = true);

-- Policy: Les admins peuvent insérer
CREATE POLICY "Admins can insert adherent files" ON public.adherent_files
  FOR INSERT
  WITH CHECK (public.is_admin_for_storage() = true);

-- Policy: Les admins peuvent mettre à jour
CREATE POLICY "Admins can update adherent files" ON public.adherent_files
  FOR UPDATE
  USING (public.is_admin_for_storage() = true)
  WITH CHECK (public.is_admin_for_storage() = true);

-- Policy: Les admins peuvent supprimer
CREATE POLICY "Admins can delete adherent files" ON public.adherent_files
  FOR DELETE
  USING (public.is_admin_for_storage() = true);

-- Policy: Les adhérents peuvent uniquement lire les fichiers disponibles
-- Utilisation d'une fonction SECURITY DEFINER pour éviter les problèmes RLS
CREATE OR REPLACE FUNCTION public.is_adherent()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'adherent'
  );
END;
$$;

CREATE POLICY "Adherents can view available files" ON public.adherent_files
  FOR SELECT
  USING (
    is_available = true 
    AND public.is_adherent() = true
  );

-- Vérification
SELECT '✅ Politiques RLS créées avec succès' as message;

