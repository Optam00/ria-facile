-- =============================================================================
-- Créer UNIQUEMENT les politiques RLS pour deletion_requests
-- (Si la table existe déjà mais pas les politiques)
-- =============================================================================

-- Supprimer les anciennes politiques si elles existent (pour éviter les doublons)
DROP POLICY IF EXISTS "users_can_create_own_deletion_request" ON public.deletion_requests;
DROP POLICY IF EXISTS "users_can_view_own_deletion_request" ON public.deletion_requests;
DROP POLICY IF EXISTS "users_can_cancel_own_deletion_request" ON public.deletion_requests;
DROP POLICY IF EXISTS "admins_all_deletion_requests" ON public.deletion_requests;

-- Les utilisateurs peuvent créer leur propre demande de suppression
CREATE POLICY "users_can_create_own_deletion_request"
  ON public.deletion_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent voir leur propre demande
CREATE POLICY "users_can_view_own_deletion_request"
  ON public.deletion_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent annuler leur propre demande (si elle est encore pending)
CREATE POLICY "users_can_cancel_own_deletion_request"
  ON public.deletion_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- Les admins peuvent tout faire sur toutes les demandes
CREATE POLICY "admins_all_deletion_requests"
  ON public.deletion_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Vérification
SELECT '✅ Politiques RLS créées avec succès !' as message;

SELECT 
  policyname, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'deletion_requests' 
ORDER BY policyname;

