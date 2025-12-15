// Route API Vercel pour appeler la fonction Supabase Edge Function
// Cela évite les problèmes CORS en faisant l'appel depuis le serveur

export default async function handler(req, res) {
  // Activer CORS pour cette route
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Seulement POST autorisé
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Requête reçue dans /api/assistant-ria');
    
    const { question, history = [] } = req.body;
    console.log('📋 Body reçu:', { question: question?.substring(0, 50), historyLength: history?.length });

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question requise' });
    }

    // Récupérer les variables d'environnement Supabase
    // Dans les routes API Vercel, les variables peuvent être avec ou sans préfixe VITE_
    let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // Corriger l'URL si elle commence par "ttps://" (erreur de copier-coller)
    if (supabaseUrl && supabaseUrl.startsWith('ttps://')) {
      console.warn('⚠️ URL corrigée: ttps:// -> https://');
      supabaseUrl = 'h' + supabaseUrl;
    }

    // Vérifier que l'URL commence bien par https://
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      console.error('❌ URL Supabase invalide (doit commencer par https://):', supabaseUrl.substring(0, 20));
      return res.status(500).json({ 
        error: 'Configuration serveur invalide: URL Supabase doit commencer par https://',
        receivedUrl: supabaseUrl.substring(0, 30)
      });
    }

    console.log('🔍 Variables d\'environnement:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MANQUANTE',
      urlStartsWithHttps: supabaseUrl ? supabaseUrl.startsWith('https://') : false,
      envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Configuration Supabase manquante');
      return res.status(500).json({ 
        error: 'Configuration serveur manquante',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
        }
      });
    }

    // Appeler la fonction Supabase Edge Function
    // Le nom de la fonction dans Supabase est "assistant RIA" (avec espace) ou "bright-processor"
    // Les espaces dans les URLs doivent être encodés en %20
    const functionName = 'assistant RIA'; // Nom exact dans Supabase
    const functionUrl = `${supabaseUrl}/functions/v1/${encodeURIComponent(functionName)}`;
    console.log('📤 Appel de Supabase Edge Function:', functionUrl);
    console.log('📤 Nom de fonction:', functionName);
    console.log('📤 Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey.substring(0, 20)}...`,
      'apikey': `${supabaseAnonKey.substring(0, 20)}...`,
    });
    
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
      return res.status(500).json({
        error: `Erreur réseau lors de l'appel à Supabase: ${fetchError.message}`,
        details: {
          url: functionUrl,
          fetchAvailable: typeof fetch !== 'undefined',
          errorType: fetchError.name
        }
      });
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
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    console.log('✅ Données reçues de Supabase');
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Erreur dans la route API:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      error: error.message || 'Erreur serveur',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

