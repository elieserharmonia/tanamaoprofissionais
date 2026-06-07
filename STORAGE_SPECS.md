# Especificação de Arquitetura de Supabase Storage: TáNaMão Brasil

Este documento define a infraestrutura técnica e de segurança para gerenciamento de arquivos de mídia da plataforma **TáNaMão Brasil**, utilizando o **Supabase Storage**.

---

## 1. Visão Geral dos Buckets

A plataforma utiliza **5 buckets** dedicados, projetados com acessos públicos ou privados, restrições estritas de tamanho, formatos aceitos e políticas de segurança sob medida.

| Nome do Bucket | Tipo de Acesso | Tamanho Máximo | Formatos Permitidos | Finalidade Operacional |
| :--- | :--- | :--- | :--- | :--- |
| **`avatars`** | Público | 2 MB | `image/jpeg`, `image/png`, `image/webp` | Imagens de perfil de usuários comuns e profissionais. |
| **`portfolios`** | Público | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Fotos de portfólio dos profissionais das categorias. |
| **`categories`** | Público | 1 MB | `image/svg+xml`, `image/png` | Ícones e ilustrações de exibição de categorias na Home. |
| **`banners`** | Público | 3 MB | `image/jpeg`, `image/png`, `image/webp` | Imagens promocionais e cabeçalhos do blog ou home. |
| **`reports`** | Privado | 4 MB | `image/jpeg`, `image/png`, `application/pdf` | Provas, capturas de tela e documentos enviados em denúncias. |

---

## 2. Estrutura de Diretórios e Nomenclatura

A organização de arquivos no Storage segue padrões determinísticos para evitar colisões e facilitar purgas ou sanitizações subsequentes:

### 2.1 Bucket: `avatars`
- **Padrão de Caminho:** `{user_id}/avatar_{timestamp}.{extension}`
- **Exemplo:** `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/avatar_1717387343.webp`
- *Por que o timestamp?* Evitar problemas de cache agressivo na CDN do Supabase.

### 2.2 Bucket: `portfolios`
- **Padrão de Caminho:** `{professional_id}/{photo_id}_{order_index}.{extension}`
- **Exemplo:** `8c3dfb2d-1a2b-3c4d-9090-abcdefabcdef/img_023a1a_1.jpg`
- *Abstração:* Permite referenciar dinamicamente no frontend os índices das fotos no painel de controle.

### 2.3 Bucket: `categories`
- **Padrão de Caminho:** `icons/{slug_category}.{extension}`
- **Exemplo:** `icons/eletricista.svg`

### 2.4 Bucket: `banners`
- **Padrão de Caminho:** `promotional/{banner_slug}_{timestamp}.{extension}`
- **Exemplo:** `promotional/campanha_dia_do_pintor_1717387343.jpg`

### 2.5 Bucket: `reports`
- **Padrão de Caminho:** `{report_uuid}/{evidence_id}.{extension}`
- **Exemplo:** `da19b22a-eef1-4b0c-99fb-9ccff1b23838/screenshot_34b9cf.png`

---

## 3. Segurança Integrada e RLS (Row Level Security)

Para que arquivos privados de denúncias não fiquem expostos a links públicos de internet, a segurança é segmentada:
1. **Regra de Propriedade:** Usuários autônomos e profissionais só podem adicionar, ler ou excluir arquivos do seu próprio subdiretório `{user_id}` ou `{professional_id}`.
2. **Isolamento de Cache de Administração:** As provas de denúncia do bucket `reports` não possuem links gerados públicos. A visualização só é autorizada para gestores cadastrados como `'admin'` na tabela `profiles` através da verificação de token JWT do Supabase ou URLs assinadas de curta duração (expiração em 5 minutos).

---

## 4. Scripts SQL de Inicialização e Políticas de Storage

O script SQL a seguir provê a criação nativa dos buckets na tabela `storage.buckets` e atribui políticas dinâmicas em `storage.objects` para o motor de permissões do PostgreSQL no Supabase.

