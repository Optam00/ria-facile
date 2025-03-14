import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testDatabase() {
  try {
    console.log('Test 1: Insertion valide')
    const { data: test1, error: error1 } = await supabase
      .from('articles_ria')
      .insert({
        type: 'article',
        numero: '1',
        titre: 'Article 1 - Test',
        contenu: 'Ceci est un contenu de test',
        chapitre: 'Chapitre 1',
        titre_section: 'Section 1',
        articles_lies: [],
        mots_cles: ['test', 'validation']
      })
      .select()
    
    if (error1) {
      console.error('Test 1 a échoué:', error1.message)
    } else {
      console.log('Test 1 réussi:', test1)
    }

    console.log('\nTest 2: Test avec titre vide (devrait échouer)')
    const { data: test2, error: error2 } = await supabase
      .from('articles_ria')
      .insert({
        type: 'article',
        numero: '2',
        titre: '',
        contenu: 'Test contenu'
      })
      .select()
    
    if (error2) {
      console.log('Test 2 a échoué comme prévu:', error2.message)
    } else {
      console.error('Test 2 aurait dû échouer mais a réussi:', test2)
    }

    console.log('\nTest 3: Test avec type invalide (devrait échouer)')
    const { data: test3, error: error3 } = await supabase
      .from('articles_ria')
      .insert({
        type: 'invalid_type',
        numero: '3',
        titre: 'Test titre',
        contenu: 'Test contenu'
      })
      .select()
    
    if (error3) {
      console.log('Test 3 a échoué comme prévu:', error3.message)
    } else {
      console.error('Test 3 aurait dû échouer mais a réussi:', test3)
    }

    console.log('\nTest 4: Test avec contenu NULL (devrait échouer)')
    const { data: test4, error: error4 } = await supabase
      .from('articles_ria')
      .insert({
        type: 'article',
        numero: '4',
        titre: 'Test titre',
        contenu: null
      })
      .select()
    
    if (error4) {
      console.log('Test 4 a échoué comme prévu:', error4.message)
    } else {
      console.error('Test 4 aurait dû échouer mais a réussi:', test4)
    }

    console.log('\nTest 5: Test avec arrays')
    const { data: test5, error: error5 } = await supabase
      .from('articles_ria')
      .insert({
        type: 'article',
        numero: '5',
        titre: 'Test arrays',
        contenu: 'Test contenu',
        articles_lies: [1, 2],
        mots_cles: ['mot1', 'mot2']
      })
      .select()
    
    if (error5) {
      console.error('Test 5 a échoué:', error5.message)
    } else {
      console.log('Test 5 réussi:', test5)
    }

  } catch (error) {
    console.error('Erreur générale:', error)
  }
}

testDatabase() 