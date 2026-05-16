# Refatoração do Pedágio Simples — Fluxo unificado SPMAR + Free Flow + Pagamento por cartão

**Data:** 2026-05-16
**Status:** Aprovado para implementação

## 1. Contexto e motivação

O Pedágio Simples nasceu como parceria entre Movemais e SPMAR, com o propósito de atender motoristas que passavam por praças físicas SPMAR sem TAG e sem dinheiro, gerando inadimplência. Na v2, foi adicionada a funcionalidade de Free Flow (pórticos). No desenrolar do projeto, o Free Flow acabou sobrepondo o propósito original em toda a comunicação do site, tanto pública quanto logada.

Esta refatoração rebalanceia o produto: praça física SPMAR e Free Flow passam a ser tratados como **dois canais do mesmo serviço**, dentro de um único fluxo de consulta e pagamento. Além disso, adiciona pagamento por cartão de crédito (ELO em destaque, Visa/Master também aceitos) ao lado do PIX existente.

## 2. Objetivos e não-objetivos

### Objetivos
1. Reposicionar o site (público e logado) para que o usuário entenda que o produto cobre passagens em **praça física SPMAR** e **pórticos Free Flow** num único fluxo.
2. Simular cenários reproduzíveis para demonstrar ambos os tipos de passagem.
3. Adicionar pagamento via cartão de crédito (ELO em destaque, Visa, Mastercard) com validação real de formulário e simulação de aprovação.

### Não-objetivos
- Migrar para react-router (fica como evolução futura).
- Integrar gateway de pagamento real — todo o pagamento continua mock.
- Refatorar o dashboard da concessionária (`DashboardConcessionaria`).
- Alterar design system, paleta de cores ou tipografia.

## 3. Princípios de design

1. **Um caminho, dois canais**: a placa é a chave única; o tipo (praça/pórtico) é metadata da passagem, não um fork de fluxo.
2. **Cenário reproduzível**: cada placa de teste sempre gera o mesmo resultado, para demos consistentes.
3. **Visual unificado, semântica diferenciada**: um chip discreto distingue praça vs pórtico nas listas, sem fragmentar a UI.
4. **Cartão sem fricção**: detecção automática de bandeira por BIN, sem o usuário precisar escolher manualmente.

## 4. Arquitetura — módulo de simulação

Novo arquivo `src/utils/simulator.ts` centraliza toda a geração de mocks que hoje vivem espalhados em `App.tsx`, `ResultadosDebitos.tsx` e `DashboardUsuario.tsx`.

### 4.1 Tipos

```ts
export type TipoPassagem = 'praca_fisica' | 'portico_free_flow'

export type StatusPassagem = 'em_prazo' | 'risco_multa'

export type Passagem = {
  id: string
  tipo: TipoPassagem
  local: string           // 'Praça SPMAR Itanhaém — KM 88' ou 'Pórtico Free Flow SP-055 — KM 12'
  concessionaria: string  // 'SPMAR' ou outras
  rodovia: string         // 'SP-055', 'BR-116', etc
  km: number
  data: string            // 'dd/mm/yyyy'
  hora: string            // 'hh:mm'
  valor: number
  categoria?: string      // 'Carro de passeio' (preenchido apenas em praça física)
  placa: string
  status: StatusPassagem
  prazoLimite: string     // 'dd/mm/yyyy'
}
```

### 4.2 Cenários nomeados por placa (demos reproduzíveis)

| Placa | Cenário |
|---|---|
| `ABC-1234` | Mix realista: 2 praças SPMAR + 3 pórticos Free Flow (~R$ 65) |
| `XYZ-5678` | Só praça física: 1 SPMAR Itanhaém recente (~R$ 22) |
| `DEF-9012` | Só Free Flow: 4 pórticos de SP-330 acumulados (~R$ 25) |
| `GHI-3456` | Caso pesado: 8 passagens mistas com status `risco_multa` (~R$ 180) |
| `JKL-7890` | Sem débitos — happy path |
| Qualquer outra placa válida | Geração randômica determinística (seed = placa) com mix de 1–5 passagens, ~30% praça / ~70% pórtico |

### 4.3 API pública

```ts
export function gerarDebitos(placa: string): Passagem[]
export function agregarPorTipo(passagens: Passagem[]): {
  totalPraca: number
  totalPortico: number
  countPraca: number
  countPortico: number
  totalGeral: number
  countTotal: number
}
export function filtrarPorTipo(passagens: Passagem[], tipo?: TipoPassagem): Passagem[]
export function filtrarPorStatus(passagens: Passagem[], status?: StatusPassagem): Passagem[]
export function proximoVencimento(passagens: Passagem[]): Passagem | null
```

Todos os componentes que hoje fabricam mocks inline passam a consumir essas funções.

## 5. Refatoração da área pública

### 5.1 Landing (`App.tsx` + `LandingBeneficios.tsx`)

