# AgendAI Pós-Venda — Documento Técnico para Precificação

## Visão Geral

Aplicação web mobile-first SaaS para vendedoras autônomas brasileiras. Foco em gestão de pós-venda: registro de atendimentos, lembretes automáticos, histórico de vendas por cliente e geração de mensagens com IA.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Linguagem | TypeScript 5 (strict) |
| Banco de dados | PostgreSQL via Supabase (pooler IPv4 + SSL) |
| ORM | Prisma 7 com adapter nativo pg |
| Autenticação | Clerk (JWT, webhooks de sync) |
| IA / Transcrição | Groq SDK (Whisper + LLM) |
| Deploy | Vercel (CI/CD via GitHub) |
| Estilização | Tailwind CSS v4 + Design System próprio |
| UI Components | Base UI + Lucide Icons + shadcn |

---

## Arquitetura

- **Monorepo** com `src/` directory, separação por features (`features/clientes`, `features/dashboard`, `features/mensagens`, etc.)
- **API REST** interna com 28 endpoints (`/api/*`) cobrindo todas as entidades
- **Banco relacional** com 13 modelos Prisma: `User`, `Client`, `Child`, `Product`, `Sale`, `SaleItem`, `Reminder`, `Interaction`, `Audio`, `TimelineEvent`, `GeneratedMessage`, `Conversation`, `ChatMessage`
- **Autenticação via Clerk** com sync de usuário por webhook (`/api/webhooks`)
- **Soft delete** em todas as entidades críticas (`deletedAt`)

---

## Funcionalidades Implementadas

### Gestão de Clientes
- Cadastro completo (nome, telefone, e-mail, cidade, endereço, tags, status)
- Perfil detalhado com abas: Vendas / Atendimentos / Timeline
- Busca inteligente (`/api/smart-search`)
- Soft delete com segurança por usuário

### Vendas
- Registro de nova venda com múltiplos produtos (upsert automático de produto por nome)
- Histórico por cliente em layout timeline
- Edição de valor e descrição por venda
- Dashboard de vendas com gráfico estilo Google Finance (bezier, linha 1.2px, hover tooltip)
- Períodos: hoje / semana / mês

### Atendimentos
- Registro via **texto** ou **áudio** (upload + transcrição Groq Whisper)
- Extração automática de dados via LLM (produtos, valor, resumo, sentimento)
- Histórico com transcrição, resumo IA e dados extraídos

### Lembretes
- Criação manual e geração automática via IA (`/api/reminders/generate`)
- Status: pendente / concluído / adiado (snooze: +1, +3, +7 dias)
- Exibição no dashboard com destaque para atrasados
- Notificação via sino no header com contagem de pendentes

### Mensagens IA
- Gerador de mensagens WhatsApp via LLM (tipos: pós-venda, recompra, lembrete, custom)
- Integrado ao detalhe do cliente e aos lembretes pendentes
- Histórico de mensagens geradas por cliente

### Dashboard
- Stats gerais (faturamento, clientes ativos, atendimentos)
- Lembretes pendentes (4 itens, expandível)
- Atendimentos recentes clicáveis (4 itens, expandível)
- Itens mais vendidos
- Dica da hora (24 dicas rotativas por hora)
- Alertas de oportunidade (clientes 30+ dias sem comprar)
- Badge "Novidade" 24h via localStorage em novas funcionalidades

### Assistente IA
- Endpoint `/api/assistant` com contexto de conversa (`Conversation` + `ChatMessage`)
- Insights automáticos por cliente (`/api/insights`)

### Analytics
- Endpoint `/api/analytics` para dados agregados

---

## Infraestrutura & DevOps

- **Deploy automático** via push no GitHub → Vercel
- **Banco gerenciado** Supabase (backups automáticos, RLS opcional)
- **Auth gerenciada** Clerk (MFA, sessões, webhooks)
- **Variáveis de ambiente** separadas por contexto (dev / prod)
- **Build com TypeScript strict** — zero erros de tipo em produção

---

## Métricas de Código

| Métrica | Valor |
|---|---|
| Arquivos totais no `src/` | 154 |
| Endpoints de API | 28 |
| Modelos de banco | 13 |
| Design tokens CSS | sistema próprio com variáveis globais |
| Cobertura de testes | não implementada (MVP) |

---

## Pontos de Atenção para Precificação

**Ativos de valor alto:**
- Integração IA completa (transcrição + extração + geração de mensagem)
- Design System próprio coerente e responsivo
- Arquitetura multi-tenant segura por `userId`
- Pronto para escalar: Supabase + Vercel escalam sem reconfiguração

**Débitos técnicos conhecidos:**
- Sem testes automatizados (unitários / E2E)
- Sem rate limiting nas APIs
- Sem sistema de billing/planos implementado
- Cobertura de analytics ainda básica

---

## Referência de Mercado (SaaS B2C Brasil, 2025–2026)

| Tipo de produto | Faixa de preço de venda |
|---|---|
| MVP validado, sem tração | R$ 8.000 – R$ 25.000 |
| Produto funcional com usuários ativos | R$ 30.000 – R$ 80.000 |
| SaaS com receita recorrente (MRR) | 12–36× MRR |
| Licença de código-fonte (white-label) | R$ 15.000 – R$ 50.000 |
| Hora de desenvolvimento equivalente (SR) | R$ 180 – R$ 350/h |

> Stack Next.js 16 + Prisma + Clerk + IA generativa com 28 endpoints e 13 entidades representa aproximadamente **350–500h de desenvolvimento sênior**, equivalente a **R$ 63.000 – R$ 175.000** de custo de construção a preço de mercado.
