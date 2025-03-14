-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the corps_texte table
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

-- Index potentiels à activer si nécessaire
-- CREATE INDEX idx_corps_texte_chapitre ON corps_texte(chapitre);
-- CREATE INDEX idx_corps_texte_section ON corps_texte(section_numero) WHERE section_numero != 'N/A';
-- CREATE INDEX idx_corps_texte_numero ON corps_texte(numero);
-- CREATE INDEX idx_corps_texte_full ON corps_texte(chapitre, section_numero, numero); 