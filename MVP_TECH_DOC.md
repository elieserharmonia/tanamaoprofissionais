# Documento de Arquitetura e Especificação Técnica do MVP: TáNaMão Brasil

Este documento apresenta a especificação técnica final e definitiva para a implementação da plataforma **TáNaMão Brasil**, um marketplace nacional que conecta clientes a profissionais qualificados de forma direta, simples e eficiente.

---

## 1. Fluxo de Autenticação

A engrenagem de identidade do TáNaMão Brasil é centralizada no **SupaBase Auth** com estratégias robustas de persistência e divisão de perfis em banco de dados.

### 1.1 Cadastro de Clientes e Profissionais
- O usuário registra-se com **Email e Senha**.
- Um trigger automático no banco de dados (`profiles_trigger`) intercepta a inserção na tabela nativa do Supabase `auth.users` e replica a chave primária (`uuid`) para a tabela pública `profiles`, definindo por padrão a coluna `role` como `'client'`.
- Se o usuário selecionar a opção **"Sou um Profissional"** durante o formulário de onboarding, o frontend enviará uma requisição pós-registro que atualiza a coluna `role` para `'professional'` na tabela `profiles` e inicializa um registro em branco na tabela `professionals`.

```
[ Usuário ] ---> ( Preenche Form ) ---> [ Supabase Auth.users ]
                                              |
                                              v (Trigger SQL)
                                        [ Public.profiles ] -> Role: 'client'
                                              |
                                              v (Ação Profissional)
                                        [ Public.professionals ] -> Cria registro associado
```

### 1.2 Recuperação e Sessão
- Autenticação por JWT (JSON Web Tokens) persistidos via Cookies HttpOnly (gerenciados pelo Supabase Client de forma nativa).
- Fluxo de recuperação de senha ("Esqueci minha senha") que envia um link único com hash de uso único expiráveis em até 24 horas via Supabase Mail.

---

## 2. Fluxo de Cadastro do Profissional

O fluxo de publicação do perfil profissional segue um processo de onboarding guiado em 3 etapas de forma a evitar churn no processo de cadastro.

```
+--------------------------+     +--------------------------+     +--------------------------+
|  Passo 1: Dados Básicos  | --> |   Passo 2: Categorias    | --> | Passo 3: Portfólio/Fotos |
|  - Nome, Tel, Cidade, UF |     |   - Escolha de Atuação   |     |  - Importação de Portfólio|
+--------------------------+     +--------------------------+     +--------------------------+
```

### 2.1 Passo a Passo
1. **Passo 1: Informações de Contato e Localização:** O profissional preenche sua biografia, telefone de WhatsApp (com máscara e DDD), e seleciona seu Estado e Cidade.
2. **Passo 2: Especialidades:** Seleção de até 3 categorias/serviços de atuação para manter a busca relevante e hiperfocada em suas habilidades centrais.
3. **Passo 3: Galeria de Projetos (Upload de Portfólio):** Upload das fotos de seus trabalhos anteriores respeitando os limites estritos do seu plano atual.

### 2.2 Validação de Limites
- O frontend e as regras de banco (triggers/restrições no Storage) limitam o número de uploads antes de acionar a API:
  - **Plano Gratuito:** Máximo de 3 fotos.
  - **Plano Destaque:** Máximo de 10 fotos.
  - **Plano Premium:** Máximo de 20 fotos.

---

## 3. Fluxo de Busca

A busca nacional foi projetada para resolver a velocidade e a alta relevância de geolocalização.

```
[ Cliente ] -> Define (Categoria, Estado, Cidade) -> [ Consulta Indexada no Postgres ] -> [ Lista de Profissionais Ordenados ]
```

### 3.1 Filtros e Parâmetros
A busca requer a parametrização do local (Estado e Cidade) e do setor:
- **Categoria:** ID ou Slug da especialidade (ex: `eletricista`, `pedreiro`).
- **Estado (UF):** Sigla bidimensional (ex: `SP`, `RJ`).
- **Cidade:** ID da cidade para evitar homônimos geográficos.

