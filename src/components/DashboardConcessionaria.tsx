import { useState, useMemo, useCallback } from "react";
import {
  DollarSign,
  LogOut,
  Download,
  FileText,
  ChevronRight,
  ArrowLeft,
  Calendar,
  TrendingUp,
  BarChart2,
  AlignLeft,
  LineChart as LineChartIcon,
  Search,
  ChevronDown,
  Eye,
  X,
  CheckCircle,
  MapPin,
  Hash,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LogoCinza from "../imports/LogoCinza";
import { exportarRepasse } from "../utils/exportRepasse";

interface DashboardConcessionariaProps {
  dadosGestor: any;
  onLogout: () => void;
}

// ── Pedidos Pagos ─────────────────────────────────────────────────────────────
type Metodo = "PIX" | "Cartão" | "Boleto";

interface PedidoPago {
  id: string;
  passagens: number;
  data: string;
  hora: string;
  placas: number;
  metodo: Metodo;
  valor: number;
}

// Primeiros 10 itens replicam exatamente o screenshot
const _primeirosDez: PedidoPago[] = [
  { id: "p0001", passagens: 12, data: "21/03/2026", hora: "06:53", placas: 12, metodo: "PIX",    valor: 64.80  },
  { id: "p0002", passagens:  6, data: "01/03/2026", hora: "00:10", placas:  6, metodo: "PIX",    valor: 12.30  },
  { id: "p0003", passagens: 12, data: "30/03/2026", hora: "23:57", placas: 12, metodo: "PIX",    valor: 57.00  },
  { id: "p0004", passagens:  8, data: "30/03/2026", hora: "22:56", placas:  8, metodo: "PIX",    valor: 32.40  },
  { id: "p0005", passagens:  4, data: "30/03/2026", hora: "22:38", placas:  4, metodo: "PIX",    valor: 16.20  },
  { id: "p0006", passagens: 12, data: "30/03/2026", hora: "23:58", placas: 12, metodo: "PIX",    valor: 57.00  },
  { id: "p0007", passagens: 30, data: "30/03/2026", hora: "22:36", placas: 30, metodo: "PIX",    valor: 162.00 },
  { id: "p0008", passagens:  8, data: "30/03/2026", hora: "22:45", placas:  8, metodo: "PIX",    valor: 32.40  },
  { id: "p0009", passagens:  6, data: "30/03/2026", hora: "21:39", placas:  6, metodo: "PIX",    valor: 32.40  },
  { id: "p0010", passagens:  4, data: "30/03/2026", hora: "21:21", placas:  4, metodo: "PIX",    valor: 21.60  },
];

const _datas = [
  "30/03/2026","29/03/2026","28/03/2026","27/03/2026","26/03/2026",
  "25/03/2026","24/03/2026","21/03/2026","20/03/2026","19/03/2026",
  "18/03/2026","17/03/2026","14/03/2026","13/03/2026","10/03/2026",
  "07/03/2026","04/03/2026","03/03/2026","01/03/2026",
];
const _passagensOpts = [4, 6, 8, 10, 12, 15, 20, 30, 6, 8, 4, 12, 6, 10, 8, 4];
const _metodos: Metodo[] = ["PIX","PIX","PIX","PIX","PIX","PIX","PIX","PIX","PIX","PIX"];

const _restante: PedidoPago[] = Array.from({ length: 443 }, (_, i) => {
  const idx = i + 10;
  const passagens = _passagensOpts[idx % _passagensOpts.length];
  const metodo = _metodos[idx % _metodos.length];
  const valor = +(passagens * (idx % 4 === 0 ? 5.40 : idx % 4 === 1 ? 4.05 : idx % 4 === 2 ? 3.24 : 2.70)).toFixed(2);
  const hh = String((idx * 3 + 8) % 24).padStart(2, "0");
  const mm = String((idx * 17 + 5) % 60).padStart(2, "0");
  return {
    id: `p${String(idx + 1).padStart(4, "0")}`,
    passagens,
    data: _datas[idx % _datas.length],
    hora: `${hh}:${mm}`,
    placas: passagens,
    metodo,
    valor,
  };
});

const PEDIDOS_MARCO: PedidoPago[] = [..._primeirosDez, ..._restante];
const TOTAL_PEDIDOS_MARCO = 453;
const TOTAL_VALOR_MARCO = 19178.40;
const ITEMS_PER_PAGE_PEDIDOS = 10;

const MESES_LABEL: Record<string, string> = {
  "10/2025": "Outubro de 2025",
  "11/2025": "Novembro de 2025",
  "12/2025": "Dezembro de 2025",
  "01/2026": "Janeiro de 2026",
  "02/2026": "Fevereiro de 2026",
  "03/2026": "Março de 2026",
  "04/2026": "Abril de 2026",
  "05/2026": "Maio de 2026",
  "06/2026": "Junho de 2026",
};

type Tab = "repasse" | "pedidos-pagos";
type DetalheView = "tabela" | "grafico";
type GraficoTipo = "colunas" | "linhas";

const repassePorPeriodo = [
  { periodo: "10/2025", mes: null, valor: 0 },
  { periodo: "11/2025", mes: null, valor: 0 },
  { periodo: "12/2025", mes: null, valor: 0 },
  { periodo: "01/2026", mes: null, valor: 0 },
  { periodo: "02/2026", mes: "Fevereiro de 2026", valor: 32.4 },
  { periodo: "03/2026", mes: null, valor: 0 },
  { periodo: "04/2026", mes: "Abril de 2026", valor: 1343907.2 },
  { periodo: "05/2026", mes: null, valor: 0 },
  { periodo: "06/2026", mes: null, valor: 0 },
];

// 27 títulos — todos em abril de 2026
const detalheAbril: { data: string; valor: number }[] = [
  { data: "30/04/2026", valor: 60074.6 },
  { data: "29/04/2026", valor: 59250.8 },
  { data: "28/04/2026", valor: 57829.75 },
  { data: "27/04/2026", valor: 128228.45 },
  { data: "26/04/2026", valor: 180.5 },
  { data: "25/04/2026", valor: 106.9 },
  { data: "24/04/2026", valor: 30650.75 },
  { data: "23/04/2026", valor: 56768.15 },
  { data: "22/04/2026", valor: 110993.6 },
  { data: "17/04/2026", valor: 98432.1 },
  { data: "16/04/2026", valor: 87341.2 },
  { data: "15/04/2026", valor: 76219.8 },
  { data: "14/04/2026", valor: 65432.5 },
  { data: "11/04/2026", valor: 54321.9 },
  { data: "10/04/2026", valor: 102543.75 },
  { data: "09/04/2026", valor: 89012.3 },
  { data: "08/04/2026", valor: 43218.6 },
  { data: "07/04/2026", valor: 67890.45 },
  { data: "04/04/2026", valor: 32109.8 },
  { data: "03/04/2026", valor: 78654.3 },
  { data: "02/04/2026", valor: 56432.7 },
  { data: "01/04/2026", valor: 44321.15 },
  { data: "21/04/2026", valor: 21098.4 },
  { data: "20/04/2026", valor: 18765.2 },
  { data: "19/04/2026", valor: 15432.6 },
  { data: "18/04/2026", valor: 12109.8 },
  { data: "05/04/2026", valor: 8965.5 },
];

const detalheFev: { data: string; valor: number }[] = [
  { data: "14/02/2026", valor: 32.4 },
];

const detalhesPorPeriodo: Record<string, { data: string; valor: number }[]> = {
  "04/2026": detalheAbril,
  "02/2026": detalheFev,
};

const totalRepassado = repassePorPeriodo.reduce((acc, r) => acc + r.valor, 0);
const ITEMS_PER_PAGE = 10;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value}`;
}

function parseDate(str: string): Date {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-[#003566] mb-1">{label}</p>
      <p className="text-[#6C757D]">
        Valor Acumulado:{" "}
        <span className="font-semibold text-[#003566]">
          {formatBRL(payload[0]?.value ?? 0)}
        </span>
      </p>
    </div>
  );
}

// ── Dados dinâmicos do comprovante ───────────────────────────────────────────
const _RODOVIAS = ["Rod. Presidente Dutra", "Rod. Anhanguera", "Rod. Bandeirantes"];
const _PRACAS   = ["Praça 1", "Praça 2", "Praça 3"];
const _KMS      = [45, 61, 78];
const _LETRAS   = ["ABC", "DEF", "GHI", "JKL", "MNO", "PQR", "STU", "VWX"];

interface PassagemDetalhe {
  idPassagem: string;
  placa: string;
  rodovia: string;
  praca: string;
  km: number;
  data: string;
  hora: string;
  valor: number;
}

function gerarDadosComprovante(pedido: PedidoPago): {
  protocolo: string;
  passagens: PassagemDetalhe[];
} {
  const idNum = parseInt(pedido.id.replace("p", ""), 10);
  const protocolo = `FP${pedido.data.split("/").reverse().join("").slice(2)}${String(idNum).padStart(4, "0")}`;

  // Converte hora base em minutos totais para poder somar por passagem
  const [hBase, mBase] = pedido.hora.split(":").map(Number);
  const minBase = hBase * 60 + mBase;

  const passagens: PassagemDetalhe[] = [];
  for (let i = 0; i < pedido.placas; i++) {
    const seed    = idNum * 100 + i;
    const idx     = seed % 3;
    const letra1  = _LETRAS[seed % _LETRAS.length];
    const letra2  = _LETRAS[(seed + 2) % _LETRAS.length];
    const placa   = `${letra1}${letra2[0]}-${String(1000 + (seed * 37) % 9000)}`;
    const idPass  = `PASS-${String(seed * 3 + 10001).padStart(6, "0")}`;
    // Cada passagem ocorre alguns segundos depois da anterior
    const secBase  = minBase * 60 + ((seed * 7) % 60);
    const secTotal = (secBase + i * 43) % (24 * 3600);
    const hh = String(Math.floor(secTotal / 3600)).padStart(2, "0");
    const mm = String(Math.floor((secTotal % 3600) / 60)).padStart(2, "0");
    const ss = String(secTotal % 60).padStart(2, "0");
    passagens.push({
      idPassagem: idPass,
      placa,
      rodovia: _RODOVIAS[idx],
      praca:   _PRACAS[idx],
      km:      _KMS[idx],
      data:    pedido.data,
      hora:    `${hh}:${mm}:${ss}`,
      valor:   +( pedido.valor / pedido.placas).toFixed(2),
    });
  }

  return { protocolo, passagens };
}

export function DashboardConcessionaria({ onLogout }: DashboardConcessionariaProps) {
  const [tabAtiva, setTabAtiva] = useState<Tab>("repasse");
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | null>(null);
  const [detalheView, setDetalheView] = useState<DetalheView>("tabela");
  const [graficoTipo, setGraficoTipo] = useState<GraficoTipo>("colunas");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalPedido, setModalPedido] = useState<PedidoPago | null>(null);

  // Modal exportar repasse
  const [modalExportar, setModalExportar] = useState(false);
  const [exportMes, setExportMes] = useState("04/2026");
  const [exportFormato, setExportFormato] = useState<"pdf" | "excel">("pdf");
  const [exportTipo, setExportTipo] = useState<"consolidado" | "detalhado">("consolidado");

  // Filtros — Pedidos pagos
  const [filtroMes, setFiltroMes] = useState("03/2026");
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [paginaPedidos, setPaginaPedidos] = useState(1);

  const pedidosFiltrados = useMemo(() => {
    if (filtroMes !== "03/2026") return [];
    return PEDIDOS_MARCO.filter((p) => {
      const matchPlaca = filtroPlaca === "" || p.placas.toString().includes(filtroPlaca);
      const matchMetodo = filtroMetodo === "todos" ||
        (filtroMetodo === "pix" && p.metodo === "PIX") ||
        (filtroMetodo === "cartao" && p.metodo === "Cartão") ||
        (filtroMetodo === "boleto" && p.metodo === "Boleto");
      return matchPlaca && matchMetodo;
    });
  }, [filtroMes, filtroPlaca, filtroMetodo]);

  const totalPaginasPedidos = Math.ceil(pedidosFiltrados.length / ITEMS_PER_PAGE_PEDIDOS);
  const itensPedidosPagina = pedidosFiltrados.slice(
    (paginaPedidos - 1) * ITEMS_PER_PAGE_PEDIDOS,
    paginaPedidos * ITEMS_PER_PAGE_PEDIDOS
  );

  const handleFiltroMes = useCallback((mes: string) => {
    setFiltroMes(mes);
    setPaginaPedidos(1);
  }, []);

  const abrirDetalhe = (periodo: string) => {
    if (!detalhesPorPeriodo[periodo]) return;
    setPeriodoSelecionado(periodo);
    setPaginaAtual(1);
    setDetalheView("tabela");
  };

  const voltarLista = () => setPeriodoSelecionado(null);

  const detalhes = periodoSelecionado ? (detalhesPorPeriodo[periodoSelecionado] ?? []) : [];
  const totalPaginas = Math.ceil(detalhes.length / ITEMS_PER_PAGE);
  const itensPagina = detalhes.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);
  const totalDetalhe = detalhes.reduce((acc, d) => acc + d.valor, 0);
  const valorMedio = detalhes.length > 0 ? totalDetalhe / detalhes.length : 0;
  const mesLabel = repassePorPeriodo.find((r) => r.periodo === periodoSelecionado)?.mes ?? periodoSelecionado;

  // Dados acumulativos para o gráfico (ordenados por data crescente)
  const chartData = useMemo(() => {
    const sorted = [...detalhes].sort(
      (a, b) => parseDate(a.data).getTime() - parseDate(b.data).getTime()
    );
    let acumulado = 0;
    return sorted.map((item) => {
      acumulado += item.valor;
      return {
        data: item.data.slice(0, 5), // dd/MM
        acumulado,
      };
    });
  }, [detalhes]);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="w-44 h-10">
            <LogoCinza />
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-[#6C757D] hover:text-[#003566] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-2 py-3">
          <button
            onClick={() => { setTabAtiva("repasse"); setPeriodoSelecionado(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tabAtiva === "repasse" ? "bg-[#003566] text-white" : "text-[#6C757D] hover:text-[#003566]"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Repasse
          </button>
          <button
            onClick={() => { setTabAtiva("pedidos-pagos"); setPeriodoSelecionado(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tabAtiva === "pedidos-pagos" ? "bg-[#003566] text-white" : "text-[#6C757D] hover:text-[#003566]"
            }`}
          >
            <FileText className="h-4 w-4" />
            Pedidos pagos
          </button>
        </div>
      </div>

      <div className="max-w-[1084px] mx-auto px-6 py-8">

        {/* ── LISTA DE REPASSE ── */}
        {tabAtiva === "repasse" && !periodoSelecionado && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#003566] rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#003566]">Repasse de Saldo</h1>
                  <p className="text-sm text-[#6C757D]">Relatório de rebatimento de saldo por período</p>
                </div>
              </div>
              <button
                onClick={() => setModalExportar(true)}
                className="w-10 h-10 bg-[#003566] hover:bg-[#002a52] rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6C757D] mb-1">Total Repassado</p>
                  <p className="text-2xl font-bold text-[#003566]">{formatBRL(totalRepassado)}</p>
                </div>
                <div className="bg-[#E8F0F9] text-[#003566] text-sm font-semibold px-4 py-1.5 rounded-full">
                  {repassePorPeriodo.length} meses
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 px-6 py-3 bg-[#F8F9FA] border-b border-gray-100">
              <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Período</span>
              <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide text-right">Valor Repassado</span>
            </div>
            {repassePorPeriodo.map((row) => {
              const hasDetail = !!detalhesPorPeriodo[row.periodo];
              return (
                <div
                  key={row.periodo}
                  onClick={() => abrirDetalhe(row.periodo)}
                  className={`group flex items-center px-6 py-3.5 border-b border-gray-50 transition-colors ${
                    hasDetail ? "cursor-pointer hover:bg-[#F0F4F9]" : "cursor-default"
                  }`}
                >
                  <span className="flex-1 text-sm text-[#333333]">{row.periodo}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${row.valor > 0 ? "text-[#003566] font-medium" : "text-[#333333]"}`}>
                      {formatBRL(row.valor)}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 flex-shrink-0 transition-all duration-150 ${
                        hasDetail
                          ? "text-[#003566] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5"
                          : "text-gray-200 opacity-30"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 px-6 py-4 bg-[#F8F9FA]">
              <span className="text-sm font-semibold text-[#333333]">Total</span>
              <span className="text-sm font-bold text-[#003566] text-right">{formatBRL(totalRepassado)}</span>
            </div>
          </div>
        )}

        {/* ── DETALHE DO PERÍODO ── */}
        {tabAtiva === "repasse" && periodoSelecionado && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Cabeçalho */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h1 className="text-xl font-semibold text-[#003566]">
                  Detalhes do <span className="font-bold">Repasse</span>
                </h1>
                <div className="mt-2">
                  <div className="inline-flex items-center gap-1.5 bg-[#EEF2F7] text-[#003566] text-xs font-medium px-3 py-1.5 rounded-lg">
                    <Calendar className="h-3.5 w-3.5" />
                    {mesLabel}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
                  <button
                    onClick={() => setDetalheView("tabela")}
                    className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                      detalheView === "tabela" ? "bg-[#003566] text-white" : "text-[#6C757D] hover:bg-gray-50"
                    }`}
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                    Tabela
                  </button>
                  <button
                    onClick={() => setDetalheView("grafico")}
                    className={`flex items-center gap-1.5 px-3 py-2 transition-colors border-l border-gray-200 ${
                      detalheView === "grafico" ? "bg-[#003566] text-white" : "text-[#6C757D] hover:bg-gray-50"
                    }`}
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    Gráfico
                  </button>
                </div>
                <button
                  onClick={voltarLista}
                  className="flex items-center gap-1.5 bg-[#003566] hover:bg-[#002a52] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
              </div>
            </div>

            {/* Seletor de tipo de gráfico — só aparece na aba Gráfico */}
            {detalheView === "grafico" && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart2 className="h-4 w-4 text-[#003566]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#003566]">Tipo de Gráfico</p>
                    <p className="text-xs text-[#6C757D]">Selecione a visualização desejada</p>
                  </div>
                </div>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
                  <button
                    onClick={() => setGraficoTipo("colunas")}
                    className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
                      graficoTipo === "colunas" ? "bg-[#003566] text-white" : "text-[#6C757D] hover:bg-gray-50"
                    }`}
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    Colunas
                  </button>
                  <button
                    onClick={() => setGraficoTipo("linhas")}
                    className={`flex items-center gap-1.5 px-4 py-2 transition-colors border-l border-gray-200 ${
                      graficoTipo === "linhas" ? "bg-[#003566] text-white" : "text-[#6C757D] hover:bg-gray-50"
                    }`}
                  >
                    <LineChartIcon className="h-3.5 w-3.5" />
                    Linhas
                  </button>
                </div>
              </div>
            )}

            {/* Cards de métricas */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-[#003566]" />
                </div>
                <div>
                  <p className="text-xs text-[#6C757D]">Valor Total</p>
                  <p className="text-base font-bold text-[#003566]">{formatBRL(totalDetalhe)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-[#003566]" />
                </div>
                <div>
                  <p className="text-xs text-[#6C757D]">Total de Títulos</p>
                  <p className="text-base font-bold text-[#003566]">{detalhes.length} títulos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-[#003566]" />
                </div>
                <div>
                  <p className="text-xs text-[#6C757D]">Valor Médio</p>
                  <p className="text-base font-bold text-[#003566]">{formatBRL(valorMedio)}</p>
                </div>
              </div>
            </div>

            {/* ── TABELA ── */}
            {detalheView === "tabela" && (
              <div>
                <div className="grid grid-cols-2 px-6 py-3 bg-[#F8F9FA] border-b border-gray-100">
                  <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide">Data</span>
                  <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wide text-right">Valor</span>
                </div>
                {itensPagina.map((item) => (
                  <div key={item.data} className="grid grid-cols-2 px-6 py-3.5 border-b border-gray-50 hover:bg-[#F8F9FA] transition-colors">
                    <span className="text-sm text-[#333333]">{item.data}</span>
                    <span className="text-sm text-[#003566] font-medium text-right">{formatBRL(item.valor)}</span>
                  </div>
                ))}
                <div className="grid grid-cols-2 px-6 py-4 bg-[#F8F9FA] border-t border-gray-100">
                  <span className="text-sm font-semibold text-[#333333]">Total: {detalhes.length} pedidos</span>
                  <span className="text-sm font-bold text-[#003566] text-right">{formatBRL(totalDetalhe)}</span>
                </div>
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <span className="text-sm text-[#6C757D]">
                      Mostrando {Math.min(paginaAtual * ITEMS_PER_PAGE, detalhes.length)} de {detalhes.length} pedidos
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                        disabled={paginaAtual === 1}
                        className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-[#333333] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                        disabled={paginaAtual === totalPaginas}
                        className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-[#333333] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── GRÁFICO ── */}
            {detalheView === "grafico" && (
              <div className="px-6 py-5">
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#003566] mb-0.5">
                    {graficoTipo === "colunas" ? "Gráfico de Colunas" : "Gráfico de Linhas"}
                  </p>
                  <p className="text-xs text-[#6C757D] mb-5">
                    Progressão acumulativa dos valores repassados
                  </p>

                  <ResponsiveContainer width="100%" height={280}>
                    {graficoTipo === "colunas" ? (
                      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 8, bottom: 4 }} barCategoryGap="20%">
                        <CartesianGrid vertical={false} stroke="#F0F2F5" />
                        <XAxis
                          dataKey="data"
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={48}
                        />
                        <YAxis
                          tickFormatter={formatYAxis}
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          width={68}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#EEF2F7" }} />
                        <Legend
                          iconType="square"
                          iconSize={10}
                          formatter={() => (
                            <span style={{ color: "#6C757D", fontSize: 11 }}>Valor Acumulado</span>
                          )}
                        />
                        <Bar dataKey="acumulado" name="Valor Acumulado" fill="#003566" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 8, bottom: 4 }}>
                        <CartesianGrid vertical={false} stroke="#F0F2F5" />
                        <XAxis
                          dataKey="data"
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={48}
                        />
                        <YAxis
                          tickFormatter={formatYAxis}
                          tick={{ fontSize: 10, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          width={68}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          iconType="square"
                          iconSize={10}
                          formatter={() => (
                            <span style={{ color: "#6C757D", fontSize: 11 }}>Valor Acumulado</span>
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="acumulado"
                          name="Valor Acumulado"
                          stroke="#003566"
                          strokeWidth={2.5}
                          dot={{ fill: "#003566", r: 3, strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: "#003566" }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Rodapé do gráfico */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-[#333333]">
                    Total de pedidos: <span className="text-[#003566]">{detalhes.length}</span>
                  </span>
                  <span className="text-sm font-bold text-[#003566]">{formatBRL(totalDetalhe)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PEDIDOS PAGOS ── */}
        {tabAtiva === "pedidos-pagos" && (
          <div className="space-y-4">

            {/* Cabeçalho da página */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#003566] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#003566]">Pedidos pagos</h1>
                  <p className="text-sm text-[#6C757D]">Acompanhe quais pedidos foram pagos</p>
                </div>
              </div>
              <button className="w-10 h-10 bg-[#003566] hover:bg-[#002a52] rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                <Download className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Card de filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-[#003566]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#003566]">Filtros</p>
                    <p className="text-xs text-[#6C757D]">Selecione o período e filtros</p>
                  </div>
                </div>
                <button className="w-8 h-8 bg-[#EEF2F7] hover:bg-[#003566] text-[#003566] hover:text-white rounded-lg flex items-center justify-center transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6C757D] mb-1.5">Mês</label>
                  <div className="relative">
                    <select
                      value={filtroMes}
                      onChange={(e) => handleFiltroMes(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#333333] bg-white focus:outline-none focus:border-[#003566] pr-8"
                    >
                      {Object.entries(MESES_LABEL).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6C757D] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6C757D] mb-1.5">Placa</label>
                  <input
                    type="text"
                    placeholder="Digite a placa"
                    value={filtroPlaca}
                    onChange={(e) => { setFiltroPlaca(e.target.value.toUpperCase()); setPaginaPedidos(1); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-[#003566]"
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6C757D] mb-1.5">Método de pagamento</label>
                  <div className="relative">
                    <select
                      value={filtroMetodo}
                      onChange={(e) => { setFiltroMetodo(e.target.value); setPaginaPedidos(1); }}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#333333] bg-white focus:outline-none focus:border-[#003566] pr-8"
                    >
                      <option value="todos">Todos os métodos</option>
                      <option value="pix">PIX</option>
                      <option value="cartao">Cartão de crédito</option>
                      <option value="boleto">Boleto</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6C757D] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados */}
            {pedidosFiltrados.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-16 text-center">
                <p className="text-sm font-semibold text-[#333333] mb-1">Nenhum pedido encontrado</p>
                <p className="text-sm text-[#6C757D]">
                  Não há pedidos pagos para {MESES_LABEL[filtroMes] ?? filtroMes}.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Linha de resumo */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-[#003566]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#003566]">Pedidos Pagos</p>
                      <p className="text-xs text-[#6C757D]">Lista completa de transações</p>
                    </div>
                    <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {TOTAL_PEDIDOS_MARCO} pedidos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#EEF2F7] rounded-xl px-4 py-2.5">
                    <div className="w-7 h-7 bg-[#003566] rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-base font-bold text-[#003566]">
                      {formatBRL(TOTAL_VALOR_MARCO)}
                    </span>
                  </div>
                </div>

                {/* Lista de pedidos */}
                <div className="divide-y divide-gray-50">
                  {itensPedidosPagina.map((pedido) => (
                    <div key={pedido.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8F9FA] transition-colors">
                      {/* Ícone */}
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#333333]">
                          {pedido.passagens} passagens quitadas
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-[#6C757D]">
                            {pedido.data} às {pedido.hora}
                          </span>
                          <span className="text-xs text-[#6C757D]">·</span>
                          <span className="text-xs text-[#6C757D]">{pedido.placas} placas</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            {pedido.metodo}
                          </span>
                        </div>
                      </div>

                      {/* Valor e ação */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-[#333333]">
                          {formatBRL(pedido.valor)}
                        </span>
                        <button
                          onClick={() => setModalPedido(pedido)}
                          className="flex items-center gap-1.5 text-xs border border-[#90CAF9] text-[#42A5F5] hover:bg-[#E3F2FD] px-4 py-2 rounded-[8px] transition-colors whitespace-nowrap font-medium"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver Comprovante
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <span className="text-sm text-[#6C757D]">
                    Mostrando {Math.min(paginaPedidos * ITEMS_PER_PAGE_PEDIDOS, TOTAL_PEDIDOS_MARCO)} de {TOTAL_PEDIDOS_MARCO} pedidos
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaginaPedidos((p) => Math.max(1, p - 1))}
                      disabled={paginaPedidos === 1}
                      className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-[#333333] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPaginaPedidos((p) => Math.min(totalPaginasPedidos, p + 1))}
                      disabled={paginaPedidos === totalPaginasPedidos}
                      className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-[#333333] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL EXPORTAR REPASSE ── */}
      {modalExportar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setModalExportar(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-[#003566]">Exportar Relatório de Repasse</p>
                <p className="text-xs text-[#6C757D] mt-0.5">Selecione o mês e as opções para gerar o relatório.</p>
              </div>
              <button onClick={() => setModalExportar(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">

              {/* Mês */}
              <div>
                <label className="block text-xs font-medium text-[#6C757D] mb-1.5">Mês</label>
                <div className="relative">
                  <select
                    value={exportMes}
                    onChange={(e) => setExportMes(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-[8px] px-3 py-2.5 text-sm text-[#333333] bg-white focus:outline-none focus:border-[#003566] pr-8"
                  >
                    {Object.entries(MESES_LABEL).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6C757D] pointer-events-none" />
                </div>
              </div>

              {/* Formato — segmented control compacto */}
              <div>
                <label className="block text-xs font-medium text-[#6C757D] mb-1.5">Formato de exportação</label>
                <div className="flex bg-[#F0F2F5] rounded-[8px] p-1 gap-1">
                  {(["pdf", "excel"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormato(fmt)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
                        exportFormato === fmt
                          ? "bg-white text-[#003566] shadow-sm"
                          : "text-[#6C757D] hover:text-[#333333]"
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      {fmt === "pdf" ? "PDF" : "Excel"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo — cards com radio visual */}
              <div>
                <label className="block text-xs font-medium text-[#6C757D] mb-1.5">Tipo de extrato</label>
                <div className="flex flex-col gap-2">
                  {(["consolidado", "detalhado"] as const).map((tipo) => {
                    const ativo = exportTipo === tipo;
                    return (
                      <button
                        key={tipo}
                        onClick={() => setExportTipo(tipo)}
                        className={`flex items-start gap-3 px-4 py-3 rounded-[8px] border text-left transition-all ${
                          ativo
                            ? "border-[#003566] bg-[#EEF2F7]"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Radio dot */}
                        <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          ativo ? "border-[#003566]" : "border-gray-300"
                        }`}>
                          {ativo && <span className="w-2 h-2 rounded-full bg-[#003566]" />}
                        </span>
                        <div>
                          <p className={`text-xs font-semibold ${ativo ? "text-[#003566]" : "text-[#333333]"}`}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                            {tipo === "consolidado"
                              ? "Resumo com totais por período, sem detalhamento por título."
                              : "Inclui cada título individualmente com data, valor e status."}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setModalExportar(false)}
                className="flex-1 py-2.5 rounded-[8px] border border-gray-200 text-sm font-semibold text-[#6C757D] hover:border-gray-300 hover:text-[#333333] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalExportar(false); // fecha sempre, independente do resultado

                  try {
                    const pedidosExport = PEDIDOS_MARCO.map((ped) => {
                      const { passagens: placasDetalhe } = gerarDadosComprovante(ped);
                      return {
                        id:         ped.id,
                        data:       ped.data,
                        hora:       ped.hora,
                        passagens:  ped.passagens,
                        metodo:     ped.metodo,
                        valorTotal: ped.valor,
                        placas:     placasDetalhe,
                      };
                    });

                    exportarRepasse({
                      tipo:     exportTipo,
                      formato:  exportFormato,
                      mes:      exportMes,
                      mesLabel: MESES_LABEL[exportMes] ?? exportMes,
                      periodos: repassePorPeriodo.map((r) => ({
                        periodo: r.periodo,
                        mes:     r.mes,
                        valor:   r.valor,
                      })),
                      detalhes: detalhesPorPeriodo[exportMes] ?? [],
                      pedidos:  pedidosExport,
                    });
                  } catch (err) {
                    console.error("[exportarRepasse] erro:", err);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-[#003566] hover:bg-[#002a52] text-white text-sm font-semibold transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar {exportFormato === "pdf" ? "PDF" : "Excel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL COMPROVANTE ── */}
      {modalPedido && (() => {
        const { protocolo, passagens } = gerarDadosComprovante(modalPedido);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={() => setModalPedido(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
              style={{ maxHeight: "88vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header — fixo */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-[#003566]" />
                  </div>
                  <span className="text-sm font-bold text-[#003566]">Comprovante de Pagamento</span>
                </div>
                <button
                  onClick={() => setModalPedido(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Corpo — scrollável */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Sucesso */}
                <div className="bg-green-50 rounded-xl py-5 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-green-700">Pagamento Aprovado</p>
                  <p className="text-xs text-green-600">Pendências quitadas com sucesso</p>
                </div>

                {/* Detalhes gerais */}
                <div>
                  <p className="text-xs font-bold text-[#333333] mb-3 uppercase tracking-wide">
                    Detalhes da Transação
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-0.5">Protocolo</p>
                      <p className="text-xs font-semibold text-[#333333]">{protocolo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-0.5">Data e Hora</p>
                      <p className="text-xs font-semibold text-[#333333]">{modalPedido.data} às {modalPedido.hora}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-0.5">Método de Pagamento</p>
                      <span className="inline-block text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {modalPedido.metodo}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-0.5">Status</p>
                      <span className="inline-block text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Aprovado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passagens individuais */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[#333333] uppercase tracking-wide">
                      Passagens ({passagens.length})
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {passagens.map((p) => (
                      <div key={p.idPassagem} className="border border-gray-100 rounded-xl px-4 py-3 bg-[#F8F9FA]">
                        <div className="mb-3 pb-2.5 border-b border-gray-200 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">Número da Placa</p>
                            <p className="text-sm font-bold text-[#003566]">{p.placa}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">Valor</p>
                            <p className="text-sm font-bold text-[#003566]">{formatBRL(p.valor)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">Data</p>
                            <p className="text-xs font-semibold text-[#333333]">{p.data}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">Horário</p>
                            <p className="text-xs font-semibold text-[#333333]">{p.hora}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">ID da Passagem</p>
                            <p className="text-xs font-semibold text-[#333333]">{p.idPassagem}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">Placa do Veículo</p>
                            <p className="text-xs font-semibold text-[#333333]">{p.placa}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">Praça</p>
                            <p className="text-xs font-semibold text-[#333333] flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[#003566]" />
                              {p.praca}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">Quilômetro</p>
                            <p className="text-xs font-semibold text-[#333333] flex items-center gap-1">
                              <Hash className="h-3 w-3 text-[#003566]" />
                              km {p.km}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-[#9CA3AF] mb-0.5">Rodovia</p>
                            <p className="text-xs font-semibold text-[#333333]">{p.rodovia}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aviso */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-[#003566] mb-1.5">Avisos Importantes:</p>
                  <ul className="space-y-1">
                    <li className="text-xs text-[#4B5563]">· Este comprovante confirma o pagamento da passagem de pedágio.</li>
                    <li className="text-xs text-[#4B5563]">· O pagamento não exclui multas por infrações de trânsito.</li>
                    <li className="text-xs text-[#4B5563]">· Guarde este comprovante para seus registros.</li>
                  </ul>
                </div>
              </div>

              {/* Valor total — fixo acima dos botões */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 bg-[#F8F9FA] flex-shrink-0">
                <p className="text-sm font-bold text-[#333333]">Valor Total Pago</p>
                <p className="text-base font-bold text-[#003566]">{formatBRL(modalPedido.valor)}</p>
              </div>

              {/* Botões — fixos no rodapé */}
              <div className="px-6 pb-5 pt-4 flex items-center gap-2 flex-shrink-0">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#003566] hover:bg-[#002a52] text-white text-xs font-semibold py-2.5 rounded-[8px] transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-[8px] transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Excel
                </button>
                <button
                  onClick={() => setModalPedido(null)}
                  className="flex-1 text-xs font-semibold text-[#6C757D] hover:text-[#333333] py-2.5 rounded-[8px] border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
