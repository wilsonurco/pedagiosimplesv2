interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** Pórtico Free Flow — arco com sinal de cobrança eletrônica */
export function PorticoIcon({ className, size = 24, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
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
      {/* Pórtico: dois pilares verticais + arco superior */}
      <line x1="3" y1="20" x2="3" y2="10" />
      <line x1="21" y1="20" x2="21" y2="10" />
      <path d="M3 10 Q12 3 21 10" />
      {/* Sinal de cobrança eletrônica no centro do arco */}
      <path d="M10 14 Q12 12 14 14" />
      <path d="M8.5 16 Q12 12.5 15.5 16" />
      <circle cx="12" cy="16" r="0.75" fill={color} stroke="none" />
    </svg>
  );
}
