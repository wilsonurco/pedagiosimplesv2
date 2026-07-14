# Mover validação de telefone (SMS) da Etapa 1 para a Etapa 3 do cadastro

**Data:** 2026-07-13
**Status:** Aprovado para implementação

> **Atualização (2026-07-13, pós-implementação inicial):** depois de ver a Etapa 3 combinando placa e telefone na mesma tela, o usuário pediu para separar em uma etapa própria. As seções 3, 4 e 5 abaixo foram revisadas para refletir esse novo modelo de **4 etapas**. O resto do documento (contexto, objetivos, não-objetivos) permanece válido.

## 1. Contexto e motivação

O fluxo de cadastro (`CadastroUsuario.tsx`) tem 3 etapas: **1) Dados pessoais** (CPF, nascimento, nome, email, telefone com validação por SMS, termos), **2) Senha**, **3) Confirmar veículo** (placa). Hoje a validação do celular por SMS acontece logo na Etapa 1, antes mesmo do usuário confirmar o veículo.

A consulta pública de débitos (`ConsultaDebitos.tsx` / `ResultadosDebitos.tsx`) já acontece **antes** de `CadastroUsuario` ser montado, como parte do fluxo `landing → resultados → cadastro`. Ou seja, "mover a validação de telefone para depois da consulta de débitos e do cadastro do veículo" significa, na prática, movê-la para a Etapa 3 (a última), depois do campo de placa.

## 2. Objetivos e não-objetivos

### Objetivos
1. Remover o gate de SMS da Etapa 1 — o campo de telefone continua lá (preenchido via CPF, editável, com validação de formato/DDD), mas sem exigir confirmação por código.
2. Mover a validação por SMS (envio de código, modal, confirmação) para a Etapa 3, depois do campo de placa.
3. Garantir que a criação de conta — inclusive pelo atalho "Criar conta sem vincular este veículo" — só aconteça com o telefone confirmado por SMS.

### Não-objetivos
- Mudar o mecanismo de envio/validação do SMS (continua mock, código fixo `"123456"`, modal existente).
- Alterar a consulta pública de débitos ou o fluxo antes do cadastro.
- Mudar a Etapa 2 (senha).
- Adicionar/remover campos do formulário.

## 3. Escopo por etapa (revisado — modelo de 4 etapas)

### Etapa 1 — "Dados pessoais" (sem SMS)
- Mantém: CPF, data de nascimento, nome, email, telefone (formatação e validação de DDD/9º dígito, como hoje), checkbox de termos.
- Remove: o texto "Celular válido — enviaremos um SMS para confirmar" e todo o gate de confirmação por código.
- O botão "Continuar" avança para a Etapa 2 assim que CPF válido, nome, email (formato válido), telefone (formato válido) e termos estiverem OK — sem a interceptação que hoje troca o botão para "Enviar código por SMS".

### Etapa 2 — "Senha e confirmação"
Sem mudanças.

### Etapa 3 — "Confirmar veículo" (placa apenas)
- Só o campo de placa (volta a ser como era antes da primeira rodada de implementação).
- Botão "Continuar" avança para a Etapa 4 quando a placa é válida.
- "Criar conta sem vincular este veículo": continua nesta etapa, mas **não cria mais a conta diretamente** — passa a pular a exigência de placa (`formData.placa = ''`, `pularCadastroVeiculo = true`) e avançar para a Etapa 4, onde o telefone ainda precisa ser confirmado por SMS antes da conta ser criada de fato.

### Etapa 4 (nova) — "Confirmar telefone"
- Campo de telefone + validação por SMS, reaproveitando a UI e o modal existentes (apenas realocados desta vez para a Etapa 4, não mais dentro da Etapa 3).
- O botão principal replica o padrão que já existe: quando o telefone tem formato válido mas o código ainda não foi enviado, o botão vira "Enviar código por SMS"; depois que o código é confirmado (`codigoValido === true`), o botão vira "Criar conta e prosseguir" — esta é agora a única etapa que efetivamente cria a conta (via `handleSubmit`), esteja o veículo vinculado ou não.

