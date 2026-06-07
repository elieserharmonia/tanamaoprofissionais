# Especificação de Arquitetura de Frontend: TáNaMão Brasil

Este documento detalha o blueprint de desenvolvimento, estruturação e modularização do frontend SPA (Single Page Application) da plataforma **TáNaMão Brasil**, focado em alta performance, robustez no gerenciamento de estado e escalabilidade para dezenas de milhares de requisições simultâneas e navegação em dispositivos de baixo custo.

---

## 1. Abordagem Arquitetural e Princípios de Design

A arquitetura do TáNaMão Brasil baseia-se nos seguintes pilares fundamentais:

- **Desenvolvimento Component-Driven:** Segmentação rígida de componentes em padrões atômico-funcionais (Base, Layout, Feature, Common).
- **Isolamento de Estado de Dados vs. UI:** Diferenciação clara entre estados mutáveis do servidor (Supabase) e estados voláteis da UI (Filtros de busca, modais, loaders).
- **Mobile-First & Progressive Loading:** Renderização balanceada com foco em dispositivos móveis nacionais de entrada (baixa largura de banda, conexões instáveis, processadores modestos).
- **Strict TypeScript Typing:** Uso rigoroso de tipos genéricos e inferência segura, anulando o uso de `any` para integridade operacional.

---

## 2. Estrutura de Diretórios de Produção (Blueprint Completo)

A árvore abaixo estabelece a governança de arquivos do projeto:

