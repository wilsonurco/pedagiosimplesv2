import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Car,
  CheckCircle,
  Download,
  Filter,
  Search,
  DollarSign,
  Eye,
  FileText
} from "lucide-react";
import { BrazilianRealIcon } from "./BrazilianRealIcon";
import jsPDF from 'jspdf';

interface TotalPagoProps {
  dadosUsuario?: any;
}

export function TotalPago({ dadosUsuario }: TotalPagoProps) {
  const [buscaTexto, setBuscaTexto] = useState('');
  const [comprovanteAberto, setComprovanteAberto] = useState<any>(null);

  // Mock de dados de pagamentos realizados
  const pagamentosRealizados = [
    {
      id: '1',
      data: '15/01/2025',
      hora: '14:20',
      valor: 28.10,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240115001',
      placas: ['ABC-1234', 'XYZ-9876', 'DEF-5555'],
      passagens: [
        { placa: 'ABC-1234', rodovia: 'Rod. Presidente Dutra', valor: 8.90 },
        { placa: 'ABC-1234', rodovia: 'Rod. dos Bandeirantes', valor: 12.50 },
        { placa: 'XYZ-9876', rodovia: 'Rod. Anhanguera', valor: 6.70 }
      ]
    },
    {
      id: '2',
      data: '12/01/2025',
      hora: '09:45',
      valor: 12.50,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240112002',
      placas: ['ABC-1234'],
      passagens: [
        { placa: 'ABC-1234', rodovia: 'Rod. dos Bandeirantes', valor: 12.50 }
      ]
    },
    {
      id: '3',
      data: '08/01/2025',
      hora: '16:30',
      valor: 22.10,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240108003',
      placas: ['XYZ-9876', 'DEF-5555'],
      passagens: [
        { placa: 'XYZ-9876', rodovia: 'Rod. Anhanguera', valor: 6.70 },
        { placa: 'XYZ-9876', rodovia: 'Rod. Fernão Dias', valor: 9.60 },
        { placa: 'DEF-5555', rodovia: 'Rod. dos Imigrantes', valor: 5.80 }
      ]
    },
    {
      id: '4',
      data: '05/01/2025',
      hora: '11:15',
      valor: 15.40,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240105004',
      placas: ['ABC-1234'],
      passagens: [
        { placa: 'ABC-1234', rodovia: 'Rod. Fernão Dias', valor: 15.40 }
      ]
    },
    {
      id: '5',
      data: '28/12/2024',
      hora: '13:55',
      valor: 9.80,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP241228005',
      placas: ['DEF-5555'],
      passagens: [
        { placa: 'DEF-5555', rodovia: 'Rod. dos Imigrantes', valor: 9.80 }
      ]
    },
    {
      id: '6',
      data: '22/12/2024',
      hora: '18:40',
      valor: 7.20,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP241222006',
      placas: ['ABC-1234'],
      passagens: [
        { placa: 'ABC-1234', rodovia: 'Rod. Castello Branco', valor: 7.20 }
      ]
    }
  ];

  const totalPago = pagamentosRealizados.reduce((acc, pagamento) => acc + pagamento.valor, 0);
  const totalTransacoes = pagamentosRealizados.length;
  const pagamentosEsteMes = pagamentosRealizados.filter(p => p.data.includes('01/2025')).length;
  const valorEsteMes = pagamentosRealizados
    .filter(p => p.data.includes('01/2025'))
    .reduce((acc, p) => acc + p.valor, 0);

  const pagamentosFiltrados = pagamentosRealizados.filter(pagamento => {
    const placasStr = pagamento.placas.join(' ');
    const passagensStr = pagamento.passagens.map(p => p.rodovia).join(' ');
    return placasStr.toLowerCase().includes(buscaTexto.toLowerCase()) ||
           passagensStr.toLowerCase().includes(buscaTexto.toLowerCase()) ||
           pagamento.protocolo.toLowerCase().includes(buscaTexto.toLowerCase());
  });

  const gerarPDFComprovante = (pagamento: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header - Logo e título
    doc.setFillColor(0, 53, 102);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Pedágio Online', 20, 25);
    
    doc.setFontSize(12);
    doc.text('Comprovante de Pagamento', pageWidth - 20, 25, { align: 'right' });

    yPos = 50;

    // Informações da empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Pedágio Online Tecnologia LTDA', 20, yPos);
    yPos += 5;
    doc.text('CNPJ: 12.345.678/0001-90', 20, yPos);
    yPos += 5;
    doc.text('Endereço: Rua das Tecnologias, 123 - São Paulo/SP', 20, yPos);
    yPos += 5;
    doc.text('Telefone: (11) 3000-1234 | E-mail: contato@pedagioonline.com.br', 20, yPos);
    yPos += 15;

    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;

    // Título do comprovante
    doc.setFontSize(16);
    doc.setTextColor(0, 53, 102);
    doc.text('COMPROVANTE DE PAGAMENTO DE PEDÁGIO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Dados da transação
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Número da Transação: ${pagamento.protocolo}`, 20, yPos);
    yPos += 8;
    doc.text(`Data/Hora: ${pagamento.data} às ${pagamento.hora}`, 20, yPos);
    yPos += 8;
    doc.text(`Status: ${pagamento.status.toUpperCase()}`, 20, yPos);
    yPos += 8;
    doc.text(`Veículo(s): ${pagamento.placas.join(', ')}`, 20, yPos);
    yPos += 15;

    // Box com valor total
    doc.setFillColor(240, 255, 240);
    doc.rect(20, yPos, pageWidth - 40, 20, 'F');
    doc.setDrawColor(0, 180, 0);
    doc.rect(20, yPos, pageWidth - 40, 20, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`VALOR TOTAL PAGO: R$ ${pagamento.valor.toFixed(2).replace('.', ',')}`, pageWidth / 2, yPos + 12, { align: 'center' });
    yPos += 35;

    // Forma de pagamento
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Forma de Pagamento: ${pagamento.metodo}`, 20, yPos);
    yPos += 20;

    // Detalhes das passagens agrupadas por placa
    doc.setFontSize(14);
    doc.setTextColor(0, 53, 102);
    doc.text('DETALHES DAS PASSAGENS QUITADAS:', 20, yPos);
    yPos += 10;

    // Agrupar passagens por placa
    const passagensPorPlaca = pagamento.passagens.reduce((acc: any, passagem: any) => {
      if (!acc[passagem.placa]) {
        acc[passagem.placa] = [];
      }
      acc[passagem.placa].push(passagem);
      return acc;
    }, {});

    // Renderizar cada grupo de placa
    Object.entries(passagensPorPlaca).forEach(([placa, passagens]: [string, any], groupIndex) => {
      // Título da placa
      doc.setFontSize(11);
      doc.setTextColor(0, 53, 102);
      doc.setFont(undefined, 'bold');
      doc.text(`Veículo: ${placa}`, 20, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');

      // Cabeçalho da tabela
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, pageWidth - 40, 7, 'F');
      doc.text('RODOVIA', 25, yPos + 5);
      doc.text('VALOR', pageWidth - 60, yPos + 5);
      yPos += 7;

      // Passagens da placa
      let subtotal = 0;
      passagens.forEach((passagem: any, index: number) => {
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPos, pageWidth - 40, 7, 'F');
        }
        doc.text(passagem.rodovia, 25, yPos + 5);
        doc.text(`R$ ${passagem.valor.toFixed(2).replace('.', ',')}`, pageWidth - 60, yPos + 5);
        subtotal += passagem.valor;
        yPos += 7;
      });

      // Subtotal da placa
      if (Object.keys(passagensPorPlaca).length > 1) {
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos, pageWidth - 40, 7, 'F');
        doc.setFont(undefined, 'bold');
        doc.text('Subtotal:', 25, yPos + 5);
        doc.text(`R$ ${subtotal.toFixed(2).replace('.', ',')}`, pageWidth - 60, yPos + 5);
        doc.setFont(undefined, 'normal');
        yPos += 7;
      }

      yPos += 5; // Espaço entre grupos
    });

    // Total geral
    yPos += 5;
    doc.setFillColor(240, 255, 240);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setDrawColor(0, 180, 0);
    doc.rect(20, yPos, pageWidth - 40, 8, 'S');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text('TOTAL GERAL:', 25, yPos + 5.5);
    doc.text(`R$ ${pagamento.valor.toFixed(2).replace('.', ',')}`, pageWidth - 60, yPos + 5.5);
    doc.setFont(undefined, 'normal');
    yPos += 18;

    // Avisos importantes
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('AVISO IMPORTANTE:', 20, yPos);
    yPos += 6;
    doc.text('• Este comprovante confirma o pagamento das passagens de pedágio listadas acima.', 20, yPos);
    yPos += 5;
    doc.text('• O pagamento da passagem de pedágio não exclui multas por infrações de trânsito.', 20, yPos);
    yPos += 5;
    doc.text('• Em caso de dúvidas, entre em contato através dos canais oficiais do Pedágio Online.', 20, yPos);
    yPos += 15;

    // Footer
    doc.setFillColor(245, 245, 245);
    doc.rect(0, doc.internal.pageSize.getHeight() - 25, pageWidth, 25, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Pedágio Online - Sua tranquilidade nas estradas', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text('www.pedagioonline.com.br | contato@pedagioonline.com.br | (11) 3000-1234', pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });

    // Salvar o PDF
    doc.save(`comprovante-pedagioonline-${pagamento.protocolo}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header da Página */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold text-[#003566]">Total Pago</h1>
        <p className="text-[#6C757D]">Acompanhe seu histórico de pagamentos e estatísticas</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Total Gasto */}
        <Card className="relative overflow-hidden border border-[#E0E0E0] shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-[#00B4D8] opacity-10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#6C757D] leading-tight">Total Pago</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#003566] leading-tight mt-1">
                    R$ {totalPago.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>






      </div>

      {/* Resumo Mensal */}


      {/* Histórico de Pagamentos */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#003566]">Histórico de Pagamentos</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white"
                onClick={() => {
                  // Gerar e baixar PDF com os dados dos pagamentos
                  const { jsPDF } = require('jspdf');
                  const doc = new jsPDF();
                  
                  // Header do documento
                  doc.setFontSize(20);
                  doc.setTextColor(0, 53, 102); // Cor #003566
                  doc.text('Pedágio Online - Relatório de Pagamentos', 20, 30);
                  
                  // Informações do usuário
                  doc.setFontSize(12);
                  doc.setTextColor(0, 0, 0);
                  doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);
                  doc.text(`Usuário: ${dadosUsuario?.nome || 'Usuário Pedágio Online'}`, 20, 60);
                  
                  // Linha separadora
                  doc.line(20, 70, 190, 70);
                  
                  // Título da seção
                  doc.setFontSize(14);
                  doc.setTextColor(0, 53, 102);
                  doc.text('Resumo de Pagamentos Realizados', 20, 85);
                  
                  // Dados dos pagamentos (usando dados mockados como exemplo)
                  const pagamentos = [
                    { data: '15/01/2025', descricao: 'Pagamento de 3 pendências', valor: 'R$ 27,10', status: 'Pago' },
                    { data: '10/01/2025', descricao: 'Pagamento de 2 pendências', valor: 'R$ 18,60', status: 'Pago' },
                    { data: '05/01/2025', descricao: 'Pagamento de 1 pendência', valor: 'R$ 8,90', status: 'Pago' }
                  ];
                  
                  let yPosition = 100;
                  doc.setFontSize(10);
                  doc.setTextColor(0, 0, 0);
                  
                  // Header da tabela
                  doc.setFont(undefined, 'bold');
                  doc.text('Data', 20, yPosition);
                  doc.text('Descrição', 50, yPosition);
                  doc.text('Valor', 140, yPosition);
                  doc.text('Status', 170, yPosition);
                  
                  yPosition += 10;
                  doc.line(20, yPosition - 5, 190, yPosition - 5);
                  
                  // Dados da tabela
                  doc.setFont(undefined, 'normal');
                  pagamentos.forEach((pagamento) => {
                    doc.text(pagamento.data, 20, yPosition);
                    doc.text(pagamento.descricao, 50, yPosition);
                    doc.text(pagamento.valor, 140, yPosition);
                    doc.text(pagamento.status, 170, yPosition);
                    yPosition += 15;
                  });
                  
                  // Total
                  yPosition += 10;
                  doc.line(20, yPosition - 5, 190, yPosition - 5);
                  doc.setFont(undefined, 'bold');
                  doc.setFontSize(12);
                  doc.setTextColor(0, 53, 102);
                  doc.text('Total Pago: R$ 54,60', 140, yPosition);
                  
                  // Footer
                  doc.setFontSize(8);
                  doc.setTextColor(108, 117, 125);
                  doc.text('Documento gerado automaticamente pelo Pedágio Online', 20, 280);
                  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 290);
                  
                  // Salvar o PDF
                  doc.save(`PedagioOnline-Pagamentos-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#6C757D]" />
              <input
                type="text"
                placeholder="Buscar por rodovia, placa ou protocolo..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20"
              />
            </div>
          </div>

          {/* Lista de Pagamentos */}
          <div className="space-y-3">
            {pagamentosFiltrados.length > 0 ? (
              pagamentosFiltrados.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="p-3 sm:p-4 border border-[#E0E0E0] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-[#28A745] rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#003566] mb-1 text-sm leading-tight">
                            {pagamento.passagens.length} {pagamento.passagens.length === 1 ? 'passagem' : 'passagens'}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-[#000000] text-sm">
                          R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>
                    <div className="ml-11 space-y-2">
                      <div className="flex flex-col gap-1 text-xs text-[#6C757D]">
                        <span>{pagamento.data} às {pagamento.hora}</span>
                        <span>
                          {pagamento.placas.length === 1 
                            ? `Placa ${pagamento.placas[0]}`
                            : `${pagamento.placas.length} placas: ${pagamento.placas.join(', ')}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs w-fit ${pagamento.metodo === 'PIX' ? 
                            'bg-[#E8F5E8] text-[#28A745] border-[#28A745]' : 
                            'bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]'
                          }`}
                        >
                          {pagamento.metodo}
                        </Badge>
                        <div className="text-xs text-[#6C757D] text-right">
                          {pagamento.protocolo}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setComprovanteAberto(pagamento)}
                        className="w-full mt-2 border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        Ver Comprovante
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-[#28A745] rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#003566] mb-1 text-base leading-tight">
                          {pagamento.passagens.length} {pagamento.passagens.length === 1 ? 'passagem quitada' : 'passagens quitadas'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-[#6C757D]">
                          <span className="whitespace-nowrap">{pagamento.data} às {pagamento.hora}</span>
                          <span className="whitespace-nowrap">
                            {pagamento.placas.length === 1 
                              ? `Placa ${pagamento.placas[0]}`
                              : `${pagamento.placas.length} placas`
                            }
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${pagamento.metodo === 'PIX' ? 
                              'bg-[#E8F5E8] text-[#28A745] border-[#28A745]' : 
                              'bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]'
                            }`}
                          >
                            {pagamento.metodo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-[#000000] mb-1 text-base">
                          R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-[#6C757D]">
                          {pagamento.protocolo}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setComprovanteAberto(pagamento)}
                        className="border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Comprovante
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" />
                <p className="text-[#6C757D]">Nenhum pagamento encontrado com os filtros selecionados</p>
              </div>
            )}
          </div>

          {/* Paginação (simulada) */}
          {pagamentosFiltrados.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#E0E0E0]">
              <p className="text-sm text-[#6C757D]">
                Mostrando {pagamentosFiltrados.length} de {pagamentosRealizados.length} pagamentos
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog do Comprovante */}
      <Dialog open={!!comprovanteAberto} onOpenChange={(open) => !open && setComprovanteAberto(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#003566]">
              <FileText className="w-5 h-5" />
              Comprovante de Pagamento
            </DialogTitle>
            <DialogDescription>
              Visualize os detalhes completos do pagamento e exporte o comprovante em PDF
            </DialogDescription>
          </DialogHeader>
          
          {comprovanteAberto && (
            <div className="space-y-6">
              {/* Status do Pagamento */}
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-16 h-16 bg-[#28A745] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#28A745] mb-1">Pagamento Aprovado</h3>
                <p className="text-sm text-gray-600">Sua pendência foi quitada com sucesso</p>
              </div>

              {/* Detalhes da Transação */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#003566]">Detalhes da Transação</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6C757D] mb-1">Protocolo</p>
                    <p className="font-medium text-[#000000]">{comprovanteAberto.protocolo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6C757D] mb-1">Data e Hora</p>
                    <p className="font-medium text-[#000000]">{comprovanteAberto.data} às {comprovanteAberto.hora}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#6C757D] mb-1">
                      {comprovanteAberto.placas.length === 1 ? 'Placa do Veículo' : 'Placas dos Veículos'}
                    </p>
                    <p className="font-medium text-[#000000]">{comprovanteAberto.placas.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6C757D] mb-1">Método de Pagamento</p>
                    <Badge 
                      variant="outline" 
                      className="bg-[#E8F5E8] text-[#28A745] border-[#28A745] w-fit"
                    >
                      {comprovanteAberto.metodo}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[#6C757D] mb-1">Status</p>
                    <Badge 
                      variant="outline" 
                      className="bg-[#E8F5E8] text-[#28A745] border-[#28A745] w-fit"
                    >
                      {comprovanteAberto.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Passagens Agrupadas por Placa */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#003566]">Passagens Quitadas</h4>
                {(() => {
                  // Agrupar passagens por placa
                  const passagensPorPlaca = comprovanteAberto.passagens.reduce((acc: any, passagem: any) => {
                    if (!acc[passagem.placa]) {
                      acc[passagem.placa] = [];
                    }
                    acc[passagem.placa].push(passagem);
                    return acc;
                  }, {});

                  return Object.entries(passagensPorPlaca).map(([placa, passagens]: [string, any]) => {
                    const subtotal = passagens.reduce((sum: number, p: any) => sum + p.valor, 0);
                    
                    return (
                      <div key={placa} className="border border-[#E0E0E0] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-[#003566]" />
                            <span className="font-semibold text-[#003566]">{placa}</span>
                          </div>
                          {Object.keys(passagensPorPlaca).length > 1 && (
                            <span className="text-sm text-[#6C757D]">
                              Subtotal: R$ {subtotal.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {passagens.map((passagem: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-[#F8F9FA] p-2 rounded">
                              <span className="text-[#6C757D]">{passagem.rodovia}</span>
                              <span className="font-medium text-[#000000]">
                                R$ {passagem.valor.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Valor Total */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#003566]">Valor Total Pago</span>
                  <span className="font-bold text-[#28A745]">
                    R$ {comprovanteAberto.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Avisos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 mb-2 font-semibold">Avisos Importantes:</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Este comprovante confirma o pagamento {comprovanteAberto.passagens.length === 1 ? 'da passagem' : 'das passagens'} de pedágio {comprovanteAberto.passagens.length === 1 ? 'listada' : 'listadas'} acima.</li>
                  <li>O pagamento não exclui multas por infrações de trânsito.</li>
                  <li>Guarde este comprovante para seus registros.</li>
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <Button
                  onClick={() => gerarPDFComprovante(comprovanteAberto)}
                  className="flex-1 bg-[#00B4D8] hover:bg-[#0096B8]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button
                  onClick={() => setComprovanteAberto(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}