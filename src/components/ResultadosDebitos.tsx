import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, CreditCard, Calendar, MapPin, Car, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Debito {
  id: string;
  praca: string;
  data: string;
  hora: string;
  valor: number;
  vencimento: string;
  status: 'pendente';
  placa: string;
}

interface ResultadosDebitosProps {
  onBack: () => void;
  onPagar: (debitosSelecionados: Debito[], valorTotal: number) => void;
  dadosVeiculo: any;
}

export function ResultadosDebitos({ onBack, onPagar, dadosVeiculo }: ResultadosDebitosProps) {
  // Dados mock dos débitos encontrados - todos com status pendente
  const debitos: Debito[] = [
    {
      id: "1",
      praca: "Praça de Pedágio Via Dutra - KM 142",
      data: "15/12/2024",
      hora: "14:30",
      valor: 8.90,
      vencimento: "30/12/2024",
      status: "pendente",
      placa: dadosVeiculo?.placa || "ABC-1234"
    },
    {
      id: "2", 
      praca: "Praça de Pedágio Fernão Dias - KM 85",
      data: "22/12/2024",
      hora: "09:15",
      valor: 12.50,
      vencimento: "06/01/2025",
      status: "pendente",
      placa: dadosVeiculo?.placa || "ABC-1234"
    },
    {
      id: "3",
      praca: "Praça de Pedágio Anhanguera - KM 23",
      data: "28/12/2024",
      hora: "16:45",
      valor: 6.70,
      vencimento: "12/01/2025", 
      status: "pendente",
      placa: dadosVeiculo?.placa || "ABC-1234"
    },
    {
      id: "4",
      praca: "Praça de Pedágio Imigrantes - KM 58",
      data: "02/01/2025",
      hora: "11:20",
      valor: 15.40,
      vencimento: "17/01/2025",
      status: "pendente",
      placa: "XYZ-9876"
    },
    {
      id: "5",
      praca: "Praça de Pedágio Bandeirantes - KM 72",
      data: "05/01/2025",
      hora: "18:10",
      valor: 9.80,
      vencimento: "20/01/2025",
      status: "pendente",
      placa: "XYZ-9876"
    },
    {
      id: "6",
      praca: "Praça de Pedágio Castello Branco - KM 34",
      data: "08/01/2025",
      hora: "13:45",
      valor: 7.20,
      vencimento: "23/01/2025",
      status: "pendente",
      placa: "DEF-5555"
    }
  ];

  // Estado para controlar quais débitos estão selecionados
  const [debitosSelecionados, setDebitosSelecionados] = useState<string[]>(
    debitos.map(d => d.id) // Todos selecionados por padrão
  );

  const totalDebitos = debitos.reduce((sum, debito) => sum + debito.valor, 0);
  
  // Calcular total dos selecionados
  const debitosParaPagar = debitos.filter(d => debitosSelecionados.includes(d.id));
  const totalSelecionado = debitosParaPagar.reduce((sum, debito) => sum + debito.valor, 0);
  const quantidadeSelecionada = debitosSelecionados.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString.split('/').reverse().join('-')).toLocaleDateString('pt-BR');
  };

  // Função para alternar seleção de um débito
  const toggleDebito = (debitoId: string) => {
    setDebitosSelecionados(prev => 
      prev.includes(debitoId) 
        ? prev.filter(id => id !== debitoId)
        : [...prev, debitoId]
    );
  };

  // Função para selecionar/desselecionar todos
  const toggleTodos = () => {
    if (debitosSelecionados.length === debitos.length) {
      setDebitosSelecionados([]);
    } else {
      setDebitosSelecionados(debitos.map(d => d.id));
    }
  };

  // Função para prosseguir com pagamento
  const handlePagar = () => {
    if (debitosSelecionados.length === 0) return;
    onPagar(debitosParaPagar, totalSelecionado);
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
              Nova consulta
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
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Título e informações do veículo */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#000000]">
              Pendências encontradas
            </h1>
            <p className="text-xl text-[#6C757D]">
              Placa: <span className="font-semibold text-[#003566]">{dadosVeiculo?.placa}</span>
            </p>
          </div>

          {/* Cards de resumo - Grid responsivo */}


          {/* Lista de débitos */}
          <Card className="border border-[#E0E0E0] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <CardTitle className="text-2xl text-[#000000] flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-[#003566]" />
                  Resumo das suas pendências
                </CardTitle>
                
                {/* Resumo Geral - Apenas quantidade e valor total */}
                <div className="bg-gradient-to-r from-[#F8F9FA] to-white rounded-lg p-6 border border-[#E0E0E0]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFD60A] rounded-lg flex items-center justify-center">
                        <Car className="h-6 w-6 text-[#000000]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#6C757D] uppercase tracking-wide">Total de Pendências</p>
                        <p className="text-2xl font-bold text-[#000000]">{debitos.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#003566] rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#6C757D] uppercase tracking-wide">Valor Total</p>
                        <p className="text-2xl font-bold text-[#000000]">{formatCurrency(totalDebitos)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00B4D8] rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#6C757D] uppercase tracking-wide">Status</p>
                        <p className="text-lg font-semibold text-red-600">Pendente</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aviso sobre privacidade */}
                <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-[#00B4D8] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-[#000000] mb-1">Resumo Simplificado</h4>
                      <p className="text-sm text-[#6C757D] leading-relaxed">
                        Por questões de privacidade, exibimos apenas o <strong>resumo geral</strong> das suas pendências.
                        Detalhes específicos de localização estarão disponíveis na área logada após o cadastro.
                      </p>
                    </div>
                  </div>
                </div>


              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* CTA Pagamento */}
              <div className="bg-gradient-to-r from-[#F8F9FA] to-white rounded-lg p-6 border border-[#E0E0E0]">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-[#000000]">
                    {quantidadeSelecionada > 0 
                      ? `Pagar ${quantidadeSelecionada} pendência${quantidadeSelecionada > 1 ? 's' : ''}` 
                      : 'Selecione o valor para pagar'
                    }
                  </h3>
                  
                  <p className="text-[#6C757D] max-w-2xl mx-auto">
                    {quantidadeSelecionada > 0 ? (
                      <>
                        Para prosseguir com o pagamento, você precisa fazer um cadastro rápido em nossa plataforma.
                        <br />
                        <strong>É rápido, seguro e sem taxa adicional!</strong>
                      </>
                    ) : (
                      <>
                        Escolha se deseja pagar o valor total ou apenas parte das suas pendências.
                        Você terá flexibilidade total no processo de pagamento.
                      </>
                    )}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button 
                      size="lg" 
                      onClick={handlePagar}
                      disabled={quantidadeSelecionada === 0}
                      className={`px-8 py-4 text-lg rounded-lg font-medium transition-colors ${
                        quantidadeSelecionada === 0 
                          ? 'opacity-50 cursor-not-allowed bg-[#6C757D]' 
                          : 'bg-[#003566] hover:bg-[#002a52] text-white'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {quantidadeSelecionada > 0 
                        ? `Pagar ${formatCurrency(totalSelecionado)}` 
                        : 'Selecione valor para pagar'
                      }
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={onBack}
                      className="px-8 py-4 text-lg border-[#6C757D] text-[#6C757D] hover:bg-[#F8F9FA] rounded-lg font-medium transition-colors"
                    >
                      Consultar outro veículo
                    </Button>
                  </div>
                  
                  {/* Informação adicional */}
                  {quantidadeSelecionada > 0 && quantidadeSelecionada < debitos.length && (
                    <div className="mt-4 p-4 bg-[#00B4D8] text-white rounded-lg">
                      <p className="text-sm">
                        💡 <strong>Dica:</strong> Você está pagando {quantidadeSelecionada} de {debitos.length} pendências. 
                        As pendências não pagas continuarão disponíveis para pagamento posterior.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}