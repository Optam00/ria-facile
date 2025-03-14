import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const CELLAR_API_URL = 'https://publications.europa.eu/webapi/rdf/sparql'
const CELEX_ID = '32023R2809' // Identifiant CELEX du RIA final

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

interface EURLexContent {
  type: 'article' | 'considerant' | 'annexe'
  numero: string
  titre: string
  contenu: string
  chapitre?: string
  titre_section?: string
  articles_lies?: number[]
  mots_cles?: string[]
  id?: number
}

const query = `
PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX eli: <http://data.europa.eu/eli/ontology#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?type ?numero ?titre ?contenu ?chapitre
WHERE {
  ?work cdm:resource_legal_id_celex "${CELEX_ID}"^^xsd:string .
  ?work cdm:work_has_expression ?expression .
  ?expression cdm:expression_uses_language "FRA"^^xsd:string .
  
  {
    # Articles
    ?expression cdm:expression_has_article ?item .
    ?item cdm:article_heading ?titre .
    ?item cdm:article_content ?contenu .
    OPTIONAL { ?item cdm:article_number ?numero }
    OPTIONAL { ?item cdm:belongs_to_chapter ?chap .
              ?chap skos:prefLabel ?chapitre }
    BIND("article" AS ?type)
  }
  UNION
  {
    # Considérants
    ?expression cdm:expression_has_recital ?item .
    ?item cdm:recital_number ?numero .
    ?item cdm:recital_content ?contenu .
    BIND(CONCAT("Considérant ", ?numero) AS ?titre)
    BIND("considerant" AS ?type)
    BIND("Considérants" AS ?chapitre)
  }
}
ORDER BY ?type ?numero
`

async function fetchRIAContent() {
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
    console.log('Récupération du contenu du RIA...')
    console.log('URL de l\'API:', CELLAR_API_URL)
    console.log('ID CELEX:', CELEX_ID)
    
    const response = await axios.get(CELLAR_API_URL, {
      params: {
        query: query,
        format: 'application/sparql-results+json'
      },
      headers: {
        'Accept': 'application/sparql-results+json'
      }
    })

    console.log('Réponse reçue:', response.status)
    console.log('Données:', JSON.stringify(response.data, null, 2))

    if (!response.data || !response.data.results || !response.data.results.bindings) {
      throw new Error('Format de réponse invalide')
    }

    const results = response.data.results.bindings
    console.log(`${results.length} résultats trouvés`)

    // Transformation des résultats en format EURLexContent
    const content: EURLexContent[] = results.map((result: any, index: number) => ({
      id: index + 1,
      type: result.type.value === 'considerant' ? 'considerant' : 'article',
      numero: result.numero?.value || String(index + 1),
      titre: result.titre.value,
      contenu: result.contenu.value,
      chapitre: result.chapitre?.value || undefined,
      articles_lies: [],
      mots_cles: []
    }))

    console.log(`${content.length} éléments créés`)

    // Insertion dans Supabase
    const { error } = await supabase
      .from('articles_ria')
      .insert(content)

    if (error) {
      console.error('Erreur lors de l\'insertion dans Supabase:', error)
      return
    }

    console.log('Contenu inséré avec succès dans Supabase')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur Axios:', error.response?.data || error.message)
    } else {
      console.error('Erreur lors de la récupération du contenu:', error)
    }
  }
}

fetchRIAContent() 