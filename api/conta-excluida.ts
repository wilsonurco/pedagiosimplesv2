// Preserve the lead during account deletion. This endpoint does not delete
// production accounts; this checkout stores the account in React state.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const apiKey = process.env.RD_MARKETING_API_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const origin = process.env.APP_ORIGIN;
  if (!apiKey || !secret || !origin) {
    return res.status(503).json({ error: 'Integração de marketing indisponível.' });
  }
  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return res.status(503).json({ error: 'Integração de marketing indisponível.' });
  }
  if (req.headers.origin !== origin) {
    return res.status(403).json({ error: 'Origem não permitida.' });
  }
  if (!req.headers['content-type']?.startsWith('application/json')) {
    return res.status(415).json({ error: 'Envie JSON.' });
  }
  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const { nome, email, turnstileToken } = body ?? {};
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      (nome !== undefined && (typeof nome !== 'string' || nome.length > 200)) ||
      typeof turnstileToken !== 'string' || !turnstileToken || turnstileToken.length > 2048) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: turnstileToken }),
      signal: AbortSignal.timeout(5000),
    });
    if (!verification.ok) return res.status(502).json({ error: 'Verificação indisponível.' });
    const captcha = await verification.json();
    if (captcha.success !== true || captcha.action !== 'account-deletion-marketing' || captcha.hostname !== hostname) {
      return res.status(403).json({ error: 'Verificação de segurança inválida.' });
    }

    const url = new URL('https://api.rd.services/platform/conversions');
    url.searchParams.set('api_key', apiKey);
    const rdResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: 'pedagiosimples-exclusao-conta',
          email: email.trim().toLowerCase(),
          ...(nome?.trim() ? { name: nome.trim() } : {}),
          tags: ['PedágioSimples'],
          // Preserve existing RD communication permissions. This action does
          // not collect consent and must not manufacture consent/granted.
        },
      }),
      signal: AbortSignal.timeout(7000),
    });
    if (!rdResponse.ok) return res.status(502).json({ error: 'Não foi possível salvar o contato.' });
    const conversion = await rdResponse.json();
    if (typeof conversion.event_uuid !== 'string' || !conversion.event_uuid) {
      return res.status(502).json({ error: 'Não foi possível confirmar o contato.' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    // Never return provider bodies, credentials, or personal data to the client.
    return res.status(502).json({ error: 'Integração temporariamente indisponível.' });
  }
}
