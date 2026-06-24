export type TipoPassagem = 'praca_fisica' | 'portico_free_flow' | 'praca_convencional'
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

// Helpers para o cenário GHI-3456
const GHI_CONCESSIONARIAS_PRACA = ['Arteris', 'CCR ViaOeste', 'Rota das Bandeiras', 'Entrevias']

const GHI_RODOVIAS_PORTICO = [
  { rodovia: 'SP-270', concessionaria: 'CCR ViaOeste' },
  { rodovia: 'SP-348', concessionaria: 'Rota das Bandeiras' },
  { rodovia: 'SP-280', concessionaria: 'CCR ViaOeste' },
]

const CENARIOS_FIXOS: Record<string, (placa: string) => Passagem[]> = {
  'ABC-1234': (placa) => [
    {
      id: 'abc-praca-1',
      tipo: 'praca_fisica',
      local: 'Praça de Pedágio SP-055 — KM 88',
      concessionaria: 'DER-SP',
      rodovia: 'SP-055',
      km: 88,
      data: hojeMenosDias(12),
      hora: '14:32:07',
      valor: 12.50,
      categoria: 'Carro de passeio',
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(18),
    },
    {
      id: 'abc-praca-2',
      tipo: 'praca_fisica',
      local: 'Praça de Pedágio SP-055 — KM 65',
      concessionaria: 'DER-SP',
      rodovia: 'SP-055',
      km: 65,
      data: hojeMenosDias(5),
      hora: '09:18:43',
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
      concessionaria: 'DER-SP',
      rodovia: 'SP-055',
      km: 12,
      data: hojeMenosDias(20),
      hora: '07:42:11',
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
      hora: '18:50:29',
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
      hora: '11:05:52',
      valor: 17.10,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(22),
    },
    {
      id: 'abc-conv-1',
      tipo: 'praca_convencional',
      local: 'Praça Convencional SP-310 — KM 157',
      concessionaria: 'Arteris',
      rodovia: 'SP-310',
      km: 157,
      data: hojeMenosDias(6),
      hora: '08:22:14',
      valor: 9.80,
      categoria: 'Carro de passeio',
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(24),
    },
  ],

  'XYZ-5678': (placa) => [
    {
      id: 'xyz-praca-1',
      tipo: 'praca_fisica',
      local: 'Praça de Pedágio SP-055 — KM 88',
      concessionaria: 'DER-SP',
      rodovia: 'SP-055',
      km: 88,
      data: hojeMenosDias(3),
      hora: '16:20:08',
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
      hora: '07:42:11',
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
      hora: '14:15:37',
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
      hora: '18:50:29',
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
      hora: '10:05:19',
      valor: 9.20,
      placa,
      status: 'em_prazo',
      prazoLimite: hojeMaisDias(26),
    },
  ],

  'GHI-3456': (placa) => Array.from({ length: 8 }, (_, i) => {
    const ehPraca = i % 3 === 0
    const concPraca = GHI_CONCESSIONARIAS_PRACA[i % GHI_CONCESSIONARIAS_PRACA.length]
    const rodPortico = GHI_RODOVIAS_PORTICO[i % GHI_RODOVIAS_PORTICO.length]
    return ehPraca
      ? {
          id: `ghi-praca-${i}`,
          tipo: 'praca_fisica' as const,
          local: `Praça de Pedágio SP-${270 + i * 10} — KM ${30 + i * 7}`,
          concessionaria: concPraca,
          rodovia: `SP-${270 + i * 10}`,
          km: 30 + i * 7,
          data: hojeMenosDias(30 + i),
          hora: '12:00:00',
          valor: 22.50,
          categoria: 'Carro de passeio',
          placa,
          status: 'risco_multa' as const,
          prazoLimite: hojeMaisDias(i % 5),
        }
      : {
          id: `ghi-portico-${i}`,
          tipo: 'portico_free_flow' as const,
          local: `Pórtico Free Flow ${rodPortico.rodovia} — KM ${i * 5}`,
          concessionaria: rodPortico.concessionaria,
          rodovia: rodPortico.rodovia,
          km: i * 5,
          data: hojeMenosDias(30 + i),
          hora: '08:30:00',
          valor: 18.40,
          placa,
          status: 'risco_multa' as const,
          prazoLimite: hojeMaisDias(i % 5),
        }
  }),

  'JKL-7890': () => [],
}

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
  { rodovia: 'SP-055', concessionaria: 'DER-SP' },
]

const PRACAS_FISICAS = [
  { rodovia: 'SP-055', concessionaria: 'DER-SP' },
  { rodovia: 'SP-310', concessionaria: 'Arteris' },
  { rodovia: 'SP-348', concessionaria: 'Rota das Bandeiras' },
  { rodovia: 'SP-270', concessionaria: 'CCR ViaOeste' },
  { rodovia: 'SP-280', concessionaria: 'Entrevias' },
]

function gerarRandom(placa: string): Passagem[] {
  const rnd = mulberry32(seedDaPlaca(placa))
  const quantidade = 1 + Math.floor(rnd() * 5) // 1 a 5
  const passagens: Passagem[] = []
  for (let i = 0; i < quantidade; i++) {
    const sorteio = rnd()
    const ehPraca = sorteio < 0.3
    const ehConvencional = sorteio >= 0.3 && sorteio < 0.45
    const km = 10 + Math.floor(rnd() * 200)
    const diasAtras = 1 + Math.floor(rnd() * 25)
    const diasPrazo = Math.floor(rnd() * 30)
    if (ehPraca) {
      const praca = PRACAS_FISICAS[Math.floor(rnd() * PRACAS_FISICAS.length)]
      passagens.push({
        id: `rnd-${placa}-${i}`,
        tipo: 'praca_fisica',
        local: `Praça de Pedágio ${praca.rodovia} — KM ${km}`,
        concessionaria: praca.concessionaria,
        rodovia: praca.rodovia,
        km,
        data: hojeMenosDias(diasAtras),
        hora: `${String(6 + Math.floor(rnd() * 14)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
        valor: 12.50 + Math.floor(rnd() * 10),
        categoria: 'Carro de passeio',
        placa,
        status: diasPrazo <= 7 ? 'risco_multa' : 'em_prazo',
        prazoLimite: hojeMaisDias(diasPrazo),
      })
    } else if (ehConvencional) {
      const praca = PRACAS_FISICAS[Math.floor(rnd() * PRACAS_FISICAS.length)]
      passagens.push({
        id: `rnd-conv-${placa}-${i}`,
        tipo: 'praca_convencional',
        local: `Praça Convencional ${praca.rodovia} — KM ${km}`,
        concessionaria: praca.concessionaria,
        rodovia: praca.rodovia,
        km,
        data: hojeMenosDias(diasAtras),
        hora: `${String(6 + Math.floor(rnd() * 14)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
        valor: 8.00 + Math.floor(rnd() * 12),
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
        hora: `${String(6 + Math.floor(rnd() * 14)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
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
  const convencionais = passagens.filter(p => p.tipo === 'praca_convencional')
  const totalPraca = pracas.reduce((s, p) => s + p.valor, 0)
  const totalPortico = porticos.reduce((s, p) => s + p.valor, 0)
  const totalConvencional = convencionais.reduce((s, p) => s + p.valor, 0)
  return {
    countPraca: pracas.length,
    countPortico: porticos.length,
    countConvencional: convencionais.length,
    countTotal: passagens.length,
    totalPraca,
    totalPortico,
    totalConvencional,
    totalGeral: totalPraca + totalPortico + totalConvencional,
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
