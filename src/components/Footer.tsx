import logoFooterImg from "figma:asset/b4b61ea2aff4e0735f9cc375bc7a4846923c94d1.png";

interface FooterProps {
  onNavigateToFAQ?: () => void;
}

export function Footer({ onNavigateToFAQ }: FooterProps) {
  return (
    <footer className="bg-[#F8F9FA] border-t border-[#E0E0E0]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Logo e Informações */}
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Logo da Concessionária */}
            <div className="w-full max-w-md">
              <img src={logoFooterImg} alt="Pedágio Simples - by move mais" className="max-h-16 mx-auto" />
            </div>

            {/* Texto Informativo */}
            <div className="space-y-3">
              <p className="text-sm text-[#6C757D] leading-relaxed max-w-2xl">
                O <strong className="text-[#003566]">Pedágio Simples</strong> é uma plataforma autorizada para consulta e pagamento de pendências de pedágio. 
                Facilitamos o processo de quitação de débitos de forma rápida, segura e transparente.
              </p>
              <p className="text-xs text-[#6C757D]">
                © {new Date().getFullYear()} Pedágio Simples. Todos os direitos reservados.
              </p>
            </div>

            {/* Links Legais */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#6C757D]">
              <a href="#" className="hover:text-[#003566] transition-colors underline">
                Termos de Uso
              </a>
              <span className="text-[#E0E0E0]">|</span>
              <a href="#" className="hover:text-[#003566] transition-colors underline">
                Política de Privacidade
              </a>
              <span className="text-[#E0E0E0]">|</span>
              <button
                onClick={onNavigateToFAQ}
                className="hover:text-[#003566] transition-colors underline"
              >
                Perguntas Frequentes
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}