### 3.2 Algoritmo de Ordenação e Relevância
Os registros retornados pelo banco de dados são ordenados na camada de consulta com uma regra de ranqueamento que prioriza a monetização e a reputação:

1. **Nível do Plano do Profissional (Peso Máximo):**
   - 1º: `Premium` (exibe no topo com selo especial)
   - 2º: `Destaque` (exibe abaixo do Premium com destaque visual)
   - 3º: `Gratuito` (exprime o restante dos resultados)
2. **Avaliação Média (`rating_avg`) (Critério de desempate 1):** Ordem decrescente de satisfação do cliente real.
3. **Métrica de Atividade Recente (`updated_at`) (Critério de desempate 2):** Profissionais ativos e perfis com edições recentes têm prioridade de exibição contra perfis abandonados.

---

## 4. Fluxo de Avaliações

Um sistema de classificação confiável impede o "Review Bombing" e autofacturações de notas falsas.

### 4.1 Processo de Envio
1. O cliente entra na página pública do profissional.
2. Clica em **"Avaliar Profissional"** (exige que o cliente esteja logado no sistema).
3. Seleciona a pontuação em estrelas (de 1 a 5, tipo inteiro).
4. Escreve um comentário sobre o atendimento e clica em Enviar.

### 4.2 Regras de Prevenção a Fraude (Anti-Spam)
- **Bloqueio de Auto-Avaliação:** O UUID do cliente (`client_id`) deve ser estritamente diferente do `profile_id` que possui relação com o registro do profissional.
- **Duração Mínima / Limite Temporal:** Um cliente só pode avaliar o mesmo profissional uma única vez a cada 30 dias para evitar spam ou saturação artificial de pontuação.
- **Média Dinâmica via Trigger Postgres:** Toda nova avaliação insere um registro na tabela `reviews`. Um trigger no banco executa logo em seguida (`after insert or update or delete`), recalculando a média geométrica e a soma total na linha correspondente na tabela `professionals`:
  $$\text{rating\_avg} = \frac{\sum(\text{rating})}{\text{Total de reviews}}$$

---

## 5. Fluxo de Assinatura (Mercado Pago)

A monetização é recorrente, escalada via assinatura transparente integrada à carteira do Mercado Pago.

```
[ Profissional ] -> Seleciona Plano Destaque/Premium -> [ Geração de Preference via API ]
                                                                   |
                                                                   v
[ Webhook Mercado Pago ] <-- ( Notificação de Pagamento ) <-- [ Gateway Mercado Pago ]
        |
        v (Validação de Assinatura)
[ Atualização de Planos / subscriptions ] -> Libera limites adicionais (fotos / badges)
```

### 5.1 Jornada de Upgrade
1. O profissional logado vai até a aba **"Minha Assinatura"**.
2. Seleciona o Plano (Destaque ou Premium) e clica em **"Assinar Agora"**.
3. É gerada uma intenção de pagamento através do SDK do Mercado Pago no backend (Edge Function ou Endpoint proxy securitizado).
4. É exibido o checkout seguro do Mercado Pago (Pix ou Cartão).

### 5.2 Processamento de Status e Webhooks
- O Mercado Pago dispara um webhook contra a URL cadastrada `/api/webhooks/mercadopago`.
- O servidor valida a autenticação da requisição e atualiza a tabela `subscriptions` com os estados correspondentes:
  - `pending` (aguardando compensação Pix)
  - `active` (pagamento compensado, atualiza o tipo do plano na tabela `professionals` e estende limites imediatamente)
  - `cancelled` / `unpaid` (limita de volta o profissional para o plano `'free'`).

---

## 6. Fluxo Administrativo

O painel de inteligência gerencial controla a moderação, segurança jurídica da plataforma e faturamento dos planos.

