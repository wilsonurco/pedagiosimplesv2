interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** R$ — Símbolo do Real brasileiro para valores monetários */
export function BrazilianRealIcon({ className, size = 24, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
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
      {/* Letra R */}
      <path d="M5 6v12" />
      <path d="M5 6h5.5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H5" />
      <path d="m9 12 4.5 6" />
      {/* Cifrão estilizado (linha dupla) */}
      <path d="M15.5 8h5a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-3" />
      <path d="M15.5 12h3a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-5" />
      <line x1="18" y1="5" x2="18" y2="7" />
      <line x1="18" y1="17" x2="18" y2="19" />
    </svg>
  );
}
