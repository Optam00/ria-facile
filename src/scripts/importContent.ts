import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import { JSDOM } from 'jsdom'
import dotenv from 'dotenv'
import { load } from 'cheerio'

dotenv.config()

const CELEX_ID = '32024R1689'
const EUR_LEX_URL = `https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:${CELEX_ID}`

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const KNOWN_SECTIONS: Record<string, { sections: Record<string, string> }> = {
  'CHAPITRE I': {
    sections: {}  // Pas de sections dans ce chapitre
  },
  'CHAPITRE III': {
    sections: {
      '1': 'Classification des systèmes d\'IA comme systèmes à haut risque',
      '2': 'Exigences relatives aux systèmes d\'IA à haut risque',
      '3': 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties',
      '4': 'Autorités de notification et organismes notifiés'
    }
  },
  'CHAPITRE VII': {
    sections: {
      '1': 'Gouvernance au niveau de l\'Union',
      '2': 'Autorités nationales compétentes'
    }
  },
  'CHAPITRE VIII': {
    sections: {
      '1': 'Surveillance après la mise sur le marché',
      '2': 'Partage d\'informations sur les incidents graves'
    }
  }
}

const ARTICLE_SECTIONS: Record<string, Record<string, { section: string, titre: string }>> = {
  'CHAPITRE I': {
    '1': { section: '', titre: 'Objet' },
    '2': { section: '', titre: 'Champ d\'application' },
    '3': { section: '', titre: 'Définitions' },
    '4': { section: '', titre: 'Maîtrise de l\'IA' }
  },
  'CHAPITRE III': {
    '6': { section: '1', titre: 'Classification des systèmes d\'IA comme systèmes à haut risque' },
    '7': { section: '1', titre: 'Classification des systèmes d\'IA comme systèmes à haut risque' },
    '8': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '9': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '10': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '11': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '12': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '13': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '14': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '15': { section: '2', titre: 'Exigences relatives aux systèmes d\'IA à haut risque' },
    '16': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '17': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '18': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '19': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '20': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '21': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '22': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '23': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '24': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '25': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '26': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '27': { section: '3', titre: 'Obligations des fournisseurs et des déployeurs de systèmes d\'IA à haut risque et des autres parties' },
    '28': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '29': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '30': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '31': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '32': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '33': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '34': { section: '4', titre: 'Autorités de notification et organismes notifiés' },
    '35': { section: '4', titre: 'Autorités de notification et organismes notifiés' }
  }
}

interface Article {
  id: number
  type: 'article' | 'considerant' | 'annexe'
  numero: string
  titre: string
  contenu: string
  chapitre: string
  chapitre_titre: string
  section_numero: string
  titre_section: string
  articles_lies: string[]
  mots_cles: string[]
}

interface Section {
  numero: string
  titre: string
  chapitre: string
  articles: Article[]
}

function extractChapterInfo(chapter: string): { titre_chapitre: string } {
  const parts = chapter.split(' - ')
  return {
    titre_chapitre: parts[1] || ''
  }
}

function cleanTitle(title: string, number: string | null, type: 'article' | 'considerant' | 'annexe'): string {
  let cleanedTitle = title.trim();
  
  // Supprimer les retours à la ligne et les espaces multiples
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ');
  
  // Supprimer les préfixes redondants selon le type
  if (type === 'article') {
    cleanedTitle = cleanedTitle.replace(/^Article\s+(\d+|premier)\s*[-–]?\s*/i, '');
  } else if (type === 'considerant') {
    cleanedTitle = cleanedTitle.replace(/^Considérant\s+\d+\s*[-–]?\s*/i, '');
  } else if (type === 'annexe') {
    cleanedTitle = cleanedTitle.replace(/^Annexe\s+[IVX]+\s*[-–]?\s*/i, '');
  }

  // Si le titre est vide après nettoyage, retourner 'Sans titre'
  return cleanedTitle || 'Sans titre';
}

function cleanContent(content: string, title: string): string {
  // Nettoyer le contenu ligne par ligne
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)

  // Si le titre est présent au début du contenu, le retirer
  if (title && lines.length > 0) {
    // Créer un pattern qui correspond au titre exact ou au titre avec un numéro d'article
    const titlePattern = new RegExp(`^(Article\\s+\\d+\\s*[-–]?\\s*)?${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`)
    
    // Retirer le titre s'il correspond à la première ligne
    if (titlePattern.test(lines[0])) {
      lines.shift()
    }
  }

  // Retirer les lignes dupliquées consécutives
  return lines
    .filter((line, index, array) => line !== array[index - 1])
    .join('\n')
}

