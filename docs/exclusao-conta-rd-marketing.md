# Exclusão de conta e RD Station Marketing

## Estado implementado em 2026-11-03

Este checkout é um protótipo React/Vite. Login e cadastro são simulados; usuário,
veículos e pagamentos existem apenas no estado React. Não existe banco, sessão
autenticada no servidor ou API de usuários. A exclusão remove os dados mantidos
pelo app, desmonta o dashboard e retorna à landing sem placa, débitos selecionados
ou resultados anteriores. O login simulado continua aceitando qualquer CPF/senha.
Isso não comprova exclusão de uma conta de produção.

O card de notificações foi retirado das configurações; o componente original
continua disponível no código para futura reativação.

## Marketing

A confirmação exige digitar `EXCLUIR` e oferece `Manter minha conta`. O envio
ao RD ocorre automaticamente pelo back-end ao confirmar a exclusão. A interface
não exibe checkbox, mensagem de campanhas ou detalhes do RD.

`/api/conta-excluida` valida origem, campos e o desafio
Turnstile (ação `account-deletion-marketing` e hostname). Depois envia uma conversão
com nome, e-mail, tag exata `PedágioSimples` e identificador
`pedagiosimples-exclusao-conta`. CPF, placas, senha, endereço e pagamentos não são
enviados. Não envia `legal_bases` nem afirma `consent/granted`: as permissões de
comunicação existentes no RD são preservadas. O envio do lead não cria uma nova
autorização de comunicação.

A exclusão da conta é independente do marketing: a sessão é removida primeiro e
o envio ao RD é tentado em segundo plano quando há um token de segurança. Falta
de token, configuração, falha do provedor ou timeout não bloqueiam a exclusão.
Somente uma falha na operação de excluir a conta pode manter o modal com erro.

Não há fila durável nem garantia de entrega do lead: se não houver token ou o
envio falhar, o resultado é `not-sent`, registrado somente como diagnóstico no
console, sem dados pessoais. Não se simula sucesso do RD. Para garantir retenção
em produção, é necessário um outbox persistente no backend autenticado de contas;
esse backend ainda não existe neste checkout. A sincronização não depende de
manter o modal aberto e o fetch usa `keepalive`.

## Configuração e validação externa pendentes

Configure as variáveis de `.env.example` no ambiente da Vercel:

- `RD_MARKETING_API_KEY`: chave de conversões da conta RD desejada.
- `TURNSTILE_SECRET_KEY` e `VITE_TURNSTILE_SITE_KEY`: par de chaves reais do mesmo widget.
- `APP_ORIGIN`: origem exata da aplicação, sem barra final. Autorize esse hostname
  no widget Turnstile. Preview e produção precisam de suas respectivas origens.

O Vite puro (`npm run dev`) serve somente a interface. Para exercitar a função
localmente, use o runtime de funções da Vercel (`vercel dev`) com as variáveis
configuradas. Sem configuração, a exclusão local funciona, mas a entrega do lead
não é confirmada. Testes automatizados usam respostas mockadas e não
criam leads reais. Validar com contato de teste autorizado no RD antes da ativação.

Antes de ligar a contas reais, implementar uma API de exclusão autenticada que
resolva a identidade pelo servidor, remova/anonimize os dados correspondentes e
revogue as sessões. Não usar o e-mail fornecido pelo navegador para autorizar
exclusão. Integrar essa API antes de chamar `onExcluirConta` e definir a política
de retenção de registros transacionais. Essa infraestrutura não existe no checkout.

## Verificação local

- Build de produção e TypeScript (interface e função) aprovados.
- 22 testes da integração aprovados, cobrindo validação, origem, captcha, campos enviados,
  ausência de consentimento inventado, falhas e confirmação do RD, exclusão sem token,
  exclusão antes da resposta de marketing e propagação de falha real ao excluir a conta.
- Chrome desktop (1440px) e celular (390px): card oculto, confirmação obrigatória,
  ausência de checkbox e mensagem de campanhas, cancelamento preservando a conta sem enviar lead,
  exclusão independente de token e disponibilidade do RD, e envio com resposta confirmada.
  Foram verificados o ambiente local sem configuração, captcha ausente/pendente e
  respostas 200, 502 e 503 da integração.
  Captcha e RD simulados apenas no teste; nenhum lead real criado.
- A suíte existente do simulador tem quatro falhas em contagens de passagens,
  em arquivos não alterados por esta implementação.

Referências oficiais consultadas:

- [Conversão via API Key](https://developers.rdstation.com/reference/conversao)
- [Migração e campos de conversão](https://developers.rdstation.com/reference/rdsm-como-migrar-api-v1-para-api-v2)
- [Bases de comunicação no RD Marketing](https://developers.rdstation.com/reference/bases-legais-rdstation-marketing)
- [Validação do Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
