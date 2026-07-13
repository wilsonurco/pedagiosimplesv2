# Mover validação de telefone (SMS) da Etapa 1 para a Etapa 3 do cadastro

**Data:** 2026-07-13
**Status:** Aprovado para implementação

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

## 3. Escopo por etapa

### Etapa 1 — "Dados pessoais" (sem SMS)
- Mantém: CPF, data de nascimento, nome, email, telefone (formatação e validação de DDD/9º dígito, como hoje), checkbox de termos.
- Remove: o texto "Celular válido — enviaremos um SMS para confirmar" e todo o gate de confirmação por código.
- O botão "Continuar" avança para a Etapa 2 assim que CPF válido, nome, email (formato válido), telefone (formato válido) e termos estiverem OK — sem a interceptação que hoje troca o botão para "Enviar código por SMS".

### Etapa 2 — "Senha e confirmação"
Sem mudanças.

### Etapa 3 — passa a se chamar "Confirmar veículo e telefone"
- Ordem interna: campo de placa primeiro (como hoje), depois o bloco de telefone + validação por SMS (reaproveitando a UI e o modal existentes, apenas realocados).
- O botão principal replica o padrão que hoje existe na Etapa 1: quando o telefone tem formato válido mas o código ainda não foi enviado, o botão vira "Enviar código por SMS"; depois que o código é confirmado (`codigoValido === true`), o botão volta a ser "Criar conta e prosseguir", agora exigindo placa válida **e** SMS confirmado.
- "Criar conta sem vincular este veículo": fica **desabilitado até `codigoValido === true`**, independente do estado da placa. Enquanto desabilitado por esse motivo, mostra uma dica curta (ex.: "Confirme seu telefone para continuar").

## 4. Barra de progresso

- Etapa 1 (0–33%): recalculada sobre 5 campos (CPF, nascimento, nome, email, termos) — sem telefone/SMS.
- Etapa 2 (33–66%): sem mudanças.
- Etapa 3 (66–100%): passa a considerar placa válida **e** telefone confirmado por SMS para chegar a 100%.

## 5. Duplicação a atualizar

A lógica de validade/gating do telefone hoje existe em 3 lugares dentro de `CadastroUsuario.tsx`, todos amarrados a `etapaAtual === 1`:
1. `isCurrentStepValid()` (bloco da etapa 1)
2. `validateCurrentStep()` (bloco da etapa 1)
3. O bloco inline `disabled`/`className`/`onClick` do botão principal (que hoje duplica a mesma expressão de validade do telefone e o intercept de envio de SMS)

Essa lógica precisa ser movida — não duplicada — para o bloco da etapa 3, incluindo o intercept em `handleNextStep()`/`onClick` que hoje dispara `enviarCodigoValidacao()` quando `etapaAtual === 1 && telefoneValido === true && !codigoEnviado`. O `handleSubmit()` final (e `handleSubmitSemVeiculo()`) passam a checar a condição combinada `(!codigoEnviado && telefoneValido === true) || (codigoEnviado && codigoValido === true)` antes de criar a conta.

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
