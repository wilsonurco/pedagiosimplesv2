import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Car, CheckCircle2, Shield, Calendar, MapPin, ArrowRight, Plus, Minus, Filter, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { TipoPassagemBadge } from './ui/tipo-passagem-badge';
import type { Passagem } from '../utils/simulator';

interface ResumoPedidoProps {
  onBack: () => void;
  onProsseguir: (debitosSelecionados: Passagem[], valorTotal: number) => void;
  valorTotal: number;
  debitosSelecionados?: Passagem[];
}

export function ResumoPedido({ onBack, onProsseguir, valorTotal, debitosSelecionados = [] }: ResumoPedidoProps) {
  const [debitosSelecionadosResumo, setDebitosSelecionadosResumo] = useState<string[]>(
    debitosSelecionados.map(d => d.id)
  );
  const [filtroPlaca, setFiltroPlaca] = useState<string>('todas');

  // Estados para consulta de nova placa
  const [mostrandoFormularioNovaPlaca, setMostrandoFormularioNovaPlaca] = useState<boolean>(false);
  const [novaPlaca, setNovaPlaca] = useState<string>('');
  const [consultandoNovaPlaca, setConsultandoNovaPlaca] = useState<boolean>(false);
  const [resultadoConsultaNovaPlaca, setResultadoConsultaNovaPlaca] = useState<{
    success: boolean;
    quantidade: number;
    valorTotal: number;
    debitos: Passagem[];
  } | null>(null);
  const [debitosAdicionais, setDebitosAdicionais] = useState<Passagem[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleDebitoSelecionado = (debitoId: string) => {
    setDebitosSelecionadosResumo(prev => {
      if (prev.includes(debitoId)) {
        return prev.filter(id => id !== debitoId);
      } else {
        return [...prev, debitoId];
      }
    });
  };

  const selecionarTodos = () => {
    // Selecionar todos os débitos filtrados
    setDebitosSelecionadosResumo(prev => {
      const novosSelecionados = debitosFiltrados.map(d => d.id);
      return Array.from(new Set([...prev, ...novosSelecionados]));
    });
  };

  const desselecionarTodos = () => {
    // Desmarcar apenas os débitos filtrados
    setDebitosSelecionadosResumo(prev => {
      const idsFiltrados = debitosFiltrados.map(d => d.id);
      return prev.filter(id => !idsFiltrados.includes(id));
    });
  };

  // Funções para consulta de nova placa
  const buscarDebitosNovaPlaca = async () => {
    setConsultandoNovaPlaca(true);
    setResultadoConsultaNovaPlaca(null);
    
    // Simular delay da consulta
    setTimeout(() => {
      // Simular resultado baseado na placa
      const placaJaConsultada = [...debitosSelecionados, ...debitosAdicionais].some(d => d.placa === novaPlaca);
      
      if (placaJaConsultada) {
        setResultadoConsultaNovaPlaca({
          success: false,
          quantidade: 0,
          valorTotal: 0,
          debitos: []
        });
      } else {
        // Gerar débitos simulados para a nova placa
        const ts = Date.now();
        const debitosSimulados: Passagem[] = [
          {
            id: `nova_${ts}_1`,
            tipo: 'praca_fisica',
            local: "Rodovia dos Bandeirantes - KM 45",
            concessionaria: "AutoBan",
            rodovia: "SP-330",
            km: 45,
            valor: 11.30,
            data: "10/01/2025",
            hora: "08:15:00",
            placa: novaPlaca,
            status: 'em_prazo',
            prazoLimite: "30/06/2025",
          },
          {
            id: `nova_${ts}_2`,
            tipo: 'portico_free_flow',
            local: "Via Anhanguera - KM 67",
            concessionaria: "AutoBan",
            rodovia: "SP-330",
            km: 67,
            valor: 8.90,
            data: "12/01/2025",
            hora: "14:22:00",
            placa: novaPlaca,
            status: 'em_prazo',
            prazoLimite: "30/06/2025",
          },
        ];
        
        const valorTotal = debitosSimulados.reduce((acc, d) => acc + d.valor, 0);
        
        setResultadoConsultaNovaPlaca({
          success: true,
          quantidade: debitosSimulados.length,
          valorTotal,
          debitos: debitosSimulados
        });
      }
      
      setConsultandoNovaPlaca(false);
    }, 1500);
  };

  const adicionarDebitosNovaPlaca = () => {
    if (resultadoConsultaNovaPlaca && resultadoConsultaNovaPlaca.success) {
      setDebitosAdicionais(prev => [...prev, ...resultadoConsultaNovaPlaca.debitos]);
      setDebitosSelecionadosResumo(prev => [...prev, ...resultadoConsultaNovaPlaca.debitos.map(d => d.id)]);
      
      // Limpar formulário
      setMostrandoFormularioNovaPlaca(false);
      setNovaPlaca('');
      setResultadoConsultaNovaPlaca(null);
      
      // Atualizar filtro para mostrar todas as placas
      setFiltroPlaca('todas');
    }
  };

  // Combinar débitos originais com os adicionais
  const todosOsDebitos = [...debitosSelecionados, ...debitosAdicionais];

  // Obter placas únicas dos débitos (incluindo adicionais)
  const placasUnicas = Array.from(new Set(todosOsDebitos.map(d => d.placa))).sort();
  
  // Filtrar débitos por placa selecionada
  const debitosFiltrados = filtroPlaca === 'todas' 
    ? todosOsDebitos 
    : todosOsDebitos.filter(d => d.placa === filtroPlaca);

  const todosSelecionados = debitosFiltrados.length > 0 && 
    debitosFiltrados.every(d => debitosSelecionadosResumo.includes(d.id));

  const calcularValorTotal = () => {
    if (todosOsDebitos.length === 0) {
      return valorTotal;
    }
    
    return todosOsDebitos
      .filter(debito => debitosSelecionadosResumo.includes(debito.id))
      .reduce((total, debito) => total + debito.valor, 0);
  };

  const handleProsseguir = () => {
    const debitosSelecionadosParaPagamento = todosOsDebitos.filter(debito => 
      debitosSelecionadosResumo.includes(debito.id)
    );
    const valorFinal = calcularValorTotal();
    onProsseguir(debitosSelecionadosParaPagamento, valorFinal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FB] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F7F5FB] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5B2E8C] rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#5B2E8C]">Pedágio Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Título e Breadcrumb */}
          <div className="text-center mb-6 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-[#5B2E8C] text-white rounded-full px-4 py-2 mb-4 sm:mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">RESUMO DO PEDIDO</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#1A1B23] mb-4">
              Revise suas Pendências
            </h1>

          </div>

          {/* Card Principal */}
          <Card className="border border-[#DCDDE3] shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-[#1A1B23] flex items-center gap-2">
                <Car className="h-6 w-6 text-[#8B5FFF]" />
                Pendências Selecionadas
              </CardTitle>
              <p className="text-[#8A8B95] mt-2">
                Selecione quais débitos deseja pagar agora
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Filtro por Placa - apenas se houver múltiplas placas */}
              {placasUnicas.length > 1 && (
                <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-[#5B2E8C] flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#5B2E8C] mb-2">
                        Filtrar por placa
                      </label>
                      <Select value={filtroPlaca} onValueChange={setFiltroPlaca}>
                        <SelectTrigger className="w-full h-10 bg-white border border-[#DCDDE3] text-sm">
                          <SelectValue placeholder="Selecione uma placa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">
                            <div className="flex items-center gap-2">
                              <Car className="h-3 w-3" />
                              <span>Todas as placas ({todosOsDebitos.length})</span>
                            </div>
                          </SelectItem>
                          {placasUnicas.map(placa => {
                            const qtdDebitos = todosOsDebitos.filter(d => d.placa === placa).length;
                            return (
                              <SelectItem key={placa} value={placa}>
                                <div className="flex items-center gap-2">
                                  <Car className="h-3 w-3" />
                                  <span>{placa} ({qtdDebitos})</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista dos débitos */}
              {debitosFiltrados.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#5B2E8C] text-sm uppercase tracking-wide">
                      {debitosFiltrados.length} Pendência{debitosFiltrados.length > 1 ? 's' : ''} {filtroPlaca === 'todas' ? 'Disponív' : 'Filtrada'}{debitosFiltrados.length > 1 ? 'eis' : 'el'}
                      {filtroPlaca !== 'todas' && (
                        <span className="text-[#8B5FFF] ml-1">- {filtroPlaca}</span>
                      )}
                    </h4>
                    {debitosFiltrados.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={todosSelecionados ? desselecionarTodos : selecionarTodos}
                        className="text-xs h-8 px-3 border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white"
                      >
                        {todosSelecionados ? (
                          <>
                            <Minus className="h-3 w-3 mr-1" />
                            Desmarcar todos
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Selecionar todos
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
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all select-none ${
                            isSelected 
                              ? 'bg-[#F4EFFB] border-[#8B5FFF] shadow-sm' 
                              : 'bg-[#F7F5FB] border-[#DCDDE3] hover:border-[#8B5FFF] hover:shadow-sm'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDebitoSelecionado(debito.id)}
                            className="mt-1 transition-all duration-200 hover:scale-110"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-3 mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <MapPin className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                  isSelected ? 'text-[#5B2E8C]' : 'text-[#8B5FFF]'
                                }`} />
                                <h3 className={`font-semibold text-base leading-tight transition-colors ${
                                  isSelected ? 'text-[#5B2E8C]' : 'text-[#1A1B23]'
                                }`}>
                                  {debito.local}
                                </h3>
                                <TipoPassagemBadge tipo={debito.tipo} />
                              </div>
                              <div className="text-right">
                                <span className={`font-bold text-lg whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-105 ${
                                  isSelected ? 'text-[#5B2E8C] hover:text-[#8B5FFF]' : 'text-[#8B5FFF] hover:text-[#7142B8]'
                                }`}>
                                  {formatCurrency(debito.valor)}
                                </span>
                                <Badge className="bg-[#FBE8C5] text-[#7A4800] text-xs ml-2">
                                  Pendente
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-sm text-[#8A8B95]">
                                <Calendar className="h-3 w-3" />
                                <span>Data: 30/09/2025 {debito.data} • Hora: {debito.hora || '14:30:00'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-[#8A8B95]">
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
                    <div className="bg-[#FBE8C5] border border-[#FBE8C5] rounded-lg p-4 text-center">
                      <p className="text-sm text-[#9A5B00] font-medium">
                        Selecione pelo menos uma pendência para continuar
                      </p>
                    </div>
                  )}
                </div>
              ) : todosOsDebitos.length > 0 ? (
                <div className="bg-[#FBE8C5] border border-[#FBE8C5] rounded-lg p-4 text-center">
                  <p className="text-sm text-[#9A5B00] font-medium">
                    Nenhuma pendência encontrada para a placa "{filtroPlaca}"
                  </p>
                  <Button
                    onClick={() => setFiltroPlaca('todas')}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    Ver todas as placas
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center p-4 bg-[#F7F5FB] rounded-lg border border-[#DCDDE3]">
                  <span className="text-[#1A1B23] font-medium">Pendências de pedágio</span>
                  <span className="font-semibold text-[#8B5FFF]">{formatCurrency(calcularValorTotal())}</span>
                </div>
              )}

              {/* Total */}
              <div className="border-t-2 border-[#DCDDE3] pt-6">
                <div className="bg-[#5B2E8C] text-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-semibold">Total a Pagar</span>
                    <span className="text-2xl sm:text-3xl font-bold">
                      {formatCurrency(calcularValorTotal())}
                    </span>
                  </div>
                  {todosOsDebitos.length > 0 && (
                    <p className="text-sm text-[#F7F5FB] opacity-90">
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
                  className={`w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg transition-all ${
                    debitosSelecionadosResumo.length > 0
                      ? 'bg-[#8B5FFF] hover:bg-[#7142B8] text-white hover:shadow-lg'
                      : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="h-5 w-5 mr-2 shrink-0" />
                  <span className="truncate">
                    <span className="sm:hidden">
                      Prosseguir — {formatCurrency(calcularValorTotal())}
                    </span>
                    <span className="hidden sm:inline">
                      Prosseguir para Pagamento — {formatCurrency(calcularValorTotal())}
                    </span>
                  </span>
                </Button>
              </div>

              {/* Consultar outra placa — ação terciária */}
              <div className="border-t border-[#DCDDE3] pt-4">
                {!mostrandoFormularioNovaPlaca ? (
                  <button
                    onClick={() => setMostrandoFormularioNovaPlaca(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-[#8A8B95] hover:text-[#5B2E8C] transition-colors py-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Consultar outra placa
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#5B2E8C]">Consultar outra placa</span>
                      <button
                        onClick={() => {
                          setMostrandoFormularioNovaPlaca(false);
                          setNovaPlaca('');
                          setResultadoConsultaNovaPlaca(null);
                        }}
                        className="text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
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
                          className="w-full h-10 px-3 bg-white border border-[#DCDDE3] rounded-lg text-sm text-center font-semibold tracking-wider placeholder-[#8A8B95] focus:outline-none focus:border-[#8B5FFF] focus:ring-2 focus:ring-[#8B5FFF]/20"
                          maxLength={8}
                        />
                      </div>
                      <Button
                        onClick={buscarDebitosNovaPlaca}
                        disabled={novaPlaca.length < 7 || consultandoNovaPlaca}
                        size="sm"
                        className="h-10 px-4 bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
                      >
                        {consultandoNovaPlaca ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Car className="h-3 w-3 mr-1" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>

                    {resultadoConsultaNovaPlaca && (
                      <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-3">
                        {resultadoConsultaNovaPlaca.success ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-[#0E8B5A]" />
                                <span className="text-sm font-medium text-[#5B2E8C]">
                                  {resultadoConsultaNovaPlaca.quantidade} pendência{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''} encontrada{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-[#8B5FFF]">
                                {formatCurrency(resultadoConsultaNovaPlaca.valorTotal)}
                              </span>
                            </div>
                            <Button
                              onClick={adicionarDebitosNovaPlaca}
                              size="sm"
                              className="w-full h-8 bg-[#8B5FFF] hover:bg-[#7142B8] text-white text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar ao pagamento
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-[#8A8B95]" />
                            <span className="text-sm text-[#8A8B95]">
                              Nenhuma pendência encontrada para esta placa
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selo de Segurança */}
              <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-6 mt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-[#5B2E8C] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#1A1B23] mb-2">
                      Sua transação está protegida
                    </h4>
                    <ul className="space-y-1 text-sm text-[#8A8B95]">
                      <li>• Ambiente 100% seguro com criptografia SSL</li>
                      <li>• Não armazenamos dados sensíveis do cartão</li>
                      <li>• Processo auditado e em conformidade com PCI DSS</li>
                      <li>• Monitoramento anti-fraude 24 horas por dia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}