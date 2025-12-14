# Guide de configuration de l'authentification Supabase

## 📋 Prérequis

1. Un compte Supabase (gratuit) : https://supabase.com
2. Un projet Supabase créé

## 🔧 Configuration

### 1. Variables d'environnement

Assurez-vous d'avoir les variables suivantes dans votre fichier `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

Vous pouvez trouver ces valeurs dans votre dashboard Supabase :
- **URL** : Settings > API > Project URL
- **Anon Key** : Settings > API > Project API keys > `anon` `public`

### 2. Configuration de la base de données

1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL (SQL Editor dans le menu de gauche)
3. Exécutez le script `supabase/scripts/supabase-setup.sql` qui crée :
   - La table `profiles` pour stocker les rôles des utilisateurs
   - Les politiques de sécurité (RLS)
   - Les triggers pour créer automatiquement un profil lors de l'inscription

### 3. Créer des utilisateurs de test

#### Option A : Via le Dashboard Supabase

1. Allez dans **Authentication > Users**
2. Cliquez sur **Add user** > **Create new user**
3. Entrez un email et un mot de passe
4. Dans **User Metadata**, ajoutez :
   ```json
   {
     "role": "adherent"
   }
   ```
   ou
   ```json
   {
     "role": "admin"
   }
   ```

#### Option B : Via SQL

```sql
-- Créer un utilisateur adhérent
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'adherent@example.com',
  crypt('motdepasse123', gen_salt('bf')),
  NOW(),
  '{"role": "adherent"}'::jsonb,
  NOW(),
  NOW()
);

-- Créer un utilisateur administrateur
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('motdepasse123', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb,
  NOW(),
  NOW()
);
```

**Note :** Pour créer des utilisateurs via SQL, vous devrez peut-être utiliser l'API Supabase Admin ou créer les utilisateurs via l'interface d'authentification.

### 4. Configuration de l'authentification dans Supabase

1. Allez dans **Authentication > Settings**
2. Assurez-vous que **Enable Email Signup** est activé
3. Configurez les **Email Templates** si nécessaire
4. Dans **URL Configuration**, ajoutez votre URL de production dans **Redirect URLs**

## 🎯 Utilisation

### Connexion

Les utilisateurs peuvent se connecter via la page `/connexion` en choisissant :
- **Adhérent** : pour les utilisateurs avec le rôle `adherent`
- **Administrateur** : pour les utilisateurs avec le rôle `admin`

### Vérification du rôle dans le code

```typescript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { isAdmin, isAdherent, user, profile } = useAuth()
  
  if (isAdmin()) {
    // Contenu réservé aux administrateurs
  }
  
  if (isAdherent()) {
    // Contenu réservé aux adhérents
  }
}
```

## 🔒 Sécurité

- Les mots de passe sont hashés automatiquement par Supabase
- Row Level Security (RLS) est activé sur la table `profiles`
- Les utilisateurs ne peuvent voir et modifier que leur propre profil

## 📝 Notes

- Le plan gratuit de Supabase inclut :
  - 50 000 utilisateurs actifs par mois
  - Authentification illimitée
  - 500 MB de base de données
  - 2 GB de bande passante

- Pour plus d'informations : https://supabase.com/docs/guides/auth

