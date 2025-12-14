-- Script pour ajouter les rôles aux utilisateurs existants
-- Remplacez les emails par ceux de vos utilisateurs

-- Pour un utilisateur ADHÉRENT (remplacez l'email)
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "adherent"}'::jsonb
WHERE email = 'polainapro@gmail.com'; -- REMPLACEZ PAR L'EMAIL DE VOTRE ADHÉRENT

-- Créer/mettre à jour le profil dans la table profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'adherent'
FROM auth.users
WHERE email = 'polainapro@gmail.com' -- REMPLACEZ PAR L'EMAIL DE VOTRE ADHÉRENT
ON CONFLICT (id) 
DO UPDATE SET role = 'adherent', email = EXCLUDED.email;

-- Pour un utilisateur ADMINISTRATEUR (créez d'abord l'utilisateur via l'interface)
-- Puis exécutez cette requête en remplaçant l'email
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@test.com'; -- REMPLACEZ PAR L'EMAIL DE VOTRE ADMIN

-- Créer/mettre à jour le profil admin
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@test.com' -- REMPLACEZ PAR L'EMAIL DE VOTRE ADMIN
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', email = EXCLUDED.email;

