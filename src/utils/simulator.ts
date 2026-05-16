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
