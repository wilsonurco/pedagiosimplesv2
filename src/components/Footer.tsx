import { useState } from "react";
import logoFooterImg from "figma:asset/b4b61ea2aff4e0735f9cc375bc7a4846923c94d1.png";
import { CreditCard, Instagram, Twitter, Linkedin, Youtube, Building2, ShieldCheck } from "lucide-react";
import pixLogo from "../assets/pix.svg";
import { CertificadosModal } from "./CertificadosModal";

interface FooterProps {
  onNavigateToFAQ?: () => void;
  onAcessoConcessionaria?: () => void;
}

const MastercardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.179 16.7995C10.9949 17.7975 9.45902 18.4 7.78069 18.4C4.03582 18.4 1 15.4003 1 11.7C1 7.99969 4.03582 5 7.78069 5C9.45902 5 10.9949 5.6025 12.179 6.60054C13.363 5.6025 14.8989 5 16.5773 5C20.3221 5 23.358 7.99969 23.358 11.7C23.358 15.4003 20.3221 18.4 16.5773 18.4C14.8989 18.4 13.363 17.7975 12.179 16.7995Z" fill="#ED0006"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12.179 16.7995C13.6369 15.5706 14.5614 13.742 14.5614 11.7C14.5614 9.65804 13.6369 7.82944 12.179 6.60054C13.363 5.6025 14.8989 5 16.5772 5C20.3221 5 23.3579 7.99969 23.3579 11.7C23.3579 15.4003 20.3221 18.4 16.5772 18.4C14.8989 18.4 13.363 17.7975 12.179 16.7995Z" fill="#F9A000"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12.179 16.7995C13.6369 15.5706 14.5614 13.742 14.5614 11.7C14.5614 9.65808 13.6369 7.82949 12.179 6.60059C10.7211 7.82949 9.79663 9.65808 9.79663 11.7C9.79663 13.742 10.7211 15.5706 12.179 16.7995Z" fill="#FF5E00"/>
  </svg>
);

const VisaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.95025 15.7582H3.89051L2.34596 9.69237C2.27264 9.41334 2.11698 9.16667 1.88801 9.0504C1.31659 8.75823 0.686915 8.5257 0 8.40843V8.1749H3.31808C3.77602 8.1749 4.11948 8.5257 4.17672 8.93313L4.97813 13.3086L7.03686 8.1749H9.03936L5.95025 15.7582ZM10.1842 15.7582H8.23897L9.84077 8.1749H11.786L10.1842 15.7582ZM14.3027 10.2757C14.3599 9.86728 14.7034 9.63374 15.1041 9.63374C15.7338 9.57511 16.4197 9.69238 16.9921 9.98354L17.3356 8.35081C16.7631 8.11727 16.1335 8 15.562 8C13.674 8 12.3002 9.05041 12.3002 10.5082C12.3002 11.6173 13.2733 12.1996 13.9602 12.5504C14.7034 12.9002 14.9896 13.1338 14.9324 13.4835C14.9324 14.0082 14.3599 14.2418 13.7885 14.2418C13.1016 14.2418 12.4147 14.0669 11.786 13.7747L11.4426 15.4085C12.1295 15.6996 12.8726 15.8169 13.5595 15.8169C15.6765 15.8745 16.9921 14.8251 16.9921 13.25C16.9921 11.2665 14.3027 11.1502 14.3027 10.2757ZM23.8 15.7582L22.2554 8.1749H20.5964C20.2529 8.1749 19.9095 8.40843 19.795 8.75823L16.9349 15.7582H18.9374L19.3371 14.6502H21.7975L22.0265 15.7582H23.8ZM20.8826 10.2171L21.454 13.0751H19.8523L20.8826 10.2171Z" fill="white"/>
  </svg>
);

const EloIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Elo">
    <path d="M3.52989 9.33204C3.79545 9.24497 4.07954 9.1977 4.37514 9.1977C5.66519 9.1977 6.74128 10.0967 6.98815 11.2908L8.81624 10.9252C8.39678 8.89558 6.56803 7.3678 4.37514 7.3678C3.87308 7.3678 3.38981 7.44803 2.93869 7.59583L3.52989 9.33204Z" fill="#FECA2F"/>
    <path d="M1.3544 15.2138L2.44898 13.8005C1.96039 13.3063 1.65201 12.5848 1.65201 11.7806C1.65201 10.977 1.9601 10.2555 2.44855 9.76167L1.3534 8.34851C0.523179 9.18813 0 10.4146 0 11.7806C0 13.1473 0.523944 14.3742 1.3544 15.2138Z" fill="#1BA7DE"/>
    <path d="M6.98871 12.2716C6.741 13.4656 5.6656 14.3634 4.37668 14.3634C4.08096 14.3634 3.79631 14.316 3.53073 14.2287L2.93869 15.9658C3.39051 16.1143 3.87393 16.1946 4.37668 16.1946C6.56757 16.1946 8.3951 14.6679 8.81624 12.6391L6.98871 12.2716Z" fill="#EC412A"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M17.6117 8.34851V13.3712L18.513 13.7325L18.0866 14.7232L17.1953 14.3649C16.9948 14.2808 16.8592 14.1528 16.7561 14.0082C16.6572 13.8602 16.5838 13.658 16.5838 13.385V8.34851H17.6117ZM10.7757 12.0815C10.7981 10.6452 12.0213 9.49864 13.5056 9.52064C14.7654 9.53975 15.8092 10.393 16.0833 11.5279L11.2109 13.5416C10.9279 13.1232 10.7671 12.6199 10.7757 12.0815ZM11.8906 12.2829C11.8839 12.2227 11.8792 12.1609 11.8809 12.0985C11.8949 11.2523 12.6151 10.577 13.4895 10.5911C13.9655 10.5972 14.3882 10.808 14.6739 11.1342L11.8906 12.2829ZM14.5711 13.2154C14.2775 13.4916 13.8792 13.6599 13.4396 13.6539C13.1382 13.649 12.8589 13.5617 12.6215 13.4164L12.0329 14.3233C12.436 14.5697 12.9113 14.7155 13.4237 14.7231C14.1696 14.7339 14.8495 14.4505 15.3438 13.9827L14.5711 13.2154ZM21.3632 10.591C21.1876 10.591 21.0189 10.6184 20.8612 10.6696L20.5105 9.65332C20.7782 9.56689 21.0649 9.51994 21.3632 9.51994C22.665 9.51994 23.751 10.4142 24 11.602L22.9144 11.816C22.7681 11.117 22.1292 10.591 21.3632 10.591ZM19.5805 14.0704L20.3141 13.2682C19.9865 12.9877 19.7802 12.5781 19.7802 12.1215C19.7802 11.6653 19.9865 11.2558 20.3138 10.9756L19.5797 10.1734C19.0231 10.65 18.6725 11.3464 18.6725 12.1215C18.6725 12.8974 19.0234 13.5936 19.5805 14.0704ZM21.3632 13.6525C22.1284 13.6525 22.7672 13.127 22.9144 12.4289L23.9997 12.6438C23.7495 13.8304 22.6638 14.7234 21.3632 14.7234C21.0646 14.7234 20.7776 14.6763 20.5092 14.5895L20.8607 13.5736C21.0186 13.6246 21.1875 13.6525 21.3632 13.6525Z" fill="white"/>
  </svg>
);

