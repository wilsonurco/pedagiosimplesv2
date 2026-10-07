import { useState, useMemo, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Shield, Plus, Pencil, Trash2, CheckCircle2, Lock, ArrowLeft, AlertCircle, Layers } from "lucide-react";
import { PerfilModulo, MODULOS_SISTEMA } from "../types/usuario";
import { toast } from "sonner";

interface ModalGestaoPerfisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfis: PerfilModulo[];
  onAtualizarPerfis: (perfis: PerfilModulo[]) => void;
  empresas?: string[];
}

export const ModalGestaoPerfis = memo(function ModalGestaoPerfis({
  open,
  onOpenChange,
  perfis,
  onAtualizarPerfis,
  empresas = [],
}: ModalGestaoPerfisProps) {
  // Controle de Visualização (Lista vs Formulário)
  const [perfilEmEdicao, setPerfilEmEdicao] = useState<PerfilModulo | null>(null);
  const [isCriandoPerfil, setIsCriandoPerfil] = useState(false);

  // Filtros da Listagem (conforme design da interface)
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");
  const [ordem, setOrdem] = useState<string>("az");

  // Estado do Formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [empresaForm, setEmpresaForm] = useState("Todas as empresas");
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormAtivo = isCriandoPerfil || !!perfilEmEdicao;

  // Lista dinâmica de empresas para o filtro
  const listaEmpresas = useMemo(() => {
    const setEmp = new Set<string>();
    empresas.forEach((e) => {
      if (e) setEmp.add(e);
    });
    perfis.forEach((p) => {
      if (p.empresa && p.empresa !== "Todas as empresas") setEmp.add(p.empresa);
    });
    const defaults = [
      "Concessionária Via Expressa S/A",
      "Move Mais",
      "Volkswagen",
      "Parceiro",
    ];
    defaults.forEach((d) => setEmp.add(d));
    return Array.from(setEmp);
  }, [empresas, perfis]);

  // Perfis filtrados e ordenados
  const perfisProcessados = useMemo(() => {
    let resultado = [...perfis];

    // 1. Filtrar por empresa
    if (filtroEmpresa && filtroEmpresa !== "todas") {
      resultado = resultado.filter((p) => {
        if (p.empresa === filtroEmpresa) return true;
        // Perfis globais do sistema ou sem restrição atendem à empresa selecionada
        if (!p.empresa || p.empresa === "Todas as empresas" || p.isSistema) return true;
        return false;
      });
    }

    // 2. Ordenar
    resultado.sort((a, b) => {
      switch (ordem) {
        case "az":
          return a.nome.localeCompare(b.nome, "pt-BR");
        case "za":
          return b.nome.localeCompare(a.nome, "pt-BR");
        case "mais-modulos":
          return b.modulos.length - a.modulos.length;
        case "menos-modulos":
          return a.modulos.length - b.modulos.length;
        default:
          return 0;
      }
    });

    return resultado;
  }, [perfis, filtroEmpresa, ordem]);

  const handleIniciarNovoPerfil = () => {
    setPerfilEmEdicao(null);
    setIsCriandoPerfil(true);
    setNome("");
    setDescricao("");
    setEmpresaForm(filtroEmpresa !== "todas" ? filtroEmpresa : "Todas as empresas");
    setModulosSelecionados(["Consultas"]);
    setErrors({});
  };

  const handleIniciarEdicaoPerfil = (perfil: PerfilModulo) => {
    setIsCriandoPerfil(false);
    setPerfilEmEdicao(perfil);
    setNome(perfil.nome || "");
    setDescricao(perfil.descricao || "");
    setEmpresaForm(perfil.empresa || "Todas as empresas");
    setModulosSelecionados(perfil.modulos || []);
    setErrors({});
  };

  const handleVoltarParaLista = () => {
    setIsCriandoPerfil(false);
    setPerfilEmEdicao(null);
    setErrors({});
  };

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

  const selecionarTodosModulos = () => {
    setModulosSelecionados(MODULOS_SISTEMA.map((m) => m.nome));
  };

  const desmarcarTodosModulos = () => {
    setModulosSelecionados([]);
  };

  const validarFormulario = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "Nome do perfil é obrigatório.";
    if (modulosSelecionados.length === 0) {
      errs.modulos = "Selecione ao menos 1 módulo para o perfil.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvarFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const perfilSalvo: PerfilModulo = {
      id: perfilEmEdicao?.id || `perf-${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim() || "Perfil de acesso personalizado.",
      empresa: empresaForm || "Todas as empresas",
      modulos: modulosSelecionados,
      isSistema: perfilEmEdicao?.isSistema || false,
      dataCriacao: perfilEmEdicao?.dataCriacao || new Date().toLocaleDateString("pt-BR"),
    };

    const existe = perfis.some((p) => p.id === perfilSalvo.id);
    let atualizados: PerfilModulo[];
    if (existe) {
      atualizados = perfis.map((p) => (p.id === perfilSalvo.id ? perfilSalvo : p));
      toast.success(`Perfil ${perfilSalvo.nome} atualizado com sucesso.`);
    } else {
      atualizados = [...perfis, perfilSalvo];
      toast.success(`Perfil ${perfilSalvo.nome} cadastrado com sucesso.`);
    }

    onAtualizarPerfis(atualizados);
    handleVoltarParaLista();
  };

  const handleExcluirPerfil = (perfil: PerfilModulo) => {
    if (perfil.isSistema) {
      toast.error("Perfis nativos do sistema não podem ser excluídos.");
      return;
    }
    const atualizados = perfis.filter((p) => p.id !== perfil.id);
    onAtualizarPerfis(atualizados);
    toast.success(`Perfil ${perfil.nome} excluído com sucesso.`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(op) => {
        if (!op) handleVoltarParaLista();
        onOpenChange(op);
      }}
    >
      <DialogContent className="max-w-3xl bg-white border border-[#DCDDE3] rounded-xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
        {/* CABEÇALHO DA LISTA DE PERFIS */}
        {!isFormAtivo ? (
          <DialogHeader className="p-6 pb-4 border-b border-[#DCDDE3] bg-white shrink-0 sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-10">
              <div>
                <DialogTitle className="text-lg font-bold text-[#1A1B23] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#5B2E8C]" />
                  Gestão de Perfis e Permissões de Módulos
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8A8B95]">
                  Cadastre novos perfis de acesso e personalize os módulos liberados para cada perfil.
                </DialogDescription>
              </div>

              <Button
                onClick={handleIniciarNovoPerfil}
                className="bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Perfil
              </Button>
            </div>
          </DialogHeader>
        ) : (
          /* CABEÇALHO DO FORMULÁRIO DE EDIÇÃO / CRIAÇÃO */
          <DialogHeader className="p-6 pb-4 border-b border-[#DCDDE3] bg-white shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-3 pr-10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVoltarParaLista}
                className="h-8 text-[#5B2E8C] hover:bg-[#F7F5FB] px-2 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <DialogTitle className="text-lg font-bold text-[#1A1B23] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#5B2E8C]" />
                  {perfilEmEdicao ? `Editar Perfil — ${perfilEmEdicao.nome}` : "Cadastrar Novo Perfil de Acesso"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8A8B95]">
                  Defina o nome do perfil e marque/desmarque os módulos com acesso liberado.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        )}

        {/* CORPO DO MODAL - MODO LISTA */}
        {!isFormAtivo ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]">
            {/* SEÇÃO DE FILTROS: FILTRAR POR EMPRESA E ORDENAR POR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por Empresa */}
              <div className="space-y-1.5">
                <Label htmlFor="filtro-empresa" className="text-xs font-semibold text-[#1A1B23]">
                  Filtrar por empresa
                </Label>
                <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
                  <SelectTrigger
                    id="filtro-empresa"
                    className="w-full h-10 bg-white border-[#DCDDE3] rounded-lg text-sm text-[#1A1B23] focus:border-[#5B2E8C] focus:ring-1 focus:ring-[#5B2E8C]/20 shadow-xs cursor-pointer"
                  >
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#DCDDE3]">
                    <SelectItem value="todas">Todas as empresas</SelectItem>
                    {listaEmpresas.map((emp) => (
                      <SelectItem key={emp} value={emp}>
                        {emp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar Por */}
              <div className="space-y-1.5">
                <Label htmlFor="ordenar-perfil" className="text-xs font-semibold text-[#1A1B23]">
                  Ordenar por
                </Label>
                <Select value={ordem} onValueChange={setOrdem}>
                  <SelectTrigger
                    id="ordenar-perfil"
                    className="w-full h-10 bg-white border-[#DCDDE3] rounded-lg text-sm text-[#1A1B23] focus:border-[#5B2E8C] focus:ring-1 focus:ring-[#5B2E8C]/20 shadow-xs cursor-pointer"
                  >
                    <SelectValue placeholder="Nome do perfil (A-Z)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#DCDDE3]">
                    <SelectItem value="az">Nome do perfil (A-Z)</SelectItem>
                    <SelectItem value="za">Nome do perfil (Z-A)</SelectItem>
                    <SelectItem value="mais-modulos">Mais módulos liberados</SelectItem>
                    <SelectItem value="menos-modulos">Menos módulos liberados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* LISTA DE CARDS DE PERFIS */}
            <div className="space-y-3 pt-1">
              {perfisProcessados.length > 0 ? (
                perfisProcessados.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-[#DCDDE3] bg-white hover:border-[#5B2E8C]/40 transition-all space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#1A1B23]">{p.nome}</span>
                        {p.isSistema ? (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px]">
                            <Lock className="w-2.5 h-2.5 mr-1" /> Nativo do Sistema
                          </Badge>
                        ) : (
                          <Badge className="bg-[#5B2E8C]/10 text-[#5B2E8C] border-[#5B2E8C]/20 text-[10px]">
                            Personalizado
                          </Badge>
                        )}
                        {p.empresa && p.empresa !== "Todas as empresas" && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                            {p.empresa}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleIniciarEdicaoPerfil(p)}
                          title="Editar perfil e permissões"
                          className="h-8 w-8 p-0 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB] cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        {!p.isSistema && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirPerfil(p)}
                            title="Excluir perfil"
                            className="h-8 w-8 p-0 text-[#8A8B95] hover:text-[#C8324A] hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#8A8B95]">{p.descricao}</p>

                    <div className="pt-2 border-t border-[#E5E6EC]">
                      <p className="text-[11px] font-semibold text-[#5B2E8C] mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8B5A]" />
                        Módulos Liberados ({p.modulos.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.modulos.map((m) => (
                          <span
                            key={m}
                            className="bg-[#F7F5FB] border border-[#E5E6EC] text-[#5B2E8C] text-[11px] px-2 py-0.5 rounded font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4 bg-white rounded-xl border border-dashed border-[#DCDDE3]">
                  <Shield className="w-10 h-10 text-[#8A8B95] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[#1A1B23]">Nenhum perfil encontrado</p>
                  <p className="text-xs text-[#8A8B95] mt-1">
                    Nenhum perfil corresponde aos filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFiltroEmpresa("todas");
                      setOrdem("az");
                    }}
                    className="mt-3 text-xs text-[#5B2E8C] border-[#DCDDE3] hover:bg-[#F7F5FB] cursor-pointer"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CORPO DO MODAL - MODO FORMULÁRIO DE EDIÇÃO / CRIAÇÃO */
          <form onSubmit={handleSalvarFormulario} className="flex-1 overflow-y-auto p-6 space-y-4">
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

            {/* Descrição do Perfil */}
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

            {/* Empresa Vinculada */}
            <div className="space-y-1">
              <Label htmlFor="empresaPerfil" className="text-xs font-semibold text-[#1A1B23]">
                Empresa Vinculada
              </Label>
              <Select value={empresaForm} onValueChange={setEmpresaForm}>
                <SelectTrigger id="empresaPerfil" className="border-[#DCDDE3] focus:border-[#5B2E8C] text-sm bg-white cursor-pointer">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DCDDE3]">
                  <SelectItem value="Todas as empresas">Todas as empresas (Global)</SelectItem>
                  {listaEmpresas.map((emp) => (
                    <SelectItem key={emp} value={emp}>
                      {emp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[#8A8B95]">
                Defina se este perfil é aplicável a todas as empresas ou restrito a uma específica.
              </p>
            </div>

            {/* Seleção de Módulos */}
            <div className="space-y-2 pt-2 border-t border-[#E5E6EC]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-[#1A1B23] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#5B2E8C]" />
                  Módulos Liberados <span className="text-[#C8324A]">*</span>
                </Label>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selecionarTodosModulos}
                    className="text-[#5B2E8C] hover:underline font-medium cursor-pointer"
                  >
                    Marcar todos
                  </button>
                  <span className="text-[#C6C7CF]">|</span>
                  <button
                    type="button"
                    onClick={desmarcarTodosModulos}
                    className="text-[#8A8B95] hover:underline cursor-pointer"
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
                Resumo: {modulosSelecionados.length} módulo(s) liberado(s)
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
                onClick={handleVoltarParaLista}
                className="border-[#DCDDE3] text-[#8A8B95]"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white cursor-pointer">
                {perfilEmEdicao ? "Salvar Alterações" : "Cadastrar Perfil"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
});
