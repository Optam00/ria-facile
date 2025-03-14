import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkArticles() {
  try {
    // Récupérer tous les articles avec leurs sections
    const { data: articles, error } = await supabase
      .from('articles_ria')
      .select('*')
      .order('numero')

    if (error) {
      console.error('Erreur lors de la récupération des articles:', error)
      return
    }

    // Organiser les sections par chapitre
    const chapitres = new Map<string, Map<string, Set<string>>>()
    
    articles.forEach(article => {
      if (!article.chapitre) return

      if (!chapitres.has(article.chapitre)) {
        chapitres.set(article.chapitre, new Map())
      }

      const sections = chapitres.get(article.chapitre)!
      if (article.section_numero) {
        if (!sections.has(article.section_numero)) {
          sections.set(article.section_numero, new Set())
        }
        sections.get(article.section_numero)!.add(article.titre_section)
      }
    })

    // Afficher la structure
    console.log('=== Structure du règlement ===\n')
    chapitres.forEach((sections, chapitre) => {
      console.log(`${chapitre}`)
      sections.forEach((titres, section) => {
        titres.forEach(titre => {
          console.log(`  ${section}${titre ? ` - ${titre}` : ''}`)
        })
      })
      console.log()
    })

  } catch (error) {
    console.error('Erreur inattendue:', error)
  }
}

checkArticles() 