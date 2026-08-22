# AgendAI Pós-Venda — Design System

> Versão 1.0 · Light-only · Stack: Next.js + Tailwind 4 + CVA + shadcn/ui

---

## 1. Identidade Visual

O AgendAI é uma plataforma B2B de pós-venda voltada a personal trainers e pequenos estúdios. A identidade deve transmitir **confiança, organização e agilidade** — sem parecer pesada ou corporativa.

**Personalidade:** Profissional mas acolhedor. Direto. Moderno sem ser frio.

---

## 2. Paleta de Cores

### Brand

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#6C4CF0` | Ações principais, CTAs, foco |
| `--color-primary-dark` | `#5638D6` | Hover de botões primários |
| `--color-primary-light` | `#8B5CF6` | Destaques secundários |
| `--color-accent` | `#C46A1F` | Alertas, novidades, badges de atenção |

### Superfícies

| Token | Hex | Uso |
|---|---|---|
| `--color-background` | `#F6F6FB` | Fundo geral do app |
| `--color-page` | `#EDEDF5` | Área externa ao conteúdo |
| `--color-surface` | `#FFFFFF` | Cards, modais, painéis elevados |
| `--color-surface-alt` | `#F2F1F8` | Superfície secundária (inputs, tabs) |
| `--color-border` | `#E7E6F0` | Divisores suaves |
| `--color-border-strong` | `#B3B0C4` | Divisores com ênfase |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `--color-text-primary` | `#1A1830` | Títulos, textos de alta importância |
| `--color-text-body` | `#4A4760` | Corpo de texto padrão |
| `--color-text-secondary` | `#6B6884` | Labels, metadados |
| `--color-text-subtle` | `#8B8896` | Placeholders, informações opcionais |

### Semântica

| Estado | BG Token | Cor Token |
|---|---|---|
| Sucesso | `--color-success-bg` `#E4F6EC` | `--color-success` `#1F9D57` |
| Aviso | `--color-warning-bg` `#FCE8D6` | `--color-warning` `#C46A1F` |
| Erro | — | `--color-error` `#EF4444` |
| VIP | `--color-vip-bg` `#F8E9CE` | `--color-vip` `#B5822A` |

---

## 3. Tipografia

**Fonte:** Inter (system-ui fallback)

| Nível | Tamanho | Peso | Uso |
|---|---|---|---|
| H1 | 32px | Bold 700 | Títulos de página |
| H2 | 24px | Semibold 600 | Seções principais |
| H3 | 20px | Semibold 600 | Títulos de card/modal |
| Body | 16px | Regular 400 | Texto corrido |
| Caption | 14px | Medium 500 | Labels, botões, tabs |
| Small | 12px | Regular 400 | Metadados, timestamps |

---

## 4. Espaçamento

Escala base de 4px. Usar sempre múltiplos do token:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80`

Internos de card: `p-4` (16px) padrão, `p-6` (24px) para destaque.  
Gap entre seções de página: mínimo `gap-6`, idealmente `gap-8`.

---

## 5. Border Radius

| Token | Valor | Quando usar |
|---|---|---|
| `--radius-xs` | 6px | Tags internas, chips pequenos |
| `--radius-sm` | 8px | Inputs, botões pequenos |
| `--radius-md` | 12px | Botões padrão, campos |
| `--radius-lg` | 16px | Cards, modais, painéis |
| `--radius-xl` | 20px | Cards de destaque |
| `--radius-full` | 9999px | Avatares, badges circulares |

---

## 6. Sombras

Separação de superfície feita primariamente por **cor**, não por sombra pesada.

| Nível | Uso |
|---|---|
| `shadow-sm` | Cards padrão, superfícies secundárias |
| `shadow-md` | Cards elevados, dropdowns |
| `shadow-lg` | Modais, painéis flutuantes |
| `shadow-primary` | Botão primário em hover/active |

Evitar sombras acima de `shadow-lg` fora de modais.

---

## 7. Componentes

### Botão

```
Variantes: primary · secondary · accent · outline · ghost · destructive
Tamanhos:  sm (h-9) · md (h-12) · lg (h-14)
```

- Ação principal da tela → `primary` (fundo roxo, texto branco)
- Ação secundária → `outline` ou `ghost`
- Ação destrutiva → sempre `destructive`, nunca `primary` vermelho manual
- Nunca usar mais de 1 botão `primary` por seção

### Card

```
Variantes: default · elevated · flat · outlined · gradient
Padding:   sm (p-3) · md (p-4) · lg (p-5) · xl (p-6)
```

- `default`: bordas + shadow-sm — uso geral
- `elevated`: shadow-md — cards de métricas, destaques
- `gradient`: apenas para elementos de engajamento/marketing interno

### Badge

```
Variantes: primary · success · warning · error · accent · neutral
Tamanhos:  sm · md · lg
```

- Usar dot indicator para status em tempo real (online, ativo)
- Badge "Novidade" → variante `accent` com localStorage 24h

### Input

- Sempre incluir `label` e `hint` quando a informação não for óbvia
- Estado de erro: borda vermelha + texto de erro abaixo
- Tamanho padrão: `md` (h-12)

---

## 8. Layout

```
[Sidebar] [TopBar              ]
          [Conteúdo principal  ]
          [BottomNav           ]
```

- **Sidebar:** navegação desktop
- **TopBar:** sticky, backdrop-blur, surface 90% opacidade
- **BottomNav:** mobile, `pb-20` no conteúdo para não sobrepor
- **Background geral:** `var(--color-background)` — nunca branco puro

---

## 9. Animações

| Classe | Uso |
|---|---|
| `animate-fade-in` | Entrada de painéis e modais |
| `animate-slide-up` | Cards carregando de baixo |
| `animate-scale-in` | Dropdowns, tooltips |
| `animate-shimmer` | Skeleton loading |
| `animate-pulse-soft` | Indicadores de status ao vivo |

Duração padrão: `200ms`. Transições de página: `300ms`.  
Nunca animar mais de um elemento simultâneo na mesma região.

---

## 10. Princípios de Aplicação

### ✅ Faça

- Use `--color-primary` como único tom dominante por tela
- Separe superfícies por cor (`surface` vs `surface-alt` vs `background`), não por sombra
- Mantenha hierarquia clara: 1 H1 por página, 1 botão primary por seção
- Use tokens semânticos (`text-secondary`, `border`, etc.) — nunca hex direto no JSX
- Carregamento sempre com skeleton (`animate-shimmer`), nunca spinner solto

### ❌ Evite

- Misturar `accent` (laranja) com `primary` (roxo) em destaque simultâneo
- Usar sombras pesadas em cards de lista — só `shadow-sm`
- Texto branco sobre fundo claro sem background colorido no container
- Criar variantes de cor fora dos tokens definidos
- Adicionar dark mode — DS v1 é light-only por decisão de produto

---

## 11. Arquivos de Referência

| Arquivo | Conteúdo |
|---|---|
| `src/app/globals.css` | Todos os tokens (linhas 7–112) |
| `src/components/ui/` | Biblioteca de componentes |
| `src/components/layout/` | MainLayout, TopBar, Sidebar, BottomNav |
| `src/lib/utils.ts` | Função `cn()` para merge de classes |
