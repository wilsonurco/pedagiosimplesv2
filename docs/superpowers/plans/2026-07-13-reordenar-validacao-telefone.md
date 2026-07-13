# Mover validação de telefone (SMS) da Etapa 1 para a Etapa 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No cadastro de usuário (`CadastroUsuario.tsx`), mover a validação de telefone por SMS da Etapa 1 ("Dados pessoais") para a Etapa 3 ("Confirmar veículo"), que passa a se chamar "Confirmar veículo e telefone" — o telefone continua visível/editável na Etapa 1 (preenchido via CPF, só com validação de formato), mas a confirmação por código SMS só acontece depois da placa, na última etapa.

**Architecture:** Mudança contida a um único componente React (`src/components/CadastroUsuario.tsx`). Não há state machine nem arquivo de config de steps — cada etapa é um bloco condicional `{etapaAtual === N && (...)}` dentro do mesmo render, e a lógica de validade/gating por etapa vive em `isCurrentStepValid()`, `validateCurrentStep()`, `progressoCalculado` e no botão principal. O trabalho é: (1) tirar o gate de SMS do bloco da etapa 1, (2) recolocar esse mesmo gate no bloco da etapa 3, reaproveitando as funções de envio/validação de SMS que já existem e são agnósticas de etapa (`enviarCodigoValidacao`, o modal de código, `reenviarCodigoDoModal`).

**Tech Stack:** React + TypeScript, Vite, Tailwind (classes utilitárias inline), ícones `lucide-react`. Sem framework de state management externo — tudo é `useState` local.

## Global Constraints

- Não adicionar dependências novas.
- Não alterar o mecanismo mock de SMS (código fixo `"123456"`, delay de 2s, modal existente) — spec §2 não-objetivos.
- Não alterar a Etapa 2 (senha) nem a consulta pública de débitos — spec §2 não-objetivos.
- Manter os tokens de cor existentes (`#5B2E8C` roxo primário, `#0E8B5A` verde sucesso, `#C8324A` vermelho erro, `#8A8B95` cinza texto secundário) — não introduzir cores novas.
- `npm run build` deve passar sem warning/erro novo após cada task.
- Este projeto **não tem testes de componente** (só `vitest` para funções puras em `src/utils/*.test.ts`, sem `@testing-library/react` instalado). Não introduzir infraestrutura de teste de componente como parte desta mudança — verificação é por type-check (`npm run build`) + roteiro manual no browser, seguindo o padrão já usado pela spec de 2026-05-16.

---

### Task 1: Remover o gate de SMS da Etapa 1 (telefone vira campo só de formato)

