import { Fragment, useState } from "react";
import {
  CreditCard, Search, CheckCircle,
  ChevronDown, ChevronUp, Smartphone, Zap,
  ArrowRight
} from "lucide-react";

// ─── Dados ────────────────────────────────────────────────────────────────────

const parceiros = [
  { nome: "Arteris",            estilo: "font-medium tracking-tight" },
  { nome: "Autoban",            estilo: "font-medium tracking-wide" },
  { nome: "Autopista",          estilo: "font-medium tracking-widest" },
  { nome: "CCR",                estilo: "font-medium tracking-tighter" },
  { nome: "Concebra",           estilo: "font-medium tracking-tight" },
  { nome: "EcoRodovias",        estilo: "font-medium tracking-tight" },
  { nome: "Ecovias",            estilo: "font-medium tracking-tight" },
  { nome: "Intervias",          estilo: "font-medium tracking-tight" },
  { nome: "Rota das Bandeiras", estilo: "font-medium tracking-tight" },
  { nome: "SPMAR",              estilo: "font-medium tracking-widest" },
];

const passosPagamento = [
  {
    icone: Search,
    titulo: "Consulte pelo número da placa",
    descricao: "Acesse nosso portal e insira a placa do veículo para localizar todas as passagens em aberto.",
  },
  {
    icone: CheckCircle,
    titulo: "Confira os débitos de pedágio",
    descricao: "Visualize cada passagem com data, pórtico, rodovia e valor. Selecione as que deseja quitar.",
  },
  {
    icone: CreditCard,
    titulo: "Escolha como pagar",
    descricao: "PIX com confirmação instantânea ou cartão de crédito. Emitimos o comprovante.",
  },
  {
    icone: Zap,
    titulo: "Evite o registro de multa de evasão",
    descricao: "Com o pagamento confirmado, suas passagens são quitadas antes do prazo e a multa não é gerada.",
  },
];



