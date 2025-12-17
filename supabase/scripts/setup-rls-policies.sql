-- Script pour configurer les politiques RLS (Row Level Security) 
-- pour permettre l'accès aux données pour tous les utilisateurs (anon et authenticated)
-- et donner des droits supplémentaires aux administrateurs

-- 1. Fonction helper pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction helper pour vérifier si un utilisateur est authentifié
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Configurer les politiques RLS pour la table Actu (actualités)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Actu') THEN
    ALTER TABLE "Actu" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Actu - Lecture publique" ON "Actu";
    EXECUTE 'CREATE POLICY "Actu - Lecture publique"
      ON "Actu"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "Actu - Écriture admin" ON "Actu";
    EXECUTE 'CREATE POLICY "Actu - Écriture admin"
      ON "Actu"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 4. Configurer les politiques RLS pour la table docs (documentation)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'docs') THEN
    ALTER TABLE "docs" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "docs - Lecture publique" ON "docs";
    EXECUTE 'CREATE POLICY "docs - Lecture publique"
      ON "docs"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "docs - Écriture admin" ON "docs";
    EXECUTE 'CREATE POLICY "docs - Écriture admin"
      ON "docs"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 5. Configurer les politiques RLS pour la table documentation (si elle existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documentation') THEN
    ALTER TABLE "documentation" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "documentation - Lecture publique" ON "documentation";
    EXECUTE 'CREATE POLICY "documentation - Lecture publique"
      ON "documentation"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "documentation - Écriture admin" ON "documentation";
    EXECUTE 'CREATE POLICY "documentation - Écriture admin"
      ON "documentation"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 6. Configurer les politiques RLS pour la table doctrine
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'doctrine') THEN
    ALTER TABLE "doctrine" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "doctrine - Lecture publique" ON "doctrine";
    EXECUTE 'CREATE POLICY "doctrine - Lecture publique"
      ON "doctrine"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "doctrine - Écriture admin" ON "doctrine";
    EXECUTE 'CREATE POLICY "doctrine - Écriture admin"
      ON "doctrine"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 7. Configurer les politiques RLS pour la table Doctrine (si elle existe avec majuscule)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Doctrine') THEN
    ALTER TABLE "Doctrine" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Doctrine - Lecture publique" ON "Doctrine";
    EXECUTE 'CREATE POLICY "Doctrine - Lecture publique"
      ON "Doctrine"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "Doctrine - Écriture admin" ON "Doctrine";
    EXECUTE 'CREATE POLICY "Doctrine - Écriture admin"
      ON "Doctrine"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 8. Configurer les politiques RLS pour la table article
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'article') THEN
    ALTER TABLE "article" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "article - Lecture publique" ON "article";
    EXECUTE 'CREATE POLICY "article - Lecture publique"
      ON "article"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "article - Écriture admin" ON "article";
    EXECUTE 'CREATE POLICY "article - Écriture admin"
      ON "article"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 9. Configurer les politiques RLS pour la table considerant
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'considerant') THEN
    ALTER TABLE "considerant" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "considerant - Lecture publique" ON "considerant";
    EXECUTE 'CREATE POLICY "considerant - Lecture publique"
      ON "considerant"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "considerant - Écriture admin" ON "considerant";
    EXECUTE 'CREATE POLICY "considerant - Écriture admin"
      ON "considerant"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 10. Configurer les politiques RLS pour la table annexe (si elle existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'annexe') THEN
    ALTER TABLE "annexe" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "annexe - Lecture publique" ON "annexe";
    EXECUTE 'CREATE POLICY "annexe - Lecture publique"
      ON "annexe"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "annexe - Écriture admin" ON "annexe";
    EXECUTE 'CREATE POLICY "annexe - Écriture admin"
      ON "annexe"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 11. Configurer les politiques RLS pour la table annexes (si elle existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'annexes') THEN
    ALTER TABLE "annexes" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "annexes - Lecture publique" ON "annexes";
    EXECUTE 'CREATE POLICY "annexes - Lecture publique"
      ON "annexes"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "annexes - Écriture admin" ON "annexes";
    EXECUTE 'CREATE POLICY "annexes - Écriture admin"
      ON "annexes"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- 12. Configurer les politiques RLS pour les autres tables du RIA
-- Chapitres
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapitre') THEN
    ALTER TABLE "chapitre" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "chapitre - Lecture publique" ON "chapitre";
    EXECUTE 'CREATE POLICY "chapitre - Lecture publique"
      ON "chapitre"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "chapitre - Écriture admin" ON "chapitre";
    EXECUTE 'CREATE POLICY "chapitre - Écriture admin"
      ON "chapitre"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Sections
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'section') THEN
    ALTER TABLE "section" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "section - Lecture publique" ON "section";
    EXECUTE 'CREATE POLICY "section - Lecture publique"
      ON "section"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "section - Écriture admin" ON "section";
    EXECUTE 'CREATE POLICY "section - Écriture admin"
      ON "section"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Liste annexes
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'liste_annexes') THEN
    ALTER TABLE "liste_annexes" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "liste_annexes - Lecture publique" ON "liste_annexes";
    EXECUTE 'CREATE POLICY "liste_annexes - Lecture publique"
      ON "liste_annexes"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "liste_annexes - Écriture admin" ON "liste_annexes";
    EXECUTE 'CREATE POLICY "liste_annexes - Écriture admin"
      ON "liste_annexes"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Reglement
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reglement') THEN
    ALTER TABLE "reglement" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "reglement - Lecture publique" ON "reglement";
    EXECUTE 'CREATE POLICY "reglement - Lecture publique"
      ON "reglement"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "reglement - Écriture admin" ON "reglement";
    EXECUTE 'CREATE POLICY "reglement - Écriture admin"
      ON "reglement"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Questions (quiz)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions') THEN
    ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "questions - Lecture publique" ON "questions";
    EXECUTE 'CREATE POLICY "questions - Lecture publique"
      ON "questions"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "questions - Écriture admin" ON "questions";
    EXECUTE 'CREATE POLICY "questions - Écriture admin"
      ON "questions"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Assistant RIA
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assistant_ria') THEN
    ALTER TABLE "assistant_ria" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "assistant_ria - Lecture publique" ON "assistant_ria";
    EXECUTE 'CREATE POLICY "assistant_ria - Lecture publique"
      ON "assistant_ria"
      FOR SELECT
      TO public
      USING (true)';

    DROP POLICY IF EXISTS "assistant_ria - Insertion publique" ON "assistant_ria";
    EXECUTE 'CREATE POLICY "assistant_ria - Insertion publique"
      ON "assistant_ria"
      FOR INSERT
      TO public
      WITH CHECK (true)';

    DROP POLICY IF EXISTS "assistant_ria - Écriture admin" ON "assistant_ria";
    EXECUTE 'CREATE POLICY "assistant_ria - Écriture admin"
      ON "assistant_ria"
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;
