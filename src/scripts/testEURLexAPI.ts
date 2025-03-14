import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const CELLAR_API_URL = 'https://publications.europa.eu/webapi/rdf/sparql'
const CELEX_ID = '32024R1689'

// Requête SPARQL simplifiée pour juste vérifier si le document existe
const query = `
PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?work ?title ?date
WHERE {
  ?work cdm:resource_legal_id_celex "${CELEX_ID}"^^xsd:string .
  OPTIONAL { 
    ?work cdm:work_title ?title .
    ?work cdm:work_date_document ?date
  }
}
`

async function testAPI() {
  try {
    console.log('Test de connexion à l\'API...')
    console.log('URL:', CELLAR_API_URL)
    console.log('CELEX ID:', CELEX_ID)
    console.log('\nRequête SPARQL:')
    console.log(query)
    
    const response = await axios.get(CELLAR_API_URL, {
      params: {
        query: query,
        format: 'application/sparql-results+json'
      },
      headers: {
        'Accept': 'application/sparql-results+json'
      }
    })

    console.log('\nStatut de la réponse:', response.status)
    console.log('Headers:', JSON.stringify(response.headers, null, 2))
    console.log('\nDonnées:', JSON.stringify(response.data, null, 2))

    // Si aucun résultat, essayons avec l'API REST d'EUR-Lex
    if (!response.data.results.bindings.length) {
      console.log('\nAucun résultat trouvé dans Cellar, essai avec l\'API REST d\'EUR-Lex...')
      const eurLexResponse = await axios.get(`https://eur-lex.europa.eu/search.html?DTA=2024&DTN=1689&DTS=3&DN=32024R1689&lang=fr&type=advanced`)
      console.log('Statut EUR-Lex:', eurLexResponse.status)
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur Axios:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
    } else {
      console.error('Erreur:', error)
    }
  }
}

testAPI() 