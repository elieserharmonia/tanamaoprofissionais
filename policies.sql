-- TáNaMão Brasil - Políticas RLS (Row Level Security) Completas para Supabase

-- Habilitando RLS em todas as tabelas (redundância de segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para prevenção de duplicados ou conflitos
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all_policy" ON public.categories;

DROP POLICY IF EXISTS "cities_select_policy" ON public.cities;
DROP POLICY IF EXISTS "cities_admin_all_policy" ON public.cities;

DROP POLICY IF EXISTS "professionals_select_policy" ON public.professionals;
DROP POLICY IF EXISTS "professionals_insert_policy" ON public.professionals;
DROP POLICY IF EXISTS "professionals_update_policy" ON public.professionals;
DROP POLICY IF EXISTS "professionals_delete_policy" ON public.professionals;

DROP POLICY IF EXISTS "professional_categories_select_policy" ON public.professional_categories;
DROP POLICY IF EXISTS "professional_categories_all_policy" ON public.professional_categories;

DROP POLICY IF EXISTS "professional_photos_select_policy" ON public.professional_photos;
DROP POLICY IF EXISTS "professional_photos_insert_policy" ON public.professional_photos;
DROP POLICY IF EXISTS "professional_photos_update_delete_policy" ON public.professional_photos;

DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON public.reviews;

DROP POLICY IF EXISTS "reports_select_policy" ON public.reports;
DROP POLICY IF EXISTS "reports_insert_policy" ON public.reports;
DROP POLICY IF EXISTS "reports_update_delete_policy" ON public.reports;

DROP POLICY IF EXISTS "plans_select_policy" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_all_policy" ON public.plans;

DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete_admin_policy" ON public.subscriptions;


-- ============================================================================
-- FUNÇÕES DE APOIO PARA CLAIMS / ROLES
-- ============================================================================

-- Verifica se o usuário autenticado atual possui a role 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se o usuário autenticado atual possui a role 'professional'
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'professional' AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 1. TABELA: profiles
-- ============================================================================

-- SELECT: Qualquer visitante público ou logado pode visualizar perfis não deletados
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (deleted_at IS NULL);

-- INSERT: Permitido para qualquer um (necessário para fluxo de registro/trigger)
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (true);

-- UPDATE: O próprio usuário pode atualizar seu perfil, ou Administradores
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- DELETE: Apenas administradores podem deletar ou aplicar soft delete
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin());


-- ============================================================================
-- 2. TABELA: categories
-- ============================================================================

-- SELECT: Leitura pública de todas as categorias
CREATE POLICY "categories_select_policy" ON public.categories
FOR SELECT
USING (true);

-- ALL: Administração total reservada aos usuários com privilégios de Admin
CREATE POLICY "categories_admin_all_policy" ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================================
-- 3. TABELA: cities
-- ============================================================================

-- SELECT: Leitura pública de todos os municípios
CREATE POLICY "cities_select_policy" ON public.cities
FOR SELECT
USING (true);

-- ALL: Manipulação de municípios restrita aos Admins
CREATE POLICY "cities_admin_all_policy" ON public.cities
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================================
-- 4. TABELA: professionals
-- ============================================================================

-- SELECT: Qualquer pessoa lê perfis aprovados e ativos
CREATE POLICY "professionals_select_policy" ON public.professionals
FOR SELECT
USING ((is_approved = true AND deleted_at IS NULL) OR auth.uid() = id OR public.is_admin());

-- INSERT: Profissionais cadastram seus próprios perfis
CREATE POLICY "professionals_insert_policy" ON public.professionals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND public.is_professional());

-- UPDATE: O próprio profissional edita seu perfil, ou Administradores
CREATE POLICY "professionals_update_policy" ON public.professionals
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- DELETE: Reservado estritamente aos administradores
CREATE POLICY "professionals_delete_policy" ON public.professionals
FOR DELETE
TO authenticated
USING (public.is_admin());


-- ============================================================================
-- 5. TABELA: professional_categories
-- ============================================================================

-- SELECT: Qualquer pessoa visualiza os setores associados dos profissionais
CREATE POLICY "professional_categories_select_policy" ON public.professional_categories
FOR SELECT
USING (true);

