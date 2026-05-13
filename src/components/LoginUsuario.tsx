import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, User, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import LogoCinza from "../imports/LogoCinza";

interface LoginUsuarioProps {
  onBack: () => void;
  onLogin: (dados: any) => void;
  onCadastrar: () => void;
  onRecuperarSenha?: () => void;
}

export function LoginUsuario({ onBack, onLogin, onCadastrar, onRecuperarSenha }: LoginUsuarioProps) {
  const [formData, setFormData] = useState({
    cpf: '',
    senha: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const formatCPF = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    // Aplicar formatação de CPF se for o campo CPF
    const finalValue = field === 'cpf' ? formatCPF(value) : value;
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) newErrors.cpf = 'CPF inválido';
    
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Simular login
    setTimeout(() => {
      setLoading(false);
      // Simular dados do usuário logado
      const dadosUsuario = {
        id: '1',
        nome: 'João Silva',
        cpf: formData.cpf,
        telefone: '(11) 99999-9999',
        email: 'joao.silva@email.com',
        placa: 'MOV-1234'
      };
      onLogin(dadosUsuario);
    }, 1500);
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
            <div className="w-48 h-12">
              <LogoCinza />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          {/* Título da seção */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#F7F5FB] text-[#8B5FFF] rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold">ACESSO SEGURO</span>
            </div>



          </div>

          {/* Formulário */}
          <Card className="shadow-lg border border-[#F7F5FB] rounded-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-[#1A1B23] flex items-center justify-center gap-3">
                <Lock className="h-6 w-6 text-[#5B2E8C]" />
                Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-[#1A1B23]">CPF</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8B95]" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="Seu CPF"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className={`text-lg py-3 pl-10 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${errors.cpf ? 'border-[#C8324A]' : ''}`}
                      maxLength={14}
                    />
                  </div>
                  {errors.cpf && <p className="text-sm text-[#C8324A]">{errors.cpf}</p>}
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-[#1A1B23]">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8B95]" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={formData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      className={`text-lg py-3 pl-10 pr-10 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${errors.senha ? 'border-[#C8324A]' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.senha && <p className="text-sm text-[#C8324A]">{errors.senha}</p>}
                </div>

                {/* Link Esqueceu senha */}
                <div className="text-right">
                  <button 
                    type="button"
                    className="text-sm text-[#5B2E8C] hover:underline"
                    onClick={onRecuperarSenha}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white py-4 text-lg rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !formData.cpf.trim() || !formData.senha.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Entrando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Entrar na minha conta
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Divisor */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#F7F5FB]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#8A8B95]">ou</span>
                </div>
              </div>

              {/* Link para cadastro */}
              <div className="text-center">
                <p className="text-[#8A8B95] mb-4">
                  Ainda não tem uma conta?
                </p>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full py-4 text-lg border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#F7F5FB] rounded-lg font-medium transition-colors"
                  onClick={onCadastrar}
                >
                  <User className="h-5 w-5 mr-2" />
                  Criar nova conta
                </Button>
              </div>


            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}