-- ============================================
-- CONFIGURATION DU BUCKET "admin-files" POUR STOCKER LES FICHIERS ADMIN
-- ============================================
-- 
-- ⚠️ IMPORTANT : 
-- 1. Le bucket lui-même DOIT être créé via le Dashboard Supabase (Storage > New bucket)
-- 2. Les politiques Storage peuvent être créées via SQL (ce script)
--
-- ============================================
-- ÉTAPE 1 : CRÉER LE BUCKET (Dashboard uniquement)
-- ============================================
--
-- 1. Allez dans Supabase Dashboard > Storage
-- 2. Cliquez sur "New bucket" ou "Create bucket"
-- 3. Configurez :
--    - Name: admin-files
--    - Public bucket: ❌ DÉCOCHER (bucket privé)
--    - File size limit: 50 MB (ou selon vos besoins)
--    - Allowed MIME types: (optionnel)
-- 4. Cliquez sur "Create bucket"
--
-- ============================================
-- ÉTAPE 2 : VÉRIFIER/CREER LA FONCTION is_admin() (Optionnel mais recommandé)
-- ============================================

-- Vérifier si la fonction is_admin() existe déjà
-- Si elle n'existe pas, créez-la avec cette version qui vérifie dans profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ÉTAPE 3 : CRÉER LES POLITIQUES STORAGE
-- ============================================
--
-- ⚠️ IMPORTANT : Les politiques Storage NE PEUVENT PAS être créées via SQL.
-- Elles DOIVENT être créées via le Dashboard Supabase uniquement.
--
-- ============================================
-- INSTRUCTIONS POUR CRÉER LES POLITIQUES VIA LE DASHBOARD
-- ============================================
--
-- Les politiques Storage DOIVENT être créées via le Dashboard Supabase :
--
-- 1. Allez dans Storage > admin-files > Policies
-- 2. Cliquez sur "New Policy" pour chaque politique ci-dessous
--
-- POLITIQUE 1 : SELECT (Lecture/Téléchargement)
--   - Policy name: "Admins can read admin-files"
--   - Allowed operation: SELECT
--   - Policy definition: public.is_admin()
--     OU directement :
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.role = 'admin'
--     )
--
-- POLITIQUE 2 : INSERT (Upload)
--   - Policy name: "Admins can upload to admin-files"
--   - Allowed operation: INSERT
--   - Policy definition: public.is_admin()
--     OU directement :
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.role = 'admin'
--     )
--
-- POLITIQUE 3 : DELETE (Suppression)
--   - Policy name: "Admins can delete from admin-files"
--   - Allowed operation: DELETE
--   - Policy definition: public.is_admin()
--     OU directement :
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.role = 'admin'
--     )
--
-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que le bucket existe
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'admin-files'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    RAISE NOTICE '✅ Le bucket "admin-files" existe';
  ELSE
    RAISE WARNING '❌ Le bucket "admin-files" n''existe pas. Créez-le via le Dashboard.';
  END IF;
END $$;

-- Vérifier que la table profiles existe et contient des admins
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles
  WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE NOTICE '✅ % utilisateur(s) admin trouvé(s) dans la table profiles', admin_count;
  ELSE
    RAISE WARNING '⚠️ Aucun utilisateur admin trouvé dans la table profiles';
  END IF;
END $$;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
--
-- 1. Le bucket DOIT être créé via le Dashboard (pas possible via SQL)
-- 2. Les politiques DOIVENT être créées via le Dashboard (pas possible via SQL)
-- 3. La fonction is_admin() vérifie dans la table profiles
-- 4. Assurez-vous que les utilisateurs admin ont bien role = 'admin' dans profiles
-- 5. Le bucket doit être PRIVÉ (pas public) pour la sécurité
--
-- ============================================

