# AgendAI Pós-Venda — README Final (Go-Live)

App mobile-first para vendedoras de moda infantil: registra o atendimento por **áudio ou texto**, e a IA cria automaticamente **clientes, vendas, itens vendidos, valor (R$), lembretes e pós-venda**.

> **Status:** pronto para produção. Código no GitHub, build validado, segurança auditada.
> A **captura de preço** deve ser confirmada em uso real — a primeira vendedora nos dirá se está capturando o valor corretamente do áudio/texto.

---

## 1. O que o app faz

- **MVP Core** — grava áudio (transcrição Groq/Whisper) **ou** digita o atendimento. A IA estrutura os dados e cria/atualiza cliente, registra a venda, os itens (produto + quantidade) e o **valor final em R$**, e dispara o cronograma de pós-venda.
- **Dashboard** (mobile-first, Design System Oficial v1):
  - Cards clicáveis (Clientes, Vendas, Lembretes, Pós-vendas) → cada um abre sua área.
  - **Meta do período** editável, com **vigência (início/fim)**, atrelada ao faturamento.
  - **Lembretes de hoje**, **Atendimentos recentes**, **Itens vendidos** e **Dashboard de vendas** (gráfico de linhas por venda) — todos com "ver mais/menos".
- **Gestão de Pós-venda** — cronograma, edição de periodicidade e sugestão de mensagem por IA (humana), com copiar/enviar.
- **Vendas** — total, faturamento, itens e vendas por cliente (cruzamento com a aba de clientes).
- **Perfil** (aba "Mais") — dados/cadastro, gerenciar conta e sair.

## 2. Stack

Next.js 16 (App Router, Turbopack) · React · Tailwind v4 (tokens do DS) · Clerk (auth) · Prisma + PostgreSQL (Supabase) · Supabase Storage (áudios) · Groq (Whisper + LLM estruturador).

## 3. Segurança (Camadas)

- **Auth:** middleware Clerk protege todas as rotas exceto `/sign-in`, `/sign-up`, `/api/webhooks`. Rotas de API revalidam.
- **Headers:** CSP, HSTS (preload), X-Frame DENY, nosniff, Referrer-Policy, Permissions-Policy (`microphone=self`).
- **Multi-tenant:** toda query filtra por `userId` (ownership) + provisionamento **Just-In-Time** do usuário (não depende do webhook em dev).
- **Zero Trust:** validação Zod + sanitização nas mutações.
- **Segredos:** `.env*` fora do git (`.env.example` versionado).
- **Deferidos (documentados):** rate-limit distribuído (hoje em memória), AuditLog dedicado, criptografia em repouso, testes/observabilidade.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env` (local) e defina as mesmas no Vercel (Production):

```
DATABASE_URL, DIRECT_URL                         # Supabase Postgres
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
GROQ_API_KEY
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

## 5. Rodar local

```bash
npm install            # postinstall gera o Prisma Client
npm run dev            # http://localhost:3000
```

## 6. Deploy na Vercel

1. **Add New → Project** → importar o repositório.
2. Framework **Next.js** (auto). **Root Directory:** raiz do repo.
3. Colar as **Environment Variables** (seção 4) em Production.
4. **Deploy**. O build roda `prisma generate` (via `postinstall`/`prebuild`) e `next build`.
5. **Clerk:** apontar o webhook para `https://SEU-APP.vercel.app/api/webhooks/clerk` (secret `whsec_…`). Para o lançamento oficial, usar a instância **de produção** do Clerk (`pk_live`/`sk_live`).
6. **Supabase:** garantir o bucket **`audios`** (privado).

## 7. Painel zerado

O app é multi-tenant: a **primeira vendedora, criando conta nova, já vê o painel vazio** (métricas em 0, listas vazias). Ela alimenta tudo do zero pelos primeiros atendimentos.

## 8. Validação a confirmar em produção

- **Captura de preço:** falar/escrever o valor final (ex.: "vendi 2 bodies por 150 reais") deve preencher o faturamento, o total da venda e reduzir a meta. **A primeira vendedora confirma se está capturando corretamente.**
