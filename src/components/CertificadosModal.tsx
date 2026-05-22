import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ShieldCheck, Award, Star, ExternalLink } from "lucide-react";

interface CertificadosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const certificados = [
  {
    categoria: "Certificações ISO",
    cor: "text-[#8B5FFF]",
    bg: "bg-[#F4EFFB]",
    border: "border-[#8B5FFF]/20",
    icone: Award,
    itens: [
      {
        sigla: "ISO 9001",
        titulo: "Sistema de Gestão da Qualidade",
        emissor: "Fundação Vanzolini · IQNET",
        descricao: "Certificação internacional que atesta nosso compromisso com processos de qualidade, melhoria contínua e satisfação do cliente.",
        href: "https://vanzolini.org.br",
      },
      {
        sigla: "ISO/IEC 27001",
        titulo: "Segurança da Informação",
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
        sigla: "MESC 2025",
        titulo: "Melhores Empresas em Satisfação do Cliente",
        emissor: "Instituto MESC",
        descricao: "Empresa Certificada 2025 pelo Instituto MESC — reconhecimento concedido às empresas com maior índice de satisfação de clientes no Brasil.",
        href: "#",
      },
      {
        sigla: "ReclameAQUI",
        titulo: "Verificada por ReclameAQUI",
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
        sigla: "Consumidor.gov.br",
        titulo: "Participo do consumidor.gov.br",
        emissor: "Governo Federal · SENACON",
        descricao: "Canal público de resolução de conflitos entre consumidores e empresas, monitorado pela Secretaria Nacional do Consumidor.",
        href: "https://consumidor.gov.br",
      },
      {
        sigla: "Sectigo SSL",
        titulo: "Secured by Sectigo",
        emissor: "Sectigo (antiga Comodo CA)",
        descricao: "Certificado SSL/TLS emitido pela Sectigo, uma das maiores autoridades certificadoras do mundo. Garante criptografia de ponta a ponta em todas as transações.",
        href: "https://sectigo.com",
      },
    ],
  },
];

export function CertificadosModal({ open, onOpenChange }: CertificadosModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1A1B23] text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#5B2E8C]" />
            Certificações & Selos de Confiança
          </DialogTitle>
          <p className="text-sm text-[#8A8B95] mt-1">
            O Pedágio Simples opera com os mais altos padrões de qualidade, segurança e transparência reconhecidos nacionalmente e internacionalmente.
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {certificados.map((grupo) => {
            const Icone = grupo.icone;
            return (
              <div key={grupo.categoria}>
                {/* Cabeçalho do grupo */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-md ${grupo.bg} flex items-center justify-center`}>
                    <Icone className={`h-3.5 w-3.5 ${grupo.cor}`} />
                  </div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${grupo.cor}`}>
                    {grupo.categoria}
                  </h3>
                </div>

                {/* Cards do grupo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grupo.itens.map((item) => (
                    <div
                      key={item.sigla}
                      className={`rounded-xl border ${grupo.border} bg-white p-4 flex flex-col gap-2`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${grupo.bg} ${grupo.cor}`}>
                            {item.sigla}
                          </span>
                          <p className="font-semibold text-[#1A1B23] text-sm mt-2 leading-snug">
                            {item.titulo}
                          </p>
                          <p className="text-[11px] text-[#8A8B95] mt-0.5">{item.emissor}</p>
                        </div>
                        {item.href !== "#" && (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
                            aria-label={`Ver mais sobre ${item.sigla}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8B95] leading-relaxed">{item.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé do modal */}
        <p className="mt-2 text-[11px] text-[#C6C7CF] text-center">
          Dúvidas sobre nossas certificações? Entre em contato em{" "}
          <a href="mailto:compliance@movemais.com.br" className="text-[#5B2E8C] hover:underline">
            compliance@movemais.com.br
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