**Files:**
- Modify: `src/components/CadastroUsuario.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores (primeira task).
- Produces: `isCurrentStepValid()` e `validateCurrentStep()` com o bloco `etapaAtual === 1` sem depender de `codigoEnviado`/`codigoValido`; `handleNextStep()` sem o intercept de SMS; botão de "Continuar" (etapas 1 e 2) simplificado para usar só `isCurrentStepValid()` + `emailValidando`. A Task 2 depende dessas assinaturas simplificadas.

- [ ] **Step 1: Simplificar `isCurrentStepValid()` — bloco da etapa 1**

Em `src/components/CadastroUsuario.tsx`, localize o bloco `if (etapaAtual === 1) { ... }` dentro de `isCurrentStepValid()` (por volta da linha 444-458) e troque por:

```tsx
    if (etapaAtual === 1) {
      const camposObrigatoriosPreenchidos = (
        formData.nome.trim() &&
        formData.email.trim() &&
        formData.telefone.trim() &&
        formData.cpf.trim() &&
        formData.dataNascimento.trim() &&
        formData.aceitaTermos
      );
      const cpfValido_check = cpfValido === true;
      // Email só precisa ter formato válido (não exige código)
      const emailValido_check = emailValido !== false;
      // Telefone só precisa ter formato válido nesta etapa — a confirmação por SMS acontece na etapa 3
      const telefoneValido_check = telefoneValido === true;
      return camposObrigatoriosPreenchidos && cpfValido_check && emailValido_check && telefoneValido_check;
    } else if (etapaAtual === 2) {
```

(o restante do `else if (etapaAtual === 2) {...}` e do bloco `etapaAtual === 3` fica igual por enquanto — a Task 2 mexe no bloco 3).

- [ ] **Step 2: Simplificar `validateCurrentStep()` — bloco da etapa 1**

No mesmo arquivo, dentro de `validateCurrentStep()`, ache o trecho do telefone no bloco `etapaAtual === 1` (por volta da linha 489-492):

```tsx
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      else if (telefoneValido === false) newErrors.telefone = 'Insira um celular válido com DDD (ex: (11) 98765-4321)';
      else if (!codigoEnviado && telefoneValido !== true) newErrors.telefone = 'Aguarde a validação do telefone';
      else if (codigoEnviado && codigoValido !== true) newErrors.telefone = 'Confirme o código enviado por SMS';
```

Troque por (remove as duas últimas condições, que são sobre SMS):

```tsx
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      else if (telefoneValido === false) newErrors.telefone = 'Insira um celular válido com DDD (ex: (11) 98765-4321)';
```

- [ ] **Step 3: Simplificar o JSX do campo telefone na Etapa 1**

Ache o bloco `{/* Telefone */}` dentro de `{etapaAtual === 1 && (...)}` (por volta da linha 859-908) e troque o bloco inteiro por:

```tsx
                    {/* Telefone */}
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-[#1A1B23] flex items-center justify-between">
                        Telefone
                        {cpfAutoPreenchido.includes('telefone') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Preenchido via CPF
                          </span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id="telefone"
                          type="tel"
                          placeholder="(11) 98765-4321"
                          value={formData.telefone}
                          onChange={(e) => handleTelefoneChange(e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                            errors.telefone ? 'border-[#C8324A]' :
                            telefoneValido === true ? 'border-[#0E8B5A]' :
                            telefoneValido === false ? 'border-[#C8324A]' : ''
                          }`}
                          maxLength={15}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {telefoneValido === true && (
                            <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                          )}
                          {telefoneValido === false && (
                            <XCircle className="h-5 w-5 text-[#C8324A]" />
                          )}
                        </div>
                      </div>
                      {errors.telefone && <p className="text-sm text-[#C8324A]">{errors.telefone}</p>}
                      {telefoneValido === true && !errors.telefone && (
                        <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Telefone válido
                        </p>
                      )}
                    </div>
```

Isso remove o texto "Celular válido — enviaremos um SMS para confirmar", o ícone/estado de `codigoValido` e o `disabled={codigoValido === true}` do campo — nenhum deles faz sentido mais na etapa 1.

- [ ] **Step 4: Simplificar `progressoCalculado` — bloco da etapa 1**

Ache o bloco `if (etapaAtual === 1) { ... }` dentro do `useMemo` de `progressoCalculado` (por volta da linha 529-539) e troque por:

```tsx
    if (etapaAtual === 1) {
      // Etapa 1: 0% a 33%
      let fieldsCompleted = 0;
      const totalFields = 5;
      if (formData.cpf.trim() && cpfValido === true) fieldsCompleted++;
      if (formData.dataNascimento.trim() && formData.dataNascimento.replace(/\D/g, '').length === 8) fieldsCompleted++;
      if (formData.nome.trim()) fieldsCompleted++;
      if (formData.email.trim() && emailValido !== false) fieldsCompleted++;
      if (formData.aceitaTermos) fieldsCompleted++;
      progress = (fieldsCompleted / totalFields) * 33;

    } else if (etapaAtual === 2) {
```

- [ ] **Step 5: Simplificar `handleNextStep()`**

Troque a função inteira (linhas 568-588) por:

```tsx
  const handleNextStep = () => {
    // Aguardar validação de e-mail em progresso (etapa 1)
    if (etapaAtual === 1 && emailValidando) {
      return;
    }

    // Verificar se a etapa está válida usando a função mais simples
    if (isCurrentStepValid()) {
      setEtapaAtual(prev => prev + 1);
    } else {
      // Se não estiver válida, fazer validação completa para mostrar erros
      validateCurrentStep();
    }
  };
```

- [ ] **Step 6: Simplificar o botão de "Continuar" (etapas 1 e 2)**

Ache o bloco `{etapaAtual < 3 ? ( ... ) : ( ... )}` (por volta da linha 1193-1267). Troque **só o ramo `etapaAtual < 3`** (o `<Button type="submit" ...>` inteiro, do `disabled={...}` ao texto do botão) por:

```tsx
                  {etapaAtual < 3 ? (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!isCurrentStepValid() || emailValidando}
                      className={`w-full py-4 text-lg rounded-lg font-medium transition-colors ${
                        isCurrentStepValid() && !emailValidando
                          ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white'
                          : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                      }`}
                    >
                      Continuar <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
```

Não mexa no `) : ( ... )` (ramo da etapa 3) nesta task — isso é o Step do próximo task.

- [ ] **Step 7: Type-check**

Rode:
```bash
npm run build
```
Esperado: build conclui sem erro/warning novo (pode ignorar warnings pré-existentes não relacionados a este arquivo).

- [ ] **Step 8: Verificação manual rápida**

Rode `npm run dev`, abra o fluxo de cadastro (landing → consultar placa → resultados → "Criar conta"), preencha CPF válido (auto-preenche os demais campos) e confirme que:
- O campo Telefone aparece preenchido, sem nenhum texto sobre SMS.
- Aceitar os termos habilita "Continuar" sem exigir código nenhum.
- Ao avançar para a Etapa 2, tudo funciona como antes.

Isso é esperado ficar temporariamente **incompleto** (a Etapa 3 ainda não pede telefone) — será fechado na Task 2.

- [ ] **Step 9: Commit**

```bash
git add src/components/CadastroUsuario.tsx
git commit -m "$(cat <<'EOF'
refactor(cadastro): remove gate de SMS da Etapa 1

Telefone continua visível e editável na Etapa 1 (preenchido via CPF),
mas a confirmação por código SMS deixa de bloquear o avanço aqui —
ela é reintroduzida na Etapa 3 na próxima mudança.
EOF
)"
```

---

### Task 2: Adicionar telefone + validação por SMS à Etapa 3 e simplificar o botão final

**Files:**
- Modify: `src/components/CadastroUsuario.tsx`

**Interfaces:**
- Consumes: `isCurrentStepValid()`, `validateCurrentStep()`, `progressoCalculado`, `handleNextStep()` e o botão de "Continuar" já simplificados pela Task 1. Reaproveita `enviarCodigoValidacao()`, `reenviarCodigoDoModal()`, o modal `<Dialog>` de código SMS e o handler inline de validação do código (linhas ~1366-1401 no arquivo original) — nenhum desses muda de lugar ou de assinatura.
- Produces: fluxo completo de cadastro com telefone/SMS confirmado na Etapa 3, antes da criação da conta.

- [ ] **Step 1: Atualizar título da Etapa 3**

Em `getStepTitle()` (por volta da linha 617-624), troque:

```tsx
      case 3: return 'Confirmar veículo';
```

por:

```tsx
      case 3: return 'Confirmar veículo e telefone';
```

- [ ] **Step 2: Adicionar telefone ao bloco de validade da Etapa 3 em `isCurrentStepValid()`**

Ache o bloco `else if (etapaAtual === 3) { ... }` dentro de `isCurrentStepValid()` (por volta da linha 471-476):

```tsx
    } else if (etapaAtual === 3) {
      // Placa
      if (!formData.placa.trim()) return false;
      const placaValidacao = validarPlaca(formData.placa);
      if (!placaValidacao.isValid) return false;
    }
```

Troque por:

```tsx
    } else if (etapaAtual === 3) {
      // Placa
      if (!formData.placa.trim()) return false;
      const placaValidacao = validarPlaca(formData.placa);
      if (!placaValidacao.isValid) return false;
      // Telefone — precisa ter código SMS confirmado
      const telefoneValido_check = (!codigoEnviado && telefoneValido === true) || (codigoEnviado && codigoValido === true);
      if (!telefoneValido_check) return false;
    }
```

- [ ] **Step 3: Adicionar telefone ao bloco de validação da Etapa 3 em `validateCurrentStep()`**

Ache o bloco `} else if (etapaAtual === 3) { ... }` dentro de `validateCurrentStep()` (por volta da linha 510-519):

```tsx
    } else if (etapaAtual === 3) {
      // Placa
      if (!formData.placa.trim()) {
        newErrors.placa = 'Placa é obrigatória';
      } else {
        const placaValidacao = validarPlaca(formData.placa);
        if (!placaValidacao.isValid) {
          newErrors.placa = placaValidacao.error || 'Placa inválida';
        }
      }
    }
```

Troque por:

```tsx
    } else if (etapaAtual === 3) {
      // Placa
      if (!formData.placa.trim()) {
        newErrors.placa = 'Placa é obrigatória';
      } else {
        const placaValidacao = validarPlaca(formData.placa);
        if (!placaValidacao.isValid) {
          newErrors.placa = placaValidacao.error || 'Placa inválida';
        }
      }
      // Telefone (SMS)
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      else if (telefoneValido === false) newErrors.telefone = 'Insira um celular válido com DDD (ex: (11) 98765-4321)';
      else if (!codigoEnviado && telefoneValido !== true) newErrors.telefone = 'Aguarde a validação do telefone';
      else if (codigoEnviado && codigoValido !== true) newErrors.telefone = 'Confirme o código enviado por SMS';
    }
```

- [ ] **Step 4: Adicionar o bloco de telefone/SMS ao JSX da Etapa 3, depois da placa**

Ache o fechamento do campo de placa dentro de `{etapaAtual === 3 && (...)}` (o `</div>` que fecha `{/* Campo de Placa */}`, por volta da linha 1186, logo antes do `</div>` que fecha a etapa inteira, linha 1188). Insira o bloco abaixo **entre** o fechamento do campo de placa e o fechamento da etapa:

```tsx
                    {/* Telefone */}
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-[#1A1B23] flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-[#5B2E8C]" />
                        Telefone
                      </Label>
                      <div className="relative">
                        <Input
                          id="telefone"
                          type="tel"
                          placeholder="(11) 98765-4321"
                          value={formData.telefone}
                          onChange={(e) => handleTelefoneChange(e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                            errors.telefone ? 'border-[#C8324A]' :
                            codigoValido === true ? 'border-[#0E8B5A]' :
                            telefoneValido === true ? 'border-[#5B2E8C]' :
                            telefoneValido === false ? 'border-[#C8324A]' : ''
                          }`}
                          maxLength={15}
                          disabled={codigoValido === true}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {codigoValido === true && (
                            <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                          )}
                          {codigoValido !== true && telefoneValido === false && (
                            <XCircle className="h-5 w-5 text-[#C8324A]" />
                          )}
                        </div>
                      </div>
                      {errors.telefone && <p className="text-sm text-[#C8324A]">{errors.telefone}</p>}
                      {codigoValido === true && !errors.telefone && (
                        <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Telefone validado por SMS
                        </p>
                      )}
                      {telefoneValido === true && !codigoEnviado && !errors.telefone && (
                        <p className="text-sm text-[#5B2E8C] flex items-center gap-1">
                          <Smartphone className="h-4 w-4" />
                          Celular válido — enviaremos um SMS para confirmar
                        </p>
                      )}
                    </div>
```

- [ ] **Step 5: Adicionar telefone ao cálculo de progresso da Etapa 3**

Ache o bloco `} else if (etapaAtual === 3) { ... }` dentro de `progressoCalculado` (por volta da linha 556-563):

```tsx
    } else if (etapaAtual === 3) {
      // Etapa 3: 66% a 100% (Placa)
      progress = 66;
      if (formData.placa.trim()) {
        const placaValidacaoLocal = validarPlaca(formData.placa);
        progress = placaValidacaoLocal.isValid ? 100 : 83;
      }
    }
```

Troque por:

```tsx
    } else if (etapaAtual === 3) {
      // Etapa 3: 66% a 100% (Placa + Telefone confirmado por SMS)
      progress = 66;
      let fieldsCompleted = 0;
      const totalFields = 2;
      if (formData.placa.trim() && validarPlaca(formData.placa).isValid) fieldsCompleted++;
      if (formData.telefone.trim() && codigoValido === true) fieldsCompleted++;
      progress += (fieldsCompleted / totalFields) * 34;
    }
