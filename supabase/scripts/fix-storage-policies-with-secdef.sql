-- =============================================================================
-- SOLUTION FINALE : Politiques Storage avec fonction SECURITY DEFINER
-- =============================================================================

-- 1. CRÉER UNE FONCTION SECURITY DEFINER QUI BYPASS RLS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin_for_storage()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Si pas d'utilisateur authentifié, retourner false
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier dans profiles avec SECURITY DEFINER (bypass RLS)
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES
-- =============================================================================
DO $$
DECLARE
  pol_name TEXT;
BEGIN
  FOR pol_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%admin-files%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol_name);
  END LOOP;
END $$;

-- 3. CRÉER LES POLITIQUES AVEC LA FONCTION SECURITY DEFINER
-- =============================================================================

-- INSERT
CREATE POLICY "Admins can upload to admin-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  (bucket_id = 'admin-files') 
  AND (public.is_admin_for_storage() = true)
);

-- SELECT
CREATE POLICY "Admins can read admin-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  (bucket_id = 'admin-files') 
  AND (public.is_admin_for_storage() = true)
);

-- DELETE
CREATE POLICY "Admins can delete from admin-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  (bucket_id = 'admin-files') 
  AND (public.is_admin_for_storage() = true)
);

-- 4. VÉRIFICATION
-- =============================================================================
SELECT '=== POLITIQUES CRÉÉES AVEC FONCTION SECURITY DEFINER ===' as info;

SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'INSERT' THEN with_check::text
    ELSE qual::text
  END as expression
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%admin-files%'
ORDER BY cmd, policyname;

SELECT '✅ La fonction is_admin_for_storage() utilise SECURITY DEFINER et bypass RLS !' as message;
SELECT '✅ Testez maintenant l''upload dans l''application !' as next_step;

