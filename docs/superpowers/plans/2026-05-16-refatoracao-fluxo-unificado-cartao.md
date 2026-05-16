# Refatoração Fluxo Unificado + Cartão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebalancear Pedágio Simples para tratar praça física SPMAR e pórtico Free Flow como dois canais do mesmo serviço num fluxo unificado, e adicionar pagamento por cartão (ELO destacado + Visa + Master) ao lado do PIX existente.

**Architecture:** Mantém a estrutura atual de telas controladas por `useState` em `App.tsx`. Centraliza geração de mocks num módulo `simulator.ts` com cenários nomeados por placa. Cria utilitário `cartaoValidation.ts` (detecção de bandeira por BIN + Luhn + máscaras) e form `CartaoCreditoForm.tsx`. Refatora copy/visual de landing, resultados, dashboard, histórico e veículos para refletir os dois canais (chip de tipo, KPIs separados, filtros).

**Tech Stack:** React 18 + Vite + TypeScript, Tailwind, shadcn/ui (Radix), lucide-react, sonner. Sem teste framework hoje — vamos adicionar vitest para testar as duas utilities puras (simulator + cartaoValidation). UI fica com verificação manual via `npm run dev`.

**Spec:** [docs/superpowers/specs/2026-05-16-refatoracao-fluxo-unificado-cartao-design.md](../specs/2026-05-16-refatoracao-fluxo-unificado-cartao-design.md)

---

## Phase 1 — Tooling foundation

### Task 1: Adicionar vitest para testar utilities puras

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Instalar vitest**

Run: `npm install -D vitest @types/node`
Expected: `vitest` adicionado em devDependencies, sem warnings críticos.

- [ ] **Step 2: Adicionar script de teste em `package.json`**

Em `package.json`, na seção `"scripts"`, adicione `test`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Rodar para garantir que vitest está OK**

Run: `npm test`
Expected: `No test files found` (sem testes ainda, mas o comando roda).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: adiciona vitest para testes de utilities"
```

---

## Phase 2 — Utility modules (TDD)

### Task 2: Tipos + cenários nomeados do simulator

**Files:**
- Create: `src/utils/simulator.ts`
- Create: `src/utils/simulator.test.ts`

- [ ] **Step 1: Escrever o teste falhando para cenários nomeados**

Crie `src/utils/simulator.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { gerarDebitos } from './simulator'

