import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkContent() {
  try {
    const { data, error } = await supabase
      .from('articles_ria')
      .select('id, type, numero, titre, contenu, chapitre, titre_section')
      .order('numero')

    if (error) {
      console.error('Erreur:', error)
      return
    }

    console.log('Analyse du contenu de la table articles_ria:')
    data?.forEach(article => {
      console.log('\n-------------------')
      console.log(`ID: ${article.id}`)
      console.log(`Type: ${article.type}`)
      console.log(`Numéro: ${article.numero}`)
      console.log(`Titre: ${article.titre}`)
      console.log(`Début du contenu: ${article.contenu.substring(0, 100)}...`)
      console.log(`Chapitre: ${article.chapitre || 'Non défini'}`)
      console.log(`Section: ${article.titre_section || 'Non défini'}`)
    })

  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
  }
}

checkContent() 