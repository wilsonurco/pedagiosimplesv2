import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "./ui/alert-dialog";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Usuario } from "../types/usuario";

interface ModalExcluirUsuarioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioExclusao: Usuario | null;
  usuarioLogadoId?: string;
  totalAdministradores?: number;
  onConfirmarExclusao: (usuarioId: string) => void;
}

export function ModalExcluirUsuario({
  open,
  onOpenChange,
  usuarioExclusao,
  usuarioLogadoId,
  totalAdministradores = 1,
  onConfirmarExclusao,
}: ModalExcluirUsuarioProps) {
  if (!usuarioExclusao) return null;

  const isProprioUsuario = usuarioLogadoId && usuarioExclusao.id === usuarioLogadoId;
  const isUltimoAdmin =
    usuarioExclusao.perfil === "Administrador" && totalAdministradores <= 1;

  const impedido = isProprioUsuario || isUltimoAdmin;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white border border-[#DCDDE3] rounded-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#C8324A]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-[#1A1B23]">
              Confirmar Exclusão de Usuário
            </AlertDialogTitle>
          </div>

          {impedido ? (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2.5 text-xs text-[#C8324A] my-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Ação Não Permitida:</strong>
                <p className="mt-0.5 leading-relaxed">
                  {isProprioUsuario
                    ? "Você não pode excluir seu próprio usuário autenticado."
                    : "Não é possível excluir o único usuário com perfil Administrador da concessionária."}
                </p>
              </div>
            </div>
          ) : (
            <AlertDialogDescription className="text-sm text-[#8A8B95] space-y-2">
              <p>
                Tem certeza que deseja excluir o usuário{" "}
                <strong className="text-[#1A1B23]">{usuarioExclusao.nome}</strong> (
                {usuarioExclusao.email})?
              </p>
              <div className="bg-[#F7F5FB] p-2.5 rounded-lg border border-[#E5E6EC] text-xs text-[#1A1B23]">
                <p className="font-semibold text-[#5B2E8C] mb-0.5">Exclusão Lógica e Auditoria:</p>
                <p className="text-[#8A8B95] text-[11px] leading-tight">
                  O usuário será removido imediatamente da listagem do portal e terá seu acesso revogado. Os registros históricos serão preservados no banco para fins de auditoria e LGPD.
                </p>
              </div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={() => onOpenChange(false)} className="border-[#DCDDE3] text-[#8A8B95]">
            Cancelar
          </AlertDialogCancel>
          {!impedido && (
            <AlertDialogAction
              onClick={() => {
                onConfirmarExclusao(usuarioExclusao.id);
                onOpenChange(false);
              }}
              className="bg-[#C8324A] hover:bg-red-700 text-white font-medium"
            >
              Excluir Usuário
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
