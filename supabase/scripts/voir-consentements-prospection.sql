-- =============================================================================
-- Voir les consentements à la prospection commerciale des adhérents
-- =============================================================================

-- 1. Voir tous les adhérents avec leur statut de consentement
-- =============================================================================
SELECT 
  id,
  email,
  nom,
  prenom,
  role,
  consentement_prospection,
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'adherent'
ORDER BY 
  consentement_prospection DESC,  -- D'abord ceux qui ont consenti
  created_at DESC;                 -- Puis par date de création

-- 2. Compter les adhérents par statut de consentement
-- =============================================================================
SELECT 
  CASE 
    WHEN consentement_prospection = true THEN 'Consenti'
    WHEN consentement_prospection = false THEN 'Non consenti'
    WHEN consentement_prospection IS NULL THEN 'Non renseigné'
  END as statut,
  COUNT(*) as nombre
FROM public.profiles
WHERE role = 'adherent'
GROUP BY consentement_prospection
ORDER BY statut;

-- 3. Voir un adhérent spécifique (remplacer l'email)
-- =============================================================================
SELECT 
  p.id,
  p.email,
  p.nom,
  p.prenom,
  p.consentement_prospection as consentement_profiles,
  u.raw_user_meta_data->>'consentement_prospection' as consentement_metadata,
  p.updated_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'exemple@email.com'  -- REMPLACER PAR L'EMAIL DE L'ADHÉRENT
  AND p.role = 'adherent';

-- 4. Voir uniquement les adhérents qui ont consenti
-- =============================================================================
SELECT 
  id,
  email,
  nom,
  prenom,
  created_at
FROM public.profiles
WHERE role = 'adherent'
  AND consentement_prospection = true
ORDER BY created_at DESC;

-- 5. Voir uniquement les adhérents qui n'ont PAS consenti
-- =============================================================================
SELECT 
  id,
  email,
  nom,
  prenom,
  created_at
FROM public.profiles
WHERE role = 'adherent'
  AND (consentement_prospection = false OR consentement_prospection IS NULL)
ORDER BY created_at DESC;

