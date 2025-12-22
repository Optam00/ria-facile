// Test avec proxy CORS pour contourner les restrictions
// Colle ce code dans la console

const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
const formData = new FormData();
formData.append('file', testFile);

const { data: { session } } = await supabase.auth.getSession();
const supabaseUrl = 'https://jhrorcscubchlyxlcwns.supabase.co';

// Récupérer la clé API
let apiKey = null;
try {
  if (supabase.rest && supabase.rest.headers) {
    apiKey = supabase.rest.headers.apikey || supabase.rest.headers['apikey'];
  }
} catch(e) {}

if (!apiKey) {
  console.error('❌ Clé API non trouvée');
} else {
  console.log('✅ Clé API trouvée');
  console.log('📤 Test avec proxy CORS...');
  
  // Utiliser un proxy CORS public (cors-anywhere ou allorigins)
  const proxyUrl = 'https://api.allorigins.win/raw?url=';
  const targetUrl = `${supabaseUrl}/storage/v1/object/admin-files/test-cors-${Date.now()}.txt`;
  
  console.log('URL cible:', targetUrl);
  
  fetch(proxyUrl + encodeURIComponent(targetUrl), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': apiKey,
      'Content-Type': 'application/octet-stream'
    },
    body: testFile
  })
  .then(response => {
    console.log('✅ Réponse reçue:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('📥 Corps:', text);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
  });
}