```

- [ ] **Step 6: Reescrever o botão final da Etapa 3 (com intercept de envio de SMS) e o link de bypass**

Ache o ramo `) : ( ... )` do `{etapaAtual < 3 ? (...) : (...)}` (por volta da linha 1267-1303 no arquivo original — o bloco que contém o `<Button type="submit">Criar conta e prosseguir</Button>` e o `<button>Criar conta sem vincular este veículo</button>`). Troque o bloco inteiro por:

```tsx
                  ) : (
                    <>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white py-4 text-lg rounded-lg font-medium transition-colors"
                        disabled={loading || emailValidando || validandoCodigo || !isCurrentStepValid()}
                        onClick={(e) => {
                          if (telefoneValido === true && !codigoEnviado) {
                            e.preventDefault();
                            enviarCodigoValidacao();
                          }
                        }}
                      >
                        {telefoneValido === true && !codigoEnviado
                          ? (emailValidando ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Enviando SMS...
                              </>
                            ) : (
                              <>
                                <Smartphone className="h-5 w-5 mr-2" />
                                Enviar código por SMS
                              </>
                            ))
                          : loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                              Criando conta...
                            </>
                          ) : (
                            <>
                              <Car className="h-5 w-5 mr-2" />
                              Criar conta e prosseguir
                            </>
                          )
                        }
                      </Button>

                      {/* Alternativa: criar conta sem vincular este veículo */}
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={handleSubmitSemVeiculo}
                          disabled={loading || codigoValido !== true}
                          className="text-sm text-[#8A8B95] hover:text-[#5B2E8C] underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#8A8B95]"
                        >
                          Criar conta sem vincular este veículo
                        </button>
                        <p className="text-xs text-[#C6C7CF] mt-1.5">
                          {codigoValido === true
                            ? 'Você poderá cadastrar veículos depois pelo dashboard'
                            : 'Confirme seu telefone para continuar'}
                        </p>
                      </div>
                    </>
                  )}
