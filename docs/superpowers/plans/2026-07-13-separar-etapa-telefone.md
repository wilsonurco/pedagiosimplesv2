# Separar telefone/SMS em uma 4ª etapa própria — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No cadastro de usuário (`CadastroUsuario.tsx`), separar a Etapa 3 atual (que hoje mistura placa e telefone/SMS na mesma tela) em duas etapas distintas: Etapa 3 "Confirmar veículo" (só placa) e uma nova Etapa 4 "Confirmar telefone" (telefone + SMS, único gate final antes de criar a conta). O wizard passa de 3 para 4 etapas.

**Architecture:** Continua contido a `src/components/CadastroUsuario.tsx`. Isto é uma correção de uma mudança anterior (que já moveu telefone/SMS da Etapa 1 para dentro da Etapa 3) — agora o telefone sai da Etapa 3 e ganha sua própria etapa. Como o `formData` é um objeto plano sem namespace por etapa, mover o campo entre etapas é só questão de mover blocos de JSX e de lógica de validação — não requer mudança de shape de dados, exceto adicionar `pularCadastroVeiculo: false` ao estado inicial (hoje só era adicionado ad-hoc no submit do bypass).

**Tech Stack:** React + TypeScript, Vite, Tailwind, ícones `lucide-react`. Sem state management externo.

## Global Constraints

- Não adicionar dependências novas.
- Não alterar o mecanismo mock de SMS (código fixo `"123456"`, delay de 2s, modal existente) — reaproveitar, não duplicar.
- Não alterar a Etapa 1 nem a Etapa 2 (senha).
- Manter os tokens de cor existentes (`#5B2E8C`, `#0E8B5A`, `#C8324A`, `#8A8B95`) — não introduzir cores novas.
- `npm run build` deve passar sem warning/erro novo.
- Sem testes de componente neste projeto (só `vitest` para funções puras em `src/utils/*.test.ts`) — verificação é por type-check (`npm run build`) + roteiro manual no browser.
- Requisito comportamental chave: o botão "Criar conta sem vincular este veículo" (agora na Etapa 3) **não cria mais a conta diretamente** — ele pula a exigência de placa e avança para a Etapa 4, onde o telefone ainda precisa ser confirmado por SMS antes da conta ser criada de fato. A verificação de telefone nunca pode ser pulada, com ou sem veículo vinculado.

---

### Task 1: Dividir a Etapa 3 em "Confirmar veículo" (placa) + nova Etapa 4 "Confirmar telefone"

**Files:**
- Modify: `src/components/CadastroUsuario.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores (plano novo, primeira e única task).
- Produces: wizard de 4 etapas funcional; `handlePularVeiculo()` (substitui `handleSubmitSemVeiculo()`) como novo nome/comportamento — não é consumido por nenhum outro arquivo, só usado internamente no próprio componente.

- [ ] **Step 1: Adicionar `pularCadastroVeiculo` ao estado inicial do formData**

Em `src/components/CadastroUsuario.tsx`, no `useState` do `formData` (por volta da linha 22-33), troque:

```tsx
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: '',
    placa: '',
    aceitaTermos: false,
    aceitaNewsletter: false
  });
```

por:

```tsx
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: '',
    placa: '',
    aceitaTermos: false,
    aceitaNewsletter: false,
    pularCadastroVeiculo: false
  });
```

- [ ] **Step 2: Atualizar `isCurrentStepValid()` — separar placa (etapa 3) de telefone (etapa 4)**

Ache o bloco `else if (etapaAtual === 3) { ... }` dentro de `isCurrentStepValid()` (por volta da linha 471-479):

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
    return true;
  };
```

Troque por:

```tsx
    } else if (etapaAtual === 3) {
      // Placa
      if (!formData.placa.trim()) return false;
      const placaValidacao = validarPlaca(formData.placa);
      if (!placaValidacao.isValid) return false;
    } else if (etapaAtual === 4) {
      // Telefone — precisa ter código SMS confirmado
      const telefoneValido_check = (!codigoEnviado && telefoneValido === true) || (codigoEnviado && codigoValido === true);
      return telefoneValido_check;
    }
    return true;
  };
```

- [ ] **Step 3: Atualizar `validateCurrentStep()` — mesma separação**

Ache o bloco `} else if (etapaAtual === 3) { ... }` dentro de `validateCurrentStep()` (por volta da linha 511-526):

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
    } else if (etapaAtual === 4) {
      // Telefone (SMS)
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      else if (telefoneValido === false) newErrors.telefone = 'Insira um celular válido com DDD (ex: (11) 98765-4321)';
      else if (!codigoEnviado && telefoneValido !== true) newErrors.telefone = 'Aguarde a validação do telefone';
      else if (codigoEnviado && codigoValido !== true) newErrors.telefone = 'Confirme o código enviado por SMS';
    }
