import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function executeSQL() {
  try {
    const sqlContent = fs.readFileSync(
      path.join(process.cwd(), 'src/scripts/updateDBStructure.sql'),
      'utf8'
    )

    const { error } = await supabase.rpc('execute_sql', {
      sql_query: sqlContent
    })

    if (error) {
      console.error('Erreur lors de l\'exécution du SQL:', error)
      return
    }

    console.log('Script SQL exécuté avec succès!')
  } catch (error) {
    console.error('Erreur inattendue:', error)
  }
}

executeSQL() 