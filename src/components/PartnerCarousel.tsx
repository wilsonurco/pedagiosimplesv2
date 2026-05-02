import { useRef } from "react";

// Deixando apenas os nomes e siglas, sem ícones
const concessionarias = [
  { name: "CCR",                sigla: "CCR" },
  { name: "Arteris",            sigla: "ART" },
  { name: "EcoRodovias",        sigla: "ECO" },
  { name: "Rota das Bandeiras", sigla: "RTB" },
  { name: "Via Paulista",       sigla: "VPL" },
  { name: "ViaBahia",           sigla: "VBH" },
  { name: "Concebra",           sigla: "CNB" },
  { name: "Autopista",          sigla: "APS" },
  { name: "SPMAR",              sigla: "SPM" },
  { name: "Rodovias do Tietê",  sigla: "RDT" },
  { name: "ViaBrasil",          sigla: "VBR" },
  { name: "Intervias",          sigla: "ITV" },
];

function LogoItem({ name, sigla }: { name: string; sigla: string }) {
  return (
    <div className="flex items-center gap-2 mx-10 flex-shrink-0 select-none text-white group">
      {name !== sigla ? (
        <>
          <span className="text-xl font-bold tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
            {sigla}
          </span>
          <span className="text-sm font-semibold tracking-wider opacity-60 group-hover:opacity-100 transition-opacity uppercase">
            {name}
          </span>
        </>
      ) : (
        <span className="text-xl font-bold tracking-widest opacity-80 group-hover:opacity-100 transition-opacity uppercase">
          {name}
        </span>
      )}
    </div>
  );
}

export function PartnerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...concessionarias, ...concessionarias];

  return (
    <section className="relative bg-zinc-800/60 backdrop-blur-md border-t border-b border-white/10 py-6 overflow-hidden">
      
      <div className="relative z-10 w-full">
        {/* Track com animação CSS e máscara de fade nas bordas (suporta fundos transparentes) */}
        <div
          ref={trackRef}
          className="flex items-center"
          style={{
            animation: "marquee 45s linear infinite",
            width: "max-content",
            maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
          }}
        >
          {doubled.map((c, i) => (
            <LogoItem key={`${c.sigla}-${i}`} {...c} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