-- ALL: O profissional ou o Admin gerencia essa relação n:n
CREATE POLICY "professional_categories_all_policy" ON public.professional_categories
FOR ALL
TO authenticated
USING (auth.uid() = professional_id OR public.is_admin())
WITH CHECK (auth.uid() = professional_id OR public.is_admin());


-- ============================================================================
-- 6. TABELA: professional_photos
-- ============================================================================

-- SELECT: Fotos aprovadas são públicas; fotos não aprovadas aparecem apenas pro próprio profissional/admin
CREATE POLICY "professional_photos_select_policy" ON public.professional_photos
FOR SELECT
USING (is_approved = true OR auth.uid() = professional_id OR public.is_admin());

-- INSERT: Profissionais autenticados adicionam mídias de seu próprio portfólio
CREATE POLICY "professional_photos_insert_policy" ON public.professional_photos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = professional_id 
  AND public.is_professional()
);

-- UPDATE/DELETE: Profissional ou Administrador administram as fotos
CREATE POLICY "professional_photos_update_delete_policy" ON public.professional_photos
FOR ALL
TO authenticated
USING (auth.uid() = professional_id OR public.is_admin())
WITH CHECK (auth.uid() = professional_id OR public.is_admin());


-- ============================================================================
-- 7. TABELA: reviews
-- ============================================================================

-- SELECT: Leitura pública das avaliações aprovadas
CREATE POLICY "reviews_select_policy" ON public.reviews
FOR SELECT
USING ((is_approved = true AND deleted_at IS NULL) OR auth.uid() = client_id OR public.is_admin());

-- INSERT: Clientes logados avaliam profissionais (impedindo auto-avaliação)
CREATE POLICY "reviews_insert_policy" ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = client_id 
  AND auth.uid() <> professional_id
);

-- UPDATE: Clientes editam suas próprias avaliações; admins editam para aprovar/reprovar
CREATE POLICY "reviews_update_policy" ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = client_id OR public.is_admin())
WITH CHECK (auth.uid() = client_id OR public.is_admin());

-- DELETE: O próprio cliente remove a avaliação ou administradores fazem moderação
CREATE POLICY "reviews_delete_policy" ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = client_id OR public.is_admin());


-- ============================================================================
-- 8. TABELA: reports
-- ============================================================================

-- SELECT: Filtro rígido onde apenas administradores visualizam as denúncias abertas
CREATE POLICY "reports_select_policy" ON public.reports
FOR SELECT
TO authenticated
USING (public.is_admin());

-- INSERT: Qualquer usuário autenticado (incluindo clientes) pode lançar denúncias
CREATE POLICY "reports_insert_policy" ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

-- UPDATE/DELETE: Apenas administradores resolvem ou encerram denúncias
CREATE POLICY "reports_update_delete_policy" ON public.reports
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================================
-- 9. TABELA: plans
-- ============================================================================

-- SELECT: Detalhes dos planos vigentes são abertos para todos visualizarem
CREATE POLICY "plans_select_policy" ON public.plans
FOR SELECT
USING (true);

-- ALL: Modificações de ofertas e planos exclusivas ao Administrador
CREATE POLICY "plans_admin_all_policy" ON public.plans
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================================
-- 10. TABELA: subscriptions
-- ============================================================================

-- SELECT: Dono profissional de sua respectiva assinatura ou administradores leem históricos de pagamento
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = professional_id OR public.is_admin());

-- INSERT: O próprio profissional cria sua requisição de assinatura
CREATE POLICY "subscriptions_insert_policy" ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = professional_id);

-- UPDATE: O profissional atualiza parâmetros de sua assinatura, ou Administradores
CREATE POLICY "subscriptions_update_policy" ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = professional_id OR public.is_admin())
WITH CHECK (auth.uid() = professional_id OR public.is_admin());

-- DELETE: Exclusão total só é efetuada se houver ação por Admins
CREATE POLICY "subscriptions_delete_admin_policy" ON public.subscriptions
FOR DELETE
TO authenticated
USING (public.is_admin());
