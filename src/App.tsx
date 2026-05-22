import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { AnimatedHero } from "./components/ui/animated-hero-section-1";
import { CheckCircle, Car, X, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';
import { ConsultaDebitos } from "./components/ConsultaDebitos";
import { ResultadosDebitos } from "./components/ResultadosDebitos";
import { CadastroUsuario } from "./components/CadastroUsuario";
import { LoginUsuario } from "./components/LoginUsuario";
import { ResumoPedido } from "./components/ResumoPedido";
import { FormaPagamento } from "./components/FormaPagamento";
import { ConfirmacaoPagamento } from "./components/ConfirmacaoPagamento";
import { DashboardUsuario } from "./components/DashboardUsuario";
import { RecuperarSenha } from "./components/RecuperarSenha";
import { FAQ } from "./components/FAQ";
import { PIXQRCode } from "./components/PIXQRCode";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { validarPlaca, formatarPlacaInput, isPlacaCompleta } from "./utils/placaValidation";
import { gerarDebitos, agregarPorTipo, type Passagem } from "./utils/simulator";
import LogoCinza from "./imports/LogoCinza";
import { LoginConcessionaria } from "./components/LoginConcessionaria";
import { DashboardConcessionaria } from "./components/DashboardConcessionaria";
import { PartnerCarousel } from "./components/PartnerCarousel";
import { LandingBeneficios } from "./components/LandingBeneficios";

type TelasApp = 'landing' | 'consulta' | 'resultados' | 'cadastro' | 'login' | 'recuperar-senha' | 'resumo-pedido' | 'pagamento' | 'pix-qrcode' | 'confirmacao' | 'dashboard' | 'faq' | 'login-concessionaria' | 'dashboard-concessionaria';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<TelasApp>('landing');
  const [dadosVeiculo, setDadosVeiculo] = useState<any>(null);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [dadosPagamento, setDadosPagamento] = useState<any>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<boolean>(false);
  const [debitosSelecionados, setDebitosSelecionados] = useState<any[]>([]);
  const [valorTotalSelecionado, setValorTotalSelecionado] = useState<number>(0);
  const [placaConsultada, setPlacaConsultada] = useState<string>(''); // Placa que foi consultada para passar ao cadastro
  const [dadosGestor, setDadosGestor] = useState<any>(null);

  // Estados do formulário da landing page
  const [placaValue, setPlacaValue] = useState('');
  const [placaError, setPlacaError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [mostrandoResultados, setMostrandoResultados] = useState(false);
  const [carregandoConsulta, setCarregandoConsulta] = useState(false);

  const handleConsultar = (dados: any) => {
    setDadosVeiculo(dados);
    setTelaAtual('resultados');
  };

  const handleIrParaPagamento = (debitos: any[], valorTotal: number) => {
    setDebitosSelecionados(debitos);
    setValorTotalSelecionado(valorTotal);
    // Se o usuário já está logado, vai direto para resumo do pedido
    // Se não está logado, vai para cadastro
    setTelaAtual(usuarioLogado ? 'resumo-pedido' : 'cadastro');
  };

  const handleCadastroCompleto = (dados: any) => {
    setDadosUsuario(dados);
    setUsuarioLogado(true);
    // Se há débitos selecionados, ir direto para resumo do pedido
    if (debitosSelecionados.length > 0 && valorTotalSelecionado > 0) {
      setTelaAtual('resumo-pedido');
    } else {
      // Caso contrário, simular consulta com a placa cadastrada
      const placa = dados.placa || placaConsultada;
      if (placa) {
        const dadosSimulados = {
          placa: placa,
          renavam: '12345678901',
          chassis: 'ABC1234567890DEFG',
          modelo: 'CIVIC SEDAN 2.0',
          marca: 'HONDA',
          ano: '2023/2024',
          cor: 'BRANCO'
        };
        setDadosVeiculo(dadosSimulados);
        setPlacaConsultada(placa);
        setPlacaValue(placa);
        setMostrandoResultados(true);
        setTelaAtual('landing');
        setTimeout(() => {
          const resultsSection = document.getElementById('resultados-section');
          if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        setTelaAtual('dashboard');
      }
    }
  };

  const handleLogin = (dados: any) => {
    setDadosUsuario(dados);
    setUsuarioLogado(true);
    setTelaAtual('dashboard');
  };

  const handlePagamentoCompleto = (dados: any) => {
    setDadosPagamento(dados);
    setTelaAtual('confirmacao');
  };

  const handleIrParaDashboard = () => {
    setTelaAtual('dashboard');
  };

  const handleIrParaConsulta = (placa: string) => {
    // Voltar para landing com a placa pré-preenchida
    setPlacaValue(placa);
    setTelaAtual('landing');
    setMostrandoResultados(false);
    setDadosVeiculo(null);
    // Rolar para o topo da página
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleIrParaPagamentoDireto = (placa: string) => {
    const placas = placa.includes(',') ? placa.split(',').map(p => p.trim()) : [placa];
    const todasPassagens: Passagem[] = placas.flatMap(p => gerarDebitos(p));
    const valorTotal = todasPassagens.reduce((acc, d) => acc + d.valor, 0);
    setDebitosSelecionados(todasPassagens);
    setValorTotalSelecionado(valorTotal);
    setTelaAtual('resumo-pedido');
  };

  const handleIrParaCheckout = (debitos: any[], valorTotal: number) => {
    setDebitosSelecionados(debitos);
    setValorTotalSelecionado(valorTotal);
    setTelaAtual('pagamento');
  };

  const handleIrParaPIX = (debitos: any[], valorTotal: number) => {
    setDebitosSelecionados(debitos);
    setValorTotalSelecionado(valorTotal);
    setTelaAtual('pix-qrcode');
  };

  const handleLogout = () => {
    setUsuarioLogado(false);
    setDadosUsuario(null);
    setDadosPagamento(null);
    setDadosVeiculo(null);
    setTelaAtual('landing');
  };

  const handleLoginGestor = (dados: any) => {
    setDadosGestor(dados);
    setTelaAtual('dashboard-concessionaria');
  };

  const handleLogoutGestor = () => {
    setDadosGestor(null);
    setTelaAtual('landing');
  };

  const handleVoltarParaLanding = () => {
    setTelaAtual('landing');
    setDadosVeiculo(null);
    setDadosUsuario(null);
    setDadosPagamento(null);
    setDebitosSelecionados([]);
    setValorTotalSelecionado(0);
    setMostrandoResultados(false);
    setCarregandoConsulta(false);
    // Resetar formulário da landing
    setPlacaValue('');
    setPlacaError('');
    setTurnstileToken(null);
    setTurnstileKey(k => k + 1);
  };

  // Validação da placa
  const placaValida = isPlacaCompleta(placaValue);

  // Lógica do formulário da landing page
  const isFormValid = placaValida && !!turnstileToken;

  const handleBuscarDebitos = () => {
    if (!isFormValid) return;

    setCarregandoConsulta(true);

    const dadosSimulados = {
      placa: placaValue,
      renavam: '12345678901',
      chassis: 'ABC1234567890DEFG',
      modelo: 'CIVIC SEDAN 2.0',
      marca: 'HONDA',
      ano: '2023/2024',
      cor: 'BRANCO'
    };

    setTimeout(() => {
      setDadosVeiculo(dadosSimulados);
      setCarregandoConsulta(false);
      setMostrandoResultados(true);
      setPlacaConsultada(placaValue);
    }, 2000);
  };

  const handleNovaConsulta = () => {
    setMostrandoResultados(false);
    setDadosVeiculo(null);
    setPlacaValue('');
    setPlacaError('');
    setTurnstileToken(null);
    setTurnstileKey(k => k + 1);
  };

  // Renderizar a tela baseada no estado atual
  if (telaAtual === 'consulta') {
    return (
      <>
        <Toaster />
        <ConsultaDebitos
          onBack={() => setTelaAtual('landing')}
          onConsultar={handleConsultar}
        />
      </>
    );
  }

  if (telaAtual === 'resultados') {
    return (
      <>
        <Toaster />
        <ResultadosDebitos
          onBack={() => setTelaAtual('consulta')}
          onPagar={handleIrParaPagamento}
          onCadastrar={() => {
            setPlacaConsultada(dadosVeiculo?.placa || '');
            setTelaAtual('cadastro');
          }}
          onLogin={() => setTelaAtual('login')}
          dadosVeiculo={dadosVeiculo}
          isAuthenticated={usuarioLogado}
        />
      </>
    );
  }

  if (telaAtual === 'cadastro') {
    return (
      <>
        <Toaster />
        <CadastroUsuario
          onBack={() => setTelaAtual('resultados')}
          onCadastrar={handleCadastroCompleto}
          onLogin={() => setTelaAtual('login')}
          placaConsultada={placaConsultada} // Passar a placa consultada para o cadastro
        />
      </>
    );
  }

  if (telaAtual === 'login') {
    return (
      <>
        <Toaster />
        <LoginUsuario
          onBack={() => setTelaAtual('landing')}
          onLogin={handleLogin}
          onCadastrar={() => setTelaAtual('cadastro')}
          onRecuperarSenha={() => setTelaAtual('recuperar-senha')}
        />
      </>
    );
  }

  if (telaAtual === 'recuperar-senha') {
    return (
      <>
        <Toaster />
        <RecuperarSenha
          onBack={() => setTelaAtual('login')}
          onLogin={() => setTelaAtual('login')}
        />
      </>
    );
  }

  if (telaAtual === 'resumo-pedido') {
    return (
      <>
        <Toaster />
        <ResumoPedido
          onBack={() => setTelaAtual(usuarioLogado ? 'dashboard' : 'resultados')}
          onProsseguir={handleIrParaCheckout}
          valorTotal={valorTotalSelecionado}
          debitosSelecionados={debitosSelecionados}
        />
      </>
    );
  }

  if (telaAtual === 'pagamento') {
    return (
      <>
        <Toaster />
        <FormaPagamento
          onBack={() => setTelaAtual('resumo-pedido')}
          onPagar={handlePagamentoCompleto}
          onPIX={handleIrParaPIX}
          valorTotal={valorTotalSelecionado}
          debitosSelecionados={debitosSelecionados}
        />
      </>
    );
  }

  if (telaAtual === 'pix-qrcode') {
    return (
      <>
        <Toaster />
        <PIXQRCode
          onBack={() => setTelaAtual('pagamento')}
          onPagamentoConfirmado={handlePagamentoCompleto}
          valorTotal={valorTotalSelecionado}
          debitosSelecionados={debitosSelecionados}
        />
      </>
    );
  }

  if (telaAtual === 'confirmacao') {
    return (
      <>
        <Toaster />
        <ConfirmacaoPagamento
          onVoltar={handleVoltarParaLanding}
          onIrParaDashboard={handleIrParaDashboard}
          dadosPagamento={dadosPagamento}
          usuarioLogado={usuarioLogado}
        />
      </>
    );
  }

  if (telaAtual === 'dashboard') {
    // Se não tem dados do usuário mas está tentando ir para dashboard, mostrar loading
    if (!dadosUsuario && usuarioLogado) {
      return (
        <>
          <Toaster />
          <div className="min-h-screen bg-[#F7F5FB] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#5B2E8C] mx-auto mb-4" />
              <p className="text-[#8A8B95]">Carregando dashboard...</p>
            </div>
          </div>
        </>
      );
    }
    
    return (
      <>
        <Toaster />
        <DashboardUsuario
          onLogout={handleLogout}
          onIrParaPagamento={handleIrParaPagamento}
          onIrParaCheckout={handleIrParaCheckout}
          onIrParaConsulta={handleIrParaConsulta}
          onIrParaPagamentoDireto={handleIrParaPagamentoDireto}
          dadosUsuario={dadosUsuario}
        />
      </>
    );
  }

  if (telaAtual === 'faq') {
    return (
      <>
        <Toaster />
        <FAQ
          onBack={() => setTelaAtual('landing')}
        />
      </>
    );
  }

  if (telaAtual === 'login-concessionaria') {
    return (
      <>
        <Toaster />
        <LoginConcessionaria
          onLogin={handleLoginGestor}
          onVoltar={() => setTelaAtual('landing')}
        />
      </>
    );
  }

  if (telaAtual === 'dashboard-concessionaria') {
    return (
      <>
        <Toaster />
        <DashboardConcessionaria
          dadosGestor={dadosGestor}
          onLogout={handleLogoutGestor}
        />
      </>
    );
  }

  // Landing Page (tela padrão)
  const formCard = (
    <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
      <Card className="bg-white/95 border border-[#DCDDE3] shadow-xl rounded-xl overflow-hidden backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          {!mostrandoResultados && (
            <>
<div className="mb-4 sm:mb-6 text-center">
                <div className="inline-flex items-center gap-1.5 bg-[#FBE8C5] text-[#9A5B00] border border-[#F4C97A] rounded-full px-3 py-1 text-xs font-semibold mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C77700] animate-pulse" />
                  Consulta gratuita
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl text-[#1A1B23] leading-relaxed mb-2">
                  <strong className="text-[#5B2E8C]">Verifique suas passagens</strong>{" "}
                  em <strong className="text-[#5B2E8C]">praças SPMAR e pórticos Free Flow</strong>.
                </h3>
                <div className="w-12 h-1 bg-[#8B5FFF] rounded-full mx-auto" />
              </div>

              <div className="mb-4 sm:mb-5">
                <label htmlFor="hero-placa" className="block text-xs sm:text-sm font-medium text-[#5B2E8C] uppercase tracking-wide mb-2 text-center">
                  Placa do veículo
                </label>
                <input
                  id="hero-placa"
                  type="text"
                  value={placaValue}
                  onChange={(e) => {
                    const valorFormatado = formatarPlacaInput(e.target.value);
                    setPlacaValue(valorFormatado);
                    setPlacaError('');
                    if (valorFormatado.replace(/-/g, '').length === 7) {
                      const resultado = validarPlaca(valorFormatado);
                      if (!resultado.isValid) setPlacaError(resultado.error || 'Placa inválida');
                    }
                  }}
                  onBlur={() => {
                    if (placaValue.length > 0) {
                      const resultado = validarPlaca(placaValue);
                      if (!resultado.isValid) setPlacaError(resultado.error || 'Placa inválida');
                    }
                  }}
                  placeholder="ABC-1234 ou ABC1D23"
                  className={`w-full h-12 sm:h-14 px-3 sm:px-4 bg-white border-2 rounded-xl text-[#1A1B23] text-base sm:text-lg text-center font-mono font-semibold tracking-[0.05em] uppercase placeholder-[#8A8B95] focus:outline-none transition-all duration-300 shadow-inner ${
                    placaError
                      ? 'border-[#C8324A] focus:border-[#C8324A] focus:ring-2 focus:ring-red-500/20 bg-[#F8D7DD]'
                      : placaValida
                        ? 'border-[#0E8B5A] focus:border-[#0E8B5A] focus:ring-2 focus:ring-green-500/20 bg-[#D4F0E2]'
                        : 'border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-2 focus:ring-[#5B2E8C]/20'
                  }`}
                  maxLength={8}
                />
                {placaError && (
                  <p className="text-xs sm:text-sm text-[#C8324A] mt-2 flex items-center justify-center gap-1">
                    <X className="w-4 h-4" />{placaError}
                  </p>
                )}
                {placaValida && !placaError && placaValue.length > 0 && (
                  <p className="text-xs sm:text-sm text-[#0E8B5A] mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {validarPlaca(placaValue).type === 'antiga' ? 'Placa antiga válida' : 'Placa Mercosul válida'}
                  </p>
                )}
              </div>

              <div className="mb-4 sm:mb-5">
                <div className="text-xs sm:text-sm text-[#8A8B95] leading-relaxed text-center">
                  Ao consultar, você concorda com os{' '}
                  <a href="#" className="text-[#5B2E8C] underline font-medium hover:text-[#8B5FFF] transition-colors">Termos de Uso</a>
                  {' '}e o{' '}
                  <a href="#" className="text-[#5B2E8C] underline font-medium hover:text-[#8B5FFF] transition-colors">Aviso de Privacidade</a>.
                </div>
              </div>

              <div className="mb-4 sm:mb-6 flex justify-center">
                <Turnstile
                  key={turnstileKey}
                  siteKey="1x00000000000000000000AA"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  options={{ theme: 'light', language: 'pt-BR' }}
                />
              </div>

              {/* #9 — Botão com loading inline */}
              <div className="space-y-3 sm:space-y-4">
                <Button
                  onClick={handleBuscarDebitos}
                  disabled={!isFormValid || carregandoConsulta}
                  className={`w-full h-12 sm:h-14 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 ${
                    isFormValid && !carregandoConsulta
                      ? 'bg-gradient-to-r from-[#5B2E8C] to-[#2E1547] hover:from-[#8B5FFF] hover:to-[#5B2E8C] text-white hover:shadow-xl'
                      : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                  }`}
                >
                  {carregandoConsulta ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2 flex-shrink-0" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Consultar passagens
                    </>
                  )}
                </Button>

                {/* #2 — Login como link de texto discreto */}
                {!carregandoConsulta && (
                  <p className="text-center text-xs text-[#8A8B95]">
                    Já tem conta?{" "}
                    <button
                      onClick={() => setTelaAtual('login')}
                      className="text-[#5B2E8C] hover:text-[#8B5FFF] font-medium underline underline-offset-2 transition-colors"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            </>
          )}

          {mostrandoResultados && dadosVeiculo && (
            <div className="space-y-4 sm:space-y-6">
              <div className="pb-3 sm:pb-4 border-b border-[#DCDDE3]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNovaConsulta}
                    className="border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Nova consulta
                  </Button>
                  <div className="flex items-center gap-2 text-[#8B5FFF]">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Consulta realizada</span>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#5B2E8C] text-center">
                  Resultados para placa {dadosVeiculo.placa}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-[#F4EFFB] to-[#F4EFFB] border border-[#8B5FFF] rounded-lg p-3 sm:p-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8B5FFF] rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const r = agregarPorTipo(gerarDebitos(dadosVeiculo.placa));
                      return (
                        <h4 className="font-semibold text-[#5B2E8C] mb-1 text-sm sm:text-base">
                          {r.countPraca > 0 && `${r.countPraca} praça${r.countPraca > 1 ? 's' : ''}`}
                          {r.countPraca > 0 && r.countPortico > 0 && ' e '}
                          {r.countPortico > 0 && `${r.countPortico} pórtico${r.countPortico > 1 ? 's' : ''}`}
                          {r.countTotal === 0 && 'Nenhuma passagem em aberto'}
                          {r.countTotal > 0 && ' encontrad' + (r.countTotal > 1 ? 'os' : 'o')}
                        </h4>
                      );
                    })()}
                    <p className="text-xs sm:text-sm text-[#8A8B95] leading-tight">Faça um cadastro rápido para ver os detalhes e pagar antes do prazo.</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  const passagens = gerarDebitos(dadosVeiculo.placa);
                  const total = passagens.reduce((s, p) => s + p.valor, 0);
                  handleIrParaPagamento(passagens, total);
                }}
                className="w-full h-10 sm:h-12 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white rounded-lg font-semibold text-sm sm:text-base"
              >
                Ver passagens e pagar agora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Toaster />
      <AnimatedHero
        backgroundVideoUrl="/hero.mp4"
        logo={
          <div className="w-44 h-10 brightness-0 invert">
            <LogoCinza />
          </div>
        }
        navLinks={[]}
        topRightAction={
          usuarioLogado ? (
            <Button
              onClick={handleIrParaDashboard}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              Minha Conta
            </Button>
          ) : (
            <Button
              onClick={() => setTelaAtual('login')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              Entrar
            </Button>
          )
        }
        title={
          <>
            Pendências de pedágio{" "}
            <span className="text-[#8B5FFF]">resolvidas em minutos</span>
          </>
        }
        description={
          <>
            A única plataforma que{" "}
            <strong className="text-[#F4C97A]">garante</strong>{" "}
            a quitação de suas pendências de pedágio em{" "}
            <strong className="text-[#8B5FFF]">tempo real</strong>
            , sem burocracia e com{" "}
            <strong className="text-[#F4C97A]">zero complicações</strong>.
          </>
        }
        rightContent={formCard}
        notice={null}
      />
      <LandingBeneficios />
      <PartnerCarousel />
      <Footer
        onNavigateToFAQ={() => setTelaAtual('faq')}
        onAcessoConcessionaria={() => setTelaAtual('login-concessionaria')}
      />

      {/* #8 — Botão flutuante de suporte */}
      <a
        href="#"
        aria-label="Suporte via WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-0 bg-[#25D366] text-white rounded-full shadow-lg px-3.5 py-3.5 hover:gap-2 transition-all duration-200 group overflow-hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-5 h-5 flex-shrink-0 fill-white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[10rem] transition-all duration-200 whitespace-nowrap text-sm font-medium pl-0 group-hover:pl-1">
          Precisa de ajuda?
        </span>
      </a>
    </>
  );
}