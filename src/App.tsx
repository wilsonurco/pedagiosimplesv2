import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { CheckCircle, Shield, Clock, CreditCard, Car, Phone, MapPin, ArrowRight, Zap, Heart, Menu, X, RefreshCw, Calendar, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
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
import LogoCinza from "./imports/LogoCinza";
import { LoginConcessionaria } from "./components/LoginConcessionaria";
import { DashboardConcessionaria } from "./components/DashboardConcessionaria";

type TelasApp = 'landing' | 'consulta' | 'resultados' | 'cadastro' | 'login' | 'recuperar-senha' | 'resumo-pedido' | 'pagamento' | 'pix-qrcode' | 'confirmacao' | 'dashboard' | 'faq' | 'login-concessionaria' | 'dashboard-concessionaria';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<TelasApp>('landing');
  const [dadosVeiculo, setDadosVeiculo] = useState<any>(null);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const [dadosPagamento, setDadosPagamento] = useState<any>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<boolean>(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false);
  const [debitosSelecionados, setDebitosSelecionados] = useState<any[]>([]);
  const [valorTotalSelecionado, setValorTotalSelecionado] = useState<number>(0);
  const [placaConsultada, setPlacaConsultada] = useState<string>(''); // Placa que foi consultada para passar ao cadastro
  const [dadosGestor, setDadosGestor] = useState<any>(null);

  // Estados do formulário da landing page
  const [placaValue, setPlacaValue] = useState('');
  const [placaError, setPlacaError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [mostrandoResultados, setMostrandoResultados] = useState(false);
  const [carregandoConsulta, setCarregandoConsulta] = useState(false);

  // Função para gerar código captcha aleatório
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaValue('');
    setCaptchaError('');
  };

  // Gerar captcha inicial ao carregar a página
  useEffect(() => {
    if (!captchaCode) {
      generateCaptcha();
    }
  }, [captchaCode]);

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
    // Verificar se são múltiplas placas (separadas por vírgula)
    const placas = placa.includes(',') ? placa.split(',') : [placa];
    
    // Simular débitos para cada placa
    const debitosSimulados = [];
    
    if (placas.length > 1) {
      // Múltiplos veículos - criar débitos apenas para ABC-1234 e XYZ-5678
      placas.forEach((p) => {
        const placaTrim = p.trim();
        
        if (placaTrim === 'ABC-1234') {
          // ABC-1234: 2 pendências de R$ 50,00 cada = R$ 100,00
          debitosSimulados.push({
            id: `abc-1`,
            praca: "Pedágio não identificado",
            valor: 50.00,
            data: "15/03/2026",
            hora: "14:30",
            placa: placaTrim
          });
          debitosSimulados.push({
            id: `abc-2`,
            praca: "Pedágio não identificado",
            valor: 50.00,
            data: "16/03/2026",
            hora: "15:30",
            placa: placaTrim
          });
        } else if (placaTrim === 'XYZ-5678') {
          // XYZ-5678: 1 pendência de R$ 50,00
          debitosSimulados.push({
            id: `xyz-1`,
            praca: "Pedágio não identificado",
            valor: 50.00,
            data: "17/03/2026",
            hora: "16:30",
            placa: placaTrim
          });
        }
        // DEF-9012 não tem pendências, então não adiciona nada
      });
    } else {
      // Um único veículo
      debitosSimulados.push({
        id: "1",
        praca: "Pedágio não identificado",
        valor: 89.40,
        data: "15/03/2026",
        hora: "14:30",
        placa: placa
      });
    }
    
    const valorTotal = debitosSimulados.reduce((acc, d) => acc + d.valor, 0);
    
    // Setar os débitos e valor total
    setDebitosSelecionados(debitosSimulados);
    setValorTotalSelecionado(valorTotal);
    
    // Ir direto para resumo do pedido
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
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setCaptchaValue('');
    setCaptchaError('');
    setCaptchaCode(''); // Isso vai triggerar o useEffect para gerar novo código
  };

  // Validação do captcha
  const isCaptchaValid = captchaValue.toLowerCase() === captchaCode.toLowerCase();
  
  // Validação da placa
  const placaValida = isPlacaCompleta(placaValue);
  
  // Lógica do formulário da landing page
  const isFormValid = placaValida && isCaptchaValid && captchaCode;
  
  const handleBuscarDebitos = () => {
    // Validar captcha primeiro
    if (!isCaptchaValid) {
      setCaptchaError('Código de verificação incorreto. Tente novamente.');
      setCaptchaCode(''); // Isso vai triggerar o useEffect para gerar novo código
      return;
    }

    // Limpar erro do captcha se válido
    setCaptchaError('');

    if (isFormValid) {
      setCarregandoConsulta(true);
      
      // Simular dados do veículo com base na placa digitada
      const dadosSimulados = {
        placa: placaValue,
        renavam: '12345678901',
        chassis: 'ABC1234567890DEFG',
        modelo: 'CIVIC SEDAN 2.0',
        marca: 'HONDA',
        ano: '2023/2024',
        cor: 'BRANCO'
      };
      
      // Simular delay da consulta
      setTimeout(() => {
        setDadosVeiculo(dadosSimulados);
        setCarregandoConsulta(false);
        setMostrandoResultados(true);
        setPlacaConsultada(placaValue); // Guardar a placa consultada
      }, 2000);
    }
  };

  const handleNovaConsulta = () => {
    setMostrandoResultados(false);
    setDadosVeiculo(null);
    setPlacaValue('');
    setPlacaError('');
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setCaptchaValue('');
    setCaptchaError('');
    setCaptchaCode(''); // Isso vai triggerar o useEffect para gerar novo código
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
          dadosVeiculo={dadosVeiculo}
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
          <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#003566] mx-auto mb-4" />
              <p className="text-[#6C757D]">Carregando dashboard...</p>
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
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-48 h-12 sm:w-64 sm:h-16">
              <LogoCinza />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <button
              onClick={() => setTelaAtual('faq')}
              className="text-[#6C757D] hover:text-[#003566] transition-colors text-sm font-medium whitespace-nowrap"
            >
              Perguntas frequentes
            </button>
            <button
              onClick={() => setTelaAtual('login-concessionaria')}
              className="text-[#6C757D] hover:text-[#003566] transition-colors text-sm font-medium whitespace-nowrap"
            >
              Acesso Concessionária
            </button>
            {usuarioLogado ? (
              <Button 
                onClick={handleIrParaDashboard}
                className="bg-[#003566] hover:bg-[#002a52] text-white px-4 xl:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Minha Conta
              </Button>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setTelaAtual('login')}
                  className="border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white px-4 xl:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Entrar
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuMobileAberto(!menuMobileAberto)}
            className="lg:hidden p-2 text-[#6C757D] hover:text-[#003566] transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${
                menuMobileAberto ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
              }`} />
              <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${
                menuMobileAberto ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              }`} />
            </div>
          </button>
        </div>
      </header>

      {/* Barra de Informação Importante */}
      <div className="bg-[#FFD60A] border-b border-[#e6c109]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#000000]">
            <div className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#000000] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#FFD60A] text-xs font-bold">!</span>
              </div>
              <span className="font-medium leading-tight">
                <strong>Importante:</strong> A quitação de seus débitos não exclui multas por evasão.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        menuMobileAberto ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            menuMobileAberto ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuMobileAberto(false)}
        ></div>
        
        {/* Menu Content */}
        <div className={`relative bg-white h-full w-80 max-w-[90vw] shadow-xl transform transition-transform duration-300 ease-out ${
          menuMobileAberto ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#F8F9FA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003566] rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-semibold text-[#003566]">Pedágio Simples</span>
              </div>
              <button
                onClick={() => setMenuMobileAberto(false)}
                className="p-2 text-[#6C757D] hover:text-[#003566] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className={`flex-1 p-6 space-y-6 transition-all duration-300 delay-150 ${
              menuMobileAberto ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <nav className="space-y-4">



                <button
                  className="block text-lg text-[#000000] hover:text-[#003566] transition-colors py-2 w-full text-left"
                  onClick={() => {
                    setMenuMobileAberto(false);
                    setTelaAtual('faq');
                  }}
                >
                  FAQ
                </button>
                <button
                  className="block text-lg text-[#000000] hover:text-[#003566] transition-colors py-2 w-full text-left"
                  onClick={() => {
                    setMenuMobileAberto(false);
                    setTelaAtual('login-concessionaria');
                  }}
                >
                  Acesso Concessionária
                </button>
              </nav>

              {/* Action Buttons */}
              <div className={`space-y-4 pt-6 border-t border-[#F8F9FA] transition-all duration-300 delay-200 ${
                menuMobileAberto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {usuarioLogado ? (
                  <Button 
                    onClick={() => {
                      setMenuMobileAberto(false);
                      handleIrParaDashboard();
                    }}
                    className="w-full bg-[#003566] hover:bg-[#002a52] text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    <Car className="h-5 w-5 mr-2" />
                    Minha Conta
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setMenuMobileAberto(false);
                        setTelaAtual('login');
                      }}
                      className="w-full border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Entrar
                    </Button>
                    <Button 
                      onClick={() => {
                        setMenuMobileAberto(false);
                        setTelaAtual('consulta');
                      }}
                      className="w-full bg-[#003566] hover:bg-[#002a52] text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Consultar débitos
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className={`p-6 border-t border-[#F8F9FA] bg-[#F8F9FA] transition-all duration-300 delay-300 ${
              menuMobileAberto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="text-center space-y-2">
                <p className="text-sm text-[#6C757D]">Suporte 24/7</p>
                <div className="flex items-center justify-center gap-2 text-[#00B4D8]">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">0800 123 4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-[#F8F9FA] to-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#003566] via-[#004080] to-[#00B4D8] z-0"></div>

          {/* Elementos decorativos */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-20 left-10 w-20 h-20 bg-[#00B4D8] opacity-10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FFD60A] opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-5 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-1/4 w-24 h-24 bg-[#00B4D8] opacity-8 rounded-full blur-2xl"></div>
            <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-[#FFD60A] opacity-5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 xl:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start max-w-7xl mx-auto">
            {/* Card Lateral - Lado Esquerdo */}
            <div className="lg:col-span-1 xl:col-span-5 flex justify-center lg:justify-start order-1">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <Card className="bg-white/95 border border-[#E0E0E0] shadow-xl rounded-xl overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    {!mostrandoResultados && !carregandoConsulta && (
                      <>
                        {/* Título Principal */}
                        <div className="mb-4 sm:mb-6 text-center">
                          <h3 className="text-lg sm:text-xl lg:text-2xl text-[#000000] leading-relaxed mb-2">
                            <strong className="text-[#003566]">Consulte suas pendências</strong> de pedágio
                            <br className="hidden sm:block" />
                            <span className="sm:hidden"> </span>e <strong className="text-[#003566]">pague com zero complicações</strong>.
                          </h3>
                          <div className="w-12 h-1 bg-[#00B4D8] rounded-full mx-auto"></div>
                        </div>

                        {/* Campo de Placa */}
                        <div className="mb-4 sm:mb-5">
                          <label className="block text-xs sm:text-sm font-medium text-[#003566] uppercase tracking-wide mb-2 text-center">
                            Digite sua placa
                          </label>
                          <input
                            type="text"
                            value={placaValue}
                            onChange={(e) => {
                              const valorFormatado = formatarPlacaInput(e.target.value);
                              setPlacaValue(valorFormatado);
                              
                              // Limpar erro ao digitar
                              setPlacaError('');
                              
                              // Se a placa está completa (7 caracteres sem hífen), validar
                              if (valorFormatado.replace(/-/g, '').length === 7) {
                                const resultado = validarPlaca(valorFormatado);
                                if (!resultado.isValid) {
                                  setPlacaError(resultado.error || 'Placa inválida');
                                }
                              }
                            }}
                            onBlur={() => {
                              // Validar quando o usuário sair do campo
                              if (placaValue.length > 0) {
                                const resultado = validarPlaca(placaValue);
                                if (!resultado.isValid) {
                                  setPlacaError(resultado.error || 'Placa inválida');
                                }
                              }
                            }}
                            placeholder="ABC-1234 ou ABC1D23"
                            className={`w-full h-12 sm:h-14 px-3 sm:px-4 bg-white border-2 rounded-xl text-[#000000] text-base sm:text-lg text-center font-semibold tracking-wider placeholder-[#6C757D] focus:outline-none transition-all duration-300 shadow-inner ${
                              placaError 
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50' 
                                : placaValida
                                  ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-green-50'
                                  : 'border-[#E0E0E0] focus:border-[#003566] focus:ring-2 focus:ring-[#003566]/20'
                            }`}
                            maxLength={8}
                          />
                          {placaError && (
                            <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                              <X className="w-4 h-4" />
                              {placaError}
                            </p>
                          )}
                          {placaValida && !placaError && placaValue.length > 0 && (
                            <p className="text-xs sm:text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {validarPlaca(placaValue).type === 'antiga' ? 'Placa antiga válida' : 'Placa Mercosul válida'}
                            </p>
                          )}
                        </div>

                        {/* Checkboxes de Termos */}
                        <div className="space-y-4 mb-4 sm:mb-6 bg-[#F8F9FA] p-3 rounded-lg border border-[#E0E0E0]">
                          <div className="text-xs sm:text-sm text-[#000000] leading-relaxed">
                            Ao consultar, você concorda com os{' '}
                            <a href="#" className="text-[#003566] underline font-medium hover:text-[#002a52] transition-colors">
                              Termos de Uso
                            </a>
                            {' '}e o{' '}
                            <a href="#" className="text-[#003566] underline font-medium hover:text-[#002a52] transition-colors">
                              Aviso de Privacidade
                            </a>
                            .
                          </div>
                        </div>

                        {/* Captcha */}
                        <div className="mb-4 sm:mb-6">
                          <label className="block text-xs sm:text-sm font-medium text-[#003566] uppercase tracking-wide mb-2 text-center">
                            Verificação de Segurança
                          </label>
                          <div className="bg-white border-2 border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
                            {/* Todos os elementos em uma linha */}
                            <div className="flex items-center">
                              {/* Código do captcha */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-center border-r-2 border-[#E0E0E0]">
                                <span className="text-base sm:text-lg font-bold text-[#003566] tracking-widest whitespace-nowrap">
                                  {captchaCode}
                                </span>
                              </div>
                              
                              {/* Campo de input */}
                              <input
                                type="text"
                                value={captchaValue}
                                onChange={(e) => {
                                  setCaptchaValue(e.target.value);
                                  setCaptchaError(''); // Limpar erro ao digitar
                                }}
                                placeholder="Digite o código"
                                className={`flex-1 h-12 sm:h-14 px-3 sm:px-4 text-sm focus:outline-none focus:bg-[#F8F9FA] transition-colors ${
                                  captchaError ? 'text-red-600 bg-red-50' : 'text-[#000000]'
                                }`}
                              />
                              
                              {/* Botão refresh */}
                              <button 
                                type="button"
                                onClick={() => setCaptchaCode('')}
                                className="w-12 sm:w-14 h-12 sm:h-14 bg-white border-l-2 border-[#E0E0E0] flex items-center justify-center text-[#003566] hover:bg-[#F8F9FA] transition-colors flex-shrink-0"
                                title="Gerar novo código">
                                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                          {captchaError && (
                            <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
                              <X className="w-4 h-4" />
                              {captchaError}
                            </p>
                          )}
                        </div>

                        {/* Botões */}
                        <div className="space-y-3 sm:space-y-4">
                          <Button 
                            onClick={handleBuscarDebitos}
                            disabled={!isFormValid}
                            className={`w-full h-12 sm:h-14 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 ${
                              isFormValid 
                                ? 'bg-gradient-to-r from-[#003566] to-[#004080] hover:from-[#002a52] hover:to-[#003566] text-white hover:shadow-xl' 
                                : 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
                            }`}
                          >
                            <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Buscar débitos
                          </Button>

                          <button 
                            onClick={() => setTelaAtual('login')}
                            className="w-full h-8 sm:h-10 text-[#6C757D] hover:text-[#003566] text-xs sm:text-sm font-medium transition-colors rounded-lg hover:bg-gray-50 text-center"
                          >
                            Entrar ou se cadastrar
                          </button>
                        </div>
                    </>
                  )}

                    {/* Estado de Carregamento */}
                    {carregandoConsulta && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="flex flex-col items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#003566] rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-[#003566]">
                              Consultando pendências...
                            </h3>
                            <p className="text-xs sm:text-sm text-[#6C757D] px-4">
                              Buscando débitos para a placa <strong>{placaValue}</strong>
                            </p>
                          </div>
                          <div className="w-full bg-[#F8F9FA] rounded-full h-2">
                            <div className="bg-gradient-to-r from-[#003566] to-[#00B4D8] h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resultados da Consulta */}
                    {mostrandoResultados && dadosVeiculo && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Header dos Resultados */}
                        <div className="pb-3 sm:pb-4 border-b border-[#E0E0E0]">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNovaConsulta}
                              className="border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white text-xs sm:text-sm"
                            >
                              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Nova consulta
                            </Button>
                            <div className="flex items-center gap-2 text-[#00B4D8]">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium">Consulta realizada</span>
                            </div>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-[#003566] text-center">
                            Resultados para placa {dadosVeiculo.placa}
                          </h3>
                        </div>

                        {/* Status das Pendências */}
                        <div className="bg-gradient-to-r from-[#E8F4FD] to-[#F0F9FF] border border-[#00B4D8] rounded-lg p-3 sm:p-4">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00B4D8] rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#003566] mb-1 text-sm sm:text-base">6 pendências encontradas</h4>
                              <p className="text-xs sm:text-sm text-[#6C757D] leading-tight">Para ver os detalhes, faça um cadastro rápido ou acesse sua conta.</p>
                            </div>
                          </div>
                        </div>

                        {/* Botão para Ver Detalhes */}
                        <Button 
                          onClick={() => {
                            // Simular dados para ir para pagamento
                            const debitosSimulados = [
                              { id: "1", praca: "Via Dutra - KM 142", valor: 8.90, data: "15/12/2024", hora: "14:30", placa: dadosVeiculo.placa },
                              { id: "2", praca: "Fernão Dias - KM 85", valor: 12.50, data: "22/12/2024", hora: "09:15", placa: dadosVeiculo.placa },
                              { id: "3", praca: "Anhanguera - KM 23", valor: 6.70, data: "28/12/2024", hora: "16:45", placa: dadosVeiculo.placa },
                              { id: "4", praca: "Imigrantes - KM 58", valor: 15.40, data: "02/01/2025", hora: "11:20", placa: "XYZ-9876" },
                              { id: "5", praca: "Bandeirantes - KM 72", valor: 9.80, data: "05/01/2025", hora: "18:10", placa: "XYZ-9876" },
                              { id: "6", praca: "Castello Branco - KM 34", valor: 7.20, data: "08/01/2025", hora: "13:45", placa: "DEF-5555" }
                            ];
                            handleIrParaPagamento(debitosSimulados, 60.50);
                          }}
                          className="w-full h-10 sm:h-12 bg-[#00B4D8] hover:bg-[#0099c7] text-white rounded-lg font-semibold text-sm sm:text-base"
                        >
                          Ver detalhes das pendências
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Conteúdo Principal - Lado Direito */}
            <div className="lg:col-span-1 xl:col-span-6 xl:col-start-7 space-y-6 sm:space-y-8 order-2">
              {/* Headline */}
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="block text-white">Pendências de pedágio</span>
                  <span className="block text-[#00B4D8] relative">
                    resolvidas em minutos
                    <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-16 sm:w-20 h-1 bg-[#FFD60A] rounded-full"></div>
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed max-w-2xl lg:max-w-lg">
                  A única plataforma que <strong className="text-[#FFD60A]">garante</strong> a 
                  quitação de suas pendências de pedágio em <strong className="text-[#00B4D8]">tempo real</strong>, 
                  sem burocracia e com <strong className="text-[#FFD60A]">zero complicações</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigateToFAQ={() => setTelaAtual('faq')} />
      </div>
    </>
  );
}