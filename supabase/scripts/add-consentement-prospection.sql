-- =============================================================================
-- Ajouter le champ consentement_prospection à la table profiles
-- =============================================================================

-- 1. Ajouter la colonne si elle n'existe pas
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'consentement_prospection'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN consentement_prospection BOOLEAN DEFAULT false;
    RAISE NOTICE 'Colonne "consentement_prospection" ajoutée à la table profiles';
  ELSE
    RAISE NOTICE 'Colonne "consentement_prospection" existe déjà';
  END IF;
END $$;

-- 2. Vérification
-- =============================================================================
SELECT '=== COLONNE CONSENTEMENT_PROSPECTION ===' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'consentement_prospection';

SELECT '✅ Colonne consentement_prospection créée/vérifiée avec succès !' as message;

