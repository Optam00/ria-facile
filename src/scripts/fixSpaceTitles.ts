import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSpaceTitles() {
  const { data, error } = await supabase
    .from('articles_ria')
    .update({ titre: 'Article sans titre' })
    .eq('id', 11)

  if (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return
  }

  console.log('Mise à jour effectuée avec succès')
}

fixSpaceTitles() 