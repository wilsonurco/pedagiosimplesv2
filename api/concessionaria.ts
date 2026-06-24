const RD_TOKEN = "c6cc9c951391d58a2eea";
const RD_IDENTIFICADOR = "pedagio-simples-seja-uma-concessionaria-parceira";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome, email, celular, empresa, estado, mensagem } = req.body ?? {};

  if (!nome || !email || !celular || !empresa || !estado) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  try {
    const rdRes = await fetch("https://app.rdstation.com.br/api/1.3/conversions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token_rdstation: RD_TOKEN,
        identificador: RD_IDENTIFICADOR,
        nome,
        email,
        celular,
        empresa,
        estado,
        mensagem: mensagem ?? "",
      }),
    });

    const text = await rdRes.text();

    if (rdRes.ok || rdRes.status === 200 || rdRes.status === 201) {
      return res.status(200).json({ ok: true });
    }

    return res.status(rdRes.status).json({ error: text });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Erro interno" });
  }
}
