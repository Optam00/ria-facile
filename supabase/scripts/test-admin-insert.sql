-- Script pour tester l'insertion en tant qu'admin
-- À exécuter dans l'éditeur SQL de Supabase (vous devez être connecté)

-- 1. Vérifier votre utilisateur actuel
SELECT 
  auth.uid() as user_id,
  auth.email() as user_email;

-- 2. Vérifier votre rôle dans profiles
SELECT 
  id,
  email,
  role
FROM public.profiles
WHERE id = auth.uid();

-- 3. Tester la condition de la politique directement
SELECT 
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as is_admin_check;

-- 4. Tester une insertion manuelle (décommentez pour tester)
-- INSERT INTO "Actu" ("Titre", "Date", "media", "lien") 
-- VALUES ('Test manuel SQL', '2025-12-15', 'Test', 'https://test.com') 
-- RETURNING *;
