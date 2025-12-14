-- Script de test pour vérifier que les politiques RLS fonctionnent correctement
-- Exécutez ce script pour voir quelles tables sont accessibles

-- 1. Vérifier que la fonction is_admin existe et fonctionne
SELECT 
  'Fonction is_admin' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_admin' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✓ Existe'
    ELSE '✗ N''existe pas'
  END as resultat;

-- 2. Vérifier les politiques RLS sur les tables principales
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✓ RLS activé'
    ELSE '✗ RLS désactivé'
  END as rls_status,
  (SELECT COUNT(*) 
   FROM pg_policies 
   WHERE schemaname = t.schemaname 
   AND tablename = t.tablename) as nombre_politiques
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('Actu', 'docs', 'documentation', 'doctrine', 'Doctrine', 'article', 'considerant', 'annexe', 'annexes', 'chapitre', 'section', 'reglement', 'liste_annexes')
ORDER BY tablename;

-- 3. Lister toutes les politiques RLS créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Vérifier le profil de l'utilisateur actuel (si connecté)
SELECT 
  'Profil utilisateur actuel' as test,
  auth.uid() as user_id,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as role,
  CASE 
    WHEN public.is_admin() THEN '✓ Est administrateur'
    ELSE '✗ N''est pas administrateur'
  END as statut_admin;
