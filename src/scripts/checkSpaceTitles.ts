import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSpaceTitles() {
  const { data, error } = await supabase
    .from('articles_ria')
    .select('id, titre')
    .filter('titre', 'neq', null)
    .filter('titre', 'neq', '')

  if (error) {
    console.error('Erreur:', error)
    return
  }

  // Trouver les titres qui ne contiennent que des espaces
  const spaceTitles = data?.filter(item => item.titre.trim().length === 0)
  if (spaceTitles && spaceTitles.length > 0) {
    console.log('Articles avec des titres contenant uniquement des espaces:', spaceTitles)
  } else {
    console.log('Aucun article avec un titre contenant uniquement des espaces trouvé')
  }
}

checkSpaceTitles() 