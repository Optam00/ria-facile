-- =============================================================================
-- Créer la table pour gérer les demandes de suppression de compte
-- =============================================================================

-- 1. Créer la table deletion_requests
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer un index pour améliorer les performances
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON public.deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON public.deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_requested_at ON public.deletion_requests(requested_at DESC);

-- 3. Activer RLS (Row Level Security)
-- =============================================================================
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- =============================================================================

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

-- 5. Créer une fonction pour mettre à jour updated_at automatiquement
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_deletion_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deletion_requests_updated_at
  BEFORE UPDATE ON public.deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_deletion_request_updated_at();

-- 6. Vérification
-- =============================================================================
SELECT '✅ Table deletion_requests créée avec succès !' as message;

-- Afficher la structure de la table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'deletion_requests'
ORDER BY ordinal_position;

