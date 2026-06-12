# Design System — Pedágio Simples

**Produto:** Pedágio Simples v2  
**Empresa:** Move Mais Meios de Pagamento  
**Stack:** React 18 + Vite 6 + TypeScript · Tailwind CSS v4 · shadcn/ui · Radix UI  
**Última atualização:** 2026-05-26  

---

## Índice

1. [Tokens](#1-tokens)  
   1.1 [Cores](#11-cores)  
   1.2 [Tipografia](#12-tipografia)  
   1.3 [Espaçamento](#13-espaçamento)  
   1.4 [Bordas e Raio](#14-bordas-e-raio)  
   1.5 [Sombras e Elevação](#15-sombras-e-elevação)  
   1.6 [Movimento](#16-movimento)  
2. [Componentes](#2-componentes)  
   2.1 [Button](#21-button)  
   2.2 [Badge](#22-badge)  
   2.3 [Card](#23-card)  
   2.4 [Input](#24-input)  
   2.5 [Checkbox](#25-checkbox)  
   2.6 [TipoPassagemBadge](#26-tipopassagembadge)  
   2.7 [BrazilianRealIcon](#27-brazilianrealicon)  
3. [Padrões (Patterns)](#3-padrões-patterns)  
   3.1 [Fluxo de Consulta — Stepper](#31-fluxo-de-consulta--stepper)  
   3.2 [Lista de Pendências](#32-lista-de-pendências)  
   3.3 [Empty States](#33-empty-states)  
   3.4 [Sidebar de Pagamento (Desktop)](#34-sidebar-de-pagamento-desktop)  
   3.5 [Segmented Control](#35-segmented-control)  
   3.6 [Status Pills](#36-status-pills)  
   3.7 [Feed de Atividade](#37-feed-de-atividade)  
   3.8 [PlacaInput](#38-placainput)  
4. [Layout](#4-layout)  
5. [Acessibilidade](#5-acessibilidade)  
6. [Auditoria de Inconsistências](#6-auditoria-de-inconsistências)  

---

## 1. Tokens

Os tokens são definidos em `src/styles/globals.css` como CSS custom properties e sincronizados com Tailwind via `@theme inline`.

### 1.1 Cores

#### Paleta Primária — Violeta institucional

| Token CSS | Hex | Tailwind | Uso |
|-----------|-----|----------|-----|
| `--violeta-900` | `#2E1547` | — | Dark mode background, deep branding |
| `--violeta-700` | `#5B2E8C` | `bg-primary` / `text-primary` | Cor institucional principal; títulos, CTAs, bordas de foco |
| `--violeta-500` | `#8B5FFF` | `ring` | Hover, links, indicadores de foco, valores monetários |

**Derivados usados no código** (ainda hardcoded — ver §6):

| Hex | Uso encontrado |
|-----|---------------|
| `#7142B8` | Hover alternativo do violeta (CTA principal) |
| `#F4EFFB` | Background suave violeta (TipoPassagem "Praça") |
| `#C9AEEA` | Tint violeta 200 (ornamentos, ilustrações) |
| `#E5D8F5` | Tint violeta 100 |
| `#EDE7F6` | Accent background (= `var(--accent)`) |

#### Neutros

| Token CSS | Hex | Tailwind | Uso |
|-----------|-----|----------|-----|
| `--grafite-900` | `#1A1B23` | `text-foreground` | Texto principal |
| `--cinza-600` | `#5B5C68` | `text-muted-foreground` | Texto secundário |
| `--off-white` | `#F7F5FB` | `bg-background` | Background geral das páginas |
| `--cinza-300` | `#C6C7CF` | `border` | Bordas, divisores, estados disabled |
| `--cinza-100` | `#ECECF1` | `bg-secondary` / `bg-muted` | Superfície de inputs, tags, cards internos |

**Neutros adicionais encontrados no código:**

| Hex | Variável semântica sugerida | Uso |
|-----|----------------------------|-----|
| `#8A8B95` | `--cinza-500` | Texto de suporte, placeholder, meta |
| `#B0B1BB` | `--cinza-400` | Ícones inativos, bordas sutis |
| `#3A3B47` | `--grafite-700` | Textos de detalhe (ID, rodovia) |
| `#DCDDE3` | `--cinza-200` | Bordas de card, separadores |

#### Semânticas

| Token CSS | Hex | Tailwind | Uso |
|-----------|-----|----------|-----|
| `--verde-success` | `#0E8B5A` | `text-success` (não mapeado ainda) | Sucesso, confirmação, Free Flow |
| `--ambar-warning` | `#C77700` | `text-warning` (não mapeado ainda) | Aviso, prazo próximo |
| `--vermelho-error` | `#C8324A` | `text-destructive` | Erro, risco de multa |

**Paletas semânticas completas usadas (tints + shades):**

| Grupo | Background | Borda | Texto | Uso |
|-------|-----------|-------|-------|-----|
| Sucesso | `#D4F0E2` | `#A3D9BE` | `#0E8B5A` / `#0A6B45` | Tudo em dia, pagamento confirmado |
| Aviso | `#FBE8C5` | `#F4C97A` | `#C77700` / `#9A5B00` | Prazo próximo, atenção |
| Erro | `#F8D7DD` | `#F0A8B5` | `#C8324A` / `#A3203B` | Risco de multa, erro crítico |
| Especial | `#FFD60A` | — | `#7A4800` | (futuro: destaque ouro) |

#### Tokens de Interface (shadcn/Radix mapeamentos)

```css
--background:       var(--off-white)      /* bg-background   */
--foreground:       var(--grafite-900)    /* text-foreground */
--card:             #ffffff               /* bg-card         */
--primary:          var(--violeta-700)    /* bg-primary      */
--secondary:        var(--cinza-100)      /* bg-secondary    */
--muted:            var(--cinza-100)      /* bg-muted        */
--accent:           #EDE7F6              /* bg-accent       */
--destructive:      var(--vermelho-error) /* bg-destructive  */
--border:           var(--cinza-300)      /* border-border   */
--ring:             var(--violeta-500)    /* ring            */
```

---

### 1.2 Tipografia

**Família:** Inter (Google Fonts) → fallback: `system-ui, -apple-system, 'Segoe UI', sans-serif`

**Escala de tamanhos (Tailwind padrão):**

| Classe | px | Uso |
|--------|----|-----|
| `text-[10px]` | 10 | Labels de metadados (ID, rodovia) |
| `text-xs` | 12 | Badges, chips, helper text, timestamps |
| `text-sm` | 14 | Texto de suporte, descrições, subtítulos |
| `text-base` | 16 | Texto de corpo (padrão acessível) |
| `text-lg` | 18 | Títulos de card (`CardTitle`) |
| `text-xl` | 20 | Títulos de seção |
| `text-2xl` | 24 | Heading de página |
| `text-3xl` | 30 | Valores monetários grandes (sidebar desktop) |

**Pesos:**

| Classe | Peso | Uso |
|--------|------|-----|
| `font-normal` | 400 | Corpo de texto |
| `font-medium` | 500 | Labels, botões secundários |
| `font-semibold` | 600 | Títulos de card, botões, badges |
| `font-bold` | 700 | Valores monetários, nomes de placa, CTAs primários |

**Regras:**

- Line-height padrão: `leading-normal` (1.5) para body; `leading-tight` ou `leading-none` para títulos
- Limite de linha: 65–75 caracteres (implementado via `max-w-xs mx-auto` em empty states)
- Tracking: `tracking-wide` ou `tracking-wider` apenas para labels de metadados em caps

---

### 1.3 Espaçamento

Escala padrão do Tailwind (base 4px). Padrões recorrentes no projeto:

| Escala | px | Contexto |
|--------|----|---------|
| `p-3` / `px-3` | 12 | Padding de cards mobile |
| `p-4` / `px-4` | 16 | Padding de cards desktop, container mobile |
| `p-6` / `px-6` | 24 | Padding de card desktop (shadcn padrão) |
| `gap-2` | 8 | Gap interno de componentes |
| `gap-3` | 12 | Gap entre ícone e texto |
| `gap-4` | 16 | Gap entre cards |
| `space-y-4` | 16 | Espaçamento vertical entre seções |
| `space-y-6` | 24 | Espaçamento interno de CardContent |

---

### 1.4 Bordas e Raio

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|----------------|-----|
| `--radius` | 8px | `rounded-md` | Padrão de componentes (Button, Input, Card interno) |
| `--radius-sm` | 4px | `rounded-sm` | Checkbox, tags pequenas |
| `--radius-lg` | 8px | `rounded-lg` | Cards principais |
| `--radius-xl` | 12px | `rounded-xl` | Cards de resultado (shadcn padrão de Card) |
| — | 999px | `rounded-full` | Pills, badges de status, avatares |

**Espessuras de borda:**

| Classe | Uso |
|--------|-----|
| `border` | Borda padrão (1px) — cards, inputs |
| `border-2` | Borda de seleção — débito selecionado |
| `border-t-2` | Separador de seção (ex: Total do CardContent) |

---

### 1.5 Sombras e Elevação

| Classe | Uso |
|--------|-----|
| `shadow-sm` | Header sticky (navbar) |
| `shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.07)]` | Segmented control (item ativo) |

> ⚠️ **Gap identificado:** Shadow do segmented control usa valor arbitrário. Candidato a token.

---

### 1.6 Movimento

| Contexto | Duração | Easing | Classe |
|---------|---------|--------|--------|
| Micro-interações (hover, focus) | 150ms | ease | `transition-colors` |
| Transições de estado | 200ms | ease | `transition-all duration-200` |
| Expansão de painéis (collapse) | 300ms | ease-in-out | `transition-all duration-300 ease-in-out` |
| Ícone de chevron (rotação) | 200ms | ease | `transition-transform duration-200` |

---

## 2. Componentes

### 2.1 Button

**Arquivo:** `src/components/ui/button.tsx`  
**Base:** shadcn/ui · Radix Slot

#### Variantes

| Variante | Aparência | Uso |
|----------|-----------|-----|
| `default` | `bg-primary text-white` — violeta sólido | CTA primário |
| `destructive` | `bg-destructive text-white` — vermelho | Ação destrutiva |
| `outline` | Borda visível, bg transparente | Ação secundária |
| `secondary` | `bg-secondary` — cinza claro | Ação terciária |
| `ghost` | Fundo transparente, hover suave | Botão de navegação, voltar |
| `link` | Texto com underline | Links inline |

#### Tamanhos

| Size | Altura | Padding H | Uso |
|------|--------|-----------|-----|
| `sm` | 32px | 12px | Ações em cards, filtros |
| `default` | 36px | 16px | Ações de formulário |
| `lg` | 40px | 24px | CTA principal de seção |
| `icon` | 36×36px | — | Botão só com ícone |

#### Overrides aplicados no projeto

```tsx
// CTA principal de pagamento (sobreescreve height e text-size)
className="w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold rounded-lg
           bg-[#8B5FFF] hover:bg-[#7142B8] text-white"

// Botão de ação em card
className="h-9 px-4 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white text-xs"

// Botão disabled (estado)
className="bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed"
```

> ⚠️ Os overrides acima usam valores hardcoded. Idealmente usar `bg-primary`, `hover:bg-primary/80`, `bg-muted`, `text-muted-foreground`.

#### Estados

| Estado | Visual |
|--------|--------|
| Default | Cor de variante |
| Hover | Opacidade reduzida ou shade mais escura |
| Focus | Ring violeta 3px (`focus-visible:ring-ring/50 focus-visible:ring-[3px]`) |
| Disabled | Opacidade 50% + `pointer-events-none` |
| Loading | Ícone `<Loader2 className="animate-spin" />` substituindo conteúdo |

#### Acessibilidade

- Role: `button` nativo
- Keyboard: `Enter` / `Space` para ativar
- Focus ring: `focus-visible:border-ring focus-visible:ring-ring/50`
- Screen reader: use `aria-label` quando o botão contiver apenas ícone

#### Código

```tsx
// CTA primário
<Button className="w-full h-12 font-semibold bg-[#8B5FFF] hover:bg-[#7142B8] text-white">
  <ArrowRight className="h-4 w-4 mr-2" />
  Prosseguir para Pagamento
</Button>

// Ação secundária
<Button variant="outline" size="sm" className="border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white">
  Selecionar todos
</Button>

// Botão de estado loading
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
  Consultando...
</Button>
```

---

### 2.2 Badge

**Arquivo:** `src/components/ui/badge.tsx`  
**Base:** shadcn/ui · Radix Slot

#### Variantes base

| Variante | Aparência | Uso |
|----------|-----------|-----|
| `default` | `bg-primary text-white` | Status principal |
| `secondary` | `bg-secondary text-secondary-foreground` | Status neutro |
| `destructive` | `bg-destructive text-white` | Status de erro |
| `outline` | Borda, fundo transparente | Tag de categoria |

#### Variantes semânticas customizadas (via className)

| Nome informal | Classe | Uso |
|---------------|--------|-----|
| Risco de multa | `bg-[#F8D7DD] text-[#A3203B]` | Passagem com prazo crítico |
| Pendente | `bg-[#FBE8C5] text-[#7A4800]` | Débito aguardando pagamento |
| Sucesso | `bg-[#D4F0E2] text-[#0E8B5A]` | Pagamento confirmado |
| Informação | `bg-[#F4EFFB] text-[#5B2E8C]` | Tipo praça física |

> ⚠️ As variantes semânticas são aplicadas inline. Candidatas a serem formalizadas no CVA do componente.

---

### 2.3 Card

**Arquivo:** `src/components/ui/card.tsx`  
**Partes:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`

#### Anatomia

```
┌─────────────────────────────────────────────┐
│ CardHeader (px-6 pt-6)                      │
│  ├── CardTitle (leading-none)               │
│  ├── CardDescription (text-muted)           │
│  └── CardAction (auto-alinhado à direita)   │
├─────────────────────────────────────────────│
│ CardContent (px-6 [last]:pb-6)              │
├─────────────────────────────────────────────│
│ CardFooter (px-6 pb-6)                      │
└─────────────────────────────────────────────┘
```

#### Usos no projeto

| Contexto | Overrides aplicados |
|----------|---------------------|
| Card de pendências | `border border-[#DCDDE3]` |
| Card de total (sidebar) | `border border-[#DCDDE3]` |
| Card de empty state | `border border-[#DCDDE3]` + `py-10` em CardContent |
| Card de atividade | `border border-[#DCDDE3] overflow-hidden` |

---

### 2.4 Input

**Arquivo:** `src/components/ui/input.tsx`

#### Estados

| Estado | Visual |
|--------|--------|
| Default | `bg-input-background border-input` (= `#ECECF1`) |
| Focus | `border-ring ring-ring/50 ring-[3px]` (violeta) |
| Error | `border-destructive ring-destructive/20` |
| Disabled | Opacidade 50% + `cursor-not-allowed` |

#### PlacaInput — variante especializada

O projeto usa um `<input>` nativo estilizado para a placa de veículo:

```tsx
<input
  className="flex-1 h-9 px-3 bg-[#F7F7F9] border border-[#E5E6EC] rounded-lg
             text-sm text-center font-semibold tracking-wider placeholder-[#B0B1BB]
             focus:outline-none focus:border-[#8B5FFF] focus:ring-1 focus:ring-[#8B5FFF]/15"
  placeholder="ABC-1234"
  maxLength={8}
/>
```

**Formatação automática:** ao digitar 7 caracteres (`/^[A-Z]{3}[0-9]{4}$/`), insere `-` automaticamente entre letras e números.

---

### 2.5 Checkbox

**Arquivo:** `src/components/ui/checkbox.tsx`  
**Base:** Radix UI Checkbox

#### Estados

| Estado | Visual |
|--------|--------|
| Unchecked | `border bg-input-background` |
| Checked | `bg-primary border-primary text-white` (ícone check) |
| Focus | `ring-ring/50 ring-[3px]` |
| Disabled | `opacity-50 cursor-not-allowed` |

#### Uso no projeto

```tsx
<Checkbox
  checked={isSelected}
  onCheckedChange={() => toggleDebitoSelecionado(p.id)}
  className="mt-1 transition-all duration-200 hover:scale-110 flex-shrink-0"
/>
```

---

### 2.6 TipoPassagemBadge

**Arquivo:** `src/components/ui/tipo-passagem-badge.tsx`  
**Tipo:** Componente de domínio específico

#### Variantes

| Tipo | Ícone | Background | Texto | Uso |
|------|-------|-----------|-------|-----|
| `praca_fisica` | `<Building2>` | `#F4EFFB` | `#5B2E8C` | Praça de Pedágio tradicional |
| `portico_free_flow` | `<Radio>` | `#DFF4EA` | `#0E8B5A` | Pórtico Free Flow (sem parar) |

```tsx
<TipoPassagemBadge tipo={passagem.tipo} />
```

---

### 2.7 BrazilianRealIcon

**Arquivo:** `src/components/BrazilianRealIcon.tsx`  
**Tipo:** Ícone SVG customizado

SVG inline com stroke-based rendering. Compatível com `className` para controle de tamanho e cor via `currentColor`.

```tsx
<BrazilianRealIcon className="w-5 h-5 text-[#5B2E8C]" />
```

---

## 3. Padrões (Patterns)

### 3.1 Fluxo de Consulta — Stepper

**Telas:** `ConsultaDebitos → ResultadosDebitos → ResumoPedido → FormaPagamento → ConfirmacaoPagamento`

Indicador de progresso visual (3 etapas) implementado no `ResumoPedido`:

```
✓ Consulta  ──────  [2] Revisão do pedido  ──────  (3) Pagamento
```

**Implementação:**

```tsx
<div className="flex items-center justify-center gap-3 text-sm">
  {/* Etapa concluída */}
  <span className="flex items-center gap-2 text-[#0E8B5A] font-medium">
    <span className="w-6 h-6 rounded-full bg-[#0E8B5A] text-white flex items-center justify-center text-xs font-bold">✓</span>
    Consulta
  </span>
  <div className="w-10 h-px bg-[#5B2E8C]" />
  {/* Etapa atual */}
  <span className="flex items-center gap-2 text-[#5B2E8C] font-semibold">
    <span className="w-6 h-6 rounded-full bg-[#5B2E8C] text-white flex items-center justify-center text-xs font-bold">2</span>
    Revisão do pedido
  </span>
  <div className="w-10 h-px bg-[#DCDDE3]" />
  {/* Etapa futura */}
  <span className="flex items-center gap-2 text-[#C6C7CF]">
    <span className="w-6 h-6 rounded-full border-2 border-[#DCDDE3] flex items-center justify-center text-xs font-bold">3</span>
    Pagamento
  </span>
</div>
```

**Regras:**
- Etapa passada: círculo preenchido verde + checkmark
- Etapa atual: círculo preenchido violeta + número
- Etapa futura: círculo só borda cinza + número
- Linha entre etapas: `1px` — violeta se passada, cinza se futura

---

### 3.2 Lista de Pendências

**Arquivo:** `DashboardUsuario.tsx` — Estado 3

Estrutura de cada item da lista:

```
┌─────────────────────────────────────────────────────────────┐
│ [✓] [📍 Local da praça]           [TipoPassagemBadge] [R$ XX,XX] [Badge]
│      [📅 Data · hora · concessionária]        [🛡 Vence: XX/XX] [🚗 placa]
│      ─────────────────────────────────────────────────────
│      [ID]   [Rodovia]   [Quilômetro]   [Praça]
└─────────────────────────────────────────────────────────────┘
```

**Estados do item:**

| Estado | Background | Borda |
|--------|-----------|-------|
| Não selecionado | `#F7F5FB` | `#DCDDE3` |
| Selecionado | `#F4EFFB` | `#8B5FFF` (2px) |
| Hover (não selecionado) | — | `#8B5FFF` |
| Risco de multa | — | Badge vermelho |

**Filtros:**

1. **Segmented Control** (tipo): Todas / Praça Manual / Free Flow
2. **Filtro de placa** (colapsável): aparece somente se `placasUnicas.length > 1`

**Seleção em massa:** botão "Selecionar todos / Desmarcar todos" aparece quando há mais de 1 item.

---

### 3.3 Empty States

O dashboard de Pendências tem 3 estados mutuamente exclusivos:

#### Estado 1 — Sem veículos cadastrados

```
         [🚗]
  Nenhum veículo cadastrado
  Para consultar e pagar pendências,
  cadastre pelo menos uma placa.
  
  [+ Cadastrar meu primeiro veículo]
```

- Ícone: `Car` em círculo roxo (`#8B5FFF`)
- CTA: `Button` primário roxo → navega para aba Veículos

#### Estado 2 — Veículos cadastrados, sem pendências

```
         [✓]
      Tudo em dia!
  Não existe pendência de pedágio
  para a placa ABC-1234.
  
  + Consultar outra placa
```

- Ícone: `CheckCircle2` em círculo verde claro (`#D4F0E2`)
- CTA: link discreto para formulário inline de nova consulta

#### Estado 3 — Tem pendências

Exibe o card completo (§3.2).

---

### 3.4 Sidebar de Pagamento (Desktop)

**Aparece em:** `≥ 1024px` (`hidden lg:block`), somente no Estado 3

```
┌───────────────────────────────────┐
│  Resumo do Pagamento              │
│  ╔═══════════════════════════════╗│
│  ║  Total a Pagar    R$ 156,80  ║│
│  ║  3 de 5 pendências selecionadas║│
│  ╚═══════════════════════════════╝│
│                                   │
│  [→ Prosseguir para Pagamento]    │
│                                   │
│  🛡 Pagamento 100% seguro         │
└───────────────────────────────────┘
```

- `sticky top-24` para acompanhar scroll
- Largura fixa: `300px` (coluna da grid)
- Background do total: `#5B2E8C` (violeta institucional)
- Botão desabilitado quando nenhuma pendência selecionada: `#C6C7CF`

**No mobile:** Total + Prosseguir ficam inline no final do `CardContent` (dentro de `<div className="lg:hidden">`).

---

### 3.5 Segmented Control

Padrão iOS/macOS para filtros mutuamente exclusivos.

```
┌─────────────────────────────────────────┐
│  Todas  │ Praça Manual │   Free Flow    │
│  ══════                                 │
└─────────────────────────────────────────┘
```

**Implementação:**

```tsx
<div className="flex w-full bg-[#EBEBED] rounded-full p-0.5">
  {opcoes.map(opcao => (
    <button
      key={opcao}
      onClick={() => setFiltro(opcao)}
      className={`flex-1 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
        filtro === opcao
          ? 'bg-white text-[#1A1B23] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.07)]'
          : 'text-[#6B6F7A] hover:text-[#1A1B23]'
      }`}
    >
      {rotulo[opcao]}
    </button>
  ))}
</div>
```

**Regras:**
- Track: `#EBEBED` (cinza muito claro), `rounded-full`, `p-0.5`
- Item ativo: fundo branco + shadow discreta, texto `#1A1B23`
- Item inativo: texto `#6B6F7A`, hover `#1A1B23`
- Transição: `duration-200`

---

### 3.6 Status Pills

Chips compactos de resumo exibidos no cabeçalho da tela de Pendências.

| Tipo | Background | Texto | Ícone |
|------|-----------|-------|-------|
| Valor em aberto (normal) | `#F4EFFB` | `#5B2E8C` | `Wallet` |
| Valor em aberto (risco) | `#F8D7DD` | `#A3203B` | `Wallet` |
| Próximo vencimento | `#FBE8C5` | `#9A5B00` | `Calendar` |
| Veículos monitorados | — (apenas texto) | `#8A8B95` | `Shield` violeta |

```tsx
<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F4EFFB] text-[#5B2E8C]">
  <Wallet className="h-3 w-3" />
  R$ 156,80 em aberto
</span>
```

---

### 3.7 Feed de Atividade

Card colapsável com histórico de eventos. Aparece na base da tela de Pendências.

**Estados do card:**

- Colapsado: exibe chips de resumo (ex: "Alerta · 3 eventos")
- Expandido: lista de eventos com ícone de cor, texto e data

**Tipos de evento:**

| Tipo | Cor do dot | Background | Texto |
|------|-----------|-----------|-------|
| `pagamento` | `#0E8B5A` | `bg-[#D4F0E2] border-[#A3D9BE]` | `text-[#0A6B45]` |
| `alerta` | `#C8324A` | `bg-[#F8D7DD] border-[#F0A8B5]` | `text-[#A3203B]` |
| `novo-debito` | `#C77700` | `bg-[#FBE8C5] border-[#F4C97A]` | `text-[#C77700]` |

**Animação de colapso:**

```tsx
<div className={`transition-all duration-300 ease-in-out overflow-hidden ${
  aberto ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
}`}>
```

---

### 3.8 PlacaInput

**Contextos:** `ConsultaDebitos`, `VeiculosCadastrados`, "Consultar outra placa" inline

Formatação automática da placa brasileira: `ABC-1234` (Mercosul: `ABC1D23`).

```tsx
onChange={(e) => {
  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (value.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(value)) {
    value = value.slice(0, 3) + '-' + value.slice(3);
  }
  setPlaca(value);
}}
placeholder="ABC-1234"
maxLength={8}
```

**Estilos:** `text-center font-semibold tracking-wider` — ênfase na legibilidade da placa.

---

## 4. Layout

### Containers

| Contexto | Classe | Largura max |
|---------|--------|------------|
| Landing page | `container mx-auto px-4` | — |
| Dashboard (Estados 1, 2) | `max-w-6xl mx-auto` | 1152px |
| Dashboard (Estado 3, mobile) | `max-w-6xl mx-auto` → coluna única | — |
| Dashboard (Estado 3, desktop) | `lg:grid lg:grid-cols-[1fr_300px]` | 1fr + 300px fixo |
| ResumoPedido | `max-w-2xl mx-auto` | 672px |

### Grid de 2 Colunas (Estado 3, ≥ 1024px)

```
┌──────────────────────────────┬────────────┐
│   Left column (1fr)          │  300px     │
│   ─ Filters (Segmented)      │  Resumo do │
│   ─ Plate filter (collapse.) │  Pagamento │
│   ─ Debt list (scrollable)   │  ─────────│
│   ─ Activity feed            │  Prosseguir│
└──────────────────────────────┴────────────┘
```

### Responsividade

| Breakpoint | Tailwind | Comportamento |
|-----------|---------|--------------|
| Mobile | `< 640px` | Layout mobile-first; headers compactos; listas sem scroll interno |
| Tablet | `sm: 640px+` | Headers expandidos; scroll interno na lista; animações adicionais |
| Desktop | `lg: 1024px+` | Grid 2 colunas; sidebar sticky; textos maiores em CTAs |

### Header e Navegação

- **Unauthenticated** (`ConsultaDebitos`, `ResultadosDebitos`): header sticky com botão Voltar + branding centralizado
- **Authenticated** (`DashboardUsuario`): sidebar/tab navigation com 5 abas (Pendências, Veículos, Histórico, Total Pago, Conta)

---

## 5. Acessibilidade

### Checklist do Projeto

| Item | Status | Notas |
|------|--------|-------|
| Contraste texto/fundo (4.5:1) | ✅ | `#1A1B23` em `#F7F5FB` ≈ 14:1 |
| Contraste texto secundário | ⚠️ | `#8A8B95` em `#F7F5FB` ≈ 3.9:1 — abaixo de 4.5:1 para texto normal |
| Touch targets ≥ 44×44px | ⚠️ | Alguns botões sm têm `h-8` (32px) — verificar contexto |
| Focus rings visíveis | ✅ | `focus-visible:ring-[3px]` em Button, Input, Checkbox |
| Labels em formulários | ✅ | `<Label>` + `htmlFor` consistentes |
| Alt text em imagens | ✅ | Logo com `alt="Pedágio Simples — by Move Mais"` |
| `cursor-pointer` em clicáveis | ⚠️ | Ausente em alguns `<button>` não-Button |
| `aria-label` em ícone-only | ⚠️ | Verificar botões de fechar (X) e colapso |
| Ordem de tabulação | ✅ | Segue ordem visual da esquerda para direita, top-bottom |
| `prefers-reduced-motion` | ❌ | Não implementado — animações de colapso e spin sem `@media (prefers-reduced-motion)` |

### Contrastes Críticos

| Par de cores | Ratio | AA (4.5:1) | Contexto |
|-------------|-------|-----------|---------|
| `#1A1B23` / `#F7F5FB` | ~14:1 | ✅ | Texto principal |
| `#5B2E8C` / `#F7F5FB` | ~7.2:1 | ✅ | Títulos, links |
| `#8A8B95` / `#F7F5FB` | ~3.9:1 | ❌ | Texto de suporte — usar `#5B5C68` |
| `#fff` / `#5B2E8C` | ~7.3:1 | ✅ | Texto em fundo violeta |
| `#A3203B` / `#F8D7DD` | ~5.4:1 | ✅ | Badge de risco |
| `#9A5B00` / `#FBE8C5` | ~4.7:1 | ✅ | Badge de aviso |

---

## 6. Auditoria de Inconsistências

### Valores Hardcoded que Deveriam Usar Tokens

| Hex hardcoded | Token existente | Ocorrências | Ação |
|---------------|----------------|-------------|------|
| `#5B2E8C` | `var(--violeta-700)` / `bg-primary` | 412 | Migrar para `bg-primary` / `text-primary` |
| `#8B5FFF` | `var(--violeta-500)` / `ring` | 179 | Criar token `--violeta-500` mapeado como `bg-secondary-action` |
| `#1A1B23` | `var(--grafite-900)` / `text-foreground` | 205 | Migrar para `text-foreground` |
| `#F7F5FB` | `var(--off-white)` / `bg-background` | 168 | Migrar para `bg-background` |
| `#DCDDE3` | Token novo: `--cinza-200` | 160 | Criar token ou mapear como `border-border` |
| `#8A8B95` | Token novo: `--cinza-500` | 391 | Criar token + mapear como `text-muted-foreground` alternativo |
| `#0E8B5A` | `var(--verde-success)` | 87 | Criar token `text-success` / `bg-success` |
| `#C8324A` | `var(--vermelho-error)` / `text-destructive` | 84 | Migrar para `text-destructive` |
| `#7142B8` | Derivado de `--violeta-700` | 25 | Usar `hover:bg-primary/80` ou token `--violeta-600` |

### Componentes Sem Estado Formalmente Documentado

| Componente | Estados faltando |
|-----------|-----------------|
| `TipoPassagemBadge` | Não há estado disabled/loading — OK para uso atual |
| `PlacaInput` | Estado de erro (formato inválido) não implementado visualmente |
| Filtro de placa | Estado "todos desmarcados" não tratado (edge case) |

### Padrões Duplicados

| Padrão | Onde aparece | Recomendação |
|--------|-------------|-------------|
| Form "Consultar outra placa" | Estado 2 e Estado 3 do dashboard | Extrair para componente `<ConsultarNovaPlacaForm>` |
| Header de página logada | `ConsultaDebitos`, `ResultadosDebitos` | Extrair para componente `<PageHeader>` |
| Total + Prosseguir | Inline (mobile) + Sidebar (desktop) | Extrair para `<PagamentoSummary>` usado em ambos |

---

## Próximas Evoluções Recomendadas

1. **Criar `src/design-system/tokens.ts`** com objeto TypeScript espelhando os CSS custom properties — permite autocomplete e type-safety nos overrides
2. **Estender CVA do Badge** com as variantes semânticas (`risco`, `pendente`, `sucesso`) para eliminar os 14 usos de className inline
3. **Criar componente `<ConsultarNovaPlacaForm>`** reutilizável (mesmo formulário nos estados 2 e 3)
4. **Criar componente `<PagamentoSummary>`** para encapsular Total + Prosseguir + Security note — reusado no inline (mobile) e na sidebar (desktop)
5. **Implementar `prefers-reduced-motion`** em todas as animações de colapso e spin
6. **Corrigir contraste** de `#8A8B95` para `#5B5C68` nos textos de suporte

---

*Gerado automaticamente a partir da análise do codebase. Manter sincronizado com mudanças na `src/styles/globals.css` e nos componentes do sistema.*
