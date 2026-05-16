import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { CheckCircle, Download, Share, Home, CreditCard, QrCode, User, LogOut } from "lucide-react";
import jsPDF from 'jspdf';

interface ConfirmacaoPagamentoProps {
  onVoltar: () => void;
  onIrParaDashboard?: () => void;
  dadosPagamento: any;
  usuarioLogado?: boolean;
}

export function ConfirmacaoPagamento({ onVoltar, onIrParaDashboard, dadosPagamento, usuarioLogado }: ConfirmacaoPagamentoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const numeroTransacao = `FP${Date.now().toString().slice(-8)}`;
  const agora = new Date();

  const generatePDFInvoice = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header - Logo e título
    doc.setFillColor(0, 53, 102);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Pedágio Simples', 20, 25);
    
    doc.setFontSize(12);
    doc.text('Comprovante de Pagamento', pageWidth - 20, 25, { align: 'right' });

    yPos = 50;

    // Informações da empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Pedágio Simples Tecnologia LTDA', 20, yPos);
    yPos += 5;
    doc.text('CNPJ: 12.345.678/0001-90', 20, yPos);
    yPos += 5;
    doc.text('Endereço: Rua das Tecnologias, 123 - São Paulo/SP', 20, yPos);
    yPos += 5;
    doc.text('Telefone: (11) 3000-1234 | E-mail: contato@pedagiosimples.com.br', 20, yPos);
    yPos += 15;

    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;

    // Título do comprovante
    doc.setFontSize(16);
    doc.setTextColor(0, 53, 102);
    doc.text('COMPROVANTE DE PAGAMENTO DE PEDÁGIO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Dados da transação
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Número da Transação: ${numeroTransacao}`, 20, yPos);
    yPos += 8;
    doc.text(`Data/Hora: ${formatDate(agora)}`, 20, yPos);
    yPos += 8;
    doc.text(`Status: PAGAMENTO APROVADO`, 20, yPos);
    yPos += 15;

    // Box com valor total
    doc.setFillColor(240, 255, 240);
    doc.rect(20, yPos, pageWidth - 40, 20, 'F');
    doc.setDrawColor(0, 180, 0);
    doc.rect(20, yPos, pageWidth - 40, 20, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`VALOR TOTAL PAGO: ${formatCurrency(dadosPagamento?.valor || 28.10)}`, pageWidth / 2, yPos + 12, { align: 'center' });
    yPos += 35;

    // Forma de pagamento
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const formaPagamento = dadosPagamento?.formaPagamento === 'cartao'
      ? `Cartão ${dadosPagamento.bandeira === 'elo' ? 'ELO' : dadosPagamento.bandeira === 'visa' ? 'Visa' : 'Mastercard'} terminado em ${dadosPagamento.ultimos4}`
      : 'PIX';
    doc.text(`Forma de Pagamento: ${formaPagamento}`, 20, yPos);
    yPos += 20;

    // Detalhes das passagens
    doc.setFontSize(14);
    doc.setTextColor(0, 53, 102);
    doc.text('DETALHES DAS PASSAGENS QUITADAS:', 20, yPos);
    yPos += 10;

    // Tabela de passagens
    const passagens = [
      { local: 'Via Dutra KM 142', valor: 'R$ 8,90' },
      { local: 'Fernão Dias KM 85', valor: 'R$ 12,50' },
      { local: 'Anhanguera KM 23', valor: 'R$ 6,70' }
    ];

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Cabeçalho da tabela
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.text('LOCAL DA PASSAGEM', 25, yPos + 5);
    doc.text('VALOR', pageWidth - 60, yPos + 5);
    yPos += 8;

    // Linhas da tabela
    passagens.forEach((passagem, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos, pageWidth - 40, 8, 'F');
      }
      doc.text(passagem.local, 25, yPos + 5);
      doc.text(passagem.valor, pageWidth - 60, yPos + 5);
      yPos += 8;
    });

    // Linha de total
    doc.setFillColor(240, 255, 240);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setTextColor(0, 100, 0);
    doc.text('TOTAL GERAL:', 25, yPos + 5);
    doc.text('R$ 28,10', pageWidth - 60, yPos + 5);
    yPos += 20;

    // Avisos importantes
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('AVISO IMPORTANTE:', 20, yPos);
    yPos += 6;
    doc.text('• Este comprovante confirma o pagamento das passagens de pedágio listadas acima.', 20, yPos);
    yPos += 5;
    doc.text('• O pagamento da passagem de pedágio não exclui multas por infrações de trânsito.', 20, yPos);
    yPos += 5;
    doc.text('• Em caso de dúvidas, entre em contato através dos canais oficiais do Pedágio Simples.', 20, yPos);
    yPos += 15;

    // Footer
    doc.setFillColor(245, 245, 245);
    doc.rect(0, doc.internal.pageSize.getHeight() - 25, pageWidth, 25, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Pedágio Simples - Sua tranquilidade nas estradas', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text('www.pedagiosimples.com.br | contato@pedagiosimples.com.br | (11) 3000-1234', pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });

    // Salvar o PDF
    doc.save(`comprovante-pedagiosimples-${numeroTransacao}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Sucesso */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-[#1A1B23]">
              Pagamento confirmado!
            </h1>
            <p className="text-xl text-[#8A8B95]">
              Suas pendências foram quitadas com sucesso
            </p>
          </div>

          {/* Detalhes da transação */}
          <Card className="shadow-xl mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center border-b pb-6">
                  <h3 className="text-2xl font-bold text-[#1A1B23] mb-2">
                    Comprovante de Pagamento
                  </h3>
                  <p className="text-[#8A8B95]">Transação nº {numeroTransacao}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#1A1B23] mb-3">Detalhes do pagamento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Data/Hora:</span>
                        <span className="font-medium">{formatDate(agora)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Valor pago:</span>
                        <span className="font-bold text-[#0E8B5A]">{formatCurrency(dadosPagamento?.valor || 28.10)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Forma de pagamento:</span>
                        <span className="font-medium flex items-center gap-1">
                          {dadosPagamento?.formaPagamento === 'cartao' ? (
                            <>
                              <CreditCard className="h-4 w-4 text-[#5B2E8C]" />
                              Cartão {dadosPagamento.bandeira === 'elo' ? 'ELO' : dadosPagamento.bandeira === 'visa' ? 'Visa' : 'Mastercard'}{' '}terminado em <strong>{dadosPagamento.ultimos4}</strong>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4 text-[#5B2E8C]" />
                              Pago via PIX
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Status:</span>
                        <span className="font-medium text-[#0E8B5A]">Aprovado</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#1A1B23] mb-3">Pendências quitadas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Via Dutra KM 142:</span>
                        <span className="font-medium">R$ 8,90</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Fernão Dias KM 85:</span>
                        <span className="font-medium">R$ 12,50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8B95]">Anhanguera KM 23:</span>
                        <span className="font-medium">R$ 6,70</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-[#8A8B95] font-semibold">Total:</span>
                          <span className="font-bold text-[#0E8B5A]">R$ 28,10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#D4F0E2] border border-[#A3D9BE] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#0E8B5A] mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#085534] mb-1">✅ Situação regularizada!</p>
                      <p className="text-sm text-[#0A6B45]">
                        Todas as suas pendências foram quitadas!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={generatePDFInvoice}
              className="flex items-center justify-center gap-2 w-full"
            >
              <Download className="h-5 w-5" />
              Baixar comprovante
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usuarioLogado && onIrParaDashboard && (
                <Button 
                  size="lg" 
                  onClick={onIrParaDashboard}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4"
                >
                  <User className="h-5 w-5 mr-2" />
                  Ir para Minha Conta
                </Button>
              )}
              <Button 
                size="lg" 
                onClick={onVoltar}
                variant={usuarioLogado ? "outline" : "default"}
                className={usuarioLogado ? "py-4" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4"}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 text-center space-y-4">


          </div>
        </div>
      </div>
    </div>
  );
}