### 6.1 Módulos Inclusos
- **Gestão de Profissionais:** Interface integrada para visualizar novos cadastros, suspender perfis nocivos que fraudam telefones ou bios, e auditar fotos.
- **Moderação de Feedbacks / Avaliações:** Anulação de avaliações que contenham palavras de baixo calão, racismo, preconceito ou autopromoção direta.
- **Painel de Denúncias (Infracional):** Fila de triagem inteligente baseada na tabela `reports`:
  - Visualização de quem denunciou, profissional associado, e motivo (Atendimento agressivo, Celular falso, Abuso verbal, Cobrança indevida).
  - Ações diretas: "Ignorar Denúncia", "Enviar Aviso ao Profissional", "Bloquear Perfil".

---

## 7. Estrutura Final das Tabelas (Modelagem Física)

Abaixo estão detalhados os schemas das tabelas do banco relacional de alta performance integrado ao PostgreSQL do Supabase.

### 7.1 Tabela `profiles`
Contém as informações transversais de todas as contas da plataforma (Clientes, Profissionais e Admins).

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `references auth.users` | Chave primária vinculada ao Supabase Auth. |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Email de acesso único. |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Nome completo do usuário. |
| `avatar_url` | `TEXT` | `NULL` | Link da imagem de perfil. |
| `role` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'client'` | Pode ser: `'client'`, `'professional'`, `'admin'`. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Hora exata de criação da conta. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última alteração do registro. |

### 7.2 Tabela `categories`
Categorias profissionais da plataforma.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Identificador universal. |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Nome de exibição (ex: Eletricista). |
| `slug` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Slug para rotas SPA e SEO (ex: `eletricista`). |
| `description` | `TEXT` | `NULL` | Detalhamento da categoria para fins de SEO. |
| `image_url` | `TEXT` | `NULL` | Ícone ilustrativo para o grid da Home. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data de criação. |

### 7.3 Tabela `cities`
Lista pré-populada de municípios brasileiros para mitigar variação ortográfica.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Chave primária geográfica. |
| `name` | `VARCHAR(150)` | `NOT NULL` | Nome real da cidade (ex: São Paulo). |
| `state_code` | `CHAR(2)` | `NOT NULL` | Unidade federativa correspondente (ex: SP). |
| `slug` | `VARCHAR(150)` | `NOT NULL` | Slug para url dinâmico de busca nacional. |

### 7.4 Tabela `professionals`
Tabela central com dados estendidos de perfil do profissional no catálogo.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `references profiles.id ON DELETE CASCADE`| UUID vinculado ao perfil público do profissional. |
| `bio` | `TEXT` | `NOT NULL` | Descrição de habilidades, tempo de serviço e detalhes. |
| `whatsapp` | `VARCHAR(25)` | `NOT NULL` | Celular completo para contato direto via WhatsApp. |
| `address` | `VARCHAR(255)` | `NULL` | Endereço comercial físico, se houver. |
| `city_id` | `UUID` | `NOT NULL`, `references cities.id` | ID da cidade de cobertura principal. |
| `plan_type` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'free'` | Classificação do plano: `'free'`, `'featured'`, `'premium'`. |
| `rating_avg` | `DECIMAL(3,2)` | `NOT NULL`, `DEFAULT 0.00` | Média das avaliações recalculadas pelo Trigger. |
| `rating_count`| `INTEGER` | `NOT NULL`, `DEFAULT 0` | Contagem agregada de estrelas coletadas. |
| `is_approved` | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Flag de conformidade do perfil para listagem pública. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Registro de entrada comercial. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Modificações internas de plano ou bio. |

### 7.5 Tabela `professional_categories`
Associação de Muitos-para-Muitos entre profissionais e especialidades.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `professional_id` | `UUID` | `PK`, `references professionals.id ON DELETE CASCADE`| Chave estrangeira composta. |
| `category_id` | `UUID` | `PK`, `references categories.id ON DELETE CASCADE`| Chave estrangeira composta. |

