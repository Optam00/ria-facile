import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConstraints() {
  console.log('Test 1: Insertion avec un titre valide')
  let result = await supabase
    .from('articles_ria')
    .insert({
      titre: 'Test article valide',
      type: 'article',
      contenu: 'Contenu de test',
      numero: 1
    })
  console.log('Résultat test 1:', result.error ? 'Échec' : 'Succès')
  if (result.error) console.log('Erreur:', result.error.message)

  console.log('\nTest 2: Insertion avec un titre vide')
  result = await supabase
    .from('articles_ria')
    .insert({
      titre: '',
      type: 'article',
      contenu: 'Contenu de test',
      numero: 2
    })
  console.log('Résultat test 2:', result.error ? 'Échec (attendu)' : 'Succès (inattendu!)')
  if (result.error) console.log('Erreur:', result.error.message)

  console.log('\nTest 3: Insertion avec un titre contenant uniquement des espaces')
  result = await supabase
    .from('articles_ria')
    .insert({
      titre: '   ',
      type: 'article',
      contenu: 'Contenu de test',
      numero: 3
    })
  console.log('Résultat test 3:', result.error ? 'Échec (attendu)' : 'Succès (inattendu!)')
  if (result.error) console.log('Erreur:', result.error.message)

  console.log('\nTest 4: Insertion avec un type invalide')
  result = await supabase
    .from('articles_ria')
    .insert({
      titre: 'Test type invalide',
      type: 'invalid_type',
      contenu: 'Contenu de test',
      numero: 4
    })
  console.log('Résultat test 4:', result.error ? 'Échec (attendu)' : 'Succès (inattendu!)')
  if (result.error) console.log('Erreur:', result.error.message)
}

testConstraints() 