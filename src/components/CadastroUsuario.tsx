import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ArrowLeft, User, Mail, Lock, Shield, CheckCircle, XCircle, Eye, EyeOff, Loader2, ArrowRight, Car } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { validarPlaca, formatarPlacaInput, isPlacaCompleta } from "../utils/placaValidation";

interface CadastroUsuarioProps {
  onBack: () => void;
  onCadastrar: (dados: any) => void;
  onLogin?: () => void;
  placaConsultada?: string;
}

export function CadastroUsuario({ onBack, onCadastrar, onLogin, placaConsultada }: CadastroUsuarioProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cpfBuscando, setCpfBuscando] = useState(false);
  const [cpfAutoPreenchido, setCpfAutoPreenchido] = useState<string[]>([]);
  const [emailValidando, setEmailValidando] = useState(false);
  const [emailValido, setEmailValido] = useState<boolean | null>(null);
  const [emailTimeout, setEmailTimeout] = useState<NodeJS.Timeout | null>(null);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoValidacao, setCodigoValidacao] = useState('');
  const [codigoCorreto, setCodigoCorreto] = useState('');
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [codigoValido, setCodigoValido] = useState<boolean | null>(null);
  const [tempoReenvio, setTempoReenvio] = useState(0);
  const [modalCodigoAberto, setModalCodigoAberto] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [forcaSenha, setForcaSenha] = useState<'fraca' | 'media' | 'forte' | null>(null);
  const [requisitosSenha, setRequisitosSenha] = useState({
    tamanho: false,
    maiuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  });

  // Sincronizar placa consultada quando o componente montar ou quando ela mudar
  useEffect(() => {
    if (placaConsultada && !formData.placa) {
      setFormData(prev => ({ ...prev, placa: placaConsultada }));
    }
  }, [placaConsultada]); // Remover formData.placa das dependências para evitar loops

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (cpfAutoPreenchido.includes(field)) {
      setCpfAutoPreenchido(prev => prev.filter(f => f !== field));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const buscarDadosCPF = async (cpf: string) => {
    setCpfBuscando(true);
    // Simulates Receita Federal CPF lookup (~1.5s delay)
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockDados = {
      nome: 'João da Silva Santos',
      dataNascimento: '15/03/1990',
      email: 'joao.silva@gmail.com',
      telefone: '(11) 98765-4321',
    };
    setFormData(prev => ({
      ...prev,
      nome: mockDados.nome,
      dataNascimento: mockDados.dataNascimento,
      email: mockDados.email,
      telefone: mockDados.telefone,
    }));
    // Mark email as pre-validated via CPF lookup
    setEmailValido(true);
    setErrors(prev => ({ ...prev, email: '', nome: '', dataNascimento: '', telefone: '' }));
    setCpfAutoPreenchido(['nome', 'dataNascimento', 'email', 'telefone']);
    setCpfBuscando(false);
  };

  const validateCPF = (cpf: string) => {
    // Remove formatação
    const numbers = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF deve ter 11 dígitos' }));
      return false;
    }

    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(numbers)) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    }

    // Validação do algoritmo do CPF
    let sum = 0;
    let remainder;

    // Valida primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(numbers.substring(9, 10))) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    }

    sum = 0;
    // Valida segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(numbers.substring(10, 11))) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    }

    // CPF válido
    setCpfValido(true);
    setErrors(prev => ({ ...prev, cpf: '' }));
    return true;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const validarEmail = async (email: string) => {
    // Regex avançado para validação de formato
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      setEmailValido(false);
      setErrors(prev => ({ ...prev, email: 'Formato de e-mail inválido' }));
      return;
    }

    setEmailValidando(true);
    setErrors(prev => ({ ...prev, email: '' }));

    try {
      // Validações adicionais mais robustas
      const domain = email.split('@')[1];
      
      // Lista de domínios temporários/descartáveis mais comuns
      const disposableEmailDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
        'mailinator.com', 'temp-mail.org', 'throwaway.email',
        'getnada.com', 'tempmailaddress.com', 'dispostable.com'
      ];

      if (disposableEmailDomains.includes(domain.toLowerCase())) {
        setEmailValido(false);
        setErrors(prev => ({ ...prev, email: 'E-mails temporários não são permitidos' }));
        return;
      }

      // Verificar se o domínio tem formato válido
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        setEmailValido(false);
        setErrors(prev => ({ ...prev, email: 'Domínio do e-mail inválido' }));
        return;
      }

      // Simulação de verificação de domínio (em produção, usaria uma API real)
      // Por agora, vamos aceitar domínios conhecidos e populares
      const commonDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
        'uol.com.br', 'bol.com.br', 'terra.com.br', 'globo.com',
        'live.com', 'icloud.com', 'me.com', 'protonmail.com',
        'company.com', 'empresa.com.br' // Domínios corporativos genéricos
      ];

      // Se for um domínio comum, aceitar imediatamente
      if (commonDomains.includes(domain.toLowerCase())) {
        setEmailValido(true);
        setErrors(prev => ({ ...prev, email: '' }));
        return;
      }

      // Para outros domínios, simular uma verificação (em produção seria uma API real)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de API
      
      // Simular 90% de sucesso para domínios não conhecidos
      const isValid = Math.random() > 0.1;
      
      if (isValid) {
        setEmailValido(true);
        setErrors(prev => ({ ...prev, email: '' }));
      } else {
        setEmailValido(false);
        setErrors(prev => ({ ...prev, email: 'Não foi possível verificar este e-mail' }));
      }

    } catch (error) {
      setEmailValido(false);
      setErrors(prev => ({ ...prev, email: 'Erro ao validar e-mail. Tente novamente.' }));
    } finally {
      setEmailValidando(false);
    }
  };

  const handleEmailChange = (email: string) => {
    handleInputChange('email', email);
    
    // Reset estados de validação
    setEmailValido(null);
    setEmailValidando(false);
    setCodigoEnviado(false);
    setCodigoValidacao('');
    setCodigoCorreto('');
    setCodigoValido(null);
    setTempoReenvio(0);
    setModalCodigoAberto(false); // Fechar modal se estiver aberto
    
    // Limpar timeout anterior
    if (emailTimeout) {
      clearTimeout(emailTimeout);
    }
    
    // Se email estiver vazio, não validar
    if (!email.trim()) {
      setEmailValido(null);
      return;
    }
    
    // Debounce: aguardar 800ms após parar de digitar para validar
    const newTimeout = setTimeout(() => {
      validarEmail(email);
    }, 800);
    
    setEmailTimeout(newTimeout);
  };

  // Função para enviar código de validação por email
  const enviarCodigoValidacao = async () => {
    setEmailValidando(true);
    
    // Gerar código de 6 dígitos (fixo para facilitar testes)
    const codigo = "123456";
    setCodigoCorreto(codigo);
    
    // Simular envio por email
    setTimeout(() => {
      setEmailValidando(false);
      setCodigoEnviado(true);
      setModalCodigoAberto(true); // Abrir modal
      
      // Iniciar contagem regressiva para reenvio (60 segundos)
      setTempoReenvio(60);
      const interval = setInterval(() => {
        setTempoReenvio(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);
  };

  // Função para validar código inserido
  const validarCodigo = async () => {
    if (codigoValidacao.length !== 6) return;
    
    setValidandoCodigo(true);
    
    // Simular validação do código
    setTimeout(() => {
      const valido = codigoValidacao === codigoCorreto;
      setCodigoValido(valido);
      // Importante: quando código é validado, o email também deve ser considerado válido
      if (valido) {
        setEmailValido(true);
        setModalCodigoAberto(false); // Fechar modal quando válido
      }
      setValidandoCodigo(false);
      
      if (!valido) {
        setErrors(prev => ({ ...prev, codigoValidacao: 'Código inválido. Verifique e tente novamente.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.codigoValidacao;
          delete newErrors.email; // Limpar também erro de email
          return newErrors;
        });
      }
    }, 1500);
  };

  // Função para reenviar código do modal
  const reenviarCodigoDoModal = () => {
    // Gerar novo código
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoCorreto(novoCodigo);
    setCodigoValidacao(''); // Limpar campo
    setErrors(prev => ({ ...prev, codigoValidacao: '' })); // Limpar erros
    
    // Reiniciar contagem regressiva
    setTempoReenvio(60);
    const interval = setInterval(() => {
      setTempoReenvio(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validarForcaSenha = (senha: string) => {
    const requisitos = {
      tamanho: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
    };

    setRequisitosSenha(requisitos);

    // Calcular força da senha
    const requisitosAtendidos = Object.values(requisitos).filter(Boolean).length;
    
    if (requisitosAtendidos < 3) {
      setForcaSenha('fraca');
    } else if (requisitosAtendidos === 3 || requisitosAtendidos === 4) {
      setForcaSenha('media');
    } else if (requisitosAtendidos === 5) {
      setForcaSenha('forte');
    }

    return requisitos;
  };

  const handleSenhaChange = (senha: string) => {
    handleInputChange('senha', senha);
    
    if (senha.length > 0) {
      validarForcaSenha(senha);
    } else {
      setForcaSenha(null);
      setRequisitosSenha({
        tamanho: false,
        maiuscula: false,
        minuscula: false,
        numero: false,
        especial: false
      });
    }
  };

  const isCurrentStepValid = () => {
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
      const emailValido_check = (!codigoEnviado && emailValido === true) || (codigoEnviado && codigoValido === true);
      return camposObrigatoriosPreenchidos && cpfValido_check && emailValido_check;
    } else if (etapaAtual === 2) {
      // Senha
      if (!formData.senha) return false;
      const req = {
        tamanho: formData.senha.length >= 8,
        maiuscula: /[A-Z]/.test(formData.senha),
        minuscula: /[a-z]/.test(formData.senha),
        numero: /\d/.test(formData.senha),
        especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.senha)
      };
      if (!Object.values(req).every(Boolean)) return false;
      if (formData.senha !== formData.confirmarSenha) return false;
    } else if (etapaAtual === 3) {
      // Placa
      if (!formData.placa.trim()) return false;
      const placaValidacao = validarPlaca(formData.placa);
      if (!placaValidacao.isValid) return false;
    }
    return true;
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (etapaAtual === 1) {
      if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
      if (!formData.dataNascimento.trim()) newErrors.dataNascimento = 'Data de nascimento é obrigatória';
      else if (formData.dataNascimento.replace(/\D/g, '').length !== 8) newErrors.dataNascimento = 'Data inválida — use DD/MM/AAAA';
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
      else if (!codigoEnviado && emailValido === false) newErrors.email = 'Email inválido ou não verificado';
      else if (!codigoEnviado && emailValido === null && formData.email.trim()) newErrors.email = 'Aguarde a validação do e-mail';
      else if (codigoEnviado && emailValido !== true) newErrors.email = 'Código de validação deve ser confirmado';
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
      else if (cpfValido === false) newErrors.cpf = 'CPF inválido';
      else if (cpfValido === null && formData.cpf.trim()) newErrors.cpf = 'Aguarde a validação do CPF';
      if (!formData.aceitaTermos) newErrors.aceitaTermos = 'Você deve aceitar os termos de uso';
    } else if (etapaAtual === 2) {
      // Senha
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else {
        const requisitos = validarForcaSenha(formData.senha);
        if (!Object.values(requisitos).every(Boolean)) {
          newErrors.senha = 'Senha não atende aos critérios de segurança';
        }
      }
      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const progressoCalculado = useMemo(() => {
    let progress = 0;

    if (etapaAtual === 1) {
      // Etapa 1: 0% a 33%
      let fieldsCompleted = 0;
      const totalFields = 6;
      if (formData.cpf.trim() && cpfValido === true) fieldsCompleted++;
      if (formData.dataNascimento.trim() && formData.dataNascimento.replace(/\D/g, '').length === 8) fieldsCompleted++;
      if (formData.nome.trim()) fieldsCompleted++;
      if (formData.email.trim() && emailValido === true) fieldsCompleted++;
      if (formData.telefone.trim()) fieldsCompleted++;
      if (formData.aceitaTermos) fieldsCompleted++;
      progress = (fieldsCompleted / totalFields) * 33;

    } else if (etapaAtual === 2) {
      // Etapa 2: 33% a 66% (Senha)
      progress = 33;
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
      progress += (fieldsCompleted / 2) * 33;

    } else if (etapaAtual === 3) {
      // Etapa 3: 66% a 100% (Placa)
      progress = 66;
      if (formData.placa.trim()) {
        const placaValidacaoLocal = validarPlaca(formData.placa);
        progress = placaValidacaoLocal.isValid ? 100 : 83;
      }
    }

    return Math.max(0, Math.min(100, progress));
  }, [etapaAtual, formData.nome, formData.email, formData.telefone, formData.cpf, formData.aceitaTermos, formData.senha, formData.confirmarSenha, formData.placa, emailValido, cpfValido, formData.dataNascimento]);

  const handleNextStep = () => {
    // Aguardar validação do email se ainda estiver em progresso
    if (etapaAtual === 1 && (emailValidando || validandoCodigo)) {
      setErrors(prev => ({ ...prev, email: 'Aguarde a validação do e-mail' }));
      return;
    }

    // Se estiver na etapa 1 e o email for válido mas não enviou código ainda
    if (etapaAtual === 1 && emailValido === true && !codigoEnviado) {
      enviarCodigoValidacao();
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

  const handlePreviousStep = () => {
    setEtapaAtual(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;

    setLoading(true);
    
    // Simular criação de conta
    setTimeout(() => {
      setLoading(false);
      onCadastrar(formData);
    }, 2000);
  };

  const getStepTitle = () => {
    switch (etapaAtual) {
      case 1: return 'Dados pessoais';
      case 2: return 'Senha e confirmação';
      case 3: return 'Confirmar veículo';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5FB] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F7F5FB] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={etapaAtual === 1 ? onBack : handlePreviousStep}
              className="flex items-center gap-2 text-[#8A8B95] hover:text-[#5B2E8C] hover:bg-[#F7F5FB]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5B2E8C] rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#5B2E8C]">Pedágio Simples</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Título da seção */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#F7F5FB] text-[#8B5FFF] rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold">CADASTRO SEGURO</span>
            </div>

            <p className="text-lg text-[#8A8B95]">
              Para prosseguir com o pagamento, precisamos de algumas informações
            </p>
          </div>

          {/* Indicador de Progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#1A1B23]">
                Etapa {etapaAtual} de 3
              </span>
              <span className="text-sm text-[#8A8B95]">
                {Math.round(progressoCalculado)}% concluído
              </span>
            </div>
            <Progress value={progressoCalculado} className="h-2" />
          </div>

          {/* Formulário */}
          <Card className="shadow-lg border border-[#F7F5FB] rounded-lg">
            <CardHeader className="text-center pb-1 pt-4">
              <CardTitle className="text-xl text-[#1A1B23] flex items-center justify-center gap-3">
                {getStepIcon()}
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={etapaAtual === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                
                {/* Etapa 1: Dados Pessoais */}
                {etapaAtual === 1 && (
                  <div className="space-y-6">
                    {/* CPF */}
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-[#1A1B23]">CPF</Label>
                      <div className="relative">
                        <Input
                          id="cpf"
                          placeholder="Digite seu CPF"
                          value={formData.cpf}
                          onChange={(e) => {
                            const cpfFormatado = formatCPF(e.target.value);
                            handleInputChange('cpf', cpfFormatado);
                            
                            // Reset estados de validação
                            setCpfValido(null);
                            
                            // Validar automaticamente quando CPF estiver completo
                            if (cpfFormatado.replace(/\D/g, '').length === 11) {
                              const valido = validateCPF(cpfFormatado);
                              if (valido) buscarDadosCPF(cpfFormatado);
                            } else if (cpfFormatado.replace(/\D/g, '').length > 0) {
                              setErrors(prev => ({ ...prev, cpf: '' }));
                            }
                          }}
                          className={`text-lg py-3 pr-12 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                            errors.cpf ? 'border-[#C8324A]' : 
                            cpfValido === true ? 'border-[#0E8B5A]' : 
                            cpfValido === false ? 'border-[#C8324A]' : ''
                          }`}
                          maxLength={14}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {cpfBuscando && (
                            <Loader2 className="h-5 w-5 animate-spin text-[#5B2E8C]" />
                          )}
                          {!cpfBuscando && cpfValido === true && (
                            <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                          )}
                          {!cpfBuscando && cpfValido === false && (
                            <XCircle className="h-5 w-5 text-[#C8324A]" />
                          )}
                        </div>
                      </div>
                      {errors.cpf && <p className="text-sm text-[#C8324A]">{errors.cpf}</p>}
                      {cpfBuscando && (
                        <p className="text-sm text-[#5B2E8C] flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Buscando seus dados...
                        </p>
                      )}
                      {cpfValido === true && !errors.cpf && !cpfBuscando && (
                        <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          CPF válido
                        </p>
                      )}
                    </div>

                    {/* Data de nascimento */}
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento" className="text-[#1A1B23] flex items-center justify-between">
                        Data de nascimento
                        {cpfAutoPreenchido.includes('dataNascimento') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Preenchido via CPF
                          </span>
                        )}
                      </Label>
                      <Input
                        id="dataNascimento"
                        placeholder="Sua data de nascimento"
                        value={formData.dataNascimento}
                        onChange={(e) => handleInputChange('dataNascimento', formatDate(e.target.value))}
                        className={`text-lg py-3 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                          errors.dataNascimento ? 'border-[#C8324A]' :
                          cpfAutoPreenchido.includes('dataNascimento') ? 'border-[#8B5FFF]/60' : ''
                        }`}
                        maxLength={10}
                      />
                      {errors.dataNascimento && <p className="text-sm text-[#C8324A]">{errors.dataNascimento}</p>}
                    </div>

                    {/* Nome completo */}
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-[#1A1B23] flex items-center justify-between">
                        Nome completo
                        {cpfAutoPreenchido.includes('nome') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Preenchido via CPF
                          </span>
                        )}
                      </Label>
                      <Input
                        id="nome"
                        placeholder="Digite seu nome completo"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className={`text-lg py-3 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                          errors.nome ? 'border-[#C8324A]' :
                          cpfAutoPreenchido.includes('nome') ? 'border-[#8B5FFF]/60' : ''
                        }`}
                      />
                      {errors.nome && <p className="text-sm text-[#C8324A]">{errors.nome}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#1A1B23] flex items-center justify-between">
                        Email
                        {cpfAutoPreenchido.includes('email') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Preenchido via CPF
                          </span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Digite seu e-mail"
                          value={formData.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                            errors.email ? 'border-[#C8324A]' : 
                            emailValido === true ? 'border-[#0E8B5A]' : 
                            emailValido === false ? 'border-[#C8324A]' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailValidando && (
                            <Loader2 className="h-5 w-5 animate-spin text-[#5B2E8C]" />
                          )}
                          {!emailValidando && emailValido === true && (
                            <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                          )}
                          {!emailValidando && emailValido === false && (
                            <XCircle className="h-5 w-5 text-[#C8324A]" />
                          )}
                        </div>
                      </div>
                      {errors.email && <p className="text-sm text-[#C8324A]">{errors.email}</p>}
                      {(emailValido === true || (codigoEnviado && codigoValido === true)) && !errors.email && (
                        <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {codigoValido === true ? 'E-mail validado com código' : 'E-mail válido'}
                        </p>
                      )}
                      {emailValidando && (
                        <p className="text-sm text-[#8A8B95] flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verificando e-mail...
                        </p>
                      )}
                    </div>



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
                      <Input
                        id="telefone"
                        placeholder="Seu telefone com DDD"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                        className={`text-lg py-3 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${errors.telefone ? 'border-[#C8324A]' : ''}`}
                        maxLength={15}
                      />
                      {errors.telefone && <p className="text-sm text-[#C8324A]">{errors.telefone}</p>}
                    </div>

                    {/* Checkbox de Termos */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="aceitaTermos"
                          checked={formData.aceitaTermos}
                          onCheckedChange={(checked) => handleInputChange('aceitaTermos', checked)}
                          className={errors.aceitaTermos ? 'border-[#C8324A]' : ''}
                        />
                        <div className="space-y-2 text-left">
                          <Label htmlFor="aceitaTermos" className="text-sm cursor-pointer text-[#1A1B23] leading-relaxed">
                            Aceito os <a href="#" className="text-[#5B2E8C] hover:underline">Termos e condições</a> e o <a href="#" className="text-[#5B2E8C] hover:underline">Aviso de privacidade</a>
                          </Label>
                          {errors.aceitaTermos && <p className="text-sm text-[#C8324A]">{errors.aceitaTermos}</p>}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Etapa 2: Senha */}
                {etapaAtual === 2 && (
                  <div className="space-y-6">
                    {/* Campo de Senha */}
                    <div className="space-y-3">
                      <Label htmlFor="senha" className="text-[#1A1B23] flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#5B2E8C]" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="Crie uma senha segura"
                          value={formData.senha}
                          onChange={(e) => handleSenhaChange(e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                            errors.senha ? 'border-[#C8324A]' : 
                            forcaSenha === 'forte' ? 'border-[#0E8B5A]' :
                            forcaSenha === 'media' ? 'border-yellow-500' :
                            forcaSenha === 'fraca' ? 'border-[#C8324A]' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
                        >
                          {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Indicador de Força da Senha */}
                      {formData.senha && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#1A1B23]">Força da senha:</span>
                            <div className="flex-1 relative">
                              <Progress 
                                value={
                                  forcaSenha === 'fraca' ? 33 :
                                  forcaSenha === 'media' ? 66 :
                                  forcaSenha === 'forte' ? 100 : 0
                                }
                                className={`h-2 ${
                                  forcaSenha === 'forte' ? '[&>div]:bg-[#0E8B5A]' :
                                  forcaSenha === 'media' ? '[&>div]:bg-[#C77700]' :
                                  '[&>div]:bg-[#C8324A]'
                                }`}
                              />
                            </div>
                            <span className={`text-sm font-semibold ${
                              forcaSenha === 'forte' ? 'text-[#0E8B5A]' :
                              forcaSenha === 'media' ? 'text-[#C77700]' :
                              'text-[#C8324A]'
                            }`}>
                              {forcaSenha === 'forte' ? 'Forte' :
                               forcaSenha === 'media' ? 'Média' :
                               'Fraca'}
                            </span>
                          </div>

                          {/* Lista de Requisitos */}
                          <div className="bg-[#F7F5FB] border border-[#DCDDE3] rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-[#5B2E8C] mb-3">Requisitos de segurança:</h4>
                            <div className="grid grid-cols-1 gap-2">
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.tamanho ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.tamanho ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>Mínimo 8 caracteres</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.maiuscula ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.maiuscula ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 letra maiúscula (A-Z)</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.minuscula ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.minuscula ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 letra minúscula (a-z)</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.numero ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.numero ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 número (0-9)</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.especial ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.especial ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 caractere especial (!@#$%^&*)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {errors.senha && <p className="text-sm text-[#C8324A] flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {errors.senha}
                      </p>}
                    </div>

                    {/* Campo de Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha" className="text-[#1A1B23] flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#5B2E8C]" />
                        Confirmar senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmarSenha"
                          type={mostrarConfirmarSenha ? "text" : "password"}
                          placeholder="Digite a senha novamente"
                          value={formData.confirmarSenha}
                          onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                            errors.confirmarSenha ? 'border-[#C8324A]' : 
                            formData.confirmarSenha && formData.senha === formData.confirmarSenha ? 'border-[#0E8B5A]' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A8B95] hover:text-[#5B2E8C] transition-colors"
                        >
                          {mostrarConfirmarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Feedback de confirmação de senha */}
                      {formData.confirmarSenha && formData.senha && (
                        <div className="flex items-center gap-2">
                          {formData.senha === formData.confirmarSenha ? (
                            <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Senhas coincidem
                            </p>
                          ) : (
                            <p className="text-sm text-[#C8324A] flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              Senhas não coincidem
                            </p>
                          )}
                        </div>
                      )}
                      
                      {errors.confirmarSenha && <p className="text-sm text-[#C8324A] flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {errors.confirmarSenha}
                      </p>}
                    </div>

                  </div>
                )}

                {/* Etapa 3: Confirmação da Placa */}
                {etapaAtual === 3 && (
                  <div className="space-y-6">
                    {/* Mensagem explicativa */}
                    <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Car className="h-5 w-5 text-[#5B2E8C]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#5B2E8C] mb-1">
                            Veículo consultado
                          </h4>
                          <p className="text-sm text-[#8A8B95]">
                            Confirme o cadastro do veículo que você consultou para visualizar seus débitos no dashboard.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Campo de Placa */}
                    <div className="space-y-2">
                      <Label htmlFor="placa" className="text-[#1A1B23] flex items-center gap-2">
                        <Car className="h-4 w-4 text-[#5B2E8C]" />
                        Placa do veículo
                      </Label>
                      <Input
                        id="placa"
                        placeholder="ABC-1234 ou ABC1D23"
                        value={formData.placa}
                        onChange={(e) => {
                          const placaFormatada = formatarPlacaInput(e.target.value);
                          handleInputChange('placa', placaFormatada);
                        }}
                        className={`text-lg py-3 text-center font-mono font-semibold tracking-[0.05em] uppercase border-[#F7F5FB] focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                          errors.placa ? 'border-[#C8324A]' : 
                          formData.placa && validarPlaca(formData.placa).isValid ? 'border-[#0E8B5A]' : ''
                        }`}
                        maxLength={8}
                        disabled={!!placaConsultada}
                      />
                      {formData.placa && (() => {
                        const placaValidacao = validarPlaca(formData.placa);
                        return placaValidacao.isValid ? (
                          <p className="text-sm text-[#0E8B5A] flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {placaValidacao.type === 'antiga' ? 'Placa antiga válida' : 'Placa Mercosul válida'}
                          </p>
                        ) : null;
                      })()}
                      {errors.placa && (
                        <p className="text-sm text-[#C8324A] flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {errors.placa}
                        </p>
                      )}
                      {placaConsultada && (
                        <p className="text-xs text-[#8A8B95] text-center mt-2">
                          Esta é a placa que você consultou na página inicial
                        </p>
                      )}
                    </div>

                  </div>
                )}

                {/* Botões de navegação */}
                <div className="pt-6">
                  {etapaAtual < 3 ? (
                    <Button 
                      type="submit"
                      size="lg" 
                      disabled={
                        etapaAtual === 1
                          ? (
                              // Campos obrigatórios não preenchidos
                              !formData.nome.trim() ||
                              !formData.dataNascimento.trim() ||
                              !formData.email.trim() ||
                              !formData.telefone.trim() ||
                              !formData.cpf.trim() ||
                              !formData.aceitaTermos ||
                              // CPF inválido
                              cpfValido !== true ||
                              // Estados de carregamento
                              emailValidando || 
                              validandoCodigo ||
                              // Lógica do email: se não enviou código ainda, precisa email válido; se enviou código, precisa email válido (código validado)
                              (!codigoEnviado && emailValido !== true) ||
                              (codigoEnviado && codigoValido !== true)
                            )
                          : !isCurrentStepValid()
                      }
                      onClick={(e) => {
                        if (etapaAtual === 1 && formData.email.trim() && emailValido === true && !codigoEnviado) {
                          e.preventDefault();
                          enviarCodigoValidacao();
                        }
                      }}
                      className={`w-full py-4 text-lg rounded-lg font-medium transition-colors ${
                        etapaAtual === 1
                          ? (
                              formData.nome.trim() &&
                              formData.dataNascimento.trim() &&
                              formData.email.trim() &&
                              formData.telefone.trim() &&
                              formData.cpf.trim() &&
                              formData.aceitaTermos &&
                              cpfValido === true &&
                              !emailValidando &&
                              !validandoCodigo &&
                              ((!codigoEnviado && emailValido === true) || (codigoEnviado && codigoValido === true))
                            )
                            ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white'
                            : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                          : isCurrentStepValid()
                            ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white'
                            : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                      }`}
                    >
                      {etapaAtual === 1 && emailValido === true && !codigoEnviado 
                        ? (emailValidando ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Enviando código...
                            </>
                          ) : (
                            <>
                              <Mail className="h-5 w-5 mr-2" />
                              Enviar código de validação
                            </>
                          ))
                        : (
                          <>
                            Continuar <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )
                      }
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white py-4 text-lg rounded-lg font-medium transition-colors"
                      disabled={loading || !formData.aceitaTermos || !isCurrentStepValid()}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Criando conta...
                        </>
                      ) : (
                        <>
                          <Car className="h-5 w-5 mr-2" />
                          Criar conta e prosseguir
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>

              {/* Link para login - apenas na primeira etapa */}
              {etapaAtual === 1 && onLogin && (
                <>


                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={onLogin}
                      className="w-full py-3 text-lg text-[#5B2E8C] hover:text-[#8B5FFF] font-medium transition-colors text-center"
                    >
                      Já tenho cadastro
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para Validação do Código */}
      <Dialog open={modalCodigoAberto} onOpenChange={setModalCodigoAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-[#5B2E8C] flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" />
              Validar E-mail
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-[#8A8B95]">
              Digite o código de 6 dígitos que enviamos para o seu e-mail para confirmar seu endereço eletrônico.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Informação do e-mail */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[#8A8B95]">
                Enviamos um código de 6 dígitos para
              </p>
              <p className="text-base font-medium text-[#5B2E8C]">
                {formData.email}
              </p>
            </div>

            {/* Campo do código */}
            <div className="space-y-3">
              <Label htmlFor="codigoModal" className="text-[#1A1B23] text-center block">
                Digite o código de verificação
              </Label>
              <div className="relative">
                <Input
                  id="codigoModal"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="Digite o código"
                  value={codigoValidacao}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCodigoValidacao(valor);
                    setErrors(prev => ({ ...prev, codigoValidacao: '' }));
                    setCodigoValido(null);
                    
                    // Validar automaticamente quando código estiver completo
                    if (valor.length === 6) {
                      setValidandoCodigo(true);
                      
                      const timer = setTimeout(() => {
                        const valido = valor === codigoCorreto;
                        setCodigoValido(valido);
                        setValidandoCodigo(false);
                        
                        if (valido) {
                          setEmailValido(true);
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.codigoValidacao;
                            delete newErrors.email;
                            return newErrors;
                          });
                          // Fechar modal após validação bem-sucedida
                          setTimeout(() => setModalCodigoAberto(false), 800);
                        } else {
                          setErrors(prev => ({ 
                            ...prev, 
                            codigoValidacao: 'Código inválido. Verifique e tente novamente.' 
                          }));
                        }
                      }, 1000);
                      
                      // Cleanup function para evitar vazamentos de memória
                      return () => clearTimeout(timer);
                    }
                  }}
                  className={`text-xl py-4 text-center tracking-[0.5rem] font-mono border-2 focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                    errors.codigoValidacao ? 'border-[#C8324A]' : 
                    codigoValido === true ? 'border-[#0E8B5A]' : 
                    codigoValido === false ? 'border-[#C8324A]' : 'border-[#DCDDE3]'
                  }`}
                  maxLength={6}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validandoCodigo && (
                    <Loader2 className="h-5 w-5 animate-spin text-[#5B2E8C]" />
                  )}
                  {!validandoCodigo && codigoValido === true && (
                    <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                  )}
                  {!validandoCodigo && codigoValido === false && (
                    <XCircle className="h-5 w-5 text-[#C8324A]" />
                  )}
                </div>
              </div>
              
              {/* Feedback do código */}
              {errors.codigoValidacao && (
                <p className="text-sm text-[#C8324A] text-center flex items-center justify-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.codigoValidacao}
                </p>
              )}
              
              {codigoValido === true && !errors.codigoValidacao && (
                <p className="text-sm text-[#0E8B5A] text-center flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Código validado com sucesso!
                </p>
              )}
              
              {validandoCodigo && (
                <p className="text-sm text-[#8A8B95] text-center flex items-center justify-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando código...
                </p>
              )}
            </div>

            {/* Botão de reenvio */}
            <div className="text-center">
              <p className="text-sm text-[#8A8B95] mb-3">
                Não recebeu o código?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={reenviarCodigoDoModal}
                disabled={tempoReenvio > 0}
                className={`border-[#5B2E8C] text-[#5B2E8C] hover:bg-[#5B2E8C] hover:text-white ${
                  tempoReenvio > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {tempoReenvio > 0 ? `Reenviar em ${tempoReenvio}s` : 'Reenviar código'}
              </Button>
            </div>

            {/* Botão de fechar - só aparece se o código foi validado */}
            {codigoValido === true && (
              <div className="pt-4 border-t border-[#F7F5FB]">
                <Button
                  onClick={() => setModalCodigoAberto(false)}
                  className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white py-3"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Continuar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}