### 7.6 Tabela `professional_photos`
Registro local dos caminhos das fotos hospedadas via Storage.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | ID da imagem. |
| `professional_id`| `UUID` | `NOT NULL`, `references professionals.id ON DELETE CASCADE`| Dono da imagem associada. |
| `photo_url` | `TEXT` | `NOT NULL` | Link permanente acessível externamente do CDN. |
| `order_index` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | Ordenação de exibição interna no carrossel de portfólio.|
| `is_approved` | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Permissão para exibição pública no portfólio. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Upload. |

### 7.7 Tabela `reviews`
Histórico de feedbacks pontuados recebidos pelos profissionais do catálogo.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Chave única. |
| `professional_id`| `UUID` | `NOT NULL`, `references professionals.id ON DELETE CASCADE`| Profissional avaliado. |
| `client_id` | `UUID` | `NOT NULL`, `references profiles.id` | Cliente que emitiu o review. |
| `rating` | `INTEGER` | `NOT NULL`, `CHECK (rating >= 1 AND rating <= 5)`| Nota de 1 a 5 estrelas. |
| `comment` | `TEXT` | `NOT NULL` | Opinião textual sobre o serviço prestado. |
| `is_approved` | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Exponibilidade do comentário na página pública. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data da postagem. |

### 7.8 Tabela `reports`
Controle de moderação de termos, contas suspeitas ou fraude.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Chave primária. |
| `reported_by` | `UUID` | `NOT NULL`, `references profiles.id` | Denunciante. |
| `professional_id`| `UUID` | `NOT NULL`, `references professionals.id ON DELETE CASCADE`| Perfil infracional reportado. |
| `review_id` | `UUID` | `NULL`, `references reviews.id ON DELETE CASCADE`| Review específico, se houver denúncia de mensagem. |
| `reason` | `VARCHAR(100)`| `NOT NULL` | Categoria do motivo (ex: `'fake_phone'`, `'abuse'`).|
| `details` | `TEXT` | `NOT NULL` | Texto livre com detalhes e provas da reclamação. |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'pending'`| Status do caso: `'pending'`, `'resolved'`, `'dismissed'`.|
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Emissão do ticket. |

### 7.9 Tabela `plans`
Especificação imutável de precificação cadastrada administrativamente.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | ID do plano. |
| `name` | `VARCHAR(50)` | `NOT NULL` | Nome: `'Gratuito'`, `'Destaque'`, `'Premium'`. |
| `price` | `DECIMAL(10,2)`| `NOT NULL` | Mensalidade de cobrança (R$). |
| `photos_limit` | `INTEGER` | `NOT NULL` | Limites de fotos (3, 10 ou 20 fotos). |
| `has_badge` | `BOOLEAN` | `NOT NULL` | Badge de verificação exposta no card de busca. |
| `priority_level`| `INTEGER` | `NOT NULL` | Ordem de prioridade (0 = Free, 1 = Featured, 2 = Premium)|

### 7.10 Tabela `subscriptions`
Acompanhamento em tempo real de licenças de planos premium vigentes.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | ID único da assinatura. |
| `professional_id`| `UUID` | `NOT NULL`, `references professionals.id ON DELETE CASCADE`| Profissional assinante. |
| `plan_id` | `UUID` | `NOT NULL`, `references plans.id` | Tipo de plano vigente. |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'pending'`| Estados: `'active'`, `'inactive'`, `'pending'`, `'expired'`.|
| `external_id` | `VARCHAR(100)`| `NULL` | ID gerado pelo Mercado Pago. |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Data limite de renovação. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Início da recorrência. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Modificações de status de faturamento. |

---

## 8. Buckets do Supabase Storage

A gestão de arquivos multimídia é escalada por buckets dedicados do Supabase, controlados por regras estritas baseadas em privilégios.