```

- [ ] **Step 4: Atualizar `progressoCalculado` para 4 faixas de 25%**

Troque o `useMemo` inteiro (por volta da linha 532-572) por:

```tsx
  const progressoCalculado = useMemo(() => {
    let progress = 0;

    if (etapaAtual === 1) {
      // Etapa 1: 0% a 25%
      let fieldsCompleted = 0;
      const totalFields = 5;
      if (formData.cpf.trim() && cpfValido === true) fieldsCompleted++;
      if (formData.dataNascimento.trim() && formData.dataNascimento.replace(/\D/g, '').length === 8) fieldsCompleted++;
      if (formData.nome.trim()) fieldsCompleted++;
      if (formData.email.trim() && emailValido !== false) fieldsCompleted++;
      if (formData.aceitaTermos) fieldsCompleted++;
      progress = (fieldsCompleted / totalFields) * 25;

    } else if (etapaAtual === 2) {
      // Etapa 2: 25% a 50% (Senha)
      progress = 25;
      const calcularReq = (senha: string) => ({
        tamanho: senha.length >= 8,
        maiuscula: /[A-Z]/.test(senha),
        minuscula: /[a-z]/.test(senha),
        numero: /\d/.test(senha),
        especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
      });
      let fieldsCompleted = 0;
      if (formData.senha && Object.values(calcularReq(formData.senha)).every(Boolean)) fieldsCompleted++;
      if (formData.senha && formData.confirmarSenha && formData.senha === formData.confirmarSenha) fieldsCompleted++;
      progress += (fieldsCompleted / 2) * 25;

    } else if (etapaAtual === 3) {
      // Etapa 3: 50% a 75% (Placa)
      progress = 50;
      if (formData.placa.trim()) {
        const placaValidacaoLocal = validarPlaca(formData.placa);
        progress = placaValidacaoLocal.isValid ? 75 : 62;
      }

    } else if (etapaAtual === 4) {
      // Etapa 4: 75% a 100% (Telefone confirmado por SMS)
      progress = 75;
      if (formData.telefone.trim() && codigoValido === true) {
        progress = 100;
      }
    }

    return Math.max(0, Math.min(100, progress));
  }, [etapaAtual, formData.nome, formData.email, formData.telefone, formData.cpf, formData.aceitaTermos, formData.senha, formData.confirmarSenha, formData.placa, emailValido, cpfValido, telefoneValido, codigoValido, formData.dataNascimento]);
```

- [ ] **Step 5: Substituir `handleSubmitSemVeiculo` por `handlePularVeiculo`**

Troque a função (por volta da linha 607-614):

```tsx
  const handleSubmitSemVeiculo = () => {
    setLoading(true);
    // Cria a conta sem vincular o veículo consultado
    setTimeout(() => {
      setLoading(false);
      onCadastrar({ ...formData, placa: '', pularCadastroVeiculo: true });
    }, 1500);
  };
```

por:

```tsx
  const handlePularVeiculo = () => {
    // Não cria a conta ainda — só pula a exigência de placa e avança para a
    // etapa de confirmação de telefone, que continua obrigatória.
    setFormData(prev => ({ ...prev, placa: '', pularCadastroVeiculo: true }));
    setEtapaAtual(4);
  };
