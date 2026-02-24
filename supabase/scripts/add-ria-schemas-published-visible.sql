-- =============================================================================
-- Ajout published + visible_to sur ria_schemas et mise à jour des politiques RLS
-- =============================================================================

-- 1. Nouvelles colonnes
ALTER TABLE public.ria_schemas
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visible_to TEXT NOT NULL DEFAULT 'all' CHECK (visible_to IN ('all', 'members'));

COMMENT ON COLUMN public.ria_schemas.published IS 'Si false, le schéma n''est affiché nulle part (admin peut le voir)';
COMMENT ON COLUMN public.ria_schemas.visible_to IS 'all = tout le monde, members = adhérents uniquement';

-- 2. Remplacer la politique de lecture publique par des politiques conditionnelles

DROP POLICY IF EXISTS "ria_schemas - Lecture publique" ON public.ria_schemas;

-- Visiteurs non connectés : uniquement publiés et visibles par tous
CREATE POLICY "ria_schemas - Lecture anon"
  ON public.ria_schemas
  FOR SELECT
  TO anon
  USING (published = true AND visible_to = 'all');

-- Utilisateurs connectés (adhérents ou admins) : publiés et (all ou members)
-- Les admins voient tout via la politique suivante
CREATE POLICY "ria_schemas - Lecture authentifié"
  ON public.ria_schemas
  FOR SELECT
  TO authenticated
  USING (
    published = true AND (visible_to = 'all' OR visible_to = 'members')
  );

-- Admins : voir tous les schémas (y compris non publiés) pour la gestion
CREATE POLICY "ria_schemas - Lecture admin"
  ON public.ria_schemas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Les politiques INSERT/UPDATE/DELETE existantes restent inchangées (réservées aux admins).

SELECT 'Colonnes published et visible_to ajoutées, politiques RLS mises à jour.' AS message;
