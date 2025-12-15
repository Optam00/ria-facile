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
    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question requise' });
    }

    // Récupérer les variables d'environnement Supabase
    // Dans les routes API Vercel, les variables peuvent être avec ou sans préfixe VITE_
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Configuration Supabase manquante');
      return res.status(500).json({ error: 'Configuration serveur manquante' });
    }

    // Appeler la fonction Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/assistant-ria`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ question, history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Supabase Edge Function:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `Erreur ${response.status}` };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur dans la route API:', error);
    return res.status(500).json({
      error: error.message || 'Erreur serveur',
    });
  }
}

