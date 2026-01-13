-- =============================================================================
-- Fonction pour rechercher des documents similaires dans le RAG
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_rag_documents(
  query_embedding vector(1536),
  source_types TEXT[] DEFAULT NULL, -- NULL = tous les types, sinon filtre par types
  match_threshold FLOAT DEFAULT 0.7, -- Seuil de similarité (0-1)
  match_count INTEGER DEFAULT 5 -- Nombre de résultats à retourner
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_type TEXT,
  source_name TEXT,
  source_url TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rd.id,
    rd.content,
    rd.source_type,
    rd.source_name,
    rd.source_url,
    rd.metadata,
    1 - (rd.embedding <=> query_embedding) AS similarity -- <=> est l'opérateur de distance cosine
  FROM public.rag_documents rd
  WHERE 
    rd.embedding IS NOT NULL
    AND (source_types IS NULL OR rd.source_type = ANY(source_types))
    AND (1 - (rd.embedding <=> query_embedding)) >= match_threshold
  ORDER BY rd.embedding <=> query_embedding -- Trier par distance (plus proche = meilleur)
  LIMIT match_count;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.search_rag_documents(vector(1536), TEXT[], FLOAT, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.search_rag_documents IS 
  'Recherche les documents les plus similaires à un embedding donné. Retourne les documents avec leur score de similarité.';

