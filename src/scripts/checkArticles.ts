import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkArticles() {
  const { data, error } = await supabase
    .from('articles_ria')
    .select('*')
    .order('numero')
  
  if (error) {
    console.error('Erreur:', error)
    return
  }
  
  console.log(`Nombre d'articles trouvés: ${data?.length || 0}`)
  if (data && data.length > 0) {
    console.log('\nPremier article:')
    console.log(JSON.stringify(data[0], null, 2))
  }
}

checkArticles() 