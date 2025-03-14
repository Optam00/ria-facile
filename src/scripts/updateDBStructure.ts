import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function updateDBStructure() {
  try {
    // Récupérer les données existantes
    console.log('Récupération des données existantes...')
    const { data: existingData, error: fetchError } = await supabase
      .from('articles_ria')
      .select('*')

    if (fetchError) {
      console.error('Erreur lors de la récupération des données:', fetchError)
      return
    }

    console.log(`${existingData?.length || 0} articles trouvés`)

    // Mettre à jour les données avec la nouvelle structure
    console.log('Mise à jour des données...')
    for (const article of existingData || []) {
      const sectionMatch = article.titre_section?.match(/^SECTION\s+(\d+)(?:\s*[-–]\s*(.+))?/)
      const chapterTitle = article.chapitre?.includes('-') 
        ? article.chapitre.split('-')[1].trim()
        : article.chapitre

      const { error: updateError } = await supabase
        .from('articles_ria')
        .update({
          section_numero: sectionMatch ? `Section ${sectionMatch[1]}` : '',
          chapitre_titre: chapterTitle
        })
        .eq('id', article.id)

      if (updateError) {
        console.error(`Erreur lors de la mise à jour de l'article ${article.id}:`, updateError)
        return
      }
    }

    console.log('Mise à jour terminée avec succès!')
  } catch (error) {
    console.error('Erreur inattendue:', error)
  }
}

updateDBStructure() 