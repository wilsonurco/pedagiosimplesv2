import { useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "./ui/dialog";
import { X } from "lucide-react";

const RD_FORM_ID = "pedagio-simples-seja-uma-concessionaria-parceira-c6cc9c951391d58a2eea";
const RD_SCRIPT_SRC = "https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js";

interface ConcessionariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConcessionariaModal({ open, onOpenChange }: ConcessionariaModalProps) {
  useEffect(() => {
    if (!open) return;

    // Limpa o conteúdo anterior para re-inicialização limpa
    const container = document.getElementById(RD_FORM_ID);
    if (container) container.innerHTML = "";

    function initForm() {
      if ((window as any).RDStationForms) {
        new (window as any).RDStationForms(RD_FORM_ID, "UA-37380722-2").createForm();
      }
    }

    // Script já carregado
    if ((window as any).RDStationForms) {
      initForm();
      return;
    }

    // Script já injetado mas ainda carregando
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RD_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", initForm, { once: true });
      return;
    }

    // Injeta o script pela primeira vez
    const script = document.createElement("script");
    script.src = RD_SCRIPT_SRC;
    script.type = "text/javascript";
    script.addEventListener("load", initForm, { once: true });
    document.head.appendChild(script);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full flex flex-col overflow-hidden p-6 [&>button]:hidden gap-0 bg-white">

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

        {/* RD Station Form */}
        <div role="main" id={RD_FORM_ID} />

      </DialogContent>
    </Dialog>
  );
}
