import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, User, Send, CheckCircle, Shield, Clock } from "lucide-react";

interface RecuperarSenhaProps {
  onBack: () => void;
  onLogin: () => void;
}

export function RecuperarSenha({ onBack, onLogin }: RecuperarSenhaProps) {
  const [cpf, setCpf] = useState("");
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCPF = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validação básica de CPF
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpf) {
      setError("Por favor, informe seu CPF");
      setLoading(false);
      return;
    }
    if (!cpfRegex.test(cpf)) {
      setError("Por favor, informe um CPF válido");
      setLoading(false);
      return;
    }

    // Simular envio de link de recuperação
    setTimeout(() => {
      setLinkEnviado(true);
      setLoading(false);
    }, 2000);
  };

  if (linkEnviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-[#00B4D8] opacity-10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FFD60A] opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#003566] opacity-10 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#003566] rounded-lg flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <span className="text-3xl font-semibold text-[#003566]">Pedágio Online</span>
              </div>
              <h1 className="text-2xl font-bold text-[#000000]">Link enviado com sucesso!</h1>
              <p className="text-[#6C757D]">
                Enviamos as instruções para recuperação de senha para o email cadastrado em seu CPF
              </p>
            </div>

            {/* Success Card */}
            <Card className="border border-[#00B4D8] shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#00B4D8] rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#000000]">Verifique sua caixa de entrada</h3>
                    <p className="text-sm text-[#6C757D]">
                      Enviamos um link para o email cadastrado no CPF <strong className="text-[#003566]">{cpf}</strong>
                    </p>
                  </div>

                  <div className="w-full bg-[#F8F9FA] rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#6C757D]">
                      <Clock className="h-4 w-4 text-[#00B4D8]" />
                      <span>O link expira em 60 minutos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#6C757D]">
                      <Shield className="h-4 w-4 text-[#00B4D8]" />
                      <span>Verifique também a pasta de spam</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={onLogin}
                    className="w-full bg-[#003566] hover:bg-[#002a52] text-white transition-colors"
                  >
                    Voltar ao login
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[#6C757D]">
                Não recebeu o email? Verifique se o endereço está correto ou tente novamente.
              </p>
              <p className="text-xs text-[#6C757D]">
                Precisa de ajuda? Entre em contato: contato@pedagioonline.com.br
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#00B4D8] opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FFD60A] opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#003566] opacity-10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#003566] rounded-lg flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-semibold text-[#003566]">Pedágio Online</span>
            </div>
            <h1 className="text-2xl font-bold text-[#000000]">Recuperar senha</h1>
            <p className="text-[#6C757D]">
              Digite seu CPF para receber as instruções de recuperação
            </p>
          </div>

          {/* Form Card */}
          <Card className="border border-[#F8F9FA] shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg text-[#003566]">
                Informe seu CPF cadastrado
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-medium text-[#000000]">
                    CPF
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6C757D]" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      className="pl-10 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] bg-white"
                      maxLength={14}
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#003566] hover:bg-[#002a52] text-white py-3 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar instruções
                    </>
                  )}
                </Button>
              </form>

              {/* Info Box */}
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-[#00B4D8] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-[#000000]">Segurança garantida</h4>
                    <p className="text-xs text-[#6C757D] leading-relaxed">
                      Enviaremos um link seguro para o email cadastrado em seu CPF que expira em 60 minutos. 
                      Você poderá criar uma nova senha de forma segura.
                    </p>
                  </div>
                </div>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onLogin}
                  className="text-sm text-[#003566] hover:underline font-medium flex items-center gap-2 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}