### 8.1 Buckets Obrigatórios
1. **`portfolio-photos` (Público):** Guarda os carrosséis de imagens do portfólio.
   - Padrão do Nome do Caminho: `/portfolio/{professional_id}/{photo_uuid}.jpg`
   - Tamanho Máximo de Arquivo: 5 MB por arquivo.
   - Tipos Permitidos (MIME types): `image/jpeg`, `image/png`, `image/webp`.
2. **`avatars` (Público):** Contém as fotos de perfil dos profissionais e clientes.
   - Padrão do Nome do Caminho: `/avatars/{profile_id}.jpg`
   - Tamanho Máximo: 2 MB por imagem.
   - Tipos Permitidos: `image/jpeg`, `image/png`, `image/webp`.

---

## 9. Políticas de Segurança de Linha (RLS) do Supabase

Todas as tabelas do Supabase devem possuir RLS ativo (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) para proteger dados confidenciais de vazamento acidental.

### 9.1 Políticas Estipuladas para o MVP

- **Tabela `profiles`:**
  - `SELECT`: Público para qualquer usuário autenticado ou anônimo.
  - `INSERT`: Vinculado estritamente à trigger nativa de criação do Supabase Auth.
  - `UPDATE`: Permitido apenas se `auth.uid() = id` (o usuário só edita seu próprio perfil).
  - `DELETE`: Negado por padrão (somente Admins).

- **Tabela `professionals`:**
  - `SELECT`: Permitido para todos se `is_approved = true`.
  - `INSERT` / `UPDATE`: Restrito ao dono do perfil (`auth.uid() = id`).

- **Tabela `professional_photos`:**
  - `SELECT`: Apenas imagens associadas com `is_approved = true` ou se o solicitante possui correspondência de propriedade (`auth.uid() = professional_id`).
  - `INSERT` / `DELETE` / `UPDATE`: Restrito ao profissional proprietário do álbum (`auth.uid() = professional_id` e dentro da cota máxima de quantidade baseada em seu plano atual).

- **Tabela `reviews`:**
  - `SELECT`: Liberação de leitura total para qualquer cliente ou visitante anônimo.
  - `INSERT`: Permitido apenas para usuários autenticados cujo perfil seja `client` e o ID seja diferente do ID do profissional avaliado (`auth.uid() = client_id` E `auth.uid() != professional_id`).

- **Tabela `reports`:**
  - `SELECT`: Bloqueado por padrão para usuários comuns. Permitido apenas para perfis autenticados que contém perfil correspondente a `role = 'admin'`.
  - `INSERT`: Lançado por qualquer usuário logado autenticado (`auth.uid() = reported_by`).

- **Tabela `subscriptions`:**
  - `SELECT` / `UPDATE`: Apenas para o dono do perfil profissional associado (`auth.uid() = professional_id`) ou perfis admins (`role = 'admin'`).

---

## 10. Serviços Frontend (Consumo Supabase SDK)

O frontend interage com o Supabase através de serviços isolados orientados a domínio na pasta `/src/services/`.

- **`authService`:** Login, Logout, Registro de cliente, Atualização cadastral de senha e monitor de escuta de estado de sessão (`onAuthStateChange`).
- **`professionalService`:** CRUD do Perfil do Profissional, busca facetada indexada por filtros geo-categóricos no catálogo, incremento de visualizações de contatos do WhatsApp.
- **`reviewService`:** Criação e listagem de reviews na página pública.
- **`paymentService`:** Geração de checkout preferences Mercado Pago e status de upgrade.
- **`adminService`:** Gestão de fila de moderação de denúncias, suspensão de profissionais ruins e aprovação de fotos.

---

## 11. Hooks Customizados da Aplicação (React & Supabase)

Abstrações estritas para manter Views limpas e independentes de lógica de banco de dados.

