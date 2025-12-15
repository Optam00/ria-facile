# Assistant RIA - Supabase Edge Function

Cette fonction remplace le backend Python hébergé sur Render pour l'assistant RIA.

## Configuration requise

### 1. Clé API Gemini

Vous devez configurer la variable d'environnement `GEMINI_API_KEY` dans votre projet Supabase :

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Edge Functions** > **Secrets**
4. Ajoutez un nouveau secret :
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Votre clé API Gemini (obtenue depuis [Google AI Studio](https://makersuite.google.com/app/apikey))

### 2. Déploiement de la fonction

#### Option A : Via Supabase CLI (recommandé)

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login

# Lier votre projet local à votre projet Supabase
supabase link --project-ref votre-project-ref

# Déployer la fonction
supabase functions deploy assistant-ria
```

#### Option B : Via le Dashboard Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Edge Functions**
4. Cliquez sur **Create a new function**
5. Nommez-la `assistant-ria`
6. Copiez le contenu de `index.ts` dans l'éditeur
7. Cliquez sur **Deploy**

## Utilisation

La fonction est accessible via :
```
POST {SUPABASE_URL}/functions/v1/assistant-ria
```

### Headers requis :
- `Content-Type: application/json`
- `Authorization: Bearer {SUPABASE_ANON_KEY}`
- `apikey: {SUPABASE_ANON_KEY}`

### Body :
```json
{
  "question": "Qu'est-ce que le RIA ?",
  "history": [
    {
      "question": "Question précédente",
      "answer": "Réponse précédente"
    }
  ]
}
```

### Réponse :
```json
{
  "answer": "Réponse de l'assistant..."
}
```

## Modèle utilisé

La fonction utilise le modèle **gemini-2.5-pro** comme mentionné dans l'interface utilisateur.

## Notes

- La fonction sauvegarde automatiquement les questions dans la table `assistant_ria` de Supabase
- L'historique est limité aux 5 derniers échanges pour optimiser les performances
- La fonction gère les erreurs et retourne des messages d'erreur appropriés
