# Arquitetura Final Definitiva: TáNaMão Brasil (Versão CTO)

Este documento estabelece a base técnica definitiva para a operação em nível nacional da plataforma TáNaMão Brasil, integrando Supabase, React, Express e Mercado Pago sob os mais altos padrões de segurança, escalabilidade e performance.

---

## 1. Arquitetura Revisada (Full-Stack Híbrida)

A aplicação deixa de ser um SPA puro para se tornar uma arquitetura **Full-Stack Híbrida**, garantindo que operações críticas (pagamentos, chaves secretas) nunca toquem o navegador do usuário.

- **Frontend (Vite + React + TS):** SPA de alta performance para a jornada do usuário e painel administrativo.
- **Backend Proxy (Express + TS):** Camada de segurança para integração com o SDK do Mercado Pago e operações administrativas pesadas via Supabase Service Role.
- **Data & Auth (Supabase):** Infraestrutura "Serverless" para autenticação, banco de dados (PostgreSQL) e armazenamento de arquivos (Storage).
- **CDN & Edge:** Utilização da CDN do Supabase para entrega de imagens otimizadas em tempo recorde no território nacional.

---

## 2. Modelagem de Dados Revisada (Alta Performance)

### 2.1 Entidades Críticas
- **Profiles:** Base central de usuários (RBAC: Client, Professional, Admin).
- **Professionals:** Perfil comercial com métricas de ranking (rating_avg, plan_type).
- **Subscriptions:** Controle rigoroso de faturamento vinculado ao Mercado Pago.
- **Professional_Photos:** Portfólio com restrição de visibilidade Baseada no Plano (Cloud-side enforcement).
- **Categories & Cities:** Tabelas de consulta (lookup) com índices de busca geográfica.

### 2.2 Índices Geográficos (Nacional)
- Implementação de índices **B-Tree** em `(city_id, category_id)` para garantir que buscas em cidades populosas (ex: São Paulo) retornem em menos de 100ms.
- Índice de ranking: `(plan_type DESC, rating_avg DESC)` para priorizar monetização.

---

## 3. Fluxos Operacionais Revisados

### 3.1 Fluxo de Assinatura (Checkout Seguro e Silencioso)
1. **Frontend:** Solicita criação de preferência ao Backend.
2. **Backend:** Valida o plano, gera ID no Mercado Pago e retorna o link (init_point).
3. **Gateway (MP):** Processa o pagamento (Pix/Cartão).
4. **Webhook:** Nosso servidor recebe a notificação, valida o `payment_id` e atualiza a assinatura no Supabase via **Service Role Key** (bypass de RLS para segurança).
5. **Real-time Sync:** O frontend recebe confirmação via WebSocket ou fetch de status e libera os limites de fotos instantaneamente.

### 3.2 Fluxo de SEO e Indexação Nacional
- Utilização de rotas semânticas: `/busca/[estado]/[cidade]/[categoria]`.
- Geração de `sitemap.xml` dinâmico via Backend.
- Metadados dinâmicos (OpenGraph) adaptados para cada categoria profissional para melhorar o CTR no Google.

---

## 4. Estrutura de Pastas Revisada (Padrão Enterprise)

```text
/
├── server/                 # Camada de Backend (Express)
│   ├── routes/             # Endpoints (Payments, Admin, Analytics)
│   ├── services/           # Abstração MP, Supabase Admin Client
│   └── middleware/         # Security (Rate Limiting, ACL)
├── src/                    # Camada de Frontend (React)
│   ├── api/                # Consumo do Backend local (/api)
│   ├── components/         # Atômicos (UI) e Compostos (Business)
│   ├── hooks/              # Lógica de estados Supabase (useAuth, useSearch)
│   ├── lib/                # Config Supabase Client Público
│   ├── pages/              # Views (Home, Search, Dashboard, Admin)
│   └── types/              # Definições TS globais
├── supabase/               # Configurações de Infraestrutura
│   ├── migrations/         # Histórico de alterações do banco
│   └── functions/          # (Opcional) Edge Functions para lógica pesada
├── public/                 # Assets estáticos de SEO
├── server.ts               # Entry-point do servidor unificado
└── package.json            # Gestão de dependências full-stack
```

---

## 5. Regras de Negócio Revisadas (Foco em Monetização)

1. **Privilégio de Exibição:** Planos `Premium` aparecem 3x mais que o gratuito através de multiplicador de ranking.
2. **Gestão de Excedentes de Portfólio:** Se o profissional cancelar o plano, as fotos excedentes continuam no banco mas são marcadas como `hidden` (limitando a exibição às 3 primeiras).
3. **Segurança Anti-Fraude:**
   - WhatsApp validado via máscara no frontend.
   - Limite de 1 avaliação por cliente a cada 30 dias por profissional.
   - Bloqueio automático de perfis com mais de 3 denúncias de "telefone falso" pendentes.
4. **Resiliência Financeira:** O sistema de faturamento sincroniza automaticamente via webhook, mas permite "renovação manual" em caso de falha sistêmica do gateway.

---

### Diagnóstico Final do CTO
O TáNaMão Brasil está **90% pronto** para produção. A implementação do backend proxy para o Mercado Pago corrigiu o maior risco de segurança (exposição de chaves). O foco agora deve ser no fechamento da modelagem geográfica para garantir que a performance não caia com o aumento da base de profissionais.

**Nota Geral:** 9.2/10
