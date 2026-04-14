import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Car, CheckCircle2, Shield, Calendar, MapPin, ArrowRight, Plus, Minus, Filter, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";

interface ResumoPedidoProps {
  onBack: () => void;
  onProsseguir: (debitosSelecionados: any[], valorTotal: number) => void;
  valorTotal: number;
  debitosSelecionados?: any[];
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
    debitos: any[];
  } | null>(null);
  const [debitosAdicionais, setDebitosAdicionais] = useState<any[]>([]);

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
        const debitosSimulados = [
          {
            id: `nova_${Date.now()}_1`,
            praca: "Rodovia dos Bandeirantes - KM 45",
            valor: 11.30,
            data: "10/01/2025",
            hora: "08:15",
            placa: novaPlaca
          },
          {
            id: `nova_${Date.now()}_2`,
            praca: "Via Anhanguera - KM 67",
            valor: 8.90,
            data: "12/01/2025",
            hora: "14:22",
            placa: novaPlaca
          }
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F8F9FA] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003566] rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#003566]">Pedágio Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Título e Breadcrumb */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#003566] text-white rounded-full px-4 py-2 mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">RESUMO DO PEDIDO</span>
            </div>
            <h1 className="text-4xl font-bold text-[#000000] mb-4">
              Revise suas Pendências
            </h1>

          </div>

          {/* Card Principal */}
          <Card className="border border-[#E0E0E0] shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-[#000000] flex items-center gap-2">
                <Car className="h-6 w-6 text-[#00B4D8]" />
                Pendências Selecionadas
              </CardTitle>
              <p className="text-[#6C757D] mt-2">
                Selecione quais débitos deseja pagar agora
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Adicionar Nova Placa */}
              <div className="bg-gradient-to-r from-[#F0F9FF] to-[#E8F4FD] border border-[#00B4D8] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00B4D8] rounded-lg flex items-center justify-center">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#003566] text-sm">Consultar outra placa</h4>
                      <p className="text-xs text-[#6C757D]">Adicione débitos de outro veículo ao pagamento</p>
                    </div>
                  </div>
                  {!mostrandoFormularioNovaPlaca && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrandoFormularioNovaPlaca(true)}
                      className="text-xs h-8 px-3 border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
                
                {mostrandoFormularioNovaPlaca && (
                  <div className="space-y-3 pt-3 border-t border-[#00B4D8]/20">
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
                          className="w-full h-10 px-3 bg-white border border-[#E0E0E0] rounded-lg text-sm text-center font-semibold tracking-wider placeholder-[#6C757D] focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20"
                          maxLength={8}
                        />
                      </div>
                      <Button
                        onClick={buscarDebitosNovaPlaca}
                        disabled={novaPlaca.length < 7 || consultandoNovaPlaca}
                        size="sm"
                        className="h-10 px-4 bg-[#00B4D8] hover:bg-[#0099c7] text-white"
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMostrandoFormularioNovaPlaca(false);
                          setNovaPlaca('');
                        }}
                        className="h-10 px-3 border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {resultadoConsultaNovaPlaca && (
                      <div className="bg-white border border-[#E0E0E0] rounded-lg p-3">
                        {resultadoConsultaNovaPlaca.success ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-[#003566]">
                                  {resultadoConsultaNovaPlaca.quantidade} pendência{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''} encontrada{resultadoConsultaNovaPlaca.quantidade > 1 ? 's' : ''}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-[#00B4D8]">
                                {formatCurrency(resultadoConsultaNovaPlaca.valorTotal)}
                              </span>
                            </div>
                            <Button
                              onClick={adicionarDebitosNovaPlaca}
                              size="sm"
                              className="w-full h-8 bg-[#00B4D8] hover:bg-[#0099c7] text-white text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar ao pagamento
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-[#6C757D]" />
                            <span className="text-sm text-[#6C757D]">
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
                <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-[#003566] flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#003566] mb-2">
                        Filtrar por placa
                      </label>
                      <Select value={filtroPlaca} onValueChange={setFiltroPlaca}>
                        <SelectTrigger className="w-full h-10 bg-white border border-[#E0E0E0] text-sm">
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
                    <h4 className="font-semibold text-[#003566] text-sm uppercase tracking-wide">
                      {debitosFiltrados.length} Pendência{debitosFiltrados.length > 1 ? 's' : ''} {filtroPlaca === 'todas' ? 'Disponív' : 'Filtrada'}{debitosFiltrados.length > 1 ? 'eis' : 'el'}
                      {filtroPlaca !== 'todas' && (
                        <span className="text-[#00B4D8] ml-1">- {filtroPlaca}</span>
                      )}
                    </h4>
                    {debitosFiltrados.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={todosSelecionados ? desselecionarTodos : selecionarTodos}
                        className="text-xs h-8 px-3 border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white"
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
                              ? 'bg-[#E8F4FD] border-[#00B4D8] shadow-sm' 
                              : 'bg-[#F8F9FA] border-[#E0E0E0] hover:border-[#00B4D8] hover:shadow-sm'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDebitoSelecionado(debito.id)}
                            className="mt-1 transition-all duration-200 hover:scale-110"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                  isSelected ? 'text-[#003566]' : 'text-[#00B4D8]'
                                }`} />
                                <h3 className={`font-semibold text-base leading-tight transition-colors ${
                                  isSelected ? 'text-[#003566]' : 'text-[#000000]'
                                }`}>
                                  {debito.praca}
                                </h3>
                              </div>
                              <div className="text-right">
                                <span className={`font-bold text-lg whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-105 ${
                                  isSelected ? 'text-[#003566] hover:text-[#002a52]' : 'text-[#00B4D8] hover:text-[#0099c7]'
                                }`}>
                                  {formatCurrency(debito.valor)}
                                </span>
                                <Badge className="bg-orange-100 text-orange-800 text-xs ml-2">
                                  Pendente
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                                <Calendar className="h-3 w-3" />
                                <span>Data: 30/09/2025 {debito.data} • Hora: {debito.hora || '14:30'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
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
                    <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-4 text-center">
                      <p className="text-sm text-[#856404] font-medium">
                        Selecione pelo menos uma pendência para continuar
                      </p>
                    </div>
                  )}
                </div>
              ) : todosOsDebitos.length > 0 ? (
                <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-lg p-4 text-center">
                  <p className="text-sm text-[#856404] font-medium">
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
                <div className="flex justify-between items-center p-4 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                  <span className="text-[#000000] font-medium">Pendências de pedágio</span>
                  <span className="font-semibold text-[#00B4D8]">{formatCurrency(calcularValorTotal())}</span>
                </div>
              )}

              {/* Total */}
              <div className="border-t-2 border-[#E0E0E0] pt-6">
                <div className="bg-[#003566] text-white rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-semibold">Total a Pagar</span>
                    <span className="text-3xl font-bold">
                      {formatCurrency(calcularValorTotal())}
                    </span>
                  </div>
                  {todosOsDebitos.length > 0 && (
                    <p className="text-sm text-[#F8F9FA] opacity-90">
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
                  className={`w-full h-14 text-lg font-semibold rounded-lg transition-all ${
                    debitosSelecionadosResumo.length > 0
                      ? 'bg-[#00B4D8] hover:bg-[#0099c7] text-white hover:shadow-lg'
                      : 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="h-5 w-5 mr-3" />
                  Prosseguir para Pagamento - {formatCurrency(calcularValorTotal())}
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