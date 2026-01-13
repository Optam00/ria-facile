import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    const { question, sources, history = [] } = await req.json()

    if (!question || !question.trim()) {
      return new Response(
        JSON.stringify({ error: 'Question requise' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Au moins une source doit être sélectionnée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Préparer l'historique récent (max 5 derniers échanges)
    const recentHistory = Array.isArray(history) ? history.slice(-5) : []
    console.log(`📚 Historique reçu: ${recentHistory.length} échange(s)`)

    // Récupérer la clé API OpenAI depuis les variables d'environnement
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY non définie')
      return new Response(
        JSON.stringify({ error: 'Configuration serveur manquante' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Générer l'embedding de la question
    console.log('🔮 Génération de l\'embedding pour la question...')
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: question,
      }),
    })

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json()
      console.error('❌ Erreur OpenAI embedding:', error)
      throw new Error(`Erreur lors de la génération de l'embedding: ${error.error?.message || 'Erreur inconnue'}`)
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Rechercher les documents similaires dans Supabase
    console.log('🔍 Recherche dans la base de documents...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: documents, error: searchError } = await supabase.rpc('search_rag_documents', {
      query_embedding: queryEmbedding,
      source_types: sources,
      match_threshold: 0.1, // Seuil très bas pour être sûr de trouver toutes les définitions
      match_count: 20, // Augmenté pour avoir plus de contexte et trouver les définitions
    })

    if (searchError) {
      console.error('❌ Erreur recherche RAG:', searchError)
      throw new Error(`Erreur lors de la recherche: ${searchError.message}`)
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({
          answer: 'Aucun document pertinent trouvé dans les sources sélectionnées pour répondre à votre question.',
          documents: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log(`✅ ${documents.length} documents trouvés`)

    // Vérifier s'il y a des définitions dans les résultats
    const hasDefinitions = documents.some(doc => doc.category === 'definition' && doc.article_number === '3')
    
    // Construire le contexte pour Gemini avec les métadonnées enrichies
    const context = documents
      .map((doc, idx) => {
        let header = `[Document ${idx + 1}`;
        if (doc.article_number) {
          header += ` - Article ${doc.article_number}`;
        }
        if (doc.category) {
          header += ` (${doc.category})`;
        }
        header += ` - ${doc.source_name || doc.source_type}]`;
        return `${header}\n${doc.content}`;
      })
      .join('\n\n---\n\n')

    // Générer la réponse avec Gemini
    console.log('🤖 Génération de la réponse avec Gemini...')
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non définie')
    }

    // Utiliser le même modèle que l'assistant RIA pour une meilleure compréhension
    const model = "gemini-2.5-pro"
    
    // Séparer les instructions système du contenu (comme l'assistant RIA)
    const systemInstruction = `Tu es un expert juridique sur l'AI Act européen (RIA - Règlement UE 2024/1689).

Tu dois répondre aux questions avec la plus grande rigueur juridique possible. 
Tu dois avant tout te baser sur les documents fournis dans le contexte.
Lorsque tu réponds, tu ne te contente pas de prendre en compte uniquement les grands principes, tu analyses le texte et la demande en profondeur, notamment en explorant les exceptions aux principes, et les moindres détails. 
Tu ne dois pas te présenter lorsque tu donnes une réponse, tu dois répondre directement.

${recentHistory.length > 0 ? `
CONTEXTE DE LA CONVERSATION :
- Tu as accès à l'historique des échanges précédents avec l'utilisateur.
- Utilise cet historique pour comprendre le contexte de la conversation et éviter de répéter des informations déjà données.
- Si l'utilisateur fait référence à une question ou réponse précédente, utilise l'historique pour comprendre de quoi il parle.
- Tu peux faire référence aux échanges précédents si c'est pertinent pour ta réponse.
` : ''}

HIÉRARCHIE DES SOURCES :

Tu disposes de deux types de sources dans le contexte :

1. LE RÈGLEMENT (Hard Law) : C'est le texte de loi officiel et contraignant. Il a la priorité absolue pour les définitions légales et les obligations.

2. LES LIGNES DIRECTRICES (Soft Law) : Ce sont des documents explicatifs de la Commission Européenne qui expliquent comment interpréter et appliquer le règlement. Elles contiennent des exemples concrets et des clarifications.

RÈGLES DE RÉPONSE :

- Si l'utilisateur pose une question sur une définition ou un concept (ex: "qu'est-ce qu'un système IA ?", "qu'est-ce qu'un fournisseur en aval ?"), utilise PRIORITAIREMENT les définitions du Règlement (Article 3) car c'est la source légale officielle. Ensuite, utilise les Lignes Directrices pour expliquer et illustrer avec des exemples concrets.

- Si la question porte sur "comment appliquer..." ou "qu'est-ce qu'on entend par..." un concept flou, utilise PRIORITAIREMENT les Lignes Directrices car elles offrent plus de détails et d'exemples concrets que le Règlement seul.

- Si les sources contiennent le Règlement ET les Lignes Directrices, commence TOUJOURS par citer l'article de loi du Règlement, puis explique-le et illustre-le grâce aux Lignes Directrices.

- Mentionne TOUJOURS explicitement ta source dans ta réponse :
  * Pour le Règlement : "Selon l'Article X du Règlement..." ou "L'Article X, paragraphe Y, dispose que..."
  * Pour les Lignes Directrices : "Selon le paragraphe X des Lignes directrices [Sujet]..." ou "Les Lignes directrices précisent que..."

- Utilise les exemples concrets fournis dans les Lignes Directrices pour illustrer tes propos et rendre ta réponse plus compréhensible.

INSTRUCTIONS GÉNÉRALES :

- Réponds UNIQUEMENT en te basant sur les documents fournis dans le contexte
- TRÈS IMPORTANT : Si la question porte sur la définition d'un terme, cherche OBLIGATOIREMENT dans les documents qui contiennent :
  * Le terme recherché entre guillemets français « » (ex: «fournisseur en aval», «importateur»)
  * Ou qui mentionnent "Article 3" avec le terme recherché
  * Les définitions dans l'Article 3 sont toujours formatées avec des guillemets français «terme», suivi d'une virgule et de la définition
- Si tu trouves une définition entre guillemets français dans le contexte, c'est LA définition officielle du règlement - utilise-la en priorité
- Si l'information n'est pas dans le contexte, dis-le clairement : "Les documents fournis ne contiennent pas d'information suffisante pour répondre à cette question."
- FORMATAGE ET STRUCTURE (CRITIQUE) :
  * Utilise le format Markdown pour structurer ta réponse de manière claire et professionnelle.
  * Utilise des **gras** UNIQUEMENT pour :
    - Les termes juridiques importants (ex: **fournisseur**, **déployeur**, **système d'IA à haut risque**)
    - Les références aux articles (ex: **Article 3**, **Article 25**)
    - Les concepts clés à retenir
  * NE PAS utiliser de gras pour les phrases entières ou les paragraphes complets.
  * Utilise des listes à puces (`-` ou `*`) pour :
    - Énumérer des obligations
    - Lister des exemples
    - Présenter des points importants de manière structurée
  * Utilise des listes numérotées (`1.`, `2.`, etc.) pour :
    - Les étapes d'un processus
    - Les conditions à respecter dans un ordre précis
  * Utilise des sous-listes (indentation avec 2 espaces) pour organiser l'information hiérarchiquement.
  * Entre chaque paragraphe, laisse une ligne vide (double saut de ligne) pour améliorer la lisibilité.
  * Utilise des emoji avec parcimonie et uniquement pour faciliter la lecture (ex: ✅ pour confirmer, ⚠️ pour alerter, 📋 pour lister).
  * NE JAMAIS utiliser de tableaux - utilise des listes à la place.
  * Évite les caractères spéciaux non-standard - utilise uniquement les caractères ASCII et les caractères accentués français standard (é, è, à, ç, etc.).
  * Si tu dois citer un texte exact du règlement, utilise des guillemets français « » autour de la citation.
- Commence TOUJOURS par donner la définition officielle du terme si elle est disponible (recherche les guillemets français « »), puis développe avec les obligations et détails spécifiques.
- Tes réponses doivent absolument contenir les références de tes sources dans le corps de la réponse. Par exemple, si tu cites un article du règlement IA, tu dois tout de suite indiquer la référence précise de cet article (ex: "Article 3, paragraphe 5", "Article 23, paragraphe 1").
- Si tu penses que ta réponse pourrait être plus précise en ayant plus d'informations, tu peux indiquer à l'auteur de la question que tu pourrais lui apporter une réponse plus précise si tu avais plus d'informations, et tu lui poses les questions pour obtenir les informations dont tu as besoin.

Chacun de tes réponses doit finir par les phrases suivantes en italique : 
*Ce contenu a été généré par une IA, consultez le texte pour vérifier les informations : https://www.ria-facile.com/consulter*
*Pour être accompagné dans votre mise en conformité par des professionnels, contactez-nous via ce formulaire : https://www.ria-facile.com/contact*`

    // Détecter si le contexte contient des lignes directrices
    const hasGuidelines = documents.some(doc => doc.source_type === 'lignes_directrices')
    const hasReglement = documents.some(doc => doc.source_type === 'reglement')
    
    // Construire les messages avec l'historique
    const contextMessages = recentHistory.flatMap((h: { question: string; answer: string }) => [
      { role: 'user', parts: [{ text: h.question }] },
      { role: 'model', parts: [{ text: h.answer }] },
    ])

    // Ajouter le contexte des documents et la question actuelle
    const userMessage = `CONTEXTE (documents pertinents extraits) :
${context}

QUESTION DE L'UTILISATEUR : ${question}

INSTRUCTIONS SPÉCIFIQUES :
${hasReglement && hasGuidelines ? `
- Tu as accès à la fois au RÈGLEMENT (loi officielle) et aux LIGNES DIRECTRICES (explications).
- Si la question demande une définition, commence TOUJOURS par la définition officielle du Règlement (Article 3) si elle est disponible.
- Ensuite, utilise les Lignes Directrices pour expliquer, clarifier et illustrer avec des exemples concrets.
- Si la question porte sur "comment appliquer..." ou "qu'est-ce qu'on entend par...", privilégie les Lignes Directrices qui contiennent plus de détails pratiques.
` : hasGuidelines ? `
- Tu as accès aux LIGNES DIRECTRICES (explications de la Commission Européenne).
- Utilise ces documents pour expliquer et illustrer les concepts avec des exemples concrets.
` : `
- Tu as accès au RÈGLEMENT (loi officielle).
- Si la question demande une définition, cherche d'abord dans les documents qui contiennent le terme entre guillemets français « » (ex: «fournisseur en aval», «importateur»).
- Les définitions officielles sont toujours formatées ainsi : «terme», définition.
- Si tu trouves une telle définition, c'est LA définition officielle du règlement - commence ta réponse par cette définition exacte.
`}
- Mentionne TOUJOURS explicitement la source de tes informations (Article X du Règlement, ou Paragraphe X des Lignes directrices).
- Utilise des exemples concrets quand ils sont disponibles dans les Lignes Directrices.

Génère maintenant ta réponse.`

    // Ajouter la question actuelle à l'historique des messages
    contextMessages.push({ role: 'user', parts: [{ text: userMessage }] })
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contextMessages,
          generationConfig: {
            temperature: 0, // Comme l'assistant RIA pour des réponses factuelles
            topP: 0.95,
            maxOutputTokens: 65536,
          },
          systemInstruction: {
            parts: [{
              text: systemInstruction,
            }],
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json()
      console.error('❌ Erreur Gemini:', error)
      throw new Error(`Erreur Gemini: ${error.error?.message || 'Erreur inconnue'}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('📝 Réponse Gemini reçue:', JSON.stringify(geminiData).substring(0, 200))
    
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Erreur lors de la génération de la réponse'
    
    if (!answer || answer === 'Erreur lors de la génération de la réponse') {
      console.error('❌ Réponse Gemini vide ou invalide:', geminiData)
    } else {
      console.log('✅ Réponse générée avec succès (longueur:', answer.length, 'caractères)')
    }

    // Formater les documents pour l'affichage
    const formattedDocuments = documents.map(doc => ({
      content: doc.content,
      source: doc.source_name || doc.source_type,
      sourceType: doc.source_type,
      articleNumber: doc.article_number || null,
      category: doc.category || null,
      score: doc.similarity,
    }))

    return new Response(
      JSON.stringify({
        answer,
        documents: formattedDocuments,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})


