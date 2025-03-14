-- Suppression des tables si elles existent déjà
DROP TABLE IF EXISTS ria_subdivisions;
DROP TABLE IF EXISTS ria_structure;
DROP TABLE IF EXISTS ria_preambule;
DROP TABLE IF EXISTS ria_annexes;

-- Table pour le préambule
CREATE TABLE ria_preambule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('visa', 'considerant')),
    numero INTEGER,
    contenu TEXT NOT NULL,
    ordre INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_numero CHECK (
        (type = 'visa' AND numero IS NULL) OR
        (type = 'considerant' AND numero IS NOT NULL)
    )
);

-- Table pour la structure principale
CREATE TABLE ria_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('chapitre', 'section', 'article')),
    numero TEXT NOT NULL,
    titre TEXT,
    contenu TEXT,
    parent_id UUID REFERENCES ria_structure(id),
    niveau INTEGER NOT NULL CHECK (niveau BETWEEN 1 AND 3),
    ordre INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les subdivisions d'articles
CREATE TABLE ria_subdivisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES ria_structure(id),
    niveau INTEGER NOT NULL CHECK (niveau BETWEEN 1 AND 3),
    numero TEXT NOT NULL,
    contenu TEXT NOT NULL,
    ordre INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les annexes
CREATE TABLE ria_annexes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero TEXT NOT NULL,
    titre TEXT,
    contenu TEXT,
    parent_id UUID REFERENCES ria_annexes(id),
    niveau INTEGER NOT NULL CHECK (niveau IN (1, 2)),
    ordre INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création des index pour améliorer les performances
CREATE INDEX idx_ria_preambule_type ON ria_preambule(type);
CREATE INDEX idx_ria_structure_parent ON ria_structure(parent_id);
CREATE INDEX idx_ria_structure_type ON ria_structure(type);
CREATE INDEX idx_ria_subdivisions_article ON ria_subdivisions(article_id);
CREATE INDEX idx_ria_annexes_parent ON ria_annexes(parent_id); 