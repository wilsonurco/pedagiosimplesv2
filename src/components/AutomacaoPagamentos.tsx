import { useState } from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import {
  Zap,
  DollarSign,
  Building2,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Smartphone,
  Shield,
  Info,
  Car,
} from "lucide-react";

type TipoRegra = 'valor' | 'concessionaria' | 'prazo';
type FormaPagamento = 'pix' | 'cartao';

interface Regra {
  id: string;
  tipo: TipoRegra;
  ativo: boolean;
  placa: string;
  formaPagamento: FormaPagamento;
  valorMaximo?: number;
  concessionaria?: string;
  diasAntesVencimento?: number;
}

const CONCESSIONARIAS = ['CCR AutoBan', 'Ecovias', 'Arteris', 'CCR ViaOeste', 'EcoRodovias'];
const PLACAS = ['todas', 'MOV-1234'];

const descreverRegra = (r: Regra): string => {
  if (r.tipo === 'valor') return `Passagens até R$ ${(r.valorMaximo ?? 0).toFixed(2).replace('.', ',')}`;
  if (r.tipo === 'concessionaria') return `Passagens da ${r.concessionaria}`;
  return `Faltando ${r.diasAntesVencimento} dia${(r.diasAntesVencimento ?? 0) !== 1 ? 's' : ''} para vencer`;
};

const iconeTipo = (tipo: TipoRegra, ativo: boolean) => {
  const cls = `h-4 w-4 ${ativo ? 'text-white' : 'text-[#8A8B95]'}`;
  if (tipo === 'valor') return <DollarSign className={cls} />;
  if (tipo === 'concessionaria') return <Building2 className={cls} />;
  return <Clock className={cls} />;
};

const bgIcone = (tipo: TipoRegra, ativo: boolean) => {
  if (!ativo) return 'bg-[#F4EFFB]';
  if (tipo === 'valor') return 'bg-[#5B2E8C]';
  if (tipo === 'concessionaria') return 'bg-[#0E8B5A]';
  return 'bg-[#C77700]';
};

const REGRAS_INICIAIS: Regra[] = [
  {
    id: 'r-1',
    tipo: 'valor',
    ativo: false,
    placa: 'todas',
    formaPagamento: 'pix',
    valorMaximo: 10,
  },
  {
    id: 'r-2',
    tipo: 'concessionaria',
    ativo: false,
    placa: 'MOV-1234',
    formaPagamento: 'pix',
    concessionaria: 'Ecovias',
  },
];

const FORMA_VAZIA: { tipo: TipoRegra; placa: string; formaPagamento: FormaPagamento; valorMaximo: string; concessionaria: string; diasAntesVencimento: string } = {
  tipo: 'valor',
  placa: 'todas',
  formaPagamento: 'pix',
  valorMaximo: '',
  concessionaria: CONCESSIONARIAS[0],
  diasAntesVencimento: '3',
};

