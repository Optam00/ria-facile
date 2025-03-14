import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixTypes() {
  // Mettre à jour tous les 'invalid_type' en 'article'
  const { data, error } = await supabase
    .from('articles_ria')
    .update({ type: 'article' })
    .eq('type', 'invalid_type')

  if (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return
  }

  console.log('Mise à jour effectuée avec succès')
}

fixTypes() 