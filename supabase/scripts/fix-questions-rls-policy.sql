-- Script pour corriger les politiques RLS de la table questions (quiz)
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

-- 2. Supprimer TOUTES les anciennes politiques de la table questions
DROP POLICY IF EXISTS "questions - Lecture publique" ON "questions";
DROP POLICY IF EXISTS "questions - Lecture authentifiés" ON "questions";
DROP POLICY IF EXISTS "questions - Écriture admin" ON "questions";
DROP POLICY IF EXISTS "questions - Insertion admin" ON "questions";
DROP POLICY IF EXISTS "questions - Modification admin" ON "questions";
DROP POLICY IF EXISTS "questions - Suppression admin" ON "questions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "questions";
DROP POLICY IF EXISTS "questions - Lecture publique" ON public."questions";
DROP POLICY IF EXISTS "questions - Lecture authentifiés" ON public."questions";
DROP POLICY IF EXISTS "questions - Écriture admin" ON public."questions";
DROP POLICY IF EXISTS "questions - Insertion admin" ON public."questions";
DROP POLICY IF EXISTS "questions - Modification admin" ON public."questions";
DROP POLICY IF EXISTS "questions - Suppression admin" ON public."questions";
DROP POLICY IF EXISTS "Enable read access for all users" ON public."questions";

-- 3. S'assurer que RLS est activé
ALTER TABLE IF EXISTS "questions" ENABLE ROW LEVEL SECURITY;

-- 4. Créer la politique de lecture publique (pour tous, y compris les utilisateurs authentifiés)
CREATE POLICY "questions - Lecture publique"
  ON "questions"
  FOR SELECT
  TO public
  USING (true);

-- 4b. Créer également une politique de lecture pour les utilisateurs authentifiés (pour garantir l'accès)
CREATE POLICY "questions - Lecture authentifiés"
  ON "questions"
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Créer les politiques d'écriture pour les administrateurs
-- IMPORTANT: Utiliser FOR INSERT, UPDATE, DELETE séparément pour plus de clarté
-- Utiliser la fonction public.is_admin() pour être cohérent avec les autres tables
CREATE POLICY "questions - Insertion admin"
  ON "questions"
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "questions - Modification admin"
  ON "questions"
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "questions - Suppression admin"
  ON "questions"
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
  AND tablename = 'questions'
ORDER BY policyname;

