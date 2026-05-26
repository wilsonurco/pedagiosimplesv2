import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import {
  User,
  Car,
  History,
  LogOut,
  CheckCircle,
  Bell,
  Gift,
  Info,
  AlertTriangle,
  CreditCard,
  Plus,
  Minus,
  Filter,
  XCircle,
  Loader2,
  X,
  MapPin,
  Calendar,
  ArrowRight,
  Shield,
  ChevronDown,
  ChevronUp,
  Building2,
  Radio,
  Wallet
} from "lucide-react";

import logoPedagioSimples from "../assets/logo-pedagio-simples.svg";
import { HistoricoPagamentos } from "./HistoricoPagamentos";
import { VeiculosCadastrados } from "./VeiculosCadastrados";
import { ConfiguracoesConta } from "./ConfiguracoesConta";
import { TotalPago } from "./TotalPago";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { gerarDebitos, agregarPorTipo, proximoVencimento, filtrarPorTipo, filtrarPorStatus, type Passagem } from '../utils/simulator';
import { TipoPassagemBadge } from './ui/tipo-passagem-badge';
import { FooterLogado } from './FooterLogado';

interface DashboardUsuarioProps {
  onLogout: () => void;
  onIrParaPagamento?: (debitos: any[], valorTotal: number) => void;
  onIrParaCheckout?: (debitos: any[], valorTotal: number) => void;
  onIrParaConsulta?: (placa: string) => void;
  onIrParaPagamentoDireto?: (placa: string) => void;
  dadosUsuario: any;
}



