-- Script pour tester la fonction is_admin()
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier que la fonction existe
SELECT 
  proname as function_name,
  pronargs as num_args,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'is_admin'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Tester la fonction avec l'utilisateur actuel
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email,
  public.is_admin() as is_admin_result,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as role_in_profiles;

-- 3. Vérifier les profils admin
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 4. Tester une insertion manuelle (si vous êtes connecté en tant qu'admin)
-- Décommentez cette ligne pour tester :
-- INSERT INTO "Actu" ("Titre", "Date", "media", "lien") VALUES ('Test manuel', '2025-12-15', 'Test', 'https://test.com') RETURNING *;
