import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { AlterarSenhaForm } from "./AlterarSenhaForm";
import { Badge } from "./ui/badge";
import { User, Shield, Building2, Mail, Lock } from "lucide-react";
import { Usuario } from "../types/usuario";

interface MeuPerfilModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioLogado: Partial<Usuario>;
  onSenhaAtualizada: (novaSenha: string) => void;
  isPrimeiroAcesso?: boolean;
}

export function MeuPerfilModal({
  open,
  onOpenChange,
  usuarioLogado,
  onSenhaAtualizada,
  isPrimeiroAcesso = false,
}: MeuPerfilModalProps) {
  const nome = usuarioLogado.nome || "Giuliana Santiago";
  const email = usuarioLogado.email || "giuliana.santiago@pedagiosimples.com.br";
  const empresa = usuarioLogado.empresa || "Concessionária Via Expressa S/A";
  const perfil = usuarioLogado.perfil || "Administrador";

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Impedir fechamento no primeiro acesso obrigatório
        if (isPrimeiroAcesso && !newOpen) return;
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#F7F5FB] border-[#DCDDE3]">
        {/* Header Fixo */}
        <DialogHeader className="p-6 pb-4 border-b border-[#DCDDE3] bg-white shrink-0 sticky top-0 z-10 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5B2E8C] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {nome.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-xl text-[#1A1B23]">
                {isPrimeiroAcesso ? "Primeiro Acesso — Troca de Senha Obrigatória" : "Meu Perfil"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8A8B95]">
                {isPrimeiroAcesso
                  ? "Sua conta foi criada com uma senha temporária. É necessário definir sua senha definitiva."
                  : "Gerencie suas informações cadastrais e credenciais de acesso."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo com Rolagem */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Card de Informações do Usuário */}
          <div className="bg-white p-4 rounded-xl border border-[#DCDDE3] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E6EC] pb-3">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#5B2E8C]" />
                <span className="font-semibold text-sm text-[#1A1B23]">{nome}</span>
              </div>
              <Badge className="bg-[#5B2E8C]/10 text-[#5B2E8C] border-[#5B2E8C]/20 hover:bg-[#5B2E8C]/15 font-semibold text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {perfil}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#8A8B95]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#5B2E8C]" />
                <span>
                  E-mail: <strong className="text-[#1A1B23] font-medium">{email}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#5B2E8C]" />
                <span>
                  Empresa: <strong className="text-[#1A1B23] font-medium">{empresa}</strong>
                </span>
              </div>
            </div>

            {isPrimeiroAcesso && (
              <div className="bg-[#FBE8C5] border border-[#F4C97A] p-2.5 rounded-lg flex items-center gap-2 text-xs text-[#9A5B00]">
                <Lock className="w-4 h-4 flex-shrink-0 text-[#C77700]" />
                <span>
                  <strong>Atenção:</strong> Você precisa alterar a senha temporária para liberar o acesso ao sistema.
                </span>
              </div>
            )}
          </div>

          {/* Formulário Box Alterar Senha */}
          <AlterarSenhaForm
            senhaAtualCadastrada="123@Mudar"
            onSuccess={(novaSenha) => {
              onSenhaAtualizada(novaSenha);
              onOpenChange(false);
            }}
            onCancelar={isPrimeiroAcesso ? undefined : () => onOpenChange(false)}
            isPrimeiroAcesso={isPrimeiroAcesso}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
