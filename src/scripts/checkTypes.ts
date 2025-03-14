import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTypes() {
  const { data, error } = await supabase
    .from('articles_ria')
    .select('type')

  if (error) {
    console.error('Erreur:', error)
    return
  }

  // Obtenir les types uniques
  const uniqueTypes = [...new Set(data?.map(item => item.type))]
  console.log('Types actuels dans la base:', uniqueTypes)
}

checkTypes() 