export function DashboardUsuario({ onLogout, onIrParaPagamento, onIrParaCheckout, onIrParaConsulta, onIrParaPagamentoDireto, dadosUsuario }: DashboardUsuarioProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('home');
    
    // Garantir que sempre temos dados do usuário, mesmo que básicos
    const usuario = dadosUsuario || {
      nome: 'Usuário',
      email: 'usuario@exemplo.com'
    };
  
  // Estados para funcionalidade de pagamento (ResumoPedido)
  const [mostrandoFormularioNovaPlaca, setMostrandoFormularioNovaPlaca] = useState(false);
  const [novaPlaca, setNovaPlaca] = useState('');
  const [consultandoNovaPlaca, setConsultandoNovaPlaca] = useState(false);
  const [resultadoConsultaNovaPlaca, setResultadoConsultaNovaPlaca] = useState<any>(null);
  const [filtroPlaca, setFiltroPlaca] = useState<string[]>(['todas']);
  const [debitosSelecionadosResumo, setDebitosSelecionadosResumo] = useState<string[]>([]);
  const [filtroExpandido, setFiltroExpandido] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'praca_fisica' | 'portico_free_flow'>('todas')
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'em_prazo' | 'risco_multa'>('todas')
  const [modalConfirmacaoPlacaAberto, setModalConfirmacaoPlacaAberto] = useState(false);
  const [placasUsuario, setPlacasUsuario] = useState<string[]>(['MOV-1234']); // Placa do usuário logado
  
  // Estados para notificações
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [atividadeAberta, setAtividadeAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState([
    {
      id: '1',
      tipo: 'pagamento',
      titulo: 'Pagamento processado com sucesso',
      mensagem: 'Seu pagamento de R$ 21,40 foi processado. Placa MOV-1234.',
      data: '2 horas atrás',
      lida: false,
      icone: CheckCircle,
      cor: 'text-[#0E8B5A]'
    },
    {
      id: '2',
      tipo: 'alerta',
      titulo: 'Nova pendência encontrada',
      mensagem: 'Encontramos uma nova pendência para o veículo MOV-1234.',
      data: '1 dia atrás',
      lida: false,
      icone: AlertTriangle,
      cor: 'text-[#C77700]'
    },
    {
      id: '3',
      tipo: 'promocao',
      titulo: 'Oferta especial para você!',
      mensagem: '20% de desconto no pagamento de múltiplas pendências.',
      data: '2 dias atrás',
      lida: true,
      icone: Gift,
      cor: 'text-purple-600'
    },
    {
      id: '4',
      tipo: 'info',
      titulo: 'Sistema de pagamento atualizado',
      mensagem: 'Melhoramos nossa interface para oferecer uma experiência ainda melhor.',
      data: '3 dias atrás',
      lida: true,
      icone: Info,
      cor: 'text-[#5B2E8C]'
    }
  ]);

  // KPIs consolidados via simulator
  const passagensTodas: Passagem[] = placasUsuario.flatMap(p => gerarDebitos(p))
  const agg = agregarPorTipo(passagensTodas)
  const proximo = proximoVencimento(passagensTodas)

  // Lista filtrada e ordenada por prazo (para a seção "Passagens a pagar")
  const pendentesFiltradas = (() => {
    let r = passagensTodas
    if (filtroTipo !== 'todas') r = filtrarPorTipo(r, filtroTipo)
    if (filtroStatus !== 'todas') r = filtrarPorStatus(r, filtroStatus)
    return [...r].sort((a, b) => {
      const [da, ma, ya] = a.prazoLimite.split('/').map(Number)
      const [db, mb, yb] = b.prazoLimite.split('/').map(Number)
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
    })
  })()

  // Funções para o ResumoPedido
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const placasUnicas = [...new Set(passagensTodas.map(d => d.placa))];

  // Selecionar todas as pendências por padrão ao carregar
  useEffect(() => {
    if (passagensTodas.length > 0 && debitosSelecionadosResumo.length === 0) {
      setDebitosSelecionadosResumo(passagensTodas.map(d => d.id));
    }
  }, [passagensTodas.length]);

  // Atualizar seleção quando filtros de tipo/status mudarem
  useEffect(() => {
    if (pendentesFiltradas.length > 0) {
      const debitosVisiveis = pendentesFiltradas.map(d => d.id);
      const selecaoAtualizada = debitosSelecionadosResumo.filter(id => debitosVisiveis.includes(id));
      if (selecaoAtualizada.length === 0) {
        setDebitosSelecionadosResumo(debitosVisiveis);
      } else if (selecaoAtualizada.length !== debitosSelecionadosResumo.length) {
        setDebitosSelecionadosResumo(selecaoAtualizada);
      }
    }
  }, [filtroTipo, filtroStatus, filtroPlaca.join(',')]);

  const todosSelecionados = pendentesFiltradas.length > 0 && pendentesFiltradas.every(debito => debitosSelecionadosResumo.includes(debito.id));

  const toggleDebitoSelecionado = (debitoId: string) => {
    setDebitosSelecionadosResumo(prev =>
      prev.includes(debitoId)
        ? prev.filter(id => id !== debitoId)
        : [...prev, debitoId]
    );
  };

  const selecionarTodos = () => {
    setDebitosSelecionadosResumo(pendentesFiltradas.map(d => d.id));
  };

  const desselecionarTodos = () => {
    setDebitosSelecionadosResumo([]);
  };

  const calcularValorTotal = () => {
    return passagensTodas
      .filter(debito => debitosSelecionadosResumo.includes(debito.id))
      .reduce((acc, debito) => acc + debito.valor, 0);
  };

  const buscarDebitosNovaPlaca = async () => {
    setConsultandoNovaPlaca(true);
    
    // Simular API call
    setTimeout(() => {
      // Simular resultado aleatório
      const temDebitos = Math.random() > 0.3;
      
      if (temDebitos) {
        const novaQuantidade = Math.floor(Math.random() * 4) + 1;
        const novoValorTotal = Math.random() * 50 + 10;
        
        setResultadoConsultaNovaPlaca({
          success: true,
          quantidade: novaQuantidade,
          valorTotal: novoValorTotal
        });
      } else {
        setResultadoConsultaNovaPlaca({
          success: false
        });
      }
      
      setConsultandoNovaPlaca(false);
    }, 2000);
  };

  const adicionarDebitosNovaPlaca = () => {
    if (resultadoConsultaNovaPlaca?.success) {
      // Verificar se a placa já está cadastrada
      const placaJaCadastrada = placasUsuario.includes(novaPlaca);
      
      if (placaJaCadastrada) {
        // Placa já cadastrada - informar e adicionar débitos
        toast.success('Placa já cadastrada', {
          description: `A placa ${novaPlaca} já está cadastrada em sua conta. Os débitos foram adicionados ao pagamento.`,
          duration: 4000,
        });
        
        // Adicionar débitos ao pagamento
        setMostrandoFormularioNovaPlaca(false);
        setNovaPlaca('');
        setResultadoConsultaNovaPlaca(null);
      } else {
        // Placa não cadastrada - abrir modal de confirmação
        setModalConfirmacaoPlacaAberto(true);
      }
    }
  };

  const confirmarCadastroEAdicionar = () => {
    // Adicionar a placa à lista de placas cadastradas
    setPlacasUsuario(prev => [...prev, novaPlaca]);
    
    // Mostrar toast de sucesso
    toast.success('Placa cadastrada com sucesso!', {
      description: `A placa ${novaPlaca} foi adicionada ao seu cadastro e os débitos foram incluídos no pagamento.`,
      duration: 4000,
    });
    
    // Fechar modal e limpar formulário
    setModalConfirmacaoPlacaAberto(false);
    setMostrandoFormularioNovaPlaca(false);
    setNovaPlaca('');
    setResultadoConsultaNovaPlaca(null);
  };

  const handleProsseguir = () => {
    const debitosSelecionados = passagensTodas.filter(debito => debitosSelecionadosResumo.includes(debito.id));
    const valorTotal = calcularValorTotal();
    
    if (onIrParaCheckout) {
      onIrParaCheckout(debitosSelecionados, valorTotal);
    }
  };

  const formatPassagemId = (id: string): string => {
    let h = 0
    for (let i = 0; i < id.length; i++) {
      h = (h * 31 + id.charCodeAt(i)) | 0
    }
    return 'PASS-' + String(Math.abs(h) % 1_000_000).padStart(6, '0')
  }

  const getInitials = (nome: string) => {
    if (!nome) return 'U';
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Funções para notificações
  const notificacaoNaoLidas = notificacoes.filter(n => !n.lida).length;
  
  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, lida: true } : notif
      )
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => 
      prev.map(notif => ({ ...notif, lida: true }))
    );
  };

  // Métricas para os cards do dashboard
  const totalEmAberto = passagensTodas.reduce((s, p) => s + p.valor, 0);
  const vencendoEmBreve = passagensTodas.filter(p => p.status === 'risco_multa').length;
  const multasEvitadas = 482.68;
  const veiculosMonitorados = placasUsuario.length;

  // Configuração das abas para navegação
  const tabs = [
    { id: 'home', label: 'Pendências', icon: passagensTodas.length === 0 ? CheckCircle : AlertTriangle, hasAlert: vencendoEmBreve > 0 },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'total-pago', label: 'Total Pago', icon: CreditCard },
    { id: 'veiculos', label: 'Veículos', icon: Car },
    { id: 'conta', label: 'Conta', icon: User }
  ];

  // Feed de atividade recente
  const atividadeRecente = [
    { tipo: 'novo-debito', texto: 'Nova passagem detectada — Pórtico BR-116 · KM 312', data: '02/05/2026', cor: 'text-[#C77700]', bg: 'bg-[#FBE8C5] border-[#F4C97A]' },
    { tipo: 'alerta', texto: 'Prazo se aproximando — Pórtico SP-330 vence em 14/05', data: '07/05/2026', cor: 'text-[#C8324A]', bg: 'bg-[#F8D7DD] border-[#F0A8B5]' },
    { tipo: 'pagamento', texto: 'Pagamento confirmado — 3 passagens quitadas via PIX', data: '15/04/2026', cor: 'text-[#0A6B45]', bg: 'bg-[#D4F0E2] border-[#A3D9BE]' },
    { tipo: 'novo-debito', texto: 'Nova passagem detectada — Pórtico SP-270 · KM 33', data: '28/04/2026', cor: 'text-[#C77700]', bg: 'bg-[#FBE8C5] border-[#F4C97A]' },
  ];

  const renderHomeContent = () => (
    <div className="max-w-6xl mx-auto">

      {/* Cabeçalho compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1B23]">
            Olá, {(usuario.nome || 'Usuário').split(' ')[0]}
          </h2>
          <p className="text-sm text-[#8A8B95] mt-0.5">
            {vencendoEmBreve > 0
              ? `${vencendoEmBreve} passagem${vencendoEmBreve > 1 ? 'ns' : ''} com prazo próximo do vencimento`
              : passagensTodas.length === 0
                ? 'Nenhuma pendência no momento'
                : `${passagensTodas.length} passagem${passagensTodas.length !== 1 ? 'ns' : ''} pendente${passagensTodas.length !== 1 ? 's' : ''} de pagamento`}
          </p>
        </div>

        {/* Pills de status */}
        <div className="flex items-center gap-2 flex-wrap">
          {agg.totalGeral > 0 && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${vencendoEmBreve > 0 ? 'bg-[#F8D7DD] text-[#A3203B]' : 'bg-[#F4EFFB] text-[#5B2E8C]'}`}>
              <Wallet className="h-3 w-3" />
              {formatCurrency(agg.totalGeral)} em aberto
            </span>
          )}
          {proximo && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#FBE8C5] text-[#9A5B00]">
              <Calendar className="h-3 w-3" />
              Vence {proximo.prazoLimite}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8A8B95] px-2 py-1.5">
            <Shield className="h-3 w-3 text-[#8B5FFF]" />
            {veiculosMonitorados} veículo{veiculosMonitorados > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid: 2 colunas no desktop (Estado 3), 1 coluna nos demais */}
      <div className={`mt-4 space-y-4 ${passagensTodas.length > 0 && placasUsuario.length > 0 ? 'lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-6 lg:space-y-0' : ''}`}>
        <div className="space-y-4">

          {/* ── Estado 1: sem veículos cadastrados ───────────────────────────────── */}
      {placasUsuario.length === 0 ? (
        <Card className="border border-[#DCDDE3]">
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#8B5FFF] rounded-full flex items-center justify-center mx-auto">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#5B2E8C]">Nenhum veículo cadastrado</h3>
                <p className="text-sm text-[#8A8B95] max-w-xs mx-auto leading-relaxed">
                  Para consultar e pagar pendências, cadastre pelo menos uma placa.
                  Acesse a aba <strong className="text-[#5B2E8C]">Veículos</strong>.
                </p>
              </div>
              <Button
                onClick={() => setAbaSelecionada('veiculos')}
                className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white h-12 px-6 font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar meu primeiro veículo
              </Button>
            </div>
          </CardContent>
        </Card>

      /* ── Estado 2: veículos cadastrados, sem pendências ───────────────────── */
      ) : passagensTodas.length === 0 ? (
        <Card className="border border-[#DCDDE3]">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#D4F0E2] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-[#0E8B5A]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#1A1B23]">Tudo em dia!</h3>
                <p className="text-sm text-[#8A8B95] max-w-xs mx-auto leading-relaxed">
                  Não existe pendência de pedágio para{' '}
                  {placasUsuario.length === 1
                    ? <span className="font-semibold text-[#5B2E8C]">a placa {placasUsuario[0]}</span>
                    : <span>as <strong className="text-[#5B2E8C]">{placasUsuario.length} placas</strong> cadastradas</span>
                  }.
                </p>
              </div>
              {/* "Consultar outra placa" no empty state */}
              {!mostrandoFormularioNovaPlaca ? (
                <button
                  onClick={() => setMostrandoFormularioNovaPlaca(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-[#8A8B95] hover:text-[#5B2E8C] transition-colors mt-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Consultar outra placa
                </button>
              ) : (
                <div className="max-w-xs mx-auto space-y-2 pt-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#8A8B95]">Consultar outra placa</span>
                    <button
                      onClick={() => { setMostrandoFormularioNovaPlaca(false); setNovaPlaca(''); setResultadoConsultaNovaPlaca(null); }}
                      className="text-[#B0B1BB] hover:text-[#5B2E8C] transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novaPlaca}
                      onChange={(e) => {
                        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        if (value.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(value)) value = value.slice(0, 3) + '-' + value.slice(3);
                        setNovaPlaca(value);
                      }}
                      placeholder="ABC-1234"
                      className="flex-1 h-9 px-3 bg-[#F7F7F9] border border-[#E5E6EC] rounded-lg text-sm text-center font-semibold tracking-wider placeholder-[#B0B1BB] focus:outline-none focus:border-[#8B5FFF] focus:ring-1 focus:ring-[#8B5FFF]/15"
                      maxLength={8}
                    />
                    <Button
                      onClick={buscarDebitosNovaPlaca}
                      disabled={novaPlaca.length < 7 || consultandoNovaPlaca}
                      size="sm"
                      className="h-9 px-4 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white text-xs"
                    >
                      {consultandoNovaPlaca ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Buscar'}
                    </Button>
                  </div>
                  {resultadoConsultaNovaPlaca && (
                    <div className="rounded-lg border border-[#DCDDE3] bg-white p-3 mt-1">
                      {resultadoConsultaNovaPlaca.success ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#0E8B5A] flex-shrink-0" />
                            <span className="text-xs text-[#1A1B23] font-medium">
                              {resultadoConsultaNovaPlaca.quantidade} pendência{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''} · {formatCurrency(resultadoConsultaNovaPlaca.valorTotal)}
                            </span>
                          </div>
                          <Button onClick={adicionarDebitosNovaPlaca} size="sm" className="h-7 px-3 text-xs bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white flex-shrink-0">
                            Adicionar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-[#8A8B95] flex-shrink-0" />
                          <span className="text-xs text-[#8A8B95]">Nenhuma pendência encontrada</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      /* ── Estado 3: tem pendências — card completo ─────────────────────────── */
      ) : (
      <Card className="border border-[#DCDDE3]">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl text-[#1A1B23] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#C77700]" />
              Passagens a pagar
            </CardTitle>
            {/* "Consultar outra placa" promovida para o header */}
            {!mostrandoFormularioNovaPlaca && (
              <button
                onClick={() => setMostrandoFormularioNovaPlaca(true)}
                className="flex-shrink-0 flex items-center gap-1 text-xs text-[#5B2E8C] hover:text-[#8B5FFF] transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Outra placa</span>
                <span className="sm:hidden">+ Placa</span>
              </button>
            )}
          </div>
          <p className="text-[#8A8B95] mt-1.5 text-sm">
            Selecione quais débitos deseja pagar agora
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filtros — estilo iOS Segmented Control, largura total */}
          <div className="mb-4">
            <div className="flex w-full bg-[#EBEBED] rounded-full p-0.5">
              {(['todas', 'praca_fisica', 'portico_free_flow'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={`flex-1 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    filtroTipo === t
                      ? 'bg-white text-[#1A1B23] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.07)]'
                      : 'text-[#6B6F7A] hover:text-[#1A1B23]'
                  }`}
                >
                  {t === 'todas' ? 'Todas' : t === 'praca_fisica' ? 'Praça Manual' : 'Free Flow'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Placa - apenas se houver múltiplas placas */}
          {placasUnicas.length > 1 && (
            <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-2 sm:p-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-[#5B2E8C] flex-shrink-0" />
                  <label className="text-xs sm:text-sm font-medium text-[#5B2E8C]">
                    Filtrar por placa
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltroExpandido(!filtroExpandido)}
                  className="h-7 sm:h-8 px-2 sm:px-3 border-[#DCDDE3] text-[#8A8B95] hover:bg-white hover:border-[#8B5FFF] hover:text-[#8B5FFF] transition-all duration-200"
                >
                  {filtroExpandido ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1 transition-transform duration-200" />
                      <span className="hidden sm:inline text-xs">Ocultar</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1 transition-transform duration-200" />
                      <span className="hidden sm:inline text-xs">Filtros</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                filtroExpandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="bg-white border border-[#DCDDE3] rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="todas-placas"
                        checked={filtroPlaca.includes('todas')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFiltroPlaca(['todas']);
                          } else {
                            setFiltroPlaca([]);
                          }
                        }}
                        className="h-3 w-3 sm:h-4 sm:w-4"
                      />
                      <label htmlFor="todas-placas" className="text-xs sm:text-sm cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                        <Car className="h-3 w-3" />
                        <span>Todas as placas ({passagensTodas.length})</span>
                      </label>
                    </div>
                    {placasUnicas.map(placa => {
                      const qtdDebitos = passagensTodas.filter(d => d.placa === placa).length;
                      const isChecked = filtroPlaca.includes(placa);
                      return (
                        <div key={placa} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`placa-${placa}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const newFilters = filtroPlaca.filter(f => f !== 'todas');
                                setFiltroPlaca([...newFilters, placa]);
                              } else {
                                setFiltroPlaca(filtroPlaca.filter(f => f !== placa));
                              }
                            }}
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <label htmlFor={`placa-${placa}`} className="text-xs sm:text-sm cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                            <Car className="h-3 w-3" />
                            <span>{placa} ({qtdDebitos})</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista dos débitos */}
          {pendentesFiltradas.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#5B2E8C] text-sm uppercase tracking-wide leading-tight">
                    {pendentesFiltradas.length} Pendência{pendentesFiltradas.length > 1 ? 's' : ''} {filtroTipo === 'todas' && filtroStatus === 'todas' ? `Disponíve${pendentesFiltradas.length > 1 ? 'is' : 'l'}` : `Filtrada${pendentesFiltradas.length > 1 ? 's' : ''}`}
                    {!filtroPlaca.includes('todas') && (
                      <span className="text-[#8B5FFF] ml-1 block sm:inline">- {filtroPlaca.join(', ')}</span>
                    )}
                  </h4>
                </div>
                {pendentesFiltradas.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={todosSelecionados ? desselecionarTodos : selecionarTodos}
                    className="text-xs h-9 sm:h-8 px-3 border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white flex-shrink-0"
                  >
                    {todosSelecionados ? (
                      <>
                        <Minus className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Desmarcar todos</span>
                        <span className="sm:hidden">Desmarcar</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Selecionar todos</span>
                        <span className="sm:hidden">Selecionar</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3">
                {pendentesFiltradas.map((p) => {
                  const isSelected = debitosSelecionadosResumo.includes(p.id);
                  const isRisco = p.status === 'risco_multa';
                  return (
                    <div
                      key={p.id}
                      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all select-none ${
                        isSelected
                          ? 'bg-[#F4EFFB] border-[#8B5FFF]'
                          : 'bg-[#F7F5FB] border-[#DCDDE3] hover:border-[#8B5FFF]'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDebitoSelecionado(p.id)}
                        className="mt-1 transition-all duration-200 hover:scale-110 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MapPin className={`h-4 w-4 flex-shrink-0 transition-colors ${
                              isSelected ? 'text-[#5B2E8C]' : 'text-[#8B5FFF]'
                            }`} />
                            <h3 className={`font-semibold text-sm sm:text-base leading-tight transition-colors truncate ${
                              isSelected ? 'text-[#5B2E8C]' : 'text-[#1A1B23]'
                            }`}>
                              {p.local}
                            </h3>
                            <TipoPassagemBadge tipo={p.tipo} />
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`font-bold text-base sm:text-lg whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-105 ${
                              isSelected ? 'text-[#5B2E8C] hover:text-[#8B5FFF]' : 'text-[#8B5FFF] hover:text-[#7142B8]'
                            }`}>
                              {formatCurrency(p.valor)}
                            </span>
                            {isRisco ? (
                              <Badge className="bg-[#F8D7DD] text-[#A3203B] text-xs flex-shrink-0">Vence em breve</Badge>
                            ) : (
                              <Badge className="bg-[#FBE8C5] text-[#7A4800] text-xs flex-shrink-0">Pendente</Badge>
                            )}
                          </div>
                        </div>
                        {/* Linha 2: data · hora · concessionária — vence · placa */}
                        <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-3 text-xs text-[#8A8B95]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{p.data} às {p.hora}</span>
                            {p.concessionaria && (
                              <>
                                <span className="text-[#DCDDE3]">·</span>
                                <span>{p.concessionaria}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`flex items-center gap-1 ${isRisco ? 'text-[#C8324A] font-medium' : 'text-[#8A8B95]'}`}>
                              <Shield className="h-3 w-3" />
                              Vence: {p.prazoLimite}
                            </span>
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {p.placa}
                            </span>
                          </div>
                        </div>

                        {/* Linha 3: ID · Rodovia · KM — numa linha só */}
                        <div className="mt-2 pt-2 border-t border-[#ECECF1]/60 flex flex-wrap gap-x-5 gap-y-1.5">
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[#B0B1BB] uppercase tracking-wide leading-none">ID da Passagem</span>
                            <span className="text-xs font-semibold text-[#3A3B47]">{formatPassagemId(p.id)}</span>
                          </span>
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[#B0B1BB] uppercase tracking-wide leading-none">Rodovia</span>
                            <span className="text-xs font-semibold text-[#3A3B47]">{p.rodovia}</span>
                          </span>
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-medium text-[#B0B1BB] uppercase tracking-wide leading-none">Quilômetro</span>
                            <span className="text-xs font-semibold text-[#3A3B47]">km {p.km}</span>
                          </span>
                          <span className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[10px] font-medium text-[#B0B1BB] uppercase tracking-wide leading-none">Praça</span>
                            <span className="text-xs font-semibold text-[#3A3B47] truncate max-w-[220px]">{p.local}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {debitosSelecionadosResumo.length === 0 && (
                <div className="bg-[#FBE8C5] border border-[#FBE8C5] rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-[#9A5B00] font-medium leading-tight">
                    Selecione pelo menos uma pendência para continuar
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Filtro ativo mas sem correspondência */
            <div className="bg-[#FBE8C5] border border-[#FBE8C5] rounded-lg p-4 text-center">
              <p className="text-sm text-[#9A5B00] font-medium">
                Nenhuma pendência encontrada para os filtros selecionados
              </p>
              <Button
                onClick={() => { setFiltroTipo('todas'); setFiltroStatus('todas'); }}
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
              >
                Ver todas as passagens
              </Button>
            </div>
          )}

          {/* Total + Prosseguir — ocultos no desktop (exibidos na sidebar direita) */}
          <div className="lg:hidden">

          {/* Total */}
          <div className="border-t-2 border-[#DCDDE3] pt-6">
            <div className="bg-[#5B2E8C] text-white rounded-lg p-3 sm:p-6">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-sm sm:text-xl font-semibold">Total a Pagar</span>
                <span className="text-lg sm:text-3xl font-bold">
                  {formatCurrency(calcularValorTotal())}
                </span>
              </div>
              {passagensTodas.length > 0 && (
                <p className="text-xs sm:text-sm text-[#F7F5FB] opacity-90">
                  {debitosSelecionadosResumo.length} de {passagensTodas.length} pendência{passagensTodas.length > 1 ? 's' : ''} selecionada{debitosSelecionadosResumo.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Botão de Prosseguir */}
          <div className="pt-4">
            <Button
              onClick={handleProsseguir}
              disabled={debitosSelecionadosResumo.length === 0}
              className={`w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold rounded-lg transition-all ${
                debitosSelecionadosResumo.length > 0
                  ? 'bg-[#8B5FFF] hover:bg-[#7142B8] text-white'
                  : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
              }`}
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Prosseguir para Pagamento - {formatCurrency(calcularValorTotal())}</span>
              <span className="sm:hidden">Pagar - {formatCurrency(calcularValorTotal())}</span>
            </Button>
          </div>

          </div> {/* fim lg:hidden Total+Prosseguir */}

          {/* Consultar outra placa — form (trigger promovido para o CardHeader) */}
          <div className="border-t border-[#ECECF1] pt-3">
            {!mostrandoFormularioNovaPlaca ? null : (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#8A8B95]">Consultar outra placa</span>
                  <button
                    onClick={() => { setMostrandoFormularioNovaPlaca(false); setNovaPlaca(''); setResultadoConsultaNovaPlaca(null); }}
                    className="text-[#B0B1BB] hover:text-[#5B2E8C] transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novaPlaca}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      if (value.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(value)) {
                        value = value.slice(0, 3) + '-' + value.slice(3);
                      }
                      setNovaPlaca(value);
                    }}
                    placeholder="ABC-1234"
                    className="flex-1 h-9 px-3 bg-[#F7F7F9] border border-[#E5E6EC] rounded-lg text-sm text-center font-semibold tracking-wider placeholder-[#B0B1BB] focus:outline-none focus:border-[#8B5FFF] focus:ring-1 focus:ring-[#8B5FFF]/15"
                    maxLength={8}
                  />
                  <Button
                    onClick={buscarDebitosNovaPlaca}
                    disabled={novaPlaca.length < 7 || consultandoNovaPlaca}
                    size="sm"
                    className="h-9 px-4 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white text-xs"
                  >
                    {consultandoNovaPlaca ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Buscar'}
                  </Button>
                </div>

                {resultadoConsultaNovaPlaca && (
                  <div className="rounded-lg border border-[#DCDDE3] bg-white p-3 mt-1">
                    {resultadoConsultaNovaPlaca.success ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-[#0E8B5A] flex-shrink-0" />
                          <span className="text-xs text-[#1A1B23] font-medium">
                            {resultadoConsultaNovaPlaca.quantidade} pendência{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''} · {formatCurrency(resultadoConsultaNovaPlaca.valorTotal)}
                          </span>
                        </div>
                        <Button onClick={adicionarDebitosNovaPlaca} size="sm" className="h-7 px-3 text-xs bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white flex-shrink-0">
                          Adicionar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-[#8A8B95] flex-shrink-0" />
                        <span className="text-xs text-[#8A8B95]">Nenhuma pendência encontrada</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </CardContent>
      </Card>
      )} {/* fim ternário de estado */}

      {/* Feed de atividade recente — colapsável */}
      <Card className="border border-[#DCDDE3] overflow-hidden">
        {/* Cabeçalho clicável */}
        <button
          onClick={() => setAtividadeAberta(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F7F5FB] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-[#5B2E8C]" />
            <span className="text-sm font-semibold text-[#5B2E8C]">Atividade recente</span>
            {/* Pílulas de resumo quando colapsado */}
            {!atividadeAberta && (
              <div className="flex items-center gap-1.5 ml-1">
                {atividadeRecente.some(a => a.tipo === 'alerta') && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F8D7DD] text-[#C8324A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8324A]" />
                    Alerta
                  </span>
                )}
                <span className="text-[11px] text-[#8A8B95]">{atividadeRecente.length} eventos</span>
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-[#8A8B95] transition-transform duration-200 ${atividadeAberta ? 'rotate-180' : ''}`} />
        </button>

        {/* Lista expansível */}
        {atividadeAberta && (
          <div className="px-4 pb-4 space-y-2 border-t border-[#ECECF1] pt-3">
            {atividadeRecente.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${item.bg}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.tipo === 'pagamento' ? 'bg-[#0E8B5A]' :
                  item.tipo === 'alerta' ? 'bg-[#C8324A]' : 'bg-[#C77700]'
                }`} />
                <p className={`flex-1 font-medium leading-snug text-xs sm:text-sm ${item.cor}`}>{item.texto}</p>
                <span className="text-[11px] text-[#8A8B95] flex-shrink-0">{item.data}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

        </div> {/* fim left column */}

        {/* Sidebar direita — desktop only, apenas no Estado 3 */}
        {passagensTodas.length > 0 && placasUsuario.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <Card className="border border-[#DCDDE3]">
                <CardContent className="pt-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1A1B23]">Resumo do Pagamento</h3>
                  <div className="bg-[#5B2E8C] text-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">Total a Pagar</span>
                      <span className="text-xl font-bold">{formatCurrency(calcularValorTotal())}</span>
                    </div>
                    {passagensTodas.length > 0 && (
                      <p className="text-xs text-[#F7F5FB] opacity-90">
                        {debitosSelecionadosResumo.length} de {passagensTodas.length} pendência{passagensTodas.length > 1 ? 's' : ''} selecionada{debitosSelecionadosResumo.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleProsseguir}
                    disabled={debitosSelecionadosResumo.length === 0}
                    className={`w-full h-12 text-sm font-semibold rounded-lg transition-all ${
                      debitosSelecionadosResumo.length > 0
                        ? 'bg-[#8B5FFF] hover:bg-[#7142B8] text-white'
                        : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Prosseguir para Pagamento
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#8A8B95] pt-1">
                    <Shield className="h-3 w-3 text-[#8B5FFF]" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div> {/* fim grid wrapper */}

    </div>
  );

  const renderContent = () => {
    switch (abaSelecionada) {
      case 'historico':
        return <HistoricoPagamentos onIrParaPagamento={onIrParaPagamento} />;
      case 'total-pago':
        return <TotalPago dadosUsuario={usuario} />;
      case 'veiculos':
        return <VeiculosCadastrados onIrParaConsulta={onIrParaConsulta} onIrParaPagamentoDireto={onIrParaPagamentoDireto} />;
      case 'conta':
        return <ConfiguracoesConta dadosUsuario={usuario} onLogout={onLogout} />;
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FB] md:pb-0 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#DCDDE3] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={logoPedagioSimples}
                alt="Pedágio Simples — by Move Mais"
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB] rounded-lg transition-all duration-200 flex-shrink-0 lg:hidden"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Logout Button - Desktop Only */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="hidden md:flex items-center gap-2 text-[#8A8B95] hover:text-[#C8324A] hover:bg-[#F8D7DD] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:block bg-white border-t border-[#DCDDE3]">
          <div className="px-4 py-3">
            <nav className="flex items-center gap-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = abaSelecionada === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAbaSelecionada(tab.id)}
                    className={`relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? (tab.hasAlert ? 'bg-gradient-to-r from-[#C8324A] to-[#E05270] text-white shadow-lg' : 'bg-[#5B2E8C] text-white shadow-sm')
                        : (tab.hasAlert ? 'text-[#C8324A] hover:text-[#C8324A] hover:bg-[#F8D7DD]' : 'text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]')
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.hasAlert && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#C8324A] rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="px-3 sm:px-4 py-4 sm:py-6 flex-1">
        {renderContent()}
      </main>

      {/* Footer — Desktop only */}
      <FooterLogado />

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DCDDE3] z-50">
        <div className="grid grid-cols-5 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = abaSelecionada === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setAbaSelecionada(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  isActive 
                    ? (tab.hasAlert ? 'text-[#C8324A] bg-[#C8324A]/10' : 'text-[#5B2E8C] bg-[#5B2E8C]/5')
                    : (tab.hasAlert ? 'text-[#C8324A] hover:text-[#C8324A] hover:bg-[#F8D7DD]' : 'text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]')
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                {tab.hasAlert && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C8324A] rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal de Confirmação de Cadastro de Placa */}
      <Dialog open={modalConfirmacaoPlacaAberto} onOpenChange={setModalConfirmacaoPlacaAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-[#5B2E8C] flex items-center justify-center gap-2">
              <Car className="h-6 w-6" />
              Cadastrar Nova Placa
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-[#8A8B95] pt-2">
              A placa <strong className="text-[#5B2E8C]">{novaPlaca}</strong> ainda não está cadastrada em sua conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Informações da placa */}
            <div className="bg-gradient-to-r from-[#F4EFFB] to-[#F4EFFB] border border-[#8B5FFF] rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8A8B95]">Nova placa</span>
                  <span className="text-lg font-bold text-[#5B2E8C] tracking-wider">{novaPlaca}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8A8B95]">Pendências encontradas</span>
                  <span className="text-base font-semibold text-[#8B5FFF]">
                    {resultadoConsultaNovaPlaca?.quantidade || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#8B5FFF]/20">
                  <span className="text-sm font-medium text-[#5B2E8C]">Valor total</span>
                  <span className="text-lg font-bold text-[#5B2E8C]">
                    R$ {(resultadoConsultaNovaPlaca?.valorTotal || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensagem de confirmação */}
            <div className="bg-[#FBE8C5] border border-[#FBE8C5] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#9A5B00] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#9A5B00] leading-relaxed">
                    Deseja cadastrar esta placa em sua conta e incluir os débitos no pagamento atual?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalConfirmacaoPlacaAberto(false)}
              className="w-full sm:w-auto border-[#DCDDE3] text-[#8A8B95] hover:bg-[#F7F5FB] hover:text-[#5B2E8C]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmarCadastroEAdicionar}
              className="w-full sm:w-auto bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Sim, cadastrar e adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}