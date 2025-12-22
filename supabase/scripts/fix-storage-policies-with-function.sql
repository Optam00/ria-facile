-- =============================================================================
-- Script pour corriger les politiques RLS du Storage en utilisant une fonction
-- qui bypass les RLS de la table profiles
-- =============================================================================

-- 1. CRÉER UNE FONCTION POUR VÉRIFIER SI L'UTILISATEUR EST ADMIN
-- Cette fonction utilise SECURITY DEFINER pour bypasser les RLS de profiles
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES STORAGE (si elles existent)
-- =============================================================================
-- Note: Les politiques Storage doivent être supprimées via le Dashboard
-- ou via cette commande (si vous avez les permissions)
-- DROP POLICY IF EXISTS "Admins can read admin-files" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can upload to admin-files" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can delete from admin-files" ON storage.objects;

-- 3. CRÉER LES NOUVELLES POLITIQUES STORAGE
-- =============================================================================
-- IMPORTANT: Ces politiques doivent être créées via le Dashboard Supabase
-- Storage > Files > Policies > New Policy
-- 
-- Pour SELECT (lecture):
-- Policy name: "Admins can read admin-files"
-- Allowed operation: SELECT
-- USING expression:
--   (bucket_id = 'admin-files'::text) AND (public.is_admin() = true)
--
-- Pour INSERT (upload):
-- Policy name: "Admins can upload to admin-files"
-- Allowed operation: INSERT
-- WITH CHECK expression:
--   (bucket_id = 'admin-files'::text) AND (public.is_admin() = true)
--
-- Pour DELETE (suppression):
-- Policy name: "Admins can delete from admin-files"
-- Allowed operation: DELETE
-- USING expression:
--   (bucket_id = 'admin-files'::text) AND (public.is_admin() = true)

-- =============================================================================
-- INSTRUCTIONS POUR LE DASHBOARD:
-- =============================================================================
-- 1. Va dans Supabase Dashboard > Storage > Files > Policies
-- 2. Supprime les 3 anciennes politiques pour "admin-files"
-- 3. Crée 3 nouvelles politiques avec les expressions ci-dessus
-- 4. Utilise public.is_admin() au lieu de la requête directe vers profiles