## 4. Barra de progresso (revisada — 4 faixas de 25%)

- Etapa 1 (0–25%): recalculada sobre 5 campos (CPF, nascimento, nome, email, termos) — sem telefone/SMS.
- Etapa 2 (25–50%): sem mudanças de conteúdo, só a faixa de porcentagem.
- Etapa 3 (50–75%): só placa válida.
- Etapa 4 (75–100%): telefone confirmado por SMS.

Cabeçalho passa a mostrar "Etapa X de 4" em vez de "Etapa X de 3".

## 5. Duplicação a atualizar

A lógica de validade/gating do telefone (que a primeira rodada desta mudança já moveu da Etapa 1 para dentro da Etapa 3) precisa ser movida — não duplicada — mais uma vez, agora da Etapa 3 para um bloco próprio da Etapa 4, em:
1. `isCurrentStepValid()` — bloco da etapa 3 volta a ser só placa; novo bloco da etapa 4 tem a checagem de telefone/SMS.
2. `validateCurrentStep()` — mesma separação.
3. O botão principal: a faixa `etapaAtual < 3` (que mostra "Continuar") passa a ser `etapaAtual < 4`; o bloco final (SMS + "Criar conta e prosseguir") passa a ser exclusivo de `etapaAtual === 4`.

`handleSubmitSemVeiculo()` deixa de chamar `onCadastrar` diretamente — passa a apenas marcar `pularCadastroVeiculo: true` no `formData` e chamar `setEtapaAtual(4)`. A criação da conta em si (com ou sem veículo vinculado) passa a acontecer só via `handleSubmit()` na Etapa 4, que já checa a condição combinada `(!codigoEnviado && telefoneValido === true) || (codigoEnviado && codigoValido === true)` antes de criar a conta.

O restante da máquina de SMS (`enviarCodigoValidacao`, `reenviarCodigoDoModal`, o handler inline de validação do código no modal, e o próprio `<Dialog>`) é agnóstico de etapa e não precisa mudar de lugar — só o que dispara e gate.

## 6. Arquivos afetados

| Arquivo | Mudanças |
|---|---|
| `src/components/CadastroUsuario.tsx` | Reordenar JSX (telefone sai do bloco etapa 1, entra no bloco etapa 3 após placa), mover lógica de validade/gating de telefone de `etapaAtual === 1` para `etapaAtual === 3`, atualizar `getStepTitle()`/`getStepIcon()`, `progressoCalculado`, `handleNextStep()`, botão principal e `handleSubmitSemVeiculo()`. |

Nenhum outro arquivo precisa mudar — não há estado externo, store ou props afetados (`placaConsultada` continua funcionando igual).

## 7. Plano de testes manuais

1. Etapa 1: preencher CPF válido (auto-preenche nome/nascimento/email/telefone), confirmar que **não** aparece nenhuma exigência de SMS e que "Continuar" habilita normalmente após termos aceitos.
2. Etapa 2: senha forte + confirmação — sem mudanças, segue para Etapa 3.
3. Etapa 3: preencher/validar placa primeiro; confirmar que o botão principal vira "Enviar código por SMS" quando o telefone tem formato válido; validar o código no modal (código mock `123456`); confirmar que "Criar conta e prosseguir" só habilita com placa válida e SMS confirmado.
4. "Criar conta sem vincular este veículo": confirmar que fica desabilitado até o SMS ser confirmado, mesmo sem placa preenchida; habilita e cria a conta assim que o SMS é confirmado.
5. Barra de progresso: conferir que os percentuais fazem sentido em cada etapa (Etapa 1 sem telefone/SMS no cálculo; Etapa 3 chega a 100% só com placa + SMS confirmados).
6. `npm run dev` roda sem erros; nenhum warning novo de tipo.

## 8. Verificação final

- `npm run dev` roda sem erros.
- `npm run build` passa sem warning/erro novo.
- Os 4 cenários manuais acima validados no browser.