const faqItens = [
  {
    pergunta: "O que é Pedágio Eletrônico Free Flow?",
    resposta: "Free Flow (ou pedágio por fluxo livre) é o sistema em que as cabines de cobrança foram eliminadas. Os veículos passam por pórticos eletrônicos que identificam a placa e cobram automaticamente via TAG ou geram uma Passagem por Não Usuário (PNU) para quem não tem TAG, que precisa ser paga em até 30 dias.",
  },
  {
    pergunta: "O que é a multa de evasão de pedágio?",
    resposta: "É a penalidade aplicada quando uma PNU (passagem sem TAG) não é paga dentro do prazo. O valor da multa varia por concessionária, mas costuma ser entre 3× e 5× o valor do pedágio, podendo ainda gerar pontos na CNH.",
  },
  {
    pergunta: "Como faço para pagar o pedágio Free Flow sem TAG?",
    resposta: "Acesse o Pedágio Simples, informe a placa do veículo e veja todas as passagens em aberto. Você pode pagar via PIX (confirmação instantânea) ou cartão de crédito. O sistema notifica as concessionárias em tempo real.",
  },
  {
    pergunta: "Quais concessionárias são atendidas?",
    resposta: "O Pedágio Simples integra com CCR, Arteris, Ecovias, Autoban, Triângulo do Sol, EcoRodovias e mais de 30 concessões de rodovias federais e estaduais em todo o Brasil.",
  },
  {
    pergunta: "Para que serve o RPV (Registro de Passagem Veicular)?",
    resposta: "O RPV é o documento oficial que confirma que o pagamento de uma PNU foi realizado. Ele é aceito pelas autoridades de trânsito como comprovante e cancela qualquer processo de autuação em andamento pela mesma passagem.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="border-b border-[#ECECF1] last:border-0">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm sm:text-base font-medium text-[#1A1B23] group-hover:text-[#5B2E8C] transition-colors">
          {pergunta}
        </span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F4EFFB] flex items-center justify-center text-[#5B2E8C]">
          {aberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {aberto && (
        <p className="pb-5 text-sm text-[#8A8B95] leading-relaxed">{resposta}</p>
      )}
    </div>
  );
}

// ─── Phone Mockup ─────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative flex justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-[#8B5FFF]/20 blur-3xl" />
      </div>

      <div className="relative w-56 bg-[#1A1B23] rounded-[2.5rem] shadow-2xl border-4 border-[#2E1547] p-1.5">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1A1B23] rounded-full z-10" />

        <div className="bg-[#F7F5FB] rounded-[2rem] overflow-hidden min-h-[420px]">
          <div className="bg-[#5B2E8C] px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/70 text-[9px] font-mono">09:41</div>
              <div className="flex gap-1">
                <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
                <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
                <div className="w-1 h-1.5 bg-white/30 rounded-sm" />
              </div>
            </div>
            <p className="text-white/70 text-[9px]">Olá, João 👋</p>
            <p className="text-white text-sm font-semibold mt-0.5">Pedágio Simples</p>
          </div>

          <div className="bg-[#5B2E8C] px-4 pb-5">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-[9px] uppercase tracking-wide">Débito em aberto</p>
              <p className="text-white text-xl font-bold font-mono mt-0.5">R$ 25,40</p>
              <p className="text-white/60 text-[9px] mt-0.5">4 passagens • MOV-1234</p>
            </div>
          </div>

          <div className="p-3 space-y-1.5">
            <p className="text-[9px] font-semibold text-[#5B2E8C] uppercase tracking-wide px-1">Passagens recentes</p>
            {[
              { local: "SP-330 — KM 45", valor: "R$ 4,30", data: "14/04" },
              { local: "SP-021 — KM 18", valor: "R$ 6,80", data: "20/04" },
              { local: "SP-270 — KM 33", valor: "R$ 5,10", data: "28/04" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-2.5 py-2 shadow-sm border border-[#ECECF1]">
                <div>
                  <p className="text-[9px] font-medium text-[#1A1B23]">{p.local}</p>
                  <p className="text-[8px] text-[#8A8B95]">{p.data}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-semibold text-[#C77700]">{p.valor}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C77700]" />
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-4 mt-1">
            <div className="bg-[#5B2E8C] rounded-xl py-2.5 text-center">
              <p className="text-white text-[10px] font-semibold">Pagar tudo agora →</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 top-16 bg-white rounded-xl shadow-lg border border-[#ECECF1] px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 bg-[#D4F0E2] rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-3.5 w-3.5 text-[#0E8B5A]" />
        </div>
        <div>
          <p className="text-[9px] font-semibold text-[#1A1B23]">Pago via PIX</p>
          <p className="text-[8px] text-[#8A8B95]">agora mesmo</p>
        </div>
      </div>

      <div className="absolute -left-6 bottom-24 bg-white rounded-xl shadow-lg border border-[#ECECF1] px-3 py-2">
        <p className="text-[9px] font-semibold text-[#5B2E8C]">+2M passagens</p>
        <p className="text-[8px] text-[#8A8B95]">processadas</p>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function LandingBeneficios() {
  return (
    <div className="bg-white">

      {/* ── 1. Parceiros strip ─────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-[#1A1B23] py-4 overflow-hidden">
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .marquee-track {
            animation: marquee-scroll 28s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Label centralizado */}
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest text-center mb-3">
          Concessionárias parceiras
        </p>

        {/* Faixa com fade nas bordas */}
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="marquee-track flex items-center gap-x-6 whitespace-nowrap w-max">
            {/* primeira cópia */}
            {parceiros.map((p, i) => (
              <Fragment key={`a-${p.nome}`}>
                <span className={`text-sm leading-none select-none text-white/40 hover:text-white/70 transition-colors ${p.estilo}`}>
                  {p.nome}
                </span>
                <span aria-hidden="true" className="text-white/15 text-sm leading-none select-none">|</span>
              </Fragment>
            ))}
            {/* segunda cópia — loop seamless */}
            {parceiros.map((p, i) => (
              <Fragment key={`b-${p.nome}`}>
                <span className={`text-sm leading-none select-none text-white/40 hover:text-white/70 transition-colors ${p.estilo}`}>
                  {p.nome}
                </span>
                {i < parceiros.length - 1 && (
                  <span aria-hidden="true" className="text-white/15 text-sm leading-none select-none">|</span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Passo a passo (4 passos) + phone mockup ─────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F4EFFB] text-[#8B5FFF] border border-[#8B5FFF]/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Smartphone className="h-4 w-4" />
              Passo a passo
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1B23] mb-3 leading-tight">
              E como eu posso pagar o <span className="text-[#5B2E8C]">pedágio</span>?
            </h2>
            <p className="text-[#8A8B95] mb-8 leading-relaxed">
              Sem precisar ir a nenhuma praça ou concessionária. Resolva pelo celular ou computador em menos de 3 minutos.
            </p>

            <div className="space-y-6">
              {passosPagamento.map((p, i) => {
                const Icon = p.icone;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-[#5B2E8C] flex items-center justify-center shadow-sm">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {i < passosPagamento.length - 1 && (
                        <div className="w-px flex-1 mt-2 bg-gradient-to-b from-[#8B5FFF]/40 to-transparent min-h-[2rem]" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="text-[10px] font-bold text-[#8B5FFF] uppercase tracking-widest mb-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="font-semibold text-[#1A1B23] text-sm sm:text-base mb-1">{p.titulo}</h3>
                      <p className="text-xs sm:text-sm text-[#8A8B95] leading-relaxed">{p.descricao}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* ── 9. FAQ ──────────────────────────────────────────────────── */}
      <div className="bg-[#F7F5FB] border-y border-[#ECECF1]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F4EFFB] text-[#8B5FFF] border border-[#8B5FFF]/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                FAQ
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1B23] mb-4 leading-tight">
                Perguntas frequentes
              </h2>
              <p className="text-[#8A8B95] leading-relaxed mb-6">
                Tudo sobre pedágio Free Flow, PNU, RPV e pagamentos. Se não encontrar sua resposta aqui, fale com a gente.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-[#5B2E8C] font-semibold hover:text-[#8B5FFF] transition-colors text-sm">
                Ver todas as perguntas
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="divide-y divide-[#ECECF1] border border-[#ECECF1] rounded-2xl bg-white px-6">
              {faqItens.map((item, i) => (
                <FAQItem key={i} pergunta={item.pergunta} resposta={item.resposta} />
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
