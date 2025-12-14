-- Script TEMPORAIRE pour désactiver RLS sur Actu et tester l'insertion
-- ⚠️ ATTENTION : Ce script désactive la sécurité RLS - À utiliser uniquement pour tester
-- Une fois le test réussi, réexécutez fix-actu-rls-policy.sql pour réactiver RLS

-- Désactiver RLS temporairement
ALTER TABLE "Actu" DISABLE ROW LEVEL SECURITY;

-- Tester une insertion manuelle (décommentez pour tester)
-- INSERT INTO "Actu" ("Titre", "Date", "media", "lien") 
-- VALUES ('Test sans RLS', '2025-12-15', 'Test', 'https://test.com') 
-- RETURNING *;

-- Pour réactiver RLS après le test, exécutez :
-- ALTER TABLE "Actu" ENABLE ROW LEVEL SECURITY;
-- Puis réexécutez fix-actu-rls-policy.sql