```
/src/
├── main.tsx                # Inicializador principal da árvore DOM React e imports CSS globais
├── App.tsx                 # Ponto de entrada com provedores (Context, Queries, Router) e transições
├── index.css               # Folha de estilo central com Tailwind e definições do Design System
├── types.ts                # Interfaces de dados e tipos estritos vindos diretamente do Schema PostgreSQL
├── config/                 # Constantes e configurações fixas de terceiros
│   └── constants.ts        # Valores estáticos (Códigos de estados, máscaras, limites de fotos)
├── assets/                 # Recursos gráficos imutáveis (Logotipo oficial, placeholders)
├── components/             # Pasta de componentes funcionais legíveis
│   ├── ui/                 # Componentes genéricos de UI altamente otimizados
│   │   ├── Button.tsx      # Elementos interativos com variantes de estilo (Primary, Accent, Ghost)
│   │   ├── Input.tsx       # Campos de texto, mascaradores de CEP, telefone e máscara Whatsapp
│   │   ├── Select.tsx      # Controles dropdown para escolha de cidades e categorias estruturadas
│   │   ├── Badge.tsx       # Selos visuais para Destaque, Premium e status de aprovação de portfólio
│   │   └── Modal.tsx       # Janelas de contexto flutuantes (Controle de Denúncia, Confirmação de Ação)
│   ├── layout/             # Componentes de estrutura física de tela
│   │   ├── Header.tsx      # Navegação do topo com links rápidos de busca e perfil
│   │   ├── Footer.tsx      # Rodapé utilitário com termos e foco em SEO de categorias
│   │   └── Sidebar.tsx     # Menu lateral flutuante de painéis administrativos e dashboards profissionais
│   ├── search/             # Componentes especializados no motor de busca nacional
│   │   ├── SearchBar.tsx   # Barra focal integrada com dropdown geo-categórico no topo da Home
│   │   ├── FilterPanel.tsx # Filtros avançados de refinamento lateral na listagem do catálogo
│   │   └── CategoryGrid.tsx# Grade ilustrativa de especialidades populares para atalhos rápidos
│   ├── professional/       # Componentes focados na visualização e gestão do profissional
│   │   ├── ProfessionalCard.tsx # Card expansível indexado com selo de plano, rating e CTA WhatsApp
│   │   ├── PortfolioCarousel.tsx# Carrossel responsivo de mídias otimizadas do Storage
│   │   └── ReviewSection.tsx    # Listagem de depoimentos acumulados e formulário de rating
│   └── common/             # Componentes transversais de infraestrutura frontend
│       ├── ProtectedRoute.tsx  # Guarda de rotas para assegurar acessibilidade pelo perfil logado
│       ├── AdminRoute.tsx      # Filtro de restrição blindado a usuários com claims 'admin'
│       ├── ImageCompressor.tsx # Módulo invisível de preparação e sanitização de imagens
│       └── SkeletonLoader.tsx  # Estruturas cinzas pulsantes para transição suave de carregamento
├── contexts/               # Motores de persistência e estados globais baseados na Context API
│   └── AuthContext.tsx     # Session state do Supabase encapsulado com claims de profiles e role
├── hooks/                  # Hooks customizados para acoplamento limpo em páginas e views
│   ├── useAuth.ts          # Abstração de hooks hooks para resgate de sessões e logout
│   ├── useDebounce.ts      # Otimizador de digitação em inputs em tempo real para mitigar chamadas de busca
│   ├── useInfiniteSearch.ts# Motor de paginação dinâmica incremental baseada na rolagem de tela
│   ├── usePortfolio.ts     # CRUD de fotos do portfólio controlando limite imposto pelo plano assinado
│   └── useStats.ts         # Métricas de cliques em botões secundários (Conversões via WhatsApp)
├── services/               # Integradores lógicos de API e SDK externos
│   ├── client.ts           # Inicializador cliente do SDK do Supabase contendo headers de auth
│   ├── professionals.ts    # Serviços indexados para buscas federadas e detalhamento público
│   ├── reviews.ts          # Envio e aprovação de feedback de clientes legítimos
│   ├── storage.ts          # Conexão de upload, compressão e geração de urls assinadas
│   └── payments.ts         # Geração de assinaturas Mercado Pago e webhooks integrados
└── pages/                  # Views completas mapeadas pelas rotas
    ├── Home.tsx            # Landing page principal focada em conversão e busca imediata
    ├── SearchResults.tsx   # Visualização e filtragem do catálogo com paginação infinita
    ├── ProfessionalDetails.tsx# Perfil individualizado do trabalhador contendo biografia e mídia
    ├── Auth/               # Páginas de login, recuperação e Onboarding estruturado
    │   ├── Login.tsx
    │   └── Register.tsx
    ├── Dashboard/          # Área restrita sob login para o profissional cadastrado
    │   ├── DashboardHome.tsx# Resumo operacional (Cliques, visualizações e status do plano)
    │   ├── EditProfile.tsx # Edição de dados cadastrais, celular, estados e cidades
    │   ├── Portfolio.tsx   # Upload e manipulação de indexação das fotos de trabalhos anteriores
    │   └── Billing.tsx     # Verificação de plano, upgrade com Mercado Pago e faturas
    └── Admin/              # Fila de trabalho de moderadores logados com claims administrativas
        ├── AdminHome.tsx   # Dashboard administrativo geral (Contagem de novas contas, denúncias)
        ├── Moderation.tsx  # Verificação física de contas fantasmas e imagens de portfólio
        └── Reports.tsx     # Triagem e tomada de ação contra denúncias classificadas
```

---

## 3. Gerenciamento de Estado de UI e Fluxos de Dados

O fluxo e consumo de estados da aplicação garante velocidade máxima ao mitigar "Prop Drilling" através da divisão em três camadas:

1. **Estado de Sessão (Global Context):**
   - Abstraído pelo `AuthContext.tsx`. Monitora a atividade de login do usuário, ouvindo alterações nativas via `onAuthStateChange` no Supabase Client. Carrega e armazena em memória as permissões de `role` ('client', 'professional', 'admin').
2. **Estado do Motor de Busca e Catálogo (Zustand Cache):**
   - Cache otimizado para manter dados de buscas recentes localmente. Se o usuário busca por "Pintor em São Paulo", volta à Home e entra novamente na busca, as informações permanecem guardadas nos estados voláteis da UI, reduzindo em 40% a demanda de tráfego no banco de dados.
3. **Persistência de Estados Locais (React State):**
   - Formulários, controle visual de modais e status de carregamento de botões são tratados localmente em cada componente das páginas correspondentes, beneficiando a performance com o fechamento do ciclo de renderização.

---

