import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTitles() {
  const { data, error } = await supabase
    .from('articles_ria')
    .select('id, titre')
    .or('titre.eq.,titre.is.null')

  if (error) {
    console.error('Erreur:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Articles avec des titres vides ou null:', data)
  } else {
    console.log('Aucun article avec un titre vide ou null trouvé')
  }
}

checkTitles() 