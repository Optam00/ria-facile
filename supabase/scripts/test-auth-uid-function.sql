-- =============================================================================
-- Créer une fonction de test pour vérifier auth.uid()
-- =============================================================================

-- Fonction simple pour tester auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tester la fonction (remplacer par ton user_id)
-- SELECT public.get_user_id();

