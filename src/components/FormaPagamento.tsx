import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Badge } from "./ui/badge";
import { ArrowLeft, Smartphone, Shield, Clock, QrCode, Car, CheckCircle2, AlertCircle, Copy, Check, Lock, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { CartaoCreditoForm, type DadosCartao } from './CartaoCreditoForm'

interface FormaPagamentoProps {
  onBack: () => void;
  onPagar: (dados: any) => void;
  onPIX?: (debitos: any[], valorTotal: number) => void;
  valorTotal: number;
  debitosSelecionados?: any[];
}

export function FormaPagamento({ onBack, onPagar, onPIX, valorTotal, debitosSelecionados = [] }: FormaPagamentoProps) {
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'cartao'>('pix');
  const [cartaoValido, setCartaoValido] = useState(false);
  const [dadosCartao, setDadosCartao] = useState<DadosCartao | null>(null);
  const [processandoCartao, setProcessandoCartao] = useState(false);
  const [erroCartao, setErroCartao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pixGerado, setPixGerado] = useState(false);
  const [chavePix, setChavePix] = useState('');
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos
  const [chaveCopiada, setChaveCopiada] = useState(false);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Gerar chave PIX simulada
  const gerarChavePix = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let chave = '';
    for (let i = 0; i < 32; i++) {
      chave += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `00020126580014BR.GOV.BCB.PIX0136${chave}520400005303986540${valorTotal.toFixed(2)}5802BR5909Pedagio Online6009Sao Paulo62070503***6304`;
  };

  // Timer para PIX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pixGerado && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixGerado, tempoRestante]);



  // Validação do formulário
  const isFormValid = () => formaPagamento === 'pix' || (formaPagamento === 'cartao' && cartaoValido);

  // Copiar chave PIX
  const copiarChavePix = async () => {
    try {
      await navigator.clipboard.writeText(chavePix);
      setChaveCopiada(true);
      setTimeout(() => setChaveCopiada(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar chave PIX:', err);
    }
  };

  // Formatação do tempo restante
  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  // Processar pagamento
  const handlePagar = () => {
    if (formaPagamento === 'pix') {
      if (onPIX) onPIX(debitosSelecionados, valorTotal);
      return;
    }
    // Cartão
    if (!dadosCartao) return;
    setProcessandoCartao(true);
    setErroCartao(null);
    setTimeout(() => {
      const ultimos4 = dadosCartao.numero.slice(-4);
      if (ultimos4 === '0000') {
        setProcessandoCartao(false);
        setErroCartao('Pagamento recusado pela operadora. Tente outro cartão.');
        return;
      }
      onPagar({
        formaPagamento: 'cartao',
        bandeira: dadosCartao.bandeira,
        ultimos4,
        nome: dadosCartao.nome,
        valorTotal,
        debitosSelecionados,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FB] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F7F5FB] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5B2E8C] rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#5B2E8C]">Pedágio Simples</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Título e Breadcrumb */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#5B2E8C] text-white rounded-full px-4 py-2 mb-6">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-semibold">CHECKOUT SEGURO</span>
            </div>
            <h1 className="text-4xl font-bold text-[#1A1B23] mb-4">
              Finalizar Pagamento
            </h1>
            <p className="text-xl text-[#8A8B95]">
              Escolha sua forma de pagamento e quite suas pendências agora mesmo
            </p>
          </div>

          {/* Card Principal */}
          <Card className="border border-[#DCDDE3] shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              {/* Layout Mobile-First Responsivo */}
              <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Seção Principal - Esquerda */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#1A1B23] flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#8B5FFF] to-[#7142B8] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <span className="font-bold">Pagamento via PIX</span>
                  </CardTitle>
                  <p className="text-sm sm:text-base text-[#8A8B95] pl-10 sm:pl-13 lg:pl-15">
                    Pague de forma rápida e segura
                  </p>
                </div>
                
                {/* Seção do Valor - Direita */}
                <div className="flex-shrink-0">
                  {/* Card do Valor em Mobile */}
                  <div className="lg:hidden bg-gradient-to-r from-[#F7F5FB] to-white border border-[#DCDDE3] rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#8A8B95] flex-shrink-0">Total a pagar</p>
                      <Badge className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white px-2 py-1 text-xs font-medium rounded-lg flex-shrink-0">
                        À vista
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-[#5B2E8C] leading-tight">
                        {formatCurrency(valorTotal)}
                      </div>
                      <p className="text-xs text-[#8A8B95] mt-1 opacity-75">
                        Pagamento à vista
                      </p>
                    </div>
                  </div>
                  
                  {/* Layout Desktop */}
                  <div className="hidden lg:block text-right space-y-2">
                    <p className="text-sm font-medium text-[#8A8B95]">Total a pagar</p>
                    <div className="text-2xl xl:text-3xl font-bold text-[#5B2E8C]">
                      {formatCurrency(valorTotal)}
                    </div>
                    <Badge className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white px-3 py-1 text-sm font-medium rounded-lg transition-colors">
                      À vista
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Opções de Pagamento */}
              <div className="space-y-3">
                {/* PIX */}
                <button
                  type="button"
                  onClick={() => setFormaPagamento('pix')}
                  className={`w-full text-left group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                    formaPagamento === 'pix'
                      ? 'border-[#8B5FFF] bg-gradient-to-br from-[#8B5FFF]/5 to-[#5B2E8C]/5 shadow-lg ring-2 ring-[#8B5FFF]/20'
                      : 'border-[#DCDDE3] bg-white hover:border-[#8B5FFF]/40'
                  }`}
                >
                  {/* Background decorativo */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#8B5FFF]/10 to-transparent rounded-full blur-2xl"></div>

                  <div className="relative flex items-start gap-4">
                    {/* Ícone de check / radio */}
                    <div className="flex-shrink-0 pt-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        formaPagamento === 'pix' ? 'bg-[#8B5FFF] border-[#8B5FFF]' : 'border-[#C6C7CF]'
                      }`}>
                        {formaPagamento === 'pix' && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Ícone PIX */}
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#8B5FFF] to-[#5B2E8C] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${formaPagamento === 'pix' ? 'scale-105 shadow-lg' : ''}`}>
                          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>

                        {/* Informações */}
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          {/* Título e Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-lg sm:text-xl font-bold text-[#1A1B23]">PIX</h3>
                            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#8B5FFF] to-[#5B2E8C] text-white px-2.5 py-1 rounded-full text-xs font-medium w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Aprovação instantânea</span>
                            </div>
                          </div>

                          {/* Características */}
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2 text-sm text-[#8A8B95]">
                              <Clock className="h-4 w-4 text-[#8B5FFF] flex-shrink-0" />
                              <span className="font-medium text-[#1A1B23]">Aprovação instantânea</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#8A8B95]">
                              <Shield className="h-4 w-4 text-[#8B5FFF] flex-shrink-0" />
                              <span>Seguro e confiável</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#8A8B95]">
                              <QrCode className="h-4 w-4 text-[#8B5FFF] flex-shrink-0" />
                              <span>Sem taxas adicionais</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicador visual de seleção */}
                  {formaPagamento === 'pix' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5FFF] to-[#5B2E8C] rounded-b-xl sm:rounded-b-2xl"></div>
                  )}
                </button>

                {/* Cartão de crédito */}
                <button
                  type="button"
                  onClick={() => setFormaPagamento('cartao')}
                  className={`w-full text-left group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                    formaPagamento === 'cartao'
                      ? 'border-[#8B5FFF] bg-gradient-to-br from-[#8B5FFF]/5 to-[#5B2E8C]/5 shadow-lg ring-2 ring-[#8B5FFF]/20'
                      : 'border-[#DCDDE3] bg-white hover:border-[#8B5FFF]/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        formaPagamento === 'cartao' ? 'bg-[#8B5FFF] border-[#8B5FFF]' : 'border-[#C6C7CF]'
                      }`}>
                        {formaPagamento === 'cartao' && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#8B5FFF] to-[#5B2E8C] rounded-xl flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-bold text-[#1A1B23]">Cartão de crédito</h3>
                            <span className="inline-flex items-center justify-center rounded bg-yellow-400 text-yellow-950 px-2 py-0.5 text-xs font-bold">ELO</span>
                          </div>
                          <p className="text-sm text-[#8A8B95]">ELO em destaque · Visa e Mastercard aceitos</p>
                        </div>
                      </div>
                      {formaPagamento === 'cartao' && (
                        <CartaoCreditoForm
                          onValidChange={(valido, dados) => {
                            setCartaoValido(valido)
                            setDadosCartao(dados)
                            setErroCartao(null)
                          }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Botão de Pagamento */}
              <div className="pt-6 space-y-4">
                <Button
                  onClick={handlePagar}
                  disabled={loading || processandoCartao || !isFormValid()}
                  className={`w-full h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 bg-gradient-to-r from-[#8B5FFF] to-[#7142B8] hover:from-[#7142B8] hover:to-[#2E1547] text-white shadow-lg hover:shadow-xl ${(!isFormValid() || loading || processandoCartao) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                    {loading || processandoCartao ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent flex-shrink-0"></div>
                        <span className="text-sm sm:text-base font-medium">Processando pagamento...</span>
                      </>
                    ) : formaPagamento === 'pix' ? (
                      <>
                        <QrCode className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">Gerar QR Code PIX</span>
                        <div className="hidden sm:block text-white/80">•</div>
                        <span className="font-bold text-sm sm:text-base bg-white/10 px-2 py-1 rounded-lg">
                          {formatCurrency(valorTotal)}
                        </span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">Pagar {formatCurrency(valorTotal)}</span>
                      </>
                    )}
                  </div>
                </Button>

                {erroCartao && (
                  <div className="bg-[#F8D7DD] border border-[#F0A8B5] rounded-lg p-3 flex items-start gap-2 mt-3">
                    <AlertCircle className="h-4 w-4 text-[#C8324A] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#A3203B]">{erroCartao}</p>
                  </div>
                )}
              </div>

              {/* Informações de Segurança */}
              <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-6 mt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-[#5B2E8C] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#1A1B23] mb-2">
                      Sua transação está protegida
                    </h4>
                    <ul className="space-y-1 text-sm text-[#8A8B95]">
                      <li>• Criptografia SSL de 256 bits</li>
                      <li>• Pagamento direto via PIX</li>
                      <li>• Processamento instantâneo</li>
                      <li>• Monitoramento 24/7 contra fraudes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção PIX Gerado */}
          {pixGerado && (
            <Card className="shadow-lg border border-[#F7F5FB] rounded-lg mt-6">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-[#8B5FFF] flex items-center justify-center gap-2">
                  <QrCode className="h-6 w-6" />
                  PIX Gerado com Sucesso
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-[#C8324A]" />
                  <span className="text-[#C8324A] text-sm font-medium">
                    Expira em: {formatarTempo(tempoRestante)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white border-2 border-[#DCDDE3] rounded-lg p-6 inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(chavePix)}&bgcolor=ffffff&color=000000&format=png`}
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto border border-[#DCDDE3] rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-[#8A8B95] mt-3">
                    Escaneie o QR Code com o aplicativo do seu banco
                  </p>
                </div>

                {/* Divisor */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#DCDDE3]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#8A8B95]">ou</span>
                  </div>
                </div>

                {/* Chave PIX */}
                <div>
                  <Label className="text-[#1A1B23] mb-2 block">Chave PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={chavePix}
                      readOnly
                      className="text-sm font-mono bg-[#F7F5FB] border-[#DCDDE3]"
                    />
                    <Button
                      onClick={copiarChavePix}
                      size="sm"
                      className={`px-4 transition-colors ${
                        chaveCopiada 
                          ? 'bg-[#0E8B5A] hover:bg-[#0A6B45]' 
                          : 'bg-[#5B2E8C] hover:bg-[#8B5FFF]'
                      }`}
                    >
                      {chaveCopiada ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {chaveCopiada && (
                    <p className="text-sm text-[#0E8B5A] mt-1 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Chave copiada com sucesso!
                    </p>
                  )}
                </div>

                {/* Instruções */}
                <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-[#8B5FFF] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#5B2E8C] mb-2">
                        Como pagar com PIX:
                      </h4>
                      <ol className="space-y-1 text-sm text-[#5B2E8C] list-decimal list-inside">
                        <li>Abra o app do seu banco</li>
                        <li>Escolha a opção PIX</li>
                        <li>Escaneie o QR Code ou cole a chave</li>
                        <li>Confirme o valor: <strong>{formatCurrency(valorTotal)}</strong></li>
                        <li>Finalize o pagamento</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Valor destacado */}
                <div className="bg-[#8B5FFF] text-white rounded-lg p-4 text-center">
                  <p className="text-sm opacity-90">Valor a pagar:</p>
                  <p className="text-2xl font-bold">{formatCurrency(valorTotal)}</p>
                </div>

                {/* Botão final após pagamento via PIX */}
                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        onPagar({
                          formaPagamento: 'pix',
                          valorTotal: valorTotal,
                          debitosSelecionados: debitosSelecionados,
                          chavePix: chavePix
                        });
                      }, 2000);
                    }}
                    disabled={loading || tempoRestante <= 0}
                    className="w-full h-12 bg-[#0E8B5A] hover:bg-[#0A6B45] text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Processando pagamento...
                      </>
                    ) : tempoRestante <= 0 ? (
                      'PIX Expirado - Gerar Novo'
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Já paguei - Confirmar Pagamento
                      </>
                    )}
                  </Button>
                </div>

                {/* Aviso de tempo */}
                {tempoRestante <= 60 && tempoRestante > 0 && (
                  <div className="bg-[#FBE8C5] border border-[#F4C97A] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-[#C77700]" />
                      <p className="text-sm text-[#7A4800]">
                        <strong>Atenção:</strong> Este PIX expira em menos de 1 minuto!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}