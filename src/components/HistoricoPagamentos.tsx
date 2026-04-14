import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import jsPDF from 'jspdf';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  Smartphone,
  FileText,
  Eye,
  Copy,
  X,
  Car,
  AlertTriangle,
  ArrowRight
} from "lucide-react";


interface Transacao {
  id: string;
  data: string;
  valor: number;
  status: 'concluido' | 'pendente' | 'cancelado';
  veiculo: string;
  local: string;
  formaPagamento: 'pix' | 'cartao';
  numeroTransacao: string;
  categoria: string;
  multa?: {
    original: number;
    economizada: number;
  };
}

interface HistoricoPagamentosProps {
  onIrParaPagamento?: (debitos: any[], valorTotal: number) => void;
}

export function HistoricoPagamentos({ onIrParaPagamento }: HistoricoPagamentosProps = {}) {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('todos');
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Dados mock do histórico de transações
  const transacoes: Transacao[] = [
    {
      id: "TXN-001",
      data: "2025-01-10T14:30:00Z",
      valor: 28.10,
      status: "concluido",
      veiculo: "ABC-1234",
      local: "Via Dutra KM 142 - Jacareí/SP",
      formaPagamento: "pix",
      numeroTransacao: "FP20250110001",
      categoria: "Categoria 2 - Carro de passeio",
      multa: {
        original: 28.10,
        economizada: 195.23
      }
    },
    {
      id: "TXN-002",
      data: "2025-01-05T09:15:00Z", 
      valor: 45.80,
      status: "concluido",
      veiculo: "XYZ-5678",
      local: "Fernão Dias KM 85 - Atibaia/SP",
      formaPagamento: "cartao",
      numeroTransacao: "FP20250105002",
      categoria: "Categoria 3 - Caminhonete/Van"
    },
    {
      id: "TXN-003",
      data: "2024-12-28T16:45:00Z",
      valor: 52.30,
      status: "concluido", 
      veiculo: "ABC-1234",
      local: "Anhanguera KM 23 - Jundiaí/SP",
      formaPagamento: "cartao",
      numeroTransacao: "FP20241228003",
      categoria: "Categoria 2 - Carro de passeio",
      multa: {
        original: 52.30,
        economizada: 287.45
      }
    },
    {
      id: "TXN-004",
      data: "2024-12-20T11:20:00Z",
      valor: 75.90,
      status: "concluido",
      veiculo: "DEF-9012",
      local: "Imigrantes KM 58 - São Paulo/SP",
      formaPagamento: "pix",
      numeroTransacao: "FP20241220004",
      categoria: "Categoria 2 - Carro de passeio"
    },
    {
      id: "TXN-005",
      data: "2024-12-15T13:10:00Z",
      valor: 32.40,
      status: "concluido",
      veiculo: "GHI-3456",
      local: "Bandeirantes KM 72 - Campinas/SP",
      formaPagamento: "cartao",
      numeroTransacao: "FP20241215005",
      categoria: "Categoria 1 - Moto"
    },
    {
      id: "TXN-006",
      data: "2024-12-10T08:30:00Z",
      valor: 18.50,
      status: "pendente",
      veiculo: "JKL-7890",
      local: "Raposo Tavares KM 45 - Cotia/SP",
      formaPagamento: "pix",
      numeroTransacao: "FP20241210006",
      categoria: "Categoria 2 - Carro de passeio"
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', 
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'default' as const;
      case 'pendente':
        return 'secondary' as const;
      case 'cancelado':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const getFormaPagamentoIcon = (forma: string) => {
    switch (forma) {
      case 'pix':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'cartao':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getFormaPagamentoTexto = (forma: string) => {
    switch (forma) {
      case 'pix':
        return 'PIX';
      case 'cartao':
        return 'Cartão';
      default:
        return forma;
    }
  };

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter(transacao => {
    const matchTexto = transacao.local.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                       transacao.veiculo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                       transacao.numeroTransacao.toLowerCase().includes(filtroTexto.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || transacao.status === filtroStatus;
    const matchFormaPagamento = filtroFormaPagamento === 'todos' || transacao.formaPagamento === filtroFormaPagamento;
    
    return matchTexto && matchStatus && matchFormaPagamento;
  });

  // Paginação
  const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina);
  const transacoesPaginadas = transacoesFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Estatísticas do período
  const totalGasto = transacoesFiltradas
    .filter(t => t.status === 'concluido')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const totalTransacoes = transacoesFiltradas.filter(t => t.status === 'concluido').length;
  
  const totalEconomiaMultas = transacoesFiltradas
    .filter(t => t.status === 'concluido' && t.multa)
    .reduce((sum, t) => sum + (t.multa?.economizada || 0), 0);

  const generatePDFInvoice = (transacao: Transacao) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Cores do Pedágio Simples
    const primaryColor = [0, 53, 102]; // #003566
    const secondaryColor = [0, 180, 216]; // #00B4D8
    const yellowColor = [255, 214, 10]; // #FFD60A
    const grayColor = [108, 117, 125]; // #6C757D
    
    // Header com logo e informações da empresa
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo Pedágio Simples
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Pedágio Simples', 20, 25);
    doc.setFontSize(10);
    doc.text('Pagamentos de Pedágio', 20, 32);
    
    // Título do comprovante
    doc.setFontSize(14);
    doc.text('COMPROVANTE DE PAGAMENTO', pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(10);
    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Emitido em: ${dataEmissao}`, pageWidth - 20, 28, { align: 'right' });
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
    
    // Informações da empresa
    let yPos = 55;
    doc.setFontSize(10);
    doc.text('Pedágio Online Soluções Digitais Ltda.', 20, yPos);
    doc.text('CNPJ: 12.345.678/0001-90', 20, yPos + 5);
    doc.text('Endereço: Av. Paulista, 1000 - São Paulo/SP', 20, yPos + 10);
    doc.text('CEP: 01310-100 | Tel: 0800 123 4567', 20, yPos + 15);
    
    // Linha separadora
    yPos += 25;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    // Título principal
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('DETALHES DA TRANSAÇÃO', pageWidth / 2, yPos, { align: 'center' });
    
    // Box com informações da transação
    yPos += 20;
    doc.setFillColor(248, 249, 250);
    doc.rect(20, yPos, pageWidth - 40, 80, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.rect(20, yPos, pageWidth - 40, 80, 'S');
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Informações em duas colunas
    const leftCol = 25;
    const rightCol = pageWidth / 2 + 10;
    
    doc.text(`Número da Transação: ${transacao.numeroTransacao}`, leftCol, yPos);
    doc.text(`Status: ${transacao.status === 'concluido' ? 'Pago' : transacao.status}`, rightCol, yPos);
    
    yPos += 10;
    doc.text(`Data/Hora: ${formatDateTime(transacao.data)}`, leftCol, yPos);
    doc.text(`Valor: ${formatCurrency(transacao.valor)}`, rightCol, yPos);
    
    yPos += 10;
    doc.text(`Veículo: ${transacao.veiculo}`, leftCol, yPos);
    doc.text(`Pagamento: ${getFormaPagamentoTexto(transacao.formaPagamento)}`, rightCol, yPos);
    
    yPos += 10;
    doc.text(`Local: ${transacao.local}`, leftCol, yPos);
    doc.text(`Categoria: ${transacao.categoria}`, leftCol, yPos + 10);
    
    // Observações importantes
    yPos += 35;
    doc.setFillColor(255, 248, 220);
    doc.rect(20, yPos, pageWidth - 40, 35, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.rect(20, yPos, pageWidth - 40, 35, 'S');
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(133, 77, 14);
    doc.text('ℹ️ INFORMAÇÕES IMPORTANTES', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(9);
    doc.text('• Este comprovante é válido para fins de quitação do débito de pedágio', 25, yPos);
    doc.text('• A quitação não exclui multas por infrações de trânsito', 25, yPos + 5);
    doc.text('• Para dúvidas, entre em contato: 0800 123 4567', 25, yPos + 10);
    
    // Footer
    yPos = pageHeight - 30;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Pedágio Online - Soluções Digitais para Pagamento de Pedágio', pageWidth / 2, yPos, { align: 'center' });
    doc.text('www.pedagioonline.com.br | contato@pedagioonline.com.br | Suporte 24/7', pageWidth / 2, yPos + 5, { align: 'center' });
    doc.text('Documento gerado automaticamente - Válido sem assinatura', pageWidth / 2, yPos + 10, { align: 'center' });
    
    // Download do PDF
    const nomeArquivo = `comprovante-${transacao.numeroTransacao}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
  };

  const exportarHistorico = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Cores do Pedágio Online
    const primaryColor = [0, 53, 102]; // #003566
    const secondaryColor = [0, 180, 216]; // #00B4D8
    const yellowColor = [255, 214, 10]; // #FFD60A
    const grayColor = [108, 117, 125]; // #6C757D
    
    // Header com logo e informações da empresa
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo Pedágio Online
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Pedágio Online', 20, 25);
    doc.setFontSize(10);
    doc.text('Pagamentos de Pedágio', 20, 32);
    
    // Título do relatório
    doc.setFontSize(14);
    doc.text('RELATÓRIO DE HISTÓRICO DE PAGAMENTOS', pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(10);
    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Emitido em: ${dataEmissao}`, pageWidth - 20, 28, { align: 'right' });
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
    
    // Informações da empresa
    let yPos = 55;
    doc.setFontSize(10);
    doc.text('Pedágio Online Soluções Digitais Ltda.', 20, yPos);
    doc.text('CNPJ: 12.345.678/0001-90', 20, yPos + 5);
    doc.text('Endereço: Av. Paulista, 1000 - São Paulo/SP', 20, yPos + 10);
    doc.text('CEP: 01310-100 | Tel: 0800 123 4567', 20, yPos + 15);
    
    // Linha separadora
    yPos += 25;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    // Título principal
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('HISTÓRICO DE PAGAMENTOS DE PEDÁGIO', pageWidth / 2, yPos, { align: 'center' });
    
    // Resumo estatístico
    yPos += 20;
    doc.setFillColor(248, 249, 250);
    doc.rect(20, yPos, pageWidth - 40, 35, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.rect(20, yPos, pageWidth - 40, 35, 'S');
    
    yPos += 12;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('RESUMO DO PERÍODO', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Estatísticas lado a lado
    const leftCol = 25;
    const rightCol = pageWidth - 100;
    
    doc.text(`Total de Transações: ${totalTransacoes}`, leftCol, yPos);
    doc.text(`Total Pago: ${formatCurrency(totalGasto)}`, rightCol, yPos);
    
    doc.text(`Transações Filtradas: ${transacoesFiltradas.length}`, leftCol, yPos + 8);
    
    // Cabeçalho da tabela
    yPos += 30;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, yPos, pageWidth - 40, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    
    // Cabeçalhos das colunas
    const colWidths = {
      data: 25,
      transacao: 35,
      veiculo: 20,
      valor: 25,
      status: 15,
      pagamento: 25
    };
    
    let xPos = 25;
    doc.text('Data', xPos, yPos + 10);
    xPos += colWidths.data;
    doc.text('Transação', xPos, yPos + 10);
    xPos += colWidths.transacao;
    doc.text('Veículo', xPos, yPos + 10);
    xPos += colWidths.veiculo;
    doc.text('Valor', xPos, yPos + 10);
    xPos += colWidths.valor;
    doc.text('Status', xPos, yPos + 10);
    xPos += colWidths.status;
    doc.text('Pagamento', xPos, yPos + 10);
    
    yPos += 20;
    
    // Dados das transações
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    
    transacoesFiltradas.slice(0, 10).forEach((transacao) => {
      xPos = 25;
      
      // Data
      doc.text(new Date(transacao.data).toLocaleDateString('pt-BR'), xPos, yPos + 5);
      
      xPos += colWidths.data;
      // Número da transação
      doc.text(transacao.numeroTransacao, xPos, yPos + 5);
      
      xPos += colWidths.transacao;
      // Veículo
      doc.text(transacao.veiculo, xPos, yPos + 5);
      
      xPos += colWidths.veiculo;
      // Valor
      doc.text(formatCurrency(transacao.valor), xPos, yPos + 5);
      
      xPos += colWidths.valor;
      // Status
      if (transacao.status === 'concluido') {
        doc.setTextColor(34, 197, 94);
      } else if (transacao.status === 'pendente') {
        doc.setTextColor(234, 179, 8);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(transacao.status.charAt(0).toUpperCase() + transacao.status.slice(1), xPos, yPos + 5);
      doc.setTextColor(0, 0, 0);
      
      xPos += colWidths.status;
      // Forma de pagamento
      doc.text(getFormaPagamentoTexto(transacao.formaPagamento), xPos, yPos + 5);
      
      yPos += 12;
    });
    
    // Informações importantes no final
    yPos += 15;
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 40;
    }
    
    doc.setFillColor(255, 248, 220);
    doc.rect(20, yPos, pageWidth - 40, 35, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.rect(20, yPos, pageWidth - 40, 35, 'S');
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(133, 77, 14);
    doc.text('ℹ️ INFORMAÇÕES IMPORTANTES', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(9);
    doc.text('• Este relatório contém apenas as transações filtradas selecionadas', 25, yPos);
    doc.text('• Comprovantes individuais podem ser baixados através do botão "Detalhes"', 25, yPos + 5);
    doc.text('• O pagamento da passagem não exclui multas por infrações de trânsito', 25, yPos + 10);
    doc.text('• Para dúvidas ou esclarecimentos, entre em contato: 0800 123 4567', 25, yPos + 15);
    
    // Footer
    yPos = pageHeight - 30;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Pedágio Online - Soluções Digitais para Pagamento de Pedágio', pageWidth / 2, yPos, { align: 'center' });
    doc.text('www.pedagioonline.com.br | contato@pedagioonline.com.br | Suporte 24/7', pageWidth / 2, yPos + 5, { align: 'center' });
    doc.text('Relatório gerado automaticamente - Documento válido sem assinatura', pageWidth / 2, yPos + 10, { align: 'center' });
    
    // Download do PDF
    const nomeArquivo = `historico-pagamentos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        {/* Pagamentos Pendentes - Card interativo */}
        <Card 
          className="border-2 border-[#FF4757] bg-[#FFF5F5] shadow-sm hover:shadow-md cursor-pointer transition-all"
          onClick={() => {
            // Simular débitos pendentes para ir direto ao pagamento
            const debitosMock = [
              {
                id: '1',
                dataPassagem: '2024-01-15',
                horario: '14:30',
                praca: 'Praça de Pedágio Imigrantes KM 23',
                rodovia: 'Rod. dos Imigrantes',
                valor: 10.70,
                placa: 'ABC-1234',
                categoria: 'Categoria 1',
                selecionado: true
              },
              {
                id: '2', 
                dataPassagem: '2024-01-20',
                horario: '09:15',
                praca: 'Praça de Pedágio Anhanguera KM 45',
                rodovia: 'Rod. Anhanguera',
                valor: 10.70,
                placa: 'ABC-1234',
                categoria: 'Categoria 1',
                selecionado: true
              }
            ];
            
            // Navegar para o fluxo de pagamento
            if (onIrParaPagamento) {
              onIrParaPagamento(debitosMock, 21.40);
            }
          }}
        >
          <CardContent className="pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[#6C757D] leading-tight">Pagamentos Pendentes</p>
                <p className="text-lg sm:text-2xl font-bold text-[#FF4757] leading-tight mt-1">
                  R$ 21,40
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-[#FF4757]" />
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#FF4757]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Pago */}
        <Card className="border border-[#E0E0E0] shadow-sm">
          <CardContent className="pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[#6C757D] leading-tight">Total Pago</p>
                <p className="text-lg sm:text-2xl font-bold text-[#003566] leading-tight mt-1">
                  {formatCurrency(totalGasto)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-[#003566]/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-[#003566]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Local, placa ou transação..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Pagamento</label>
              <Select value={filtroFormaPagamento} onValueChange={setFiltroFormaPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as formas</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Ações</label>
              <Button 
                onClick={exportarHistorico}
                variant="outline" 
                className="w-full flex items-center gap-2 bg-gradient-to-r from-[#003566] to-[#004080] text-white hover:from-[#002a52] hover:to-[#003566] hover:text-gray-300 border-none shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <p className="text-sm text-gray-600">
            {transacoesFiltradas.length} transação(ões) encontrada(s)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transacoesPaginadas.length > 0 ? (
              <>
                {transacoesPaginadas.map((transacao) => (
                  <div key={transacao.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(transacao.status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {transacao.local}
                              </h4>
                              <Badge variant={getStatusVariant(transacao.status)} className="text-xs">
                                {transacao.status === 'concluido' ? 'Pago' : 
                                 transacao.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>Veículo: {transacao.veiculo}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDateTime(transacao.data)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getFormaPagamentoIcon(transacao.formaPagamento)}
                                <span>{getFormaPagamentoTexto(transacao.formaPagamento)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{transacao.numeroTransacao}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            {formatCurrency(transacao.valor)}
                          </p>

                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => setTransacaoSelecionada(transacao)}
                            >
                              <Eye className="h-4 w-4" />
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Transação</DialogTitle>
                              <DialogDescription>
                                Informações completas sobre esta transação de pedágio.
                              </DialogDescription>
                            </DialogHeader>
                            
                            {transacaoSelecionada && (
                              <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Número da Transação</p>
                                      <p className="font-semibold">{transacaoSelecionada.numeroTransacao}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Status</p>
                                      <Badge variant={getStatusVariant(transacaoSelecionada.status)}>
                                        {transacaoSelecionada.status === 'concluido' ? 'Pago' : 
                                         transacaoSelecionada.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Data/Hora</p>
                                      <p className="font-medium">{formatDateTime(transacaoSelecionada.data)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Valor</p>
                                      <p className="font-bold text-[#003566]">{formatCurrency(transacaoSelecionada.valor)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Veículo</p>
                                      <p className="font-medium">{transacaoSelecionada.veiculo}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Pagamento</p>
                                      <div className="flex items-center gap-1">
                                        {getFormaPagamentoIcon(transacaoSelecionada.formaPagamento)}
                                        <span className="font-medium">{getFormaPagamentoTexto(transacaoSelecionada.formaPagamento)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-gray-600 text-sm">Local</p>
                                    <p className="font-medium">{transacaoSelecionada.local}</p>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <p className="text-gray-600 text-sm">Categoria</p>
                                    <p className="font-medium">{transacaoSelecionada.categoria}</p>
                                  </div>
                                  
                                  {transacaoSelecionada.multa && (
                                    <div className="mt-4 p-3 bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-lg">
                                      <p className="text-sm font-medium text-[#003566] mb-2">💰 Economia com Pagamento Antecipado</p>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <p className="text-gray-600">Valor Original</p>
                                          <p className="font-bold text-red-600">{formatCurrency(transacaoSelecionada.multa.original)}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Economia</p>
                                          <p className="font-bold text-green-600">{formatCurrency(transacaoSelecionada.multa.economizada)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(transacaoSelecionada.numeroTransacao);
                                    }}
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar Número
                                  </Button>
                                  
                                  <Button 
                                    onClick={() => generatePDFInvoice(transacaoSelecionada)}
                                    size="sm"
                                    className="flex-1 bg-[#003566] hover:bg-[#002a52]"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar PDF
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Página {paginaAtual} de {totalPaginas}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                        disabled={paginaAtual === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                        disabled={paginaAtual === totalPaginas}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou verifique se há transações no período selecionado.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}