-- TáNaMão Brasil - Esquema de Banco de Dados de Produção para Supabase (PostgreSQL)

-- ============================================================================
-- 1. EXTENSÕES & CONFIGURAÇÕES INICIAIS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. ENUMS / TIPOS CUSTOMIZADOS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('client', 'professional', 'admin');
CREATE TYPE plan_level AS ENUM ('free', 'featured', 'premium');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'inactive', 'expired');
CREATE TYPE report_reason AS ENUM ('fake_phone', 'abuse', 'fraud', 'inappropriate_content', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- ============================================================================
-- 3. FUNÇÃO AUXILIAR PARA ATUALIZAÇÃO AUTOMÁTICA DE UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TABELA: profiles (Integrada com Supabase Auth)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'client',
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Gatilho para updated_at em profiles
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 5. TABELA: categories (Categorias de Serviços)
-- ============================================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. TABELA: cities (Municípios Brasileiros)
-- ============================================================================
CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    state_code CHAR(2) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    CONSTRAINT unique_city_state UNIQUE (name, state_code)
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. TABELA: professionals (Perfil Estendido)
-- ============================================================================
CREATE TABLE public.professionals (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT NOT NULL,
    whatsapp VARCHAR(25) NOT NULL,
    address VARCHAR(255),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    plan_type plan_level NOT NULL DEFAULT 'free',
    rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Gatilho para updated_at em professionals
CREATE TRIGGER set_timestamp_professionals
BEFORE UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 8. TABELA: professional_categories (Relação N:N de Especialidades)
-- ============================================================================
CREATE TABLE public.professional_categories (
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (professional_id, category_id)
);

ALTER TABLE public.professional_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. TABELA: professional_photos (Galeria e Portfólio)
-- ============================================================================
CREATE TABLE public.professional_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.professional_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. TABELA: reviews (Avaliações e Notas)
-- ============================================================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT prevent_self_review CHECK (client_id <> professional_id),
    CONSTRAINT unique_client_professional_review UNIQUE (client_id, professional_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. TABELA: reports (Denúncias de Moderação)
-- ============================================================================
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
    reason report_reason NOT NULL DEFAULT 'other',
    details TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Gatilho para updated_at em reports
CREATE TRIGGER set_timestamp_reports
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 12. TABELA: plans (Catálogo Estático de Planos Monetários)
-- ============================================================================
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    photos_limit INTEGER NOT NULL DEFAULT 3,
    has_badge BOOLEAN NOT NULL DEFAULT FALSE,
    priority_level INTEGER NOT NULL DEFAULT 0, -- 0: Free, 1: Featured, 2: Premium
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 13. TABELA: subscriptions (Gerenciamento de Assinaturas Ativas)
-- ============================================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'pending',
    external_id VARCHAR(100), -- Identificador externo do Mercado Pago
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Gatilho para updated_at em subscriptions
CREATE TRIGGER set_timestamp_subscriptions
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- ============================================================================
-- 14. FUNÇÕES SQL & TRIGGERS AVANÇADOS
-- ============================================================================

-- A. Recálculo Automático da Média de Avaliações do Profissional
CREATE OR REPLACE FUNCTION update_professional_rating_metrics()
RETURNS TRIGGER AS $$
DECLARE
    v_professional_id UUID;
    v_avg DECIMAL(3,2);
    v_count INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_professional_id := OLD.professional_id;
    ELSE
        v_professional_id := NEW.professional_id;
    END IF;

    SELECT COALESCE(AVG(rating), 0.00), COUNT(*)
    INTO v_avg, v_count
    FROM public.reviews
    WHERE professional_id = v_professional_id 
      AND is_approved = TRUE 
      AND deleted_at IS NULL;

    UPDATE public.professionals
    SET rating_avg = v_avg,
        rating_count = v_count,
        updated_at = NOW()
    WHERE id = v_professional_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating_metrics
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_professional_rating_metrics();


-- B. Sincronização Automática com Supabase Auth (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 15. ÍNDICES DE ALTA PERFORMANCE (ESCALABILIDADE NACIONAL)
-- ============================================================================

-- Busca Facetada (Cidade + Categoria + Plano/Ranking)
CREATE INDEX idx_professionals_search_lookup 
ON public.professionals (city_id, plan_type, rating_avg DESC, updated_at DESC)
WHERE is_approved = TRUE AND deleted_at IS NULL;

-- Índices de busca direta em tabelas geográficas e de categorização
CREATE INDEX idx_cities_slug ON public.cities (slug);
CREATE INDEX idx_cities_lookup_state ON public.cities (state_code);
CREATE INDEX idx_categories_slug ON public.categories (slug);

-- Relação n:n (Chaves estrangeiras indexadas)
CREATE INDEX idx_prof_cat_category_id ON public.professional_categories (category_id);

-- Otimização de Busca de Avaliações
CREATE INDEX idx_reviews_professional_lookup ON public.reviews (professional_id) 
WHERE is_approved = TRUE AND deleted_at IS NULL;

-- Monitoramento e faturamento de assinaturas
CREATE INDEX idx_subscriptions_status_expiry ON public.subscriptions (status, expires_at);
CREATE INDEX idx_subscriptions_professional ON public.subscriptions (professional_id);

-- Monitoramento administrativo de denúncias não resolvidas
CREATE INDEX idx_reports_pending ON public.reports (status, created_at DESC);


-- ============================================================================
-- 16. VIEWS DE SUPORTE À CONSULTA E DASHBOARD
-- ============================================================================

-- Catálogo de profissionais unificado com dados de perfil, geográficos e planos
CREATE OR REPLACE VIEW public.view_active_catalog AS
SELECT 
    p.id AS professional_id,
    prof.full_name,
    prof.avatar_url,
    p.bio,
    p.whatsapp,
    p.address,
    p.plan_type,
    p.rating_avg,
    p.rating_count,
    c.id AS city_id,
    c.name AS city_name,
    c.state_code,
    c.slug AS city_slug
FROM public.professionals p
JOIN public.profiles prof ON p.id = prof.id
JOIN public.cities c ON p.city_id = c.id
WHERE p.is_approved = TRUE 
  AND p.deleted_at IS NULL 
  AND prof.deleted_at IS NULL;
