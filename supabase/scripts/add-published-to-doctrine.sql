-- =============================================================================
-- Script pour ajouter la colonne published à la table doctrine
-- (Permet de publier ou mettre en brouillon les articles, comme pour les fiches pratiques)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'doctrine'
    AND column_name = 'published'
  ) THEN
    ALTER TABLE public.doctrine
    ADD COLUMN published BOOLEAN DEFAULT true;

    -- Les articles existants restent visibles (publiés)
    UPDATE public.doctrine SET published = true WHERE published IS NULL;

    RAISE NOTICE 'Colonne published ajoutée à la table doctrine';
  ELSE
    RAISE NOTICE 'La colonne published existe déjà dans la table doctrine';
  END IF;
END $$;

COMMENT ON COLUMN public.doctrine.published IS 'Indique si l''article est publié (true) ou en brouillon (false). Les brouillons ne sont visibles que dans l''admin.';