async function parseEurLexHTML() {
  try {
    console.log('Récupération du contenu depuis:', EUR_LEX_URL)
    const response = await axios.get(EUR_LEX_URL)
    
    if (response.status === 200) {
      console.log('Contenu récupéré avec succès')
      const $ = load(response.data)
      
      // Structure pour stocker les articles
      const articles: Article[] = []
      let currentChapter = ''
      let currentChapterTitle = ''
      let currentSection: Section | null = null
      
      // Parcours du document
      $('.oj-ti-grseq-1, .oj-ti-section-1, .oj-ti-art').each((_, element) => {
        const $el = $(element)
        const text = $el.text().trim()
        
        // Log pour le débogage
        console.log('Élément trouvé:', text)
        console.log('Classes:', $el.attr('class'))
        
        // Détection des chapitres
        const chapterMatch = text.match(/^CHAPITRE\s+([IVX]+)(?:\s*[-–]\s*(.+))?$/i)
        if (chapterMatch) {
          const chapterNumber = chapterMatch[1]
          currentChapterTitle = chapterMatch[2] || ''
          currentChapter = `CHAPITRE ${chapterNumber}${currentChapterTitle ? ` - ${currentChapterTitle}` : ''}`
          console.log('Chapitre détecté:', currentChapter)
          return
        }
        
        // Détection des sections
        const sectionMatch = text.match(/^Section\s+(\d+)/i)
        if (sectionMatch && currentChapter && KNOWN_SECTIONS[currentChapter]) {
          const sectionNumber = sectionMatch[1]
          const sectionTitle = KNOWN_SECTIONS[currentChapter].sections[sectionNumber] || ''
          currentSection = {
            numero: sectionNumber,
            titre: sectionTitle,
            chapitre: currentChapter,
            articles: []
          }
          console.log('Section détectée:', currentSection)
          return
        }
        
        // Détection des articles
        let articleNumber: string | null = null
        let articleTitle = ''
        
        // Cas spécial pour "Article premier"
        if (text.match(/^Article\s+premier\b/i)) {
          articleNumber = '1'
          console.log('Article premier détecté')
          
          // Récupération du titre après "Article premier"
          const titleMatch = text.match(/^Article\s+premier\s*[-–]?\s*(.+)?$/i)
          if (titleMatch && titleMatch[1]) {
            articleTitle = titleMatch[1].trim()
          }
        } else {
          const articleMatch = text.match(/^Article\s+(\d+)\s*[-–]?\s*(.+)?$/i)
          if (articleMatch) {
            articleNumber = articleMatch[1]
            articleTitle = articleMatch[2] || ''
            console.log('Article numéro détecté:', articleNumber)
          }
        }
        
        if (articleNumber && currentChapter) {
          console.log('Traitement de l\'article', articleNumber, 'du chapitre', currentChapter)
          
          // Récupération du contenu de l'article
          let content = ''
          let nextElement = $el.next()
          while (nextElement.length && !nextElement.text().trim().match(/^(Article|CHAPITRE|Section)/i)) {
            const nextText = nextElement.text().trim()
            if (nextText) {
              content += nextText + '\n'
            }
            nextElement = nextElement.next()
          }
          
          const articleInfo = ARTICLE_SECTIONS[currentChapter]?.[articleNumber]
          console.log('Info article trouvée:', articleInfo)
          
          const article: Article = {
            id: parseInt(articleNumber),
            type: 'article',
            numero: articleNumber,
            titre: articleInfo?.titre || cleanTitle(articleTitle, articleNumber, 'article'),
            contenu: content.trim(),
            chapitre: currentChapter,
            chapitre_titre: currentChapterTitle,
            section_numero: articleInfo?.section || (currentSection?.numero || ''),
            titre_section: articleInfo?.titre || (currentSection?.titre || ''),
            articles_lies: [],
            mots_cles: []
          }
          
          articles.push(article)
          console.log(`Article ${article.numero} traité (${article.titre})`)
          console.log('Contenu:', article.contenu.substring(0, 100) + '...')
        }
      })
      
      // Insertion dans la base de données
      console.log('Articles trouvés:', articles.length)
      for (const article of articles) {
        try {
          const { error } = await supabase.from('articles_ria').insert([article])
          if (error) {
            console.error(`Erreur lors de l'insertion de l'article ${article.numero}:`, error)
          } else {
            console.log(`Article ${article.numero} inséré avec succès`)
          }
        } catch (error) {
          console.error(`Erreur lors de l'insertion de l'article ${article.numero}:`, error)
        }
      }
      
      console.log('Importation terminée avec succès')
    }
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error)
    throw error
  }
}

async function importContent() {
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
    await parseEurLexHTML()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur Axios:', error.response?.data || error.message)
    } else {
      console.error('Erreur lors de la récupération du contenu:', error)
    }
  }
}

importContent()