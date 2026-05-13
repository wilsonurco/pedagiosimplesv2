interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** Placa veicular brasileira — retângulo com faixa Mercosul + traços de texto */
export function PlacaIcon({ className, size = 24, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
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
      {/* Placa */}
      <rect x="2" y="6" width="20" height="12" rx="1.5" />
      {/* Faixa azul Mercosul (topo) */}
      <line x1="2" y1="9.5" x2="22" y2="9.5" />
      {/* Letras/números estilizados */}
      <line x1="6" y1="13" x2="8" y2="13" />
      <line x1="10" y1="13" x2="14" y2="13" />
      <line x1="16" y1="13" x2="18" y2="13" />
    </svg>
  );
}