const colunas = [
  {
    titulo: "Controle & Ajuda",
    links: [
      { label: "Consultar minha placa", href: "#" },
      { label: "Pagar pedágio Free Flow", href: "#" },
      { label: "Minha conta", href: "#" },
      { label: "Histórico de passagens", href: "#" },
      { label: "Comprovante RPV", href: "#" },
      { label: "Concessionárias Parceiras", href: "#" },
    ],
  },
  {
    titulo: "Institucional",
    links: [
      { label: "Sobre o Pedágio Simples", href: "#" },
      { label: "Sobre a Move Mais", href: "#" },
      { label: "Parcerias com concessionárias", href: "#" },
      { label: "Seja uma Concessionária Parceira", href: "#" },
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
  const [modalCertificados, setModalCertificados] = useState(false);

  return (
    <footer className="bg-[#1A1B23]">

      {/* Grid principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Coluna da marca — 2 cols no lg */}
          <div className="lg:col-span-2">
            <img src={logoFooterImg} alt="Pedágio Simples — by Move Mais" className="h-10 brightness-0 invert mb-4" />
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              O <strong className="text-white/70">Pedágio Simples</strong> é uma plataforma autorizada para consulta e pagamento de débitos de Pedágio Eletrônico e Free Flow em todas as rodovias do Brasil.
            </p>
            <p className="text-xs text-white/30 mt-3">
              by Move Mais Meios de Pagamento
            </p>

            {/* App store badges */}
            <div className="flex items-center gap-3 mt-6">
              {[
                {
                  label: "App Store",
                  sub: "Em breve",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/70" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  ),
                },
                {
                  label: "Google Play",
                  sub: "Em breve",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/70" fill="currentColor">
                      <path d="M3.18 23.76c.3.17.64.22.99.14l12.12-6.95-2.54-2.54-10.57 9.35zm-1.1-20.9C2.03 3.1 2 3.37 2 3.65v16.7c0 .28.03.55.08.8l10.88-10.88-10.88-10.41zM20.49 10.3l-2.76-1.58-2.87 2.87 2.87 2.87 2.79-1.6c.8-.45.8-1.11-.03-1.56zM4.17.25L16.29 7.2l-2.54 2.54L3.18.38c.31-.2.67-.27.99-.13z" />
                    </svg>
                  ),
                },
              ].map((store) => (
                <div
                  key={store.label}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 opacity-60 cursor-default select-none"
                  title="Em breve"
                >
                  {store.icon}
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest">{store.sub}</span>
                    <span className="text-xs font-semibold text-white/70 mt-0.5">{store.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Redes sociais */}
            <div className="flex items-center gap-3 mt-5">
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
                <div className="flex items-center bg-white/5 rounded-lg px-2 py-1.5">
                  <img src={pixLogo} alt="PIX" className="h-5 w-auto object-contain" />
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5">
                  <CreditCard className="h-4 w-4 text-[#8B5FFF]" />
                  <span className="text-xs font-semibold text-white/60">Cartão de crédito</span>
                  <span className="ml-1"><MastercardIcon /></span>
                  <span className="ml-1"><VisaIcon /></span>
                  <span className="ml-1"><EloIcon /></span>
                </div>
              </div>
            </div>

            {/* Selos de segurança + trigger do modal */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "PCI DSS", sub: "Compliant", cor: "text-[#0E8B5A]" },
                { label: "SSL", sub: "256-bit", cor: "text-[#8B5FFF]" },
                { label: "LGPD", sub: "Conformidade", cor: "text-white/50" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2">
                  <span className={`text-[10px] font-bold ${s.cor}`}>{s.label}</span>
                  <span className="text-[8px] text-white/30">{s.sub}</span>
                </div>
              ))}
              <button
                onClick={() => setModalCertificados(true)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-[#5B2E8C]/40 border border-white/10 hover:border-[#8B5FFF]/40 rounded-lg px-3 py-2 transition-colors group"
                title="Ver todas as certificações"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#8B5FFF] group-hover:text-white transition-colors" />
                <span className="text-[10px] font-semibold text-white/40 group-hover:text-white/80 transition-colors">
                  Certificações & Selos
                </span>
              </button>
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
              <p>CNPJ 15.266.912/0001-87 · Araraquara, SP</p>
            </div>
          </div>
        </div>
      </div>

      <CertificadosModal open={modalCertificados} onOpenChange={setModalCertificados} />
    </footer>
  );
}
