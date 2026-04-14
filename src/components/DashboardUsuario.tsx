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
  Home,
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
  ChevronUp
} from "lucide-react";

import { HistoricoPagamentos } from "./HistoricoPagamentos";
import { VeiculosCadastrados } from "./VeiculosCadastrados";
import { ConfiguracoesConta } from "./ConfiguracoesConta";
import { TotalPago } from "./TotalPago";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";

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
  const [modalConfirmacaoPlacaAberto, setModalConfirmacaoPlacaAberto] = useState(false);
  const [placasUsuario, setPlacasUsuario] = useState<string[]>(['ECI-1548']); // Placa do usuário logado
  
  // Estados para notificações
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [notificacoes, setNotificacoes] = useState([
    {
      id: '1',
      tipo: 'pagamento',
      titulo: 'Pagamento processado com sucesso',
      mensagem: 'Seu pagamento de R$ 21,40 foi processado. Placa ECI-1548.',
      data: '2 horas atrás',
      lida: false,
      icone: CheckCircle,
      cor: 'text-green-600'
    },
    {
      id: '2',
      tipo: 'alerta',
      titulo: 'Nova pendência encontrada',
      mensagem: 'Encontramos uma nova pendência para o veículo ECI-1548.',
      data: '1 dia atrás',
      lida: false,
      icone: AlertTriangle,
      cor: 'text-yellow-600'
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
      cor: 'text-blue-600'
    }
  ]);

  // Mock de pendências para a tela inicial
  const pendenciasAtivas: any[] = [
    {
      id: 'pend-1',
      rodovia: 'Pedágio não identificado',
      valor: 18.90,
      data: '02/03/2026',
      hora: '08:45',
      placa: 'ECI-1548'
    },
    {
      id: 'pend-2',
      rodovia: 'Pedágio não identificado',
      valor: 24.50,
      data: '08/03/2026',
      hora: '14:20',
      placa: 'ECI-1548'
    },
    {
      id: 'pend-3',
      rodovia: 'Pedágio não identificado',
      valor: 12.70,
      data: '14/03/2026',
      hora: '10:10',
      placa: 'ECI-1548'
    },
    {
      id: 'pend-4',
      rodovia: 'Pedágio não identificado',
      valor: 31.40,
      data: '19/03/2026',
      hora: '17:55',
      placa: 'ECI-1548'
    }
  ];

  const totalPendencias = pendenciasAtivas.reduce((acc, pendencia) => acc + pendencia.valor, 0);

  // Dados para o ResumoPedido
  const todosOsDebitos = pendenciasAtivas.map(p => ({
    id: p.id,
    praca: p.rodovia,
    valor: p.valor,
    data: p.data,
    hora: p.hora,
    placa: p.placa
  }));

  // Funções para o ResumoPedido
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const placasUnicas = [...new Set(todosOsDebitos.map(d => d.placa))];
  const debitosFiltrados = filtroPlaca.includes('todas') ? todosOsDebitos : todosOsDebitos.filter(d => filtroPlaca.includes(d.placa));

  // Selecionar todas as pendências por padrão ao carregar
  useEffect(() => {
    if (todosOsDebitos.length > 0 && debitosSelecionadosResumo.length === 0) {
      setDebitosSelecionadosResumo(todosOsDebitos.map(d => d.id));
    }
  }, [todosOsDebitos.length]);

  // Atualizar seleção quando filtro mudar
  useEffect(() => {
    if (debitosFiltrados.length > 0) {
      // Manter apenas os débitos selecionados que ainda estão visíveis no filtro atual
      const debitosVisiveis = debitosFiltrados.map(d => d.id);
      const selecaoAtualizada = debitosSelecionadosResumo.filter(id => debitosVisiveis.includes(id));
      
      // Se não há débitos selecionados visíveis, selecionar todos os visíveis
      if (selecaoAtualizada.length === 0 && debitosFiltrados.length > 0) {
        setDebitosSelecionadosResumo(debitosVisiveis);
      } else if (selecaoAtualizada.length !== debitosSelecionadosResumo.length) {
        setDebitosSelecionadosResumo(selecaoAtualizada);
      }
    }
  }, [filtroPlaca.join(','), debitosFiltrados.length]);
  const todosSelecionados = debitosFiltrados.length > 0 && debitosFiltrados.every(debito => debitosSelecionadosResumo.includes(debito.id));

  const toggleDebitoSelecionado = (debitoId: string) => {
    setDebitosSelecionadosResumo(prev => 
      prev.includes(debitoId) 
        ? prev.filter(id => id !== debitoId)
        : [...prev, debitoId]
    );
  };

  const selecionarTodos = () => {
    setDebitosSelecionadosResumo(debitosFiltrados.map(d => d.id));
  };

  const desselecionarTodos = () => {
    setDebitosSelecionadosResumo([]);
  };

  const calcularValorTotal = () => {
    return todosOsDebitos
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
    const debitosSelecionados = todosOsDebitos.filter(debito => debitosSelecionadosResumo.includes(debito.id));
    const valorTotal = calcularValorTotal();
    
    if (onIrParaCheckout) {
      onIrParaCheckout(debitosSelecionados, valorTotal);
    }
  };

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

  // Configuração das abas para navegação
  const tabs = [
    { id: 'home', label: 'Pendências', icon: Home, hasAlert: pendenciasAtivas.length > 0 },
    { id: 'total-pago', label: 'Total Pago', icon: CreditCard },
    { id: 'veiculos', label: 'Veículos', icon: Car },
    { id: 'conta', label: 'Conta', icon: User }
  ];

  const renderHomeContent = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="border border-[#E0E0E0]">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-[#000000] flex items-center gap-2">
              <Car className="h-6 w-6 text-[#00B4D8]" />
              Pendências Selecionadas
            </CardTitle>
            <Button 
              onClick={handleProsseguir}
              disabled={debitosSelecionadosResumo.length === 0}
              className={`h-10 sm:h-8 text-xs sm:text-xs px-2 sm:px-3 rounded-md transition-all ${
                debitosSelecionadosResumo.length > 0
                  ? 'bg-[#00B4D8] hover:bg-[#0099c7] text-white'
                  : 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
              }`}
            >
              <ArrowRight className="h-3 w-3 mr-1 hidden sm:inline" />
              <span className="hidden sm:inline">Prosseguir para pagamento - {formatCurrency(calcularValorTotal())}</span>
              <span className="sm:hidden">Pagar {formatCurrency(calcularValorTotal())}</span>
            </Button>
          </div>
          <p className="text-[#6C757D] mt-2">
            Selecione quais débitos deseja pagar agora
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Adicionar Nova Placa */}
          <div className="bg-gradient-to-r from-[#F0F9FF] to-[#E8F4FD] border border-[#00B4D8] rounded-lg p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex w-6 h-6 sm:w-8 sm:h-8 bg-[#00B4D8] rounded-lg items-center justify-center flex-shrink-0">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#003566] text-xs sm:text-sm leading-tight">Consultar outra placa</h4>
                  <p className="text-xs text-[#6C757D] leading-tight hidden sm:block">Adicione débitos de outro veículo ao pagamento</p>
                </div>
              </div>
              {!mostrandoFormularioNovaPlaca && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrandoFormularioNovaPlaca(true)}
                  className="text-xs h-8 px-2 sm:px-3 border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white flex-shrink-0 w-full sm:w-auto"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="sm:hidden">Adicionar</span>
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              )}
            </div>
            
            {mostrandoFormularioNovaPlaca && (
              <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-[#00B4D8]/20">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={novaPlaca}
                      onChange={(e) => {
                        let value = e.target.value.toUpperCase();
                        value = value.replace(/[^A-Z0-9]/g, '');
                        if (value.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(value)) {
                          value = value.slice(0, 3) + '-' + value.slice(3);
                        }
                        setNovaPlaca(value);
                      }}
                      placeholder="ABC-1234"
                      className="w-full h-9 sm:h-10 px-3 bg-white border border-[#E0E0E0] rounded-lg text-sm text-center font-semibold tracking-wider placeholder-[#6C757D] focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]/20"
                      maxLength={8}
                    />
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      onClick={buscarDebitosNovaPlaca}
                      disabled={novaPlaca.length < 7 || consultandoNovaPlaca}
                      size="sm"
                      className="flex-1 sm:flex-none h-9 sm:h-10 px-3 sm:px-4 bg-[#00B4D8] hover:bg-[#0099c7] text-white text-xs"
                    >
                      {consultandoNovaPlaca ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Car className="h-3 w-3 mr-1 hidden sm:inline" />
                          Buscar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMostrandoFormularioNovaPlaca(false);
                        setNovaPlaca('');
                      }}
                      className="h-9 sm:h-10 px-2 sm:px-3 border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA] flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {resultadoConsultaNovaPlaca && (
                  <div className="bg-white border border-[#E0E0E0] rounded-lg p-2 sm:p-3">
                    {resultadoConsultaNovaPlaca.success ? (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-[#003566] leading-tight">
                              {resultadoConsultaNovaPlaca.quantidade} pendência{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''} encontrada{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-[#00B4D8] sm:text-right">
                            {formatCurrency(resultadoConsultaNovaPlaca.valorTotal)}
                          </span>
                        </div>
                        <Button
                          onClick={adicionarDebitosNovaPlaca}
                          size="sm"
                          className="w-full h-8 sm:h-8 bg-[#00B4D8] hover:bg-[#0099c7] text-white text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar ao pagamento
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#6C757D] flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-[#6C757D] leading-tight">
                          Nenhuma pendência encontrada para esta placa
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtro por Placa - apenas se houver múltiplas placas */}
          {placasUnicas.length > 1 && (
            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-2 sm:p-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-[#003566] flex-shrink-0" />
                  <label className="text-xs sm:text-sm font-medium text-[#003566]">
                    Filtrar por placa
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltroExpandido(!filtroExpandido)}
                  className="h-7 sm:h-8 px-2 sm:px-3 border-[#E0E0E0] text-[#6C757D] hover:bg-white hover:border-[#00B4D8] hover:text-[#00B4D8] transition-all duration-200"
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
                <div className="bg-white border border-[#E0E0E0] rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
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
                        <span>Todas as placas ({todosOsDebitos.length})</span>
                      </label>
                    </div>
                    {placasUnicas.map(placa => {
                      const qtdDebitos = todosOsDebitos.filter(d => d.placa === placa).length;
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
          {debitosFiltrados.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#003566] text-sm uppercase tracking-wide leading-tight">
                    {debitosFiltrados.length} Pendência{debitosFiltrados.length > 1 ? 's' : ''} {filtroPlaca.includes('todas') ? 'Disponív' : 'Filtrada'}{debitosFiltrados.length > 1 ? 'eis' : 'el'}
                    {!filtroPlaca.includes('todas') && (
                      <span className="text-[#00B4D8] ml-1 block sm:inline">- {filtroPlaca.join(', ')}</span>
                    )}
                  </h4>
                </div>
                {debitosFiltrados.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={todosSelecionados ? desselecionarTodos : selecionarTodos}
                    className="text-xs h-9 sm:h-8 px-3 border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white flex-shrink-0"
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
                {debitosFiltrados.map((debito, index) => {
                  const isSelected = debitosSelecionadosResumo.includes(debito.id);
                  return (
                    <div 
                      key={debito.id} 
                      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all select-none ${
                        isSelected 
                          ? 'bg-[#E8F4FD] border-[#00B4D8]' 
                          : 'bg-[#F8F9FA] border-[#E0E0E0] hover:border-[#00B4D8]'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDebitoSelecionado(debito.id)}
                        className="mt-1 transition-all duration-200 hover:scale-110 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MapPin className={`h-4 w-4 flex-shrink-0 transition-colors ${
                              isSelected ? 'text-[#003566]' : 'text-[#00B4D8]'
                            }`} />
                            <h3 className={`font-semibold text-sm sm:text-base leading-tight transition-colors truncate ${
                              isSelected ? 'text-[#003566]' : 'text-[#000000]'
                            }`}>
                              {debito.praca}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`font-bold text-base sm:text-lg whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-105 ${
                              isSelected ? 'text-[#003566] hover:text-[#002a52]' : 'text-[#00B4D8] hover:text-[#0099c7]'
                            }`}>
                              {formatCurrency(debito.valor)}
                            </span>
                            <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">
                              Pendente
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6C757D]">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              <span className="sm:hidden">{debito.data}</span>
                              <span className="hidden sm:inline">Data: {debito.data} • Hora: {debito.hora || '14:30'}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6C757D] flex-shrink-0">
                            <Car className="h-3 w-3" />
                            <span>Placa: {debito.placa}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {debitosSelecionadosResumo.length === 0 && (
                <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-[#856404] font-medium leading-tight">
                    Selecione pelo menos uma pendência para continuar
                  </p>
                </div>
              )}
            </div>
          ) : todosOsDebitos.length > 0 ? (
            <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-4 text-center">
              <p className="text-sm text-[#856404] font-medium">
                Nenhuma pendência encontrada para {filtroPlaca.includes('todas') ? 'os filtros selecionados' : `a(s) placa(s) "${filtroPlaca.join(', ')}"`}
              </p>
              <Button
                onClick={() => setFiltroPlaca(['todas'])}
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
              >
                Ver todas as placas
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#F0F9FF] to-[#E8F4FD] border-2 border-[#00B4D8] rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#00B4D8] rounded-full flex items-center justify-center mx-auto">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#003566]">
                    Nenhum veículo cadastrado
                  </h3>
                  <p className="text-sm text-[#6C757D] max-w-md mx-auto leading-relaxed">
                    Para consultar e pagar pendências, você precisa primeiro cadastrar um veículo. 
                    Vá para a aba <strong className="text-[#003566]">Veículos</strong> e adicione as placas dos seus veículos.
                  </p>
                </div>
                <Button
                  onClick={() => setAbaSelecionada('veiculos')}
                  className="bg-[#00B4D8] hover:bg-[#0099c7] text-white h-12 px-6 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar meu primeiro veículo
                </Button>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-[#E0E0E0] pt-6">
            <div className="bg-[#003566] text-white rounded-lg p-3 sm:p-6">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-sm sm:text-xl font-semibold">Total a Pagar</span>
                <span className="text-lg sm:text-3xl font-bold">
                  {formatCurrency(calcularValorTotal())}
                </span>
              </div>
              {todosOsDebitos.length > 0 && (
                <p className="text-xs sm:text-sm text-[#F8F9FA] opacity-90">
                  {debitosSelecionadosResumo.length} de {todosOsDebitos.length} pendência{todosOsDebitos.length > 1 ? 's' : ''} selecionada{debitosSelecionadosResumo.length > 1 ? 's' : ''}
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
                  ? 'bg-[#00B4D8] hover:bg-[#0099c7] text-white'
                  : 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
              }`}
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Prosseguir para Pagamento - {formatCurrency(calcularValorTotal())}</span>
              <span className="sm:hidden">Pagar - {formatCurrency(calcularValorTotal())}</span>
            </Button>
          </div>

          {/* Selo de Segurança */}
          <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-6 mt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-[#003566] mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-[#000000] mb-2">
                  Sua transação está protegida
                </h4>
                <ul className="space-y-1 text-sm text-[#6C757D]">
                  <li>• Ambiente 100% seguro com criptografia SSL</li>
                  <li>• Não armazenamos dados sensíveis do carto</li>
                  <li>• Processo auditado e em conformidade com PCI DSS</li>
                  <li>• Monitoramento anti-fraude 24 horas por dia</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (abaSelecionada) {
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
    <div className="min-h-screen bg-[#F8F9FA] md:pb-0 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E0E0E0] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#003566] rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#003566]">Pedágio Simples</span>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA] rounded-lg transition-all duration-200 flex-shrink-0 lg:hidden"
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
                className="hidden md:flex items-center gap-2 text-[#6C757D] hover:text-[#dc3545] hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:block bg-white border-t border-[#E0E0E0]">
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
                        ? (tab.hasAlert ? 'bg-gradient-to-r from-[#FF4757] to-[#FF6B7A] text-white shadow-lg' : 'bg-[#003566] text-white shadow-sm')
                        : (tab.hasAlert ? 'text-[#FF4757] hover:text-[#FF3742] hover:bg-[#FFF5F5]' : 'text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA]')
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.hasAlert && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4757] rounded-full flex items-center justify-center">
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
      <main className="px-3 sm:px-4 py-4 sm:py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] z-50">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = abaSelecionada === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setAbaSelecionada(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  isActive 
                    ? (tab.hasAlert ? 'text-[#FF4757] bg-[#FF4757]/10' : 'text-[#003566] bg-[#003566]/5')
                    : (tab.hasAlert ? 'text-[#FF4757] hover:text-[#FF3742] hover:bg-[#FFF5F5]' : 'text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA]')
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.hasAlert && (
                  <div className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-[#FF4757] rounded-full"></div>
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
            <DialogTitle className="text-center text-xl text-[#003566] flex items-center justify-center gap-2">
              <Car className="h-6 w-6" />
              Cadastrar Nova Placa
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-[#6C757D] pt-2">
              A placa <strong className="text-[#003566]">{novaPlaca}</strong> ainda não está cadastrada em sua conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Informações da placa */}
            <div className="bg-gradient-to-r from-[#F0F9FF] to-[#E8F4FD] border border-[#00B4D8] rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">Nova placa</span>
                  <span className="text-lg font-bold text-[#003566] tracking-wider">{novaPlaca}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">Pendências encontradas</span>
                  <span className="text-base font-semibold text-[#00B4D8]">
                    {resultadoConsultaNovaPlaca?.quantidade || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#00B4D8]/20">
                  <span className="text-sm font-medium text-[#003566]">Valor total</span>
                  <span className="text-lg font-bold text-[#003566]">
                    R$ {(resultadoConsultaNovaPlaca?.valorTotal || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensagem de confirmação */}
            <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#856404] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#856404] leading-relaxed">
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
              className="w-full sm:w-auto border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#003566]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmarCadastroEAdicionar}
              className="w-full sm:w-auto bg-[#00B4D8] hover:bg-[#0099c7] text-white"
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