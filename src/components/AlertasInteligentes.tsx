import { useState } from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Bell,
  Mail,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Info,
} from "lucide-react";

interface AlertConfig {
  canais: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  alertas: {
    novaPassagem: boolean;
    prazoVencimento: boolean;
    prazoAntecedencia: string;
    pagamentoConfirmado: boolean;
    riscoMulta: boolean;
  };
}

export function AlertasInteligentes() {
  const [config, setConfig] = useState<AlertConfig>({
    canais: { email: true, push: true, sms: false },
    alertas: {
      novaPassagem: true,
      prazoVencimento: true,
      prazoAntecedencia: '3',
      pagamentoConfirmado: true,
      riscoMulta: true,
    },
  });

  const [saved, setSaved] = useState(false);

  const totalAtivos = [
    config.alertas.novaPassagem,
    config.alertas.prazoVencimento,
    config.alertas.pagamentoConfirmado,
    config.alertas.riscoMulta,
  ].filter(Boolean).length;

  const canaisAtivos = Object.values(config.canais).filter(Boolean);

  const toggleCanal = (canal: keyof AlertConfig['canais']) => {
    setConfig(prev => ({ ...prev, canais: { ...prev.canais, [canal]: !prev.canais[canal] } }));
    setSaved(false);
  };

  const toggleAlerta = (alerta: keyof Omit<AlertConfig['alertas'], 'prazoAntecedencia'>) => {
    setConfig(prev => ({ ...prev, alertas: { ...prev.alertas, [alerta]: !prev.alertas[alerta] } }));
    setSaved(false);
  };

  return (
    <div className="space-y-5">

      {/* Status summary */}
      <div className={`flex items-center justify-between p-3 rounded-xl border-2 ${
        totalAtivos > 0 && canaisAtivos.length > 0
          ? 'bg-[#D4F0E2] border-[#A3D9BE]'
          : 'bg-[#FBE8C5] border-[#F4C97A]'
      }`}>
        <div className="flex items-center gap-2.5">
          <Bell className={`h-4 w-4 flex-shrink-0 ${totalAtivos > 0 && canaisAtivos.length > 0 ? 'text-[#0A6B45]' : 'text-[#9A5B00]'}`} />
          <span className={`text-sm font-medium ${totalAtivos > 0 && canaisAtivos.length > 0 ? 'text-[#0A6B45]' : 'text-[#9A5B00]'}`}>
            {totalAtivos > 0 && canaisAtivos.length > 0
              ? `${totalAtivos} alerta${totalAtivos !== 1 ? 's' : ''} ativo${totalAtivos !== 1 ? 's' : ''} — você está sendo monitorado`
              : canaisAtivos.length === 0
                ? 'Nenhum canal ativado — você não receberá alertas'
                : 'Nenhum alerta ativado'}
          </span>
        </div>
        {totalAtivos > 0 && canaisAtivos.length > 0 && (
          <Badge className="bg-[#0E8B5A] text-white text-xs border-0">Ativo</Badge>
        )}
      </div>

      {/* Canais */}
      <div>
        <p className="text-xs font-semibold text-[#8A8B95] uppercase tracking-wide mb-2.5">Canais de envio</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

          <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors cursor-pointer ${
            config.canais.email ? 'bg-[#F4EFFB] border-[#8B5FFF]' : 'bg-white border-[#DCDDE3]'
          }`} onClick={() => toggleCanal('email')}>
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.canais.email ? 'bg-[#8B5FFF]' : 'bg-[#F4EFFB]'}`}>
                <Mail className={`h-3.5 w-3.5 ${config.canais.email ? 'text-white' : 'text-[#8A8B95]'}`} />
              </div>
              <span className={`text-sm font-medium ${config.canais.email ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>E-mail</span>
            </div>
            <Switch checked={config.canais.email} onCheckedChange={() => toggleCanal('email')} onClick={e => e.stopPropagation()} />
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors cursor-pointer ${
            config.canais.push ? 'bg-[#F4EFFB] border-[#8B5FFF]' : 'bg-white border-[#DCDDE3]'
          }`} onClick={() => toggleCanal('push')}>
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.canais.push ? 'bg-[#8B5FFF]' : 'bg-[#F4EFFB]'}`}>
                <Bell className={`h-3.5 w-3.5 ${config.canais.push ? 'text-white' : 'text-[#8A8B95]'}`} />
              </div>
              <span className={`text-sm font-medium ${config.canais.push ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>Push</span>
            </div>
            <Switch checked={config.canais.push} onCheckedChange={() => toggleCanal('push')} onClick={e => e.stopPropagation()} />
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors cursor-pointer ${
            config.canais.sms ? 'bg-[#F4EFFB] border-[#8B5FFF]' : 'bg-white border-[#DCDDE3]'
          }`} onClick={() => toggleCanal('sms')}>
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.canais.sms ? 'bg-[#8B5FFF]' : 'bg-[#F4EFFB]'}`}>
                <MessageSquare className={`h-3.5 w-3.5 ${config.canais.sms ? 'text-white' : 'text-[#8A8B95]'}`} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-medium ${config.canais.sms ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>SMS</span>
                <Badge className="text-[9px] px-1 py-0 h-3.5 bg-[#FBE8C5] text-[#9A5B00] border-0 leading-none">Premium</Badge>
              </div>
            </div>
            <Switch checked={config.canais.sms} onCheckedChange={() => toggleCanal('sms')} onClick={e => e.stopPropagation()} />
          </div>

        </div>
      </div>

      {/* Alert types */}
      <div>
        <p className="text-xs font-semibold text-[#8A8B95] uppercase tracking-wide mb-2.5">Tipos de alerta</p>
        <div className="space-y-2">

          {/* Nova passagem */}
          <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
            config.alertas.novaPassagem ? 'bg-white border-[#DCDDE3]' : 'bg-[#F7F5FB] border-[#DCDDE3]'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                config.alertas.novaPassagem ? 'bg-[#5B2E8C]' : 'bg-[#F4EFFB]'
              }`}>
                <Zap className={`h-4 w-4 ${config.alertas.novaPassagem ? 'text-white' : 'text-[#8A8B95]'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${config.alertas.novaPassagem ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>
                  Nova passagem detectada
                </p>
                <p className="text-xs text-[#8A8B95]">Assim que um pórtico registrar seu veículo</p>
              </div>
            </div>
            <Switch checked={config.alertas.novaPassagem} onCheckedChange={() => toggleAlerta('novaPassagem')} className="flex-shrink-0 ml-3" />
          </div>

          {/* Prazo vencimento */}
          <div className={`rounded-xl border transition-colors ${
            config.alertas.prazoVencimento ? 'bg-white border-[#DCDDE3]' : 'bg-[#F7F5FB] border-[#DCDDE3]'
          }`}>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  config.alertas.prazoVencimento ? 'bg-[#C77700]' : 'bg-[#F4EFFB]'
                }`}>
                  <Clock className={`h-4 w-4 ${config.alertas.prazoVencimento ? 'text-white' : 'text-[#8A8B95]'}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${config.alertas.prazoVencimento ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>
                    Prazo de vencimento
                  </p>
                  <p className="text-xs text-[#8A8B95]">Antes que a passagem vire multa de evasão</p>
                </div>
              </div>
              <Switch checked={config.alertas.prazoVencimento} onCheckedChange={() => toggleAlerta('prazoVencimento')} className="flex-shrink-0 ml-3" />
            </div>
            {config.alertas.prazoVencimento && (
              <div className="px-3 pb-3 flex items-center gap-2">
                <span className="text-xs text-[#8A8B95] flex-shrink-0">Avisar com</span>
                <Select
                  value={config.alertas.prazoAntecedencia}
                  onValueChange={v => {
                    setConfig(prev => ({ ...prev, alertas: { ...prev.alertas, prazoAntecedencia: v } }));
                    setSaved(false);
                  }}
                >
                  <SelectTrigger className="h-7 text-xs w-28 border-[#DCDDE3] bg-[#F7F5FB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia antes</SelectItem>
                    <SelectItem value="3">3 dias antes</SelectItem>
                    <SelectItem value="7">7 dias antes</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-[#8A8B95]">do vencimento</span>
              </div>
            )}
          </div>

          {/* Pagamento confirmado */}
          <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
            config.alertas.pagamentoConfirmado ? 'bg-white border-[#DCDDE3]' : 'bg-[#F7F5FB] border-[#DCDDE3]'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                config.alertas.pagamentoConfirmado ? 'bg-[#0E8B5A]' : 'bg-[#F4EFFB]'
              }`}>
                <CheckCircle className={`h-4 w-4 ${config.alertas.pagamentoConfirmado ? 'text-white' : 'text-[#8A8B95]'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${config.alertas.pagamentoConfirmado ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>
                  Pagamento confirmado
                </p>
                <p className="text-xs text-[#8A8B95]">Comprovante assim que o pagamento for processado</p>
              </div>
            </div>
            <Switch checked={config.alertas.pagamentoConfirmado} onCheckedChange={() => toggleAlerta('pagamentoConfirmado')} className="flex-shrink-0 ml-3" />
          </div>

          {/* Risco de multa */}
          <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
            config.alertas.riscoMulta ? 'bg-white border-[#DCDDE3]' : 'bg-[#F7F5FB] border-[#DCDDE3]'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                config.alertas.riscoMulta ? 'bg-[#C8324A]' : 'bg-[#F4EFFB]'
              }`}>
                <Shield className={`h-4 w-4 ${config.alertas.riscoMulta ? 'text-white' : 'text-[#8A8B95]'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${config.alertas.riscoMulta ? 'text-[#1A1B23]' : 'text-[#8A8B95]'}`}>
                  Risco de multa de evasão
                </p>
                <p className="text-xs text-[#8A8B95]">Urgente — passagem prestes a virar autuação</p>
              </div>
            </div>
            <Switch checked={config.alertas.riscoMulta} onCheckedChange={() => toggleAlerta('riscoMulta')} className="flex-shrink-0 ml-3" />
          </div>

        </div>
      </div>

      {/* Summary preview */}
      {totalAtivos > 0 && canaisAtivos.length > 0 && (
        <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-xl p-3">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#5B2E8C] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#5B2E8C] mb-0.5">Resumo das suas configurações</p>
              <p className="text-xs text-[#5B5C68] leading-relaxed">
                {totalAtivos} tipo{totalAtivos !== 1 ? 's' : ''} de alerta via{' '}
                {[
                  config.canais.email && 'e-mail',
                  config.canais.push && 'push',
                  config.canais.sms && 'SMS',
                ].filter(Boolean).join(', ')}.
                {config.alertas.prazoVencimento && (
                  ` Avisos de vencimento com ${config.alertas.prazoAntecedencia} dia${config.alertas.prazoAntecedencia !== '1' ? 's' : ''} de antecedência.`
                )}
              </p>
            </div>
          </div>
        </div>
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
        {!saved && (
          <span className="text-xs text-[#8A8B95]">Alterações não salvas</span>
        )}
      </div>

    </div>
  );
}
