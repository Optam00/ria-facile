import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  try {
    // Supprimer la table si elle existe
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: 'DROP TABLE IF EXISTS corps_texte;'
    })
    
    if (dropError) {
      console.error('Erreur lors de la suppression de la table:', dropError)
      return
    }
    
    // Créer la table avec la bonne structure
    const createTableSQL = `
      CREATE TABLE corps_texte (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT NOT NULL DEFAULT 'article',
        numero TEXT NOT NULL,
        titre TEXT NOT NULL,
        contenu TEXT NOT NULL,
        articles_lies TEXT[] DEFAULT '{}',
        mots_cles TEXT[] DEFAULT '{}',
        chapitre TEXT NOT NULL,
        chapitre_titre TEXT NOT NULL,
        section_numero TEXT DEFAULT 'N/A',
        section_titre TEXT DEFAULT 'N/A',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT numero_unique UNIQUE (numero),
        CONSTRAINT section_numero_check CHECK (
            (section_numero = 'N/A' AND section_titre = 'N/A') OR
            (section_numero != 'N/A' AND section_titre != 'N/A')
        )
      );
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    })
    
    if (createError) {
      console.error('Erreur lors de la création de la table:', createError)
      return
    }
    
    console.log('Migration appliquée avec succès !')
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

applyMigration() 