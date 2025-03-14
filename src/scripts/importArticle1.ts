import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function importArticle1() {
  try {
    // Supprimer l'ancien article 1 s'il existe
    await supabase
      .from('articles_ria')
      .delete()
      .eq('numero', '1')
      .eq('type', 'article')

    // Insérer le nouvel article 1
    const { error } = await supabase
      .from('articles_ria')
      .insert({
        id: 1,
        type: 'article',
        numero: '1',
        titre: 'Article 1 - Objet et champ d\'application',
        contenu: 'Le présent règlement établit:\n\na) des règles harmonisées pour la mise sur le marché, la mise en service et l\'utilisation des systèmes d\'intelligence artificielle (systèmes d\'IA) dans l\'Union;\n\nb) des interdictions de certaines pratiques en matière d\'IA;\n\nc) des exigences spécifiques applicables aux systèmes d\'IA à haut risque et des obligations pour les opérateurs de tels systèmes;\n\nd) des règles harmonisées en matière de transparence pour certains systèmes d\'IA;\n\ne) des règles relatives à la surveillance du marché et à l\'application.',
        chapitre: 'CHAPITRE I - Dispositions générales',
        articles_lies: [],
        mots_cles: []
      })

    if (error) {
      console.error('Erreur lors de l\'insertion de l\'article 1:', error)
      return
    }

    console.log('Article 1 importé avec succès')
  } catch (error) {
    console.error('Erreur:', error)
  }
}

importArticle1() 