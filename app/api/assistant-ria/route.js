import { NextResponse } from 'next/server';

// Route API Vercel pour appeler la fonction Supabase Edge Function
// Cela évite les problèmes CORS en faisant l'appel depuis le serveur

export async function POST(req) {
  try {
    console.log('📥 Requête reçue dans /api/assistant-ria');
    
    const { question, history = [] } = await req.json();
    console.log('📋 Body reçu:', { question: question?.substring(0, 50), historyLength: history?.length });

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question requise' },
        { status: 400 }
      );
    }

    // Récupérer les variables d'environnement Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    console.log('🔍 Variables d\'environnement:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MANQUANTE',
      envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Configuration Supabase manquante');
      return NextResponse.json(
        { 
          error: 'Configuration serveur manquante',
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
          }
        },
        { status: 500 }
      );
    }

    // Appeler la fonction Supabase Edge Function
    const functionUrl = `${supabaseUrl}/functions/v1/assistant-ria`;
    console.log('📤 Appel de Supabase Edge Function:', functionUrl);
    
    let response;
    try {
      response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ question, history }),
      });
    } catch (fetchError) {
      console.error('❌ Erreur fetch détaillée:', {
        message: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name,
        cause: fetchError.cause,
        url: functionUrl,
        fetchAvailable: typeof fetch !== 'undefined'
      });
      return NextResponse.json(
        {
          error: `Erreur réseau lors de l'appel à Supabase: ${fetchError.message}`,
          details: {
            url: functionUrl,
            fetchAvailable: typeof fetch !== 'undefined',
            errorType: fetchError.name
          }
        },
        { status: 500 }
      );
    }

    console.log('📥 Réponse Supabase:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Supabase Edge Function:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `Erreur ${response.status}` };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Données reçues de Supabase');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur dans la route API:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      {
        error: error.message || 'Erreur serveur',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

