-- =============================================================================
-- Améliorer la fonction is_admin() pour qu'elle soit plus robuste
-- =============================================================================

-- Créer ou remplacer la fonction (sans DROP car elle est utilisée par d'autres politiques)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Vérifier d'abord dans auth.users (table système, pas de RLS)
  SELECT (raw_user_meta_data->>'role')::text INTO user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Si pas trouvé dans auth.users, vérifier dans profiles (avec SECURITY DEFINER pour bypasser RLS)
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Vérifier que la fonction fonctionne
SELECT 
  'Fonction is_admin() créée avec succès' as status,
  public.is_admin() as test_result;

