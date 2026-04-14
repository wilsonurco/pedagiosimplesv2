# Guia de Teste - Funcionalidade de Preenchimento Manual de CEP

## Como Testar a Funcionalidade

A funcionalidade de preenchimento manual de endereço foi implementada para permitir que usuários continuem o cadastro mesmo quando a API dos Correios não responder.

### Cenários de Teste:

#### 1. CEP Válido (funcionamento normal)
- Digite um CEP válido, por exemplo: `01310-100`
- Os campos de endereço serão preenchidos automaticamente
- Os campos permanecerão desabilitados (apenas visualização)

#### 2. CEP Não Encontrado (simulação de falha)
Para testar a funcionalidade de preenchimento manual, use CEPs que começam com **99999**:

**Exemplos de CEPs para simular erro:**
- `99999-000`
- `99999-100`
- `99999-999`

**O que acontece:**
1. Ao digitar um CEP começando com 99999, a API simulará uma falha
2. Aparecerá uma mensagem amarela informando que não foi possível buscar o endereço
3. Um botão "Preencher endereço manualmente" será exibido
4. Ao clicar no botão, todos os campos de endereço (Endereço, Bairro, Cidade, Estado) serão habilitados para edição manual
5. Uma mensagem azul confirmará que o modo manual está ativo

#### 3. Timeout da API
A consulta tem um timeout de 5 segundos. Se a API dos Correios demorar mais que isso, o sistema automaticamente oferecerá o preenchimento manual.

### Fluxo Completo de Teste:

1. Navegue até a página de cadastro
2. Preencha os dados pessoais (Etapa 1)
3. Continue para a Etapa 2 (Endereço)
4. Digite o CEP: `99999-000`
5. Aguarde a mensagem de erro aparecer
6. Clique em "Preencher endereço manualmente"
7. Preencha os campos manualmente:
   - Endereço: Rua Exemplo
   - Número: 123
   - Bairro: Centro
   - Cidade: São Paulo
   - Estado: SP
8. Continue o cadastro normalmente

### Observações:

- O campo **Número** sempre fica habilitado, independente do modo
- O campo **CEP** sempre fica habilitado
- Ao modificar o CEP após ativar o modo manual, o sistema reseta para tentar buscar automaticamente novamente
- A funcionalidade garante que o usuário nunca ficará bloqueado por problemas na API dos Correios
