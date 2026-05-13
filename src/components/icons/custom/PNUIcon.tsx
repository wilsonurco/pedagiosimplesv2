interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** PNU — Passagem por Não Usuário: carro passando sem TAG sob um pórtico */
export function PNUIcon({ className, size = 24, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Pórtico simplificado */}
      <line x1="2" y1="20" x2="2" y2="12" />
      <line x1="22" y1="20" x2="22" y2="12" />
      <path d="M2 12 Q12 6 22 12" />
      {/* Carro passando sob o pórtico */}
      <path d="M7 20v-3h10v3" />
      <path d="M8 17l1.5-3h5l1.5 3" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="15" cy="20" r="1" />
      {/* X indicando ausência de TAG */}
      <line x1="10" y1="9" x2="14" y2="13" strokeDasharray="1.5 1" />
      <line x1="14" y1="9" x2="10" y2="13" strokeDasharray="1.5 1" />
    </svg>
  );
}
