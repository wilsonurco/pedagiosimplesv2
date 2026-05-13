interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/** TAG de pedágio — dispositivo físico instalado no para-brisa */
export function TagVeiculoIcon({ className, size = 24, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
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
      {/* Corpo retangular da TAG */}
      <rect x="3" y="7" width="18" height="10" rx="2" />
      {/* Chip interno */}
      <rect x="7" y="10" width="4" height="4" rx="0.5" />
      {/* Ondas de sinal (RFID/DSRC) */}
      <path d="M14 10.5 Q15.5 12 14 13.5" />
      <path d="M16 9 Q18.5 12 16 15" />
    </svg>
  );
}
