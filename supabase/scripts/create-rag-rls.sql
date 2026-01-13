-- =============================================================================
-- Script pour créer les politiques RLS pour la table rag_documents
-- =============================================================================

-- Activer RLS sur la table
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admins can manage all rag documents" ON public.rag_documents;
DROP POLICY IF EXISTS "Authenticated users can read rag documents" ON public.rag_documents;

-- Politique : Les admins peuvent tout faire (CRUD)
CREATE POLICY "Admins can manage all rag documents"
  ON public.rag_documents
  FOR ALL
  TO authenticated
  USING (public.is_admin_direct() = true)
  WITH CHECK (public.is_admin_direct() = true);

-- Politique : Les utilisateurs authentifiés peuvent lire les documents
-- (nécessaire pour la recherche vectorielle)
CREATE POLICY "Authenticated users can read rag documents"
  ON public.rag_documents
  FOR SELECT
  TO authenticated
  USING (true); -- Tous les utilisateurs authentifiés peuvent lire

-- Note : Pour l'insertion/update/delete, seuls les admins peuvent le faire
-- via la politique admin ci-dessus

COMMENT ON POLICY "Admins can manage all rag documents" ON public.rag_documents IS 
  'Les administrateurs peuvent créer, modifier et supprimer des documents RAG';
COMMENT ON POLICY "Authenticated users can read rag documents" ON public.rag_documents IS 
  'Tous les utilisateurs authentifiés peuvent lire les documents pour la recherche RAG';

