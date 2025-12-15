import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  question: string
  history: Array<{ question: string; answer: string }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, history = [] }: RequestBody = await req.json()

    if (!question || !question.trim()) {
      return new Response(
        JSON.stringify({ error: 'Question requise' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Récupérer la clé API Gemini depuis les variables d'environnement Supabase
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY non définie')
      return new Response(
        JSON.stringify({ error: 'Configuration serveur manquante' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Construire le contexte avec l'historique récent (max 5 derniers échanges)
    const recentHistory = history.slice(-5)
    let contextMessages = recentHistory.flatMap((h) => [
      { role: 'user', parts: [{ text: h.question }] },
      { role: 'model', parts: [{ text: h.answer }] },
    ])

    // Ajouter la question actuelle
    contextMessages.push({ role: 'user', parts: [{ text: question }] })

    // Appel à l'API Gemini (modèle gemini-1.5-pro comme mentionné dans l'interface)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contextMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          systemInstruction: {
            parts: [
              {
                text: `Tu es un expert du Règlement sur l'Intelligence Artificielle (RIA, AI Act, IA Act) de l'Union Européenne. 
Tu réponds de manière précise, pédagogique et en français. 
Tu t'appuies uniquement sur le texte officiel du règlement et sur les informations que tu as reçues.
Si tu ne connais pas la réponse, dis-le clairement plutôt que d'inventer.
Tu peux citer des articles, considérants ou annexes du règlement quand c'est pertinent.`,
              },
            ],
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Erreur Gemini API:', errorText)
      throw new Error(`Erreur API Gemini: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()

    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts) {
      throw new Error('Format de réponse Gemini invalide')
    }

    const answer = geminiData.candidates[0].content.parts[0].text

    // Sauvegarder la question dans Supabase (optionnel, pour analytics)
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      await supabaseClient.from('assistant_ria').insert([{ question }])
    } catch (saveError) {
      // On continue même si la sauvegarde échoue
      console.warn('Erreur sauvegarde question:', saveError)
    }

    return new Response(
      JSON.stringify({ answer }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur assistant-ria:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur serveur',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
