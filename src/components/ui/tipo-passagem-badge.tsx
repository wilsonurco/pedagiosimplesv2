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
