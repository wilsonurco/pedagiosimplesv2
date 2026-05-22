import logoFooterImg from "figma:asset/b4b61ea2aff4e0735f9cc375bc7a4846923c94d1.png";
import { QrCode, CreditCard, Smartphone, Instagram, Twitter, Linkedin, Youtube, Building2 } from "lucide-react";

interface FooterProps {
  onNavigateToFAQ?: () => void;
  onAcessoConcessionaria?: () => void;
}

const colunas = [
  {
    titulo: "Controle & Ajuda",
    links: [
      { label: "Consultar minha placa", href: "#" },
      { label: "Pagar pedágio Free Flow", href: "#" },
      { label: "Minha conta", href: "#" },
      { label: "Histórico de passagens", href: "#" },
      { label: "Comprovante RPV", href: "#" },
    ],
  },
  {
    titulo: "Institucional",
    links: [
      { label: "Sobre o Pedágio Simples", href: "#" },
      { label: "Sobre a Move Mais", href: "#" },
      { label: "Parcerias com concessionárias", href: "#" },
      { label: "Imprensa", href: "#" },
      { label: "Trabalhe conosco", href: "#" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { label: "Termos de Uso", href: "#" },
      { label: "Política de Privacidade", href: "#" },
      { label: "Política de Cookies", href: "#" },
      { label: "LGPD", href: "#" },
    ],
  },
];

const redesSociais = [
  { icone: Instagram, label: "Instagram", href: "#" },
  { icone: Twitter, label: "Twitter / X", href: "#" },
  { icone: Linkedin, label: "LinkedIn", href: "#" },
  { icone: Youtube, label: "YouTube", href: "#" },
];

export function Footer({ onNavigateToFAQ, onAcessoConcessionaria }: FooterProps) {
  return (
    <footer className="bg-[#1A1B23]">

      {/* Grid principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Coluna da marca — 2 cols no lg */}
          <div className="lg:col-span-2">
            <img src={logoFooterImg} alt="Pedágio Simples — by Move Mais" className="h-10 brightness-0 invert mb-4" />
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              O <strong className="text-white/70">Pedágio Simples</strong> é uma plataforma autorizada para consulta e pagamento de débitos de pedágio Free Flow em todas as rodovias do Brasil.
            </p>
            <p className="text-xs text-white/30 mt-3">
              by Move Mais Meios de Pagamento
            </p>

            {/* Redes sociais */}
            <div className="flex items-center gap-3 mt-6">
              {redesSociais.map((r) => {
                const Icon = r.icone;
                return (
                  <a
                    key={r.label}
                    href={r.href}
                    aria-label={r.label}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#5B2E8C] flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4 text-white/60 hover:text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Colunas de links */}
          {colunas.map((col) => (
            <div key={col.titulo}>
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                {col.titulo}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={link.label === "Perguntas Frequentes" ? (e) => { e.preventDefault(); onNavigateToFAQ?.(); } : undefined}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Formas de pagamento aceitas</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5">
                  <QrCode className="h-4 w-4 text-[#32BCAD]" />
                  <span className="text-xs font-semibold text-white/60">PIX</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5">
                  <CreditCard className="h-4 w-4 text-[#8B5FFF]" />
                  <span className="text-xs font-semibold text-white/60">Cartão de crédito</span>
                  {["Mastercard", "Visa", "Elo"].map((brand) => (
                    <span key={brand} className="text-[10px] font-bold text-white/30 border border-white/15 rounded px-1.5 py-0.5 ml-1">{brand}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Selos de segurança */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2">
                <span className="text-[10px] font-bold text-[#0E8B5A]">PCI DSS</span>
                <span className="text-[8px] text-white/30">Compliant</span>
              </div>
              <div className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2">
                <span className="text-[10px] font-bold text-[#5B2E8C]">SSL</span>
                <span className="text-[8px] text-white/30">256-bit</span>
              </div>
              <div className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2">
                <span className="text-[10px] font-bold text-white/50">LGPD</span>
                <span className="text-[8px] text-white/30">Conformidade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
            <p>© {new Date().getFullYear()} Pedágio Simples — Move Mais Meios de Pagamento. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              {onAcessoConcessionaria && (
                <button
                  onClick={onAcessoConcessionaria}
                  className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Acesso Concessionária
                </button>
              )}
              <p>CNPJ 00.000.000/0001-00 · São Paulo, SP</p>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