- **Hero title**: "Pagou o pedágio? **Consulte e regularize em 2 minutos.**"
- **Hero description**: "Passou por uma praça SPMAR sem dinheiro ou por um pórtico Free Flow sem TAG? Consulte sua placa, veja todas as passagens em aberto e quite antes que virem multa."
- **Form CTA**: troca "Consultar passagens Free Flow" por "**Consultar passagens**" (genérico).
- **Badge "Consulta gratuita"**: mantido.
- **`LandingBeneficios`**: revisar copy dos cards de benefício pra mencionar ambos os canais (ex.: "Praça ou pórtico — em um só lugar", "Sem TAG, sem dinheiro? Sem multa").

### 5.2 Resultados (`ResultadosDebitos.tsx` + estado `mostrandoResultados` no hero)

- Cada linha da lista de passagens recebe um **chip à esquerda**, usando ícones `lucide-react` (mesma família já usada no projeto):
  - `Building2` + "Praça SPMAR" — fundo `#F4EFFB`, texto `#5B2E8C`
  - `Radio` + "Pórtico Free Flow" — fundo `#DFF4EA`, texto `#0E8B5A`
- Subhead do bloco mostra breakdown: "**2 praças** e **3 pórticos** encontrados" (substitui o atual "4 passagens em pórtico encontradas").
- Resumo no topo agrega: total geral em R$ + breakdown por tipo.
- **Cenário "sem débitos"** (placa `JKL-7890`): estado vazio com ícone `CheckCircle` grande em verde, título "Nenhuma passagem em aberto", subtexto "Sua placa está em dia" + CTA secundário "Cadastrar veículo e monitorar".

### 5.3 Fluxo

Sem mudança estrutural — segue `landing → resultados → cadastro/login → resumo → pagamento → confirmação`. O que muda é apenas copy e apresentação. O cartão entra como nova opção dentro da tela `FormaPagamento`, sem nova tela.

## 6. Refatoração da área logada

### 6.1 `DashboardUsuario.tsx`

**KPIs no topo (4 cards, 2 linhas no mobile, 1 linha no desktop):**

| Card | Conteúdo |
|---|---|
| **Total em aberto** | R$ X,XX — badge "Z passagens" — ícone `Wallet` |
| **Em praças SPMAR** | R$ X,XX — N passagens — ícone `Building2` |
| **Em pórticos Free Flow** | R$ X,XX — N passagens — ícone `Radio` |
| **Próximo vencimento** | Data + valor da passagem que vence mais cedo — ícone `Clock` |

Cor de fundo discreta em cada card de tipo, espelhando os chips da lista pública.

**Lista de passagens pendentes:**

- Linhas com chip de tipo, idêntico ao público.
- Filtro acima da lista: `[Todas] [Praça SPMAR] [Pórtico Free Flow]` — toggle de 3 estados, seleção única, com os ícones correspondentes ao lado de cada label.
- Filtro secundário por status: `[Todas] [Em prazo] [Risco de multa]`.
- Ordenação por prazo limite (mais urgente primeiro).

### 6.2 `HistoricoPagamentos.tsx`

- Nova coluna **Tipo** com o mesmo chip.
- Filtros: `Tipo`, `Período`, `Forma de pagamento` (PIX / Cartão ELO / Cartão Visa / Cartão Master).
- Exports PDF/XLSX (já existentes via `jspdf` e `xlsx`) preservados.

### 6.3 `VeiculosCadastrados.tsx`

- Por veículo, mini-resumo: "3 praças · 2 pórticos · R$ 67,50 em aberto".

### 6.4 Sem alteração estrutural

`ConfiguracoesConta`, `AlertasInteligentes`, `AutomacaoPagamentos`, `MetodosPagamento` ganham apenas as bandeiras "Cartão ELO/Visa/Master" como opção onde já existe escolha de forma de pagamento.

## 7. Pagamento por cartão (ELO + Visa/Master)

### 7.1 `FormaPagamento.tsx`

Segunda opção ao lado de PIX:

```
┌────────────────────────────────────┐
│ [●] PIX                            │
│     Aprovação instantânea          │
├────────────────────────────────────┤
│ [○] Cartão de crédito              │
│     ELO, Visa ou Mastercard        │
│     [logo ELO em destaque]         │
└────────────────────────────────────┘
```

Selecionar "Cartão" **expande** o form embaixo, sem trocar de tela.

### 7.2 Novo componente `src/components/CartaoCreditoForm.tsx`

**Campos:**
- **Número do cartão** — máscara `#### #### #### ####`, detecção de bandeira por BIN em tempo real, ícone à direita.
- **Validade** — máscara `MM/AA`, valida mês 01–12 e ano ≥ atual.
- **CVV** — 3 dígitos, `type="password"`.
- **Nome impresso** — uppercase automático.

### 7.3 Novo arquivo `src/utils/cartaoValidation.ts`

