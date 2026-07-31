# AgendAI — Assistente pessoal de vendas com IA

Aplicação mobile-first para vendedoras autônomas de moda infantil. Registra
atendimentos por voz, estrutura os dados com IA, mantém uma timeline por cliente
e roda um **motor de pós-venda inteligente** que lembra o momento certo de voltar
a falar com cada cliente — incluindo progressão de tamanho de bebê.

> Foco no "assistente pessoal", não num CRM complexo.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| UI | TailwindCSS v4 + shadcn/ui |
| Auth | Clerk (multi-usuário, isolado por `clerkId`) |
| Banco | PostgreSQL (Supabase) + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Storage | Supabase Storage (áudios) |
| IA | Groq — Whisper (`whisper-large-v3`) + Llama (`llama-3.3-70b-versatile`) |

---

## Instalação

```bash
npm install
cp .env.example .env        # preencha as credenciais
npm run db:push             # sincroniza o schema com o banco
npm run db:generate         # gera o Prisma Client
npm run dev                 # http://localhost:3000
```

## Variáveis de ambiente

Veja `.env.example`. Resumo:

- `DATABASE_URL` — Postgres do Supabase (conexão direta, `sslmode=require`)
- `NEXT_PUBLIC_CLERK_*` / `CLERK_*` — autenticação Clerk
- `GROQ_API_KEY` — transcrição e estruturação por IA
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — Storage

## Scripts

| Script | O quê |
|--------|-------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `start` | Build e execução de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` / `db:generate` / `db:studio` / `db:seed` | Prisma |
| `npm run test:audio` | Testa pipeline de áudio (Storage + Whisper + DB) |

---

## Estrutura de pastas

```
src/
  app/
    (app)/            # área autenticada (dashboard, clientes, atendimento,
                      #   lembretes, assistente, mais)
    (auth)/           # sign-in / sign-up (Clerk)
    api/              # rotas de API (ver abaixo)
  components/         # UI compartilhada (layout, ui, toast)
  features/           # código por domínio: atendimento, clientes, lembretes,
                      #   timeline, mensagens, assistente, dashboard
  services/           # regras de negócio / integrações
    ai/               # structurer, message-generator, client-query, assistant
    audio/            # transcrição e upload
    post-sale/        # motor de pós-venda + status de lembretes
    analytics/        # indicadores do dashboard
  lib/                # prisma, groq, supabase, baby-sizes, utils
  hooks/              # hooks globais (áudio, usuário)
  database/prisma/    # schema + seed
  types/              # contratos (ai-extraction, message)
```

## Principais rotas de API

| Método | Rota | Fatia |
|--------|------|-------|
| POST | `/api/audio/upload` | 07/08 — grava, transcreve, estrutura, agenda pós-venda |
| GET/POST | `/api/clients` · `/api/clients/[id]` | 09 — gestão de clientes |
| GET | `/api/timeline/[clientId]` | 10 — timeline |
| GET/POST/PATCH | `/api/reminders*` | 11 — motor de pós-venda |
| POST/GET | `/api/messages/generate` · `/api/messages` | 12 — mensagens IA |
| POST | `/api/smart-search` | 13 — busca por linguagem natural |
| POST/GET/DELETE | `/api/assistant/*` | 14 — assistente conversacional |
| GET | `/api/dashboard` · `/api/analytics` · `/api/insights` | 15 — dashboard inteligente |

---

## Princípios de arquitetura

- **Multi-usuário isolado**: toda query filtra por `userId` derivado do Clerk.
- **Nunca perder a gravação**: falhas de IA marcam erro mas mantêm o áudio salvo.
- **IA só com dados reais**: busca e assistente nunca inventam — respondem
  apenas com o que existe no banco; se não há dado, dizem isso.
- **Soft delete** em entidades sensíveis (`deletedAt`).
- **Feature-based**: cada domínio isolado em `features/` + `services/`.

## Deploy

**Vercel (recomendado):** conecte o repositório, configure as variáveis de
ambiente e faça deploy. `output: standalone` já está habilitado.

**Docker:**
```bash
docker compose up --build      # usa o .env local
```

**CI:** `.github/workflows/ci.yml` roda typecheck + lint + build em cada push/PR.
