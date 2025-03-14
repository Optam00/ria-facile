import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkData() {
  try {
    // Récupérer un échantillon de chaque type
    const types = ['article', 'considerant', 'annexe']
    
    for (const type of types) {
      console.log(`\nVérification des ${type}s:`)
      
      // Compter le nombre d'éléments
      const { count } = await supabase
        .from('articles_ria')
        .select('*', { count: 'exact', head: true })
        .eq('type', type)

      console.log(`Nombre de ${type}s: ${count}`)

      // Récupérer un exemple
      const { data: example } = await supabase
        .from('articles_ria')
        .select('*')
        .eq('type', type)
        .limit(1)
        .single()

      if (example) {
        console.log('\nExemple:')
        console.log('ID:', example.id)
        console.log('Numéro:', example.numero)
        console.log('Titre:', example.titre)
        console.log('Chapitre:', example.chapitre || 'Aucun')
        console.log('Contenu (début):', example.contenu?.substring(0, 200), '...')
        console.log('Articles liés:', example.articles_lies)
        console.log('Mots-clés:', example.mots_cles)
      } else {
        console.log('Aucun exemple trouvé')
      }
    }

  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
  }
}

checkData() 