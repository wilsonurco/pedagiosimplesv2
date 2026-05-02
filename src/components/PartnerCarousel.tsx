import { useRef } from "react";
import { Mountain, Waypoints, Navigation, Shield, Map, Compass } from "lucide-react";

// Associar um ícone para simular o formato de "logo" em branco como na imagem de referência
const concessionarias = [
  { name: "CCR",                sigla: "CCR", Icon: Waypoints },
  { name: "Arteris",            sigla: "ART", Icon: Navigation },
  { name: "EcoRodovias",        sigla: "ECO", Icon: Mountain },
  { name: "Rota das Bandeiras", sigla: "RTB", Icon: Compass },
  { name: "Via Paulista",       sigla: "VPL", Icon: Map },
  { name: "ViaBahia",           sigla: "VBH", Icon: Shield },
  { name: "Concebra",           sigla: "CNB", Icon: Waypoints },
  { name: "Autopista",          sigla: "APS", Icon: Navigation },
  { name: "SPMAR",              sigla: "SPM", Icon: Mountain },
  { name: "Rodovias do Tietê",  sigla: "RDT", Icon: Compass },
  { name: "ViaBrasil",          sigla: "VBR", Icon: Map },
  { name: "Intervias",          sigla: "ITV", Icon: Shield },
];

function LogoItem({ name, sigla, Icon }: { name: string; sigla: string; Icon: any }) {
  return (
    <div className="flex items-center gap-3 mx-10 flex-shrink-0 select-none text-white group">
      {/* Ícone representando a marca */}
      <Icon className="w-7 h-7 text-white opacity-90 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
      
      {/* Texto do logo */}
      <div className="flex items-center gap-2">
        {name !== sigla ? (
          <>
            <span className="text-xl font-bold tracking-tighter opacity-90 group-hover:opacity-100 transition-opacity">
              {sigla}
            </span>
            <span className="text-sm font-semibold tracking-wider opacity-80 group-hover:opacity-100 transition-opacity uppercase">
              {name}
            </span>
          </>
        ) : (
          <span className="text-xl font-bold tracking-widest opacity-90 group-hover:opacity-100 transition-opacity uppercase">
            {name}
          </span>
        )}
      </div>
    </div>
  );
}

export function PartnerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...concessionarias, ...concessionarias];

  return (
    <section className="relative bg-[#364925] border-t border-b border-[#2d3a23] py-6 overflow-hidden">
      {/* Fundo com textura simulada para se assemelhar ao fundo da imagem anexa */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4b6335] via-[#364925] to-[#25331a] opacity-90" />
      
      {/* Overlay para dar um aspecto ligeiramente mais escuro e uniforme */}
      <div className="absolute inset-0 z-0 bg-black/10 mix-blend-overlay" />

      <div className="relative z-10">
        {/* Fade nas bordas usando a cor base para uma transição suave */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#314321] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#314321] to-transparent z-20 pointer-events-none" />

        {/* Track com animação CSS */}
        <div
          ref={trackRef}
          className="flex items-center"
          style={{
            animation: "marquee 45s linear infinite",
            width: "max-content",
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
