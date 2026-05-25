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
