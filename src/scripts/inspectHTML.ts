import axios from 'axios'
import { JSDOM } from 'jsdom'
import fs from 'fs'

const CELEX_ID = '32024R1689'

async function inspectHTML() {
  try {
    console.log('Récupération du HTML d\'EUR-Lex...')
    const eurLexUrl = `https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:${CELEX_ID}`
    const response = await axios.get(eurLexUrl)
    
    if (response.status === 200) {
      // Sauvegarder le HTML pour inspection
      fs.writeFileSync('eurlex.html', response.data)
      console.log('HTML sauvegardé dans eurlex.html')

      const dom = new JSDOM(response.data)
      const document = dom.window.document
      
      // Inspecter la structure
      console.log('\nStructure du document:')
      console.log('Body classes:', document.body.className)
      
      // Chercher des éléments avec la classe oj-normal
      const ojNormalElements = document.querySelectorAll('.oj-normal')
      console.log('\nEléments .oj-normal trouvés:', ojNormalElements.length)
      
      ojNormalElements.forEach((el, index) => {
        console.log(`\nContenu de l'élément .oj-normal #${index + 1}:`)
        console.log(el.textContent?.substring(0, 200))
      })

      // Chercher des éléments spécifiques
      console.log('\nRecherche d\'éléments avec texte spécifique:')
      const allElements = document.querySelectorAll('*')
      let considerantFound = false
      let articleFound = false
      let annexeFound = false

      allElements.forEach(el => {
        const text = el.textContent?.trim()
        if (text) {
          if (text.match(/^\(\d+\)/)) {
            if (!considerantFound) {
              console.log('Premier considérant trouvé:', text.substring(0, 50))
              considerantFound = true
            }
          }
          if (text.startsWith('Article ')) {
            if (!articleFound) {
              console.log('Premier article trouvé:', text.substring(0, 50))
              articleFound = true
            }
          }
          if (text.startsWith('ANNEXE')) {
            if (!annexeFound) {
              console.log('Première annexe trouvée:', text.substring(0, 50))
              annexeFound = true
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Erreur:', error)
  }
}

inspectHTML() 