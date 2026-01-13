# Guide de mise en place du RAG

Ce guide vous explique comment mettre en place le système RAG (Retrieval-Augmented Generation) pour l'assistant RIA.

## 📋 Prérequis

1. **Compte Supabase** avec pgvector activé
2. **Clé API OpenAI** pour les embeddings (`text-embedding-3-small`)
3. **Clé API Gemini** (déjà configurée pour l'assistant RIA)
4. **Variables d'environnement** configurées

## 🚀 Étapes d'installation

### Étape 1 : Créer la table et les fonctions SQL

Exécutez dans l'ordre les scripts SQL suivants dans le SQL Editor de Supabase :

1. **`create-rag-table.sql`** : Crée la table avec pgvector
   ```sql
   -- Copiez-collez le contenu du fichier dans le SQL Editor
   ```

2. **`create-rag-rls.sql`** : Configure les politiques RLS
   ```sql
   -- Copiez-collez le contenu du fichier dans le SQL Editor
   ```

3. **`create-rag-search-function.sql`** : Crée la fonction de recherche
   ```sql
   -- Copiez-collez le contenu du fichier dans le SQL Editor
   ```

### Étape 2 : Configurer les variables d'environnement

Dans votre projet Supabase, allez dans **Settings > Edge Functions > Secrets** et ajoutez :

- `OPENAI_API_KEY` : Votre clé API OpenAI (pour les embeddings)
- `GEMINI_API_KEY` : Votre clé API Gemini (déjà configurée normalement)

### Étape 3 : Déployer l'Edge Function

```bash
# Depuis la racine du projet
supabase functions deploy rag-search
```

Ou via le dashboard Supabase :
1. Allez dans **Edge Functions**
2. Créez une nouvelle fonction nommée `rag-search`
3. Copiez le contenu de `supabase/functions/rag-search/index.ts`

### Étape 4 : Préparer vos documents

Créez des fichiers texte avec vos documents :

```
documents/
  ├── reglement.txt          # Le règlement européen
  ├── lignes-directrices.txt # Les lignes directrices
  └── jurisprudence.txt      # La jurisprudence
```

### Étape 5 : Ingérer les documents

Installez les dépendances nécessaires :

```bash
pnpm add -D tsx dotenv
pnpm add @supabase/supabase-js
```

Créez un fichier `.env` à la racine avec :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_anon_key
OPENAI_API_KEY=votre_clé_openai
```

Puis ingérez vos documents :

```bash
# Ingérer le règlement
pnpm tsx scripts/ingest-rag-documents.ts documents/reglement.txt reglement "Règlement UE 2024/1689"

# Ingérer les lignes directrices
pnpm tsx scripts/ingest-rag-documents.ts documents/lignes-directrices.txt lignes_directrices "Lignes directrices officielles"

# Ingérer la jurisprudence
pnpm tsx scripts/ingest-rag-documents.ts documents/jurisprudence.txt jurisprudence "Jurisprudence RIA"
```

### Étape 6 : Tester

1. Allez sur `/rag`
2. Sélectionnez les sources à interroger
3. Posez une question
4. Vérifiez les résultats !

## 🔧 Configuration avancée

### Ajuster le seuil de similarité

Dans `create-rag-search-function.sql`, modifiez le `match_threshold` par défaut (actuellement 0.7).

### Ajuster la taille des chunks

Dans `scripts/ingest-rag-documents.ts`, modifiez :
- `CHUNK_SIZE` : Taille des chunks (défaut: 1000 tokens)
- `CHUNK_OVERLAP` : Chevauchement entre chunks (défaut: 200 tokens)

### Ajuster le nombre de documents récupérés

Dans `supabase/functions/rag-search/index.ts`, modifiez `match_count` (actuellement 5).

## 📊 Vérifier les données

Pour voir combien de documents sont dans la base :

```sql
SELECT source_type, COUNT(*) as count 
FROM public.rag_documents 
GROUP BY source_type;
```

## 🐛 Dépannage

### Erreur "extension vector does not exist"
- Vérifiez que pgvector est activé dans Supabase
- Allez dans **Database > Extensions** et activez `vector`

### Erreur "permission denied"
- Vérifiez que les politiques RLS sont bien créées
- Vérifiez que vous utilisez la bonne clé API (service_role pour l'ingestion)

### Erreur OpenAI
- Vérifiez que `OPENAI_API_KEY` est bien configurée
- Vérifiez que vous avez des crédits OpenAI

### Aucun document trouvé
- Vérifiez que des documents ont bien été ingérés
- Baissez le `match_threshold` (peut-être trop élevé)
- Vérifiez que les `source_types` correspondent

## 📝 Notes

- Les embeddings sont générés avec `text-embedding-3-small` (1536 dimensions)
- Le coût OpenAI est très faible : ~$0.02 pour 1M tokens
- Les documents sont chunkés avec un chevauchement pour préserver le contexte
- La recherche utilise la distance cosine (similarité)

