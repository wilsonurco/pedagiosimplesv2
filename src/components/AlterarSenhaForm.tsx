import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Lock, CheckCircle2, Circle, AlertCircle, ShieldCheck } from "lucide-react";
import { validarCriteriosSenha } from "../types/usuario";
import { toast } from "sonner";

interface AlterarSenhaFormProps {
  senhaAtualCadastrada?: string;
  onSuccess: (novaSenha: string) => void;
  onCancelar?: () => void;
  isPrimeiroAcesso?: boolean;
}

export function AlterarSenhaForm({
  senhaAtualCadastrada = "123@Mudar",
  onSuccess,
  onCancelar,
  isPrimeiroAcesso = false,
}: AlterarSenhaFormProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const [touchedNovaSenha, setTouchedNovaSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const criterios = validarCriteriosSenha(novaSenha);
  const todosCriteriosAtendidos = criterios.every((c) => c.atendido);

  const senhasCoincidem = novaSenha.length > 0 && confirmarSenha === novaSenha;
  const senhasDivergentes = confirmarSenha.length > 0 && confirmarSenha !== novaSenha;

  const eIgualSenhaAtual = novaSenha.length > 0 && novaSenha === senhaAtual;
  const eSenhaTemporaria = novaSenha === "123@Mudar";

  const senhaAtualCorreta =
    senhaAtual.length > 0 &&
    (senhaAtual === senhaAtualCadastrada || senhaAtual === "123@Mudar" || true); // Validação flexível no mock

  const formValido =
    senhaAtual.length > 0 &&
    todosCriteriosAtendidos &&
    senhasCoincidem &&
    !eIgualSenhaAtual &&
    !eSenhaTemporaria;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Senha atualizada com sucesso.");
      onSuccess(novaSenha);
    }, 1000);
  };

  return (
    <div className="bg-white border border-[#DCDDE3] rounded-xl p-6">
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#DCDDE3]">
        <div className="w-10 h-10 bg-[#F4EFFB] rounded-full flex items-center justify-center text-[#5B2E8C]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1A1B23]">Box: Alterar Senha</h3>
          <p className="text-xs text-[#8A8B95]">
            {isPrimeiroAcesso
              ? "Você está utilizando uma senha temporária. Por motivos de segurança, defina uma nova senha definitiva."
              : "Atualize sua senha de acesso periodicamente para manter sua conta protegida."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Senha Atual */}
        <div className="space-y-1.5">
          <Label htmlFor="senhaAtual" className="text-xs font-semibold text-[#1A1B23]">
            Senha Atual <span className="text-[#C8324A]">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
            <Input
              id="senhaAtual"
              type={showSenhaAtual ? "text" : "password"}
              placeholder="Digite sua senha atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="pl-10 pr-10 border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-1 focus:ring-[#5B2E8C] rounded-lg text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowSenhaAtual(!showSenhaAtual)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C]"
              title={showSenhaAtual ? "Ocultar senha" : "Mostrar senha"}
            >
              {showSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Nova Senha */}
        <div className="space-y-1.5">
          <Label htmlFor="novaSenha" className="text-xs font-semibold text-[#1A1B23]">
            Nova Senha <span className="text-[#C8324A]">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
            <Input
              id="novaSenha"
              type={showNovaSenha ? "text" : "password"}
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(e) => {
                setNovaSenha(e.target.value);
                setTouchedNovaSenha(true);
              }}
              className={`pl-10 pr-10 border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-1 focus:ring-[#5B2E8C] rounded-lg text-sm ${
                eIgualSenhaAtual || eSenhaTemporaria ? "border-[#C8324A]" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C]"
              title={showNovaSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Avisos de reutilização */}
          {eIgualSenhaAtual && (
            <p className="text-xs text-[#C8324A] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> A nova senha deve ser diferente da senha atual.
            </p>
          )}
          {eSenhaTemporaria && (
            <p className="text-xs text-[#C8324A] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> Não é permitido reutilizar a senha temporária.
            </p>
          )}

          {/* Indicadores visuais dinâmicos de segurança */}
          <div className="mt-3 bg-[#F7F5FB] p-3.5 rounded-lg border border-[#E5E6EC]">
            <p className="text-xs font-semibold text-[#5B2E8C] mb-2 uppercase tracking-wider">
              Critérios de Segurança da Senha
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {criterios.map((crit) => (
                <div key={crit.id} className="flex items-center gap-2 text-xs">
                  {crit.atendido ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0E8B5A] flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#8A8B95] flex-shrink-0" />
                  )}
                  <span
                    className={
                      crit.atendido
                        ? "text-[#0E8B5A] font-medium"
                        : touchedNovaSenha && novaSenha.length > 0
                        ? "text-[#8A8B95]"
                        : "text-[#8A8B95]"
                    }
                  >
                    {crit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmar Nova Senha */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmarSenha" className="text-xs font-semibold text-[#1A1B23]">
            Confirmar Nova Senha <span className="text-[#C8324A]">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8B95]" />
            <Input
              id="confirmarSenha"
              type={showConfirmarSenha ? "text" : "password"}
              placeholder="Confirme sua nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`pl-10 pr-10 border-[#DCDDE3] focus:border-[#5B2E8C] focus:ring-1 focus:ring-[#5B2E8C] rounded-lg text-sm ${
                senhasDivergentes ? "border-[#C8324A] bg-red-50/30" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C]"
              title={showConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {senhasDivergentes && (
            <p className="text-xs text-[#C8324A] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> A confirmação de senha deve ser idêntica à nova senha.
            </p>
          )}
          {senhasCoincidem && (
            <p className="text-xs text-[#0E8B5A] flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Senhas conferem perfeitamente.
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#DCDDE3]">
          {onCancelar && !isPrimeiroAcesso && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar}
              className="w-full sm:w-auto border-[#DCDDE3] text-[#8A8B95] hover:text-[#1A1B23]"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={!formValido || loading}
            className={`w-full sm:w-auto font-medium transition-all px-6 ${
              formValido && !loading
                ? "bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white"
                : "bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Atualizando...
              </>
            ) : (
              "Atualizar Senha"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
