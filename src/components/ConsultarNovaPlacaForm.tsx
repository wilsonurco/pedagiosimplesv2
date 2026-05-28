import { Button } from "./ui/button";
import { CheckCircle, Loader2, X, XCircle } from "lucide-react";

interface ConsultarNovaPlacaFormProps {
  /** Valor atual da placa sendo digitada */
  placa: string;
  /** Callback de mudança da placa */
  onPlacaChange: (placa: string) => void;
  /** Dispara a consulta de débitos */
  onBuscar: () => void;
  /** Adiciona os débitos encontrados à lista principal */
  onAdicionar: () => void;
  /** Fecha / recolhe o formulário */
  onFechar: () => void;
  /** Estado de carregamento durante a consulta */
  consultando: boolean;
  /** Resultado da última consulta (null = nenhuma consulta feita ainda) */
  resultado: { success: boolean; quantidade: number; valorTotal: number } | null;
  /** Formata valores em BRL */
  formatCurrency: (valor: number) => string;
  /** Classes extras para o wrapper (ex: max-w-xs mx-auto para centralizar no empty state) */
  className?: string;
}

/**
 * Formulário inline de consulta de nova placa.
 *
 * Reutilizado em:
 * — Estado 2 (sem pendências): centrado, com wrapper max-w-xs mx-auto
 * — Estado 3 (lista de pendências): na base do CardContent, largura completa
 */
export function ConsultarNovaPlacaForm({
  placa,
  onPlacaChange,
  onBuscar,
  onAdicionar,
  onFechar,
  consultando,
  resultado,
  formatCurrency,
  className = "",
}: ConsultarNovaPlacaFormProps) {
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Formato antigo: ABC-1234 (inserir hífen automaticamente)
    if (value.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(value)) {
      value = value.slice(0, 3) + "-" + value.slice(3);
    }
    onPlacaChange(value);
  };

  return (
    <div className={`space-y-2 pt-1 text-left ${className}`}>
      {/* Cabeçalho com título e botão de fechar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#8A8B95]">
          Consultar outra placa
        </span>
        <button
          onClick={onFechar}
          className="text-[#B0B1BB] hover:text-[#5B2E8C] transition-colors"
          aria-label="Fechar formulário"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Input de placa + botão Buscar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={placa}
          onChange={handlePlacaChange}
          placeholder="ABC-1234"
          className="flex-1 h-9 px-3 bg-[#F7F7F9] border border-[#E5E6EC] rounded-lg text-sm text-center font-semibold tracking-wider placeholder-[#B0B1BB] focus:outline-none focus:border-[#8B5FFF] focus:ring-1 focus:ring-[#8B5FFF]/15"
          maxLength={8}
        />
        <Button
          onClick={onBuscar}
          disabled={placa.length < 7 || consultando}
          size="sm"
          className="h-9 px-4 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white text-xs"
        >
          {consultando ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Buscar"
          )}
        </Button>
      </div>

      {/* Resultado da consulta */}
      {resultado && (
        <div className="rounded-lg border border-[#DCDDE3] bg-white p-3 mt-1">
          {resultado.success ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#0E8B5A] flex-shrink-0" />
                <span className="text-xs text-[#1A1B23] font-medium">
                  {resultado.quantidade} pendência
                  {resultado.quantidade > 1 ? "s" : ""} ·{" "}
                  {formatCurrency(resultado.valorTotal)}
                </span>
              </div>
              <Button
                onClick={onAdicionar}
                size="sm"
                className="h-7 px-3 text-xs bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white flex-shrink-0"
              >
                Adicionar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[#8A8B95] flex-shrink-0" />
              <span className="text-xs text-[#8A8B95]">
                Nenhuma pendência encontrada
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