- **`useAuth`:**
  - Fornece estado reativo e propriedades do usuário logado: `user`, `profile`, `isAdmin`, `isProfessional`, `isLoading`, `signOut`, `signIn`.
- **`useProfessionalSearch(filters, page, limit)`:**
  - Encapsula o motor de busca nacional com de-bouncing de teclas, controle de paginação infinita, filtros por categorias/municípios e ranqueamento de planos.
- **`useProfessionalProfile(professionalId)`:**
  - Carrega todos os detalhes e relacionamentos estruturais de um profissional específico (Sua Bio, fotos não-bloqueadas de portfólio no Storage, suas avaliações dinâmicas de nota total).
- **`useSubscription(professionalId)`:**
  - Facilita a escuta e ações da situação cadastral do plano contratado pelo profissional (Verifica expiração, acessa chaves do gateway).

---

## 12. Arquitetura de Rotas (React Router DOM v6)

A navegação respeita hierarquias modulares protegendo rotas transacionais.

```
/ (Pública) -------------> Home / Busca Nacional / Landing Page
/profissional/:slug -----> Página e Perfil Comercial do Profissional
/login | /cadastro ------> Telas de Autenticação / Onboarding
/dashboard (Privada) ----> Painel de Controle de Edição do Profissional
/admin (Admin Privada) --> Painel Gerencial de Denúncias e Moderação
```

### 12.1 Rotas Públicas
- `/`: Home focada em cliques de conversão e vitrine rápida.
- `/busca`: Catálogo flexível com buscas baseadas em estado, cidade e categorias.
- `/profissional/:slug`: Página completa com portfólio carrossel, avaliações e botão flutuante de abertura do WhatsApp do trabalhador.
- `/login`: Form integrado de credenciais.
- `/cadastro`: Cadastro de e-mail e bifurcação de fluxo de role (Sou Profissional vs. Quero Contratar).

### 12.2 Rotas Privadas (Protegidas por `ProtectedRoute.tsx`)
- `/dashboard`: Perfil principal, contador de cliques recebidos no WhatsApp.
- `/dashboard/perfil`: Painel de edição de textos da biografia e redes sociais de suporte.
- `/dashboard/fotos`: Album de imagens do portfólio com status da imagem (Aprovada/Pendente).
- `/dashboard/assinatura`: Mostra planos e o histórico de cobrança além de botões Mercado Pago preferenciais.

### 12.3 Rotas Privadas Administrativas (Protegidas por `AdminRoute.tsx`)
- `/admin`: Visão holística da saúde financeira da plataforma de buscas.
- `/admin/profissionais`: Gestão de fila de solicitações e suspensão.
- `/admin/avaliacoes`: Painel de monitoramento de linguajar ofensivo em reviews.
- `/admin/denuncias`: Fila de relatórios acusativos para ação de blacklist de fraudadores.

---

## 13. Estrutura de Pastas do Projeto

A organização de módulos do frontend é modularizada e escalável:

