import { supabase } from '@/lib/supabase'

const afficherStructure = async () => {
  // Récupérer les chapitres
  const { data: chapitres, error: chapitresError } = await supabase
    .from('chapitre')
    .select('id_chapitre, titre')
    .order('id_chapitre')

  if (chapitresError) {
    console.error('Erreur chapitres:', chapitresError)
    return
  }

  // Récupérer les sections
  const { data: sections, error: sectionsError } = await supabase
    .from('section')
    .select('id, titre, id_chapitre')
    .order('id')

  if (sectionsError) {
    console.error('Erreur sections:', sectionsError)
    return
  }

  // Afficher la structure
  chapitres.forEach(chapitre => {
    console.log(`\nChapitre ${chapitre.id_chapitre}: ${chapitre.titre}`)
    const sectionsduChapitre = sections.filter(s => s.id_chapitre === chapitre.id_chapitre)
    if (sectionsduChapitre.length > 0) {
      console.log('Sections:')
      sectionsduChapitre.forEach(section => {
        console.log(`  - ${section.titre}`)
      })
    } else {
      console.log('  (Pas de sections)')
    }
  })
}

afficherStructure() 