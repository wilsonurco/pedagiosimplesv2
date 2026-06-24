import { Building2, Radio, Landmark } from 'lucide-react'
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
        Praça de Pedágio
      </span>
    )
  }
  if (tipo === 'portico_free_flow') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#DFF4EA] text-[#0E8B5A] ${className}`}
      >
        <Radio className="h-3 w-3" />
        Free Flow
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#FBF4E6] text-[#C77700] ${className}`}
    >
      <Landmark className="h-3 w-3" />
      Praça Convencional
    </span>
  )
}