export function AutomacaoPagamentos() {
  const [automacaoAtiva, setAutomacaoAtiva] = useState(false);
  const [regras, setRegras] = useState<Regra[]>(REGRAS_INICIAIS);
  const [limiteSeguranca, setLimiteSeguranca] = useState('100');
  const [formaPadrao, setFormaPadrao] = useState<FormaPagamento>('pix');
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ ...FORMA_VAZIA });
  const [erroForm, setErroForm] = useState('');
  const [saved, setSaved] = useState(false);

  const regrasAtivas = regras.filter(r => r.ativo).length;

  const toggleRegra = (id: string) => {
    setRegras(prev => prev.map(r => r.id === id ? { ...r, ativo: !r.ativo } : r));
    setSaved(false);
  };

  const removerRegra = (id: string) => {
    setRegras(prev => prev.filter(r => r.id !== id));
    setSaved(false);
  };

  const abrirModal = () => {
    setForm({ ...FORMA_VAZIA });
    setErroForm('');
    setModalAberto(true);
  };

  const handleSalvarRegra = () => {
    if (form.tipo === 'valor') {
      const v = parseFloat(form.valorMaximo.replace(',', '.'));
      if (!form.valorMaximo || isNaN(v) || v <= 0) {
        setErroForm('Informe um valor máximo válido.');
        return;
      }
      setRegras(prev => [...prev, {
        id: `r-${Date.now()}`,
        tipo: 'valor',
        ativo: false,
        placa: form.placa,
        formaPagamento: form.formaPagamento,
        valorMaximo: v,
      }]);
    } else if (form.tipo === 'concessionaria') {
      setRegras(prev => [...prev, {
        id: `r-${Date.now()}`,
        tipo: 'concessionaria',
        ativo: false,
        placa: form.placa,
        formaPagamento: form.formaPagamento,
        concessionaria: form.concessionaria,
      }]);
    } else {
      const dias = parseInt(form.diasAntesVencimento);
      if (!dias || dias < 1) {
        setErroForm('Informe um número de dias válido.');
        return;
      }
      setRegras(prev => [...prev, {
        id: `r-${Date.now()}`,
        tipo: 'prazo',
        ativo: false,
        placa: form.placa,
        formaPagamento: form.formaPagamento,
        diasAntesVencimento: dias,
      }]);
    }
    setModalAberto(false);
    setSaved(false);
  };

  return (
    <div className="space-y-5">

      {/* Master toggle */}
      <div className={`rounded-xl border-2 p-4 transition-colors ${
        automacaoAtiva ? 'bg-[#F4EFFB] border-[#8B5FFF]' : 'bg-white border-[#DCDDE3]'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              automacaoAtiva ? 'bg-[#5B2E8C]' : 'bg-[#F4EFFB]'
            }`}>
              <Zap className={`h-5 w-5 ${automacaoAtiva ? 'text-white' : 'text-[#8A8B95]'}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${automacaoAtiva ? 'text-[#5B2E8C]' : 'text-[#1A1B23]'}`}>
                Automação de pagamentos
              </p>
              <p className="text-xs text-[#8A8B95] mt-0.5 leading-relaxed">
                {automacaoAtiva
                  ? `${regrasAtivas} regra${regrasAtivas !== 1 ? 's' : ''} ativa${regrasAtivas !== 1 ? 's' : ''} — pagamentos processados automaticamente`
                  : 'Ative para pagar passagens automaticamente conforme suas regras'}
              </p>
            </div>
          </div>
          <Switch
            checked={automacaoAtiva}
            onCheckedChange={v => { setAutomacaoAtiva(v); setSaved(false); }}
            className="flex-shrink-0 mt-0.5"
          />
        </div>
      </div>

      {automacaoAtiva && (
        <>
          {/* Safety settings */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#8A8B95] uppercase tracking-wide">Configurações de segurança</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Monthly limit */}
              <div className="bg-white border border-[#DCDDE3] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-[#5B2E8C]" />
                  <Label className="text-xs font-medium text-[#1A1B23]">Limite mensal</Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#8A8B95] flex-shrink-0">R$</span>
                  <input
                    type="number"
                    value={limiteSeguranca}
                    onChange={e => { setLimiteSeguranca(e.target.value); setSaved(false); }}
                    min="1"
                    max="9999"
                    className="flex-1 h-8 px-2 bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg text-sm text-[#1A1B23] font-mono focus:outline-none focus:border-[#8B5FFF]"
                  />
                  <span className="text-xs text-[#8A8B95] flex-shrink-0">/mês</span>
                </div>
                <p className="text-[10px] text-[#8A8B95] mt-1.5">Máximo autopago em qualquer mês</p>
              </div>

              {/* Default payment method */}
              <div className="bg-white border border-[#DCDDE3] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-3.5 w-3.5 text-[#5B2E8C]" />
                  <Label className="text-xs font-medium text-[#1A1B23]">Forma de pagamento padrão</Label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFormaPadrao('pix'); setSaved(false); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border-2 transition-colors ${
                      formaPadrao === 'pix'
                        ? 'bg-[#5B2E8C] border-[#5B2E8C] text-white'
                        : 'bg-white border-[#DCDDE3] text-[#8A8B95] hover:border-[#8B5FFF]'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    PIX
                  </button>
                  <button
                    onClick={() => { setFormaPadrao('cartao'); setSaved(false); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border-2 transition-colors ${
                      formaPadrao === 'cartao'
                        ? 'bg-[#5B2E8C] border-[#5B2E8C] text-white'
                        : 'bg-white border-[#DCDDE3] text-[#8A8B95] hover:border-[#8B5FFF]'
                    }`}
                  >
                    <CreditCard className="h-3 w-3" />
                    Cartão
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#8A8B95] uppercase tracking-wide">Regras de pagamento</p>
              <Button
                onClick={abrirModal}
                size="sm"
                className="h-7 px-2.5 text-xs bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
              >
                <Plus className="h-3 w-3 mr-1" />
                Nova regra
              </Button>
            </div>

            {regras.length > 0 ? (
              <div className="space-y-2">
                {regras.map(r => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                      r.ativo ? 'bg-white border-[#DCDDE3]' : 'bg-[#F7F5FB] border-[#DCDDE3]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bgIcone(r.tipo, r.ativo)}`}>
                      {iconeTipo(r.tipo, r.ativo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight ${r.ativo ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>
                        {descreverRegra(r)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#8A8B95] flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {r.placa === 'todas' ? 'Todos os veículos' : r.placa}
                        </span>
                        <span className="text-xs text-[#8A8B95] flex items-center gap-1">
                          {r.formaPagamento === 'pix' ? <Smartphone className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                          {r.formaPagamento === 'pix' ? 'PIX' : 'Cartão'}
                        </span>
                        {!r.ativo && (
                          <Badge className="text-[9px] px-1 py-0 h-3.5 bg-[#F7F5FB] text-[#8A8B95] border border-[#DCDDE3] leading-none">
                            Inativa
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={r.ativo}
                        onCheckedChange={() => toggleRegra(r.id)}
                      />
                      <button
                        onClick={() => removerRegra(r.id)}
                        className="w-7 h-7 flex items-center justify-center text-[#8A8B95] hover:text-[#C8324A] hover:bg-[#F8D7DD] rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#F7F5FB] border border-dashed border-[#C9AEEA] rounded-xl p-5 text-center">
                <p className="text-sm text-[#8A8B95]">Nenhuma regra criada ainda</p>
                <p className="text-xs text-[#8A8B95] mt-0.5">Crie sua primeira regra de pagamento automático</p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-[#FBE8C5] border border-[#F4C97A] rounded-xl p-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-[#9A5B00] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#9A5B00] leading-relaxed">
                Regras ativas processam pagamentos automaticamente usando sua forma de pagamento padrão.
                Você receberá um alerta após cada pagamento automático realizado.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setSaved(true)}
          className={`h-9 px-4 text-sm transition-colors ${
            saved
              ? 'bg-[#0E8B5A] hover:bg-[#0A6B45] text-white'
              : 'bg-[#8B5FFF] hover:bg-[#7142B8] text-white'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Salvo
            </>
          ) : (
            'Salvar configurações'
          )}
        </Button>
        {!saved && <span className="text-xs text-[#8A8B95]">Alterações não salvas</span>}
      </div>

      {/* New rule modal */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#5B2E8C]">Nova regra de pagamento</DialogTitle>
            <DialogDescription className="text-[#8A8B95]">
              Defina quando os pagamentos devem ser processados automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">

            {/* Rule type */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#8A8B95] uppercase tracking-wide">Tipo de regra</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'valor', label: 'Por valor', icon: DollarSign },
                  { id: 'concessionaria', label: 'Por concessionária', icon: Building2 },
                  { id: 'prazo', label: 'Por prazo', icon: Clock },
                ] as { id: TipoRegra; label: string; icon: React.ElementType }[]).map(t => {
                  const Icon = t.icon;
                  const sel = form.tipo === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setForm(prev => ({ ...prev, tipo: t.id })); setErroForm(''); }}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-center transition-colors ${
                        sel ? 'bg-[#F4EFFB] border-[#8B5FFF]' : 'bg-white border-[#DCDDE3] hover:border-[#C9AEEA]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${sel ? 'text-[#5B2E8C]' : 'text-[#8A8B95]'}`} />
                      <span className={`text-[10px] font-medium leading-tight ${sel ? 'text-[#5B2E8C]' : 'text-[#8A8B95]'}`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Type-specific fields */}
            {form.tipo === 'valor' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1A1B23]">Valor máximo por passagem</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#8A8B95] flex-shrink-0">R$</span>
                  <input
                    type="number"
                    placeholder="10,00"
                    value={form.valorMaximo}
                    onChange={e => { setForm(prev => ({ ...prev, valorMaximo: e.target.value })); setErroForm(''); }}
                    className="flex-1 h-9 px-3 bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg text-sm font-mono text-[#1A1B23] focus:outline-none focus:border-[#8B5FFF]"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-[#8A8B95]">Pagar automaticamente quando a passagem custar até esse valor</p>
              </div>
            )}

            {form.tipo === 'concessionaria' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1A1B23]">Concessionária</Label>
                <Select
                  value={form.concessionaria}
                  onValueChange={v => setForm(prev => ({ ...prev, concessionaria: v }))}
                >
                  <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCESSIONARIAS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#8A8B95]">Pagar automaticamente todas as passagens desta concessionária</p>
              </div>
            )}

            {form.tipo === 'prazo' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1A1B23]">Acionar quando faltarem</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={form.diasAntesVencimento}
                    onValueChange={v => setForm(prev => ({ ...prev, diasAntesVencimento: v }))}
                  >
                    <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB] w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-[#8A8B95]">para o vencimento</span>
                </div>
                <p className="text-xs text-[#8A8B95]">Pagar automaticamente passagens prestes a virar multa de evasão</p>
              </div>
            )}

            {/* Plate filter */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1A1B23]">Aplicar para</Label>
              <Select
                value={form.placa}
                onValueChange={v => setForm(prev => ({ ...prev, placa: v }))}
              >
                <SelectTrigger className="h-9 text-sm border-[#DCDDE3] bg-[#F7F5FB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos os veículos</SelectItem>
                  {PLACAS.filter(p => p !== 'todas').map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment method */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1A1B23]">Forma de pagamento</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm(prev => ({ ...prev, formaPagamento: 'pix' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium border-2 transition-colors ${
                    form.formaPagamento === 'pix'
                      ? 'bg-[#5B2E8C] border-[#5B2E8C] text-white'
                      : 'bg-white border-[#DCDDE3] text-[#8A8B95] hover:border-[#8B5FFF]'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  PIX
                </button>
                <button
                  onClick={() => setForm(prev => ({ ...prev, formaPagamento: 'cartao' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium border-2 transition-colors ${
                    form.formaPagamento === 'cartao'
                      ? 'bg-[#5B2E8C] border-[#5B2E8C] text-white'
                      : 'bg-white border-[#DCDDE3] text-[#8A8B95] hover:border-[#8B5FFF]'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Cartão
                </button>
              </div>
            </div>

            {erroForm && (
              <p className="text-xs text-[#C8324A] flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {erroForm}
              </p>
            )}

            {/* Preview */}
            <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-[#5B2E8C] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#5B5C68] leading-relaxed">
                  {form.tipo === 'valor' && form.valorMaximo
                    ? `Pagar automaticamente via ${form.formaPagamento === 'pix' ? 'PIX' : 'Cartão'} passagens de até R$ ${form.valorMaximo} ${form.placa === 'todas' ? 'de todos os veículos' : `da placa ${form.placa}`}.`
                    : form.tipo === 'concessionaria'
                      ? `Pagar automaticamente via ${form.formaPagamento === 'pix' ? 'PIX' : 'Cartão'} passagens da ${form.concessionaria} ${form.placa === 'todas' ? 'de todos os veículos' : `da placa ${form.placa}`}.`
                      : `Pagar automaticamente via ${form.formaPagamento === 'pix' ? 'PIX' : 'Cartão'} ${form.placa === 'todas' ? 'todos os veículos' : `a placa ${form.placa}`} quando faltarem ${form.diasAntesVencimento} dia${form.diasAntesVencimento !== '1' ? 's' : ''} para vencer.`
                  }
                </p>
              </div>
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="border-[#DCDDE3] text-[#8A8B95] hover:bg-[#F7F5FB]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarRegra}
              className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