```sql
-- ============================================================================
-- 1. CRIAÇÃO DOS BUCKETS NO SUPABASE STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'avatars', 
    'avatars', 
    true, 
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'portfolios', 
    'portfolios', 
    true, 
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'categories', 
    'categories', 
    true, 
    1048576, -- 1 MB
    ARRAY['image/png', 'image/svg+xml']::text[]
  ),
  (
    'banners', 
    'banners', 
    true, 
    3145728, -- 3 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'reports', 
    'reports', 
    false, -- TOTALMENTE PRIVADO
    4194304, -- 4 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
  )
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ============================================================================
-- 2. FUNÇÕES DE SUPORTE ÀS POLÍTICAS (Claims de Perfil)
-- ============================================================================

-- Verifica se o usuário autenticado que está tentando efetuar o request é Administrador
CREATE OR REPLACE FUNCTION public.storage_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 3. POLÍTICAS DE ACESSO PARA CADA BUCKET (storage.objects)
-- ============================================================================

-- Remover qualquer política anterior para evitar conflitos na reinicialização
DROP POLICY IF EXISTS "Leitura Geral de Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Inserção de Avatars pelo Dono" ON storage.objects;
DROP POLICY IF EXISTS "Edição e Exclusão de Avatars pelo Dono" ON storage.objects;

DROP POLICY IF EXISTS "Leitura Geral de Portfólios" ON storage.objects;
DROP POLICY IF EXISTS "Inserção de Portfólio pelo Dono" ON storage.objects;
DROP POLICY IF EXISTS "Exclusão de Portfólio pelo Dono" ON storage.objects;

DROP POLICY IF EXISTS "Leitura Geral de Categorias" ON storage.objects;
DROP POLICY IF EXISTS "Escrita Administrativa de Categorias" ON storage.objects;

DROP POLICY IF EXISTS "Leitura Geral de Banners" ON storage.objects;
DROP POLICY IF EXISTS "Escrita Administrativa de Banners" ON storage.objects;

DROP POLICY IF EXISTS "Leitura de Denúncias Filtrada" ON storage.objects;
DROP POLICY IF EXISTS "Usuário Registra Foto de Denúncia" ON storage.objects;


-- ----------------------------------------------------------------------------
-- 3.1 Bucket: avatars
-- ----------------------------------------------------------------------------

-- Qualquer um (Logado ou Anônimo) lê avatars da internet
CREATE POLICY "Leitura Geral de Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- O usuário autenticado insere seu próprio avatar (Caminho da pasta baseado no seu uuid)
CREATE POLICY "Inserção de Avatars pelo Dono"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- O usuário autenticado atualiza ou deleta apenas o seu próprio avatar
CREATE POLICY "Edição e Exclusão de Avatars pelo Dono"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ----------------------------------------------------------------------------
-- 3.2 Bucket: portfolios
-- ----------------------------------------------------------------------------

-- Catálogo de buscas é aberto ao público para leitura de fotos de portfólios
CREATE POLICY "Leitura Geral de Portfólios"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- Apenas profissionais autenticados enviam fotos para o seu próprio diretório
CREATE POLICY "Inserção de Portfólio pelo Dono"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professional')
);

-- Profissional gerencia suas próprias fotos
CREATE POLICY "Exclusão de Portfólio pelo Dono"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'portfolios' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolios' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ----------------------------------------------------------------------------
-- 3.3 Bucket: categories
-- ----------------------------------------------------------------------------

-- Leitura pública para carregar cards e menus de categorias
CREATE POLICY "Leitura Geral de Categorias"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

-- Manipulação de ícones e slugs restrito exclusivamente aos administradores
CREATE POLICY "Escrita Administrativa de Categorias"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'categories' AND public.storage_user_is_admin())
WITH CHECK (bucket_id = 'categories' AND public.storage_user_is_admin());


-- ----------------------------------------------------------------------------
-- 3.4 Bucket: banners
-- ----------------------------------------------------------------------------

-- Leitura pública para home ou carrosséis de marketing da landing page
CREATE POLICY "Leitura Geral de Banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Criação e alteração exclusiva aos administradores
CREATE POLICY "Escrita Administrativa de Banners"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'banners' AND public.storage_user_is_admin())
WITH CHECK (bucket_id = 'banners' AND public.storage_user_is_admin());


-- ----------------------------------------------------------------------------
-- 3.5 Bucket: reports (Privado e Crítico)
-- ----------------------------------------------------------------------------

-- Apenas Administradores têm permissão para ler as evidências enviadas
CREATE POLICY "Leitura de Denúncias Filtrada"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' 
  AND public.storage_user_is_admin()
);

-- Qualquer usuário autenticado cadastrado pode subir fotos para a denúncia aberta
CREATE POLICY "Usuário Registra Foto de Denúncia"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports'
);
```

---

## 5. Práticas e Fluxo de Otimização no Frontend

Para atingir menos de 1.2 segundos de transferência mesmo na rede móvel brasileira (3G/4G), a plataforma opera com as seguintes premissas na SDK:

1. **Compressão Client-Side (Antes do Upload):**
   - Utilização de bibliotecas como o `browser-image-compression` ou Canvas API no frontend para reenquadrar imagens pesadas enviadas da câmera do profissional, redimensionando-as com largura máxima de `1920px` e convertendo nativamente para o formato comprimido `.webp` com qualidade controlada em `80%`.
2. **Utilização da API de Transformação do Supabase:**
   - O projeto fará uso dos parâmetros de transformação dinâmica (ex: `width`, `height`, `resize`) providos pela CDN do Supabase para acelerar o carregamento em cartões da tela de busca.
   - *URL de exemplo reduzido:* `https://[project-ref].supabase.co/storage/v1/render/image/public/portfolios/[prop_id]/[img_id]?width=320&height=240&resize=contain`
