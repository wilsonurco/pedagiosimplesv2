import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Car, Shield, Clock, AlertCircle, RefreshCw, X, CheckCircle } from "lucide-react";

export function ConsultaRapidaFAQ() {
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Gerar código captcha aleatório
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaValue('');
    setCaptchaError('');
  };

  // Inicializar captcha
  useState(() => {
    generateCaptcha();
  });

  const handleConsultar = async () => {
    // Validar captcha
    if (captchaValue.toLowerCase() !== captchaCode.toLowerCase()) {
      setCaptchaError('Código de verificação incorreto');
      generateCaptcha();
      return;
    }

    setCaptchaError('');
    setLoading(true);

    // Simular consulta
    setTimeout(() => {
      // Dados simulados com foco na privacidade - apenas resumo
      const resultadoSimulado = {
        placa: placa,
        totalPendencias: Math.floor(Math.random() * 5) + 1,
        valorTotal: (Math.random() * 500 + 50).toFixed(2),
        periodo: "Jan/2024 a Dez/2024",
        status: "Pendente"
      };
      
      setResultado(resultadoSimulado);
      setLoading(false);
    }, 2000);
  };

  const handleLimpar = () => {
    setPlaca('');
    setResultado(null);
    setCaptchaValue('');
    setCaptchaError('');
    generateCaptcha();
  };

  const isCaptchaValid = captchaValue.toLowerCase() === captchaCode.toLowerCase();
  const isFormValid = placa.length >= 7 && isCaptchaValid;

  return (
    <div className="max-w-2xl mx-auto">
      {!resultado ? (
        <div className="space-y-6">
          {/* Campo de Placa */}
          <div>
            <label className="block text-sm font-medium text-[#5B2E8C] uppercase tracking-wide mb-2">
              Digite a placa do veículo
            </label>
            <input
              type="text"
              value={placa}
              onChange={(e) => {
                let value = e.target.value.toUpperCase();
                value = value.replace(/[^A-Z0-9]/g, '');
                
                if (value.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(value)) {
                  value = value.slice(0, 3) + '-' + value.slice(3);
                }
                
                setPlaca(value);
              }}
              placeholder="ABC-1234"
              className="w-full h-12 px-4 bg-white border-2 border-[#DCDDE3] rounded-lg text-[#1A1B23] text-center font-semibold tracking-wider placeholder-[#8A8B95] focus:outline-none focus:border-[#8B5FFF] focus:ring-2 focus:ring-[#8B5FFF]/20 transition-all"
              maxLength={8}
            />
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-medium text-[#5B2E8C] uppercase tracking-wide mb-2">
              Verificação de Segurança
            </label>
            <div className="bg-white border-2 border-[#DCDDE3] rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-16 bg-gradient-to-r from-[#F7F5FB] to-[#F0EDF8] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#5B2E8C] bg-white/90 px-3 py-1 rounded-lg tracking-widest shadow-sm">
                    {captchaCode}
                  </span>
                </div>
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  value={captchaValue}
                  onChange={(e) => {
                    setCaptchaValue(e.target.value);
                    setCaptchaError('');
                  }}
                  placeholder="Digite o código da imagem"
                  className={`flex-1 h-10 px-4 text-sm border-r border-[#DCDDE3] focus:outline-none focus:bg-[#F7F5FB] transition-colors ${
                    captchaError ? 'text-[#C8324A] bg-[#F8D7DD]' : 'text-[#1A1B23]'
                  }`}
                />
                <button 
                  type="button"
                  onClick={generateCaptcha}
                  className="w-10 h-10 bg-white border-l border-[#DCDDE3] flex items-center justify-center text-[#5B2E8C] hover:bg-[#F7F5FB] transition-colors"
                  title="Gerar novo código">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            {captchaError && (
              <p className="text-sm text-[#C8324A] mt-2 flex items-center gap-1">
                <X className="w-4 h-4" />
                {captchaError}
              </p>
            )}
          </div>

          {/* Botão de Consulta */}
          <Button
            onClick={handleConsultar}
            disabled={!isFormValid || loading}
            className={`w-full h-12 rounded-lg font-semibold transition-all ${
              isFormValid && !loading
                ? 'bg-[#8B5FFF] hover:bg-[#7142B8] text-white'
                : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Consultando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Consultar Pendências
              </div>
            )}
          </Button>

          {/* Aviso de Privacidade */}
          <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#8B5FFF] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#1A1B23] mb-1">Consulta com Privacidade</h4>
                <p className="text-sm text-[#8A8B95] leading-relaxed">
                  Esta consulta mostra apenas um <strong>resumo geral</strong> das suas pendências, 
                  sem revelar localidades específicas ou detalhes das passagens, preservando sua privacidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Resultado da Consulta - Apenas Resumo */
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#8B5FFF] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1B23] mb-2">
              Consulta Realizada com Sucesso
            </h3>
            <p className="text-[#8A8B95]">
              Resumo das pendências para a placa <strong className="text-[#5B2E8C]">{resultado.placa}</strong>
            </p>
          </div>

          {/* Resumo das Pendências */}
          <Card className="border border-[#DCDDE3]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FFD60A] rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-[#1A1B23]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8A8B95] uppercase tracking-wide">Total de Pendências</p>
                    <p className="text-2xl font-bold text-[#1A1B23]">{resultado.totalPendencias}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#5B2E8C] rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8A8B95] uppercase tracking-wide">Valor Total</p>
                    <p className="text-2xl font-bold text-[#1A1B23]">R$ {resultado.valorTotal}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8A8B95] rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8A8B95] uppercase tracking-wide">Período</p>
                    <p className="text-lg font-semibold text-[#1A1B23]">{resultado.periodo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FFD60A] rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-[#1A1B23]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8A8B95] uppercase tracking-wide">Status</p>
                    <p className="text-lg font-semibold text-[#C8324A]">{resultado.status}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso Importante */}
          <div className="bg-[#FFD60A] border border-[#FFD60A] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#1A1B23] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#1A1B23] mb-2">Informações Importantes:</h4>
                <ul className="text-sm text-[#1A1B23] space-y-1">
                  <li>• Este é apenas um <strong>resumo geral</strong> das suas pendências</li>
                  <li>• Para ver detalhes completos e realizar pagamento, <strong>cadastre-se</strong> em nossa plataforma</li>
                  <li>• Localidades específicas não são exibidas aqui para preservar sua privacidade</li>
                  <li>• Recomendamos regularizar as pendências o quanto antes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleLimpar}
              variant="outline"
              className="flex-1 border-[#8A8B95] text-[#8A8B95] hover:bg-[#8A8B95] hover:text-white"
            >
              Nova Consulta
            </Button>
            <Button
              className="flex-1 bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white"
              onClick={() => {
                // Scroll para o topo da página ou redirecionar para cadastro
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Quitar Pendências
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}