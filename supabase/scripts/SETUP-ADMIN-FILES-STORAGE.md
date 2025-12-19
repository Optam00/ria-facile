# 📁 Configuration Supabase Storage pour la gestion de fichiers admin

## 📋 Instructions étape par étape

### Étape 1 : Créer le bucket dans Supabase Dashboard

1. Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Storage** (dans le menu de gauche)
4. Cliquez sur **"New bucket"** ou **"Create bucket"**
5. Configurez le bucket :
   - **Name** : `admin-files`
   - **Public bucket** : ❌ **Décocher** (bucket privé - important pour la sécurité)
   - **File size limit** : `50 MB` (ou selon vos besoins)
   - **Allowed MIME types** : (optionnel, laissez vide pour accepter tous les types)
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel .xlsx)
     - `application/vnd.ms-excel` (Excel .xls)
     - `application/msword` (Word .doc)
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (Word .docx)
     - `application/pdf` (PDF)
6. Cliquez sur **"Create bucket"**

### Étape 2 : Créer les politiques de sécurité (RLS)

⚠️ **IMPORTANT** : Les politiques Storage doivent être créées via le Dashboard Supabase, car elles ne peuvent pas être créées directement via SQL.

1. Dans **Storage**, cliquez sur le bucket `admin-files`
2. Allez dans l'onglet **"Policies"**
3. Cliquez sur **"New Policy"** pour créer chaque politique ci-dessous

#### Politique 1 : SELECT (Lecture/Téléchargement)

- **Policy name** : `Admins can read admin-files`
- **Allowed operation** : `SELECT`
- **Policy definition** :
```sql
EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
)
```

#### Politique 2 : INSERT (Upload)

- **Policy name** : `Admins can upload to admin-files`
- **Allowed operation** : `INSERT`
- **Policy definition** :
```sql
EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
)
```

#### Politique 3 : DELETE (Suppression)

- **Policy name** : `Admins can delete from admin-files`
- **Allowed operation** : `DELETE`
- **Policy definition** :
```sql
EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
)
```

### Étape 3 : Alternative - Utiliser une fonction helper (Recommandé)

Si vous avez déjà une fonction `is_admin()` dans votre base de données, vous pouvez l'utiliser :

**Policy definition** (pour les 3 politiques) :
```sql
public.is_admin()
```

Cette approche est plus maintenable si vous modifiez la logique de vérification admin à l'avenir.

### Étape 4 : Vérifier que la table profiles existe et contient les rôles

Assurez-vous que :
1. La table `profiles` existe dans votre base de données
2. Les utilisateurs admin ont bien `role = 'admin'` dans cette table
3. La table `profiles` a une colonne `id` qui correspond à `auth.uid()`

Vous pouvez vérifier avec cette requête SQL :
```sql
SELECT id, email, role 
FROM public.profiles 
WHERE role = 'admin';
```

## ✅ Vérification

Une fois configuré, vous devriez pouvoir :

1. Accéder à la console admin (en tant qu'admin)
2. Aller dans **Fichiers > Gérer les fichiers** (ou l'action correspondante)
3. Uploader un fichier (Excel, Word, PDF, etc.)
4. Le voir dans la liste des fichiers
5. Le télécharger
6. Le supprimer

## 🔒 Sécurité

- ✅ Seuls les utilisateurs avec `role = 'admin'` dans la table `profiles` peuvent accéder aux fichiers
- ✅ Le bucket est privé (non public)
- ✅ Les fichiers sont stockés de manière sécurisée dans Supabase Storage
- ✅ Les politiques RLS vérifient l'identité de l'utilisateur à chaque opération

## 📝 Notes importantes

- **Taille maximale** : La taille maximale des fichiers dépend de votre configuration Supabase (généralement 50MB par défaut)
- **Nommage** : Les fichiers sont stockés avec un timestamp pour éviter les collisions de noms : `${Date.now()}-${fileName}`
- **Organisation** : Vous pouvez organiser les fichiers en dossiers en modifiant le code si nécessaire
- **Métadonnées** : Le code récupère automatiquement les métadonnées des fichiers (taille, type MIME, date de création)

## 🐛 Dépannage

### Erreur : "new row violates row-level security policy"

**Cause** : Les politiques RLS ne sont pas correctement configurées ou l'utilisateur n'a pas le rôle admin.

**Solution** :
1. Vérifiez que l'utilisateur a bien `role = 'admin'` dans la table `profiles`
2. Vérifiez que les politiques sont bien créées dans le Dashboard
3. Vérifiez que la syntaxe SQL des politiques est correcte

### Erreur : "Bucket not found"

**Cause** : Le bucket `admin-files` n'existe pas.

**Solution** : Créez le bucket via le Dashboard Supabase (Étape 1).

### Erreur : "File size exceeds maximum"

**Cause** : Le fichier est trop volumineux.

**Solution** : Augmentez la limite de taille dans les paramètres du bucket ou réduisez la taille du fichier.

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Politiques RLS Storage](https://supabase.com/docs/guides/storage/security/access-control)

