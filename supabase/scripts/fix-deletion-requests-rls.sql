-- =============================================================================
-- Corriger les politiques RLS pour deletion_requests
-- Utiliser is_admin_direct() au lieu de is_admin()
-- =============================================================================

-- Supprimer la politique existante
DROP POLICY IF EXISTS "admins_all_deletion_requests" ON public.deletion_requests;

-- Recréer la politique avec is_admin_direct()
CREATE POLICY "admins_all_deletion_requests"
  ON public.deletion_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin_direct() = true)
  WITH CHECK (public.is_admin_direct() = true);

-- Vérifier que la politique est créée
SELECT 
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'deletion_requests'
  AND policyname = 'admins_all_deletion_requests';

