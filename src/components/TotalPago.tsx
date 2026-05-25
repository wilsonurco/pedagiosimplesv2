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
  FileText,
  MapPin,
  Hash,
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
      hora: '14:20:00',
      valor: 28.10,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240115001',
      placas: ['ABC-1234', 'XYZ-9876', 'DEF-5555'],
      passagens: [
        { id: 'PASS-010101', placa: 'ABC-1234', rodovia: 'Rod. Presidente Dutra', praca: 'Praça de Pedágio BR-116 — KM 154', km: 154, data: '15/01/2025', hora: '14:32:07', valor: 8.90 },
        { id: 'PASS-010102', placa: 'ABC-1234', rodovia: 'Rod. dos Bandeirantes', praca: 'Praça de Pedágio SP-348 — KM 88', km: 88,  data: '15/01/2025', hora: '14:50:21', valor: 12.50 },
        { id: 'PASS-010103', placa: 'XYZ-9876', rodovia: 'Rod. Anhanguera',       praca: 'Pórtico Free Flow SP-330 — KM 45', km: 45, data: '15/01/2025', hora: '16:05:44', valor: 6.70 },
      ]
    },
    {
      id: '2',
      data: '12/01/2025',
      hora: '09:45:00',
      valor: 12.50,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240112002',
      placas: ['ABC-1234'],
      passagens: [
        { id: 'PASS-010201', placa: 'ABC-1234', rodovia: 'Rod. dos Bandeirantes', praca: 'Praça de Pedágio SP-348 — KM 88', km: 88, data: '12/01/2025', hora: '09:18:43', valor: 12.50 },
      ]
    },
    {
      id: '3',
      data: '08/01/2025',
      hora: '16:30:00',
      valor: 22.10,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240108003',
      placas: ['XYZ-9876', 'DEF-5555'],
      passagens: [
        { id: 'PASS-010301', placa: 'XYZ-9876', rodovia: 'Rod. Anhanguera',       praca: 'Pórtico Free Flow SP-330 — KM 45', km: 45, data: '08/01/2025', hora: '16:12:09', valor: 6.70 },
        { id: 'PASS-010302', placa: 'XYZ-9876', rodovia: 'Rod. Fernão Dias',      praca: 'Pórtico Free Flow BR-116 — KM 312', km: 312, data: '08/01/2025', hora: '16:40:55', valor: 9.60 },
        { id: 'PASS-010303', placa: 'DEF-5555', rodovia: 'Rod. dos Imigrantes',   praca: 'Pórtico Free Flow SP-160 — KM 9', km: 9, data: '08/01/2025', hora: '17:01:30', valor: 5.80 },
      ]
    },
    {
      id: '4',
      data: '05/01/2025',
      hora: '11:15:00',
      valor: 15.40,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP240105004',
      placas: ['ABC-1234'],
      passagens: [
        { id: 'PASS-010401', placa: 'ABC-1234', rodovia: 'Rod. Fernão Dias', praca: 'Praça de Pedágio BR-116 — KM 340', km: 340, data: '05/01/2025', hora: '11:05:52', valor: 15.40 },
      ]
    },
    {
      id: '5',
      data: '28/12/2024',
      hora: '13:55:00',
      valor: 9.80,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP241228005',
      placas: ['DEF-5555'],
      passagens: [
        { id: 'PASS-010501', placa: 'DEF-5555', rodovia: 'Rod. dos Imigrantes', praca: 'Pórtico Free Flow SP-160 — KM 9', km: 9, data: '28/12/2024', hora: '13:42:18', valor: 9.80 },
      ]
    },
    {
      id: '6',
      data: '22/12/2024',
      hora: '18:40:00',
      valor: 7.20,
      metodo: 'PIX',
      status: 'Aprovado',
      protocolo: 'FP241222006',
      placas: ['ABC-1234'],
      passagens: [
        { id: 'PASS-010601', placa: 'ABC-1234', rodovia: 'Rod. Castello Branco', praca: 'Praça de Pedágio SP-280 — KM 29', km: 29, data: '22/12/2024', hora: '18:20:45', valor: 7.20 },
      ]
    },
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
        <h1 className="text-3xl font-semibold text-[#5B2E8C]">Total Pago</h1>
        <p className="text-[#8A8B95]">Acompanhe seu histórico de pagamentos e estatísticas</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Total Gasto */}
        <Card className="relative overflow-hidden border border-[#DCDDE3] shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-[#8B5FFF] opacity-10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8B5FFF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-[#8A8B95] leading-tight">Total Pago</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#5B2E8C] leading-tight mt-1">
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
            <h2 className="text-xl font-semibold text-[#5B2E8C]">Histórico de Pagamentos</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[#8B5FFF] text-[#8B5FFF] hover:bg-[#8B5FFF] hover:text-white"
                onClick={() => {
                  // Gerar e baixar PDF com os dados dos pagamentos
                  const { jsPDF } = require('jspdf');
                  const doc = new jsPDF();
                  
                  // Header do documento
                  doc.setFontSize(20);
                  doc.setTextColor(0, 53, 102); // Cor #5B2E8C
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
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A8B95]" />
              <input
                type="text"
                placeholder="Buscar por rodovia, placa ou protocolo..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#DCDDE3] rounded-lg focus:outline-none focus:border-[#8B5FFF] focus:ring-2 focus:ring-[#8B5FFF]/20"
              />
            </div>
          </div>

          {/* Lista de Pagamentos */}
          <div className="space-y-3">
            {pagamentosFiltrados.length > 0 ? (
              pagamentosFiltrados.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="p-3 sm:p-4 border border-[#DCDDE3] rounded-lg hover:bg-[#F7F5FB] transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-[#0E8B5A] rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#5B2E8C] mb-1 text-sm leading-tight">
                            {pagamento.passagens.length} {pagamento.passagens.length === 1 ? 'passagem' : 'passagens'}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-[#1A1B23] text-sm">
                          R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>
                    <div className="ml-11 space-y-2">
                      <div className="flex flex-col gap-1 text-xs text-[#8A8B95]">
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
                            'bg-[#D4F0E2] text-[#0E8B5A] border-[#0E8B5A]' : 
                            'bg-[#F4EFFB] text-[#5B2E8C] border-[#5B2E8C]'
                          }`}
                        >
                          {pagamento.metodo}
                        </Badge>
                        <div className="text-xs text-[#8A8B95] text-right">
                          {pagamento.protocolo}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setComprovanteAberto(pagamento)}
                        className="w-full mt-2 border-[#8B5FFF] text-[#8B5FFF] hover:bg-[#8B5FFF] hover:text-white"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        Ver Comprovante
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-[#0E8B5A] rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#5B2E8C] mb-1 text-base leading-tight">
                          {pagamento.passagens.length} {pagamento.passagens.length === 1 ? 'passagem quitada' : 'passagens quitadas'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-[#8A8B95]">
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
                              'bg-[#D4F0E2] text-[#0E8B5A] border-[#0E8B5A]' : 
                              'bg-[#F4EFFB] text-[#5B2E8C] border-[#5B2E8C]'
                            }`}
                          >
                            {pagamento.metodo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-[#1A1B23] mb-1 text-base">
                          R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-xs text-[#8A8B95]">
                          {pagamento.protocolo}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setComprovanteAberto(pagamento)}
                        className="border-[#8B5FFF] text-[#8B5FFF] hover:bg-[#8B5FFF] hover:text-white"
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
                <Search className="w-12 h-12 text-[#C6C7CF] mx-auto mb-3" />
                <p className="text-[#8A8B95]">Nenhum pagamento encontrado com os filtros selecionados</p>
              </div>
            )}
          </div>

          {/* Paginação (simulada) */}
          {pagamentosFiltrados.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#DCDDE3]">
              <p className="text-sm text-[#8A8B95]">
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
            <DialogTitle className="flex items-center gap-2 text-[#5B2E8C]">
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
              <div className="text-center p-6 bg-[#D4F0E2] border border-[#A3D9BE] rounded-lg">
                <div className="w-16 h-16 bg-[#0E8B5A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#0E8B5A] mb-1">Pagamento Aprovado</h3>
                <p className="text-sm text-[#8A8B95]">Sua pendência foi quitada com sucesso</p>
              </div>

              {/* Detalhes da Transação */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#5B2E8C]">Detalhes da Transação</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#8A8B95] mb-1">Protocolo</p>
                    <p className="font-medium text-[#1A1B23]">{comprovanteAberto.protocolo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8B95] mb-1">Data e Hora</p>
                    <p className="font-medium text-[#1A1B23]">{comprovanteAberto.data} às {comprovanteAberto.hora}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#8A8B95] mb-1">
                      {comprovanteAberto.placas.length === 1 ? 'Placa do Veículo' : 'Placas dos Veículos'}
                    </p>
                    <p className="font-medium text-[#1A1B23]">{comprovanteAberto.placas.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8B95] mb-1">Método de Pagamento</p>
                    <Badge 
                      variant="outline" 
                      className="bg-[#D4F0E2] text-[#0E8B5A] border-[#0E8B5A] w-fit"
                    >
                      {comprovanteAberto.metodo}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8B95] mb-1">Status</p>
                    <Badge 
                      variant="outline" 
                      className="bg-[#D4F0E2] text-[#0E8B5A] border-[#0E8B5A] w-fit"
                    >
                      {comprovanteAberto.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Passagens individuais */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#8A8B95] uppercase tracking-widest">
                  Passagens ({comprovanteAberto.passagens.length})
                </h4>

                {comprovanteAberto.passagens.map((passagem: any) => (
                  <div key={passagem.id} className="border border-[#DCDDE3] rounded-lg overflow-hidden">

                    {/* Cabeçalho: placa + valor */}
                    <div className="flex items-start justify-between px-4 pt-4 pb-3">
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none">Número da Placa</p>
                        <p className="font-bold text-[#5B2E8C] text-base tracking-wide mt-1">{passagem.placa}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none">Valor</p>
                        <p className="font-bold text-[#5B2E8C] text-base mt-1">R$ {passagem.valor.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>

                    {/* Divisor */}
                    <div className="border-t border-[#DCDDE3] mx-4" />

                    {/* Grid de detalhes */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-3">
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">Data</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1">{passagem.data}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">Horário</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1">{passagem.hora}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">ID da Passagem</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1">{passagem.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">Placa do Veículo</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1 tracking-wide">{passagem.placa}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">Praça</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1 flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#8A8B95] flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{passagem.praca}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">Quilômetro</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1 flex items-center gap-1">
                          <Hash className="h-3.5 w-3.5 text-[#8A8B95] flex-shrink-0" />
                          km {passagem.km}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-wide leading-none">Rodovia</p>
                        <p className="text-sm font-semibold text-[#1A1B23] mt-1">{passagem.rodovia}</p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Valor Total */}
              <div className="p-4 bg-[#D4F0E2] border border-[#A3D9BE] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#5B2E8C]">Valor Total Pago</span>
                  <span className="font-bold text-[#0E8B5A]">
                    R$ {comprovanteAberto.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Avisos */}
              <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-lg p-4">
                <p className="text-xs text-[#2E1547] mb-2 font-semibold">Avisos Importantes:</p>
                <ul className="text-xs text-[#5B2E8C] space-y-1 list-disc list-inside">
                  <li>Este comprovante confirma o pagamento {comprovanteAberto.passagens.length === 1 ? 'da passagem' : 'das passagens'} de pedágio {comprovanteAberto.passagens.length === 1 ? 'listada' : 'listadas'} acima.</li>
                  <li>O pagamento não exclui multas por infrações de trânsito.</li>
                  <li>Guarde este comprovante para seus registros.</li>
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <Button
                  onClick={() => gerarPDFComprovante(comprovanteAberto)}
                  className="flex-1 bg-[#8B5FFF] hover:bg-[#7142B8]"
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