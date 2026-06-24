import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "./ui/dialog";
import { User, Mail, Phone, MessageCircle, CheckCircle2, X } from "lucide-react";

interface ConcessionariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fieldClass =
  "w-full rounded-full border border-[#E2E3EA] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/25 focus:border-[#5B2E8C] transition";

const textareaClass =
  "w-full rounded-2xl border border-[#E2E3EA] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/25 focus:border-[#5B2E8C] transition resize-none";

const labelClass = "block text-sm font-semibold text-[#1A1B23] mb-1.5";

export function ConcessionariaModal({ open, onOpenChange }: ConcessionariaModalProps) {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const formValido = form.nome.trim() !== "" && form.email.trim() !== "" && form.telefone.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviado(true);
  }

  function handleClose(value: boolean) {
    if (!value) {
      setTimeout(() => {
        setEnviado(false);
        setForm({ nome: "", email: "", telefone: "", mensagem: "" });
      }, 300);
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full flex flex-col overflow-hidden p-6 [&>button]:hidden gap-0">

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl font-bold text-[#5B2E8C] leading-tight">
            Falar com um consultor
          </h2>
          <DialogClose className="flex-shrink-0 rounded-md p-1 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors -mt-0.5 -mr-1">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </div>
        <p className="text-sm text-[#8A8B95] mb-6">
          Deixe seus dados e nossa equipe entrará em contato em até 1 dia útil.
        </p>

        {/* Conteúdo */}
        {enviado ? (
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
              <label className={labelClass} htmlFor="nome">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  placeholder="Logística Transportes Ltda"
                  value={form.nome}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className={labelClass} htmlFor="email">
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="teste@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className={labelClass} htmlFor="telefone">
                Telefone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEAFB8]" />
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label className={labelClass} htmlFor="mensagem">
                Mensagem <span className="font-normal text-[#AEAFB8]">(opcional)</span>
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-[#AEAFB8]" />
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={3}
                  placeholder="Conte-nos como podemos ajudar."
                  value={form.mensagem}
                  onChange={handleChange}
                  className={textareaClass}
                />
              </div>
            </div>

            {/* Aviso */}
            <p className="text-xs text-[#8A8B95] leading-relaxed">
              Ao enviar, você concorda em ser contatado pela equipe Move Mais sobre soluções de vale-pedágio.
            </p>

            {/* Botões */}
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex-1 py-3 rounded-full border border-[#E2E3EA] text-sm font-semibold text-[#1A1B23] hover:bg-[#F7F5FB] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formValido}
                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-colors ${
                  formValido
                    ? "bg-[#5B2E8C] text-white hover:bg-[#4a2272]"
                    : "bg-[#ECECF1] text-[#AEAFB8] cursor-not-allowed"
                }`}
              >
                Enviar solicitação
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
