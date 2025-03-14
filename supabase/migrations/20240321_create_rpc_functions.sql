-- Fonction pour supprimer la table corps_texte si elle existe
CREATE OR REPLACE FUNCTION drop_corps_texte_if_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DROP TABLE IF EXISTS corps_texte;
END;
$$;

-- Fonction pour créer la table corps_texte avec la bonne structure
CREATE OR REPLACE FUNCTION create_corps_texte_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE corps_texte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL DEFAULT 'article',
    numero TEXT NOT NULL,
    titre TEXT NOT NULL,
    contenu TEXT NOT NULL,
    mots_cles TEXT[] DEFAULT '{}',
    chapitre TEXT NOT NULL,
    chapitre_titre TEXT NOT NULL,
    section_numero TEXT DEFAULT 'N/A',
    section_titre TEXT DEFAULT 'N/A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes pour assurer l'intégrité des données
    CONSTRAINT numero_unique UNIQUE (numero),
    CONSTRAINT section_numero_check CHECK (
        (section_numero = 'N/A' AND section_titre = 'N/A') OR
        (section_numero != 'N/A' AND section_titre != 'N/A')
    )
  );
END;
$$; 