import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Shield, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { PerfilModulo, MODULOS_SISTEMA } from "../types/usuario";

interface ModalPerfilModuloFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfilEdicao?: PerfilModulo | null;
  onSalvarPerfil: (perfil: PerfilModulo) => void;
}

export function ModalPerfilModuloForm({
  open,
  onOpenChange,
  perfilEdicao,
  onSalvarPerfil,
}: ModalPerfilModuloFormProps) {
  const isEdicao = !!perfilEdicao;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (perfilEdicao) {
      setNome(perfilEdicao.nome || "");
      setDescricao(perfilEdicao.descricao || "");
      setModulosSelecionados(perfilEdicao.modulos || []);
    } else {
      setNome("");
      setDescricao("");
      setModulosSelecionados(["Consultas"]);
    }
    setErrors({});
  }, [perfilEdicao, open]);

  const toggleModulo = (nomeModulo: string) => {
    setModulosSelecionados((prev) =>
      prev.includes(nomeModulo)
        ? prev.filter((m) => m !== nomeModulo)
        : [...prev, nomeModulo]
    );
    if (errors.modulos) {
      setErrors((prev) => ({ ...prev, modulos: "" }));
    }
  };

  const selecionarTodos = () => {
    setModulosSelecionados(MODULOS_SISTEMA.map((m) => m.nome));
  };

  const desmarcarTodos = () => {
    setModulosSelecionados([]);
  };

  const validar = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "Nome do perfil é obrigatório.";
    if (modulosSelecionados.length === 0) {
      errs.modulos = "Selecione ao menos 1 módulo para o perfil.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    onSalvarPerfil({
      id: perfilEdicao?.id || `perf-${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim() || "Perfil de acesso personalizado.",
      modulos: modulosSelecionados,
      isSistema: perfilEdicao?.isSistema || false,
      dataCriacao: perfilEdicao?.dataCriacao || new Date().toLocaleDateString("pt-BR"),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white border border-[#DCDDE3] rounded-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Fixo */}
        <DialogHeader className="p-6 pb-4 border-b border-[#DCDDE3] bg-white shrink-0 sticky top-0 z-10 pr-10">
          <DialogTitle className="text-lg font-bold text-[#1A1B23] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#5B2E8C]" />
            {isEdicao ? "Editar Perfil de Acesso" : "Cadastrar Novo Perfil de Acesso"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#8A8B95]">
            Defina o nome do perfil e selecione os módulos que os usuários com este perfil poderão acessar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nome do Perfil */}
          <div className="space-y-1">
            <Label htmlFor="nomePerfil" className="text-xs font-semibold text-[#1A1B23]">
              Nome do Perfil <span className="text-[#C8324A]">*</span>
            </Label>
            <Input
              id="nomePerfil"
              type="text"
              placeholder="Ex: Operador de Pista, Gestor de Frota..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`border-[#DCDDE3] focus:border-[#5B2E8C] text-sm ${
                errors.nome ? "border-[#C8324A]" : ""
              }`}
            />
            {errors.nome && <p className="text-[11px] text-[#C8324A]">{errors.nome}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <Label htmlFor="descPerfil" className="text-xs font-semibold text-[#1A1B23]">
              Descrição do Perfil
            </Label>
            <Textarea
              id="descPerfil"
              placeholder="Descreva as responsabilidades e o objetivo deste perfil..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="border-[#DCDDE3] focus:border-[#5B2E8C] text-xs resize-none h-16"
            />
          </div>

          {/* Seleção de Módulos */}
          <div className="space-y-2 pt-2 border-t border-[#E5E6EC]">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#1A1B23] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#5B2E8C]" />
                Módulos do Sistema <span className="text-[#C8324A]">*</span>
              </Label>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selecionarTodos}
                  className="text-[#5B2E8C] hover:underline font-medium"
                >
                  Marcar todos
                </button>
                <span className="text-[#C6C7CF]">|</span>
                <button
                  type="button"
                  onClick={desmarcarTodos}
                  className="text-[#8A8B95] hover:underline"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            {errors.modulos && (
              <p className="text-xs text-[#C8324A] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.modulos}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {MODULOS_SISTEMA.map((mod) => {
                const checked = modulosSelecionados.includes(mod.nome);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModulo(mod.nome)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      checked
                        ? "bg-[#F7F5FB] border-[#5B2E8C]"
                        : "bg-white border-[#E5E6EC] hover:border-[#DCDDE3]"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleModulo(mod.nome)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${checked ? "text-[#5B2E8C]" : "text-[#1A1B23]"}`}>
                        {mod.nome}
                      </p>
                      <p className="text-[11px] text-[#8A8B95] leading-tight truncate">
                        {mod.descricao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo de Módulos Liberados */}
          <div className="bg-[#F7F5FB] p-3 rounded-lg border border-[#E5E6EC]">
            <p className="text-[11px] font-semibold text-[#5B2E8C] mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8B5A]" />
              Resumo: {modulosSelecionados.length} módulo(s) selecionado(s)
            </p>
            <div className="flex flex-wrap gap-1">
              {modulosSelecionados.map((m) => (
                <Badge key={m} variant="outline" className="bg-white border-[#5B2E8C]/20 text-[#5B2E8C] text-[10px] px-2 py-0.5">
                  {m}
                </Badge>
              ))}
            </div>
          </div>

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
              {isEdicao ? "Salvar Alterações" : "Cadastrar Perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
