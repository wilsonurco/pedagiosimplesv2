import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { TipoPassagemBadge } from "./ui/tipo-passagem-badge";
import jsPDF from 'jspdf';
import {
  Search,
  Download,
  CheckCircle,
  CreditCard,
  Smartphone,
  FileText,
  Eye,
  Copy,
  Car,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PassagemPaga {
  id: string;
  portico: string;
  rodovia: string;
  concessionaria: string;
  sentido: string;
  data: string;
  hora: string;
  valor: number;
  placa: string;
  tipo: 'praca_fisica' | 'portico_free_flow';
  formaPagamento: 'pix' | 'cartao_elo' | 'cartao_visa' | 'cartao_master';
  transactionId: string;
  multa?: {
    economizada: number;
  };
}

interface HistoricoPagamentosProps {
  onIrParaPagamento?: (debitos: any[], valorTotal: number) => void;
}

const PASSAGENS_PAGAS: PassagemPaga[] = [
  {
    id: "PP-001",
    portico: "Pórtico SP-330 — KM 45",
    rodovia: "SP-330 (Rod. dos Bandeirantes)",
    concessionaria: "CCR AutoBan",
    sentido: "São Paulo → Campinas",
    data: "15/04/2026",
    hora: "07:42:00:00",
    valor: 4.30,
    placa: "MOV-1234",
    tipo: "portico_free_flow",
    formaPagamento: "pix",
    transactionId: "FPS-20260415-00142",
    multa: { economizada: 130.00 }
  },
  {
    id: "PP-002",
    portico: "Pórtico SP-021 — KM 18",
    rodovia: "SP-021 (Rod. Anchieta)",
    concessionaria: "Ecovias",
    sentido: "São Paulo → Santos",
    data: "10/04/2026",
    hora: "14:15:00:00",
    valor: 6.80,
    placa: "MOV-1234",
    tipo: "praca_fisica",
    formaPagamento: "cartao_elo",
    transactionId: "FPS-20260410-00089",
  },
  {
    id: "PP-003",
    portico: "Pórtico SP-270 — KM 33",
    rodovia: "SP-270 (Rod. Raposo Tavares)",
    concessionaria: "Arteris",
    sentido: "São Paulo → Sorocaba",
    data: "02/04/2026",
    hora: "18:50:00:00",
    valor: 5.10,
    placa: "MOV-1234",
    tipo: "portico_free_flow",
    formaPagamento: "pix",
    transactionId: "FPS-20260402-00211",
    multa: { economizada: 87.50 }
  },
  {
    id: "PP-004",
    portico: "Pórtico BR-116 — KM 312",
    rodovia: "BR-116 (Rod. Régis Bittencourt)",
    concessionaria: "Arteris",
    sentido: "São Paulo → Curitiba",
    data: "28/03/2026",
    hora: "10:05:00:00",
    valor: 9.20,
    placa: "MOV-1234",
    tipo: "praca_fisica",
    formaPagamento: "cartao_visa",
    transactionId: "FPS-20260328-00178",
  },
  {
    id: "PP-005",
    portico: "Pórtico SP-330 — KM 72",
    rodovia: "SP-330 (Rod. dos Bandeirantes)",
    concessionaria: "CCR AutoBan",
    sentido: "Campinas → São Paulo",
    data: "20/03/2026",
    hora: "19:30:00",
    valor: 4.30,
    placa: "MOV-1234",
    tipo: "portico_free_flow",
    formaPagamento: "pix",
    transactionId: "FPS-20260320-00055",
  },
  {
    id: "PP-006",
    portico: "Pórtico SP-280 — KM 29",
    rodovia: "SP-280 (Rod. Castelo Branco)",
    concessionaria: "CCR ViaOeste",
    sentido: "São Paulo → Sorocaba",
    data: "15/03/2026",
    hora: "08:20:00",
    valor: 3.80,
    placa: "MOV-1234",
    tipo: "praca_fisica",
    formaPagamento: "cartao_master",
    transactionId: "FPS-20260315-00312",
    multa: { economizada: 65.00 }
  },
  {
    id: "PP-007",
    portico: "Pórtico SP-160 — KM 9",
    rodovia: "SP-160 (Rod. dos Imigrantes)",
    concessionaria: "Ecovias",
    sentido: "São Paulo → Santos",
    data: "08/03/2026",
    hora: "11:45:00",
    valor: 6.80,
    placa: "MOV-1234",
    tipo: "portico_free_flow",
    formaPagamento: "cartao_visa",
    transactionId: "FPS-20260308-00421",
  },
  {
    id: "PP-008",
    portico: "Pórtico SP-348 — KM 55",
    rodovia: "SP-348 (Rod. dos Bandeirantes)",
    concessionaria: "CCR AutoBan",
    sentido: "São Paulo → Campinas",
    data: "01/03/2026",
    hora: "07:15:00",
    valor: 4.30,
    placa: "MOV-1234",
    tipo: "portico_free_flow",
    formaPagamento: "pix",
    transactionId: "FPS-20260301-00098",
  },
  {
    id: "PP-009",
    portico: "Pórtico SP-021 — KM 44",
    rodovia: "SP-021 (Rod. Anchieta)",
    concessionaria: "Ecovias",
    sentido: "Santos → São Paulo",
    data: "22/02/2026",
    hora: "16:20:00",
    valor: 6.80,
    placa: "MOV-1234",
    tipo: "praca_fisica",
    formaPagamento: "cartao_elo",
    transactionId: "FPS-20260222-00532",
    multa: { economizada: 200.00 }
  },
  {
    id: "PP-010",
    portico: "Pórtico BR-116 — KM 340",
    rodovia: "BR-116 (Rod. Régis Bittencourt)",
    concessionaria: "Arteris",
    sentido: "Curitiba → São Paulo",
    data: "14/02/2026",
    hora: "09:00:00",
    valor: 9.20,
    placa: "MOV-1234",
    tipo: "praca_fisica",
    formaPagamento: "cartao_master",
    transactionId: "FPS-20260214-00789",
  },
];

export function HistoricoPagamentos({ onIrParaPagamento }: HistoricoPagamentosProps = {}) {
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroConcessionaria, setFiltroConcessionaria] = useState('todas');
  const [filtroPlaca, setFiltroPlaca] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('todas');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  const [passagemSelecionada, setPassagemSelecionada] = useState<PassagemPaga | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const today = new Date();
  const getDaysAgo = (days: number): Date => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };

  const concessionarias = ['todas', ...Array.from(new Set(PASSAGENS_PAGAS.map(p => p.concessionaria)))];
  const placas = ['todas', ...Array.from(new Set(PASSAGENS_PAGAS.map(p => p.placa)))];

  const passagensFiltradas = PASSAGENS_PAGAS.filter(p => {
    if (filtroPeriodo !== 'todos') {
      const days = filtroPeriodo === '7d' ? 7 : filtroPeriodo === '30d' ? 30 : 90;
      if (parseDate(p.data) < getDaysAgo(days)) return false;
    }
    if (filtroConcessionaria !== 'todas' && p.concessionaria !== filtroConcessionaria) return false;
    if (filtroPlaca !== 'todas' && p.placa !== filtroPlaca) return false;
    if (filtroTipo !== 'todos' && p.tipo !== filtroTipo) return false;
    if (filtroFormaPagamento !== 'todas' && p.formaPagamento !== filtroFormaPagamento) return false;
    if (filtroTexto) {
      const q = filtroTexto.toLowerCase();
      if (
        !p.portico.toLowerCase().includes(q) &&
        !p.concessionaria.toLowerCase().includes(q) &&
        !p.placa.toLowerCase().includes(q) &&
        !p.transactionId.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const totalGasto = passagensFiltradas.reduce((s, p) => s + p.valor, 0);
  const totalPassagens = passagensFiltradas.length;
  const totalEconomia = passagensFiltradas
    .filter(p => p.multa)
    .reduce((s, p) => s + (p.multa?.economizada || 0), 0);

  const totalPaginas = Math.ceil(passagensFiltradas.length / itensPorPagina);
  const passagensPaginadas = passagensFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const abrirDetalhes = (passagem: PassagemPaga) => {
    setPassagemSelecionada(passagem);
    setModalAberto(true);
  };

  const gerarComprovantePDF = (passagem: PassagemPaga) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const violet: [number, number, number] = [91, 46, 140];
    const sand: [number, number, number] = [247, 245, 251];
    const border: [number, number, number] = [220, 221, 227];
    const gray: [number, number, number] = [138, 139, 149];
    const green: [number, number, number] = [14, 139, 90];
    const greenBg: [number, number, number] = [212, 240, 226];

    doc.setFillColor(...violet);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Pedágio Simples', 20, 22);
    doc.setFontSize(9);
    doc.text('Comprovante de Pagamento Free Flow', 20, 30);
    doc.setFontSize(11);
    doc.text('COMPROVANTE DE PASSAGEM', pageWidth - 20, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 26, { align: 'right' });

    doc.setTextColor(0, 0, 0);

    let y = 52;
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text('Número da Transação', 20, y);
    doc.setTextColor(...violet);
    doc.setFontSize(13);
    doc.text(passagem.transactionId, 20, y + 7);

    y += 22;
    doc.setFillColor(...sand);
    doc.rect(20, y, pageWidth - 40, 78, 'F');
    doc.setDrawColor(...border);
    doc.rect(20, y, pageWidth - 40, 78, 'S');

    y += 11;
    doc.setFontSize(10);
    doc.setTextColor(...violet);
    doc.text('DETALHES DA PASSAGEM', pageWidth / 2, y, { align: 'center' });

    const L = 28;
    const R = pageWidth / 2 + 12;

    const field = (label: string, value: string, lx: number, ly: number) => {
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text(label, lx, ly);
      doc.setFontSize(9);
      doc.setTextColor(26, 27, 35);
      doc.text(value, lx, ly + 6);
    };

    y += 12;
    field('Pórtico', passagem.portico, L, y);
    field('Concessionária', passagem.concessionaria, R, y);
    y += 18;
    field('Rodovia', passagem.rodovia, L, y);
    field('Sentido', passagem.sentido, R, y);
    y += 18;
    field('Data/Hora', `${passagem.data} às ${passagem.hora}`, L, y);
    field('Placa', passagem.placa, R, y);

    y += 24;
    doc.setFillColor(...violet);
    doc.rect(20, y, pageWidth - 40, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Valor Pago', L, y + 8);
    doc.setFontSize(13);
    doc.text(formatCurrency(passagem.valor), pageWidth - 28, y + 9, { align: 'right' });
    const formaPagamentoLabel = passagem.formaPagamento === 'pix' ? 'PIX'
      : passagem.formaPagamento === 'cartao_elo' ? 'Cartão ELO'
      : passagem.formaPagamento === 'cartao_visa' ? 'Cartão Visa'
      : 'Cartão Master';
    doc.setFontSize(8);
    doc.text(`Forma: ${formaPagamentoLabel}`, L, y + 17);

    if (passagem.multa) {
      y += 30;
      doc.setFillColor(...greenBg);
      doc.rect(20, y, pageWidth - 40, 20, 'F');
      doc.setDrawColor(163, 217, 190);
      doc.rect(20, y, pageWidth - 40, 20, 'S');
      doc.setTextColor(...green);
      doc.setFontSize(9);
      doc.text('Multa de evasão evitada — pagamento realizado no prazo', L, y + 8);
      doc.setFontSize(11);
      doc.text(`+ ${formatCurrency(passagem.multa.economizada)} economizado`, pageWidth - 28, y + 13, { align: 'right' });
    }

    const footerY = pageHeight - 28;
    doc.setDrawColor(...violet);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, pageWidth - 20, footerY);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text('Pedágio Simples — pedagiosimples.com.br | Documento gerado automaticamente', pageWidth / 2, footerY + 7, { align: 'center' });

    doc.save(`comprovante-${passagem.transactionId}.pdf`);
  };

  const exportarRelatorio = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const violet: [number, number, number] = [91, 46, 140];
    const sand: [number, number, number] = [247, 245, 251];
    const border: [number, number, number] = [220, 221, 227];
    const gray: [number, number, number] = [138, 139, 149];

    doc.setFillColor(...violet);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Pedágio Simples', 20, 22);
    doc.setFontSize(9);
    doc.text('Relatório de Histórico — Passagens Free Flow', 20, 30);
    doc.setFontSize(11);
    doc.text('RELATÓRIO DE PAGAMENTOS', pageWidth - 20, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 26, { align: 'right' });

    doc.setTextColor(0, 0, 0);

    let y = 52;
    doc.setFillColor(...sand);
    doc.rect(20, y, pageWidth - 40, 28, 'F');
    doc.setDrawColor(...border);
    doc.rect(20, y, pageWidth - 40, 28, 'S');
    y += 9;
    doc.setFontSize(9);
    doc.setTextColor(...violet);
    doc.text('RESUMO DO PERÍODO', pageWidth / 2, y, { align: 'center' });
    y += 9;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Total de passagens: ${totalPassagens}`, 28, y);
    doc.text(`Total pago: ${formatCurrency(totalGasto)}`, pageWidth / 2, y);
    doc.text(`Multas evitadas: ${formatCurrency(totalEconomia)}`, pageWidth - 80, y);

    y += 18;
    doc.setFillColor(...violet);
    doc.rect(20, y, pageWidth - 40, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    const cols = [28, 70, 110, 140, 165, 185];
    doc.text('Data/Hora', cols[0], y + 8);
    doc.text('Pórtico', cols[1], y + 8);
    doc.text('Concessionária', cols[2], y + 8);
    doc.text('Placa', cols[3], y + 8);
    doc.text('Pagto', cols[4], y + 8);
    doc.text('Valor', cols[5], y + 8);

    y += 16;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7.5);

    passagensFiltradas.forEach((p, i) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }
      if (i % 2 === 0) {
        doc.setFillColor(...sand);
        doc.rect(20, y - 4, pageWidth - 40, 10, 'F');
      }
      doc.text(`${p.data} ${p.hora}`, cols[0], y);
      doc.text(p.portico.length > 22 ? p.portico.slice(0, 22) + '…' : p.portico, cols[1], y);
      doc.text(p.concessionaria.length > 14 ? p.concessionaria.slice(0, 14) + '…' : p.concessionaria, cols[2], y);
      const pFormaPagamentoLabel = p.formaPagamento === 'pix' ? 'PIX'
        : p.formaPagamento === 'cartao_elo' ? 'ELO'
        : p.formaPagamento === 'cartao_visa' ? 'Visa'
        : 'Master';
      doc.text(p.placa, cols[3], y);
      doc.text(pFormaPagamentoLabel, cols[4], y);
      doc.text(formatCurrency(p.valor), cols[5], y);
      y += 10;
    });

    const footerY = pageHeight - 28;
    doc.setDrawColor(...violet);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, pageWidth - 20, footerY);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text('Pedágio Simples — pedagiosimples.com.br | Relatório gerado automaticamente', pageWidth / 2, footerY + 7, { align: 'center' });

    doc.save(`historico-pedagio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#5B2E8C]">Histórico de Pagamentos</h2>
        <p className="text-sm text-[#8A8B95] mt-0.5">Passagens Free Flow quitadas e comprovantes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border-2 bg-white border-[#DCDDE3] p-3 sm:p-4">
          <p className="text-xs text-[#8A8B95] uppercase tracking-wide">Total pago</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-[#5B2E8C] font-mono">{formatCurrency(totalGasto)}</p>
          <p className="text-xs text-[#8A8B95] mt-1">{totalPassagens} passagem{totalPassagens !== 1 ? 'ns' : ''}</p>
        </div>
        <div className="rounded-xl border-2 bg-white border-[#DCDDE3] p-3 sm:p-4">
          <p className="text-xs text-[#8A8B95] uppercase tracking-wide">Passagens</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-[#5B2E8C]">{totalPassagens}</p>
          <p className="text-xs text-[#8A8B95] mt-1">no período</p>
        </div>
        <div className="rounded-xl border-2 bg-[#D4F0E2] border-[#A3D9BE] p-3 sm:p-4">
          <p className="text-xs text-[#8A8B95] uppercase tracking-wide">Multas evitadas</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-[#0A6B45] font-mono">{formatCurrency(totalEconomia)}</p>
          <p className="text-xs text-[#8A8B95] mt-1">economia total</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-[#DCDDE3]">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {/* Search */}
            <div className="col-span-2 sm:col-span-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8A8B95]" />
              <input
                type="text"
                placeholder="Pórtico, placa, ID..."
                value={filtroTexto}
                onChange={e => { setFiltroTexto(e.target.value); setPaginaAtual(1); }}
                className="w-full pl-9 pr-3 h-9 bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg text-sm text-[#1A1B23] placeholder-[#8A8B95] focus:outline-none focus:border-[#8B5FFF] focus:ring-1 focus:ring-[#8B5FFF]/20"
              />
            </div>

            {/* Period */}
            <Select value={filtroPeriodo} onValueChange={v => { setFiltroPeriodo(v); setPaginaAtual(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB] text-[#1A1B23]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 3 meses</SelectItem>
                <SelectItem value="todos">Todo o período</SelectItem>
              </SelectContent>
            </Select>

            {/* Concessionária */}
            <Select value={filtroConcessionaria} onValueChange={v => { setFiltroConcessionaria(v); setPaginaAtual(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB] text-[#1A1B23]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {concessionarias.map(c => (
                  <SelectItem key={c} value={c}>
                    {c === 'todas' ? 'Todas as concessionárias' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tipo */}
            <Select value={filtroTipo} onValueChange={v => { setFiltroTipo(v); setPaginaAtual(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB] text-[#1A1B23]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="praca_fisica">Praça SPMAR</SelectItem>
                <SelectItem value="portico_free_flow">Pórtico Free Flow</SelectItem>
              </SelectContent>
            </Select>

            {/* Forma de pagamento */}
            <Select value={filtroFormaPagamento} onValueChange={v => { setFiltroFormaPagamento(v); setPaginaAtual(1); }}>
              <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB] text-[#1A1B23]">
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as formas</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_elo">Cartão ELO</SelectItem>
                <SelectItem value="cartao_visa">Cartão Visa</SelectItem>
                <SelectItem value="cartao_master">Cartão Master</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Button
              onClick={exportarRelatorio}
              variant="outline"
              className="h-9 text-sm border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white transition-colors"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction list */}
      <Card className="border border-[#DCDDE3]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#5B2E8C] flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {passagensFiltradas.length} passagem{passagensFiltradas.length !== 1 ? 'ns' : ''} encontrada{passagensFiltradas.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {passagensPaginadas.length > 0 ? (
            <>
              <div className="divide-y divide-[#DCDDE3]">
                {passagensPaginadas.map(p => (
                  <div key={p.id} className="p-3 sm:p-4 hover:bg-[#F7F5FB] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#D4F0E2] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-[#0E8B5A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[#1A1B23] text-sm leading-tight truncate">{p.portico}</p>
                              <TipoPassagemBadge tipo={p.tipo} />
                            </div>
                            <p className="text-xs text-[#8A8B95] mt-0.5">{p.concessionaria} · {p.sentido}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-[#8A8B95] flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {p.data} às {p.hora}
                              </span>
                              <span className="text-xs text-[#8A8B95] flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                <span className="font-mono tracking-wide">{p.placa}</span>
                              </span>
                              <span className="text-xs text-[#8A8B95] flex items-center gap-1">
                                {p.formaPagamento === 'pix'
                                  ? <Smartphone className="h-3 w-3" />
                                  : <CreditCard className="h-3 w-3" />
                                }
                                {p.formaPagamento === 'pix' ? 'PIX'
                                  : p.formaPagamento === 'cartao_elo' ? 'Cartão ELO'
                                  : p.formaPagamento === 'cartao_visa' ? 'Cartão Visa'
                                  : 'Cartão Master'}
                              </span>
                              {p.multa && (
                                <span className="text-xs text-[#0E8B5A] bg-[#D4F0E2] border border-[#A3D9BE] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Multa evitada: {formatCurrency(p.multa.economizada)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="font-bold text-[#5B2E8C] font-mono text-sm">{formatCurrency(p.valor)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirDetalhes(p)}
                              className="h-7 px-2 text-xs border-[#DCDDE3] text-[#5B2E8C] hover:border-[#8B5FFF] hover:text-[#8B5FFF]"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center justify-between p-3 sm:p-4 border-t border-[#DCDDE3]">
                  <span className="text-xs text-[#8A8B95]">
                    Página {paginaAtual} de {totalPaginas} · {passagensFiltradas.length} resultados
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="h-8 w-8 p-0 border-[#DCDDE3] text-[#5B2E8C]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="h-8 w-8 p-0 border-[#DCDDE3] text-[#5B2E8C]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F4EFFB] rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-[#8B5FFF]" />
              </div>
              <p className="text-[#1A1B23] font-medium">Nenhuma passagem encontrada</p>
              <p className="text-sm text-[#8A8B95] mt-1">Tente ajustar os filtros de período ou concessionária</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#5B2E8C]">Comprovante de Passagem</DialogTitle>
            <DialogDescription className="text-[#8A8B95]">
              Detalhes completos do pagamento Free Flow
            </DialogDescription>
          </DialogHeader>

          {passagemSelecionada && (
            <div className="space-y-4">
              {/* Transaction ID */}
              <div className="bg-[#F4EFFB] border border-[#8B5FFF]/30 rounded-lg p-3">
                <p className="text-xs text-[#8A8B95]">Número da Transação</p>
                <p className="font-mono font-semibold text-[#5B2E8C] tracking-wide mt-0.5">
                  {passagemSelecionada.transactionId}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#8A8B95]">Pórtico</p>
                  <p className="text-xs font-medium text-[#1A1B23] leading-tight mt-0.5">{passagemSelecionada.portico}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8B95]">Concessionária</p>
                  <p className="text-sm font-medium text-[#1A1B23] mt-0.5">{passagemSelecionada.concessionaria}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8B95]">Rodovia</p>
                  <p className="text-xs font-medium text-[#1A1B23] leading-tight mt-0.5">{passagemSelecionada.rodovia}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8B95]">Sentido</p>
                  <p className="text-xs font-medium text-[#1A1B23] leading-tight mt-0.5">{passagemSelecionada.sentido}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8B95]">Data/Hora</p>
                  <p className="text-sm font-medium text-[#1A1B23] mt-0.5">
                    {passagemSelecionada.data} às {passagemSelecionada.hora}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8B95]">Placa</p>
                  <p className="font-mono font-semibold text-[#1A1B23] tracking-[0.05em] uppercase mt-0.5">
                    {passagemSelecionada.placa}
                  </p>
                </div>
              </div>

              {/* Value */}
              <div className="bg-[#5B2E8C] text-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-75">Valor Pago</p>
                  <p className="font-bold text-xl font-mono mt-0.5">{formatCurrency(passagemSelecionada.valor)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Forma de pagamento</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    {passagemSelecionada.formaPagamento === 'pix'
                      ? <Smartphone className="h-4 w-4" />
                      : <CreditCard className="h-4 w-4" />
                    }
                    <span className="font-medium text-sm">
                      {passagemSelecionada.formaPagamento === 'pix' ? 'PIX'
                        : passagemSelecionada.formaPagamento === 'cartao_elo' ? 'Cartão ELO'
                        : passagemSelecionada.formaPagamento === 'cartao_visa' ? 'Cartão Visa'
                        : 'Cartão Master'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multa evitada */}
              {passagemSelecionada.multa && (
                <div className="bg-[#D4F0E2] border border-[#A3D9BE] rounded-lg p-3 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#0E8B5A] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[#0A6B45]">Multa de evasão evitada</p>
                    <p className="font-bold text-[#0A6B45] font-mono">
                      + {formatCurrency(passagemSelecionada.multa.economizada)} economizado
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(passagemSelecionada.transactionId)}
                  className="flex-1 border-[#DCDDE3] text-[#5B2E8C] hover:border-[#8B5FFF] hover:text-[#8B5FFF]"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copiar ID
                </Button>
                <Button
                  size="sm"
                  onClick={() => gerarComprovantePDF(passagemSelecionada)}
                  className="flex-1 bg-[#5B2E8C] hover:bg-[#7142B8] text-white"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
