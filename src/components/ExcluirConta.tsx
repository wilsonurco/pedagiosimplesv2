import { useRef, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from './ui/alert-dialog';
import { concluirExclusaoConta, type ContatoExclusao } from '../services/accountDeletion';

interface ExcluirContaProps {
  dadosUsuario: ContatoExclusao;
  onExcluirConta: () => void;
}

export function ExcluirConta({ dadosUsuario, onExcluirConta }: ExcluirContaProps) {
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const emAndamento = useRef(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const alterarAberto = (valor: boolean) => {
    if (emAndamento.current) return;
    setAberto(valor);
    setConfirmacao('');
    setErro('');
    setToken(null);
    setCaptchaKey(k => k + 1);
  };

  const excluir = async () => {
    if (emAndamento.current || confirmacao !== 'EXCLUIR') return;
    emAndamento.current = true;
    setExcluindo(true);
    setErro('');
    try {
      // This checkout removes the account from React state. A production
      // account API must own removal/revocation in onExcluirConta instead.
      const sincronizacao = await concluirExclusaoConta(dadosUsuario, token, onExcluirConta);
      if (sincronizacao.status === 'not-sent') {
        // Operational diagnostic only. Never log the contact or credentials.
        console.warn('Lead de exclusão não sincronizado:', sincronizacao.reason);
      }
    } catch {
      setErro('Não foi possível concluir a exclusão. Sua conta continua ativa. Tente novamente.');
      setToken(null);
      setCaptchaKey(k => k + 1);
      emAndamento.current = false;
      setExcluindo(false);
      return;
    }
  };

  return (
    <>
      <Card className="border-[#DCDDE3] shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-[#C8324A]" />
            Excluir conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#63646E]">
            Encerre sua conta e remova seus dados de acesso. Esta ação não pode ser desfeita.
          </p>
          <Button variant="outline" className="border-[#C8324A] text-[#C8324A] hover:bg-[#FFF1F3] shadow-none" onClick={() => alterarAberto(true)}>
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={aberto} onOpenChange={alterarAberto}>
        <AlertDialogContent className="max-h-[90dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você perderá o acesso à sua conta e aos veículos e preferências cadastrados.
              A exclusão não quita débitos de pedágio existentes. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirmar-exclusao">Digite EXCLUIR para confirmar</Label>
            <Input id="confirmar-exclusao" value={confirmacao} onChange={e => setConfirmacao(e.target.value)} autoComplete="off" disabled={excluindo} className="shadow-none" />
          </div>

          {siteKey && (
            <Turnstile key={captchaKey} siteKey={siteKey} options={{ action: 'account-deletion-marketing', size: 'compact', appearance: 'interaction-only' }}
              onSuccess={setToken} onExpire={() => setToken(null)} onError={() => setToken(null)} />
          )}
          {erro && <p role="alert" className="text-sm text-[#C8324A]">{erro}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Manter minha conta</AlertDialogCancel>
            <Button variant="destructive" disabled={excluindo || confirmacao !== 'EXCLUIR'} onClick={excluir}>
              {excluindo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {excluindo ? 'Excluindo...' : 'Excluir definitivamente'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
