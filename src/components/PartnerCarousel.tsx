import { useRef } from "react";

const concessionarias = [
  { name: "CCR",                sigla: "CCR",  cor: "#003DA5" },
  { name: "Arteris",            sigla: "ART",  cor: "#E30613" },
  { name: "EcoRodovias",        sigla: "ECO",  cor: "#007A3D" },
  { name: "Rota das Bandeiras", sigla: "RTB",  cor: "#F7A800" },
  { name: "Via Paulista",       sigla: "VPL",  cor: "#6D3B8A" },
  { name: "ViaBahia",           sigla: "VBH",  cor: "#0082C9" },
  { name: "Concebra",           sigla: "CNB",  cor: "#C8322A" },
  { name: "Autopista",          sigla: "APS",  cor: "#004B8D" },
  { name: "SPMAR",              sigla: "SPM",  cor: "#0055A5" },
  { name: "Rodovias do Tietê",  sigla: "RDT",  cor: "#1A7A4A" },
  { name: "ViaBrasil",          sigla: "VBR",  cor: "#005B9A" },
  { name: "Intervias",          sigla: "ITV",  cor: "#E07B00" },
];

function LogoItem({ name, sigla }: { name: string; sigla: string; cor: string }) {
  return (
    <div className="flex items-center gap-3 mx-10 flex-shrink-0 select-none grayscale">
      {/* Ícone da sigla */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10"
      >
        <span
          className="text-[10px] font-bold tracking-wide text-white/60"
        >
          {sigla}
        </span>
      </div>
      {/* Nome */}
      <span className="text-sm font-semibold text-white/60 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function PartnerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...concessionarias, ...concessionarias];

  return (
    <section className="bg-[#0D0D1A] border-t border-white/5 py-10 overflow-hidden">
      {/* Título */}
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-7">
        Aceito nas principais concessionárias do Brasil
      </p>

      {/* Carrossel */}
      <div className="relative">
        {/* Fade nas bordas */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0D0D1A] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0D0D1A] to-transparent z-10 pointer-events-none" />

        {/* Track com animação CSS */}
        <div
          ref={trackRef}
          className="flex items-center"
          style={{
            animation: "marquee 32s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((c, i) => (
            <LogoItem key={`${c.name}-${i}`} {...c} />
          ))}
        </div>
      </div>

      {/* Keyframes injetados inline */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