Implementa, sem dependência externa:

- **Detecção de bandeira por BIN:**
  - ELO: prefixos `4011, 4312, 4389, 4514, 4576, 5041, 5066, 5067, 509, 6277, 627780, 636297, 636368, 65003, 65004, 65005, 6516, 6550`
  - Visa: começa com `4` (e não bate em prefixo ELO)
  - Mastercard: `51-55` ou `2221-2720`
  - Outros → "Bandeira não suportada"
- **Validação Luhn (mod 10)** no número completo.
- **Máscaras** para número e validade.
- Exporta tipo `Bandeira = 'elo' | 'visa' | 'master' | null`.

### 7.4 Comportamento do form

- Bandeira detectada → ícone aparece à direita do número.
- Se bandeira é ELO → microcopy "✓ Parceiro Pedágio Simples" abaixo do campo.
- Botão "Pagar" só habilita quando todos os campos passam validação.

### 7.5 Simulação de aprovação

- Submit → loading 2s.
- Comportamento determinístico baseado nos últimos 4 dígitos:
  - Termina em `0000` → **recusa**: erro inline "Pagamento recusado pela operadora. Tente outro cartão." com botão de retry.
  - Qualquer outro → **aprovado**: vai para `ConfirmacaoPagamento`.

### 7.6 Cartões de teste documentados

| Cartão | Bandeira | Resultado |
|---|---|---|
| `6362 9700 0045 7013` | ELO | Aprovado |
| `4111 1111 1111 1111` | Visa | Aprovado |
| `5555 5555 5555 4444` | Mastercard | Aprovado |
| Qualquer cartão com final `0000` | — | Recusado |

### 7.7 `ConfirmacaoPagamento.tsx`

Mostra a forma de pagamento usada com o ícone correto (PIX ou bandeira do cartão), incluindo os últimos 4 dígitos quando for cartão.

## 8. Arquivos afetados

### Novos
| Arquivo | Propósito |
|---|---|
| `src/utils/simulator.ts` | Geração centralizada de passagens por placa |
| `src/utils/cartaoValidation.ts` | Detecção de bandeira (BIN), Luhn, máscaras |
| `src/components/CartaoCreditoForm.tsx` | Form de cartão com validação em tempo real |
| `src/components/ui/tipo-passagem-badge.tsx` | Chip reutilizável (Praça SPMAR / Pórtico Free Flow) |

### Modificados
| Arquivo | Mudanças |
|---|---|
| `src/App.tsx` | Hero copy, CTA, troca mocks inline por `gerarDebitos()` |
| `src/components/LandingBeneficios.tsx` | Copy dos cards refletindo praça + pórtico |
| `src/components/ResultadosDebitos.tsx` | Subhead com breakdown, chip em cada linha, estado vazio |
| `src/components/FormaPagamento.tsx` | Adiciona opção "Cartão" + embed do `CartaoCreditoForm` |
| `src/components/ConfirmacaoPagamento.tsx` | Mostra forma de pagamento correta (PIX / bandeira / últimos 4) |
| `src/components/DashboardUsuario.tsx` | 4 KPIs novos, filtros tipo/status na lista |
| `src/components/HistoricoPagamentos.tsx` | Coluna Tipo, filtros Tipo + forma de pagamento |
| `src/components/VeiculosCadastrados.tsx` | Mini-resumo "X praças · Y pórticos · R$ Z em aberto" |
| `src/components/ConsultaDebitos.tsx` | Usa `gerarDebitos()` |
| `src/components/ResumoPedido.tsx` | Chip de tipo em cada item |

## 9. Plano de testes manuais

Cenários de demo:

1. **ABC-1234** → consulta → mostra 2 praças SPMAR + 3 pórticos Free Flow, breakdown no topo, chips em cada linha. Pago com PIX → confirmação OK.
2. **XYZ-5678** → consulta → mostra só praça física SPMAR. Pago com cartão ELO (`5067 3300 0000 0001`) → confirmação OK com bandeira ELO.
3. **DEF-9012** → consulta → mostra só pórticos. Pago com Visa (`4111 1111 1111 1111`) → confirmação OK.
4. **GHI-3456** → consulta → 8 passagens em risco de multa, badge vermelho no header. Pago com Master.
5. **JKL-7890** → consulta → estado vazio "Sem débitos · Cadastre o veículo pra monitorar".
6. **Cartão recusado**: qualquer número terminado em `0000` → erro inline, permite retry.
7. **Dashboard logado** (após login): 4 KPIs com totais corretos, filtros Praça/Pórtico filtram a lista, histórico mostra forma de pagamento usada (PIX, Cartão ELO, Cartão Visa, Cartão Master).

## 10. Verificação final

- `npm run dev` roda sem erros.
- `npm run build` passa sem warning/erro novo.
- Cada um dos 7 cenários acima validado visualmente no browser (mobile e desktop).
