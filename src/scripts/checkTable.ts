import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkTable() {
  try {
    // Récupérer la structure de la table
    const { data, error } = await supabase
      .rpc('get_table_info', { table_name: 'articles_ria' })

    if (error) {
      console.error('Erreur:', error)
      return
    }

    console.log('Structure de la table articles_ria:')
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
  }
}

checkTable() 