-- Script pour ajouter les champs nom, prenom et profession à la table profiles
-- Ces champs sont optionnels (nullable)

-- Ajouter la colonne 'nom' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'nom'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN nom TEXT;
    RAISE NOTICE 'Colonne "nom" ajoutée à la table profiles';
  ELSE
    RAISE NOTICE 'Colonne "nom" existe déjà';
  END IF;
END $$;

-- Ajouter la colonne 'prenom' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'prenom'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN prenom TEXT;
    RAISE NOTICE 'Colonne "prenom" ajoutée à la table profiles';
  ELSE
    RAISE NOTICE 'Colonne "prenom" existe déjà';
  END IF;
END $$;

-- Ajouter la colonne 'profession' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'profession'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN profession TEXT;
    RAISE NOTICE 'Colonne "profession" ajoutée à la table profiles';
  ELSE
    RAISE NOTICE 'Colonne "profession" existe déjà';
  END IF;
END $$;

-- Vérification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

