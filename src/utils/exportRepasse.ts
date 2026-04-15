import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Faz download de um workbook no browser via base64 → Blob
function downloadXlsx(wb: XLSX.WorkBook, filename: string) {
  // base64 é o formato mais confiável em ambientes browser/Vite
  const b64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" }) as string;
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);

  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

// ── Paleta ────────────────────────────────────────────────────────────────────
const AZUL       = [0, 53, 102]    as [number, number, number]; // #003566
const AZUL_CLARO = [238, 242, 247] as [number, number, number]; // #EEF2F7
const AZUL_MED   = [0, 82, 158]    as [number, number, number]; // seção secundária
const CINZA      = [108, 117, 125] as [number, number, number]; // #6C757D
const PRETO      = [51, 51, 51]    as [number, number, number];  // #333333
const BRANCO     = [255, 255, 255] as [number, number, number];
const VERDE      = [22, 163, 74]   as [number, number, number];

// ── Tipos públicos ────────────────────────────────────────────────────────────
export interface PeriodoRepasse {
  periodo: string;
  mes: string | null;
  valor: number;
}

export interface DetalheRepasse {
  data: string;
  valor: number;
}

export interface PlacaExport {
  idPassagem: string;
  placa:      string;
  rodovia:    string;
  praca:      string;
  km:         number;
  data:       string;
  hora:       string;  // HH:MM:SS
  valor:      number;
}

export interface PedidoExport {
  id:        string;
  data:      string;
  hora:      string;
  passagens: number;
  metodo:    string;
  valorTotal: number;
  placas:    PlacaExport[];
}

export interface ExportParams {
  tipo:      "consolidado" | "detalhado";
  formato:   "pdf" | "excel";
  mes:       string;            // "04/2026"
  mesLabel:  string;            // "Abril de 2026"
  periodos:  PeriodoRepasse[];
  detalhes:  DetalheRepasse[];  // entradas do mês (repasse)
  pedidos:   PedidoExport[];    // pedidos completos com placas
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hoje() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}


// ══════════════════════════════════════════════════════════════════════════════
// PDF — primitivas visuais
// ══════════════════════════════════════════════════════════════════════════════

function pdfHeader(doc: jsPDF, titulo: string, subtitulo: string, landscape = false) {
  const W = doc.internal.pageSize.getWidth();

  // Barra superior azul
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, W, 30, "F");

  // Acento decorativo
  doc.setFillColor(...AZUL_MED);
  doc.rect(0, 24, W, 4, "F");

  // Empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRANCO);
  doc.text("Pedágio Simples", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 240);
  doc.text("Sistema de Gestão de Pedágio", 14, 19);

  // Data de geração — canto direito
  doc.setFontSize(7.5);
  doc.setTextColor(...BRANCO);
  doc.text(`Gerado em: ${hoje()}`, W - 14, 12, { align: "right" });
  doc.text("Documento confidencial", W - 14, 19, { align: "right" });

  // Título do relatório
  doc.setFont("helvetica", "bold");
  doc.setFontSize(landscape ? 13 : 14);
  doc.setTextColor(...AZUL);
  doc.text(titulo, 14, 44);

  // Subtítulo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CINZA);
  doc.text(subtitulo, 14, 51);

  // Linha separadora
  doc.setDrawColor(...AZUL_CLARO);
  doc.setLineWidth(0.6);
  doc.line(14, 55, W - 14, 55);

  return 62;
}

function pdfFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...AZUL_CLARO);
    doc.rect(0, H - 13, W, 13, "F");
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.3);
    doc.line(0, H - 13, W, H - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...CINZA);
    doc.text("Pedágio Simples · Relatório de Repasse · Documento confidencial", 14, H - 5);
    doc.text(`Página ${i} de ${pages}`, W - 14, H - 5, { align: "right" });
  }
}

function pdfInfoBox(
  doc: jsPDF,
  items: { label: string; value: string; sub?: string }[],
  startY: number,
) {
  const W    = doc.internal.pageSize.getWidth();
  const cols = items.length;
  const pad  = 14;
  const boxW = (W - 2 * pad) / cols;
  const H    = 26;

  // Fundo
  doc.setFillColor(...AZUL_CLARO);
  doc.roundedRect(pad, startY, W - 2 * pad, H, 4, 4, "F");

  // Divisórias verticais
  doc.setDrawColor(210, 220, 235);
  doc.setLineWidth(0.4);
  for (let i = 1; i < cols; i++) {
    const x = pad + i * boxW;
    doc.line(x, startY + 5, x, startY + H - 5);
  }

  items.forEach((item, i) => {
    const cx = pad + i * boxW + boxW / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...CINZA);
    doc.text(item.label.toUpperCase(), cx, startY + 9, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...AZUL);
    doc.text(item.value, cx, startY + 19, { align: "center" });

    if (item.sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...CINZA);
      doc.text(item.sub, cx, startY + H - 1, { align: "center" });
    }
  });

  return startY + H + 8;
}