describe('gerarDebitos — cenários nomeados', () => {
  it('ABC-1234 retorna mix de 2 praças SPMAR + 3 pórticos Free Flow', () => {
    const passagens = gerarDebitos('ABC-1234')
    const pracas = passagens.filter(p => p.tipo === 'praca_fisica')
    const porticos = passagens.filter(p => p.tipo === 'portico_free_flow')
    expect(pracas).toHaveLength(2)
    expect(porticos).toHaveLength(3)
    pracas.forEach(p => expect(p.concessionaria).toBe('SPMAR'))
  })

  it('XYZ-5678 retorna apenas 1 praça física SPMAR', () => {
    const passagens = gerarDebitos('XYZ-5678')
    expect(passagens).toHaveLength(1)
    expect(passagens[0].tipo).toBe('praca_fisica')
    expect(passagens[0].concessionaria).toBe('SPMAR')
  })

  it('DEF-9012 retorna apenas 4 pórticos Free Flow da SP-330', () => {
    const passagens = gerarDebitos('DEF-9012')
    expect(passagens).toHaveLength(4)
    passagens.forEach(p => {
      expect(p.tipo).toBe('portico_free_flow')
      expect(p.rodovia).toBe('SP-330')
    })
  })

  it('GHI-3456 retorna 8 passagens mistas todas em risco de multa', () => {
    const passagens = gerarDebitos('GHI-3456')
    expect(passagens).toHaveLength(8)
    passagens.forEach(p => expect(p.status).toBe('risco_multa'))
  })

  it('JKL-7890 retorna array vazio (happy path)', () => {
    expect(gerarDebitos('JKL-7890')).toEqual([])
  })

  it('mesma placa sempre retorna mesmo resultado (determinístico)', () => {
    const a = gerarDebitos('ABC-1234')
    const b = gerarDebitos('ABC-1234')
    expect(a).toEqual(b)
  })

  it('cada passagem tem id único', () => {
    const passagens = gerarDebitos('ABC-1234')
    const ids = passagens.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('placa da passagem bate com a placa consultada', () => {
    const passagens = gerarDebitos('ABC-1234')
    passagens.forEach(p => expect(p.placa).toBe('ABC-1234'))
  })
})
```

- [ ] **Step 2: Rodar teste e ver que falha**

Run: `npm test`
Expected: FAIL com "Cannot find module './simulator'"

- [ ] **Step 3: Implementar `src/utils/simulator.ts`**

```ts
export type TipoPassagem = 'praca_fisica' | 'portico_free_flow'
export type StatusPassagem = 'em_prazo' | 'risco_multa'

export type Passagem = {
  id: string
  tipo: TipoPassagem
  local: string
  concessionaria: string
  rodovia: string
  km: number
  data: string
  hora: string
  valor: number
  categoria?: string
  placa: string
  status: StatusPassagem
  prazoLimite: string
}

function hojeMaisDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function hojeMenosDias(dias: number): string {
  return hojeMaisDias(-dias)
}

const CENARIOS_FIXOS: Record<string, (placa: string) => Passagem[]> = {
  'ABC-1234': (placa) => [
    {
      id: 'abc-praca-1',
      tipo: 'praca_fisica',
      local: 'Praça SPMAR Itanhaém — KM 88',
      concessionaria: 'SPMAR',
      rodovia: 'SP-055',
      km: 88,
      data: hojeMenosDias(12),
      hora: '14:32',
      valor: 12.50,
      categoria: 'Carro de passeio',
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(18),
    },
    {
      id: 'abc-praca-2',
      tipo: 'praca_fisica',
      local: 'Praça SPMAR Mongaguá — KM 65',
      concessionaria: 'SPMAR',
      rodovia: 'SP-055',
      km: 65,
      data: hojeMenosDias(5),
      hora: '09:18',
      valor: 12.50,
      categoria: 'Carro de passeio',
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(25),
    },
    {
      id: 'abc-portico-1',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-055 — KM 12',
      concessionaria: 'SPMAR',
      rodovia: 'SP-055',
      km: 12,
      data: hojeMenosDias(20),
      hora: '07:42',
      valor: 8.30,
      placa,
      status: 'risco_multa',
      prazoLimite: hojeMaisDias(5),
    },
    {
      id: 'abc-portico-2',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-160 — KM 34',
      concessionaria: 'Ecovias',
      rodovia: 'SP-160',
      km: 34,
      data: hojeMenosDias(15),
      hora: '18:50',
      valor: 14.60,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(10),
    },
    {
      id: 'abc-portico-3',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-021 — KM 18',
      concessionaria: 'Ecovias',
      rodovia: 'SP-021',
      km: 18,
      data: hojeMenosDias(8),
      hora: '11:05',
      valor: 17.10,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(22),
    },
  ],

  'XYZ-5678': (placa) => [
    {
      id: 'xyz-praca-1',
      tipo: 'praca_fisica',
      local: 'Praça SPMAR Itanhaém — KM 88',
      concessionaria: 'SPMAR',
      rodovia: 'SP-055',
      km: 88,
      data: hojeMenosDias(3),
      hora: '16:20',
      valor: 22.00,
      categoria: 'Caminhonete',
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(27),
    },
  ],

  'DEF-9012': (placa) => [
    {
      id: 'def-1',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-330 — KM 45',
      concessionaria: 'CCR AutoBan',
      rodovia: 'SP-330',
      km: 45,
      data: hojeMenosDias(25),
      hora: '07:42',
      valor: 4.30,
      placa,
      status: 'risco_multa',
      prazoLimite: hojeMaisDias(5),
    },
    {
      id: 'def-2',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-330 — KM 78',
      concessionaria: 'CCR AutoBan',
      rodovia: 'SP-330',
      km: 78,
      data: hojeMenosDias(18),
      hora: '14:15',
      valor: 6.80,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(12),
    },
    {
      id: 'def-3',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-330 — KM 112',
      concessionaria: 'CCR AutoBan',
      rodovia: 'SP-330',
      km: 112,
      data: hojeMenosDias(10),
      hora: '18:50',
      valor: 5.10,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(20),
    },
    {
      id: 'def-4',
      tipo: 'portico_free_flow',
      local: 'Pórtico Free Flow SP-330 — KM 145',
      concessionaria: 'CCR AutoBan',
      rodovia: 'SP-330',
      km: 145,
      data: hojeMenosDias(4),
      hora: '10:05',
      valor: 9.20,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(26),
    },
  ],

  'GHI-3456': (placa) => Array.from({ length: 8 }, (_, i) => {
    const ehPraca = i % 3 === 0
    return ehPraca
      ? {
          id: `ghi-praca-${i}`,
          tipo: 'praca_fisica' as const,
          local: `Praça SPMAR — KM ${30 + i * 7}`,
          concessionaria: 'SPMAR',
          rodovia: 'SP-055',
          km: 30 + i * 7,
          data: hojeMenosDias(30 + i),
          hora: '12:00',
          valor: 22.50,
          categoria: 'Carro de passeio',
          placa,
          status: 'risco_multa' as const,
          prazoLimite: hojeMaisDias(i % 5),
        }
      : {
          id: `ghi-portico-${i}`,
          tipo: 'portico_free_flow' as const,
          local: `Pórtico Free Flow SP-${100 + i * 10} — KM ${i * 5}`,
          concessionaria: i % 2 === 0 ? 'SPMAR' : 'Ecovias',
          rodovia: `SP-${100 + i * 10}`,
          km: i * 5,
          data: hojeMenosDias(30 + i),
          hora: '08:30',
          valor: 18.40,
          placa,
          status: 'risco_multa' as const,
          prazoLimite: hojeMaisDias(i % 5),
        }
  }),

  'JKL-7890': () => [],
}

export function gerarDebitos(placa: string): Passagem[] {
  const builder = CENARIOS_FIXOS[placa]
  if (builder) return builder(placa)
  // Default: vazio temporariamente (Task 3 implementa random determinístico)
  return []
}
```

- [ ] **Step 4: Rodar testes e ver passar**

Run: `npm test`
Expected: PASS — todos os 8 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/utils/simulator.ts src/utils/simulator.test.ts
git commit -m "feat: simulator com cenários nomeados de débitos por placa"
```

---

### Task 3: Random determinístico + helpers de agregação

**Files:**
- Modify: `src/utils/simulator.ts`
- Modify: `src/utils/simulator.test.ts`

- [ ] **Step 1: Adicionar testes para random determinístico e helpers**

Adicione ao final de `src/utils/simulator.test.ts`:

```ts
import { agregarPorTipo, filtrarPorTipo, filtrarPorStatus, proximoVencimento } from './simulator'

describe('gerarDebitos — placa desconhecida (random determinístico)', () => {
  it('placa desconhecida retorna entre 1 e 5 passagens', () => {
    const passagens = gerarDebitos('ZZZ-9999')
    expect(passagens.length).toBeGreaterThanOrEqual(1)
    expect(passagens.length).toBeLessThanOrEqual(5)
  })

  it('mesma placa desconhecida sempre retorna mesmo resultado', () => {
    const a = gerarDebitos('ZZZ-9999')
    const b = gerarDebitos('ZZZ-9999')
    expect(a).toEqual(b)
  })

  it('placas diferentes retornam resultados diferentes', () => {
    const a = gerarDebitos('AAA-1111')
    const b = gerarDebitos('BBB-2222')
    expect(a).not.toEqual(b)
  })
})

describe('agregarPorTipo', () => {
  it('agrega corretamente passagens mistas', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = agregarPorTipo(passagens)
    expect(r.countPraca).toBe(2)
    expect(r.countPortico).toBe(3)
    expect(r.countTotal).toBe(5)
    expect(r.totalPraca).toBeCloseTo(25.00)
    expect(r.totalPortico).toBeCloseTo(40.00)
    expect(r.totalGeral).toBeCloseTo(65.00)
  })

  it('retorna zeros para lista vazia', () => {
    const r = agregarPorTipo([])
    expect(r).toEqual({
      countPraca: 0, countPortico: 0, countTotal: 0,
      totalPraca: 0, totalPortico: 0, totalGeral: 0,
    })
  })
})

describe('filtrarPorTipo', () => {
  it('filtra apenas praças', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = filtrarPorTipo(passagens, 'praca_fisica')
    expect(r).toHaveLength(2)
    r.forEach(p => expect(p.tipo).toBe('praca_fisica'))
  })

  it('sem filtro retorna tudo', () => {
    const passagens = gerarDebitos('ABC-1234')
    expect(filtrarPorTipo(passagens)).toEqual(passagens)
  })
})

describe('filtrarPorStatus', () => {
  it('filtra apenas risco_multa', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = filtrarPorStatus(passagens, 'risco_multa')
    r.forEach(p => expect(p.status).toBe('risco_multa'))
  })
})

describe('proximoVencimento', () => {
  it('retorna a passagem com prazo mais próximo', () => {
    const passagens = gerarDebitos('ABC-1234')
    const r = proximoVencimento(passagens)
    expect(r).not.toBeNull()
    // ABC-1234 tem 'abc-portico-1' com prazo +5 dias, deve ser o mais próximo
    expect(r?.id).toBe('abc-portico-1')
  })

  it('retorna null para lista vazia', () => {
    expect(proximoVencimento([])).toBeNull()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — novos testes falham (helpers ainda não existem).

- [ ] **Step 3: Implementar random determinístico e helpers**

Em `src/utils/simulator.ts`, **substitua** a função `gerarDebitos` final e **adicione** os helpers:

```ts
// Hash simples e determinístico de string → número
function seedDaPlaca(placa: string): number {
  let h = 0
  for (let i = 0; i < placa.length; i++) {
    h = (h * 31 + placa.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// PRNG determinístico (Mulberry32)
function mulberry32(seed: number) {
  let s = seed
  return function () {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RODOVIAS_PORTICO = [
  { rodovia: 'SP-330', concessionaria: 'CCR AutoBan' },
  { rodovia: 'SP-021', concessionaria: 'Ecovias' },
  { rodovia: 'SP-160', concessionaria: 'Ecovias' },
  { rodovia: 'BR-116', concessionaria: 'Arteris' },
  { rodovia: 'SP-055', concessionaria: 'SPMAR' },
]

function gerarRandom(placa: string): Passagem[] {
  const rnd = mulberry32(seedDaPlaca(placa))
  const quantidade = 1 + Math.floor(rnd() * 5) // 1 a 5
  const passagens: Passagem[] = []
  for (let i = 0; i < quantidade; i++) {
    const ehPraca = rnd() < 0.3
    const km = 10 + Math.floor(rnd() * 200)
    const diasAtras = 1 + Math.floor(rnd() * 25)
    const diasPrazo = Math.floor(rnd() * 30)
    if (ehPraca) {
      passagens.push({
        id: `rnd-${placa}-${i}`,
        tipo: 'praca_fisica',
        local: `Praça SPMAR — KM ${km}`,
        concessionaria: 'SPMAR',
        rodovia: 'SP-055',
        km,
        data: hojeMenosDias(diasAtras),
        hora: `${String(6 + Math.floor(rnd() * 14)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
        valor: 12.50 + Math.floor(rnd() * 10),
        categoria: 'Carro de passeio',
        placa,
        status: diasPrazo <= 7 ? 'risco_multa' : 'em_prazo',
        prazoLimite: hojeMaisDias(diasPrazo),
      })
    } else {
      const rod = RODOVIAS_PORTICO[Math.floor(rnd() * RODOVIAS_PORTICO.length)]
      passagens.push({
        id: `rnd-${placa}-${i}`,
        tipo: 'portico_free_flow',
        local: `Pórtico Free Flow ${rod.rodovia} — KM ${km}`,
        concessionaria: rod.concessionaria,
        rodovia: rod.rodovia,
        km,
        data: hojeMenosDias(diasAtras),
        hora: `${String(6 + Math.floor(rnd() * 14)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
        valor: 4.30 + Math.floor(rnd() * 15),
        placa,
        status: diasPrazo <= 7 ? 'risco_multa' : 'em_prazo',
        prazoLimite: hojeMaisDias(diasPrazo),
      })
    }
  }
  return passagens
}

export function gerarDebitos(placa: string): Passagem[] {
  const builder = CENARIOS_FIXOS[placa]
  if (builder) return builder(placa)
  return gerarRandom(placa)
}

export function agregarPorTipo(passagens: Passagem[]) {
  const pracas = passagens.filter(p => p.tipo === 'praca_fisica')
  const porticos = passagens.filter(p => p.tipo === 'portico_free_flow')
  const totalPraca = pracas.reduce((s, p) => s + p.valor, 0)
  const totalPortico = porticos.reduce((s, p) => s + p.valor, 0)
  return {
    countPraca: pracas.length,
    countPortico: porticos.length,
    countTotal: passagens.length,
    totalPraca,
    totalPortico,
    totalGeral: totalPraca + totalPortico,
  }
}

export function filtrarPorTipo(passagens: Passagem[], tipo?: TipoPassagem): Passagem[] {
  if (!tipo) return passagens
  return passagens.filter(p => p.tipo === tipo)
}

export function filtrarPorStatus(passagens: Passagem[], status?: StatusPassagem): Passagem[] {
  if (!status) return passagens
  return passagens.filter(p => p.status === status)
}

function parseData(ddmmyyyy: string): number {
  const [d, m, y] = ddmmyyyy.split('/').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function proximoVencimento(passagens: Passagem[]): Passagem | null {
  if (passagens.length === 0) return null
  return passagens.reduce((acc, p) =>
    parseData(p.prazoLimite) < parseData(acc.prazoLimite) ? p : acc
  )
}
```

**IMPORTANTE:** A substituição é da `gerarDebitos` no final do arquivo — o objeto `CENARIOS_FIXOS` e os helpers `hojeMaisDias`/`hojeMenosDias` do Task 2 ficam intactos.

- [ ] **Step 4: Rodar testes e verificar**

Run: `npm test`
Expected: PASS — todos os ~15 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/utils/simulator.ts src/utils/simulator.test.ts
git commit -m "feat: simulator com random determinístico e helpers de agregação"
```

---

### Task 4: cartaoValidation — detecção de bandeira + Luhn + máscaras

**Files:**
- Create: `src/utils/cartaoValidation.ts`
- Create: `src/utils/cartaoValidation.test.ts`

- [ ] **Step 1: Escrever testes falhando**

Crie `src/utils/cartaoValidation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  detectarBandeira,
  validarLuhn,
  formatarNumeroCartao,
  formatarValidade,
  validarValidade,
} from './cartaoValidation'

describe('detectarBandeira', () => {
  it('detecta ELO por prefixos conhecidos', () => {
    expect(detectarBandeira('5067330000000001')).toBe('elo')
    expect(detectarBandeira('6516000000000000')).toBe('elo')
    expect(detectarBandeira('6550000000000000')).toBe('elo')
    expect(detectarBandeira('4011780000000000')).toBe('elo')
    expect(detectarBandeira('6362970000000000')).toBe('elo')
  })

  it('detecta Visa quando começa com 4 e não é ELO', () => {
    expect(detectarBandeira('4111111111111111')).toBe('visa')
    expect(detectarBandeira('4242424242424242')).toBe('visa')
  })

  it('detecta Mastercard nos ranges 51-55 e 2221-2720', () => {
    expect(detectarBandeira('5555555555554444')).toBe('master')
    expect(detectarBandeira('5105105105105100')).toBe('master')
    expect(detectarBandeira('2221000000000000')).toBe('master')
    expect(detectarBandeira('2720990000000000')).toBe('master')
  })

  it('retorna null para bandeiras não suportadas', () => {
    expect(detectarBandeira('3782822463100050')).toBeNull() // Amex
    expect(detectarBandeira('6011111111111117')).toBeNull() // Discover
    expect(detectarBandeira('')).toBeNull()
  })

  it('ignora espaços e traços no input', () => {
    expect(detectarBandeira('5067 3300 0000 0001')).toBe('elo')
    expect(detectarBandeira('4111-1111-1111-1111')).toBe('visa')
  })
})

describe('validarLuhn', () => {
  it('aceita números válidos', () => {
    expect(validarLuhn('4111111111111111')).toBe(true)
    expect(validarLuhn('5555555555554444')).toBe(true)
    expect(validarLuhn('5067 3300 0000 0001')).toBe(true)
  })

  it('rejeita números inválidos', () => {
    expect(validarLuhn('4111111111111112')).toBe(false)
    expect(validarLuhn('1234567890123456')).toBe(false)
    expect(validarLuhn('')).toBe(false)
  })
})

describe('formatarNumeroCartao', () => {
  it('aplica máscara de grupos de 4', () => {
    expect(formatarNumeroCartao('4111111111111111')).toBe('4111 1111 1111 1111')
    expect(formatarNumeroCartao('41111111')).toBe('4111 1111')
    expect(formatarNumeroCartao('4')).toBe('4')
  })

  it('remove caracteres não-numéricos antes de formatar', () => {
    expect(formatarNumeroCartao('41-11 abc 1111')).toBe('4111 1111')
  })

  it('limita a 19 dígitos (16 + 3 espaços = 19)', () => {
    expect(formatarNumeroCartao('41111111111111119999')).toBe('4111 1111 1111 1111')
  })
})

describe('formatarValidade', () => {
  it('aplica máscara MM/AA', () => {
    expect(formatarValidade('1230')).toBe('12/30')
    expect(formatarValidade('1')).toBe('1')
    expect(formatarValidade('12')).toBe('12')
    expect(formatarValidade('123')).toBe('12/3')
  })

  it('remove não-numéricos', () => {
    expect(formatarValidade('12/3')).toBe('12/3')
    expect(formatarValidade('aa12bb30')).toBe('12/30')
  })
})

describe('validarValidade', () => {
  it('aceita data futura', () => {
    expect(validarValidade('12/99')).toBe(true)
  })

  it('rejeita mês inválido', () => {
    expect(validarValidade('13/30')).toBe(false)
    expect(validarValidade('00/30')).toBe(false)
  })

  it('rejeita formato incompleto', () => {
    expect(validarValidade('12/3')).toBe(false)
    expect(validarValidade('')).toBe(false)
  })

  it('rejeita data passada', () => {
    expect(validarValidade('01/20')).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar `src/utils/cartaoValidation.ts`**

```ts
export type Bandeira = 'elo' | 'visa' | 'master' | null

const ELO_PREFIXES = [
  '401178', '401179', '438935', '457631', '457632', '431274',
  '451416', '457393', '504175', '506699', '506700', '506701',
  '506702', '506703', '506704', '506705', '506706', '506707',
  '506708', '506709', '506710', '506711', '506712', '506713',
  '506714', '506715', '506716', '506717', '506718', '506719',
  '506720', '506721', '506722', '506723', '506724', '506725',
  '506726', '506727', '506728', '506729', '506730', '506731',
  '506732', '506733', '506734', '506735', '506736', '506737',
  '506738', '506739', '506740', '506741', '506742', '506743',
  '506744', '506745', '506746', '506747', '506748', '506749',
  '509000', '509001', '509002', '509003', '509004', '509005',
  '509006', '509007', '509008', '509009', '509010',
  '627780', '636297', '636368',
  '650031', '650032', '650033', '650034', '650035', '650036',
  '650037', '650038', '650039', '650040', '650041', '650042',
  '650043', '650044', '650045', '650046', '650047', '650048',
  '650049', '650050', '650051',
  '651652', '651653', '651654', '651655', '651656', '651657',
  '651658', '651659',
  '655000', '655001', '655002', '655003', '655004', '655005',
  '655006', '655007', '655008', '655009', '655010', '655011',
  '655012', '655013', '655014', '655015', '655016', '655017',
  '655018', '655019', '655020', '655021',
]

function digitos(s: string): string {
  return s.replace(/\D/g, '')
}

export function detectarBandeira(numero: string): Bandeira {
  const n = digitos(numero)
  if (n.length === 0) return null

  // ELO primeiro (alguns prefixos colidem com Visa)
  for (const p of ELO_PREFIXES) {
    if (n.startsWith(p)) return 'elo'
  }

  // Visa: começa com 4
  if (n[0] === '4') return 'visa'

  // Mastercard: 51-55 ou 2221-2720
  const prefixo2 = parseInt(n.slice(0, 2), 10)
  if (prefixo2 >= 51 && prefixo2 <= 55) return 'master'

  if (n.length >= 4) {
    const prefixo4 = parseInt(n.slice(0, 4), 10)
    if (prefixo4 >= 2221 && prefixo4 <= 2720) return 'master'
  } else if (n.length >= 2) {
    // Início pode ser Master, mas precisamos de mais dígitos pra ter certeza
    const p2 = parseInt(n.slice(0, 2), 10)
    if (p2 === 22 || p2 === 23 || p2 === 24 || p2 === 25 || p2 === 26 || p2 === 27) {
      return 'master'
    }
  }

  return null
}

export function validarLuhn(numero: string): boolean {
  const n = digitos(numero)
  if (n.length === 0) return false
  let soma = 0
  let alterna = false
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10)
    if (alterna) {
      d *= 2
      if (d > 9) d -= 9
    }
    soma += d
    alterna = !alterna
  }
  return soma % 10 === 0
}

export function formatarNumeroCartao(input: string): string {
  const n = digitos(input).slice(0, 16)
  return n.match(/.{1,4}/g)?.join(' ') ?? n
}

export function formatarValidade(input: string): string {
  const n = digitos(input).slice(0, 4)
  if (n.length <= 2) return n
  return `${n.slice(0, 2)}/${n.slice(2)}`
}

export function validarValidade(valor: string): boolean {
  const m = valor.match(/^(\d{2})\/(\d{2})$/)
  if (!m) return false
  const mes = parseInt(m[1], 10)
  const ano = parseInt(m[2], 10) + 2000
  if (mes < 1 || mes > 12) return false
  const agora = new Date()
  const limite = new Date(ano, mes, 0, 23, 59, 59)
  return limite >= agora
}
```

- [ ] **Step 4: Rodar testes**

Run: `npm test`
Expected: PASS — todos os testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/utils/cartaoValidation.ts src/utils/cartaoValidation.test.ts
git commit -m "feat: validação de cartão (detecção bandeira ELO/Visa/Master + Luhn + máscaras)"
```

---

## Phase 3 — Componente compartilhado

### Task 5: TipoPassagemBadge

**Files:**
- Create: `src/components/ui/tipo-passagem-badge.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { Building2, Radio } from 'lucide-react'
import type { TipoPassagem } from '../../utils/simulator'

interface TipoPassagemBadgeProps {
  tipo: TipoPassagem
  className?: string
}

export function TipoPassagemBadge({ tipo, className = '' }: TipoPassagemBadgeProps) {
  if (tipo === 'praca_fisica') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#F4EFFB] text-[#5B2E8C] ${className}`}
      >
        <Building2 className="h-3 w-3" />
        Praça SPMAR
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#DFF4EA] text-[#0E8B5A] ${className}`}
    >
      <Radio className="h-3 w-3" />
      Pórtico Free Flow
    </span>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/tipo-passagem-badge.tsx
git commit -m "feat: TipoPassagemBadge para distinguir praça SPMAR / pórtico Free Flow"
```

---

## Phase 4 — Refatoração da área pública

### Task 6: App.tsx — hero copy, CTA e uso do simulator

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Trocar a copy do hero**

Em `src/App.tsx`, localize o bloco `<AnimatedHero ... title=...>` (perto da linha 676–684) e substitua o `title` e `description`:

```tsx
title={
  <>
    Pagou o pedágio?{" "}
    <span className="text-[#8B5FFF]">Consulte e regularize em 2 minutos.</span>
  </>
}
description="Passou por uma praça SPMAR sem dinheiro ou por um pórtico Free Flow sem TAG? Consulte sua placa, veja todas as passagens em aberto e quite antes que virem multa."
```

- [ ] **Step 2: Trocar headline e CTA do card de consulta**

No mesmo arquivo, dentro de `formCard`, substitua o bloco do `<h3>` (linhas ~478–484) por:

```tsx
<h3 className="text-lg sm:text-xl lg:text-2xl text-[#1A1B23] leading-relaxed mb-2">
  <strong className="text-[#5B2E8C]">Verifique suas passagens</strong>{" "}
  em <strong className="text-[#5B2E8C]">praças SPMAR e pórticos Free Flow</strong>.
</h3>
```

E o texto do botão (linha ~571) de `Consultar passagens Free Flow` para:

```tsx
<Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
Consultar passagens
```

- [ ] **Step 3: Substituir mocks inline por `gerarDebitos`**

No topo do arquivo (após os imports existentes), adicione:

```tsx
import { gerarDebitos, agregarPorTipo, type Passagem } from "./utils/simulator";
```

Localize `handleIrParaPagamentoDireto` (linhas ~122–185) e substitua **todo o corpo** da função por:

```tsx
const handleIrParaPagamentoDireto = (placa: string) => {
  const placas = placa.includes(',') ? placa.split(',').map(p => p.trim()) : [placa];
  const todasPassagens: Passagem[] = placas.flatMap(p => gerarDebitos(p));
  const valorTotal = todasPassagens.reduce((acc, d) => acc + d.valor, 0);
  setDebitosSelecionados(todasPassagens);
  setValorTotalSelecionado(valorTotal);
  setTelaAtual('resumo-pedido');
};
```

- [ ] **Step 4: Substituir mock do botão "Ver passagens e pagar agora"**

Localize o `onClick` do botão de pagamento dentro do bloco `mostrandoResultados && dadosVeiculo` (linhas ~626–634) e substitua por:

```tsx
onClick={() => {
  const passagens = gerarDebitos(dadosVeiculo.placa);
  const total = passagens.reduce((s, p) => s + p.valor, 0);
  handleIrParaPagamento(passagens, total);
}}
```

E substitua o subhead do alerta (linha ~620) para usar o agregador:

```tsx
{(() => {
  const r = agregarPorTipo(gerarDebitos(dadosVeiculo.placa));
  return (
    <h4 className="font-semibold text-[#5B2E8C] mb-1 text-sm sm:text-base">
      {r.countPraca > 0 && `${r.countPraca} praça${r.countPraca > 1 ? 's' : ''}`}
      {r.countPraca > 0 && r.countPortico > 0 && ' e '}
      {r.countPortico > 0 && `${r.countPortico} pórtico${r.countPortico > 1 ? 's' : ''}`}
      {r.countTotal === 0 && 'Nenhuma passagem em aberto'}
      {r.countTotal > 0 && ' encontrad' + (r.countTotal > 1 ? 'os' : 'o')}
    </h4>
  );
})()}
```

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: build OK sem erros novos.

- [ ] **Step 6: Verificar manualmente no browser**

Run: `npm run dev`
- Abrir `http://localhost:5173`.
- Hero deve mostrar "Pagou o pedágio? Consulte e regularize em 2 minutos."
- Botão deve dizer "Consultar passagens" (sem "Free Flow").
- Digitar `ABC-1234`, completar Turnstile, clicar consultar — depois clicar "Ver passagens e pagar agora" deve mostrar valores que somam ~R$ 65.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: hero e fluxo de consulta abraçam praça SPMAR + Free Flow via simulator"
```

---

### Task 7: LandingBeneficios — copy dos cards

**Files:**
- Modify: `src/components/LandingBeneficios.tsx`

- [ ] **Step 1: Ler o arquivo atual para descobrir cards**

Run: `cat src/components/LandingBeneficios.tsx | head -80`
Anote os textos atuais dos cards de benefício (títulos e descrições).

- [ ] **Step 2: Atualizar copy mencionando ambos os canais**

Edite os títulos/descrições de cada card para mencionar praça e pórtico. Sugestão de copy alinhada ao spec:

- Primeiro card → título "Praça ou pórtico — em um só lugar" / descrição "Consulte por placa e veja todas as suas passagens (SPMAR e Free Flow) num só lugar."
- Outro card → "Sem TAG, sem dinheiro? Sem multa." / "Regularize antes do prazo e evite a multa de evasão."
- Outro card → "Pague como preferir" / "PIX instantâneo ou cartão de crédito (ELO, Visa, Mastercard)."

Aplique os textos sem mudar a estrutura visual do componente.

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`
Role a landing até a seção de benefícios e confirme os novos textos.

- [ ] **Step 4: Commit**

```bash
git add src/components/LandingBeneficios.tsx
git commit -m "refactor: copy dos benefícios cita praça SPMAR e pórtico Free Flow"
```

---

### Task 8: ResultadosDebitos — chip, breakdown e estado vazio

**Files:**
- Modify: `src/components/ResultadosDebitos.tsx`

- [ ] **Step 1: Substituir o type local e o mock por `Passagem` do simulator**

No topo de `src/components/ResultadosDebitos.tsx`, **remova** a interface local `PassagemFreeFlow` e **adicione** o import:

```tsx
import { gerarDebitos, agregarPorTipo, type Passagem } from '../utils/simulator'
import { TipoPassagemBadge } from './ui/tipo-passagem-badge'
```

Substitua a lista hardcoded `const passagens: PassagemFreeFlow[] = [...]` por:

```tsx
const passagens: Passagem[] = gerarDebitos(placa)
```

E atualize a assinatura/uso de `PassagemFreeFlow` na prop `onPagar` para `Passagem[]`. Atualize também referências dos campos antigos:
- `p.portico` → `p.local`
- `p.prazoVencimento` → `p.prazoLimite`
- `p.riscoDeMulta` → `p.status === 'risco_multa'`
- `p.sentido` → remover (não existe no novo tipo) — substitua por `p.km && `KM ${p.km}``

- [ ] **Step 2: Adicionar breakdown no topo (subhead)**

Logo após o título principal `<h1>` (linha ~143), antes do `<p className="text-[#8A8B95]">`, adicione:

```tsx
{(() => {
  const r = agregarPorTipo(passagens);
  if (r.countTotal === 0) return null;
  return (
    <p className="text-[#5B2E8C] font-medium">
      {r.countPraca > 0 && <><strong>{r.countPraca}</strong> {r.countPraca > 1 ? 'praças SPMAR' : 'praça SPMAR'}</>}
      {r.countPraca > 0 && r.countPortico > 0 && ' · '}
      {r.countPortico > 0 && <><strong>{r.countPortico}</strong> {r.countPortico > 1 ? 'pórticos Free Flow' : 'pórtico Free Flow'}</>}
    </p>
  );
})()}
```

- [ ] **Step 3: Adicionar `TipoPassagemBadge` em cada linha da lista**

Dentro do `.map((p) => ...)` que renderiza cada passagem (linha ~214), adicione o badge ao lado do nome do local. Dentro do `<div className="min-w-0">`, antes do `<div className="flex items-center gap-2 flex-wrap">`, insira:

```tsx
<TipoPassagemBadge tipo={p.tipo} className="mb-1.5" />
```

- [ ] **Step 4: Adicionar estado vazio (placa sem débitos)**

Logo após o bloco do título principal e antes do `Alerta de risco de multa`, adicione:

```tsx
{passagens.length === 0 && (
  <Card className="border border-[#DCDDE3] shadow-sm">
    <CardContent className="py-12 text-center space-y-3">
      <CheckCircle className="h-16 w-16 text-[#0E8B5A] mx-auto" />
      <h2 className="text-xl font-bold text-[#1A1B23]">Nenhuma passagem em aberto</h2>
      <p className="text-[#8A8B95]">A placa <strong>{placa}</strong> está em dia. Sem cobranças pendentes.</p>
      <Button
        onClick={onCadastrar}
        variant="outline"
        className="border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white mt-2"
      >
        Cadastrar veículo e monitorar
      </Button>
    </CardContent>
  </Card>
)}
```

Adicione `CheckCircle` ao import do `lucide-react` (se ainda não estiver lá).

Envolva os blocos existentes (`Cards de resumo`, `Vista autenticada/não autenticada`) num condicional `{passagens.length > 0 && (...)}` para não mostrá-los quando vazio.

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: OK.

- [ ] **Step 6: Verificar manualmente**

Run: `npm run dev`
- Placa `ABC-1234` → 5 passagens, breakdown "2 praças SPMAR · 3 pórticos Free Flow", cada linha com chip correto.
- Placa `JKL-7890` → estado vazio com CheckCircle e CTA "Cadastrar veículo".

- [ ] **Step 7: Commit**

```bash
git add src/components/ResultadosDebitos.tsx
git commit -m "refactor: ResultadosDebitos com chip por tipo, breakdown e estado vazio"
```

---

### Task 9: ConsultaDebitos — usar simulator

**Files:**
- Modify: `src/components/ConsultaDebitos.tsx`

- [ ] **Step 1: Ler o arquivo e identificar mocks**

Run: `cat src/components/ConsultaDebitos.tsx`
Identifique onde mocks de débito são gerados (busca por arrays hardcoded de objetos com `valor`, `praca`, etc).

- [ ] **Step 2: Substituir mocks por chamada ao simulator**

Adicione `import { gerarDebitos } from '../utils/simulator'` no topo.
Substitua arrays hardcoded por `gerarDebitos(placa)` mantendo o restante do fluxo intacto.

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/ConsultaDebitos.tsx
git commit -m "refactor: ConsultaDebitos usa simulator centralizado"
```

---

### Task 10: ResumoPedido — chip de tipo em cada item

**Files:**
- Modify: `src/components/ResumoPedido.tsx`

- [ ] **Step 1: Adicionar imports**

No topo de `src/components/ResumoPedido.tsx`, adicione:

```tsx
import { TipoPassagemBadge } from './ui/tipo-passagem-badge'
import type { Passagem } from '../utils/simulator'
```

- [ ] **Step 2: Atualizar tipo da prop**

Substitua a tipagem de `debitosSelecionados` (qualquer que seja, `any[]` ou interface local) por `Passagem[]`.

- [ ] **Step 3: Renderizar o chip em cada item da lista**

No loop que renderiza cada débito, adicione `<TipoPassagemBadge tipo={item.tipo} />` próximo ao nome do local. Mantenha o resto do visual.

- [ ] **Step 4: Verificar manualmente**

Run: `npm run dev`
Placa `ABC-1234` → ir até resumo → cada item da lista mostra o chip correto.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResumoPedido.tsx
git commit -m "refactor: ResumoPedido mostra chip de tipo em cada item"
```

---

## Phase 5 — Pagamento por cartão

### Task 11: CartaoCreditoForm

**Files:**
- Create: `src/components/CartaoCreditoForm.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { CreditCard, CheckCircle2 } from 'lucide-react'
import {
  detectarBandeira,
  validarLuhn,
  formatarNumeroCartao,
  formatarValidade,
  validarValidade,
  type Bandeira,
} from '../utils/cartaoValidation'

export type DadosCartao = {
  numero: string
  validade: string
  cvv: string
  nome: string
  bandeira: Bandeira
}

interface CartaoCreditoFormProps {
  onValidChange: (valido: boolean, dados: DadosCartao | null) => void
}

function LogoBandeira({ bandeira }: { bandeira: Bandeira }) {
  if (!bandeira) return null
  const cor =
    bandeira === 'elo' ? 'bg-yellow-400 text-yellow-950' :
    bandeira === 'visa' ? 'bg-blue-700 text-white' :
    'bg-red-600 text-white'
  const label =
    bandeira === 'elo' ? 'ELO' :
    bandeira === 'visa' ? 'VISA' :
    'MASTER'
  return (
    <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ${cor}`}>
      {label}
    </span>
  )
}

export function CartaoCreditoForm({ onValidChange }: CartaoCreditoFormProps) {
  const [numero, setNumero] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [nome, setNome] = useState('')

  const bandeira = detectarBandeira(numero)
  const numeroLimpo = numero.replace(/\s/g, '')
  const numeroValido = numeroLimpo.length >= 13 && validarLuhn(numeroLimpo) && bandeira !== null
  const validadeOk = validarValidade(validade)
  const cvvOk = /^\d{3}$/.test(cvv)
  const nomeOk = nome.trim().length >= 3

  const tudoValido = numeroValido && validadeOk && cvvOk && nomeOk

  function handleNumero(v: string) {
    const formatado = formatarNumeroCartao(v)
    setNumero(formatado)
    const limpo = formatado.replace(/\s/g, '')
    const b = detectarBandeira(limpo)
    const ok = limpo.length >= 13 && validarLuhn(limpo) && b !== null
    onValidChange(ok && validadeOk && cvvOk && nomeOk,
      ok && validadeOk && cvvOk && nomeOk
        ? { numero: limpo, validade, cvv, nome: nome.trim().toUpperCase(), bandeira: b }
        : null
    )
  }

  function handleValidade(v: string) {
    const formatado = formatarValidade(v)
    setValidade(formatado)
    const ok = validarValidade(formatado)
    onValidChange(numeroValido && ok && cvvOk && nomeOk,
      numeroValido && ok && cvvOk && nomeOk
        ? { numero: numeroLimpo, validade: formatado, cvv, nome: nome.trim().toUpperCase(), bandeira }
        : null
    )
  }

  function handleCvv(v: string) {
    const limpo = v.replace(/\D/g, '').slice(0, 3)
    setCvv(limpo)
    const ok = /^\d{3}$/.test(limpo)
    onValidChange(numeroValido && validadeOk && ok && nomeOk,
      numeroValido && validadeOk && ok && nomeOk
        ? { numero: numeroLimpo, validade, cvv: limpo, nome: nome.trim().toUpperCase(), bandeira }
        : null
    )
  }

  function handleNome(v: string) {
    setNome(v)
    const ok = v.trim().length >= 3
    onValidChange(numeroValido && validadeOk && cvvOk && ok,
      numeroValido && validadeOk && cvvOk && ok
        ? { numero: numeroLimpo, validade, cvv, nome: v.trim().toUpperCase(), bandeira }
        : null
    )
  }

  const bandeiraNaoSuportada = numeroLimpo.length >= 6 && bandeira === null

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label className="text-sm font-medium text-[#1A1B23]">Número do cartão</Label>
        <div className="relative">
          <Input
            value={numero}
            onChange={(e) => handleNumero(e.target.value)}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            className="font-mono pr-20"
            maxLength={19}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {bandeira ? <LogoBandeira bandeira={bandeira} /> : <CreditCard className="h-4 w-4 text-[#8A8B95]" />}
          </div>
        </div>
        {bandeira === 'elo' && (
          <p className="text-xs text-[#0E8B5A] mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Parceiro Pedágio Simples
          </p>
        )}
        {bandeiraNaoSuportada && (
          <p className="text-xs text-[#C8324A] mt-1">
            Bandeira não suportada. Use ELO, Visa ou Mastercard.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-[#1A1B23]">Validade</Label>
          <Input
            value={validade}
            onChange={(e) => handleValidade(e.target.value)}
            placeholder="MM/AA"
            inputMode="numeric"
            maxLength={5}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-[#1A1B23]">CVV</Label>
          <Input
            type="password"
            value={cvv}
            onChange={(e) => handleCvv(e.target.value)}
            placeholder="000"
            inputMode="numeric"
            maxLength={3}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-[#1A1B23]">Nome impresso no cartão</Label>
        <Input
          value={nome}
          onChange={(e) => handleNome(e.target.value)}
          placeholder="JOÃO DA SILVA"
          className="uppercase"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/CartaoCreditoForm.tsx
git commit -m "feat: CartaoCreditoForm com validação real e detecção de bandeira"
```

---

### Task 12: FormaPagamento — adicionar opção cartão

**Files:**
- Modify: `src/components/FormaPagamento.tsx`

- [ ] **Step 1: Adicionar imports**

No topo do arquivo:

```tsx
import { CartaoCreditoForm, type DadosCartao } from './CartaoCreditoForm'
import { CreditCard } from 'lucide-react' // se já não estiver importado
```

- [ ] **Step 2: Trocar estado de seleção e adicionar estado do cartão**

Substitua:

```tsx
const [formaPagamento, setFormaPagamento] = useState<'pix'>('pix');
```

por:

```tsx
const [formaPagamento, setFormaPagamento] = useState<'pix' | 'cartao'>('pix');
const [cartaoValido, setCartaoValido] = useState(false);
const [dadosCartao, setDadosCartao] = useState<DadosCartao | null>(null);
const [processandoCartao, setProcessandoCartao] = useState(false);
const [erroCartao, setErroCartao] = useState<string | null>(null);
```

- [ ] **Step 3: Adicionar UI da segunda opção (cartão)**

No bloco onde o PIX é renderizado (`<div className="space-y-3">`, linhas ~193–249), envolva o PIX num radio-style group. Logo após o card do PIX, antes do `</div>` que fecha o `space-y-3`, adicione:

```tsx
<button
  type="button"
  onClick={() => setFormaPagamento('cartao')}
  className={`w-full text-left group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all ${
    formaPagamento === 'cartao'
      ? 'border-[#8B5FFF] bg-gradient-to-br from-[#8B5FFF]/5 to-[#5B2E8C]/5 shadow-lg ring-2 ring-[#8B5FFF]/20'
      : 'border-[#DCDDE3] bg-white hover:border-[#8B5FFF]/40'
  }`}
>
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 pt-0.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
        formaPagamento === 'cartao' ? 'bg-[#8B5FFF] border-[#8B5FFF]' : 'border-[#C6C7CF]'
      }`}>
        {formaPagamento === 'cartao' && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#8B5FFF] to-[#5B2E8C] rounded-xl flex items-center justify-center flex-shrink-0">
          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-[#1A1B23]">Cartão de crédito</h3>
            <span className="inline-flex items-center justify-center rounded bg-yellow-400 text-yellow-950 px-2 py-0.5 text-xs font-bold">ELO</span>
          </div>
          <p className="text-sm text-[#8A8B95]">ELO em destaque · Visa e Mastercard aceitos</p>
        </div>
      </div>
      {formaPagamento === 'cartao' && (
        <CartaoCreditoForm
          onValidChange={(valido, dados) => {
            setCartaoValido(valido)
            setDadosCartao(dados)
            setErroCartao(null)
          }}
        />
      )}
    </div>
  </div>
</button>
```

E adicione `onClick` ao card do PIX para fazer ele ser clicável também — envolva ele num `<button onClick={() => setFormaPagamento('pix')}>` ou converta para botão, mantendo o visual.

Também atualize o badge "Única opção disponível" do PIX para algo neutro tipo "Aprovação instantânea", já que agora há duas opções.

- [ ] **Step 4: Atualizar `isFormValid` e `handlePagar`**

```tsx
const isFormValid = () => formaPagamento === 'pix' || (formaPagamento === 'cartao' && cartaoValido);

const handlePagar = () => {
  if (formaPagamento === 'pix') {
    if (onPIX) onPIX(debitosSelecionados, valorTotal);
    return;
  }
  // Cartão
  if (!dadosCartao) return;
  setProcessandoCartao(true);
  setErroCartao(null);
  setTimeout(() => {
    const ultimos4 = dadosCartao.numero.slice(-4);
    if (ultimos4 === '0000') {
      setProcessandoCartao(false);
      setErroCartao('Pagamento recusado pela operadora. Tente outro cartão.');
      return;
    }
    onPagar({
      formaPagamento: 'cartao',
      bandeira: dadosCartao.bandeira,
      ultimos4,
      nome: dadosCartao.nome,
      valorTotal,
      debitosSelecionados,
    });
  }, 2000);
};
```

- [ ] **Step 5: Atualizar copy do botão de pagamento quando for cartão**

No `<Button onClick={handlePagar}>`, substitua o conteúdo para usar texto condicional:

```tsx
{loading || processandoCartao ? (
  <>
    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent flex-shrink-0"></div>
    <span className="text-sm sm:text-base font-medium">Processando pagamento...</span>
  </>
) : formaPagamento === 'pix' ? (
  <>
    <QrCode className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
    <span className="font-semibold text-sm sm:text-base">Gerar QR Code PIX</span>
    <div className="hidden sm:block text-white/80">•</div>
    <span className="font-bold text-sm sm:text-base bg-white/10 px-2 py-1 rounded-lg">
      {formatCurrency(valorTotal)}
    </span>
  </>
) : (
  <>
    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
    <span className="font-semibold text-sm sm:text-base">Pagar {formatCurrency(valorTotal)}</span>
  </>
)}
```

E no `disabled`, troque por `disabled={loading || processandoCartao || !isFormValid()}`.

- [ ] **Step 6: Mostrar erro de cartão**

Logo abaixo do botão de pagar, adicione:

```tsx
{erroCartao && (
  <div className="bg-[#F8D7DD] border border-[#F0A8B5] rounded-lg p-3 flex items-start gap-2 mt-3">
    <AlertCircle className="h-4 w-4 text-[#C8324A] flex-shrink-0 mt-0.5" />
    <p className="text-sm text-[#A3203B]">{erroCartao}</p>
  </div>
)}
```

- [ ] **Step 7: Verificar build**

Run: `npm run build`
Expected: OK.

- [ ] **Step 8: Verificar manualmente todos os cenários de cartão**

Run: `npm run dev`
Passos:
1. Fluxo até `FormaPagamento`. Cards PIX e Cartão visíveis.
2. Clicar em Cartão → form aparece com 4 campos.
3. Digitar `5067 3300 0000 0001` → badge ELO aparece, microcopy "Parceiro Pedágio Simples". Preencher 12/30, 123, JOÃO. Botão habilita.
4. Clicar pagar → loading 2s → vai pra `ConfirmacaoPagamento`.
5. Voltar e tentar com cartão `4111 1111 1111 0000` → recusado, mostra erro inline.
6. Voltar pra PIX e confirmar que ainda funciona.

- [ ] **Step 9: Commit**

```bash
git add src/components/FormaPagamento.tsx
git commit -m "feat: FormaPagamento aceita cartão (ELO destacado + Visa + Master) ao lado do PIX"
```

---

### Task 13: ConfirmacaoPagamento — mostrar forma de pagamento correta

**Files:**
- Modify: `src/components/ConfirmacaoPagamento.tsx`

- [ ] **Step 1: Ler o arquivo**

Run: `cat src/components/ConfirmacaoPagamento.tsx`
Identifique onde a forma de pagamento é exibida (provavelmente um bloco "Pago via PIX" ou similar).

- [ ] **Step 2: Renderizar condicional baseado em `dadosPagamento.formaPagamento`**

Substitua o bloco fixo de "Pago via PIX" por algo como:

```tsx
{dadosPagamento?.formaPagamento === 'cartao' ? (
  <div className="flex items-center gap-2">
    <CreditCard className="h-5 w-5 text-[#5B2E8C]" />
    <span>
      Cartão {dadosPagamento.bandeira === 'elo' ? 'ELO' : dadosPagamento.bandeira === 'visa' ? 'Visa' : 'Mastercard'}
      {' '}terminado em <strong>{dadosPagamento.ultimos4}</strong>
    </span>
  </div>
) : (
  <div className="flex items-center gap-2">
    <QrCode className="h-5 w-5 text-[#5B2E8C]" />
    <span>Pago via PIX</span>
  </div>
)}
```

Adicione `CreditCard` e `QrCode` aos imports do `lucide-react` se faltarem.

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`
- Pagar via PIX → confirmação mostra "Pago via PIX".
- Pagar com ELO `5067 3300 0000 0001` → confirmação mostra "Cartão ELO terminado em 0001".
- Pagar com Visa `4111 1111 1111 1111` → "Cartão Visa terminado em 1111".

- [ ] **Step 4: Commit**

```bash
git add src/components/ConfirmacaoPagamento.tsx
git commit -m "feat: ConfirmacaoPagamento exibe bandeira e últimos 4 quando for cartão"
```

---

## Phase 6 — Refatoração do dashboard

### Task 14: DashboardUsuario — KPIs (4 cards)

**Files:**
- Modify: `src/components/DashboardUsuario.tsx`

- [ ] **Step 1: Adicionar imports**

No topo:

```tsx
import { gerarDebitos, agregarPorTipo, proximoVencimento, type Passagem } from '../utils/simulator'
import { TipoPassagemBadge } from './ui/tipo-passagem-badge'
import { Building2, Radio, Wallet } from 'lucide-react' // adicionar aos imports existentes
```

- [ ] **Step 2: Calcular passagens consolidadas das placas do usuário**

Dentro do componente, perto do início, adicione:

```tsx
const passagensTodas: Passagem[] = placasUsuario.flatMap(p => gerarDebitos(p))
const agg = agregarPorTipo(passagensTodas)
const proximo = proximoVencimento(passagensTodas)

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
```

- [ ] **Step 3: Renderizar grid de 4 KPIs no topo da aba Home**

Encontre o início do conteúdo da aba `home` (busque por algo como `{abaSelecionada === 'home' && (` ou similar). No topo desse bloco, adicione:

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
  {/* Total em aberto */}
  <Card className="border border-[#DCDDE3]">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="h-4 w-4 text-[#5B2E8C]" />
        <span className="text-xs uppercase tracking-wide text-[#8A8B95] font-medium">Total em aberto</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#1A1B23]">{formatCurrency(agg.totalGeral)}</p>
      <p className="text-xs text-[#8A8B95] mt-1">{agg.countTotal} passagem{agg.countTotal === 1 ? '' : 's'}</p>
    </CardContent>
  </Card>

  {/* Praças SPMAR */}
  <Card className="border border-[#DCDDE3] bg-[#F4EFFB]/40">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-[#5B2E8C]" />
        <span className="text-xs uppercase tracking-wide text-[#5B2E8C] font-medium">Praças SPMAR</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#5B2E8C]">{formatCurrency(agg.totalPraca)}</p>
      <p className="text-xs text-[#8A8B95] mt-1">{agg.countPraca} passagem{agg.countPraca === 1 ? '' : 's'}</p>
    </CardContent>
  </Card>

  {/* Pórticos Free Flow */}
  <Card className="border border-[#DCDDE3] bg-[#DFF4EA]/40">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Radio className="h-4 w-4 text-[#0E8B5A]" />
        <span className="text-xs uppercase tracking-wide text-[#0E8B5A] font-medium">Pórticos Free Flow</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#0E8B5A]">{formatCurrency(agg.totalPortico)}</p>
      <p className="text-xs text-[#8A8B95] mt-1">{agg.countPortico} passagem{agg.countPortico === 1 ? '' : 's'}</p>
    </CardContent>
  </Card>

  {/* Próximo vencimento */}
  <Card className="border border-[#DCDDE3]">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-[#C77700]" />
        <span className="text-xs uppercase tracking-wide text-[#8A8B95] font-medium">Próximo vencimento</span>
      </div>
      {proximo ? (
        <>
          <p className="text-xl sm:text-2xl font-bold text-[#1A1B23]">{proximo.prazoLimite}</p>
          <p className="text-xs text-[#8A8B95] mt-1">{formatCurrency(proximo.valor)}</p>
        </>
      ) : (
        <>
          <p className="text-xl sm:text-2xl font-bold text-[#0E8B5A]">—</p>
          <p className="text-xs text-[#8A8B95] mt-1">Sem pendências</p>
        </>
      )}
    </CardContent>
  </Card>
</div>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: OK.

- [ ] **Step 4: Verificar manualmente**

Run: `npm run dev`
- Logar com qualquer email/senha (cadastro fake).
- Dashboard mostra os 4 KPIs no topo.

- [ ] **Step 5: Commit**

```bash
git add src/components/DashboardUsuario.tsx
git commit -m "feat: 4 KPIs no dashboard (Total, Praças SPMAR, Pórticos Free Flow, Próximo vencimento)"
```

---

### Task 15: DashboardUsuario — filtros de tipo e status na lista

**Files:**
- Modify: `src/components/DashboardUsuario.tsx`

- [ ] **Step 1: Adicionar estados de filtro**

Próximo aos outros estados do componente:

```tsx
const [filtroTipo, setFiltroTipo] = useState<'todas' | 'praca_fisica' | 'portico_free_flow'>('todas')
const [filtroStatus, setFiltroStatus] = useState<'todas' | 'em_prazo' | 'risco_multa'>('todas')
```

E adicione import: `import { filtrarPorTipo, filtrarPorStatus } from '../utils/simulator'`.

- [ ] **Step 2: Aplicar filtros na lista de pendentes**

Encontre o bloco que renderiza a lista de débitos pendentes. Substitua a fonte da lista para usar `passagensTodas` aplicando os filtros:

```tsx
const pendentesFiltradas = (() => {
  let r = passagensTodas
  if (filtroTipo !== 'todas') r = filtrarPorTipo(r, filtroTipo)
  if (filtroStatus !== 'todas') r = filtrarPorStatus(r, filtroStatus)
  // ordenar por prazo mais próximo
  return [...r].sort((a, b) => {
    const [da, ma, ya] = a.prazoLimite.split('/').map(Number)
    const [db, mb, yb] = b.prazoLimite.split('/').map(Number)
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
  })
})()
```

- [ ] **Step 3: Renderizar os dois togglers acima da lista**

Antes da lista de pendentes:

```tsx
<div className="flex flex-col sm:flex-row gap-3 mb-4">
  <div className="flex gap-1 bg-[#F7F5FB] rounded-lg p-1">
    {(['todas', 'praca_fisica', 'portico_free_flow'] as const).map(t => (
      <button
        key={t}
        onClick={() => setFiltroTipo(t)}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
          filtroTipo === t ? 'bg-white text-[#5B2E8C] shadow-sm' : 'text-[#8A8B95] hover:text-[#5B2E8C]'
        }`}
      >
        {t === 'praca_fisica' && <Building2 className="h-3.5 w-3.5" />}
        {t === 'portico_free_flow' && <Radio className="h-3.5 w-3.5" />}
        {t === 'todas' ? 'Todas' : t === 'praca_fisica' ? 'Praça SPMAR' : 'Pórtico Free Flow'}
      </button>
    ))}
  </div>
  <div className="flex gap-1 bg-[#F7F5FB] rounded-lg p-1">
    {(['todas', 'em_prazo', 'risco_multa'] as const).map(s => (
      <button
        key={s}
        onClick={() => setFiltroStatus(s)}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          filtroStatus === s ? 'bg-white text-[#5B2E8C] shadow-sm' : 'text-[#8A8B95] hover:text-[#5B2E8C]'
        }`}
      >
        {s === 'todas' ? 'Todos status' : s === 'em_prazo' ? 'Em prazo' : 'Risco de multa'}
      </button>
    ))}
  </div>
</div>
```

E garanta que cada linha da lista renderiza `<TipoPassagemBadge tipo={p.tipo} />`.

- [ ] **Step 4: Verificar manualmente**

Run: `npm run dev`
- Logar e ir pra dashboard.
- Clicar em "Praça SPMAR" filtra só praças. "Pórtico Free Flow" filtra só pórticos.
- Status "Risco de multa" filtra só passagens vencendo logo.

- [ ] **Step 5: Commit**

```bash
git add src/components/DashboardUsuario.tsx
git commit -m "feat: filtros de tipo e status na lista de pendentes do dashboard"
```

---

### Task 16: HistoricoPagamentos — coluna Tipo e filtros

**Files:**
- Modify: `src/components/HistoricoPagamentos.tsx`

- [ ] **Step 1: Ler estrutura atual**

Run: `cat src/components/HistoricoPagamentos.tsx | head -120`
Anote a estrutura: existe tabela ou lista? Onde estão os filtros existentes?

- [ ] **Step 2: Adicionar tipo nos dados**

Adicione `tipo: 'praca_fisica' | 'portico_free_flow'` e `formaPagamento: 'pix' | 'cartao_elo' | 'cartao_visa' | 'cartao_master'` em cada registro mock.

- [ ] **Step 3: Adicionar coluna/chip Tipo**

Em cada linha/row do histórico, adicione `<TipoPassagemBadge tipo={item.tipo} />` (importar do `./ui/tipo-passagem-badge`).

- [ ] **Step 4: Adicionar filtros**

Adicione um filtro `Tipo` (Todas / Praça SPMAR / Pórtico Free Flow) e um `Forma de pagamento` (Todas / PIX / Cartão ELO / Cartão Visa / Cartão Master). Use `Select` de `./ui/select` (já importado no projeto).

- [ ] **Step 5: Verificar manualmente**

Run: `npm run dev`
- Logar → ir para aba Histórico.
- Coluna/chip Tipo aparece em cada linha.
- Filtros funcionam.

- [ ] **Step 6: Commit**

```bash
git add src/components/HistoricoPagamentos.tsx
git commit -m "feat: histórico com coluna Tipo e filtros (Tipo + Forma de pagamento)"
```

---

### Task 17: VeiculosCadastrados — mini-resumo por veículo

**Files:**
- Modify: `src/components/VeiculosCadastrados.tsx`

- [ ] **Step 1: Adicionar imports**

```tsx
import { gerarDebitos, agregarPorTipo } from '../utils/simulator'
```

- [ ] **Step 2: Renderizar mini-resumo abaixo de cada veículo**

Para cada veículo no map, compute `const r = agregarPorTipo(gerarDebitos(veiculo.placa))` e renderize abaixo das infos:

```tsx
<p className="text-sm text-[#8A8B95] mt-1">
  {r.countPraca} praça{r.countPraca === 1 ? '' : 's'} · {r.countPortico} pórtico{r.countPortico === 1 ? '' : 's'} ·{' '}
  <span className="font-semibold text-[#5B2E8C]">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.totalGeral)}
  </span>{' '}
  em aberto
</p>
```

- [ ] **Step 3: Verificar manualmente**

Run: `npm run dev`
- Logar → ir pra aba Veículos.
- Cada veículo mostra o mini-resumo correto.

- [ ] **Step 4: Commit**

```bash
git add src/components/VeiculosCadastrados.tsx
git commit -m "feat: mini-resumo por veículo (praças, pórticos, total em aberto)"
```

---

## Phase 7 — Verificação final

### Task 18: Validação completa dos cenários de demo

**Files:** (nenhum — só verificação)

- [ ] **Step 1: Rodar testes de unidade**

Run: `npm test`
Expected: todos os testes verdes (simulator + cartaoValidation).

- [ ] **Step 2: Rodar build**

Run: `npm run build`
Expected: build sem erros.

- [ ] **Step 3: Iniciar dev server**

Run: `npm run dev`
Abra `http://localhost:5173` em mobile (DevTools) e desktop.

- [ ] **Step 4: Executar cada um dos 7 cenários de demo**

**Cenário 1 — ABC-1234 (mix completo + PIX):**
- Landing → digita `ABC-1234` → Turnstile → "Consultar passagens".
- Card de resultado mostra "2 praças e 3 pórticos encontrados".
- Clicar "Ver passagens e pagar agora" → cadastro/login (fazer login com qualquer email/senha) → Resumo (cada item com chip correto) → Forma de Pagamento.
- Escolher PIX → "Gerar QR Code PIX" → simular "Já paguei" → Confirmação OK mostrando "Pago via PIX".

**Cenário 2 — XYZ-5678 (só praça + ELO):**
- Landing → `XYZ-5678` → consultar → 1 praça SPMAR.
- Ir pro pagamento → Cartão → digitar `5067 3300 0000 0001` (badge ELO + microcopy "Parceiro Pedágio Simples").
- Preencher `12/30`, `123`, `JOÃO DA SILVA` → Pagar → Confirmação mostra "Cartão ELO terminado em 0001".

**Cenário 3 — DEF-9012 (só pórticos + Visa):**
- `DEF-9012` → 4 pórticos.
- Pagamento via cartão `4111 1111 1111 1111` → badge VISA → Confirmação "Cartão Visa terminado em 1111".

**Cenário 4 — GHI-3456 (8 passagens em risco + Master):**
- `GHI-3456` → 8 passagens, todas com badge vermelho "Próx. venc." ou alerta de risco.
- Pagamento `5555 5555 5555 4444` → badge MASTER → confirmação "Cartão Mastercard terminado em 4444".

**Cenário 5 — JKL-7890 (sem débitos):**
- `JKL-7890` → estado vazio com CheckCircle verde + "Nenhuma passagem em aberto" + CTA "Cadastrar veículo e monitorar".

**Cenário 6 — Cartão recusado:**
- Fluxo de pagamento por cartão com número terminado em `0000` (ex: `4111 1111 1111 0000`).
- Erro inline "Pagamento recusado pela operadora. Tente outro cartão.", permite trocar número e tentar de novo.

**Cenário 7 — Dashboard logado:**
- Logar → Dashboard → 4 KPIs no topo com valores coerentes.
- Filtros Tipo (Praça/Pórtico) e Status (Em prazo/Risco) funcionam.
- Aba Histórico mostra coluna/chip Tipo + filtros funcionando.
- Aba Veículos mostra mini-resumo por veículo.

- [ ] **Step 5: Verificar responsividade mobile**

No DevTools, alternar pra viewport 375x812 (iPhone). Verificar que:
- Hero card encolhe bem.
- KPIs do dashboard ficam em 2x2 grid.
- Filtros do dashboard quebram em coluna.

- [ ] **Step 6: Commit final + nota de status**

Caso algum ajuste fino tenha sido necessário durante verificação, commitar.

```bash
git status
# se houver mudanças:
git add <arquivos>
git commit -m "fix: ajustes finais da validação manual"
```

- [ ] **Step 7: Resumo de entrega**

Imprimir/comunicar:
- Quantos testes unitários verdes.
- Quantos cenários de demo validados.
- Comandos: `npm test`, `npm run build`, `npm run dev`.
- Cartões de teste documentados: `5067 3300 0000 0001` (ELO), `4111 1111 1111 1111` (Visa), `5555 5555 5555 4444` (Master), qualquer com final `0000` (recusado).

---

## Notas finais

- **Não foi pedido** integrar gateway real — todo o pagamento por cartão é simulação determinística.
- **Não foi alterado** o dashboard da concessionária — fora do escopo desta refatoração.
- **Próximos passos sugeridos** (não fazem parte deste plano): migrar para react-router para URLs reais; persistir débitos pagos em localStorage; integrar com gateway real (Pagar.me / Stripe / Cielo) quando houver chave.
