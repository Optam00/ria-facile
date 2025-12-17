-- Script pour configurer les politiques RLS de la table assistant_ria
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

-- 2. Supprimer TOUTES les anciennes politiques de la table assistant_ria
DROP POLICY IF EXISTS "assistant_ria - Lecture publique" ON "assistant_ria";
DROP POLICY IF EXISTS "assistant_ria - Insertion publique" ON "assistant_ria";
DROP POLICY IF EXISTS "assistant_ria - Écriture admin" ON "assistant_ria";
DROP POLICY IF EXISTS "assistant_ria - Lecture publique" ON public."assistant_ria";
DROP POLICY IF EXISTS "assistant_ria - Insertion publique" ON public."assistant_ria";
DROP POLICY IF EXISTS "assistant_ria - Écriture admin" ON public."assistant_ria";

-- 3. S'assurer que RLS est activé (mais seulement si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assistant_ria') THEN
    ALTER TABLE "assistant_ria" ENABLE ROW LEVEL SECURITY;

    -- 4. Créer la politique de lecture publique (pour tous)
    CREATE POLICY "assistant_ria - Lecture publique"
      ON "assistant_ria"
      FOR SELECT
      TO public
      USING (true);

    -- 5. Créer la politique d'insertion publique (pour permettre à tous d'insérer des questions)
    CREATE POLICY "assistant_ria - Insertion publique"
      ON "assistant_ria"
      FOR INSERT
      TO public
      WITH CHECK (true);

    -- 6. Créer la politique d'écriture pour les administrateurs (pour modification/suppression)
    CREATE POLICY "assistant_ria - Modification admin"
      ON "assistant_ria"
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    CREATE POLICY "assistant_ria - Suppression admin"
      ON "assistant_ria"
      FOR DELETE
      TO authenticated
      USING (public.is_admin());
  ELSE
    RAISE NOTICE 'La table assistant_ria n''existe pas encore';
  END IF;
END $$;

-- 7. Vérifier les politiques créées
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
  AND tablename = 'assistant_ria'
ORDER BY policyname;

