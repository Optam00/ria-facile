-- =============================================================================
-- Table homepage_linkedin_posts : historique des posts LinkedIn mis en avant
-- sur la page d'accueil (et listés sur une page dédiée).
--
-- - Stocke un "embed_input" : soit une URL de post LinkedIn, soit le code
--   d'intégration <iframe ...> (ou src) collé par l'admin.
-- - Le dernier en date (created_at desc) est affiché sur la homepage.
-- - Les admins peuvent ajouter / supprimer des entrées via la console.
-- =============================================================================

-- Helper (si pas encore présent) pour les politiques RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Table
CREATE TABLE IF NOT EXISTS public.homepage_linkedin_posts (
  id BIGSERIAL PRIMARY KEY,
  embed_input TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_linkedin_posts_created_at
  ON public.homepage_linkedin_posts (created_at DESC);

-- 2. RLS
ALTER TABLE public.homepage_linkedin_posts ENABLE ROW LEVEL SECURITY;

-- Lecture publique (homepage + page publique d'historique)
DROP POLICY IF EXISTS "homepage_linkedin_posts - Lecture publique" ON public.homepage_linkedin_posts;
CREATE POLICY "homepage_linkedin_posts - Lecture publique"
  ON public.homepage_linkedin_posts
  FOR SELECT
  TO public
  USING (true);

-- Écriture admin
DROP POLICY IF EXISTS "homepage_linkedin_posts - Insert admin" ON public.homepage_linkedin_posts;
CREATE POLICY "homepage_linkedin_posts - Insert admin"
  ON public.homepage_linkedin_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "homepage_linkedin_posts - Update admin" ON public.homepage_linkedin_posts;
CREATE POLICY "homepage_linkedin_posts - Update admin"
  ON public.homepage_linkedin_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Suppression admin
DROP POLICY IF EXISTS "homepage_linkedin_posts - Delete admin" ON public.homepage_linkedin_posts;
CREATE POLICY "homepage_linkedin_posts - Delete admin"
  ON public.homepage_linkedin_posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

SELECT 'Table homepage_linkedin_posts créée et politiques RLS appliquées.' AS message;

