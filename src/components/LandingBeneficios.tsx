import { useState } from "react";
import {
  Radio, CreditCard, ShieldCheck, Building2, Search, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Smartphone, Zap, MapPin, Users,
  ArrowRight, Star, Shield, Wifi
} from "lucide-react";

// ─── Dados ────────────────────────────────────────────────────────────────────

const parceiros = [
  { nome: "CCR",                estilo: "font-black tracking-tighter" },
  { nome: "Arteris",            estilo: "font-black tracking-tight" },
  { nome: "EcoRodovias",        estilo: "font-black tracking-tight" },
  { nome: "Autoban",            estilo: "font-bold tracking-wide" },
  { nome: "Ecovias",            estilo: "font-black tracking-tight" },
  { nome: "Rota das Bandeiras", estilo: "font-bold tracking-tight" },
  { nome: "Intervias",          estilo: "font-bold tracking-tight" },
  { nome: "Autopista",          estilo: "font-black tracking-widest" },
  { nome: "SPMAR",              estilo: "font-black tracking-widest" },
  { nome: "Concebra",           estilo: "font-bold tracking-tight" },
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

const beneficios = [
  {
    icone: Building2,
    cor: "text-[#5B2E8C]",
    bg: "bg-[#F4EFFB]",
    destaque: "SPMAR + Free Flow",
    titulo: "Praça ou pórtico — em um só lugar",
    descricao: "Consulte por placa e veja todas as suas passagens (SPMAR e Free Flow) num só lugar.",
  },
  {
    icone: AlertTriangle,
    cor: "text-[#C77700]",
    bg: "bg-[#FBE8C5]",
    destaque: "Multa de R$195,23",
    titulo: "Sem TAG, sem dinheiro? Sem multa.",
    descricao: "Regularize antes do prazo e evite a multa de evasão.",
  },
  {
    icone: CreditCard,
    cor: "text-[#0E8B5A]",
    bg: "bg-[#D4F0E2]",
    destaque: "PIX · ELO · Visa · Master",
    titulo: "Pague como preferir",
    descricao: "PIX instantâneo ou cartão de crédito (ELO, Visa, Mastercard).",
  },
  {
    icone: ShieldCheck,
    cor: "text-[#8B5FFF]",
    bg: "bg-[#F4EFFB]",
    destaque: "PCI DSS Level 1",
    titulo: "100% seguro e confiável",
    descricao: "Ambiente criptografado, conformidade PCI DSS e antifraude 24 horas.",
  },
];


const timelineFreeFlow = [
  {
    icone: Wifi,
    cor: "text-[#8B5FFF]",
    bg: "bg-[#F4EFFB]",
    titulo: "Tecnologia Avançada",
    descricao: "Pórticos com sensores ópticos, RFID e câmeras de reconhecimento de placa (OCR) identificam cada veículo em até 50ms.",
  },
  {
    icone: Radio,
    cor: "text-[#5B2E8C]",
    bg: "bg-[#EDE7F6]",
    titulo: "Passagem Fluida",
    descricao: "Sem redução de velocidade, sem cabine, sem fila. O veículo é identificado e a cobrança gerada automaticamente.",
  },
  {
    icone: Shield,
    cor: "text-[#0E8B5A]",
    bg: "bg-[#D4F0E2]",
    titulo: "Segurança Garantida",
    descricao: "Todos os dados são criptografados e o processo segue os padrões da ANTT, com imagem armazenada por 90 dias.",
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
      <div className="border-y border-[#ECECF1] bg-[#F7F5FB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
            <span className="flex-shrink-0 text-xs font-semibold text-[#8A8B95] uppercase tracking-widest sm:pr-6 sm:border-r sm:border-[#DCDDE3]">
              Concessionárias<br className="hidden sm:block" /> parceiras
            </span>
            <div className="flex items-center gap-x-6 gap-y-3 sm:pl-6 flex-wrap">
              {parceiros.map((p) => (
                <span
                  key={p.nome}
                  className={`text-sm leading-none select-none text-[#1A1B23] opacity-50 hover:opacity-80 transition-opacity ${p.estilo}`}
                >
                  {p.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Banner "1° portal integrado" ────────────────────────── */}
      <div className="bg-gradient-to-r from-[#2E1547] to-[#5B2E8C]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 rounded-full px-3 py-1 text-xs font-semibold mb-4 uppercase tracking-wide">
            <Star className="h-3.5 w-3.5 text-[#F4C97A]" fill="currentColor" />
            Lançamento
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl mx-auto">
            Você está no{" "}
            <span className="text-[#C9AEEA]">1° portal integrado</span>{" "}
            de pagamentos de pedágio das Rodovias do Brasil
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto text-sm sm:text-base">
            Pedágio Simples — by Move Mais. Uma plataforma única para consultar e quitar débitos de pedágio Free Flow em todas as concessionárias do país.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Sem mensalidade", "Pagamento imediato", "Controle total", "Comprovante incluso"].map((f) => (
              <span key={f} className="flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-3 py-1 text-xs font-medium">
                <CheckCircle className="h-3.5 w-3.5 text-[#C9AEEA]" />
                {f}
              </span>
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
              É como você pode pagar o{" "}
              <span className="text-[#5B2E8C]">pedágio Free Flow</span>
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

      {/* ── 4. Por que usar o Pedágio Simples? ─────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#5B2E8C]">
            Por que usar o Pedágio Simples?
          </h2>
          <p className="mt-3 text-[#8A8B95] max-w-lg mx-auto text-sm sm:text-base">
            A única plataforma pensada especificamente para quem não tem TAG e precisa regularizar passagens Free Flow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {beneficios.map((b, i) => {
            const Icon = b.icone;
            return (
              <div
                key={i}
                className="flex flex-col items-start p-5 rounded-xl border border-[#DCDDE3] bg-white hover:border-[#8B5FFF]/40 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${b.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${b.cor}`} />
                </div>
                <p className={`text-base font-bold mb-1 ${b.cor}`}>{b.destaque}</p>
                <h3 className="font-semibold text-[#5B2E8C] text-sm mb-1">{b.titulo}</h3>
                <p className="text-xs text-[#8A8B95] leading-relaxed">{b.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>

{/* ── 7. O que é Free Flow ────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#2E1547] to-[#5B2E8C] p-8 min-h-64">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-48 h-24 border-b-0 border-4 border-white/30 rounded-t-full flex items-end justify-center pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-20 bg-white/20 rounded" />
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <Radio className="h-5 w-5 text-[#C9AEEA]" />
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(n => (
                            <div key={n} className="w-0.5 rounded-full bg-[#8B5FFF] animate-pulse"
                              style={{ height: `${n * 8}px`, animationDelay: `${n * 0.2}s` }} />
                          ))}
                        </div>
                      </div>
                      <div className="w-1.5 h-20 bg-white/20 rounded" />
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0E8B5A] animate-pulse" />
                      <span className="text-white/80 text-xs font-mono">MOV·1234</span>
                      <span className="text-[#C9AEEA] text-xs">→</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { val: "50ms", label: "Leitura" },
                  { val: "99.9%", label: "Precisão" },
                  { val: "24/7", label: "Operação" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-white font-bold text-lg font-mono">{s.val}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-[#F4EFFB] text-[#8B5FFF] border border-[#8B5FFF]/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Radio className="h-4 w-4" />
              Entenda o sistema
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1B23] mb-4 leading-tight">
              O que é{" "}
              <span className="text-[#5B2E8C]">Free Flow?</span>
            </h2>
            <p className="text-[#8A8B95] leading-relaxed mb-4">
              Free Flow é o modelo de pedágio eletrônico sem praças de cobrança. Pórticos sobre a pista identificam automaticamente todos os veículos por câmeras OCR e leitores RFID, sem que nenhum veículo precise parar ou reduzir a velocidade.
            </p>
            <p className="text-[#8A8B95] leading-relaxed mb-6">
              Quem tem TAG, o valor é debitado automaticamente. Quem não tem, recebe uma PNU (Passagem por Não Usuário) que deve ser paga em até 30 dias — caso contrário, vira multa de evasão.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-[#5B2E8C] font-semibold hover:text-[#8B5FFF] transition-colors text-sm">
              Saiba mais sobre o Free Flow
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ── 8. Como funciona a Free Flow — timeline ─────────────────── */}
      <div className="bg-[#F7F5FB] border-y border-[#ECECF1]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#F4EFFB] text-[#8B5FFF] border border-[#8B5FFF]/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Radio className="h-4 w-4" />
              Tecnologia
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5B2E8C]">
              Como Funciona a Free Flow
            </h2>
            <p className="mt-3 text-[#8A8B95] max-w-lg mx-auto text-sm sm:text-base">
              Uma das infraestruturas mais avançadas do mundo para cobrança eletrônica de pedágio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {timelineFreeFlow.map((t, i) => {
              const Icon = t.icone;
              return (
                <div key={i} className="relative flex flex-col items-center text-center">
                  {i < timelineFreeFlow.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-[#8B5FFF]/40 to-[#5B2E8C]/20" />
                  )}
                  <div className={`w-14 h-14 rounded-2xl ${t.bg} flex items-center justify-center mb-4 relative z-10`}>
                    <Icon className={`h-6 w-6 ${t.cor}`} />
                  </div>
                  <h3 className="font-bold text-[#1A1B23] mb-2 text-sm sm:text-base">{t.titulo}</h3>
                  <p className="text-xs sm:text-sm text-[#8A8B95] leading-relaxed">{t.descricao}</p>
                </div>
              );
            })}
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

      {/* ── 11. CTA final ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1A1B23] via-[#2E1547] to-[#5B2E8C]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 rounded-full px-3 py-1 text-xs font-semibold mb-4 uppercase tracking-wide">
                <Zap className="h-3.5 w-3.5 text-[#F4C97A]" />
                Sem mensalidade
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Diga adeus às{" "}
                <span className="text-[#C9AEEA]">multas de evasão</span>{" "}
                de pedágio
              </h2>
              <p className="text-white/70 leading-relaxed mb-8 max-w-md">
                Consulte, pague e receba o comprovante RPV em minutos. Seu veículo regularizado, sem burocracia, sem fila e sem sair de casa.
              </p>

              {/* CTA primário único */}
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#5B2E8C] font-semibold rounded-xl px-8 py-4 hover:bg-[#F4EFFB] transition-colors text-base shadow-lg w-full sm:w-auto"
              >
                Consultar minha placa agora
                <ArrowRight className="h-4 w-4" />
              </a>

              {/* Link secundário discreto */}
              <p className="mt-4 text-white/50 text-sm">
                Ou{" "}
                <a href="#" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                  crie sua conta grátis e acompanhe todas as suas passagens em um só lugar →
                </a>
              </p>

              {/* Micro-copy de segurança */}
              <p className="mt-5 text-white/35 text-xs flex items-center gap-1.5">
                <span>🔒</span>
                Consulta gratuita · Sem cadastro · Dados protegidos por SSL 256-bit
              </p>
            </div>

            {/* Trust cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icone: ShieldCheck, titulo: "PCI DSS Compliant", sub: "Dados criptografados" },
                { icone: Zap, titulo: "Quitação imediata", sub: "Confirmação em tempo real" },
                { icone: Users, titulo: "+500k usuários", sub: "Conta ativa na plataforma" },
                { icone: MapPin, titulo: "+30 rodovias", sub: "SP, RJ, MG, PR e mais" },
              ].map((c, i) => {
                const Icon = c.icone;
                return (
                  <div key={i} className="bg-white/10 rounded-xl p-4">
                    <Icon className="h-5 w-5 text-[#C9AEEA] mb-2" />
                    <p className="text-white font-semibold text-sm">{c.titulo}</p>
                    <p className="text-white/60 text-xs mt-0.5">{c.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