```

- [ ] **Step 6: Atualizar `getStepTitle()` e `getStepIcon()`**

Troque (por volta da linha 616-632):

```tsx
  const getStepTitle = () => {
    switch (etapaAtual) {
      case 1: return 'Dados pessoais';
      case 2: return 'Senha e confirmação';
      case 3: return 'Confirmar veículo e telefone';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (etapaAtual) {
      case 1: return <User className="h-6 w-6 text-[#5B2E8C]" />;
      case 2: return <Lock className="h-6 w-6 text-[#5B2E8C]" />;
      case 3: return <Car className="h-6 w-6 text-[#5B2E8C]" />;
      default: return null;
    }
  };
```

por:

```tsx
  const getStepTitle = () => {
    switch (etapaAtual) {
      case 1: return 'Dados pessoais';
      case 2: return 'Senha e confirmação';
      case 3: return 'Confirmar veículo';
      case 4: return 'Confirmar telefone';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (etapaAtual) {
      case 1: return <User className="h-6 w-6 text-[#5B2E8C]" />;
      case 2: return <Lock className="h-6 w-6 text-[#5B2E8C]" />;
      case 3: return <Car className="h-6 w-6 text-[#5B2E8C]" />;
      case 4: return <Smartphone className="h-6 w-6 text-[#5B2E8C]" />;
      default: return null;
    }
  };
```

- [ ] **Step 7: Atualizar o cabeçalho "Etapa X de 3" e o `onSubmit` do form**

Ache (por volta da linha 676):

```tsx
              <span className="text-sm font-medium text-[#1A1B23]">
                Etapa {etapaAtual} de 3
              </span>
```

Troque por:

```tsx
              <span className="text-sm font-medium text-[#1A1B23]">
                Etapa {etapaAtual} de 4
              </span>
```

Ache (por volta da linha 694):

```tsx
              <form onSubmit={etapaAtual === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
```

Troque por:

```tsx
              <form onSubmit={etapaAtual === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
```

- [ ] **Step 8: Remover o bloco de telefone da Etapa 3 (JSX)**

Dentro de `{etapaAtual === 3 && (...)}` (por volta da linha 1117-1226), ache o bloco `{/* Telefone */}` que vem logo depois do campo de placa (por volta da linha 1179-1223):

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

                  </div>
                )}
```

Troque por (remove o bloco de telefone, mantém só o fechamento da etapa):

```tsx
                  </div>
                )}
```

(O restante da Etapa 3 acima disso — a mensagem explicativa "Veículo consultado" e o campo de placa — não muda.)

- [ ] **Step 9: Inserir a nova Etapa 4 (JSX), logo depois do bloco da Etapa 3**

Imediatamente depois do `)}` que fecha `{etapaAtual === 3 && (...)}` (resultado do Step 8) e antes do comentário `{/* Botões de navegação */}`, insira:

```tsx
                {/* Etapa 4: Confirmação do Telefone */}
                {etapaAtual === 4 && (
                  <div className="space-y-6">
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
                  </div>
                )}
```

Não adicione nenhum banner explicativo extra nesta etapa — só o campo de telefone, igual ao que existia dentro da Etapa 3.

- [ ] **Step 10: Reescrever o bloco de botões de navegação**

Troque o bloco inteiro `{/* Botões de navegação */}` `<div className="pt-6">...</div>` (por volta da linha 1229-1301, incluindo o `<Button>` de "Continuar", o `<Button>` final de "Criar conta e prosseguir" e o link "Criar conta sem vincular este veículo") por:

```tsx
                {/* Botões de navegação */}
                <div className="pt-6">
                  {etapaAtual < 4 ? (
                    <>
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

                      {etapaAtual === 3 && (
                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={handlePularVeiculo}
                            className="text-sm text-[#8A8B95] hover:text-[#5B2E8C] underline underline-offset-2 transition-colors"
                          >
                            Criar conta sem vincular este veículo
                          </button>
                          <p className="text-xs text-[#C6C7CF] mt-1.5">
                            Você poderá cadastrar veículos depois pelo dashboard
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
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
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Criar conta e prosseguir
                          </>
                        )
                      }
                    </Button>
                  )}
                </div>
```

Note que o link "Criar conta sem vincular este veículo" saiu do bloco final (que hoje é o `etapaAtual === 3`) e passou a aparecer só quando `etapaAtual === 3` dentro do ramo `etapaAtual < 4` — ele não existe mais na Etapa 4. O ícone do botão final trocou de `<Car .../>` para `<CheckCircle .../>` porque esse botão agora finaliza o cadastro a partir da etapa de telefone, não da etapa de veículo.

- [ ] **Step 11: Type-check**

```bash
npm run build
```
Esperado: build conclui sem erro/warning novo.

- [ ] **Step 12: Verificação manual — roteiro completo**

Rode `npm run dev` e percorra:

1. Landing → consultar uma placa de teste → "Criar conta".
2. Etapa 1 → Etapa 2 (senha) → normal, sem mudanças.
3. Etapa 3 ("Confirmar veículo"): só o campo de placa aparece, sem telefone. Barra de progresso mostra "Etapa 3 de 4". Com placa válida, "Continuar" avança para a Etapa 4.
4. Etapa 4 ("Confirmar telefone"): campo de telefone + fluxo de SMS (igual ao que existia antes na Etapa 3). Enviar/confirmar o código `123456` no modal e clicar em "Criar conta e prosseguir" — conta é criada.
5. Repita até a Etapa 3 numa nova sessão e clique em "Criar conta sem vincular este veículo": deve avançar direto para a Etapa 4 (sem criar a conta ainda) — só lá, depois do SMS confirmado, é que "Criar conta e prosseguir" cria a conta de fato.
6. Confira a barra de progresso em cada etapa: 0–25% (etapa 1), 25–50% (etapa 2), 50–75% (etapa 3), 75–100% (etapa 4, só chega a 100% com SMS confirmado).

- [ ] **Step 13: Commit**

```bash
git add src/components/CadastroUsuario.tsx
git commit -m "$(cat <<'EOF'
feat(cadastro): separa confirmação de telefone em uma 4ª etapa própria

A Etapa 3 (antes misturando placa e telefone/SMS na mesma tela) volta a
ser só sobre o veículo; o telefone ganha uma Etapa 4 dedicada, como
último gate antes de criar a conta. O atalho "criar conta sem vincular
veículo" agora só pula a placa — o telefone continua obrigatório.
EOF
)"
```