function pdfSectionTitle(doc: jsPDF, texto: string, y: number) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...AZUL);
  doc.rect(14, y, 3, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...AZUL);
  doc.text(texto, 20, y + 6);
  doc.setDrawColor(...AZUL_CLARO);
  doc.setLineWidth(0.4);
  doc.line(14, y + 10, W - 14, y + 10);
  return y + 15;
}

// ── Agrupa pedidos por dia e retorna linhas ordenadas com acumulado ───────────
function agruparPorDia(pedidos: PedidoExport[]) {
  const mapa = new Map<string, { passagens: number; placas: number; valor: number }>();

  for (const ped of pedidos) {
    const entry = mapa.get(ped.data) ?? { passagens: 0, placas: 0, valor: 0 };
    entry.passagens += ped.passagens;
    entry.placas    += ped.placas.length;
    entry.valor     += ped.valorTotal;
    mapa.set(ped.data, entry);
  }

  // Ordena por data crescente
  const sorted = [...mapa.entries()].sort(([a], [b]) => {
    const parse = (s: string) => { const [d, m, y] = s.split("/"); return new Date(+y, +m - 1, +d).getTime(); };
    return parse(a) - parse(b);
  });

  let acumulado = 0;
  return sorted.map(([data, v]) => {
    acumulado += v.valor;
    return { data, ...v, acumulado };
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF — Consolidado (agrupado por dia do mês selecionado)
// ══════════════════════════════════════════════════════════════════════════════
function gerarPdfConsolidado(p: ExportParams) {
  const doc  = new jsPDF({ unit: "mm", format: "a4" });
  const dias = agruparPorDia(p.pedidos);

  const totalValor    = dias.reduce((a, d) => a + d.valor, 0);
  const totalPassagens = dias.reduce((a, d) => a + d.passagens, 0);
  const totalPlacas   = dias.reduce((a, d) => a + d.placas, 0);

  let y = pdfHeader(
    doc,
    `Relatório Consolidado — ${p.mesLabel}`,
    "Acumulado diário de passagens e valores repassados no mês selecionado · Pedágio Simples",
  );

  y = pdfInfoBox(doc, [
    { label: "Mês de referência",  value: p.mesLabel },
    { label: "Dias com passagens", value: `${dias.length} dias` },
    { label: "Total de passagens", value: String(totalPassagens) },
    { label: "Total de placas",    value: String(totalPlacas) },
    { label: "Valor total",        value: formatBRL(totalValor) },
  ], y);

  y = pdfSectionTitle(doc, `Consolidado Diário — ${p.mesLabel}`, y);

  let acum = 0;
  autoTable(doc, {
    startY: y,
    head: [["Data", "Passagens no Dia", "Placas no Dia", "Valor do Dia", "Valor Acumulado"]],
    body: dias.map((d) => {
      acum += d.valor;
      return [d.data, d.passagens, d.placas, formatBRL(d.valor), formatBRL(acum)];
    }),
    foot: [["Total", totalPassagens, totalPlacas, formatBRL(totalValor), formatBRL(totalValor)]],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 4, textColor: PRETO },
    headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold" },
    footStyles: { fillColor: AZUL_CLARO, textColor: AZUL, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 36 },
      1: { halign: "center", cellWidth: 36 },
      2: { halign: "center", cellWidth: 32 },
      3: { halign: "right" },
      4: { halign: "right", fontStyle: "bold", textColor: AZUL },
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  pdfFooter(doc);
  doc.save(`repasse-consolidado-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF — Detalhado  (landscape A4 — uma linha por passagem/placa)
// ══════════════════════════════════════════════════════════════════════════════
function gerarPdfDetalhado(p: ExportParams) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const totalPassagens = p.pedidos.reduce((a, x) => a + x.placas.length, 0);
  const totalValor     = p.pedidos.reduce((a, x) => a + x.valorTotal, 0);

  // Expande todas as placas em linhas individuais
  const linhas: (string | number)[][] = [];
  let seq = 1;
  for (const ped of p.pedidos) {
    for (const pl of ped.placas) {
      linhas.push([
        seq++,
        ped.id.toUpperCase(),
        pl.placa,
        pl.idPassagem,
        pl.data,
        pl.hora,          // HH:MM:SS
        pl.praca,
        `km ${pl.km}`,
        pl.rodovia,
        ped.metodo,
        formatBRL(pl.valor),
        "Aprovado",
      ]);
    }
  }

  let y = pdfHeader(
    doc,
    `Relatório Detalhado — ${p.mesLabel}`,
    "Uma linha por passagem · inclui placa, ID da passagem, praça, quilômetro, rodovia, data, hora e valor individual",
    true,
  );

  y = pdfInfoBox(doc, [
    { label: "Mês de referência",         value: p.mesLabel },
    { label: "Total de pedidos",          value: String(p.pedidos.length) },
    { label: "Total de passagens / placas", value: String(totalPassagens) },
    { label: "Valor total",               value: formatBRL(totalValor) },
    { label: "Método de pagamento",       value: "PIX" },
  ], y);

  y = pdfSectionTitle(doc, `Passagens Individuais — ${totalPassagens} registros`, y);

  autoTable(doc, {
    startY: y,
    head: [["#", "ID Pedido", "Placa", "ID Passagem", "Data", "Hora", "Praça", "Km", "Rodovia", "Método", "Valor", "Status"]],
    body: linhas,
    foot: [["", `${p.pedidos.length} pedidos`, `${totalPassagens} passagens`,
      "", "", "", "", "", "", "", formatBRL(totalValor), ""]],
    margin: { left: 10, right: 10 },
    styles: { fontSize: 6.8, cellPadding: 2.4, textColor: PRETO },
    headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold", fontSize: 7.2 },
    footStyles: { fillColor: AZUL_CLARO, textColor: AZUL, fontStyle: "bold" },
    columnStyles: {
      0:  { cellWidth: 10, halign: "center", textColor: CINZA },
      1:  { cellWidth: 22, fontStyle: "bold", textColor: AZUL },
      2:  { cellWidth: 22, fontStyle: "bold" },
      3:  { cellWidth: 26 },
      4:  { cellWidth: 22 },
      5:  { cellWidth: 20 },
      6:  { cellWidth: 18 },
      7:  { cellWidth: 12, halign: "center" },
      8:  { cellWidth: 36 },
      9:  { cellWidth: 16, halign: "center" },
      10: { halign: "right", cellWidth: 26 },
      11: { halign: "center", cellWidth: 18 },
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    didParseCell: (data) => {
      if (data.column.index === 11 && data.section === "body") {
        data.cell.styles.textColor = VERDE;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 10 && data.section === "body") {
        data.cell.styles.textColor = AZUL;
      }
    },
  });

  pdfFooter(doc);
  doc.save(`repasse-detalhado-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Excel — Consolidado (agrupado por dia do mês selecionado)
// ══════════════════════════════════════════════════════════════════════════════
function gerarExcelConsolidado(p: ExportParams) {
  const wb   = XLSX.utils.book_new();
  const dias = agruparPorDia(p.pedidos);

  const totalValor     = dias.reduce((a, d) => a + d.valor, 0);
  const totalPassagens = dias.reduce((a, d) => a + d.passagens, 0);
  const totalPlacas    = dias.reduce((a, d) => a + d.placas, 0);

  // Aba 1: Resumo
  const wsResumo = XLSX.utils.aoa_to_sheet([
    [`Pedágio Simples — Relatório Consolidado — ${p.mesLabel}`],
    [`Gerado em: ${hoje()}`],
    [],
    ["RESUMO EXECUTIVO"],
    ["Mês de referência",           p.mesLabel],
    ["Dias com passagens",          dias.length],
    ["Total de passagens",          totalPassagens],
    ["Total de placas",             totalPlacas],
    ["Valor total repassado (R$)",  totalValor],
    ["Método de pagamento",         "PIX"],
  ]);
  wsResumo["!cols"] = [{ wch: 34 }, { wch: 22 }];
  wsResumo["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Aba 2: Consolidado diário
  let acumulado = 0;
  const rowsDia = dias.map((d) => {
    acumulado += d.valor;
    return [d.data, d.passagens, d.placas, d.valor, acumulado];
  });

  const wsDia = XLSX.utils.aoa_to_sheet([
    [`Consolidado Diário — ${p.mesLabel}`],
    [`Gerado em: ${hoje()}`],
    [],
    ["Data", "Passagens no Dia", "Placas no Dia", "Valor do Dia (R$)", "Valor Acumulado (R$)"],
    ...rowsDia,
    [],
    ["TOTAL", totalPassagens, totalPlacas, totalValor, totalValor],
  ]);
  wsDia["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 24 }];
  wsDia["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  XLSX.utils.book_append_sheet(wb, wsDia, `Consolidado ${p.mes.replace("/", "-")}`);

  downloadXlsx(wb, `repasse-consolidado-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Excel — Detalhado  (3 abas)
// ══════════════════════════════════════════════════════════════════════════════
function gerarExcelDetalhado(p: ExportParams) {
  const wb = XLSX.utils.book_new();

  const totalPedidos   = p.pedidos.length;
  const totalPassagens = p.pedidos.reduce((a, x) => a + x.placas.length, 0);
  const totalValor     = p.pedidos.reduce((a, x) => a + x.valorTotal, 0);

  // ── Aba 1: Resumo ──────────────────────────────────────────────────────────
  const wsResumo = XLSX.utils.aoa_to_sheet([
    [`Pedágio Simples — Relatório Detalhado de Repasse — ${p.mesLabel}`],
    [`Gerado em: ${hoje()}`],
    [],
    ["RESUMO EXECUTIVO"],
    ["Mês de referência",           p.mesLabel],
    ["Total de pedidos",            totalPedidos],
    ["Total de passagens / placas", totalPassagens],
    ["Valor total repassado (R$)",  totalValor],
    ["Método de pagamento",         "PIX"],
    ["Status geral",                "Aprovado"],
  ]);
  wsResumo["!cols"] = [{ wch: 34 }, { wch: 28 }];
  wsResumo["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // ── Aba 2: Pedidos ─────────────────────────────────────────────────────────
  const headerPed = ["ID Pedido", "Data", "Hora", "Passagens", "Nº Placas", "Método", "Valor Total (R$)", "Status"];
  const rowsPed   = p.pedidos.map((ped) => [
    ped.id.toUpperCase(),
    ped.data,
    ped.hora,
    ped.passagens,
    ped.placas.length,
    ped.metodo,
    ped.valorTotal,
    "Pago",
  ]);

  const wsPed = XLSX.utils.aoa_to_sheet([
    [`Pedidos — ${p.mesLabel}`],
    [`Gerado em: ${hoje()}`],
    [],
    headerPed,
    ...rowsPed,
    [],
    ["TOTAL", "", "", p.pedidos.reduce((a, x) => a + x.passagens, 0), totalPassagens, "", totalValor, ""],
  ]);
  wsPed["!cols"] = [
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 10 },
  ];
  wsPed["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  XLSX.utils.book_append_sheet(wb, wsPed, "Pedidos");

  // ── Aba 3: Passagens (detalhe por placa) ───────────────────────────────────
  const headerPass = [
    "ID Pedido", "Data Pedido", "Hora Pedido",
    "Placa", "ID da Passagem",
    "Data da Passagem", "Hora da Passagem",
    "Praça", "Quilômetro", "Rodovia",
    "Método de Pagamento", "Valor da Passagem (R$)", "Status",
  ];

  const rowsPass: (string | number)[][] = [];
  for (const ped of p.pedidos) {
    for (const pl of ped.placas) {
      rowsPass.push([
        ped.id.toUpperCase(),
        ped.data,
        ped.hora,
        pl.placa,
        pl.idPassagem,
        pl.data,
        pl.hora,
        pl.praca,
        `km ${pl.km}`,
        pl.rodovia,
        ped.metodo,
        pl.valor,
        "Aprovado",
      ]);
    }
  }

  const wsPass = XLSX.utils.aoa_to_sheet([
    [`Passagens Detalhadas — ${p.mesLabel}`],
    [`Gerado em: ${hoje()} · ${totalPassagens} registros`],
    [],
    headerPass,
    ...rowsPass,
    [],
    ["TOTAL", "", "", `${totalPassagens} passagens`, "", "", "", "", "", "", "", totalValor, ""],
  ]);
  wsPass["!cols"] = [
    { wch: 14 }, { wch: 14 }, { wch: 13 },
    { wch: 14 }, { wch: 18 },
    { wch: 18 }, { wch: 16 },
    { wch: 12 }, { wch: 12 }, { wch: 26 },
    { wch: 22 }, { wch: 24 }, { wch: 12 },
  ];
  wsPass["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsPass, "Passagens");

  downloadXlsx(wb, `repasse-detalhado-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Entry point
// ══════════════════════════════════════════════════════════════════════════════
export function exportarRepasse(p: ExportParams) {
  if (p.formato === "pdf") {
    if (p.tipo === "consolidado") gerarPdfConsolidado(p);
    else                          gerarPdfDetalhado(p);
  } else {
    if (p.tipo === "consolidado") gerarExcelConsolidado(p);
    else                          gerarExcelDetalhado(p);
  }
}
