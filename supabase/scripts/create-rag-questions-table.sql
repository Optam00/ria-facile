-- Création de la table rag_questions pour stocker les questions posées dans le RAG
-- Structure similaire à assistant_ria mais avec un champ supplémentaire pour les sources

CREATE TABLE IF NOT EXISTS public.rag_questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- Tableau des sources utilisées (reglement, lignes_directrices, jurisprudence)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur created_at pour améliorer les performances des requêtes de tri
CREATE INDEX IF NOT EXISTS idx_rag_questions_created_at ON public.rag_questions(created_at DESC);

-- Activer RLS
ALTER TABLE public.rag_questions ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour rendre le script idempotent)
DROP POLICY IF EXISTS "rag_questions - Lecture publique" ON public.rag_questions;
DROP POLICY IF EXISTS "rag_questions - Insertion publique" ON public.rag_questions;
DROP POLICY IF EXISTS "rag_questions - Modification admin" ON public.rag_questions;
DROP POLICY IF EXISTS "rag_questions - Suppression admin" ON public.rag_questions;

-- Politique de lecture publique (pour tous)
CREATE POLICY "rag_questions - Lecture publique"
  ON public.rag_questions
  FOR SELECT
  TO public
  USING (true);

-- Politique d'insertion publique (pour permettre à tous d'insérer des questions)
CREATE POLICY "rag_questions - Insertion publique"
  ON public.rag_questions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Politique de modification pour les administrateurs
CREATE POLICY "rag_questions - Modification admin"
  ON public.rag_questions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_direct())
  WITH CHECK (public.is_admin_direct());

-- Politique de suppression pour les administrateurs
CREATE POLICY "rag_questions - Suppression admin"
  ON public.rag_questions
  FOR DELETE
  TO authenticated
  USING (public.is_admin_direct());

