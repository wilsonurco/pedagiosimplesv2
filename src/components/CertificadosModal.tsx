import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { ShieldCheck, Award, Star, ExternalLink, X } from "lucide-react";
import logoVanzolini from "../assets/logo-vanzolini.webp";

import sealIso9001 from "../assets/iso-9001-azul.svg";
import sealIso27001 from "../assets/iso-27001-azul.svg";
import seloMesc from "../assets/selo-mesc.svg";
import verificadaRa from "../assets/verificada-ra.svg";
import consumidorBr from "../assets/consumidor-br.svg";
import sectigoSeguranca from "../assets/sectigo-seguranca.svg";

interface CertificadosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ── Inline SVG logos ───────────────────────────────────────────────────────── */

function Iso9001Seal() {
  return <img src={sealIso9001} alt="Selo ISO 9001 — Fundação Vanzolini" className="w-full h-full object-contain" />;
}

function Iso27001Seal() {
  return <img src={sealIso27001} alt="Selo ISO/IEC 27001 — Fundação Vanzolini" className="w-full h-full object-contain" />;
}

function IqnetLogo() {
  return (
    <svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
      <rect width="120" height="36" rx="4" fill="#003087" />
      <text x="60" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700"
        fontSize="15" letterSpacing="2" fill="#ffffff">IQ Net</text>
    </svg>
  );
}

function MescLogo() {
  return <img src={seloMesc} alt="Selo MESC" className="h-16 w-auto object-contain" />;
}

function ReclameAquiLogo() {
  return <img src={verificadaRa} alt="Verificada por ReclameAQUI" className="h-8 w-auto object-contain" />;
}

function ConsumidorGovLogo() {
  return <img src={consumidorBr} alt="consumidor.gov.br" className="h-9 w-auto object-contain" />;
}

/* ── Data ───────────────────────────────────────────────────────────────────── */

const certificados = [
  {
    categoria: "Certificações ISO",
    cor: "text-[#8B5FFF]",
    bg: "bg-[#F4EFFB]",
    border: "border-[#8B5FFF]/20",
    icone: Award,
    itens: [
      {
        selo: <Iso9001Seal />,
        logo: null,
        titulo: "Sistema de Gestão da Qualidade",
        norma: "ISO 9001",
        emissor: "Fundação Vanzolini · IQNET",
        descricao: "Certificação internacional que atesta nosso compromisso com processos de qualidade, melhoria contínua e satisfação do cliente.",
        href: "https://vanzolini.org.br",
      },
      {
        selo: <Iso27001Seal />,
        logo: null,
        titulo: "Segurança da Informação",
        norma: "ISO/IEC 27001",
        emissor: "Fundação Vanzolini · IQNET",
        descricao: "Norma global para gestão de segurança da informação. Garante que seus dados são tratados com os mais altos padrões de proteção.",
        href: "https://vanzolini.org.br",
      },
    ],
  },
  {
    categoria: "Selos de Reputação",
    cor: "text-[#C77700]",
    bg: "bg-[#FBF4E6]",
    border: "border-[#C77700]/20",
    icone: Star,
    itens: [
      {
        selo: null,
        logo: <MescLogo />,
        titulo: "Melhores Empresas em Satisfação do Cliente",
        norma: "MESC 2025",
        emissor: "Instituto MESC",
        descricao: "Empresa Certificada 2025 pelo Instituto MESC — reconhecimento concedido às empresas com maior índice de satisfação de clientes no Brasil.",
        href: "#",
      },
      {
        selo: null,
        logo: <ReclameAquiLogo />,
        titulo: "Verificada por ReclameAQUI",
        norma: "ReclameAQUI",
        emissor: "ReclameAQUI",
        descricao: "Empresa verificada e com histórico positivo de atendimento e resolução de demandas na plataforma ReclameAQUI.",
        href: "https://reclameaqui.com.br",
      },
    ],
  },
  {
    categoria: "Conformidade & Segurança",
    cor: "text-[#0E8B5A]",
    bg: "bg-[#D4F0E2]",
    border: "border-[#0E8B5A]/20",
    icone: ShieldCheck,
    itens: [
      {
        selo: null,
        logo: <ConsumidorGovLogo />,
        titulo: "Participo do consumidor.gov.br",
        norma: "Consumidor.gov.br",
        emissor: "Governo Federal · SENACON",
        descricao: "Canal público de resolução de conflitos entre consumidores e empresas, monitorado pela Secretaria Nacional do Consumidor.",
        href: "https://consumidor.gov.br",
      },
      {
        selo: null,
        logo: (
          <img src={sectigoSeguranca} alt="Sectigo" className="h-7 w-auto object-contain" />
        ),
        titulo: "Secured by Sectigo",
        norma: "Sectigo SSL",
        emissor: "Sectigo (antiga Comodo CA)",
        descricao: "Certificado SSL/TLS emitido pela Sectigo, uma das maiores autoridades certificadoras do mundo. Garante criptografia de ponta a ponta em todas as transações.",
        href: "https://sectigo.com",
      },
    ],
  },
];

