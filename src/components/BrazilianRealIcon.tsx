interface BrazilianRealIconProps {
  className?: string;
}

export function BrazilianRealIcon({ className = "w-5 h-5" }: BrazilianRealIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Letra R */}
      <path d="M6 6v12" />
      <path d="M6 6h6a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6" />
      <path d="m10 12 5 6" />
      
      {/* Símbolo $ */}
      <path d="M16 3v2" />
      <path d="M16 19v2" />
      <path d="M13 7h6a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4" />
      <path d="M13 13h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-6" />
    </svg>
  );
}