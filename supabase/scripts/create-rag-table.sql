-- =============================================================================
-- Script pour créer la table RAG avec support pgvector
-- =============================================================================

-- Activer l'extension pgvector si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS vector;

-- Créer la table pour stocker les documents et leurs embeddings
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- 1536 dimensions pour OpenAI text-embedding-3-small
  source_type TEXT NOT NULL CHECK (source_type IN ('reglement', 'lignes_directrices', 'jurisprudence')),
  source_name TEXT, -- Ex: "RIA Article 5", "Ligne directrice 2024/01", etc.
  source_url TEXT, -- URL ou référence du document source
  metadata JSONB, -- Métadonnées supplémentaires (date, auteur, etc.)
  chunk_index INTEGER, -- Index du chunk dans le document original
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Créer un index pour la recherche vectorielle (HNSW est plus performant pour la recherche)
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx 
ON public.rag_documents 
USING hnsw (embedding vector_cosine_ops);

-- Créer un index pour filtrer par source_type
CREATE INDEX IF NOT EXISTS rag_documents_source_type_idx 
ON public.rag_documents (source_type);

-- Créer un index pour la recherche textuelle (optionnel, pour hybrid search)
CREATE INDEX IF NOT EXISTS rag_documents_content_idx 
ON public.rag_documents 
USING gin (to_tsvector('french', content));

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_rag_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS rag_documents_updated_at_trigger ON public.rag_documents;
CREATE TRIGGER rag_documents_updated_at_trigger
  BEFORE UPDATE ON public.rag_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_rag_documents_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE public.rag_documents IS 'Table pour stocker les documents et leurs embeddings pour le système RAG';
COMMENT ON COLUMN public.rag_documents.embedding IS 'Embedding vectoriel généré avec OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN public.rag_documents.source_type IS 'Type de source : reglement, lignes_directrices, ou jurisprudence';
COMMENT ON COLUMN public.rag_documents.chunk_index IS 'Index du chunk dans le document original (pour préserver l''ordre)';

