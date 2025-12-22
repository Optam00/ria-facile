-- =============================================================================
-- Vérifier les données d'un utilisateur spécifique dans la table profiles
-- Remplace USER_ID par l'ID de l'utilisateur (5e086d94-0196-4f23-94e0-d0632365ddd5)
-- =============================================================================

-- 1. VÉRIFIER LES DONNÉES DE L'UTILISATEUR
-- =============================================================================
SELECT '=== DONNÉES DANS PROFILES ===' as info;

SELECT 
  id,
  email,
  role,
  nom,
  prenom,
  profession,
  created_at,
  updated_at
FROM public.profiles 
WHERE id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

-- 2. VÉRIFIER LES MÉTADONNÉES DANS AUTH.USERS
-- =============================================================================
SELECT '=== MÉTADONNÉES DANS AUTH.USERS ===' as info;

SELECT 
  id,
  email,
  raw_user_meta_data->>'nom' as nom_metadata,
  raw_user_meta_data->>'prenom' as prenom_metadata,
  raw_user_meta_data->>'profession' as profession_metadata,
  raw_user_meta_data->>'role' as role_metadata
FROM auth.users 
WHERE id = '5e086d94-0196-4f23-94e0-d0632365ddd5';

-- 3. TESTER LES POLITIQUES RLS (en tant qu'utilisateur authentifié)
-- =============================================================================
-- Cette requête simule ce que fait l'application
-- Elle devrait retourner les données si les politiques RLS sont correctes

