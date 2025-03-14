import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as pdf from 'pdf-parse'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface Article {
  numero: number
  titre: string
  contenu: string
  chapitre_id: string | null
  section_id: string | null
}

async function extractArticlesFromPDF(): Promise<Article[]> {
  const dataBuffer = fs.readFileSync('reglement_ia.pdf')
  const data = await pdf(dataBuffer)
  
  const articles: Article[] = []
  const text = data.text
  
  // Diviser le texte en lignes
  const lines = text.split('\n')
  
  let currentArticle: Article | null = null
  let contentBuffer = []
  
  for (const line of lines) {
    // Détecter le début d'un nouvel article
    const articleMatch = line.match(/Article (\d+)([^-]*)-(.*)/)
    
    if (articleMatch) {
      // Si on avait un article en cours, on le sauvegarde
      if (currentArticle) {
        currentArticle.contenu = contentBuffer.join('\n').trim()
        articles.push(currentArticle)
        contentBuffer = []
      }
      
      // Créer un nouvel article
      currentArticle = {
        numero: parseInt(articleMatch[1]),
        titre: articleMatch[3].trim(),
        contenu: '',
        chapitre_id: null,
        section_id: null
      }
    } else if (currentArticle) {
      // Ajouter la ligne au contenu de l'article en cours
      contentBuffer.push(line.trim())
    }
  }
  
  // Ne pas oublier le dernier article
  if (currentArticle) {
    currentArticle.contenu = contentBuffer.join('\n').trim()
    articles.push(currentArticle)
  }
  
  return articles
}

async function main() {
  try {
    console.log('Début de l\'extraction depuis le PDF...')
    
    const articles = await extractArticlesFromPDF()
    
    console.log(`\nExtraction terminée : ${articles.length} articles trouvés`)
    
    // Insert articles
    console.log('\nInsertion des articles...')
    for (const article of articles) {
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
      
      if (error) {
        console.error(`Erreur lors de l'insertion de l'article ${article.numero}:`, error)
      } else {
        console.log(`Article ${article.numero} inséré avec succès`)
      }
    }
    
    console.log('\nImportation terminée !')
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

main() 