import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogClose } from "./ui/dialog";
import { User, Mail, Phone, Building2, MapPin, MessageCircle, CheckCircle2, X, AlertCircle } from "lucide-react";

const RD_FORM_ID = "pedagio-simples-seja-uma-concessionaria-parceira-c6cc9c951391d58a2eea";
const RD_SCRIPT_SRC = "https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const fieldClass =
  "w-full rounded-full border border-[#E2E3EA] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/25 focus:border-[#5B2E8C] transition";

const textareaClass =
  "w-full rounded-2xl border border-[#E2E3EA] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1B23] placeholder:text-[#C6C7CF] focus:outline-none focus:ring-2 focus:ring-[#5B2E8C]/25 focus:border-[#5B2E8C] transition resize-none";

const labelClass = "block text-sm font-semibold text-[#1A1B23] mb-1.5";

// Força o valor num input/select/textarea de forma que o React interno do RD aceite
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = Object.getPrototypeOf(el);
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

interface ConcessionariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = "idle" | "loading" | "success" | "error";

export function ConcessionariaModal({ open, onOpenChange }: ConcessionariaModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ nome: "", email: "", celular: "", empresa: "", uf: "", mensagem: "" });
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formValido =
    form.nome.trim() !== "" &&
    form.email.trim() !== "" &&
    form.celular.trim() !== "" &&
    form.empresa.trim() !== "" &&
    form.uf !== "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Carrega o script e inicializa o formulário oculto do RD Station
  useEffect(() => {
    if (!open) return;

    // Container oculto fora da tela
    if (!hiddenContainerRef.current) {
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
      container.innerHTML = `<div role="main" id="${RD_FORM_ID}"></div>`;
      document.body.appendChild(container);
      hiddenContainerRef.current = container;
    } else {
      // Recria o div alvo para permitir re-inicialização
      const target = hiddenContainerRef.current.querySelector(`#${RD_FORM_ID}`);
      if (target) target.innerHTML = "";
    }

    function initForm() {
      if ((window as any).RDStationForms) {
        new (window as any).RDStationForms(RD_FORM_ID, "UA-37380722-2").createForm();
      }
    }

    if ((window as any).RDStationForms) {
      initForm();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RD_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", initForm, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RD_SCRIPT_SRC;
    script.addEventListener("load", initForm, { once: true });
    document.head.appendChild(script);
  }, [open]);

  // Limpa observer e timeout ao fechar
  function cleanup() {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formValido) return;
    setStatus("loading");
    cleanup();

    const rdTarget = document.getElementById(RD_FORM_ID);
    if (!rdTarget) {
      setStatus("error");
      return;
    }

    // Mapeamento dos campos do formulário RD Station → nossos valores
    const fieldValues: Record<string, string> = {
      nome: form.nome,
      email: form.email,
      celular: form.celular,
      telefone: form.celular,     // RD Station pode usar "telefone"
      empresa: form.empresa,
      estado: form.uf,
      mensagem: form.mensagem,
    };

    // Preenche todos inputs/selects/textareas do form oculto
    const elements = rdTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, select, textarea"
    );
    elements.forEach((el) => {
      const name = el.getAttribute("name") || el.getAttribute("id") || "";
      const key = Object.keys(fieldValues).find((k) => name.toLowerCase().includes(k));
      if (key) setNativeValue(el, fieldValues[key]);
    });

    // Observa mudanças no container do RD para detectar sucesso
    observerRef.current = new MutationObserver(() => {
      const rdForm = document.getElementById(RD_FORM_ID);
      if (!rdForm) return;
      const html = rdForm.innerHTML;
      // RD Station geralmente esconde o form e exibe mensagem de sucesso
      const visibleForm = rdForm.querySelector("form");
      const hiddenForm = visibleForm && (window.getComputedStyle(visibleForm).display === "none" || visibleForm.hidden);
      if (hiddenForm || html.includes("sucesso") || html.includes("success") || html.includes("obrigado") || html.includes("thank")) {
        cleanup();
        setStatus("success");
      }
    });
    observerRef.current.observe(rdTarget, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });

    // Clica no botão de submit do formulário oculto
    const submitBtn = rdTarget.querySelector<HTMLButtonElement | HTMLInputElement>(
      'button[type="submit"], input[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.click();
    } else {
      // Se o form ainda não carregou, aguarda e tenta novamente
      await new Promise(r => setTimeout(r, 2000));
      const btn = rdTarget.querySelector<HTMLButtonElement>('button[type="submit"], input[type="submit"]');
      if (btn) btn.click(); else { cleanup(); setStatus("error"); return; }
    }

    // Timeout de segurança: 12s
    timeoutRef.current = setTimeout(() => {
      cleanup();
      setStatus((s) => (s === "loading" ? "error" : s));
    }, 12000);
  }

  function handleClose(value: boolean) {
    if (!value) {
      cleanup();
      setTimeout(() => {
        setStatus("idle");
        setForm({ nome: "", email: "", celular: "", empresa: "", uf: "", mensagem: "" });
      }, 300);
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full flex flex-col overflow-hidden p-0 [&>button]:hidden gap-0 bg-white max-h-[90vh]">

        {/* Header fixo */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#E2E3EA]">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-2xl font-bold text-[#5B2E8C] leading-tight">
              Seja uma Concessionária Parceira
            </h2>
            <DialogClose className="flex-shrink-0 rounded-md p-1 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors -mt-0.5 -mr-1">
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </div>
          <p className="text-sm text-[#8A8B95]">
            Deixe seus dados e nossa equipe entrará em contato em até 1 dia útil.
          </p>
        </div>

        {/* Conteúdo rolável */}
        <div className="overflow-y-auto flex-1 px-6 py-6">

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

            {/* Aviso LGPD */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
