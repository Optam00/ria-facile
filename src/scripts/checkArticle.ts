import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkArticle(numero: number) {
  const { data, error } = await supabase
    .from('articles_ria')
    .select('*')
    .eq('numero', numero)
    .single()
  
  if (error) {
    console.error('Erreur:', error)
    return
  }
  
  console.log('Article trouvé:')
  console.log(JSON.stringify(data, null, 2))
}

// Vérifier l'article 9 qui a une structure complexe
checkArticle(9) 