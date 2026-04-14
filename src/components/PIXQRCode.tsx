import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, QrCode, Copy, Check, Clock, CheckCircle2, Smartphone, Shield, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface PIXQRCodeProps {
  onBack: () => void;
  onPagamentoConfirmado: (dados: any) => void;
  valorTotal: number;
  debitosSelecionados: any[];
}

export function PIXQRCode({
  onBack,
  onPagamentoConfirmado,
  valorTotal,
  debitosSelecionados
}: PIXQRCodeProps) {
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos em segundos
  const [statusPagamento, setStatusPagamento] = useState<'aguardando' | 'processando' | 'confirmado'>('aguardando');

  // Dados simulados do PIX
  const pixCode = "00020126580014br.gov.bcb.pix013600000000-0000-0000-0000-00000000000052040000530398654" + valorTotal.toFixed(2).replace('.', '') + "5802BR5925Pedagio Online Digitais6009SAO PAULO62070503***63047C3A";
  const pixKey = "pedagioonline@pagamentos.com.br";
  const numeroTransacao = `PO${Date.now()}PIX`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tempoRestante > 0 && statusPagamento === 'aguardando') {
      timer = setTimeout(() => {
        setTempoRestante(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tempoRestante, statusPagamento]);

  // Simular verificação de pagamento
  useEffect(() => {
    let simulatedPayment: NodeJS.Timeout;
    let processamento: NodeJS.Timeout;
    let confirmacao: NodeJS.Timeout;
    
    if (statusPagamento === 'aguardando') {
      // Simular confirmação após 5 segundos (para demo)
      simulatedPayment = setTimeout(() => {
        setStatusPagamento('processando');
        processamento = setTimeout(() => {
          setStatusPagamento('confirmado');
          // Aguardar 5 segundos antes de prosseguir
          confirmacao = setTimeout(() => {
            onPagamentoConfirmado({
              numeroTransacao,
              formaPagamento: 'pix',
              valor: valorTotal,
              status: 'confirmado',
              data: new Date().toISOString(),
              pixKey,
              debitos: debitosSelecionados
            });
          }, 5000);
        }, 3000);
      }, 5000);
    }

    return () => {
      if (simulatedPayment) clearTimeout(simulatedPayment);
      if (processamento) clearTimeout(processamento);
      if (confirmacao) clearTimeout(confirmacao);
    };
  }, []); // Execute apenas uma vez ao montar

  const copiarCodigoPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err);
    }
  };

  const renderStatusBadge = () => {
    switch (statusPagamento) {
      case 'aguardando':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Aguardando pagamento
          </Badge>
        );
      case 'processando':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
            Processando
          </Badge>
        );
      case 'confirmado':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Pagamento confirmado
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-[#F8F9FA] p-2"
                disabled={statusPagamento === 'confirmado'}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-[#003566]">Pagamento PIX</h1>
                <p className="text-sm text-[#6C757D]">Escaneie o QR Code ou copie o código</p>
              </div>
            </div>
            {renderStatusBadge()}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Timer e Valor */}
          <Card className="border-l-4 border-l-[#00B4D8]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C757D] mb-1">Valor total a pagar</p>
                  <p className="text-3xl font-bold text-[#003566]">{formatCurrency(valorTotal)}</p>
                </div>
                {statusPagamento === 'aguardando' && (
                  <div className="text-right">
                    <p className="text-sm text-[#6C757D] mb-1">Tempo restante</p>
                    <p className={`text-2xl font-bold ${tempoRestante < 120 ? 'text-red-600' : 'text-[#003566]'}`}>
                      {formatTime(tempoRestante)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-[#003566]">
                <QrCode className="h-5 w-5" />
                QR Code PIX
              </CardTitle>
              <p className="text-sm text-[#6C757D]">
                Abra o app do seu banco e escaneie o código
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-white border-2 border-[#E0E0E0] rounded-lg flex items-center justify-center shadow-inner">
                  <div className="w-56 h-56 bg-[#F8F9FA] border border-[#CCCCCC] rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <QrCode className="h-40 w-40 text-[#003566] mx-auto" />
                      <p className="text-sm text-[#6C757D]">QR Code PIX</p>
                      <p className="text-sm text-[#003566] font-medium">
                        {formatCurrency(valorTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Código PIX Copia e Cola */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#003566]">Código PIX Copia e Cola</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarCodigoPix}
                    className="flex items-center gap-2"
                    disabled={statusPagamento === 'confirmado'}
                  >
                    {copiado ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-4">
                  <p className="text-xs text-[#000000] break-all font-mono leading-relaxed">
                    {pixCode}
                  </p>
                </div>
              </div>

              {/* Informações do PIX */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Como pagar via PIX:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha a opção PIX</li>
                      <li>Escaneie o QR Code ou cole o código</li>
                      <li>Confirme o pagamento</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Informações de Segurança */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-900">Segurança garantida</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Transação protegida por criptografia</li>
                      <li>• Confirmação automática em tempo real</li>
                      <li>• Comprovante enviado por email</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Detalhes da Transação */}
              <div className="border-t border-[#E0E0E0] pt-4 space-y-3">
                <h4 className="font-semibold text-[#003566]">Detalhes da transação</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#6C757D]">Favorecido</p>
                    <p className="font-medium text-[#000000]">Pedágio Online Soluções Digitais</p>
                  </div>
                  <div>
                    <p className="text-[#6C757D]">Chave PIX</p>
                    <p className="font-medium text-[#000000]">{pixKey}</p>
                  </div>
                  <div>
                    <p className="text-[#6C757D]">Nº da Transação</p>
                    <p className="font-medium text-[#000000]">{numeroTransacao}</p>
                  </div>
                  <div>
                    <p className="text-[#6C757D]">Débitos</p>
                    <p className="font-medium text-[#000000]">{debitosSelecionados.length} pendência(s)</p>
                  </div>
                </div>
              </div>

              {/* Aviso de Tempo */}
              {statusPagamento === 'aguardando' && tempoRestante < 120 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Atenção!</h4>
                      <p className="text-sm text-yellow-800">
                        Este PIX expira em menos de 2 minutos. Complete o pagamento rapidamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status de Processamento */}
              {statusPagamento === 'processando' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Processando pagamento...</h4>
                      <p className="text-sm text-blue-800">
                        Recebemos seu pagamento e estamos processando. Aguarde um momento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmação */}
              {statusPagamento === 'confirmado' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Pagamento confirmado!</h4>
                      <p className="text-sm text-green-800">
                        Suas pendências foram quitadas com sucesso. Redirecionando...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}