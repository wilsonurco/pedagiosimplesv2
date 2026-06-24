import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Building2, CheckCircle2, X } from "lucide-react";

interface ConcessionariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

const inputClass =
  "w-full rounded-lg border border-[#ECECF1] bg-white px-3 py-2 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/30 focus:border-[#5B2E8C] transition";

const labelClass = "block text-xs font-semibold text-[#4A4B55] mb-1";

export function ConcessionariaModal({ open, onOpenChange }: ConcessionariaModalProps) {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    uf: "",
    mensagem: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviado(true);
  }

  function handleClose(value: boolean) {
    if (!value) {
      setTimeout(() => {
        setEnviado(false);
        setForm({ nome: "", email: "", telefone: "", empresa: "", uf: "", mensagem: "" });
      }, 300);
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden p-0 [&>button]:hidden">
        {/* Header fixo */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b border-[#ECECF1] px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-[#1A1B23] text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#5B2E8C] flex-shrink-0" />
              Seja uma Concessionária Parceira
            </DialogTitle>
            <DialogClose className="flex-shrink-0 rounded-md p-1.5 text-[#8A8B95] hover:bg-[#F4EFFB] hover:text-[#5B2E8C] transition-colors mt-0.5">
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </div>
          {!enviado && (
            <p className="text-sm text-[#8A8B95] mt-1">
              Preencha o formulário abaixo e nossa equipe entrará em contato para apresentar as condições de parceria.
            </p>
          )}
        </DialogHeader>

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
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
                className="mt-2 px-5 py-2 rounded-lg bg-[#5B2E8C] text-white text-sm font-semibold hover:bg-[#4a2272] transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="nome">Nome completo <span className="text-red-500">*</span></label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="email">E-mail <span className="text-red-500">*</span></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="telefone">Telefone <span className="text-red-500">*</span></label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    value={form.telefone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="empresa">Nome da empresa / concessionária <span className="text-red-500">*</span></label>
                  <input
                    id="empresa"
                    name="empresa"
                    type="text"
                    required
                    placeholder="Razão social ou nome fantasia"
                    value={form.empresa}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="uf">Estado (UF) <span className="text-red-500">*</span></label>
                  <select
                    id="uf"
                    name="uf"
                    required
                    value={form.uf}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>UF</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="mensagem">
                  Mensagem <span className="font-normal text-[#C6C7CF]">(opcional)</span>
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={3}
                  placeholder="Conte um pouco sobre sua operação..."
                  value={form.mensagem}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#5B2E8C] text-white text-sm font-semibold hover:bg-[#4a2272] transition-colors mt-2"
              >
                Enviar solicitação
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
