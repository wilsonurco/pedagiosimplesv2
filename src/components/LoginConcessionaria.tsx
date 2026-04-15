import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, User, Eye, EyeOff, RefreshCw, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import LogoCinza from "../imports/LogoCinza";

interface LoginConcessionariaProps {
  onLogin: (dados: any) => void;
  onVoltar: () => void;
}

export function LoginConcessionaria({ onLogin, onVoltar }: LoginConcessionariaProps) {
  const [formData, setFormData] = useState({ usuario: '', senha: '', captcha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaCode, setCaptchaCode] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setFormData(prev => ({ ...prev, captcha: '' }));
    setErrors(prev => ({ ...prev, captcha: '' }));
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuário é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (!formData.captcha.trim()) {
      newErrors.captcha = 'Digite o código de verificação';
    } else if (formData.captcha.toUpperCase() !== captchaCode) {
      newErrors.captcha = 'Código incorreto. Tente novamente.';
      generateCaptcha();
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        id: 'gestor-1',
        nome: 'Administrador',
        usuario: formData.usuario,
        perfil: 'gestor',
        concessionaria: 'Concessionária Via Expressa S/A',
        trecho: 'SP-330 — km 45 a km 120'
      });
    }, 1500);
  };

  const isFormValid =
    formData.usuario.trim() !== '' &&
    formData.senha !== '' &&
    formData.captcha.trim() !== '';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header mínimo */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="w-48 h-12">
            <LogoCinza />
          </div>
          <button
            onClick={onVoltar}
            className="text-sm text-[#6C757D] hover:text-[#003566] transition-colors"
          >
            ← Voltar ao portal
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Badge de acesso restrito */}
        <div className="inline-flex items-center gap-2 bg-[#003566] text-[#00B4D8] rounded-full px-5 py-2 mb-6">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-widest uppercase">Acesso Concessionária</span>
        </div>
        <p className="text-[#6C757D] text-sm mb-8">Login exclusivo para administradores</p>

        <Card className="w-full max-w-md shadow-md border border-gray-200 rounded-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-[#000000] flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-[#003566]" />
              Login Administrativo
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Usuário */}
              <div className="space-y-1.5">
                <Label htmlFor="usuario" className="text-sm font-medium text-[#000000]">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D]" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={formData.usuario}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    className={`pl-10 border-gray-200 focus:border-[#003566] focus:ring-[#003566] ${errors.usuario ? 'border-red-400' : ''}`}
                    autoComplete="username"
                  />
                </div>
                {errors.usuario && <p className="text-xs text-red-600">{errors.usuario}</p>}
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="senha" className="text-sm font-medium text-[#000000]">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D]" />
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={`pl-10 pr-10 border-gray-200 focus:border-[#003566] focus:ring-[#003566] ${errors.senha ? 'border-red-400' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#003566]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-red-600">{errors.senha}</p>}
              </div>

              {/* CAPTCHA */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6C757D]">Verificação de Segurança</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg h-12 flex items-center justify-center select-none">
                    <span
                      className="text-xl font-bold tracking-[0.3em] text-[#003566]"
                      style={{
                        fontFamily: 'monospace',
                        letterSpacing: '0.35em',
                        textDecoration: 'line-through',
                        textDecorationColor: '#003566',
                        textDecorationStyle: 'wavy'
                      }}
                    >
                      {captchaCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 text-[#6C757D] hover:text-[#003566] transition-colors"
                    title="Gerar novo código"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  placeholder="Digite o código"
                  value={formData.captcha}
                  onChange={(e) => handleInputChange('captcha', e.target.value.toUpperCase())}
                  className={`border-gray-200 focus:border-[#003566] focus:ring-[#003566] ${errors.captcha ? 'border-red-400' : ''}`}
                  maxLength={6}
                />
                {errors.captcha && <p className="text-xs text-red-600">{errors.captcha}</p>}
              </div>

              {/* Botão */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#003566] hover:bg-[#002a52] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Acessar concessionária
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-[#6C757D] text-center">
          Acesso restrito a colaboradores autorizados da concessionária.<br />
          Em caso de problemas, contate o suporte interno.
        </p>
      </div>
    </div>
  );
}
