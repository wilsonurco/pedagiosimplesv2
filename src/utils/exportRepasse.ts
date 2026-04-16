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
const _SUBTOTAL_MARKER = "__SUB__";

function gerarPdfDetalhado(p: ExportParams) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const totalPassagens = p.pedidos.reduce((a, x) => a + x.placas.length, 0);
  const totalValor     = p.pedidos.reduce((a, x) => a + x.valorTotal, 0);

  // Monta linhas com subtotal após cada grupo de passagens do mesmo pedido
  const linhas: (string | number)[][] = [];
  let seq = 1;
  let tituloSeq = 1;
  for (const ped of p.pedidos) {
    for (const pl of ped.placas) {
      linhas.push([
        seq++,
        ped.id.toUpperCase(),
        pl.placa,
        pl.idPassagem,
        pl.data,
        pl.hora,
        pl.praca,
        `km ${pl.km}`,
        pl.rodovia,
        ped.metodo,
        formatBRL(pl.valor),
        "Aprovado",
      ]);
    }
    // Linha de subtotal — codifica o nº do título no marcador
    linhas.push([
      `${_SUBTOTAL_MARKER}${tituloSeq++}`,
      ped.id.toUpperCase(),
      `${ped.placas.length} passagem(ns)`,
      "", "", "", "", "", "", "",
      formatBRL(ped.valorTotal),
      "",
    ]);
  }

  let y = pdfHeader(
    doc,
    `Relatório Detalhado — ${p.mesLabel}`,
    "Passagens agrupadas por pedido com subtotal · placa, praça, quilômetro, rodovia, data e hora",
    true,
  );

  y = pdfInfoBox(doc, [
    { label: "Mês de referência",           value: p.mesLabel },
    { label: "Total de pedidos",            value: String(p.pedidos.length) },
    { label: "Total de títulos",            value: String(p.pedidos.length) },
    { label: "Total de passagens / placas", value: String(totalPassagens) },
    { label: "Valor total",                 value: formatBRL(totalValor) },
    { label: "Método de pagamento",         value: "PIX" },
  ], y);

  y = pdfSectionTitle(doc, `Passagens por Pedido — ${totalPassagens} registros · ${p.pedidos.length} títulos`, y);

  autoTable(doc, {
    startY: y,
    head: [["#", "ID Pedido", "Placa", "ID Passagem", "Data", "Hora", "Praça", "Km", "Rodovia", "Método", "Valor", "Status"]],
    body: linhas,
    foot: [["", `${p.pedidos.length} títulos`, `${totalPassagens} passagens`,
      "", "", "", "", "", "", "", formatBRL(totalValor), ""]],
    margin: { left: 10, right: 10 },
    styles: { fontSize: 6.8, cellPadding: 2.4, textColor: PRETO },
    headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold", fontSize: 7.2 },
    footStyles: { fillColor: AZUL_CLARO, textColor: AZUL, fontStyle: "bold" },
    columnStyles: {
      0:  { cellWidth: 10, halign: "center", textColor: CINZA },
      1:  { cellWidth: 22, fontStyle: "bold", textColor: AZUL },
      2:  { cellWidth: 28, fontStyle: "bold" },
      3:  { cellWidth: 26 },
      4:  { cellWidth: 20 },
      5:  { cellWidth: 18 },
      6:  { cellWidth: 18 },
      7:  { cellWidth: 12, halign: "center" },
      8:  { cellWidth: 34 },
      9:  { cellWidth: 14, halign: "center" },
      10: { halign: "right", cellWidth: 24 },
      11: { halign: "center", cellWidth: 16 },
    },
    // Desliga zebra alternada globalmente — vamos controlar manualmente
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const raw    = data.row.raw as (string | number)[];
      const marker = String(raw[0]);
      const isSub  = marker.startsWith(_SUBTOTAL_MARKER);

      if (isSub) {
        const tituloNum = marker.slice(_SUBTOTAL_MARKER.length);
        // Estilo da linha de subtotal
        data.cell.styles.fillColor = AZUL_CLARO;
        data.cell.styles.textColor = AZUL;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize  = 7.2;
        // Col 0: exibe "Tít. N" em vez do marcador
        if (data.column.index === 0) {
          data.cell.text             = [`Tít. ${tituloNum}`];
          data.cell.styles.halign    = "center";
          data.cell.styles.textColor = AZUL_MED;
          data.cell.styles.fontSize  = 6.5;
        }
        // Col 2: descrição do subtotal (passa-se o texto direto)
        if (data.column.index === 2) {
          data.cell.styles.textColor = CINZA;
          data.cell.styles.fontStyle = "normal";
        }
        // Col 10: valor alinhado à direita
        if (data.column.index === 10) data.cell.styles.halign = "right";
      } else {
        // Zebra manual apenas nas linhas de passagem
        if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [248, 249, 250];
        }
        if (data.column.index === 11) {
          data.cell.styles.textColor = VERDE;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 10) {
          data.cell.styles.textColor = AZUL;
        }
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
    ["Total de títulos",            totalPedidos],
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

  // ── Aba 3: Passagens agrupadas por pedido com subtotal e nº do título ──────
  const headerPass = [
    "Título Nº", "ID Pedido", "Data Pedido", "Hora Pedido",
    "Placa", "ID da Passagem",
    "Data da Passagem", "Hora da Passagem",
    "Praça", "Quilômetro", "Rodovia",
    "Método", "Valor (R$)", "Status",
  ];

  const rowsPass: (string | number)[][] = [];
  let tituloExcel = 1;
  for (const ped of p.pedidos) {
    for (const pl of ped.placas) {
      rowsPass.push([
        tituloExcel,            // Título Nº
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
    // Linha de subtotal com nº do título em destaque
    rowsPass.push([
      `Título ${tituloExcel}`,
      `SUBTOTAL — ${ped.id.toUpperCase()}`,
      ped.data,
      "",
      `${ped.placas.length} passagem(ns)`,
      "", "", "", "", "", "",
      "",
      ped.valorTotal,
      "",
    ]);
    tituloExcel++;
  }

  const wsPass = XLSX.utils.aoa_to_sheet([
    [`Passagens Detalhadas por Pedido — ${p.mesLabel}`],
    [`Gerado em: ${hoje()} · ${totalPassagens} passagens · ${totalPedidos} títulos`],
    [],
    headerPass,
    ...rowsPass,
    [],
    ["", "TOTAL GERAL", "", "", `${totalPassagens} passagens`, "", "", "", "", "", "", "", totalValor, ""],
  ]);
  wsPass["!cols"] = [
    { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    { wch: 18 }, { wch: 20 },
    { wch: 18 }, { wch: 16 },
    { wch: 12 }, { wch: 12 }, { wch: 26 },
    { wch: 12 }, { wch: 16 }, { wch: 12 },
  ];
  wsPass["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsPass, "Passagens");

  downloadXlsx(wb, `repasse-detalhado-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Entry point — Repasse
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

// ══════════════════════════════════════════════════════════════════════════════
// Pedidos Pagos — tipos
// ══════════════════════════════════════════════════════════════════════════════
export interface PedidoPagoExport {
  id:        string;
  data:      string;
  hora:      string;
  passagens: number;
  placas:    number;
  metodo:    string;
  valor:     number;
}

export interface ExportPedidosParams {
  mes:      string;   // "03/2026"
  mesLabel: string;   // "Março de 2026"
  pedidos:  PedidoPagoExport[];
  total:    number;
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF — Pedidos Pagos
// ══════════════════════════════════════════════════════════════════════════════
function gerarPdfPedidos(p: ExportPedidosParams) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = pdfHeader(
    doc,
    `Pedidos Pagos — ${p.mesLabel}`,
    "Listagem consolidada de pedidos quitados no período · Pedágio Simples",
  );

  y = pdfInfoBox(doc, [
    { label: "Mês de referência",  value: p.mesLabel },
    { label: "Total de pedidos",   value: String(p.pedidos.length) },
    { label: "Valor total",        value: formatBRL(p.total) },
    { label: "Método de pagamento", value: "PIX" },
  ], y);

  y = pdfSectionTitle(doc, `Lista de Pedidos — ${p.pedidos.length} registros`, y);

  let acumulado = 0;
  autoTable(doc, {
    startY: y,
    head: [["#", "ID Pedido", "Data", "Hora", "Passagens", "Placas", "Método", "Valor", "Acumulado", "Status"]],
    body: p.pedidos.map((ped, i) => {
      acumulado += ped.valor;
      return [
        i + 1,
        ped.id.toUpperCase(),
        ped.data,
        ped.hora,
        ped.passagens,
        ped.placas,
        ped.metodo,
        formatBRL(ped.valor),
        formatBRL(acumulado),
        "Pago",
      ];
    }),
    foot: [["", `${p.pedidos.length} pedidos`, "", "", "", "", "", formatBRL(p.total), formatBRL(p.total), ""]],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, textColor: PRETO },
    headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: AZUL_CLARO, textColor: AZUL, fontStyle: "bold" },
    columnStyles: {
      0:  { cellWidth: 10, halign: "center", textColor: CINZA },
      1:  { cellWidth: 24, fontStyle: "bold", textColor: AZUL },
      2:  { cellWidth: 24 },
      3:  { cellWidth: 18 },
      4:  { halign: "center", cellWidth: 20 },
      5:  { halign: "center", cellWidth: 16 },
      6:  { halign: "center", cellWidth: 16 },
      7:  { halign: "right" },
      8:  { halign: "right", fontStyle: "bold", textColor: AZUL },
      9:  { halign: "center", cellWidth: 18 },
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    didParseCell: (data) => {
      if (data.column.index === 9 && data.section === "body") {
        data.cell.styles.textColor = VERDE;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  pdfFooter(doc);
  doc.save(`pedidos-pagos-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Excel — Pedidos Pagos (2 abas)
// ══════════════════════════════════════════════════════════════════════════════
function gerarExcelPedidos(p: ExportPedidosParams) {
  const wb = XLSX.utils.book_new();

  // Aba 1: Resumo
  const wsResumo = XLSX.utils.aoa_to_sheet([
    [`Pedágio Simples — Pedidos Pagos — ${p.mesLabel}`],
    [`Gerado em: ${hoje()}`],
    [],
    ["RESUMO"],
    ["Mês de referência",          p.mesLabel],
    ["Total de pedidos",           p.pedidos.length],
    ["Valor total (R$)",           p.total],
    ["Método de pagamento",        "PIX"],
    ["Status geral",               "Pago"],
  ]);
  wsResumo["!cols"] = [{ wch: 28 }, { wch: 22 }];
  wsResumo["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Aba 2: Pedidos
  let acumulado = 0;
  const rows = p.pedidos.map((ped, i) => {
    acumulado += ped.valor;
    return [i + 1, ped.id.toUpperCase(), ped.data, ped.hora, ped.passagens, ped.placas, ped.metodo, ped.valor, acumulado, "Pago"];
  });

  const wsPed = XLSX.utils.aoa_to_sheet([
    [`Pedidos Pagos — ${p.mesLabel}`],
    [`Gerado em: ${hoje()} · ${p.pedidos.length} registros`],
    [],
    ["#", "ID Pedido", "Data", "Hora", "Passagens", "Placas", "Método", "Valor (R$)", "Acumulado (R$)", "Status"],
    ...rows,
    [],
    ["", `${p.pedidos.length} pedidos`, "", "", "", "", "", p.total, p.total, ""],
  ]);
  wsPed["!cols"] = [
    { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 20 }, { wch: 10 },
  ];
  wsPed["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsPed, `Pedidos ${p.mes.replace("/", "-")}`);

  downloadXlsx(wb, `pedidos-pagos-${p.mes.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Entry point — Pedidos Pagos
// ══════════════════════════════════════════════════════════════════════════════
export function exportarPedidosPagos(params: ExportPedidosParams, formato: "pdf" | "excel") {
  if (formato === "pdf") gerarPdfPedidos(params);
  else                   gerarExcelPedidos(params);
}

// ══════════════════════════════════════════════════════════════════════════════
// Comprovante — tipos
// ══════════════════════════════════════════════════════════════════════════════
export interface PassagemComprovanteExport {
  idPassagem: string;
  placa:      string;
  rodovia:    string;
  praca:      string;
  km:         number;
  data:       string;
  hora:       string;
  valor:      number;
}

export interface ComprovanteExportParams {
  protocolo:  string;
  data:       string;   // "21/03/2026"
  hora:       string;   // "06:53"
  metodo:     string;
  status:     string;
  valorTotal: number;
  passagens:  PassagemComprovanteExport[];
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF — Comprovante de Pagamento
// ══════════════════════════════════════════════════════════════════════════════
function gerarPdfComprovante(p: ComprovanteExportParams) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W   = doc.internal.pageSize.getWidth();

  // ── Cabeçalho ────────────────────────────────────────────────────────────
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...AZUL_MED);
  doc.rect(0, 24, W, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRANCO);
  doc.text("Pedágio Simples", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 240);
  doc.text("Comprovante de Pagamento", 14, 19);

  doc.setFontSize(7.5);
  doc.setTextColor(...BRANCO);
  doc.text(`Emitido em: ${hoje()}`, W - 14, 12, { align: "right" });
  doc.text("Documento oficial", W - 14, 19, { align: "right" });

  // ── Título + status ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...AZUL);
  doc.text("Comprovante de Pagamento", 14, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...VERDE);
  doc.text("Pagamento Aprovado · Pendências quitadas com sucesso", 14, 51);

  doc.setDrawColor(...AZUL_CLARO);
  doc.setLineWidth(0.6);
  doc.line(14, 55, W - 14, 55);

  let y = 62;

  // ── Caixas de info ────────────────────────────────────────────────────────
  y = pdfInfoBox(doc, [
    { label: "Protocolo",          value: p.protocolo },
    { label: "Data e hora",        value: `${p.data} às ${p.hora}` },
    { label: "Método de pagamento", value: p.metodo },
    { label: "Status",             value: p.status },
  ], y);

  // ── Valor total ───────────────────────────────────────────────────────────
  doc.setFillColor(...AZUL);
  doc.roundedRect(14, y, W - 28, 16, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRANCO);
  doc.text("VALOR TOTAL PAGO", 20, y + 7);
  doc.setFontSize(13);
  doc.text(formatBRL(p.valorTotal), W - 20, y + 10, { align: "right" });
  y += 24;

  // ── Tabela de passagens ───────────────────────────────────────────────────
  y = pdfSectionTitle(doc, `Passagens (${p.passagens.length} registros)`, y);

  autoTable(doc, {
    startY: y,
    head: [["Placa", "ID Passagem", "Data", "Hora", "Rodovia", "Praça", "Km", "Valor"]],
    body: p.passagens.map((ps) => [
      ps.placa,
      ps.idPassagem,
      ps.data,
      ps.hora,
      ps.rodovia,
      ps.praca,
      ps.km,
      formatBRL(ps.valor),
    ]),
    foot: [["", "", "", "", "", "", `${p.passagens.length} passagens`, formatBRL(p.valorTotal)]],
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3, textColor: PRETO },
    headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: AZUL_CLARO, textColor: AZUL, fontStyle: "bold" },
    columnStyles: {
      0: { fontStyle: "bold", textColor: AZUL, cellWidth: 26 },
      1: { cellWidth: 34, textColor: CINZA },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 28 },
      5: { cellWidth: 22 },
      6: { halign: "center", cellWidth: 12 },
      7: { halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  pdfFooter(doc);
  doc.save(`comprovante-${p.protocolo}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Excel — Comprovante de Pagamento
// ══════════════════════════════════════════════════════════════════════════════
function gerarExcelComprovante(p: ComprovanteExportParams) {
  const wb = XLSX.utils.book_new();

  // Aba 1: Resumo do comprovante
  const wsResumo = XLSX.utils.aoa_to_sheet([
    [`Pedágio Simples — Comprovante de Pagamento`],
    [`Emitido em: ${hoje()}`],
    [],
    ["DETALHES DA TRANSAÇÃO"],
    ["Protocolo",            p.protocolo],
    ["Data e hora",          `${p.data} às ${p.hora}`],
    ["Método de pagamento",  p.metodo],
    ["Status",               p.status],
    ["Valor total pago (R$)", p.valorTotal],
    [],
    ["Total de passagens",   p.passagens.length],
  ]);
  wsResumo["!cols"] = [{ wch: 28 }, { wch: 30 }];
  wsResumo["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsResumo, "Comprovante");

  // Aba 2: Passagens individuais
  const rows = p.passagens.map((ps, i) => [
    i + 1, ps.placa, ps.idPassagem, ps.data, ps.hora,
    ps.rodovia, ps.praca, ps.km, ps.valor,
  ]);

  const wsPass = XLSX.utils.aoa_to_sheet([
    [`Passagens — Comprovante ${p.protocolo}`],
    [`Emitido em: ${hoje()} · ${p.passagens.length} registros`],
    [],
    ["#", "Placa", "ID Passagem", "Data", "Hora", "Rodovia", "Praça", "Km", "Valor (R$)"],
    ...rows,
    [],
    ["", "", "", "", "", "", "", `${p.passagens.length} passagens`, p.valorTotal],
  ]);
  wsPass["!cols"] = [
    { wch: 5 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 12 },
    { wch: 20 }, { wch: 16 }, { wch: 8 }, { wch: 16 },
  ];
  wsPass["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
  ];
  XLSX.utils.book_append_sheet(wb, wsPass, `Passagens`);

  downloadXlsx(wb, `comprovante-${p.protocolo}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Entry point — Comprovante
// ══════════════════════════════════════════════════════════════════════════════
export function exportarComprovante(params: ComprovanteExportParams, formato: "pdf" | "excel") {
  if (formato === "pdf") gerarPdfComprovante(params);
  else                   gerarExcelComprovante(params);
}