/* ── Component ──────────────────────────────────────────────────────────────── */

export function CertificadosModal({ open, onOpenChange }: CertificadosModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0 [&>button]:hidden">
        {/* Header fixo */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b border-[#ECECF1] px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-[#1A1B23] text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#5B2E8C] flex-shrink-0" />
              Certificações & Selos de Confiança
            </DialogTitle>
            <DialogClose className="flex-shrink-0 rounded-md p-1.5 text-[#8A8B95] hover:bg-[#F4EFFB] hover:text-[#5B2E8C] transition-colors mt-0.5">
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </div>
          <p className="text-sm text-[#8A8B95] mt-1">
            O Pedágio Simples opera com os mais altos padrões de qualidade, segurança e transparência reconhecidos nacionalmente e internacionalmente.
          </p>
        </DialogHeader>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 px-6 pb-6">
        <div className="mt-4 space-y-6">
          {certificados.map((grupo) => {
            const Icone = grupo.icone;
            return (
              <div key={grupo.categoria}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-md ${grupo.bg} flex items-center justify-center`}>
                    <Icone className={`h-3.5 w-3.5 ${grupo.cor}`} />
                  </div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${grupo.cor}`}>
                    {grupo.categoria}
                  </h3>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grupo.itens.map((item) => (
                    <div
                      key={item.norma}
                      className={`rounded-xl border ${grupo.border} bg-white p-4 flex flex-col gap-3`}
                    >
                      {item.selo !== null ? (
                        /* ── Layout com selo circular (ISO) ── */
                        <>
                          <div className="flex items-start gap-3">
                            {/* Selo */}
                            <div className="w-[72px] h-[72px] flex-shrink-0 drop-shadow-sm">
                              {item.selo}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-start justify-between gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${grupo.bg} ${grupo.cor}`}>
                                  {item.norma}
                                </span>
                                {item.href !== "#" && (
                                  <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
                                    aria-label={`Ver mais sobre ${item.norma}`}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="font-semibold text-[#1A1B23] text-sm mt-1.5 leading-snug">
                                {item.titulo}
                              </p>
                              <p className="text-[11px] text-[#8A8B95] mt-0.5">{item.emissor}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#8A8B95] leading-relaxed">{item.descricao}</p>
                        </>
                      ) : (
                        /* ── Layout padrão (logos horizontais) ── */
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center min-h-[2rem]">
                              {item.logo}
                            </div>
                            {item.href !== "#" && (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
                                aria-label={`Ver mais sobre ${item.norma}`}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${grupo.bg} ${grupo.cor}`}>
                              {item.norma}
                            </span>
                            <p className="font-semibold text-[#1A1B23] text-sm mt-2 leading-snug">
                              {item.titulo}
                            </p>
                            <p className="text-[11px] text-[#8A8B95] mt-0.5">{item.emissor}</p>
                            <p className="text-xs text-[#8A8B95] leading-relaxed mt-2">{item.descricao}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-4 text-[11px] text-[#C6C7CF] text-center">
          Dúvidas sobre nossas certificações? Entre em contato em{" "}
          <a href="mailto:compliance@movemais.com" className="text-[#5B2E8C] hover:underline">
            compliance@movemais.com
          </a>
        </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
