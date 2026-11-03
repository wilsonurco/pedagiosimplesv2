export interface ContatoExclusao {
  nome?: string;
  email: string;
}

type SincronizacaoLead =
  | { status: 'sent' }
  | { status: 'not-sent'; reason: 'missing-token' | 'request-failed' };

// Account deletion must succeed independently of marketing availability.
// The callback owns account removal; only its failure may block deletion.
export async function concluirExclusaoConta(
  contato: ContatoExclusao,
  token: string | null,
  excluirConta: () => void | Promise<void>,
): Promise<SincronizacaoLead> {
  await excluirConta();
  if (!token) return { status: 'not-sent', reason: 'missing-token' };
  try {
    await preservarContatoMarketing(contato, token);
    return { status: 'sent' };
  } catch {
    return { status: 'not-sent', reason: 'request-failed' };
  }
}

// RD credentials and conversion payload stay on the backend.
export async function preservarContatoMarketing(contato: ContatoExclusao, token: string) {
  const response = await fetch('/api/conta-excluida', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      nome: contato.nome,
      email: contato.email,
      turnstileToken: token,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Falha ao sincronizar o contato.');
  const result = await response.json();
  if (result.ok !== true) throw new Error('Resposta inválida ao sincronizar o contato.');
}
