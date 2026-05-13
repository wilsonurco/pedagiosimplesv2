import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Star,
  X,
} from "lucide-react";

interface Veiculo {
  id: string;
  placa: string;
  apelido: string;
  isPrincipal: boolean;
  totalPendencias: number;
  valorPendente: number;
  totalPago: number;
}

interface VeiculosCadastradosProps {
  onIrParaConsulta?: (placa: string) => void;
  onIrParaPagamentoDireto?: (placa: string) => void;
}

const VEICULOS_INICIAIS: Veiculo[] = [
  {
    id: 'vei-1548',
    placa: 'MOV-1234',
    apelido: 'Meu carro',
    isPrincipal: true,
    totalPendencias: 4,
    valorPendente: 25.40,
    totalPago: 60.60,
  },
];

export function VeiculosCadastrados({ onIrParaConsulta, onIrParaPagamentoDireto }: VeiculosCadastradosProps = {}) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS);
  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState<Veiculo | null>(null);
  const [dialogExclusaoAberto, setDialogExclusaoAberto] = useState(false);
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<Veiculo | null>(null);

  const [form, setForm] = useState({ placa: '', apelido: '' });
  const [erroPlaca, setErroPlaca] = useState('');

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const validarPlaca = (placa: string) => /^[A-Z]{3}-[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placa);

  const handleChangePlaca = (raw: string) => {
    let value = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length >= 4 && /^[A-Z]{3}[0-9]/.test(value)) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7);
    } else {
      value = value.slice(0, 7);
    }
    if (value.includes('-')) value = value.slice(0, 8);
    setForm(prev => ({ ...prev, placa: value }));
    setErroPlaca('');
  };

  const abrirModalNovo = () => {
    setVeiculoEditando(null);
    setForm({ placa: '', apelido: '' });
    setErroPlaca('');
    setModalAberto(true);
  };

  const abrirModalEditar = (veiculo: Veiculo) => {
    setVeiculoEditando(veiculo);
    setForm({ placa: veiculo.placa, apelido: veiculo.apelido });
    setErroPlaca('');
    setModalAberto(true);
  };

  const handleSalvar = () => {
    if (!validarPlaca(form.placa)) {
      setErroPlaca('Placa inválida. Use o formato ABC-1234.');
      return;
    }
    const placaJaExiste = veiculos.some(
      v => v.placa === form.placa && v.id !== veiculoEditando?.id
    );
    if (placaJaExiste) {
      setErroPlaca('Esta placa já está cadastrada.');
      return;
    }

    if (veiculoEditando) {
      setVeiculos(prev =>
        prev.map(v =>
          v.id === veiculoEditando.id
            ? { ...v, placa: form.placa, apelido: form.apelido }
            : v
        )
      );
    } else {
      const novo: Veiculo = {
        id: `vei-${Date.now()}`,
        placa: form.placa,
        apelido: form.apelido,
        isPrincipal: veiculos.length === 0,
        totalPendencias: 0,
        valorPendente: 0,
        totalPago: 0,
      };
      setVeiculos(prev => [...prev, novo]);
    }
    setModalAberto(false);
  };

  const definirPrincipal = (id: string) => {
    setVeiculos(prev =>
      prev.map(v => ({ ...v, isPrincipal: v.id === id }))
    );
  };

  const handleConfirmarExclusao = () => {
    if (veiculoParaExcluir) {
      const removendo = veiculoParaExcluir;
      setVeiculos(prev => {
        const restantes = prev.filter(v => v.id !== removendo.id);
        if (removendo.isPrincipal && restantes.length > 0) {
          restantes[0].isPrincipal = true;
        }
        return restantes;
      });
      setDialogExclusaoAberto(false);
      setVeiculoParaExcluir(null);
    }
  };

  const veiculosComPendencia = veiculos.filter(v => v.totalPendencias > 0);
  const totalGeral = veiculos.reduce((s, v) => s + v.totalPago, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#5B2E8C]">Meus Veículos</h2>
          <p className="text-sm text-[#8A8B95] mt-0.5">Gerencie as placas monitoradas na sua conta</p>
        </div>
        <Button
          onClick={abrirModalNovo}
          className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white h-9 px-3 text-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Adicionar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border-2 bg-white border-[#DCDDE3] p-3 sm:p-4">
          <p className="text-xs text-[#8A8B95] uppercase tracking-wide">Veículos</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-[#5B2E8C]">{veiculos.length}</p>
          <p className="text-xs text-[#8A8B95] mt-1">cadastrado{veiculos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={`rounded-xl border-2 p-3 sm:p-4 ${veiculosComPendencia.length > 0 ? 'bg-[#F8D7DD] border-[#F0A8B5]' : 'bg-white border-[#DCDDE3]'}`}>
          <p className="text-xs text-[#8A8B95] uppercase tracking-wide">Pendências</p>
          <p className={`text-xl sm:text-2xl font-bold mt-1 ${veiculosComPendencia.length > 0 ? 'text-[#A3203B]' : 'text-[#8A8B95]'}`}>
            {veiculosComPendencia.length}
          </p>
          <p className="text-xs text-[#8A8B95] mt-1">veículo{veiculosComPendencia.length !== 1 ? 's' : ''} com débito</p>
        </div>
        <div className="rounded-xl border-2 bg-white border-[#DCDDE3] p-3 sm:p-4">
          <p className="text-xs text-[#8A8B95] uppercase tracking-wide">Total pago</p>
          <p className="text-lg sm:text-xl font-bold mt-1 text-[#0A6B45] font-mono">{formatCurrency(totalGeral)}</p>
          <p className="text-xs text-[#8A8B95] mt-1">todos os veículos</p>
        </div>
      </div>

      {/* Multi-vehicle pay-all banner */}
      {veiculosComPendencia.length > 1 && (
        <div className="bg-gradient-to-r from-[#5B2E8C] to-[#2E1547] rounded-xl p-4 border border-[#8B5FFF]/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-[#FFD60A]" />
              </div>
              <div className="text-white">
                <p className="font-semibold text-sm">
                  {veiculosComPendencia.reduce((s, v) => s + v.totalPendencias, 0)} passagens em {veiculosComPendencia.length} veículos
                </p>
                <p className="text-xs text-white/80 mt-0.5">
                  Total: {formatCurrency(veiculosComPendencia.reduce((s, v) => s + v.valorPendente, 0))}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onIrParaPagamentoDireto?.(veiculosComPendencia.map(v => v.placa).join(','))}
              className="bg-white text-[#5B2E8C] hover:bg-[#F4EFFB] font-semibold h-9 px-4 flex-shrink-0"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Pagar todas as pendências
            </Button>
          </div>
        </div>
      )}

      {/* Vehicle list */}
      {veiculos.length > 0 ? (
        <div className="space-y-3">
          {veiculos.map(veiculo => (
            <div
              key={veiculo.id}
              className={`rounded-xl border-2 p-3 sm:p-4 transition-colors ${
                veiculo.totalPendencias > 0
                  ? 'bg-[#FEF8F8] border-[#F0A8B5]'
                  : 'bg-white border-[#DCDDE3] hover:border-[#C9AEEA]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  veiculo.isPrincipal ? 'bg-[#5B2E8C]' : 'bg-[#F4EFFB]'
                }`}>
                  <Car className={`h-5 w-5 ${veiculo.isPrincipal ? 'text-white' : 'text-[#5B2E8C]'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#1A1B23] font-mono tracking-[0.05em] uppercase text-base">
                          {veiculo.placa}
                        </span>
                        {veiculo.isPrincipal && (
                          <Badge className="bg-[#5B2E8C] text-white text-[10px] px-1.5 py-0 h-4">
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                            Principal
                          </Badge>
                        )}
                        {veiculo.totalPendencias > 0 && (
                          <Badge className="bg-[#F8D7DD] text-[#A3203B] text-[10px] px-1.5 py-0 h-4 border border-[#F0A8B5]">
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                            {veiculo.totalPendencias} pendência{veiculo.totalPendencias !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      {veiculo.apelido && (
                        <p className="text-xs text-[#8A8B95] mt-0.5">{veiculo.apelido}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-[#8A8B95]">
                          Total pago: <span className="font-semibold text-[#0A6B45] font-mono">{formatCurrency(veiculo.totalPago)}</span>
                        </span>
                        {veiculo.totalPendencias > 0 && (
                          <span className="text-xs text-[#C8324A]">
                            Pendente: <span className="font-semibold font-mono">{formatCurrency(veiculo.valorPendente)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {veiculo.totalPendencias > 0 && (
                        <Button
                          size="sm"
                          onClick={() => onIrParaPagamentoDireto?.(veiculo.placa)}
                          className="h-8 px-2.5 text-xs bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Pagar</span>
                        </Button>
                      )}
                      {!veiculo.isPrincipal && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => definirPrincipal(veiculo.id)}
                          title="Definir como veículo principal"
                          className="h-8 w-8 p-0 border-[#DCDDE3] text-[#8A8B95] hover:border-[#5B2E8C] hover:text-[#5B2E8C]"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalEditar(veiculo)}
                        title="Editar veículo"
                        className="h-8 w-8 p-0 border-[#DCDDE3] text-[#8A8B95] hover:border-[#5B2E8C] hover:text-[#5B2E8C]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setVeiculoParaExcluir(veiculo); setDialogExclusaoAberto(true); }}
                        title="Remover veículo"
                        className="h-8 w-8 p-0 border-[#DCDDE3] text-[#8A8B95] hover:border-[#C8324A] hover:text-[#C8324A]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border border-[#DCDDE3]">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-[#F4EFFB] rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-[#8B5FFF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1B23] mb-2">Nenhum veículo cadastrado</h3>
            <p className="text-sm text-[#8A8B95] mb-5 max-w-xs mx-auto leading-relaxed">
              Adicione as placas dos seus veículos para monitorar pendências e acessar o histórico de pagamentos.
            </p>
            <Button
              onClick={abrirModalNovo}
              className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white h-10 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar meu primeiro veículo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit modal */}
      <Dialog open={modalAberto} onOpenChange={open => { if (!open) setModalAberto(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#5B2E8C]">
              {veiculoEditando ? 'Editar veículo' : 'Adicionar veículo'}
            </DialogTitle>
            <DialogDescription className="text-[#8A8B95]">
              {veiculoEditando
                ? 'Altere a placa ou o apelido do veículo.'
                : 'Informe a placa para começar a monitorar pendências.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Placa */}
            <div className="space-y-1.5">
              <Label htmlFor="placa" className="text-sm font-medium text-[#1A1B23]">Placa</Label>
              <Input
                id="placa"
                placeholder="ABC-1234"
                value={form.placa}
                onChange={e => handleChangePlaca(e.target.value)}
                disabled={!!veiculoEditando}
                maxLength={8}
                className={`text-center font-mono font-semibold tracking-[0.1em] uppercase h-11 text-base ${
                  erroPlaca
                    ? 'border-[#C8324A] focus-visible:ring-[#C8324A]/20'
                    : 'border-[#DCDDE3] focus-visible:ring-[#8B5FFF]/20'
                } ${veiculoEditando ? 'bg-[#F7F5FB] text-[#8A8B95]' : ''}`}
              />
              {erroPlaca && (
                <p className="text-xs text-[#C8324A] flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {erroPlaca}
                </p>
              )}
            </div>

            {/* Apelido */}
            <div className="space-y-1.5">
              <Label htmlFor="apelido" className="text-sm font-medium text-[#1A1B23]">
                Apelido <span className="text-[#8A8B95] font-normal">(opcional)</span>
              </Label>
              <Input
                id="apelido"
                placeholder="Ex.: Meu carro, Carro da empresa..."
                value={form.apelido}
                onChange={e => setForm(prev => ({ ...prev, apelido: e.target.value }))}
                maxLength={40}
                className="border-[#DCDDE3] focus-visible:ring-[#8B5FFF]/20"
              />
              <p className="text-xs text-[#8A8B95]">
                Um nome fácil de identificar este veículo
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="border-[#DCDDE3] text-[#8A8B95] hover:bg-[#F7F5FB]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={form.placa.length < 7}
              className="bg-[#8B5FFF] hover:bg-[#7142B8] text-white"
            >
              {veiculoEditando ? 'Salvar alterações' : 'Adicionar veículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={dialogExclusaoAberto} onOpenChange={setDialogExclusaoAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#C8324A] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Remover veículo
            </DialogTitle>
            <DialogDescription className="text-[#8A8B95]">
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {veiculoParaExcluir && (
            <div className="space-y-4">
              <div className="bg-[#F8D7DD] border border-[#F0A8B5] rounded-lg p-4 text-center">
                <p className="text-xs text-[#8A8B95] mb-1">Placa a remover</p>
                <p className="text-2xl font-bold font-mono tracking-[0.1em] text-[#A3203B]">
                  {veiculoParaExcluir.placa}
                </p>
                {veiculoParaExcluir.apelido && (
                  <p className="text-sm text-[#C8324A] mt-0.5">{veiculoParaExcluir.apelido}</p>
                )}
              </div>
              <p className="text-sm text-[#5B5C68] leading-relaxed">
                O histórico de pagamentos associado a este veículo será mantido, mas você não poderá mais monitorá-lo diretamente.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setDialogExclusaoAberto(false); setVeiculoParaExcluir(null); }}
              className="border-[#DCDDE3] text-[#8A8B95] hover:bg-[#F7F5FB]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarExclusao}
              className="bg-[#C8324A] hover:bg-[#A3203B] text-white"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
