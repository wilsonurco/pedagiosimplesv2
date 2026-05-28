import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, CreditCard, Calendar, MapPin, Car, AlertTriangle, Shield, Clock, ChevronRight, Radio, Lock, UserPlus, LogIn, CheckCircle } from "lucide-react";
import { useState } from "react";
import { gerarDebitos, agregarPorTipo, type Passagem } from '../utils/simulator';
import { TipoPassagemBadge } from './ui/tipo-passagem-badge';

interface ResultadosDebitosProps {
  onBack: () => void;
  onPagar: (debitosSelecionados: Passagem[], valorTotal: number) => void;
  onCadastrar: () => void;
  onLogin: () => void;
  dadosVeiculo: any;
  isAuthenticated?: boolean;
}

export function ResultadosDebitos({ onBack, onPagar, onCadastrar, onLogin, dadosVeiculo, isAuthenticated = false }: ResultadosDebitosProps) {
  const placa = dadosVeiculo?.placa || "ABC-1234";

  const passagens: Passagem[] = gerarDebitos(placa);

  const [selecionados, setSelecionados] = useState<string[]>(passagens.map(p => p.id));

  const passagensSelecionadas = passagens.filter(p => selecionados.includes(p.id));
  const totalSelecionado = passagensSelecionadas.reduce((sum, p) => sum + p.valor, 0);
  const comRiscoDeMulta = passagens.filter(p => p.status === 'risco_multa').length;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const toggle = (id: string) =>
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  const toggleTodos = () =>
    setSelecionados(selecionados.length === passagens.length ? [] : passagens.map(p => p.id));

  const diasAteVencimento = (vencimento: string) => {
    const [d, m, a] = vencimento.split("/").map(Number);
    const diff = new Date(a, m - 1, d).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FB] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F7F5FB] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Nova consulta
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5B2E8C] rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#5B2E8C]">Pedágio Simples</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-6">

        {/* Título */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#FBE8C5] text-[#9A5B00] border border-[#F4C97A] rounded-full px-4 py-1.5 text-sm font-semibold">
            <Radio className="h-4 w-4" />
            Passagens Free Flow detectadas
          </div>
          <h1 className="text-3xl font-bold text-[#1A1B23]">
            {passagens.length} passagem{passagens.length > 1 ? "s" : ""} em pórtico encontrada{passagens.length > 1 ? "s" : ""}
          </h1>
          <p className="text-[#8A8B95]">
            Placa <span className="font-semibold text-[#5B2E8C]">{placa}</span> — veículo sem TAG identificado em pórticos Free Flow
          </p>
          {(() => {
            const r = agregarPorTipo(passagens);
            if (r.countTotal === 0) return null;
            return (
              <p className="text-[#5B2E8C] font-medium">
                {r.countPraca > 0 && <><strong>{r.countPraca}</strong> {r.countPraca > 1 ? 'praças de pedágio' : 'praça de pedágio'}</>}
                {r.countPraca > 0 && r.countPortico > 0 && ' · '}
                {r.countPortico > 0 && <><strong>{r.countPortico}</strong> {r.countPortico > 1 ? 'pórticos Free Flow' : 'pórtico Free Flow'}</>}
              </p>
            );
          })()}
        </div>

        {/* Estado vazio */}
        {passagens.length === 0 && (
          <Card className="border border-[#DCDDE3] shadow-sm">
            <CardContent className="py-12 text-center space-y-3">
              <CheckCircle className="h-16 w-16 text-[#0E8B5A] mx-auto" />
              <h2 className="text-xl font-bold text-[#1A1B23]">Nenhuma passagem em aberto</h2>
              <p className="text-[#8A8B95]">A placa <strong>{placa}</strong> está em dia. Sem cobranças pendentes.</p>
              <Button
                onClick={onCadastrar}
                variant="outline"
                className="border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white mt-2"
              >
                Cadastrar veículo e monitorar
              </Button>
            </CardContent>
          </Card>
        )}

        {passagens.length > 0 && (
        <>

        {/* Alerta de risco de multa */}
        {comRiscoDeMulta > 0 && (
          <div className="bg-[#F8D7DD] border border-[#F0A8B5] rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#C8324A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#7D1830]">
                {comRiscoDeMulta} passagem{comRiscoDeMulta > 1 ? "ns" : ""} próxima{comRiscoDeMulta > 1 ? "s" : ""} do prazo de vencimento
              </p>
              <p className="text-sm text-[#A3203B] mt-0.5">
                Débitos não pagos no prazo se transformam em <strong>multa de evasão de pedágio</strong>. Regularize agora para evitar penalidades.
              </p>
            </div>
          </div>
        )}

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#DCDDE3] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[#1A1B23]">{passagens.length}</p>
            <p className="text-xs text-[#8A8B95] uppercase tracking-wide mt-1">Passagens</p>
          </div>
          <div className="bg-[#5B2E8C] rounded-lg p-4 text-center">
            {isAuthenticated ? (
              <p className="text-2xl font-bold text-white">
                {formatCurrency(passagens.reduce((s, p) => s + p.valor, 0))}
              </p>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-white/60" />
                <p className="text-xl font-bold text-white/60">R$ ••,••</p>
              </div>
            )}
            <p className="text-xs text-white/70 uppercase tracking-wide mt-1">Total a pagar</p>
          </div>
          <div className={`rounded-lg p-4 text-center border ${comRiscoDeMulta > 0 ? "bg-[#F8D7DD] border-[#F0A8B5]" : "bg-[#D4F0E2] border-[#A3D9BE]"}`}>
            <p className={`text-2xl font-bold ${comRiscoDeMulta > 0 ? "text-[#A3203B]" : "text-[#0A6B45]"}`}>
              {comRiscoDeMulta > 0 ? comRiscoDeMulta : "0"}
            </p>
            <p className={`text-xs uppercase tracking-wide mt-1 ${comRiscoDeMulta > 0 ? "text-[#C8324A]" : "text-[#0E8B5A]"}`}>
              {comRiscoDeMulta > 0 ? "Risco de multa" : "Sem risco"}
            </p>
          </div>
        </div>

        {/* Vista autenticada: lista completa */}
        {isAuthenticated && (
          <>
            <Card className="border border-[#DCDDE3] shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#1A1B23] flex items-center gap-2">
                    <Radio className="h-5 w-5 text-[#5B2E8C]" />
                    Passagens por pórtico Free Flow
                  </CardTitle>
                  <button
                    onClick={toggleTodos}
                    className="text-sm text-[#5B2E8C] hover:underline font-medium"
                  >
                    {selecionados.length === passagens.length ? "Desmarcar todas" : "Selecionar todas"}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {passagens.map((p) => {
                  const selecionado = selecionados.includes(p.id);
                  const dias = diasAteVencimento(p.prazoLimite);
                  const urgente = dias <= 7;
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selecionado
                          ? "bg-[#F4EFFB] border-[#5B2E8C]"
                          : "bg-white border-[#DCDDE3] hover:border-[#5B2E8C]/40"
                      }`}
                    >
                      <Checkbox
                        checked={selecionado}
                        onCheckedChange={() => toggle(p.id)}
                        className="mt-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <TipoPassagemBadge tipo={p.tipo} className="mb-1.5" />
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-[#5B2E8C] text-sm truncate">{p.local}</span>
                              {p.status === 'risco_multa' && (
                                <Badge variant="risco" className="flex-shrink-0">Próx. venc.</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#8A8B95]">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{p.rodovia}{p.km ? ` · KM ${p.km}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[#8A8B95]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {p.data} às {p.hora}
                              </span>
                              <span className="text-[#8A8B95]">·</span>
                              <span>{p.concessionaria}</span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 flex-shrink-0">
                            <span className={`font-bold text-lg ${selecionado ? "text-[#5B2E8C]" : "text-[#8B5FFF]"}`}>
                              {formatCurrency(p.valor)}
                            </span>
                            <div className={`flex items-center gap-1 text-xs ${urgente ? "text-[#C8324A] font-medium" : "text-[#8A8B95]"}`}>
                              <Clock className="h-3 w-3" />
                              <span>Vence {p.prazoLimite}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="bg-white border border-[#DCDDE3] rounded-lg p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1A1B23] text-lg">
                    {selecionados.length > 0
                      ? `${selecionados.length} passagem${selecionados.length > 1 ? "ns" : ""} selecionada${selecionados.length > 1 ? "s" : ""}`
                      : "Selecione as passagens para pagar"}
                  </p>
                  <p className="text-sm text-[#8A8B95]">
                    Sem taxa adicional · Quitação em tempo real
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#5B2E8C]">{formatCurrency(totalSelecionado)}</p>
                  <p className="text-xs text-[#8A8B95]">valor a pagar</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => onPagar(passagensSelecionadas, totalSelecionado)}
                disabled={selecionados.length === 0}
                className={`w-full h-14 text-base font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  selecionados.length > 0
                    ? "bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white"
                    : "bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                {selecionados.length > 0
                  ? `Pagar ${formatCurrency(totalSelecionado)} agora`
                  : "Selecione ao menos uma passagem"}
                {selecionados.length > 0 && <ChevronRight className="h-5 w-5 ml-1" />}
              </Button>

              <div className="flex items-center gap-2 text-xs text-[#8A8B95] justify-center">
                <Shield className="h-3.5 w-3.5" />
                <span>Pagamento 100% seguro · Sem taxa de serviço · Quitação em tempo real</span>
              </div>
            </div>
          </>
        )}

        {/* Vista não autenticada: detalhes bloqueados */}
        {!isAuthenticated && (
          <Card className="border border-[#DCDDE3] shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-[#1A1B23] flex items-center gap-2">
                <Radio className="h-5 w-5 text-[#5B2E8C]" />
                Passagens por pórtico Free Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Blurred rows */}
              <div className="relative">
                <div className="space-y-0 divide-y divide-[#ECECF1] px-6 pb-4 select-none pointer-events-none">
                  {passagens.map((_, i) => (
                    <div key={i} className="py-4 blur-sm opacity-60">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 mt-1 rounded bg-[#DCDDE3] flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-56 bg-[#DCDDE3] rounded" />
                              <div className="h-2.5 w-40 bg-[#DCDDE3] rounded" />
                              <div className="h-2.5 w-32 bg-[#DCDDE3] rounded" />
                            </div>
                            <div className="space-y-1.5 items-end flex flex-col">
                              <div className="h-5 w-16 bg-[#DCDDE3] rounded" />
                              <div className="h-2.5 w-20 bg-[#DCDDE3] rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                  <div className="text-center space-y-3 px-6">
                    <div className="w-14 h-14 rounded-full bg-[#5B2E8C] flex items-center justify-center mx-auto shadow-lg">
                      <Lock className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5B2E8C] text-base">Detalhes protegidos</p>
                      <p className="text-sm text-[#8A8B95] mt-1 max-w-xs mx-auto">
                        Crie uma conta ou faça login para visualizar as passagens e quitar seus débitos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA section */}
              <div className="px-6 pb-6 pt-4 border-t border-[#ECECF1] space-y-3 bg-[#F7F5FB]">
                <Button
                  size="lg"
                  onClick={onCadastrar}
                  className="w-full h-12 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  Criar conta grátis e ver detalhes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onLogin}
                  className="w-full h-12 border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Já tenho cadastro — fazer login
                </Button>
                <p className="text-xs text-[#8A8B95] text-center flex items-center justify-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  Dados protegidos conforme a LGPD · Sem taxa de serviço
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        </>
        )}

      </main>
    </div>
  );
}
