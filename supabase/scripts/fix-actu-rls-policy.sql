-- Script pour corriger les politiques RLS de la table Actu
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier que la fonction is_admin existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_admin' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✓ Fonction is_admin existe'
    ELSE '✗ Fonction is_admin n''existe pas - Exécutez d''abord setup-rls-policies.sql'
  END as verification;

-- 2. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Actu - Lecture publique" ON "Actu";
DROP POLICY IF EXISTS "Actu - Écriture admin" ON "Actu";
DROP POLICY IF EXISTS "Actu - Lecture publique" ON public."Actu";
DROP POLICY IF EXISTS "Actu - Écriture admin" ON public."Actu";

-- 3. S'assurer que RLS est activé
ALTER TABLE IF EXISTS "Actu" ENABLE ROW LEVEL SECURITY;

-- 4. Créer la politique de lecture publique (pour tous)
CREATE POLICY "Actu - Lecture publique"
  ON "Actu"
  FOR SELECT
  TO public
  USING (true);

-- 5. Créer la politique d'écriture pour les administrateurs
-- IMPORTANT: Utiliser FOR INSERT, UPDATE, DELETE séparément pour plus de clarté
CREATE POLICY "Actu - Insertion admin"
  ON "Actu"
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Actu - Modification admin"
  ON "Actu"
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Actu - Suppression admin"
  ON "Actu"
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. Vérifier les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'Actu'
ORDER BY policyname;
