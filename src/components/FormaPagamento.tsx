import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Badge } from "./ui/badge";
import { ArrowLeft, Smartphone, Shield, Clock, QrCode, Car, CheckCircle2, AlertCircle, Copy, Check, Lock } from "lucide-react";
import { useState, useEffect } from "react";

interface FormaPagamentoProps {
  onBack: () => void;
  onPagar: (dados: any) => void;
  onPIX?: (debitos: any[], valorTotal: number) => void;
  valorTotal: number;
  debitosSelecionados?: any[];
}

export function FormaPagamento({ onBack, onPagar, onPIX, valorTotal, debitosSelecionados = [] }: FormaPagamentoProps) {
  const [formaPagamento, setFormaPagamento] = useState<'pix'>('pix');
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
  const isFormValid = () => {
    return true; // Sempre válido para PIX
  };

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
    // Navegar para tela do PIX QR Code
    if (onPIX) {
      onPIX(debitosSelecionados, valorTotal);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F8F9FA] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003566] rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#003566]">Pedágio Simples</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Título e Breadcrumb */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#003566] text-white rounded-full px-4 py-2 mb-6">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-semibold">CHECKOUT SEGURO</span>
            </div>
            <h1 className="text-4xl font-bold text-[#000000] mb-4">
              Finalizar Pagamento
            </h1>
            <p className="text-xl text-[#6C757D]">
              Escolha sua forma de pagamento e quite suas pendências agora mesmo
            </p>
          </div>

          {/* Card Principal */}
          <Card className="border border-[#E0E0E0] shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              {/* Layout Mobile-First Responsivo */}
              <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Seção Principal - Esquerda */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#000000] flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#00B4D8] to-[#0099c7] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <span className="font-bold">Pagamento via PIX</span>
                  </CardTitle>
                  <p className="text-sm sm:text-base text-[#6C757D] pl-10 sm:pl-13 lg:pl-15">
                    Pague de forma rápida e segura
                  </p>
                </div>
                
                {/* Seção do Valor - Direita */}
                <div className="flex-shrink-0">
                  {/* Card do Valor em Mobile */}
                  <div className="lg:hidden bg-gradient-to-r from-[#F8F9FA] to-white border border-[#E0E0E0] rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#6C757D] flex-shrink-0">Total a pagar</p>
                      <Badge className="bg-[#00B4D8] hover:bg-[#0099c7] text-white px-2 py-1 text-xs font-medium rounded-lg flex-shrink-0">
                        À vista
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-[#003566] leading-tight">
                        {formatCurrency(valorTotal)}
                      </div>
                      <p className="text-xs text-[#6C757D] mt-1 opacity-75">
                        Pagamento à vista
                      </p>
                    </div>
                  </div>
                  
                  {/* Layout Desktop */}
                  <div className="hidden lg:block text-right space-y-2">
                    <p className="text-sm font-medium text-[#6C757D]">Total a pagar</p>
                    <div className="text-2xl xl:text-3xl font-bold text-[#003566]">
                      {formatCurrency(valorTotal)}
                    </div>
                    <Badge className="bg-[#00B4D8] hover:bg-[#0099c7] text-white px-3 py-1 text-sm font-medium rounded-lg transition-colors">
                      À vista
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Opção de Pagamento PIX */}
              <div className="space-y-3">
                {/* PIX - Única forma de pagamento */}
                <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-[#00B4D8] bg-gradient-to-br from-[#00B4D8]/5 to-[#003566]/5 shadow-lg ring-2 ring-[#00B4D8]/20">
                  {/* Background decorativo */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#00B4D8]/10 to-transparent rounded-full blur-2xl"></div>
                  
                  <div className="relative flex items-start gap-4">
                    {/* Ícone de check */}
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-5 h-5 bg-[#00B4D8] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    {/* Conteúdo Principal */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Ícone PIX */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#00B4D8] to-[#003566] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 scale-105 shadow-lg">
                          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        
                        {/* Informações */}
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          {/* Título e Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-lg sm:text-xl font-bold text-[#000000]">PIX</h3>
                            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#00B4D8] to-[#003566] text-white px-2.5 py-1 rounded-full text-xs font-medium w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Única opção disponível</span>
                            </div>
                          </div>
                          
                          {/* Características */}
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                              <Clock className="h-4 w-4 text-[#00B4D8] flex-shrink-0" />
                              <span className="font-medium text-[#000000]">Aprovação instantânea</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                              <Shield className="h-4 w-4 text-[#00B4D8] flex-shrink-0" />
                              <span>Seguro e confiável</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                              <QrCode className="h-4 w-4 text-[#00B4D8] flex-shrink-0" />
                              <span>Sem taxas adicionais</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador visual de seleção */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00B4D8] to-[#003566] rounded-b-xl sm:rounded-b-2xl"></div>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <div className="pt-6 space-y-4">
                <Button 
                  onClick={handlePagar}
                  disabled={loading || !isFormValid()}
                  className={`w-full h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 bg-gradient-to-r from-[#00B4D8] to-[#0099c7] hover:from-[#0099c7] hover:to-[#007a9a] text-white shadow-lg hover:shadow-xl ${(!isFormValid() || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent flex-shrink-0"></div>
                        <span className="text-sm sm:text-base font-medium">Processando pagamento...</span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <QrCode className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                          <span className="font-semibold text-sm sm:text-base">
                            Gerar QR Code PIX
                          </span>
                        </div>
                        <div className="hidden sm:block text-white/80">•</div>
                        <span className="font-bold text-sm sm:text-base bg-white/10 px-2 py-1 rounded-lg">
                          {formatCurrency(valorTotal)}
                        </span>
                      </>
                    )}
                  </div>
                </Button>


              </div>

              {/* Informações de Segurança */}
              <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-6 mt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-[#003566] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#000000] mb-2">
                      Sua transação está protegida
                    </h4>
                    <ul className="space-y-1 text-sm text-[#6C757D]">
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
            <Card className="shadow-lg border border-[#F8F9FA] rounded-lg mt-6">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-[#00B4D8] flex items-center justify-center gap-2">
                  <QrCode className="h-6 w-6" />
                  PIX Gerado com Sucesso
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 text-sm font-medium">
                    Expira em: {formatarTempo(tempoRestante)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white border-2 border-[#E0E0E0] rounded-lg p-6 inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(chavePix)}&bgcolor=ffffff&color=000000&format=png`}
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto border border-[#E0E0E0] rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-[#6C757D] mt-3">
                    Escaneie o QR Code com o aplicativo do seu banco
                  </p>
                </div>

                {/* Divisor */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#E0E0E0]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#6C757D]">ou</span>
                  </div>
                </div>

                {/* Chave PIX */}
                <div>
                  <Label className="text-[#000000] mb-2 block">Chave PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={chavePix}
                      readOnly
                      className="text-sm font-mono bg-[#F8F9FA] border-[#E0E0E0]"
                    />
                    <Button
                      onClick={copiarChavePix}
                      size="sm"
                      className={`px-4 transition-colors ${
                        chaveCopiada 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-[#003566] hover:bg-[#002a52]'
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
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Chave copiada com sucesso!
                    </p>
                  )}
                </div>

                {/* Instruções */}
                <div className="bg-[#E8F4FD] border border-[#B3D7F0] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-[#00B4D8] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#003566] mb-2">
                        Como pagar com PIX:
                      </h4>
                      <ol className="space-y-1 text-sm text-[#003566] list-decimal list-inside">
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
                <div className="bg-[#00B4D8] text-white rounded-lg p-4 text-center">
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
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
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
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-orange-800">
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