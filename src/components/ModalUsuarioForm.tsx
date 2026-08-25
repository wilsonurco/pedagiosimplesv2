import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User, Mail, Building2, Briefcase, Shield, Info, CheckCircle2 } from "lucide-react";
import { Usuario, PerfilAcesso, StatusUsuario, getModulosPorPerfil, PerfilModulo, PERFIS_INICIAIS } from "../types/usuario";
import { Badge } from "./ui/badge";

interface ModalUsuarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioEdicao?: Usuario | null;
  onSalvar: (dados: Partial<Usuario>) => void;
  empresaPadrao?: string;
  perfisDisponiveis?: PerfilModulo[];
}

export function ModalUsuarioForm({
  open,
  onOpenChange,
  usuarioEdicao,
  onSalvar,
  empresaPadrao = "Concessionária Via Expressa S/A",
  perfisDisponiveis = PERFIS_INICIAIS,
}: ModalUsuarioFormProps) {
  const isEdicao = !!usuarioEdicao;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState(empresaPadrao);
  const [cargo, setCargo] = useState("");
  const [perfil, setPerfil] = useState<PerfilAcesso>("Analista");
  const [status, setStatus] = useState<StatusUsuario>("Ativo");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuarioEdicao) {
      setNome(usuarioEdicao.nome || "");
      setEmail(usuarioEdicao.email || "");
      setEmpresa(usuarioEdicao.empresa || empresaPadrao);
      setCargo(usuarioEdicao.cargo || "");
      setPerfil(usuarioEdicao.perfil || "Analista");
      setStatus(usuarioEdicao.status || "Ativo");
    } else {
      setNome("");
      setEmail("");
      setEmpresa(empresaPadrao);
      setCargo("");
      setPerfil("Analista");
      setStatus("Ativo");
    }
    setErrors({});
  }, [usuarioEdicao, open, empresaPadrao]);

  const validar = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "Nome completo é obrigatório.";
    if (!email.trim()) {
      errs.email = "E-mail corporativo é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "E-mail em formato inválido.";
    }
    if (!empresa.trim()) errs.empresa = "Empresa é obrigatória.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    const modulos = getModulosPorPerfil(perfil, perfisDisponiveis);

    onSalvar({
      ...(usuarioEdicao?.id ? { id: usuarioEdicao.id } : {}),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      empresa: empresa.trim(),
      cargo: cargo.trim() || "Colaborador",
      perfil,
      status,
      modulosAcesso: modulos,
      senhaTemporaria: isEdicao ? usuarioEdicao.senhaTemporaria : true,
    });
    onOpenChange(false);
  };

  const modulosPrevistos = getModulosPorPerfil(perfil, perfisDisponiveis);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border border-[#DCDDE3] rounded-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Fixo */}
        <DialogHeader className="p-6 pb-4 border-b border-[#DCDDE3] bg-white shrink-0 sticky top-0 z-10 pr-10">
          <DialogTitle className="text-lg font-bold text-[#1A1B23] flex items-center gap-2">
            <User className="w-5 h-5 text-[#5B2E8C]" />
            {isEdicao ? "Editar Usuário" : "Cadastrar Novo Usuário"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#8A8B95]">
            {isEdicao
              ? "Atualize as informações cadastrais e permissões de acesso do usuário."
              : "Cadastre um novo usuário para conceder acesso ao Portal Pedágio Simples."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nome Completo */}
          <div className="space-y-1">
            <Label htmlFor="nome" className="text-xs font-semibold text-[#1A1B23]">
              Nome Completo <span className="text-[#C8324A]">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Carlos Eduardo da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={`pl-10 border-[#DCDDE3] focus:border-[#5B2E8C] text-sm ${
                  errors.nome ? "border-[#C8324A]" : ""
                }`}
              />
            </div>
            {errors.nome && <p className="text-[11px] text-[#C8324A]">{errors.nome}</p>}
          </div>

          {/* E-mail Corporativo */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-[#1A1B23]">
              E-mail Corporativo <span className="text-[#C8324A]">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@concessionaria.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 border-[#DCDDE3] focus:border-[#5B2E8C] text-sm ${
                  errors.email ? "border-[#C8324A]" : ""
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-[#C8324A]">{errors.email}</p>}
          </div>

          {/* Grid Empresa e Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="empresa" className="text-xs font-semibold text-[#1A1B23]">
                Empresa / Concessionária <span className="text-[#C8324A]">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
                <Input
                  id="empresa"
                  type="text"
                  placeholder="Nome da Concessionária"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="pl-10 border-[#DCDDE3] focus:border-[#5B2E8C] text-sm"
                />
              </div>
              {errors.empresa && <p className="text-[11px] text-[#C8324A]">{errors.empresa}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cargo" className="text-xs font-semibold text-[#1A1B23]">
                Cargo / Função
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
                <Input
                  id="cargo"
                  type="text"
                  placeholder="Ex: Analista Financeiro"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="pl-10 border-[#DCDDE3] focus:border-[#5B2E8C] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Perfil de Acesso */}
          <div className="space-y-1">
            <Label htmlFor="perfil" className="text-xs font-semibold text-[#1A1B23]">
              Perfil de Acesso <span className="text-[#C8324A]">*</span>
            </Label>
            <Select value={perfil} onValueChange={(val: PerfilAcesso) => setPerfil(val)}>
              <SelectTrigger id="perfil" className="border-[#DCDDE3] text-sm">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {perfisDisponiveis.map((p) => (
                  <SelectItem key={p.id} value={p.nome}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview dos Módulos Liberados conforme o Perfil */}
          <div className="bg-[#F7F5FB] p-3 rounded-lg border border-[#E5E6EC]">
            <p className="text-xs font-semibold text-[#5B2E8C] mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Módulos com Acesso Liberado para {perfil}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {modulosPrevistos.map((m) => (
                <Badge key={m} variant="outline" className="bg-white border-[#5B2E8C]/20 text-[#5B2E8C] text-[11px] px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-[#0E8B5A]" />
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          {/* Aviso de onboarding no cadastro novo apenas para Administrador */}
          {!isEdicao && perfil === "Administrador" && (
            <div className="bg-[#FBE8C5]/60 border border-[#F4C97A] p-3 rounded-lg flex items-start gap-2 text-xs text-[#9A5B00]">
              <Info className="w-4 h-4 text-[#C77700] flex-shrink-0 mt-0.5" />
              <div>
                <strong>Envio Automático de Boas-Vindas:</strong>
                <p className="text-[11px] leading-tight text-[#7A4700]">
                  Após salvar, um e-mail transacional será disparado com a URL do portal e a senha temporária padrão (
                  <code className="bg-[#FBE8C5] px-1 py-0.5 rounded font-mono font-bold">123@Mudar</code>). O primeiro acesso exigirá a troca obrigatoriamente.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-[#DCDDE3] gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#DCDDE3] text-[#8A8B95]"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white">
              {isEdicao ? "Salvar Alterações" : "Cadastrar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
