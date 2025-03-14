-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create visas table
CREATE TABLE IF NOT EXISTS visas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contenu TEXT NOT NULL,
    ordre INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create considerants table
CREATE TABLE IF NOT EXISTS considerants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL,
    contenu TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(numero)
);

-- Create chapitres table
CREATE TABLE IF NOT EXISTS chapitres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_roman TEXT NOT NULL,
    numero INTEGER NOT NULL,
    titre TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(numero),
    UNIQUE(numero_roman)
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL,
    titre TEXT NOT NULL,
    chapitre_id UUID NOT NULL REFERENCES chapitres(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(numero, chapitre_id)
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL,
    titre TEXT NOT NULL,
    contenu TEXT,
    chapitre_id UUID NOT NULL REFERENCES chapitres(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(numero)
);

-- Create subdivisions_article table
CREATE TABLE IF NOT EXISTS subdivisions_article (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    niveau INTEGER NOT NULL, -- 1 pour chiffres, 2 pour lettres, 3 pour chiffres romains
    numero TEXT NOT NULL,
    contenu TEXT NOT NULL,
    parent_id UUID REFERENCES subdivisions_article(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create annexes table
CREATE TABLE IF NOT EXISTS annexes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_roman TEXT NOT NULL,
    numero INTEGER NOT NULL,
    titre TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(numero),
    UNIQUE(numero_roman)
);

-- Create sections_annexe table
CREATE TABLE IF NOT EXISTS sections_annexe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lettre TEXT NOT NULL,
    titre TEXT NOT NULL,
    annexe_id UUID NOT NULL REFERENCES annexes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lettre, annexe_id)
);

-- Create contenu_annexe table
CREATE TABLE IF NOT EXISTS contenu_annexe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    annexe_id UUID NOT NULL REFERENCES annexes(id) ON DELETE CASCADE,
    section_annexe_id UUID REFERENCES sections_annexe(id) ON DELETE SET NULL,
    niveau INTEGER NOT NULL,
    numero TEXT NOT NULL,
    contenu TEXT NOT NULL,
    parent_id UUID REFERENCES contenu_annexe(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_chapitre ON articles(chapitre_id);
CREATE INDEX IF NOT EXISTS idx_articles_section ON articles(section_id);
CREATE INDEX IF NOT EXISTS idx_sections_chapitre ON sections(chapitre_id);
CREATE INDEX IF NOT EXISTS idx_subdivisions_article ON subdivisions_article(article_id);
CREATE INDEX IF NOT EXISTS idx_sections_annexe ON sections_annexe(annexe_id);
CREATE INDEX IF NOT EXISTS idx_contenu_annexe_annexe ON contenu_annexe(annexe_id);
CREATE INDEX IF NOT EXISTS idx_contenu_annexe_section ON contenu_annexe(section_annexe_id); 