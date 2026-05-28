import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Search, Car, ArrowLeft, Shield, Clock } from "lucide-react";
import { useState } from "react";

interface ConsultaDebitosProps {
  onBack: () => void;
  onConsultar: (dados: any) => void;
}

export function ConsultaDebitos({ onBack, onConsultar }: ConsultaDebitosProps) {
  const [formData, setFormData] = useState({
    placa: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular consulta na API
    setTimeout(() => {
      setLoading(false);
      onConsultar(formData);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FB] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F7F5FB] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5B2E8C] rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#5B2E8C]">Pedágio Simples</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Título da seção */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#F7F5FB] text-[#5B2E8C] rounded-full px-4 py-2 mb-6">
              <Search className="h-4 w-4" />
              <span className="text-sm font-semibold">CONSULTA GRATUITA</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-[#1A1B23]">
              Consulte suas passagens Free Flow
            </h1>
            <p className="text-xl text-[#8A8B95]">
              Passou por um pórtico sem TAG? Consulte as passagens pendentes pelo número da placa
            </p>
          </div>

          {/* Indicadores de segurança */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-white border border-[#F7F5FB] p-4 rounded-lg shadow-sm">
              <Shield className="h-6 w-6 text-[#8B5FFF]" />
              <div>
                <p className="font-semibold text-[#1A1B23]">100% Seguro</p>
                <p className="text-sm text-[#5B5C68]">Seus dados estão protegidos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#F7F5FB] p-4 rounded-lg shadow-sm">
              <Clock className="h-6 w-6 text-[#8B5FFF]" />
              <div>
                <p className="font-semibold text-[#1A1B23]">Resultado Instantâneo</p>
                <p className="text-sm text-[#5B5C68]">Consulta em tempo real</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <Card className="shadow-lg border border-[#F7F5FB] rounded-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-[#1A1B23] flex items-center justify-center gap-3">
                <Car className="h-6 w-6 text-[#5B2E8C]" />
                Consulta por Placa
              </CardTitle>
              <p className="text-[#5B5C68] mt-2">
                Digite apenas a placa do seu veículo para buscar pendências
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Label htmlFor="placa" className="text-lg text-[#1A1B23]">Digite a placa do seu veículo</Label>
                    <p className="text-sm text-[#5B5C68] mt-1">
                      Formato ABC-1234 ou ABC1234
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      id="placa"
                      placeholder="ABC-1234"
                      value={formData.placa}
                      onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                      className="text-xl py-4 text-center font-mono font-bold tracking-[0.05em] uppercase flex-1 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C]"
                      required
                      maxLength={8}
                    />
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white px-8 py-4 whitespace-nowrap rounded-lg font-medium transition-colors"
                      disabled={loading || formData.placa.length < 7}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Consultando...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Consultar gratuito
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="bg-white border-l-4 border-[#8B5FFF] p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#8B5FFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1B23] mb-1">Apenas a placa é suficiente</p>
                    <p className="text-sm text-[#5B5C68]">
                      Identificamos todas as suas passagens em pórticos Free Flow pela placa do veículo, mesmo sem TAG.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFD60A] border border-[#B89207] p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1A1B23] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#FFD60A] font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1B23] mb-1">Regularize antes do prazo</p>
                    <p className="text-sm text-[#1A1B23]">
                      Passagens em pórtico Free Flow não pagas dentro do prazo se transformam em <strong>multa de evasão de pedágio</strong>. A consulta é gratuita.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}