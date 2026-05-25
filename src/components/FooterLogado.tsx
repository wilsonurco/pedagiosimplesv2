import { Phone } from "lucide-react";

export function FooterLogado() {
  const ano = new Date().getFullYear();

  return (
    <footer className="hidden md:block border-t border-[#DCDDE3] bg-white">
      <div className="px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-6 text-xs text-[#8A8B95]">

          {/* Copyright */}
          <p className="whitespace-nowrap">
            © {ano} Pedágio Simples by Move Mais — Todos os direitos reservados
          </p>

          {/* Central de atendimento */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-[#8A8B95]">Central de Relacionamento</span>
            <span className="flex items-center gap-1 text-[#1A1B23] font-semibold">
              <Phone className="h-3 w-3 text-[#5B2E8C]" />
              4000 2901
            </span>
            <span className="text-[#DCDDE3]">|</span>
            <span className="text-[#8A8B95]">capitais e regiões metropolitanas</span>
            <span className="text-[#DCDDE3]">|</span>
            <span className="flex items-center gap-1 text-[#1A1B23] font-semibold">
              <Phone className="h-3 w-3 text-[#5B2E8C]" />
              0800 777 1022
            </span>
            <span className="text-[#DCDDE3]">|</span>
            <span className="text-[#8A8B95]">demais localidades</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
