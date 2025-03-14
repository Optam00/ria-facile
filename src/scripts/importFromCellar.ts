import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'
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

async function fetchEURLexHTML(): Promise<string> {
  const url = 'https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=OJ:L_202401689'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`)
  }
  return response.text()
}

async function extractArticles($: ReturnType<typeof cheerio.load>): Promise<Article[]> {
  const articles: Article[] = [];
  
  // Sélectionner tous les articles
  const articleElements = $('.eli-subdivision[id^="art_"]');
  
  console.log(`Nombre d'articles trouvés : ${articleElements.length}`);

  articleElements.each((_: number, element: cheerio.Element) => {
    const $article = $(element);
    
    // Extraire le numéro d'article
    const articleText = $article.find('.oj-ti-art').text().trim();
    let articleNumber = 0;
    
    // Extraire le numéro directement de l'ID de l'article
    const articleId = $article.attr('id') || '';
    const idMatch = articleId.match(/art_(\d+)/);
    if (idMatch) {
      articleNumber = parseInt(idMatch[1]);
    } else if (articleText.toLowerCase().includes('premier')) {
      articleNumber = 1;
    }
    
    // Extraire le titre de l'article
    const titre = $article.find('.oj-sti-art').text().trim();
    
    // Extraire le contenu de l'article
    const contenuElements = $article.find('.oj-normal');
    const contenu = contenuElements.map((_: number, el: cheerio.Element) => $(el).text().trim()).get().join('\n');
    
    // Trouver le chapitre parent
    const chapitreElement = $article.closest('.eli-subdivision[id^="cpt_"]');
    const chapitreNumero = chapitreElement.find('.oj-ti-grseq').first().text().replace('CHAPITRE ', '').trim();
    
    // Créer l'objet Article
    const article: Article = {
      numero: articleNumber,
      titre: titre,
      contenu: contenu,
      chapitre_id: chapitreNumero || null,
      section_id: null
    };
    
    console.log(`Article extrait : Article ${article.numero} - ${article.titre}`);
    articles.push(article);
  });

  return articles;
}

async function main() {
  try {
    console.log('Début de l\'importation...')
    
    // Fetch and parse HTML
    const html = await fetchEURLexHTML()
    const $ = cheerio.load(html)
    
    // Extract articles
    const articles = await extractArticles($)
    
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