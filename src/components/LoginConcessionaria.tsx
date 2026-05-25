import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, User, Eye, EyeOff, Shield, Building2 } from "lucide-react";
import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import LogoCinza from "../imports/LogoCinza";

interface LoginConcessionariaProps {
  onLogin: (dados: any) => void;
  onVoltar: () => void;
}

// Aplica a máscara XX.XXX.XXX/XXXX-XX (alfanumérico — novo padrão CNPJ 2026)
const formatCNPJ = (raw: string): string => {
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 14);
  if (clean.length <= 2)  return clean;
  if (clean.length <= 5)  return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8)  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
};

const cnpjRaw = (formatted: string) => formatted.replace(/[^A-Za-z0-9]/g, '');

export function LoginConcessionaria({ onLogin, onVoltar }: LoginConcessionariaProps) {
  const [loginMode, setLoginMode] = useState<'usuario' | 'cnpj'>('usuario');
  const [formData, setFormData] = useState({ usuario: '', cnpj: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCNPJChange = (raw: string) => {
    setFormData(prev => ({ ...prev, cnpj: formatCNPJ(raw) }));
    if (errors.cnpj) setErrors(prev => ({ ...prev, cnpj: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (loginMode === 'usuario') {
      if (!formData.usuario.trim()) newErrors.usuario = 'Usuário é obrigatório';
    } else {
      const raw = cnpjRaw(formData.cnpj);
      if (!raw) newErrors.cnpj = 'CNPJ é obrigatório';
      else if (raw.length !== 14) newErrors.cnpj = 'CNPJ deve ter 14 caracteres';
    }
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
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
        usuario: loginMode === 'cnpj' ? formData.cnpj : formData.usuario,
        perfil: 'gestor',
        concessionaria: 'Concessionária Via Expressa S/A',
        trecho: 'SP-330 — km 45 a km 120'
      });
    }, 1500);
  };

  const identifierFilled = loginMode === 'usuario'
    ? formData.usuario.trim() !== ''
    : cnpjRaw(formData.cnpj).length === 14;

  const isFormValid = identifierFilled && formData.senha !== '' && !!turnstileToken;

  const switchMode = (mode: 'usuario' | 'cnpj') => {
    setLoginMode(mode);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#F7F5FB] flex flex-col">
      {/* Header mínimo */}
      <header className="bg-white border-b border-[#DCDDE3]">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="w-48 h-12">
            <LogoCinza />
          </div>
          <button
            onClick={onVoltar}
            className="text-sm text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
          >
            ← Voltar ao portal
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Badge de acesso restrito */}
        <div className="inline-flex items-center gap-2 bg-[#5B2E8C] text-[#8B5FFF] rounded-full px-5 py-2 mb-6">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-widest uppercase">Acesso Concessionária</span>
        </div>
        <p className="text-[#8A8B95] text-sm mb-8">Login exclusivo para administradores</p>

        <Card className="w-full max-w-md shadow-md border border-[#DCDDE3] rounded-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-[#1A1B23] flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-[#5B2E8C]" />
              Login Administrativo
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Segmented control: Usuário | CNPJ */}
              <div className="flex bg-[#ECECF1] rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => switchMode('usuario')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-1.5 rounded-md transition-all ${
                    loginMode === 'usuario'
                      ? 'bg-white text-[#5B2E8C] shadow-sm'
                      : 'text-[#8A8B95] hover:text-[#5B2E8C]'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Usuário
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('cnpj')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-1.5 rounded-md transition-all ${
                    loginMode === 'cnpj'
                      ? 'bg-white text-[#5B2E8C] shadow-sm'
                      : 'text-[#8A8B95] hover:text-[#5B2E8C]'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  CNPJ
                </button>
              </div>

              {/* Campo de identificação — Usuário ou CNPJ */}
              {loginMode === 'usuario' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="usuario" className="text-sm font-medium text-[#1A1B23]">Usuário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
                    <Input
                      id="usuario"
                      type="text"
                      placeholder="Digite seu usuário"
                      value={formData.usuario}
                      onChange={(e) => handleInputChange('usuario', e.target.value)}
                      className={`pl-10 border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${errors.usuario ? 'border-[#E07290]' : ''}`}
                      autoComplete="username"
                    />
                  </div>
                  {errors.usuario && <p className="text-xs text-[#C8324A]">{errors.usuario}</p>}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cnpj" className="text-sm font-medium text-[#1A1B23]">CNPJ</Label>
                    <span className="text-[10px] text-[#8A8B95] bg-[#ECECF1] px-2 py-0.5 rounded-full">
                      Novo formato alfanumérico
                    </span>
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
                    <Input
                      id="cnpj"
                      type="text"
                      inputMode="text"
                      placeholder="AB.CDE.FGH/0001-00"
                      value={formData.cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      className={`pl-10 tracking-wider uppercase border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${errors.cnpj ? 'border-[#E07290]' : ''}`}
                      autoComplete="off"
                      spellCheck={false}
                      maxLength={18}
                    />
                  </div>
                  {errors.cnpj ? (
                    <p className="text-xs text-[#C8324A]">{errors.cnpj}</p>
                  ) : (
                    <p className="text-[11px] text-[#8A8B95]">
                      Formato: XX.XXX.XXX/XXXX-XX · letras e números (Res. RFB nº 2.119/2024)
                    </p>
                  )}
                </div>
              )}

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="senha" className="text-sm font-medium text-[#1A1B23]">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={`pl-10 pr-10 border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${errors.senha ? 'border-[#E07290]' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-[#C8324A]">{errors.senha}</p>}
              </div>

              {/* Turnstile */}
              <div className="flex justify-center">
                <Turnstile
                  key={turnstileKey}
                  siteKey="1x00000000000000000000AA"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => { setTurnstileToken(null); setTurnstileKey(k => k + 1); }}
                  onError={() => { setTurnstileToken(null); setTurnstileKey(k => k + 1); }}
                  options={{ theme: 'light', language: 'pt-BR' }}
                />
              </div>

              {/* Botão */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <p className="mt-6 text-xs text-[#8A8B95] text-center">
          Acesso restrito a colaboradores autorizados da concessionária.<br />
          Em caso de problemas, contate o suporte interno.
        </p>
      </div>
    </div>
  );
}
