-- =============================================================================
-- Script complet pour la table profiles
-- - Ajoute les colonnes nom, prenom, profession (optionnelles)
-- - Configure les politiques RLS pour l'inscription et la gestion de profil
-- =============================================================================

-- 1. CRÉATION DE LA TABLE PROFILES (si elle n'existe pas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'adherent',
  nom TEXT,
  prenom TEXT,
  profession TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AJOUTER LES COLONNES MANQUANTES (si la table existe déjà)
-- =============================================================================

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
  END IF;
END $$;

-- 3. ACTIVER RLS SUR LA TABLE PROFILES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. SUPPRIMER LES ANCIENNES POLITIQUES (pour éviter les conflits)
-- =============================================================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles - Accès utilisateur" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 5. CRÉER LES NOUVELLES POLITIQUES RLS
-- =============================================================================

-- Politique : Un utilisateur peut lire son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique : Un utilisateur peut créer son propre profil (lors de l'inscription)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique : Un utilisateur peut mettre à jour son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique : Les admins peuvent tout faire sur tous les profils
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. TRIGGER POUR METTRE À JOUR updated_at AUTOMATIQUEMENT
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. VÉRIFICATION FINALE
-- =============================================================================
SELECT 
  'Structure de la table profiles:' as info;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 
  'Politiques RLS actives:' as info;

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
