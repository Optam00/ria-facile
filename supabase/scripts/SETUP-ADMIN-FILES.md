# Configuration Supabase Storage pour la gestion de fichiers admin

## 📋 Instructions étape par étape

### Étape 1 : Créer le bucket dans Supabase Dashboard

1. Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Storage** (dans le menu de gauche)
4. Cliquez sur **"New bucket"** ou **"Create bucket"**
5. Configurez le bucket :
   - **Name** : `admin-files`
   - **Public bucket** : ❌ **Décocher** (bucket privé)
   - **File size limit** : `50 MB` (ou selon vos besoins)
   - **Allowed MIME types** : Laissez vide pour accepter tous les types, ou spécifiez :
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel .xlsx)
     - `application/vnd.ms-excel` (Excel .xls)
     - `application/msword` (Word .doc)
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (Word .docx)
     - `application/pdf` (PDF)
6. Cliquez sur **"Create bucket"**

### Étape 2 : Configurer les politiques de sécurité (RLS)

1. Dans **Storage**, cliquez sur le bucket `admin-files`
2. Allez dans l'onglet **"Policies"**
3. Créez **3 politiques** :

#### Politique 1 : SELECT (Lecture)
- **Policy name** : `Admins can read admin-files`
- **Allowed operation** : `SELECT`
- **Policy definition** :
```sql
(auth.jwt() ->> 'role')::text = 'admin'
```

#### Politique 2 : INSERT (Upload)
- **Policy name** : `Admins can upload to admin-files`
- **Allowed operation** : `INSERT`
- **Policy definition** :
```sql
(auth.jwt() ->> 'role')::text = 'admin'
```

#### Politique 3 : DELETE (Suppression)
- **Policy name** : `Admins can delete from admin-files`
- **Allowed operation** : `DELETE`
- **Policy definition** :
```sql
(auth.jwt() ->> 'role')::text = 'admin'
```

### Étape 3 : Vérifier que le rôle admin est bien dans le JWT

Assurez-vous que le rôle `admin` est bien présent dans le JWT de l'utilisateur. Si ce n'est pas le cas, vous devrez peut-être utiliser une autre méthode pour vérifier les permissions (par exemple, vérifier dans la table `profiles`).

### Alternative : Utiliser les politiques via SQL

Si vous préférez utiliser SQL directement, exécutez le fichier `create-admin-files-bucket.sql` dans l'éditeur SQL de Supabase.

**Note importante** : La création du bucket elle-même doit se faire via le Dashboard, mais les politiques peuvent être créées via SQL.

## ✅ Vérification

Une fois configuré, vous devriez pouvoir :
1. Accéder à la console admin
2. Aller dans **Fichiers > Gérer les fichiers**
3. Uploader un fichier Excel, Word ou PDF
4. Le voir dans la liste
5. Le télécharger ou le supprimer

## 🔒 Sécurité

- Seuls les utilisateurs avec le rôle `admin` dans leur JWT peuvent accéder aux fichiers
- Le bucket est privé (non public)
- Les fichiers sont stockés de manière sécurisée dans Supabase Storage

## 📝 Notes

- La taille maximale des fichiers dépend de votre configuration Supabase (généralement 50MB par défaut)
- Les fichiers sont stockés avec un timestamp pour éviter les collisions de noms
- Vous pouvez organiser les fichiers en dossiers en modifiant le code si nécessaire