## 4. Estratégia de Validação e Submissão de Dados

Para evitar inserções indevidas no Supabase e bugs silenciosos, os formulários contam com validação estrita em camadas redundantes:

- **Configuração de Validação:** **React Hook Form + Zod Schema Validation**.
- **Onboarding e Cadastro Profissional:** O esquema do `Zod` força a integridade das máscaras nas strings (DDD de área legítimo, formato de celular nacional padrão `(XX) 9XXXX-XXXX`).
- **Validação de Avaliações (Reviews):** Restringe textualmente strings suspeitas, exige caracteres mínimos no comentário (mínimo de 10 caracteres para contextualizar reclamações válidas) e bloqueia a submissão de valores de avaliação (`rating`) fora do range de inteiros `[1, 5]`.

---

## 5. Rotas da Aplicação e Controle de Acesso (React Router v6)

A navegação da plataforma emprega layouts aninhados (`<Outlet />`) permitindo carregar trechos estruturais estáticos (Header/Footer comuns) enquanto otimiza transições visuais de conteúdo dinâmico.

### Layout Geral (Público)
- `Home (/)` → Página de impacto para conversão de novos usuários.
- `Busca (/busca)` → Catálogo com opções flexíveis de refinamentos.
- `Perfil Público (/profissional/:slug)` → Visualização total da vitrine de serviços.

### Layout Privado Profissional (`ProtectedRoute.tsx`)
Redireciona para o login caso o usuário não esteja logado ou sua role de perfil na tabela `profiles` não seja correspondente a `professional`.
- `/dashboard` → Home corporativa do parceiro.
- `/dashboard/perfil` → Atualizador de biografia e links.
- `/dashboard/fotos` → Galeria com upload e contagem baseada na carteira de fotos contratada.
- `/dashboard/assinatura` → Escolha e direcionamento Mercado Pago.

### Layout Administrativo (`AdminRoute.tsx`)
Inibe o carregamento de estruturas corporativas, redirecionando o tráfego regular caso o usuário não seja explicitamente cadastrado com `role = 'admin'`.
- `/admin` → Painel de controle de relatórios gerenciais de desempenho.
- `/admin/moderacao` → Fila de triagem para aprovação ou suspensão de mídias.
- `/admin/denuncias` → Área de atendimento para expurgar profissionais nocivos.

---

## 6. Otimizações de Escalabilidade Nacional (100k+ Profissionais)

Como este marketplace nacional lida com grande volume geográfico de tráfego, as estratégias de renderização do front são fundamentais:

- **Estratégia de Code-Splitting / Lazy Loading:**
  - Todas as rotas do dashboard logado e painéis administrativos são importadas na raiz usando o React lazy (`const Dashboard = lazy(() => import('./pages/Dashboard/DashboardHome'))`) combinados com o componente `<Suspense>` e esqueletos de carregamento. Isso reduz o carregamento inicial do script do app do cliente em 65%.
- **Compressão e Resizing Client-Side no Upload:**
  - Antes de disparar o upload contra o Supabase Storage, o frontend redimensiona e comprime imagens de portfólio de smartphones de alta resolução no próprio browser do trabalhador (utilizando buffers de HTML5 Canvas ou worker paralelo), convertendo-os para `WEBP` de baixo peso. Isso otimiza consumo de internet do usuário móvel e mitiga timeouts no servidor.
- **Renderização Virtualizada de Resultados de Busca:**
  - Em resultados extensos de busca por estados populosos, evita gargalos de sobrecarga de memória (DOM Overhead) aplicando técnicas de reutilização de divs em lista com `CSS grid` de altura controlada ou bibliotecas de rolagem de tela virtualizada, renderizando exclusivamente os profissionais presentes no campo de visão focal do cliente.
- **Cache Local de APIs Estáticas em Sessão:**
  - As listas de Cidades (`cities`) e Categorias (`categories`) não mudam rotineiramente. Elas são baixadas uma única vez e cacheadas em nível de sessão pelo frontend, poupando centenas de milhar de chamadas redundantes ao Supabase quando um usuário salta de tela repetidamente.
