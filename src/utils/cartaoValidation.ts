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
