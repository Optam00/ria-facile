# Scripts SQL Supabase

Ce dossier contient les scripts SQL pour configurer et maintenir la base de données Supabase.

## 📁 Organisation

### Scripts de configuration initiale

- **`supabase-setup.sql`** : Configuration initiale de l'authentification
  - Crée la table `profiles` pour les rôles utilisateurs
  - Configure les politiques RLS de base
  - Crée les triggers pour les profils

- **`add-user-roles.sql`** : Ajouter des rôles aux utilisateurs existants
  - Met à jour les métadonnées utilisateur avec le rôle
  - Crée/mettre à jour les profils dans la table `profiles`

- **`create-user-view.sql`** : Crée une vue pour faciliter les requêtes utilisateurs
  - Vue `users_with_roles` qui joint `auth.users` et `profiles`

- **`improve-trigger.sql`** : Améliore le trigger de création de profil
  - Version améliorée du trigger `on_auth_user_created`

### Scripts de sécurité (RLS)

- **`setup-rls-policies.sql`** : Configure les politiques Row Level Security
  - Crée les fonctions helper `is_admin()` et `is_authenticated()`
  - Configure les politiques RLS pour toutes les tables publiques
  - Permet la lecture publique et l'écriture admin

- **`test-rls-access.sql`** : Script de test pour vérifier les politiques RLS
  - Vérifie que les fonctions existent
  - Liste les politiques RLS configurées
  - Teste l'accès de l'utilisateur actuel

## 🚀 Utilisation

### Configuration initiale

1. Exécutez `supabase-setup.sql` dans l'éditeur SQL de Supabase
2. Exécutez `add-user-roles.sql` si vous avez des utilisateurs existants
3. Exécutez `setup-rls-policies.sql` pour configurer les politiques de sécurité

### Vérification

Exécutez `test-rls-access.sql` pour vérifier que tout est correctement configuré.

## 📝 Notes

- Tous les scripts utilisent `IF EXISTS` pour éviter les erreurs si les objets existent déjà
- Les scripts sont idempotents : vous pouvez les exécuter plusieurs fois sans problème
- Les migrations de schéma sont dans `../migrations/`
