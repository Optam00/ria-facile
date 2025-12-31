-- Ajouter une politique Storage RLS pour permettre aux adhérents de télécharger les fichiers disponibles
-- Cette politique doit être ajoutée après avoir créé la table adherent_files

-- Policy: Les adhérents peuvent lire les fichiers du bucket admin-files 
-- uniquement si le fichier est marqué comme disponible dans adherent_files
CREATE POLICY "Adherents can download available files from admin-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  (bucket_id = 'admin-files')
  AND EXISTS (
    SELECT 1 FROM public.adherent_files
    WHERE file_name = (storage.objects.name)
    AND is_available = true
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'adherent'
  )
);

-- Vérification
SELECT '✅ Politique Storage pour les adhérents créée avec succès' as message;
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%adherent%'
ORDER BY policyname;

