import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Shield, CheckCircle, XCircle, Eye, EyeOff, Loader2, ArrowRight, Car } from "lucide-react";
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
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    senha: '',
    confirmarSenha: '',
    placa: '',
    aceitaTermos: false,
    aceitaNewsletter: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consultandoCEP, setConsultandoCEP] = useState(false);
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false);
  const [preenchimentoManual, setPreenchimentoManual] = useState(false);
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
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const consultarCEP = async (cep: string) => {
    const cepNumeros = cep.replace(/\D/g, '');
    
    if (cepNumeros.length !== 8) return;

    setConsultandoCEP(true);
    setErrors(prev => ({ ...prev, cep: '' }));
    setCepNaoEncontrado(false);

    try {
      // Simulação de falha da API - CEPs que começam com "99999" sempre falham
      if (cepNumeros.startsWith('99999')) {
        throw new Error('Simulação de erro da API');
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (data.erro) {
        setCepNaoEncontrado(true);
        setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        return;
      }

      // Preencher automaticamente os campos de endereço
      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));

      // Limpar erros dos campos preenchidos automaticamente
      setErrors(prev => {
        const newErrors = { ...prev };
        if (data.logradouro) delete newErrors.endereco;
        if (data.bairro) delete newErrors.bairro;
        if (data.localidade) delete newErrors.cidade;
        if (data.uf) delete newErrors.estado;
        return newErrors;
      });

    } catch (error) {
      setCepNaoEncontrado(true);
      if (error.name === 'AbortError') {
        setErrors(prev => ({ ...prev, cep: 'Tempo de consulta esgotado' }));
      } else {
        setErrors(prev => ({ ...prev, cep: 'Erro ao consultar CEP' }));
      }
    } finally {
      setConsultandoCEP(false);
    }
  };

  const habilitarPreenchimentoManual = () => {
    setPreenchimentoManual(true);
    setCepNaoEncontrado(false);
    setErrors(prev => ({ ...prev, cep: '' }));
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
      console.log(`Código enviado para ${formData.email}: ${codigo}`); // Para desenvolvimento
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
    
    console.log(`Novo código enviado para ${formData.email}: ${novoCodigo}`);
    
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

  // Função que verifica se a etapa atual é válida sem alterar o estado
  const isCurrentStepValid = () => {
    if (etapaAtual === 1) {
      // Dados pessoais - verificação mais clara
      const camposObrigatoriosPreenchidos = (
        formData.nome.trim() &&
        formData.email.trim() &&
        formData.telefone.trim() &&
        formData.cpf.trim() &&
        formData.aceitaTermos
      );
      
      const cpfValido_check = cpfValido === true;
      
      const emailValido_check = (!codigoEnviado && emailValido === true) || (codigoEnviado && codigoValido === true);
      
      return camposObrigatoriosPreenchidos && cpfValido_check && emailValido_check;
    } else if (etapaAtual === 2) {
      // Endereço
      if (!formData.cep.trim()) return false;
      if (formData.cep.replace(/\D/g, '').length !== 8) return false;
      if (!formData.endereco.trim()) return false;
      if (!formData.numero.trim()) return false;
      if (!formData.bairro.trim()) return false;
      if (!formData.cidade.trim()) return false;
      if (!formData.estado.trim()) return false;
    } else if (etapaAtual === 3) {
      // Senha - pure check without setting state
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
    } else if (etapaAtual === 4) {
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
      // Dados pessoais
      if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
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
      // Endereço
      if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
      else if (formData.cep.replace(/\D/g, '').length !== 8) newErrors.cep = 'CEP deve ter 8 dígitos';
      
      if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
      if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
      if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
      if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
      if (!formData.estado.trim()) newErrors.estado = 'Estado é obrigatório';
    } else if (etapaAtual === 3) {
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
    } else if (etapaAtual === 4) {
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

  // Calcular o progresso dinâmico (0% a 100%) usando useMemo
  const progressoCalculado = useMemo(() => {
    let progress = 0;
    
    if (etapaAtual === 1) {
      // Etapa 1: 0% a 25% baseado nos campos preenchidos
      let fieldsCompleted = 0;
      const totalFields = 5; // nome, email, telefone, cpf, aceitar termos
      
      if (formData.nome.trim()) fieldsCompleted++;
      if (formData.email.trim() && emailValido === true) fieldsCompleted++;
      if (formData.telefone.trim()) fieldsCompleted++;
      if (formData.cpf.trim() && cpfValido === true) fieldsCompleted++;
      if (formData.aceitaTermos) fieldsCompleted++;
      
      progress = (fieldsCompleted / totalFields) * 25;
      
    } else if (etapaAtual === 2) {
      // Etapa 2: 25% a 50% baseado nos campos preenchidos
      // Primeiro, adiciona os 25% da etapa anterior (completa)
      progress = 25;
      
      let fieldsCompleted = 0;
      const totalFields = 6; // cep, endereco, numero, bairro, cidade, estado
      
      if (formData.cep.trim() && formData.cep.replace(/\D/g, '').length === 8) fieldsCompleted++;
      if (formData.endereco.trim()) fieldsCompleted++;
      if (formData.numero.trim()) fieldsCompleted++;
      if (formData.bairro.trim()) fieldsCompleted++;
      if (formData.cidade.trim()) fieldsCompleted++;
      if (formData.estado.trim()) fieldsCompleted++;
      
      progress += (fieldsCompleted / totalFields) * 25;
      
    } else if (etapaAtual === 3) {
      // Etapa 3: 50% a 75% baseado nos campos preenchidos
      // Primeiro, adiciona os 50% das etapas anteriores (completas)
      progress = 50;
      
      let fieldsCompleted = 0;
      const totalFields = 2; // senha válida, confirmação de senha
      
      // Usar a função auxiliar pura para calcular requisitos
      const calcularRequisitosSenha = (senha: string) => {
        return {
          tamanho: senha.length >= 8,
          maiuscula: /[A-Z]/.test(senha),
          minuscula: /[a-z]/.test(senha),
          numero: /\d/.test(senha),
          especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
        };
      };
      
      if (formData.senha && Object.values(calcularRequisitosSenha(formData.senha)).every(Boolean)) fieldsCompleted++;
      if (formData.senha && formData.confirmarSenha && formData.senha === formData.confirmarSenha) fieldsCompleted++;
      
      progress += (fieldsCompleted / totalFields) * 25;
    } else if (etapaAtual === 4) {
      // Etapa 4: 75% a 100% baseado na placa
      progress = 75;
      
      if (formData.placa.trim()) {
        const placaValidacaoLocal = validarPlaca(formData.placa);
        if (placaValidacaoLocal.isValid) {
          progress = 100;
        } else {
          progress = 87.5; // Meio caminho
        }
      }
    }
    
    return Math.max(0, Math.min(100, progress)); // Garantir que fique entre 0 e 100
  }, [etapaAtual, formData.nome, formData.email, formData.telefone, formData.cpf, formData.aceitaTermos, formData.cep, formData.endereco, formData.numero, formData.bairro, formData.cidade, formData.estado, formData.senha, formData.confirmarSenha, formData.placa, emailValido, cpfValido]);

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
      case 2: return 'Endereço';
      case 3: return 'Senha e confirmação';
      case 4: return 'Confirmar veículo';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (etapaAtual) {
      case 1: return <User className="h-6 w-6 text-[#003566]" />;
      case 2: return <MapPin className="h-6 w-6 text-[#003566]" />;
      case 3: return <Lock className="h-6 w-6 text-[#003566]" />;
      case 4: return <Car className="h-6 w-6 text-[#003566]" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#F8F9FA] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={etapaAtual === 1 ? onBack : handlePreviousStep}
              className="flex items-center gap-2 text-[#6C757D] hover:text-[#003566] hover:bg-[#F8F9FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003566] rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#003566]">Pedágio Simples</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Título da seção */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#F8F9FA] text-[#00B4D8] rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-semibold">CADASTRO SEGURO</span>
            </div>

            <p className="text-lg text-[#6C757D]">
              Para prosseguir com o pagamento, precisamos de algumas informações
            </p>
          </div>

          {/* Indicador de Progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#000000]">
                Etapa {etapaAtual} de 4
              </span>
              <span className="text-sm text-[#6C757D]">
                {Math.round(progressoCalculado)}% concluído
              </span>
            </div>
            <Progress value={progressoCalculado} className="h-2" />
          </div>

          {/* Formulário */}
          <Card className="shadow-lg border border-[#F8F9FA] rounded-lg">
            <CardHeader className="text-center pb-1 pt-4">
              <CardTitle className="text-xl text-[#000000] flex items-center justify-center gap-3">
                {getStepIcon()}
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={etapaAtual === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                
                {/* Etapa 1: Dados Pessoais */}
                {etapaAtual === 1 && (
                  <div className="space-y-6">
                    {/* CPF */}
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-[#000000]">CPF</Label>
                      <div className="relative">
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => {
                            const cpfFormatado = formatCPF(e.target.value);
                            handleInputChange('cpf', cpfFormatado);
                            
                            // Reset estados de validação
                            setCpfValido(null);
                            
                            // Validar automaticamente quando CPF estiver completo
                            if (cpfFormatado.replace(/\D/g, '').length === 11) {
                              validateCPF(cpfFormatado);
                            } else if (cpfFormatado.replace(/\D/g, '').length > 0) {
                              setErrors(prev => ({ ...prev, cpf: '' }));
                            }
                          }}
                          className={`text-lg py-3 pr-12 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${
                            errors.cpf ? 'border-red-500' : 
                            cpfValido === true ? 'border-green-500' : 
                            cpfValido === false ? 'border-red-500' : ''
                          }`}
                          maxLength={14}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {cpfValido === true && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {cpfValido === false && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      {errors.cpf && <p className="text-sm text-red-600">{errors.cpf}</p>}
                      {cpfValido === true && !errors.cpf && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          CPF válido
                        </p>
                      )}
                    </div>

                    {/* Nome completo */}
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-[#000000]">Nome completo</Label>
                      <Input
                        id="nome"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.nome ? 'border-red-500' : ''}`}
                      />
                      {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#000000]">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${
                            errors.email ? 'border-red-500' : 
                            emailValido === true ? 'border-green-500' : 
                            emailValido === false ? 'border-red-500' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailValidando && (
                            <Loader2 className="h-5 w-5 animate-spin text-[#003566]" />
                          )}
                          {!emailValidando && emailValido === true && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {!emailValidando && emailValido === false && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                      {(emailValido === true || (codigoEnviado && codigoValido === true)) && !errors.email && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {codigoValido === true ? 'E-mail validado com código' : 'E-mail válido'}
                        </p>
                      )}
                      {emailValidando && (
                        <p className="text-sm text-[#6C757D] flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verificando e-mail...
                        </p>
                      )}
                    </div>



                    {/* Telefone */}
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-[#000000]">Telefone</Label>
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                        className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.telefone ? 'border-red-500' : ''}`}
                        maxLength={15}
                      />
                      {errors.telefone && <p className="text-sm text-red-600">{errors.telefone}</p>}
                    </div>

                    {/* Checkbox de Termos */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="aceitaTermos"
                          checked={formData.aceitaTermos}
                          onCheckedChange={(checked) => handleInputChange('aceitaTermos', checked)}
                          className={errors.aceitaTermos ? 'border-red-500' : ''}
                        />
                        <div className="space-y-2 text-left">
                          <Label htmlFor="aceitaTermos" className="text-sm cursor-pointer text-[#000000] leading-relaxed">
                            Aceito os <a href="#" className="text-[#003566] hover:underline">Termos e condições</a> e o <a href="#" className="text-[#003566] hover:underline">Aviso de privacidade</a>
                          </Label>
                          {errors.aceitaTermos && <p className="text-sm text-red-600">{errors.aceitaTermos}</p>}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Etapa 2: Endereço */}
                {etapaAtual === 2 && (
                  <div className="space-y-6">
                    {/* CEP */}
                    <div className="space-y-2">
                      <Label htmlFor="cep" className="text-[#000000]">CEP</Label>
                      <div className="relative">
                        <Input
                          id="cep"
                          placeholder="00000-000"
                          value={formData.cep}
                          onChange={(e) => {
                            const cepFormatado = formatCEP(e.target.value);
                            handleInputChange('cep', cepFormatado);
                            
                            // Resetar estados quando usuário modificar o CEP
                            setCepNaoEncontrado(false);
                            setPreenchimentoManual(false);
                            
                            // Consultar automaticamente quando CEP estiver completo
                            if (cepFormatado.replace(/\D/g, '').length === 8) {
                              consultarCEP(cepFormatado);
                            }
                          }}
                          className={`text-lg py-3 pr-10 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.cep ? 'border-red-500' : ''}`}
                          maxLength={9}
                        />
                        {consultandoCEP && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-[#003566]" />
                          </div>
                        )}
                      </div>
                      {errors.cep && <p className="text-sm text-red-600">{errors.cep}</p>}
                      
                      {/* Aviso de CEP não encontrado com opção de preenchimento manual */}
                      {cepNaoEncontrado && !preenchimentoManual && (
                        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-yellow-800 font-medium mb-2">
                                Não foi possível buscar o endereço automaticamente
                              </p>
                              <p className="text-sm text-yellow-700 mb-3">
                                O serviço dos Correios pode estar indisponível no momento. Você pode preencher o endereço manualmente para continuar.
                              </p>
                              <Button
                                type="button"
                                onClick={habilitarPreenchimentoManual}
                                className="bg-[#003566] hover:bg-[#002a52] text-white text-sm py-2 px-4"
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Preencher endereço manualmente
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {preenchimentoManual && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Modo de preenchimento manual ativado
                          </p>
                        </div>
                      )}

                      <div className="mt-2">
                        <a 
                          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#003566] hover:text-[#002a52] underline transition-colors"
                        >
                          Não sei o CEP
                        </a>
                      </div>
                    </div>

                    {/* Endereço e Número */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="endereco" className="text-[#000000]">Endereço</Label>
                        <Input
                          id="endereco"
                          placeholder="Rua, Avenida, Travessa"
                          value={formData.endereco}
                          onChange={(e) => handleInputChange('endereco', e.target.value)}
                          disabled={!preenchimentoManual}
                          className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.endereco ? 'border-red-500' : ''} disabled:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60`}
                        />
                        {errors.endereco && <p className="text-sm text-red-600">{errors.endereco}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numero" className="text-[#000000]">Número</Label>
                        <Input
                          id="numero"
                          placeholder="123"
                          value={formData.numero}
                          onChange={(e) => handleInputChange('numero', e.target.value)}
                          className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.numero ? 'border-red-500' : ''}`}
                        />
                        {errors.numero && <p className="text-sm text-red-600">{errors.numero}</p>}
                      </div>
                    </div>

                    {/* Bairro */}
                    <div className="space-y-2">
                      <Label htmlFor="bairro" className="text-[#000000]">Bairro</Label>
                      <Input
                        id="bairro"
                        placeholder="Nome do bairro"
                        value={formData.bairro}
                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                        disabled={!preenchimentoManual}
                        className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.bairro ? 'border-red-500' : ''} disabled:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                      {errors.bairro && <p className="text-sm text-red-600">{errors.bairro}</p>}
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="cidade" className="text-[#000000]">Cidade</Label>
                        <Input
                          id="cidade"
                          placeholder="Nome da cidade"
                          value={formData.cidade}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          disabled={!preenchimentoManual}
                          className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.cidade ? 'border-red-500' : ''} disabled:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60`}
                        />
                        {errors.cidade && <p className="text-sm text-red-600">{errors.cidade}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estado" className="text-[#000000]">Estado</Label>
                        <Input
                          id="estado"
                          placeholder="SP"
                          value={formData.estado}
                          onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                          disabled={!preenchimentoManual}
                          className={`text-lg py-3 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${errors.estado ? 'border-red-500' : ''} disabled:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60`}
                          maxLength={2}
                        />
                        {errors.estado && <p className="text-sm text-red-600">{errors.estado}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Etapa 3: Senha */}
                {etapaAtual === 3 && (
                  <div className="space-y-6">
                    {/* Campo de Senha */}
                    <div className="space-y-3">
                      <Label htmlFor="senha" className="text-[#000000] flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#003566]" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="Crie uma senha segura"
                          value={formData.senha}
                          onChange={(e) => handleSenhaChange(e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${
                            errors.senha ? 'border-red-500' : 
                            forcaSenha === 'forte' ? 'border-green-500' :
                            forcaSenha === 'media' ? 'border-yellow-500' :
                            forcaSenha === 'fraca' ? 'border-red-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C757D] hover:text-[#003566] transition-colors"
                        >
                          {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Indicador de Força da Senha */}
                      {formData.senha && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#000000]">Força da senha:</span>
                            <div className="flex-1 relative">
                              <Progress 
                                value={
                                  forcaSenha === 'fraca' ? 33 :
                                  forcaSenha === 'media' ? 66 :
                                  forcaSenha === 'forte' ? 100 : 0
                                }
                                className={`h-2 ${
                                  forcaSenha === 'forte' ? '[&>div]:bg-green-500' :
                                  forcaSenha === 'media' ? '[&>div]:bg-yellow-500' :
                                  '[&>div]:bg-red-500'
                                }`}
                              />
                            </div>
                            <span className={`text-sm font-semibold ${
                              forcaSenha === 'forte' ? 'text-green-600' :
                              forcaSenha === 'media' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {forcaSenha === 'forte' ? 'Forte' :
                               forcaSenha === 'media' ? 'Média' :
                               'Fraca'}
                            </span>
                          </div>

                          {/* Lista de Requisitos */}
                          <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-[#003566] mb-3">Requisitos de segurança:</h4>
                            <div className="grid grid-cols-1 gap-2">
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.tamanho ? 'text-green-600' : 'text-[#6C757D]'
                              }`}>
                                {requisitosSenha.tamanho ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>Mínimo 8 caracteres</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.maiuscula ? 'text-green-600' : 'text-[#6C757D]'
                              }`}>
                                {requisitosSenha.maiuscula ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 letra maiúscula (A-Z)</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.minuscula ? 'text-green-600' : 'text-[#6C757D]'
                              }`}>
                                {requisitosSenha.minuscula ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 letra minúscula (a-z)</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.numero ? 'text-green-600' : 'text-[#6C757D]'
                              }`}>
                                {requisitosSenha.numero ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>1 número (0-9)</span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.especial ? 'text-green-600' : 'text-[#6C757D]'
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

                      {errors.senha && <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {errors.senha}
                      </p>}
                    </div>

                    {/* Campo de Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha" className="text-[#000000] flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#003566]" />
                        Confirmar senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmarSenha"
                          type={mostrarConfirmarSenha ? "text" : "password"}
                          placeholder="Digite a senha novamente"
                          value={formData.confirmarSenha}
                          onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                          className={`text-lg py-3 pr-12 border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${
                            errors.confirmarSenha ? 'border-red-500' : 
                            formData.confirmarSenha && formData.senha === formData.confirmarSenha ? 'border-green-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C757D] hover:text-[#003566] transition-colors"
                        >
                          {mostrarConfirmarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Feedback de confirmação de senha */}
                      {formData.confirmarSenha && formData.senha && (
                        <div className="flex items-center gap-2">
                          {formData.senha === formData.confirmarSenha ? (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Senhas coincidem
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              Senhas não coincidem
                            </p>
                          )}
                        </div>
                      )}
                      
                      {errors.confirmarSenha && <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {errors.confirmarSenha}
                      </p>}
                    </div>

                  </div>
                )}

                {/* Etapa 4: Confirmação da Placa */}
                {etapaAtual === 4 && (
                  <div className="space-y-6">
                    {/* Mensagem explicativa */}
                    <div className="bg-[#E3F2FD] border border-[#90CAF9] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Car className="h-5 w-5 text-[#003566]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#003566] mb-1">
                            Veículo consultado
                          </h4>
                          <p className="text-sm text-[#6C757D]">
                            Confirme o cadastro do veículo que você consultou para visualizar seus débitos no dashboard.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Campo de Placa */}
                    <div className="space-y-2">
                      <Label htmlFor="placa" className="text-[#000000] flex items-center gap-2">
                        <Car className="h-4 w-4 text-[#003566]" />
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
                        className={`text-lg py-3 text-center font-semibold tracking-wider border-[#F8F9FA] focus:border-[#003566] focus:ring-[#003566] ${
                          errors.placa ? 'border-red-500' : 
                          formData.placa && validarPlaca(formData.placa).isValid ? 'border-green-500' : ''
                        }`}
                        maxLength={8}
                        disabled={!!placaConsultada}
                      />
                      {formData.placa && (() => {
                        const placaValidacao = validarPlaca(formData.placa);
                        return placaValidacao.isValid ? (
                          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {placaValidacao.type === 'antiga' ? 'Placa antiga válida' : 'Placa Mercosul válida'}
                          </p>
                        ) : null;
                      })()}
                      {errors.placa && (
                        <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {errors.placa}
                        </p>
                      )}
                      {placaConsultada && (
                        <p className="text-xs text-[#6C757D] text-center mt-2">
                          Esta é a placa que você consultou na página inicial
                        </p>
                      )}
                    </div>

                  </div>
                )}

                {/* Botões de navegação */}
                <div className="pt-6">
                  {etapaAtual < 4 ? (
                    <Button 
                      type="submit"
                      size="lg" 
                      disabled={
                        etapaAtual === 1 
                          ? (
                              // Campos obrigatórios não preenchidos
                              !formData.nome.trim() || 
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
                              formData.email.trim() && 
                              formData.telefone.trim() && 
                              formData.cpf.trim() && 
                              formData.aceitaTermos && 
                              cpfValido === true &&
                              !emailValidando && 
                              !validandoCodigo &&
                              ((!codigoEnviado && emailValido === true) || (codigoEnviado && codigoValido === true))
                            )
                            ? 'bg-[#003566] hover:bg-[#002a52] text-white'
                            : 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
                          : isCurrentStepValid()
                            ? 'bg-[#003566] hover:bg-[#002a52] text-white'
                            : 'bg-[#CCCCCC] text-[#666666] cursor-not-allowed'
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
                      className="w-full bg-[#003566] hover:bg-[#002a52] text-white py-4 text-lg rounded-lg font-medium transition-colors"
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
                      className="w-full py-3 text-lg text-[#003566] hover:text-[#002a52] font-medium transition-colors text-center"
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
            <DialogTitle className="text-center text-xl text-[#003566] flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" />
              Validar E-mail
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-[#6C757D]">
              Digite o código de 6 dígitos que enviamos para o seu e-mail para confirmar seu endereço eletrônico.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Informação do e-mail */}
            <div className="text-center space-y-2">
              <p className="text-sm text-[#6C757D]">
                Enviamos um código de 6 dígitos para
              </p>
              <p className="text-base font-medium text-[#003566]">
                {formData.email}
              </p>
            </div>

            {/* Campo do código */}
            <div className="space-y-3">
              <Label htmlFor="codigoModal" className="text-[#000000] text-center block">
                Digite o código de verificação
              </Label>
              <div className="relative">
                <Input
                  id="codigoModal"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="000000"
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
                  className={`text-xl py-4 text-center tracking-[0.5rem] font-mono border-2 focus:border-[#003566] focus:ring-[#003566] ${
                    errors.codigoValidacao ? 'border-red-500' : 
                    codigoValido === true ? 'border-green-500' : 
                    codigoValido === false ? 'border-red-500' : 'border-[#E0E0E0]'
                  }`}
                  maxLength={6}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validandoCodigo && (
                    <Loader2 className="h-5 w-5 animate-spin text-[#003566]" />
                  )}
                  {!validandoCodigo && codigoValido === true && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {!validandoCodigo && codigoValido === false && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {/* Feedback do código */}
              {errors.codigoValidacao && (
                <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.codigoValidacao}
                </p>
              )}
              
              {codigoValido === true && !errors.codigoValidacao && (
                <p className="text-sm text-green-600 text-center flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Código validado com sucesso!
                </p>
              )}
              
              {validandoCodigo && (
                <p className="text-sm text-[#6C757D] text-center flex items-center justify-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando código...
                </p>
              )}
            </div>

            {/* Botão de reenvio */}
            <div className="text-center">
              <p className="text-sm text-[#6C757D] mb-3">
                Não recebeu o código?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={reenviarCodigoDoModal}
                disabled={tempoReenvio > 0}
                className={`border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white ${
                  tempoReenvio > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {tempoReenvio > 0 ? `Reenviar em ${tempoReenvio}s` : 'Reenviar código'}
              </Button>
            </div>

            {/* Botão de fechar - só aparece se o código foi validado */}
            {codigoValido === true && (
              <div className="pt-4 border-t border-[#F8F9FA]">
                <Button
                  onClick={() => setModalCodigoAberto(false)}
                  className="w-full bg-[#003566] hover:bg-[#002a52] text-white py-3"
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