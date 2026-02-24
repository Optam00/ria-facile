-- Script pour nettoyer et recréer les politiques RLS du bucket fiches-pratiques-images
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- Supprimer toutes les politiques existantes pour le bucket fiches-pratiques-images
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%fiches-pratiques-images%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    RAISE NOTICE 'Politique supprimée: %', policy_record.policyname;
  END LOOP;
END $$;

-- Vérifier que le bucket existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'fiches-pratiques-images'
  ) THEN
    RAISE EXCEPTION 'Le bucket fiches-pratiques-images n''existe pas. Créez-le d''abord dans le Dashboard Supabase > Storage.';
  END IF;
  RAISE NOTICE 'Bucket fiches-pratiques-images trouvé';
END $$;

-- 1. Politique SELECT : Lecture publique (tous les utilisateurs peuvent lire)
CREATE POLICY "Public Access for fiches-pratiques-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'fiches-pratiques-images');

-- 2. Politique INSERT : Seuls les admins peuvent uploader
CREATE POLICY "Admin can upload to fiches-pratiques-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fiches-pratiques-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. Politique UPDATE : Seuls les admins peuvent modifier
CREATE POLICY "Admin can update fiches-pratiques-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fiches-pratiques-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Politique DELETE : Seuls les admins peuvent supprimer
CREATE POLICY "Admin can delete from fiches-pratiques-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fiches-pratiques-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Vérifier les politiques créées
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%fiches-pratiques-images%'
ORDER BY policyname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Politiques RLS créées avec succès pour le bucket fiches-pratiques-images';
END $$;
