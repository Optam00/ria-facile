import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { JSDOM } from 'jsdom'

dotenv.config()

const CELEX_ID = '32024R1689'
const EUR_LEX_URL = `https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:${CELEX_ID}`

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

interface Article {
  id: number
  type: string
  numero: string
  titre: string
  contenu: string
  chapitre?: string
  articles_lies: number[]
  mots_cles: string[]
}

function cleanContent(content: string): string {
  // Supprimer les lignes vides consécutives
  const cleaned = content
    .split('\n')
    .map(line => line.trim())
    .filter((line, index, array) => {
      // Garder la ligne si elle n'est pas vide et n'est pas un doublon de la ligne précédente
      return line && line !== array[index - 1]
    })
    .join('\n')

  // Tronquer à 50000 caractères si nécessaire
  if (cleaned.length > 50000) {
    return cleaned.substring(0, 49997) + '...'
  }

  return cleaned
}

function parseEurLexHTML(html: string): Article[] {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const articles: Article[] = []
  let currentId = 1

  // Trouver tous les éléments de contenu
  const elements = Array.from(document.querySelectorAll('p, div'))
  let currentChapter = ''

  // Parcourir tous les éléments pour trouver les considérants, articles et annexes
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const text = element.textContent?.trim() || ''

    // Détecter les chapitres
    const chapterMatch = text.match(/^CHAPITRE\s+([IVX]+)(?:\s+(.+))?/)
    if (chapterMatch) {
      currentChapter = chapterMatch[2]
        ? `CHAPITRE ${chapterMatch[1]} - ${chapterMatch[2].trim()}`
        : `CHAPITRE ${chapterMatch[1]}`
      continue
    }

    // Détecter les considérants
    if (text.match(/^\(\d+\)/)) {
      const numeroMatch = text.match(/^\((\d+)\)/)
      if (numeroMatch) {
        const contenu = text.replace(/^\(\d+\)\s*/, '').trim()
        if (contenu) {
          articles.push({
            id: currentId++,
            type: 'considerant',
            numero: numeroMatch[1],
            titre: `Considérant ${numeroMatch[1]}`,
            contenu: contenu,
            chapitre: 'Considérants',
            articles_lies: [],
            mots_cles: []
          })
        }
      }
      continue
    }

    // Détecter les articles
    const articleMatch = text.match(/^Article\s+(\d+)(?:\s*[-–]\s*(.+))?/)
    if (articleMatch) {
      const articleNumber = articleMatch[1]
      let titre = articleMatch[2] 
        ? `Article ${articleNumber} - ${articleMatch[2].trim()}`
        : `Article ${articleNumber}`
      
      let articleContent = ''
      let j = i + 1

      // Récupérer le contenu jusqu'au prochain article, chapitre ou annexe
      while (j < elements.length) {
        const nextElement = elements[j]
        const nextText = nextElement.textContent?.trim() || ''
        
        // Si on trouve un nouveau titre d'article, chapitre ou annexe, on s'arrête
        if (nextText.match(/^(Article\s+\d+|CHAPITRE\s+[IVX]+|ANNEXE\s+[IVXLCDM]+)/)) {
          break
        }
        
        // Si le texte n'est pas vide et n'est pas un titre d'article
        if (nextText && !nextText.match(/^Article\s+\d+/)) {
          articleContent += (articleContent ? '\n' : '') + nextText
        }
        j++
      }

      // Nettoyer le contenu
      const cleanedContent = cleanContent(articleContent)

      // N'ajouter l'article que s'il a du contenu
      if (cleanedContent) {
        articles.push({
          id: currentId++,
          type: 'article',
          numero: articleNumber,
          titre: titre,
          contenu: cleanedContent,
          chapitre: currentChapter || undefined,
          articles_lies: [],
          mots_cles: []
        })
      }
      i = j - 1
      continue
    }

    // Détecter les annexes
    const annexeMatch = text.match(/^ANNEXE\s+([IVXLCDM]+)(?:\s*[-–]\s*(.+))?/)
    if (annexeMatch) {
      let titre = annexeMatch[2]
        ? `ANNEXE ${annexeMatch[1]} - ${annexeMatch[2].trim()}`
        : `ANNEXE ${annexeMatch[1]}`
      
      let annexeContent = ''
      let j = i + 1

      // Récupérer le contenu jusqu'à la prochaine annexe
      while (j < elements.length) {
        const nextElement = elements[j]
        const nextText = nextElement.textContent?.trim() || ''
        
        // Si on trouve une nouvelle annexe, on s'arrête
        if (nextText.match(/^ANNEXE\s+[IVXLCDM]+/)) {
          break
        }
        
        // Si le texte n'est pas vide et n'est pas un titre d'annexe
        if (nextText && !nextText.match(/^ANNEXE\s+[IVXLCDM]+/)) {
          annexeContent += (annexeContent ? '\n' : '') + nextText
        }
        j++
      }

      // Nettoyer le contenu
      const cleanedContent = cleanContent(annexeContent)

      // N'ajouter l'annexe que si elle a du contenu
      if (cleanedContent) {
        articles.push({
          id: currentId++,
          type: 'annexe',
          numero: annexeMatch[1],
          titre: titre,
          contenu: cleanedContent,
          chapitre: 'Annexes',
          articles_lies: [],
          mots_cles: []
        })
      }
      i = j - 1
      continue
    }
  }

  // Trier les articles par numéro
  articles.sort((a, b) => {
    if (a.type === b.type) {
      return parseInt(a.numero) - parseInt(b.numero)
    }
    return a.type.localeCompare(b.type)
  })

  return articles
}

async function fetchAIAct() {
  try {
    console.log('Nettoyage de la table existante...')
    const { error: deleteError } = await supabase
      .from('articles_ria')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('Erreur lors du nettoyage de la table:', deleteError)
      return
    }

    console.log('Table nettoyée avec succès')
    console.log('Récupération du contenu du règlement sur l\'IA...')
    console.log('URL:', EUR_LEX_URL)
    
    const response = await axios.get(EUR_LEX_URL)
    console.log('Statut de la réponse:', response.status)

    if (response.status === 200) {
      const html = response.data
      let content = parseEurLexHTML(html)
      
      // Filtrer les éléments sans contenu
      content = content.filter(item => item.contenu.trim().length > 0)
      
      // Réassigner les IDs
      content = content.map((item, index) => ({
        ...item,
        id: index + 1
      }))

      console.log(`${content.length} éléments extraits du HTML (après filtrage)`)

      // Insertion dans Supabase par lots de 100
      for (let i = 0; i < content.length; i += 100) {
        const batch = content.slice(i, i + 100)
        const { error } = await supabase
          .from('articles_ria')
          .insert(batch)

        if (error) {
          console.error('Erreur lors de l\'insertion du batch dans Supabase:', error)
          console.error('Batch problématique:', JSON.stringify(batch[0], null, 2))
          return
        }
      }

      console.log('Contenu inséré avec succès dans Supabase')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur Axios:', error.response?.data || error.message)
    } else {
      console.error('Erreur lors de la récupération du contenu:', error)
    }
  }
}

fetchAIAct() 