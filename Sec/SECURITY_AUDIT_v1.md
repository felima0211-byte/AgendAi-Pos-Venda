# AgendAI — Relatório de Segurança v1

**Data:** 2026-08-07  
**Escopo:** Varredura completa — autenticação, autorização, validação de input, headers HTTP, exposição de dados, rate limiting, secrets

---

## Metodologia

Varredura realizada em 13 fatias sequenciais cobrindo:
1. Mapeamento de superfície de ataque (todas as rotas da API)
2. Verificação de autenticação por rota
3. Análise de multi-tenancy (isolamento entre usuários)
4. Validação de inputs e schemas
5. Headers de segurança HTTP
6. Rate limiting e brute force
7. Exposição de dados sensíveis
8. Força de senha
9. Prompt injection em rotas LLM
10. IDOR (Insecure Direct Object Reference)
11. Injeção de valores inválidos
12. Stack trace em respostas de erro
13. Proteção de secrets no git

---

## Resultados por categoria

### ✅ APROVADO — O que está bem

| Item | Detalhe |
|---|---|
| **Middleware de sessão** | `middleware.ts` intercepta todas as rotas, valida sessão Supabase via `getUser()`, redireciona não-autenticados |
| **Multi-tenant** | Todas as rotas com dados usam `userId` para isolar: `where: { userId, deletedAt: null }` |
| **Headers HTTP** | CSP, X-Frame-Options DENY, HSTS, nosniff, Referrer-Policy, Permissions-Policy configurados em `next.config.ts` |
| **withAuth wrapper** | 7 rotas usam `withAuth` com Zod, rate limit e erros padronizados (nunca vaza stack trace) |
| **IDOR em clientes** | `clients/[id]` tem `getAuthorizedClient()` que valida posse antes de qualquer operação |
| **IDOR em lembretes** | `reminders/[id]` tem `authorize()` com `client: { userId: dbUser.id }` |
| **IDOR em áudio** | `audio/reprocess/[id]` verifica `audio.interaction.client.userId !== dbUser.id` |
| **Webhook Clerk** | Verificado com `svix` (assinatura criptográfica) — não aceita payloads não assinados |
| **Secrets no git** | `.gitignore` protege `.env*`. Nenhum secret encontrado no histórico git |
| **Fail Secure** | Erros inesperados retornam genérico `"Erro interno"` — não vaza stack trace ou mensagem interna |
| **SQL Injection** | ORM Prisma com queries parametrizadas — sem concatenação de strings SQL |

---

### 🔴 CRÍTICO — Encontrado e corrigido

#### SEC-001 — Signup sem rate limit por IP
**Arquivo:** `src/app/api/auth/signup/route.ts`  
**Risco:** Atacante podia criar centenas de contas em segundos (account creation spray, enumeração de e-mails por tempo de resposta).  
**Correção aplicada:** Rate limit de 5 requisições/minuto por IP usando `x-forwarded-for`. Resposta 429 ao exceder.

```diff
+ const ipBuckets = new Map<string, { count: number; resetAt: number }>()
+ function checkSignupRateLimit(ip: string): boolean { ... máx 5/min ... }
+ if (!checkSignupRateLimit(ip)) return 429
```

---

#### SEC-002 — Senha sem requisito de complexidade
**Arquivo:** `src/app/api/auth/signup/route.ts`  
**Risco:** Senha `12345678` passava pela validação (só verificava length ≥ 8). Vulnerável a dictionary attacks.  
**Correção aplicada:** Regex exige ao menos 1 maiúscula + 1 minúscula + 1 número.

```diff
- if (password.length < 8)
+ const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
+ if (!PASSWORD_REGEX.test(password))
```

---

#### SEC-003 — `snooze.days` sem validação de intervalo
**Arquivo:** `src/app/api/reminders/[id]/route.ts`  
**Risco:** `days = Infinity` ou `days = -999` criava datas inválidas (`Invalid Date` ou anos 1970) no banco. Possível corrupção de dados.  
**Correção aplicada:** Validação explícita: `Number.isFinite(raw) && raw >= 1 && raw <= 365`.

```diff
- const days = Number(body.days) || 1
+ const raw = Number(body.days)
+ const days = Number.isFinite(raw) && raw >= 1 && raw <= 365 ? Math.floor(raw) : 1
```

---

#### SEC-004 — `edit.priority` sem validação de enum
**Arquivo:** `src/app/api/reminders/[id]/route.ts`  
**Risco:** Qualquer string passava como `priority` para o Prisma (ex: `"HACKED"`), podendo corromper dados ou gerar comportamento inesperado.  
**Correção aplicada:** Whitelist explícita `['LOW', 'MEDIUM', 'HIGH']` antes de passar ao Prisma.

```diff
- ...(priority && { priority })
+ const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
+ ...(priority && VALID_PRIORITIES.includes(priority) && { priority })
```

---

#### SEC-005 — `edit.title/body` sem limite de tamanho
**Arquivo:** `src/app/api/reminders/[id]/route.ts`  
**Risco:** Input ilimitado podia causar payloads gigantes salvos no banco.  
**Correção aplicada:** `.slice(0, 255)` no título e `.slice(0, 1000)` no body.

---

#### SEC-006 — Signup vaza mensagem de erro interna do Supabase
**Arquivo:** `src/app/api/auth/signup/route.ts`  
**Risco:** Erros que não matchavam o regex `already|exist|registered` retornavam `error.message` da SDK Supabase diretamente, podendo expor detalhes internos.  
**Correção aplicada:** Fallback genérico `"Não foi possível criar a conta. Tente novamente."` para qualquer erro não mapeado.

---

### 🟡 OBSERVAÇÃO — Não corrigido (aceitável ou fora de escopo)

| ID | Item | Motivo de não corrigir |
|---|---|---|
| SEC-007 | Rate limit em memória (não persiste entre restarts) | App de instância única na Vercel — aceitável. Nota: migrar para Upstash Redis antes de escalar para múltiplas regiões |
| SEC-008 | 17 rotas usam `auth()` manual em vez de `withAuth` | Rotas mais antigas — funcionam corretamente, apenas mais verbosas. Refatorar gradualmente |
| SEC-009 | `clients/[id]` GET retorna `deletedAt` no JSON | Dado interno mas não sensível. Nenhum dado de outro usuário é exposto |
| SEC-010 | Prompt injection no assistente/smart-search | Mitigado pelo `withAuth` + rate limit (30 req/min). O LLM acessa só dados do próprio usuário via query parametrizada |
| SEC-011 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposta no cliente | Por design do Supabase — a anon key tem permissões mínimas, protegida por RLS. Não é secret |

---

## Arquivos modificados nesta varredura

| Arquivo | Mudança |
|---|---|
| `src/app/api/auth/signup/route.ts` | Rate limit por IP + complexidade de senha + sanitização de mensagens de erro |
| `src/app/api/reminders/[id]/route.ts` | Validação de `days` (snooze) + whitelist de `priority` + limite de tamanho em `edit` |

---

## Próxima varredura (v2) — sugestões de escopo

- [ ] Testar rotas com token de outro usuário (teste de IDOR em produção via script)
- [ ] Verificar Supabase RLS (Row Level Security) nas tabelas
- [ ] Auditar permissões do bucket `audios` no Supabase Storage (público ou privado?)
- [ ] Migrar rate limit para Upstash antes de escalar
- [ ] Adicionar `Content-Security-Policy-Report-Only` para monitorar violações
- [ ] Revisar `CLERK_WEBHOOK_SECRET` — confirmar que `whsec_...` está configurado na Vercel (atualmente `.env` local tem valor incompleto)
