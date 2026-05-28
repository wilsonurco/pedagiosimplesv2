import { Button } from "./ui/button";
import { ArrowRight, Shield } from "lucide-react";

interface PagamentoSummaryProps {
  /** Total calculado para os itens selecionados */
  valorTotal: number;
  /** Quantidade total de passagens disponíveis */
  totalPassagens: number;
  /** Quantidade de passagens selecionadas */
  selecionadas: number;
  /** Dispara o fluxo de pagamento */
  onProsseguir: () => void;
  /** Formata valores em BRL */
  formatCurrency: (valor: number) => string;
  /**
   * `inline`  — Aparece dentro do CardContent no mobile (lg:hidden).
   *             Exibe separador de borda, fontes maiores no sm, label adaptativo.
   *
   * `sidebar` — Aparece na coluna direita sticky (desktop).
   *             Exibe título "Resumo do Pagamento" e nota de segurança.
   */
  variant?: "inline" | "sidebar";
}

/**
 * Exibe o total selecionado + botão "Prosseguir para Pagamento".
 *
 * Reutilizado em:
 * — Mobile/tablet: inline no CardContent (variant="inline")
 * — Desktop ≥ 1024px: sidebar sticky direita (variant="sidebar")
 */
export function PagamentoSummary({
  valorTotal,
  totalPassagens,
  selecionadas,
  onProsseguir,
  formatCurrency,
  variant = "inline",
}: PagamentoSummaryProps) {
  const disabled = selecionadas === 0;

  const totalBox = (
    <div className="bg-[#5B2E8C] text-white rounded-lg p-4">
      <div
        className={`flex justify-between items-center ${
          variant === "inline" ? "mb-1 sm:mb-2" : "mb-1"
        }`}
      >
        <span
          className={`font-semibold ${
            variant === "inline" ? "text-sm sm:text-xl" : "text-sm"
          }`}
        >
          Total a Pagar
        </span>
        <span
          className={`font-bold ${
            variant === "inline" ? "text-lg sm:text-3xl" : "text-xl"
          }`}
        >
          {formatCurrency(valorTotal)}
        </span>
      </div>
      {totalPassagens > 0 && (
        <p
          className={`text-[#F7F5FB] opacity-90 ${
            variant === "inline" ? "text-xs sm:text-sm" : "text-xs"
          }`}
        >
          {selecionadas} de {totalPassagens} pendência
          {totalPassagens > 1 ? "s" : ""} selecionada
          {selecionadas > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );

  const prosseguirButton = (
    <Button
      onClick={onProsseguir}
      disabled={disabled}
      className={`w-full font-semibold rounded-lg transition-all ${
        variant === "inline" ? "h-12 sm:h-14 text-sm sm:text-lg" : "h-12 text-sm"
      } ${
        !disabled
          ? "bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
          : "bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed"
      }`}
    >
      <ArrowRight
        className={`mr-2 ${
          variant === "inline" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4"
        }`}
      />
      {variant === "inline" ? (
        <>
          <span className="hidden sm:inline">
            Prosseguir para Pagamento - {formatCurrency(valorTotal)}
          </span>
          <span className="sm:hidden">Pagar - {formatCurrency(valorTotal)}</span>
        </>
      ) : (
        "Prosseguir para Pagamento"
      )}
    </Button>
  );

  if (variant === "sidebar") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#1A1B23]">
          Resumo do Pagamento
        </h3>
        {totalBox}
        {prosseguirButton}
        <div className="flex items-center justify-center gap-2 text-xs text-[#8A8B95] pt-1">
          <Shield className="h-3 w-3 text-[#8B5FFF]" />
          <span>Pagamento 100% seguro</span>
        </div>
      </div>
    );
  }

  // variant === "inline"
  return (
    <div className="border-t-2 border-[#DCDDE3] pt-6 space-y-4">
      {totalBox}
      {prosseguirButton}
    </div>
  );
}
