-- Créer une vue qui joint auth.users et profiles pour faciliter les requêtes
-- Cette vue donne l'impression d'avoir une seule table avec le rôle

CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.updated_at,
  u.last_sign_in_at,
  COALESCE(p.role, 'adherent') as role,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Donner les permissions nécessaires
GRANT SELECT ON public.users_with_roles TO authenticated;
GRANT SELECT ON public.users_with_roles TO anon;

-- Créer une fonction pour obtenir facilement le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(role, 'adherent')
    FROM public.profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

