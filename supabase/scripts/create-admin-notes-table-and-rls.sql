-- =============================================================================
-- Table admin_notes : notes perso / to-do / brouillons (ex. LinkedIn) par admin
-- Une ligne par utilisateur (user_id). RLS : chaque utilisateur voit et modifie
-- uniquement sa propre ligne.
-- =============================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.admin_notes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  todo jsonb NOT NULL DEFAULT '[]',
  linkedin text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_notes IS 'Notes personnelles des admins (notes, to-do, brouillons LinkedIn). Une ligne par utilisateur.';
COMMENT ON COLUMN public.admin_notes.notes IS 'Zone notes libres';
COMMENT ON COLUMN public.admin_notes.todo IS 'Liste to-do : tableau JSON [{ "id": "uuid", "text": "libellé", "done": false }, ...]';
COMMENT ON COLUMN public.admin_notes.linkedin IS 'Brouillons (ex. posts LinkedIn)';
COMMENT ON COLUMN public.admin_notes.updated_at IS 'Dernière mise à jour';

-- 2. RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Lecture : uniquement sa propre ligne
DROP POLICY IF EXISTS "admin_notes - Lecture propre" ON public.admin_notes;
CREATE POLICY "admin_notes - Lecture propre"
  ON public.admin_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insertion : uniquement sa propre ligne (création au premier enregistrement)
DROP POLICY IF EXISTS "admin_notes - Insertion propre" ON public.admin_notes;
CREATE POLICY "admin_notes - Insertion propre"
  ON public.admin_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Mise à jour : uniquement sa propre ligne
DROP POLICY IF EXISTS "admin_notes - Mise à jour propre" ON public.admin_notes;
CREATE POLICY "admin_notes - Mise à jour propre"
  ON public.admin_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : uniquement sa propre ligne (optionnel, pour réinitialiser)
DROP POLICY IF EXISTS "admin_notes - Suppression propre" ON public.admin_notes;
CREATE POLICY "admin_notes - Suppression propre"
  ON public.admin_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.admin_notes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_notes_updated_at ON public.admin_notes;
CREATE TRIGGER admin_notes_updated_at
  BEFORE UPDATE ON public.admin_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.admin_notes_updated_at();

SELECT 'Table admin_notes créée et politiques RLS appliquées.' AS message;