```

Note que `disabled={loading || !formData.aceitaTermos || !isCurrentStepValid()}` do botão original vira `disabled={loading || emailValidando || validandoCodigo || !isCurrentStepValid()}` — `formData.aceitaTermos` não precisa mais aparecer aqui explicitamente porque já é exigido para sair da Etapa 1 (não regride), e `emailValidando`/`validandoCodigo` evitam duplo-clique enquanto o SMS está sendo enviado/validado.

- [ ] **Step 7: Type-check**

```bash
npm run build
```
Esperado: build conclui sem erro/warning novo.

- [ ] **Step 8: Verificação manual — roteiro completo**

Rode `npm run dev` e percorra o fluxo completo:

1. Landing → consultar uma placa de teste (ex.: `ABC-1234`) → "Criar conta".
2. Etapa 1: CPF válido auto-preenche nome/nascimento/email/telefone; confirme que **não** aparece nada sobre SMS; aceite os termos; "Continuar" habilita e avança.
3. Etapa 2: preencha senha forte + confirmação; avança.
4. Etapa 3 (agora "Confirmar veículo e telefone"): confirme que a placa aparece primeiro, telefone logo abaixo. Com placa válida e telefone com formato válido, o botão principal deve virar "Enviar código por SMS".
5. Clique no botão — modal de SMS abre; digite `123456`; confirme que o campo telefone mostra "Telefone validado por SMS" e o botão volta a ser "Criar conta e prosseguir", agora habilitado.
6. Clique em "Criar conta e prosseguir" — conta é criada normalmente.
7. Repita o fluxo até a Etapa 3 numa nova sessão e teste "Criar conta sem vincular este veículo": deve estar **desabilitado** enquanto o SMS não foi confirmado, com a dica "Confirme seu telefone para continuar"; habilita e funciona assim que o código é validado.
8. Confira a barra de progresso: Etapa 1 chega a 33% sem depender do telefone; Etapa 3 só chega a 100% com placa válida **e** SMS confirmado.

- [ ] **Step 9: Commit**

```bash
git add src/components/CadastroUsuario.tsx
git commit -m "$(cat <<'EOF'
feat(cadastro): move validação de telefone por SMS para a Etapa 3

A confirmação do celular por código SMS passa a acontecer depois da
placa/veículo, como último gate antes de criar a conta — inclusive no
atalho "criar conta sem vincular veículo", que agora também exige o
telefone confirmado.
EOF
)"
```
