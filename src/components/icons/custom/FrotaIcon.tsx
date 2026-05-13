interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** Frota — múltiplos veículos alinhados, representa gestão de frota corporativa */
export function FrotaIcon({ className, size = 24, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
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
      {/* Carro principal (frente) */}
      <path d="M3 17v-2l2-5h8l2 5v2" />
      <path d="M3 17h12" />
      <circle cx="6" cy="17" r="1.5" />
      <circle cx="12" cy="17" r="1.5" />
      {/* Segundo carro (atrás, menor) */}
      <path d="M14 15l1.5-3h5l1.5 3v2H14v-2z" opacity="0.6" />
      <circle cx="16" cy="17" r="1" opacity="0.6" />
      <circle cx="20" cy="17" r="1" opacity="0.6" />
    </svg>
  );
}
