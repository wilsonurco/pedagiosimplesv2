import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Shield, Plus, Pencil, Trash2, CheckCircle2, Lock } from "lucide-react";
import { PerfilModulo } from "../types/usuario";
import { ModalPerfilModuloForm } from "./ModalPerfilModuloForm";
import { toast } from "sonner";

interface ModalGestaoPerfisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfis: PerfilModulo[];
  onAtualizarPerfis: (perfis: PerfilModulo[]) => void;
}

export function ModalGestaoPerfis({
  open,
  onOpenChange,
  perfis,
  onAtualizarPerfis,
}: ModalGestaoPerfisProps) {
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [perfilEmEdicao, setPerfilEmEdicao] = useState<PerfilModulo | null>(null);

  const handleSalvarPerfil = (novoOuEditado: PerfilModulo) => {
    const existe = perfis.some((p) => p.id === novoOuEditado.id);
    let atualizados: PerfilModulo[];
    if (existe) {
      atualizados = perfis.map((p) => (p.id === novoOuEditado.id ? novoOuEditado : p));
      toast.success(`Perfil ${novoOuEditado.nome} atualizado com sucesso.`);
    } else {
      atualizados = [...perfis, novoOuEditado];
      toast.success(`Perfil ${novoOuEditado.nome} cadastrado com sucesso.`);
    }
    onAtualizarPerfis(atualizados);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl bg-white border border-[#DCDDE3] rounded-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {/* Header Fixo */}
          <DialogHeader className="p-6 pb-4 border-b border-[#DCDDE3] bg-white shrink-0 sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-8">
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
                onClick={() => {
                  setPerfilEmEdicao(null);
                  setModalFormOpen(true);
                }}
                className="bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Perfil
              </Button>
            </div>
          </DialogHeader>

          {/* Lista com Rolagem */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {perfis.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-[#DCDDE3] bg-white hover:border-[#5B2E8C]/40 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
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
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPerfilEmEdicao(p);
                        setModalFormOpen(true);
                      }}
                      title="Editar perfil e permissões"
                      className="h-8 w-8 p-0 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {!p.isSistema && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirPerfil(p)}
                        title="Excluir perfil"
                        className="h-8 w-8 p-0 text-[#8A8B95] hover:text-[#C8324A] hover:bg-red-50"
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
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ModalPerfilModuloForm
        open={modalFormOpen}
        onOpenChange={setModalFormOpen}
        perfilEdicao={perfilEmEdicao}
        onSalvarPerfil={handleSalvarPerfil}
      />
    </>
  );
}
