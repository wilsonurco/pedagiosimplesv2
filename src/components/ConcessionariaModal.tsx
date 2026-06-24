import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "./ui/dialog";
import { User, Mail, Phone, Building2, MapPin, MessageCircle, CheckCircle2, X, AlertCircle } from "lucide-react";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const fieldClass =
  "w-full rounded-full border border-[#E2E3EA] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/25 focus:border-[#5B2E8C] transition";

const textareaClass =
  "w-full rounded-2xl border border-[#E2E3EA] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/25 focus:border-[#5B2E8C] transition resize-none";

const labelClass = "block text-sm font-semibold text-[#1A1B23] mb-1.5";

interface ConcessionariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = "idle" | "loading" | "success" | "error";

export function ConcessionariaModal({ open, onOpenChange }: ConcessionariaModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ nome: "", email: "", celular: "", empresa: "", uf: "", mensagem: "" });

  const formValido =
    form.nome.trim() !== "" &&
    form.email.trim() !== "" &&
    form.celular.trim() !== "" &&
    form.empresa.trim() !== "" &&
    form.uf !== "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValido) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/concessionaria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          celular: form.celular,
          empresa: form.empresa,
          estado: form.uf,
          mensagem: form.mensagem,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleClose(value: boolean) {
    if (!value) {
      setTimeout(() => {
        setStatus("idle");
        setForm({ nome: "", email: "", celular: "", empresa: "", uf: "", mensagem: "" });
      }, 300);
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full flex flex-col overflow-hidden p-6 [&>button]:hidden gap-0 bg-white max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl font-bold text-[#5B2E8C] leading-tight">
            Seja uma Concessionária Parceira
          </h2>
          <DialogClose className="flex-shrink-0 rounded-md p-1 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors -mt-0.5 -mr-1">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </div>
        <p className="text-sm text-[#8A8B95] mb-6">
          Deixe seus dados e nossa equipe entrará em contato em até 1 dia útil.
        </p>

        {/* Sucesso */}
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-[#0E8B5A]" />
            <div>
              <p className="text-lg font-bold text-[#1A1B23]">Solicitação enviada!</p>
              <p className="text-sm text-[#8A8B95] mt-1 max-w-xs mx-auto">
                Recebemos seus dados. Nossa equipe entrará em contato em breve.
              </p>
            </div>
            <button
              onClick={() => handleClose(false)}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#5B2E8C] text-white text-sm font-semibold hover:bg-[#4a2272] transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nome */}
            <div>
              <label className={labelClass} htmlFor="nome">Nome completo <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input id="nome" name="nome" type="text" required placeholder="Seu nome completo" value={form.nome} onChange={handleChange} className={fieldClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass} htmlFor="email">E-mail <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input id="email" name="email" type="email" required placeholder="seu@email.com" value={form.email} onChange={handleChange} className={fieldClass} />
              </div>
            </div>

            {/* Celular */}
            <div>
              <label className={labelClass} htmlFor="celular">Celular <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input id="celular" name="celular" type="tel" required placeholder="(11) 99999-9999" value={form.celular} onChange={handleChange} className={fieldClass} />
              </div>
            </div>

            {/* Empresa */}
            <div>
              <label className={labelClass} htmlFor="empresa">Nome da concessionária <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input id="empresa" name="empresa" type="text" required placeholder="Razão social ou nome fantasia" value={form.empresa} onChange={handleChange} className={fieldClass} />
              </div>
            </div>

            {/* UF */}
            <div>
              <label className={labelClass} htmlFor="uf">Estado (UF) <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8] pointer-events-none" />
                <select id="uf" name="uf" required value={form.uf} onChange={handleChange} className={`${fieldClass} appearance-none`}>
                  <option value="" disabled>Selecione o estado</option>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label className={labelClass} htmlFor="mensagem">
                Mensagem <span className="font-normal text-[#AEAFB8]">(opcional)</span>
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-[#AEAFB8]" />
                <textarea id="mensagem" name="mensagem" rows={3} placeholder="Conte-nos como podemos ajudar." value={form.mensagem} onChange={handleChange} className={textareaClass} />
              </div>
            </div>

            {/* Erro */}
            {status === "error" && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Ocorreu um erro ao enviar. Tente novamente.
              </div>
            )}

            {/* Aviso */}
            <p className="text-xs text-[#8A8B95] leading-relaxed">
              Ao enviar, você concorda em ser contatado pela equipe Move Mais sobre soluções de vale-pedágio.
            </p>

            {/* Botões */}
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => handleClose(false)} className="flex-1 py-3 rounded-full border border-[#E2E3EA] text-sm font-semibold text-[#1A1B23] hover:bg-[#F7F5FB] transition-colors">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formValido || status === "loading"}
                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-colors ${
                  formValido && status !== "loading"
                    ? "bg-[#5B2E8C] text-white hover:bg-[#4a2272]"
                    : "bg-[#ECECF1] text-[#AEAFB8] cursor-not-allowed"
                }`}
              >
                {status === "loading" ? "Enviando..." : "Enviar solicitação"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
