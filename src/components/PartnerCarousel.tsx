const rodovias = [
  { sigla: "SP-330", nome: "Anhanguera",      prefixo: "◉" },
  { sigla: "SP-021", nome: "Rodoanel",        prefixo: "▸" },
  { sigla: "SP-270", nome: "Raposo Tavares",  prefixo: "◎" },
  { sigla: "BR-116", nome: "Via Dutra",       prefixo: "⬡" },
  { sigla: "BR-381", nome: "Fernão Dias",     prefixo: "◈" },
  { sigla: "SP-160", nome: "Imigrantes",      prefixo: "◆" },
  { sigla: "SP-150", nome: "Anchieta",        prefixo: "▹" },
  { sigla: "BR-050", nome: "Triângulo",       prefixo: "◇" },
  { sigla: "SP-348", nome: "Bandeirantes",    prefixo: "⬡" },
  { sigla: "BR-277", nome: "Corredor",        prefixo: "◉" },
  { sigla: "SP-280", nome: "Castello Branco", prefixo: "▸" },
  { sigla: "BR-163", nome: "Cuiabá-Santarém", prefixo: "◎" },
];

function LogoItem({ sigla, nome, prefixo }: { sigla: string; nome: string; prefixo: string }) {
  return (
    <div
      className="flex items-center gap-2.5 mx-10 flex-shrink-0 select-none"
    >
      {/* Prefixo decorativo */}
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", lineHeight: 1 }}>
        {prefixo}
      </span>
      {/* Sigla — peso alto, totalmente branca */}
      <span
        style={{
          color: "rgba(255,255,255,0.90)",
          fontWeight: 800,
          fontSize: "13px",
          letterSpacing: "0.08em",
          lineHeight: 1,
        }}
      >
        {sigla}
      </span>
      {/* Divisor vertical */}
      <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px", lineHeight: 1 }}>
        |
      </span>
      {/* Nome — peso normal, mais transparente */}
      <span
        style={{
          color: "rgba(255,255,255,0.55)",
          fontWeight: 500,
          fontSize: "11px",
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {nome}
      </span>
    </div>
  );
}

export function PartnerCarousel() {
  const doubled = [...rodovias, ...rodovias];

  return (
    <section
      className="relative overflow-hidden py-4"
      style={{
        background: "rgba(10, 10, 16, 0.82)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Highlight sutil no topo — reflexo de luz */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "40%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full">
        <div
          className="flex items-center"
          style={{
            animation: "marquee 50s linear infinite",
            width: "max-content",
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
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