```
/
├── .env.example              # Configurações de API Supabase / Mercado Pago
├── .gitignore                # Arquivos ignorados pelo controle de versão
├── index.html                # Entry point HTML primário
├── metadata.json             # Metadados do app rodando no Cloud Run
├── package.json              # Declaração das dependências globais
├── tsconfig.json             # Ajustes e regras de compilação TS
├── vite.config.ts            # Configurações do Vite HMR/Plugins
└── src/
    ├── main.tsx              # Estrutura base de montagem da raiz React
    ├── App.tsx               # Roteador, Provedores Globais e Transições
    ├── index.css             # Importação do Tailwind e Estilos de Tema
    ├── types.ts              # Interfaces estruturais estritas do TypeScript
    ├── components/           # Componentes de interface compartilháveis (UI)
    │   ├── ui/               # Botões, inputs, modais e elementos estáticos
    │   ├── layout/           # Cabeçalho, rodape, menus de dashboard
    │   ├── search/           # Barra de busca indexada, filtros de catálogo
    │   ├── professional/     # Cards de portfólio, avaliações, carrossel
    │   └── common/           # ProtectedRoute, loaders de transição, spinners
    ├── contexts/             # Contextos globais (Autenticação, Notificações)
    │   └── AuthContext.tsx   # Gerenciador global de Sessão e Claims
    ├── hooks/                # Hooks customizados reutilizáveis em páginas
    │   ├── useAuth.ts
    │   ├── useProfessionalSearch.ts
    │   ├── useProfessionalProfile.ts
    │   └── useSubscription.ts
    ├── services/             # Clientes e conexões de APIs
    │   ├── supabase.ts       # Inicialização do container cliente do Supabase
    │   ├── auth.ts
    │   ├── professionals.ts
    │   ├── reviews.ts
    │   ├── payments.ts
    │   └── admin.ts
    └── pages/                # Componentes que representam telas inteiras
        ├── Home.tsx          # Página Inicial de Ativação do Negócio
        ├── Search.tsx        # Resultados de buscas e refinamentos
        ├── ProfessionalProfile.tsx # Perfil Comercial Aberto ao Público
        ├── Login.tsx
        ├── Register.tsx
        ├── Dashboard/        # Pasta da jornada logada do Profissional
        │   ├── DashboardHome.tsx
        │   ├── EditProfile.tsx
        │   ├── PortfolioManager.tsx
        │   └── SubscriptionPage.tsx
        └── Admin/            # Pasta da jornada administrativa de Moderação
            ├── AdminDashboard.tsx
            ├── ProfessionalModeration.tsx
            ├── ReviewModeration.tsx
            └── ReportModeration.tsx
```

---

## 14. Regras de Negócio e Lógica MVP

- **Contato sem Intermediação:** A plataforma não retém nenhuma taxa sobre a contratação. O profissional retém 100% do lucro negociado livremente via WhatsApp fora do sistema.
- **Regras de Downgrade:** Se uma assinatura é descontinuada (por falha do cartão ou cancelamento manual), o profissional cai para o Plano Gratuito. Suas fotos adicionais são marcadas como `is_approved = false` na restrição de visibilidade pública, preservando apenas as 3 fotos primárias (com base no índice `order_index`), mas não são deletadas, permitindo reativação ao assinar novamente.
- **Disparidades de Ordenação em Filtros:** Mesmo em buscas específicas baseadas em tags secundárias, profissionais de planos superiores (`Premium` e `Destaque`) recebem empurrão de relevância sendo listados prioritariamente.

---

## 15. Requisitos Não Funcionais (RNFs)

- **Performance Extrema:** Tempo de carregamento de páginas estáticas e busca indexada em menos de 1,2 segundos para conexões lentas de rede móvel (3G/4G). Implementado utilizando índices do PostgreSQL no Supabase e otimização de imagens (conversão no Storage para formato comprimido WEBP).
- **SEO Dinâmico e Relevância Nacional:** Criação de rotas amigáveis indexáveis gerando sitemaps dinâmicos automáticos para indexadores mecânicos de busca (Ex: `tanamaobrasil.com.br/busca/sp/sao-paulo/eletricista`).
- **Segurança Jurídica dos Dados (LGPD):** Termos claros de consentimento no momento do registro. Anonimização permanente dos logs de denúncia arquivados e exclusão definitiva de registros conforme art. 16 da Lei nº 13.709.
- **Design Adaptativo (Mobile-First):** O site deve operar fluentemente em celulares antigos (testados até resoluções com largura de 320px como o iPhone SE) quanto em monitores super ultra-wide gerando grades bento rítmicas e densistas.
- **Acessibilidade Web (WCAG 2.1 AA):** Práticas estritas de contraste de cores, suporte completo para leitores de tela na jornada do usuário e marcações semânticas nativas do HTML5 nos formulários e cards de busca.
