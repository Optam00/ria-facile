-- =============================================================================
-- Fonction pour supprimer un utilisateur (appelable par les admins)
-- Note: On ne peut pas supprimer directement dans auth.users via SQL
-- Cette fonction supprime le profil et marque la demande comme complétée
-- L'utilisateur devra être supprimé manuellement depuis le dashboard Supabase
-- ou via une Edge Function avec la clé de service
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_user_email TEXT;
  deleted_profile_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT public.is_admin_direct() THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer des comptes';
  END IF;

  -- Récupérer l'email et le rôle avant suppression
  SELECT u.email, COALESCE(p.role, 'adherent') INTO deleted_user_email, deleted_profile_role
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE u.id = user_id_to_delete;

  IF deleted_user_email IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- Supprimer le profil (cela supprimera aussi les demandes grâce aux CASCADE)
  DELETE FROM public.profiles
  WHERE id = user_id_to_delete;

  -- Note: L'utilisateur dans auth.users reste mais sans profil, il ne pourra plus se connecter
  -- Pour une suppression complète, il faut utiliser l'API Admin de Supabase avec la clé de service
  -- ou supprimer manuellement depuis le dashboard Supabase

  -- Retourner un message de succès
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Profil utilisateur supprimé avec succès. Le compte dans auth.users doit être supprimé manuellement depuis le dashboard Supabase.',
    'deleted_email', deleted_user_email,
    'deleted_role', deleted_profile_role,
    'note', 'Pour supprimer complètement le compte, allez dans Supabase Dashboard > Authentication > Users et supprimez l''utilisateur manuellement.'
  );
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

COMMENT ON FUNCTION public.delete_user_account(UUID) IS 'Supprime un compte utilisateur. Nécessite les droits admin.';

