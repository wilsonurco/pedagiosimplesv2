import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/conta-excluida';
import { concluirExclusaoConta, preservarContatoMarketing } from './accountDeletion';

const fetchMock = vi.fn();
const validBody = { nome: 'Pessoa Teste', email: ' PESSOA@example.com ', turnstileToken: 'captcha-token' };

function request(body: unknown = validBody, overrides: Record<string, unknown> = {}) {
  return { method: 'POST', headers: { origin: 'https://pedagio.example', 'content-type': 'application/json' }, body, ...overrides };
}

function response() {
  return { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
}

function verifiedCaptcha(overrides = {}) {
  return { ok: true, json: async () => ({ success: true, action: 'account-deletion-marketing', hostname: 'pedagio.example', ...overrides }) };
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('RD_MARKETING_API_KEY', 'test-api-key');
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
  vi.stubEnv('APP_ORIGIN', 'https://pedagio.example');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetAllMocks(); });

describe('account deletion lead endpoint', () => {
  it('rejects other methods without sending personal data', async () => {
    const res = response();
    await handler(request(undefined, { method: 'DELETE' }), res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports missing configuration without claiming success', async () => {
    vi.stubEnv('RD_MARKETING_API_KEY', '');
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects requests from another origin', async () => {
    const res = response();
    await handler(request(validBody, { headers: { origin: 'https://other.example' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { ...validBody, email: 'invalid' },
    { ...validBody, nome: {} },
    { ...validBody, turnstileToken: '' },
    '{broken json',
  ])('rejects invalid data', async body => {
    const res = response();
    await handler(request(body), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([{ success: false }, { action: 'login' }, { hostname: 'other.example' }])('checks captcha success, action and hostname', async overrides => {
    fetchMock.mockResolvedValueOnce(verifiedCaptcha(overrides));
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends identity and exact source tag without inventing consent or accepting client permissions', async () => {
    fetchMock.mockResolvedValueOnce(verifiedCaptcha()).mockResolvedValueOnce({ ok: true, json: async () => ({ event_uuid: 'event-id' }) });
    const res = response();
    await handler(request({ ...validBody, cpf: 'do-not-send', senha: 'do-not-send', tags: ['untrusted'], consentimentoMarketing: true, legal_bases: [{ type: 'consent', status: 'granted' }] }), res);
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.rd.services/platform/conversions?api_key=test-api-key');
    expect(JSON.parse(options.body)).toEqual({
      event_type: 'CONVERSION', event_family: 'CDP',
      payload: {
        conversion_identifier: 'pedagiosimples-exclusao-conta',
        name: 'Pessoa Teste', email: 'pessoa@example.com', tags: ['PedágioSimples'],
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('handles RD failure without disclosing the upstream error', async () => {
    fetchMock.mockResolvedValueOnce(verifiedCaptcha()).mockResolvedValueOnce({ ok: false, status: 401 });
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('test-api-key');
  });

  it('does not treat an unconfirmed RD conversion as success', async () => {
    fetchMock.mockResolvedValueOnce(verifiedCaptcha()).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('handles provider timeouts', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('Timeout', 'TimeoutError'));
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });
});

describe('marketing client', () => {
  it('requires a confirmed response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await expect(preservarContatoMarketing({ email: 'pessoa@example.com' }, 'token')).rejects.toThrow();
  });

  it('reports synchronization errors to the orchestration layer', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    await expect(preservarContatoMarketing({ email: 'pessoa@example.com' }, 'token')).rejects.toThrow();
  });

  it('whitelists identity fields even when given an entire account object', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const account = { nome: 'Pessoa', email: 'pessoa@example.com', cpf: 'do-not-send', senha: 'do-not-send' };
    await preservarContatoMarketing(account, 'token');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ nome: 'Pessoa', email: 'pessoa@example.com', turnstileToken: 'token' });
  });
});

describe('account deletion independent of marketing', () => {
  const contato = { nome: 'Pessoa', email: 'pessoa@example.com' };

  it('deletes without a configured captcha and does not claim RD delivery', async () => {
    const excluir = vi.fn();
    await expect(concluirExclusaoConta(contato, null, excluir)).resolves.toEqual({ status: 'not-sent', reason: 'missing-token' });
    expect(excluir).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deletes immediately without waiting for the marketing request', async () => {
    const excluir = vi.fn();
    let confirmarEnvio: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise(resolve => { confirmarEnvio = resolve; }));
    const resultado = concluirExclusaoConta(contato, 'token', excluir);
    expect(excluir).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    confirmarEnvio!({ ok: true, json: async () => ({ ok: true }) });
    await expect(resultado).resolves.toEqual({ status: 'sent' });
  });

  it.each([
    () => Promise.resolve({ ok: false, status: 503 }),
    () => Promise.reject(new DOMException('Timeout', 'TimeoutError')),
  ])('does not turn marketing failures into deletion errors', async falhar => {
    fetchMock.mockImplementationOnce(falhar);
    const excluir = vi.fn();
    await expect(concluirExclusaoConta(contato, 'token', excluir)).resolves.toEqual({ status: 'not-sent', reason: 'request-failed' });
    expect(excluir).toHaveBeenCalledTimes(1);
  });

  it('propagates a real account deletion failure and does not send the lead', async () => {
    const erro = new Error('Conta não removida');
    await expect(concluirExclusaoConta(contato, 'token', () => { throw erro; })).rejects.toBe(erro);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
