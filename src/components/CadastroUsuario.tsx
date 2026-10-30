import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, User, Smartphone, Lock, Shield, ShieldCheck, 
  CheckCircle, XCircle, Eye, EyeOff, Loader2, ArrowRight, 
  Car, Mail, Check, RefreshCw, KeyRound
} from "lucide-react";
import logoPedagioSimples from "../assets/logo-pedagio-simples.svg";
import { useState, useMemo, useEffect } from "react";
import { validarPlaca, formatarPlacaInput } from "../utils/placaValidation";

interface CadastroUsuarioProps {
  onBack: () => void;
  onCadastrar: (dados: any) => void;
  onLogin?: () => void;
  placaConsultada?: string;
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
    </svg>
  );
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
    aceitaNewsletter: false,
    pularCadastroVeiculo: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cpfBuscando, setCpfBuscando] = useState(false);
  const [cpfAutoPreenchido, setCpfAutoPreenchido] = useState<string[]>([]);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [telefoneValido, setTelefoneValido] = useState<boolean | null>(null);
  const [emailValidando, setEmailValidando] = useState(false);
  const [emailValido, setEmailValido] = useState<boolean | null>(null);
  const [emailTimeout, setEmailTimeout] = useState<NodeJS.Timeout | null>(null);

  // Estados da Validação por 3 Canais (WhatsApp, SMS, E-mail)
  const [canalValidacao, setCanalValidacao] = useState<'whatsapp' | 'sms' | 'email' | null>(null);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [codigoValidacao, setCodigoValidacao] = useState('');
  const [codigoCorreto, setCodigoCorreto] = useState('123456');
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [codigoValido, setCodigoValido] = useState<boolean | null>(null);
  const [tempoReenvio, setTempoReenvio] = useState(0);

  // Estados da Senha
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

  // Sincronizar placa consultada
  useEffect(() => {
    if (placaConsultada && !formData.placa) {
      setFormData(prev => ({ ...prev, placa: placaConsultada }));
    }
  }, [placaConsultada]);

  // Contagem regressiva para reenvio de código
  useEffect(() => {
    if (tempoReenvio <= 0) return;
    const interval = setInterval(() => {
      setTempoReenvio(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tempoReenvio]);

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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const mascararTelefone = (telefone: string) => {
    if (!telefone) return 'seu celular';
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 11) {
      // Ex: (11) 98765-4321 -> (11) 9****-4321
      return `(${numbers.slice(0, 2)}) ${numbers[2]}****-${numbers.slice(7)}`;
    }
    if (numbers.length === 10) {
      // Ex: (11) 3456-7890 -> (11) ****-7890
      return `(${numbers.slice(0, 2)}) ****-${numbers.slice(6)}`;
    }
    if (numbers.length >= 8) {
      return `****-${numbers.slice(-4)}`;
    }
    return telefone;
  };

  const mascararEmail = (email: string) => {
    if (!email || !email.includes('@')) return email || 'seu e-mail';
    const [usuario, dominio] = email.split('@');
    if (usuario.length <= 2) {
      return `${usuario[0]}****@${dominio}`;
    }
    return `${usuario.slice(0, 2)}****@${dominio}`;
  };

  const validarTelefoneBrasileiro = (nums: string): boolean => {
    if (nums.length !== 11) return false;
    const ddd = parseInt(nums.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    if (nums[2] !== '9') return false;
    return true;
  };

  const buscarDadosCPF = async (_cpf: string) => {
    setCpfBuscando(true);
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
    const phoneNums = mockDados.telefone.replace(/\D/g, '');
    const phoneOk = validarTelefoneBrasileiro(phoneNums);
    setTelefoneValido(phoneOk);
    setEmailValido(true);
    setErrors(prev => ({ ...prev, email: '', nome: '', dataNascimento: '', telefone: '' }));
    setCpfAutoPreenchido(['nome', 'dataNascimento', 'email', 'telefone']);
    setCpfBuscando(false);
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF deve ter 11 dígitos' }));
      return false;
    }

    if (/^(\d)\1{10}$/.test(numbers)) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    }

    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(9, 10))) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(10, 11))) {
      setCpfValido(false);
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    }

    setCpfValido(true);
    setErrors(prev => ({ ...prev, cpf: '' }));
    return true;
  };

  const handleTelefoneChange = (raw: string) => {
    const formatted = formatPhone(raw);
    handleInputChange('telefone', formatted);

    setTelefoneValido(null);
    setCodigoEnviado(false);
    setCodigoValidacao('');
    setCodigoCorreto('123456');
    setCodigoValido(null);
    setTempoReenvio(0);

    const nums = raw.replace(/\D/g, '');
    if (nums.length === 11) {
      const valido = validarTelefoneBrasileiro(nums);
      setTelefoneValido(valido);
      if (!valido) {
        setErrors(prev => ({ ...prev, telefone: 'Insira um celular válido com DDD (ex: (11) 98765-4321)' }));
      } else {
        setErrors(prev => ({ ...prev, telefone: '' }));
      }
    } else if (nums.length > 0) {
      setErrors(prev => ({ ...prev, telefone: '' }));
    }
  };

  const validarEmail = async (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      setEmailValido(false);
      setErrors(prev => ({ ...prev, email: 'Formato de e-mail inválido' }));
      return;
    }

    setEmailValidando(true);
    setErrors(prev => ({ ...prev, email: '' }));

    try {
      const domain = email.split('@')[1];
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

      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        setEmailValido(false);
        setErrors(prev => ({ ...prev, email: 'Domínio do e-mail inválido' }));
        return;
      }

      const commonDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
        'uol.com.br', 'bol.com.br', 'terra.com.br', 'globo.com',
        'live.com', 'icloud.com', 'me.com', 'protonmail.com',
        'company.com', 'empresa.com.br'
      ];

      if (commonDomains.includes(domain.toLowerCase())) {
        setEmailValido(true);
        setErrors(prev => ({ ...prev, email: '' }));
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setEmailValido(true);
      setErrors(prev => ({ ...prev, email: '' }));
    } catch {
      setEmailValido(false);
      setErrors(prev => ({ ...prev, email: 'Erro ao validar e-mail. Tente novamente.' }));
    } finally {
      setEmailValidando(false);
    }
  };

  const handleEmailChange = (email: string) => {
    handleInputChange('email', email);

    setEmailValido(null);
    setEmailValidando(false);
    setCodigoEnviado(false);
    setCodigoValidacao('');
    setCodigoCorreto('123456');
    setCodigoValido(null);
    setTempoReenvio(0);

    if (emailTimeout) {
      clearTimeout(emailTimeout);
    }

    if (!email.trim()) {
      setEmailValido(null);
      return;
    }

    const newTimeout = setTimeout(() => {
      validarEmail(email);
    }, 800);

    setEmailTimeout(newTimeout);
  };

  // Funções de envio e validação de código
  const enviarCodigoValidacao = async (canal?: 'whatsapp' | 'sms' | 'email') => {
    const canalEscolhido = canal || canalValidacao;
    if (!canalEscolhido) return;
    if (canal) setCanalValidacao(canal);

    setEnviandoCodigo(true);
    setCodigoValidacao('');
    setCodigoValido(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.codigoValidacao;
      return newErrors;
    });

    const codigo = "123456";
    setCodigoCorreto(codigo);

    setTimeout(() => {
      setEnviandoCodigo(false);
      setCodigoEnviado(true);
      setTempoReenvio(60);
    }, 1000);
  };

  const reenviarCodigo = () => {
    if (canalValidacao) {
      enviarCodigoValidacao(canalValidacao);
    }
  };

  const handleTrocarCanal = () => {
    setCodigoEnviado(false);
    setCodigoValidacao('');
    setCodigoValido(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.codigoValidacao;
      return newErrors;
    });
  };

  const handleCodigoChange = (valor: string) => {
    const limpo = valor.replace(/\D/g, '').slice(0, 6);
    setCodigoValidacao(limpo);
    setErrors(prev => ({ ...prev, codigoValidacao: '' }));
    setCodigoValido(null);

    if (limpo.length === 6) {
      setValidandoCodigo(true);
      setTimeout(() => {
        const valido = limpo === (codigoCorreto || "123456");
        setCodigoValido(valido);
        setValidandoCodigo(false);

        if (!valido) {
          setErrors(prev => ({
            ...prev,
            codigoValidacao: 'Código incorreto. Use 123456 para teste ou solicite um novo.'
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.codigoValidacao;
            return newErrors;
          });
        }
      }, 600);
    }
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
      const emailValido_check = emailValido !== false;
      const telefoneValido_check = telefoneValido === true;
      return Boolean(camposObrigatoriosPreenchidos && cpfValido_check && emailValido_check && telefoneValido_check);
    } else if (etapaAtual === 2) {
      return codigoValido === true;
    } else if (etapaAtual === 3) {
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
      return true;
    } else if (etapaAtual === 4) {
      if (formData.pularCadastroVeiculo) return true;
      if (!formData.placa.trim()) return false;
      const placaValidacao = validarPlaca(formData.placa);
      return placaValidacao.isValid;
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
      else if (emailValido === false) newErrors.email = 'Formato de e-mail inválido';
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      else if (telefoneValido === false) newErrors.telefone = 'Insira um celular válido com DDD (ex: (11) 98765-4321)';
      if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
      else if (cpfValido === false) newErrors.cpf = 'CPF inválido';
      else if (cpfValido === null && formData.cpf.trim()) newErrors.cpf = 'Aguarde a validação do CPF';
      if (!formData.aceitaTermos) newErrors.aceitaTermos = 'Você deve aceitar os termos de uso';
    } else if (etapaAtual === 2) {
      if (!canalValidacao) {
        newErrors.codigoValidacao = 'Selecione um canal para receber o código';
      } else if (!codigoEnviado) {
        newErrors.codigoValidacao = 'Envie o código de validação primeiro';
      } else if (codigoValido !== true) {
        newErrors.codigoValidacao = 'Insira o código de validação de 6 dígitos para prosseguir';
      }
    } else if (etapaAtual === 3) {
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
      if (!formData.pularCadastroVeiculo) {
        if (!formData.placa.trim()) {
          newErrors.placa = 'Placa é obrigatória';
        } else {
          const placaValidacao = validarPlaca(formData.placa);
          if (!placaValidacao.isValid) {
            newErrors.placa = placaValidacao.error || 'Placa inválida';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const progressoCalculado = useMemo(() => {
    let progress = 0;

    if (etapaAtual === 1) {
      let fieldsCompleted = 0;
      const totalFields = 5;
      if (formData.cpf.trim() && cpfValido === true) fieldsCompleted++;
      if (formData.dataNascimento.trim() && formData.dataNascimento.replace(/\D/g, '').length === 8) fieldsCompleted++;
      if (formData.nome.trim()) fieldsCompleted++;
      if (formData.email.trim() && emailValido !== false) fieldsCompleted++;
      if (formData.aceitaTermos) fieldsCompleted++;
      progress = (fieldsCompleted / totalFields) * 25;
    } else if (etapaAtual === 2) {
      progress = 25;
      if (codigoEnviado) progress += 10;
      if (codigoValido === true) progress += 15;
    } else if (etapaAtual === 3) {
      progress = 50;
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
    } else if (etapaAtual === 4) {
      progress = 75;
      if (formData.pularCadastroVeiculo) {
        progress = 100;
      } else if (formData.placa.trim()) {
        const placaValidacaoLocal = validarPlaca(formData.placa);
        progress = placaValidacaoLocal.isValid ? 100 : 85;
      }
    }

    return Math.max(0, Math.min(100, progress));
  }, [etapaAtual, formData.nome, formData.email, formData.telefone, formData.cpf, formData.aceitaTermos, formData.senha, formData.confirmarSenha, formData.placa, formData.pularCadastroVeiculo, emailValido, cpfValido, telefoneValido, codigoEnviado, codigoValido, formData.dataNascimento]);

  const handleNextStep = () => {
    if (etapaAtual === 1 && emailValidando) {
      return;
    }

    if (isCurrentStepValid()) {
      setEtapaAtual(prev => prev + 1);
    } else {
      validateCurrentStep();
    }
  };

  const handlePreviousStep = () => {
    setEtapaAtual(prev => prev - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCadastrar({
        ...formData,
        canalValidacao: canalValidacao || 'whatsapp',
        codigoValido: true
      });
    }, 1500);
  };

  const handlePularVeiculo = () => {
    const dadosFinais = {
      ...formData,
      placa: '',
      pularCadastroVeiculo: true,
      canalValidacao: canalValidacao || 'whatsapp',
      codigoValido: true
    };
    setFormData(dadosFinais);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCadastrar(dadosFinais);
    }, 1500);
  };

  const getStepTitle = () => {
    switch (etapaAtual) {
      case 1: return 'Dados pessoais';
      case 2: return 'Validação do cadastro';
      case 3: return 'Senha e confirmação';
      case 4: return 'Confirmar veículo';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (etapaAtual) {
      case 1: return <User className="h-6 w-6 text-[#5B2E8C]" />;
      case 2: return <ShieldCheck className="h-6 w-6 text-[#5B2E8C]" />;
      case 3: return <Lock className="h-6 w-6 text-[#5B2E8C]" />;
      case 4: return <Car className="h-6 w-6 text-[#5B2E8C]" />;
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
          <img
            src={logoPedagioSimples}
            alt="Pedágio Simples — by Move Mais"
            className="h-8 w-auto"
          />
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-lg mx-auto">
          {/* Título da seção */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-[#F7F5FB] text-[#8B5FFF] rounded-full px-4 py-2 mb-4 sm:mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-semibold">CADASTRO SEGURO</span>
            </div>

            <p className="text-base sm:text-lg text-[#8A8B95] px-2">
              Para prosseguir com o pagamento, precisamos de algumas informações
            </p>
          </div>

          {/* Indicador de Progresso */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[#1A1B23]">
                Etapa {etapaAtual} de 4
              </span>
              <span className="text-xs sm:text-sm text-[#8A8B95]">
                {Math.round(progressoCalculado)}% concluído
              </span>
            </div>
            <Progress value={progressoCalculado} className="h-2" />
          </div>

          {/* Formulário */}
          <Card className="shadow-lg border border-[#F7F5FB] rounded-xl overflow-hidden w-full">
            <CardHeader className="text-center pb-2 pt-5 sm:pt-6 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl text-[#1A1B23] flex items-center justify-center gap-2 sm:gap-3">
                {getStepIcon()}
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3.5 sm:px-6 pb-6">
              <form onSubmit={etapaAtual === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                
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
                            
                            setCpfValido(null);
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
                      <Label htmlFor="dataNascimento" className="text-[#1A1B23] flex items-center justify-between flex-wrap gap-1">
                        Data de nascimento
                        {cpfAutoPreenchido.includes('dataNascimento') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1 shrink-0">
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
                      <Label htmlFor="nome" className="text-[#1A1B23] flex items-center justify-between flex-wrap gap-1">
                        Nome completo
                        {cpfAutoPreenchido.includes('nome') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1 shrink-0">
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
                      <Label htmlFor="email" className="text-[#1A1B23] flex items-center justify-between flex-wrap gap-1">
                        Email
                        {cpfAutoPreenchido.includes('email') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1 shrink-0">
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
                      {emailValido === true && !errors.email && (
                        <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          E-mail válido
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
                      <Label htmlFor="telefone" className="text-[#1A1B23] flex items-center justify-between flex-wrap gap-1">
                        Telefone
                        {cpfAutoPreenchido.includes('telefone') && (
                          <span className="text-xs text-[#8B5FFF] font-normal flex items-center gap-1 shrink-0">
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

                    {/* Checkbox de Termos */}
                    <div>
                      <label
                        htmlFor="aceitaTermos"
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <Checkbox
                          id="aceitaTermos"
                          checked={formData.aceitaTermos}
                          onCheckedChange={(checked) => handleInputChange('aceitaTermos', checked)}
                          className={`mt-0.5 shrink-0 ${errors.aceitaTermos ? 'border-[#C8324A]' : ''}`}
                        />
                        <span className="text-sm text-[#1A1B23] leading-relaxed">
                          Aceito os{" "}
                          <a href="#" className="text-[#5B2E8C] hover:underline" onClick={(e) => e.preventDefault()}>
                            Termos e condições
                          </a>
                          {" "}e o{" "}
                          <a href="#" className="text-[#5B2E8C] hover:underline" onClick={(e) => e.preventDefault()}>
                            Aviso de privacidade
                          </a>
                        </span>
                      </label>
                      {errors.aceitaTermos && (
                        <p className="text-sm text-[#C8324A] mt-1 pl-7">{errors.aceitaTermos}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Etapa 2: Validação do Cadastro (WhatsApp, SMS ou E-mail) */}
                {etapaAtual === 2 && (
                  <div className="space-y-6">
                    {!codigoEnviado ? (
                      <>
                        <div className="text-center space-y-1.5 pb-1">
                          <p className="text-base font-semibold text-[#1A1B23]">
                            Como deseja receber seu código de verificação?
                          </p>
                          <p className="text-sm text-[#8A8B95]">
                            Escolha um canal para confirmarmos seus dados com segurança.
                          </p>
                        </div>

                        {/* Opções de canais */}
                        <div className="space-y-3">
                          {/* Opção WhatsApp */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setCanalValidacao('whatsapp')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCanalValidacao('whatsapp')}
                            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              canalValidacao === 'whatsapp'
                                ? 'border-[#25D366] bg-[#25D366]/5 shadow-sm ring-1 ring-[#25D366]'
                                : 'border-[#E5E7EB] hover:border-[#25D366]/50 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0">
                                <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#25D366]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#1A1B23] text-sm sm:text-base">WhatsApp</span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#8A8B95] mt-0.5 truncate">
                                  Enviar código para <strong className="text-[#1A1B23]">{mascararTelefone(formData.telefone)}</strong>
                                </p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              canalValidacao === 'whatsapp' ? 'border-[#25D366] bg-[#25D366]' : 'border-[#DCDDE3]'
                            }`}>
                              {canalValidacao === 'whatsapp' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </div>

                          {/* Opção SMS */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setCanalValidacao('sms')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCanalValidacao('sms')}
                            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              canalValidacao === 'sms'
                                ? 'border-[#5B2E8C] bg-[#5B2E8C]/5 shadow-sm ring-1 ring-[#5B2E8C]'
                                : 'border-[#E5E7EB] hover:border-[#8B5FFF]/50 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#5B2E8C]/10 flex items-center justify-center shrink-0 text-[#5B2E8C]">
                                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#1A1B23] text-sm sm:text-base">Mensagem SMS</span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#8A8B95] mt-0.5 truncate">
                                  Enviar torpedo para <strong className="text-[#1A1B23]">{mascararTelefone(formData.telefone)}</strong>
                                </p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              canalValidacao === 'sms' ? 'border-[#5B2E8C] bg-[#5B2E8C]' : 'border-[#DCDDE3]'
                            }`}>
                              {canalValidacao === 'sms' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </div>

                          {/* Opção E-mail */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setCanalValidacao('email')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCanalValidacao('email')}
                            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              canalValidacao === 'email'
                                ? 'border-[#5B2E8C] bg-[#5B2E8C]/5 shadow-sm ring-1 ring-[#5B2E8C]'
                                : 'border-[#E5E7EB] hover:border-[#8B5FFF]/50 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#5B2E8C]/10 flex items-center justify-center shrink-0 text-[#5B2E8C]">
                                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#1A1B23] text-sm sm:text-base">E-mail</span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#8A8B95] mt-0.5 truncate">
                                  Enviar código para <strong className="text-[#1A1B23]">{mascararEmail(formData.email)}</strong>
                                </p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              canalValidacao === 'email' ? 'border-[#5B2E8C] bg-[#5B2E8C]' : 'border-[#DCDDE3]'
                            }`}>
                              {canalValidacao === 'email' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </div>
                        </div>

                        {/* Botão de Enviar Código */}
                        <div className="pt-2">
                          <Button
                            type="button"
                            size="lg"
                            onClick={() => canalValidacao && enviarCodigoValidacao(canalValidacao)}
                            disabled={enviandoCodigo || !canalValidacao}
                            className={`w-full py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                              canalValidacao && !enviandoCodigo
                                ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white'
                                : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                            }`}
                          >
                            {enviandoCodigo ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Enviando código...
                              </>
                            ) : canalValidacao ? (
                              <>
                                {canalValidacao === 'whatsapp' ? (
                                  <WhatsAppIcon className="h-5 w-5" />
                                ) : canalValidacao === 'sms' ? (
                                  <Smartphone className="h-5 w-5" />
                                ) : (
                                  <Mail className="h-5 w-5" />
                                )}
                                Enviar código via {canalValidacao === 'whatsapp' ? 'WhatsApp' : canalValidacao === 'sms' ? 'SMS' : 'E-mail'}
                              </>
                            ) : (
                              'Selecione um canal para receber o código'
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      /* Estado 2: Código enviado - Inserção dos 6 dígitos */
                      <div className="space-y-6">
                        {/* Resumo do canal selecionado */}
                        <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                              {canalValidacao === 'whatsapp' ? (
                                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                              ) : canalValidacao === 'sms' ? (
                                <Smartphone className="h-5 w-5 text-[#5B2E8C]" />
                              ) : (
                                <Mail className="h-5 w-5 text-[#5B2E8C]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] sm:text-xs text-[#8A8B95]">
                                Código enviado via {canalValidacao === 'whatsapp' ? 'WhatsApp' : canalValidacao === 'sms' ? 'SMS' : 'E-mail'}
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-[#1A1B23] truncate">
                                {canalValidacao === 'email' ? mascararEmail(formData.email) : mascararTelefone(formData.telefone)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleTrocarCanal}
                            className="text-xs font-semibold text-[#5B2E8C] hover:text-[#8B5FFF] hover:underline shrink-0 ml-1"
                          >
                            Alterar canal
                          </button>
                        </div>

                        {/* Card com código de teste para demonstração */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <KeyRound className="h-4 w-4 text-amber-600 shrink-0" />
                            <span className="truncate">Código de teste: <strong className="font-mono text-sm tracking-wider">123456</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCodigoChange('123456')}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline shrink-0"
                          >
                            Preencher código
                          </button>
                        </div>

                        {/* Campo de Código */}
                        <div className="space-y-3">
                          <Label htmlFor="codigoValidacaoInput" className="text-sm font-medium text-[#1A1B23] text-center block">
                            Digite o código de 6 dígitos
                          </Label>
                          <div className="relative">
                            <Input
                              id="codigoValidacaoInput"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              autoComplete="one-time-code"
                              placeholder="000000"
                              value={codigoValidacao}
                              onChange={(e) => handleCodigoChange(e.target.value)}
                              className={`text-xl sm:text-2xl py-3 sm:py-4 text-center tracking-[0.35em] sm:tracking-[0.6rem] font-mono font-bold border-2 rounded-xl focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
                                errors.codigoValidacao ? 'border-[#C8324A]' : 
                                codigoValido === true ? 'border-[#0E8B5A] bg-[#0E8B5A]/5' : 
                                'border-[#DCDDE3]'
                              }`}
                              maxLength={6}
                              autoFocus
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              {validandoCodigo && (
                                <Loader2 className="h-5 w-5 animate-spin text-[#5B2E8C]" />
                              )}
                              {!validandoCodigo && codigoValido === true && (
                                <CheckCircle className="h-6 w-6 text-[#0E8B5A]" />
                              )}
                              {!validandoCodigo && codigoValido === false && (
                                <XCircle className="h-6 w-6 text-[#C8324A]" />
                              )}
                            </div>
                          </div>

                          {errors.codigoValidacao && (
                            <p className="text-sm text-[#C8324A] text-center flex items-center justify-center gap-1">
                              <XCircle className="h-4 w-4" />
                              {errors.codigoValidacao}
                            </p>
                          )}

                          {codigoValido === true && !errors.codigoValidacao && (
                            <p className="text-sm text-[#0E8B5A] text-center font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
                              <CheckCircle className="h-4 w-4" />
                              Código validado com sucesso!
                            </p>
                          )}

                          {validandoCodigo && (
                            <p className="text-sm text-[#8A8B95] text-center flex items-center justify-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin text-[#5B2E8C]" />
                              Validando código...
                            </p>
                          )}
                        </div>

                        {/* Reenvio de código */}
                        <div className="text-center pt-2">
                          <p className="text-xs text-[#8A8B95] mb-2">Não recebeu o código?</p>
                          <button
                            type="button"
                            disabled={tempoReenvio > 0 || enviandoCodigo}
                            onClick={() => reenviarCodigo()}
                            className={`text-xs font-semibold inline-flex items-center gap-1.5 ${
                              tempoReenvio > 0 
                                ? 'text-[#8A8B95] cursor-not-allowed' 
                                : 'text-[#5B2E8C] hover:text-[#8B5FFF] hover:underline'
                            }`}
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${tempoReenvio > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
                            {tempoReenvio > 0 ? `Reenviar código em ${tempoReenvio}s` : 'Reenviar código'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Etapa 3: Senha */}
                {etapaAtual === 3 && (
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
                                {requisitosSenha.tamanho ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <span>Mínimo 8 caracteres</span>
                              </div>
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.maiuscula ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.maiuscula ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <span>1 letra maiúscula (A-Z)</span>
                              </div>
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.minuscula ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.minuscula ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <span>1 letra minúscula (a-z)</span>
                              </div>
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.numero ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.numero ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <span>1 número (0-9)</span>
                              </div>
                              <div className={`flex items-center gap-2 text-sm ${
                                requisitosSenha.especial ? 'text-[#0E8B5A]' : 'text-[#8A8B95]'
                              }`}>
                                {requisitosSenha.especial ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <span>1 caractere especial (!@#$%^&*)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {errors.senha && (
                        <p className="text-sm text-[#C8324A] flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {errors.senha}
                        </p>
                      )}
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
                      
                      {errors.confirmarSenha && (
                        <p className="text-sm text-[#C8324A] flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {errors.confirmarSenha}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Etapa 4: Confirmação da Placa */}
                {etapaAtual === 4 && (
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
                          if (formData.pularCadastroVeiculo) {
                            setFormData(prev => ({ ...prev, pularCadastroVeiculo: false }));
                          }
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
                  {etapaAtual === 1 && (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!isCurrentStepValid() || emailValidando}
                      className={`w-full py-3.5 sm:py-4 text-base sm:text-lg rounded-xl font-medium transition-colors ${
                        isCurrentStepValid() && !emailValidando
                          ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white shadow-md'
                          : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                      }`}
                    >
                      Continuar <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}

                  {etapaAtual === 2 && codigoEnviado && (
                    <Button
                      type="button"
                      size="lg"
                      disabled={!isCurrentStepValid()}
                      onClick={handleNextStep}
                      className={`w-full py-3.5 sm:py-4 text-base sm:text-lg rounded-xl font-medium transition-colors ${
                        isCurrentStepValid()
                          ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white shadow-md'
                          : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                      }`}
                    >
                      Continuar para Senha <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}

                  {etapaAtual === 3 && (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!isCurrentStepValid()}
                      className={`w-full py-3.5 sm:py-4 text-base sm:text-lg rounded-xl font-medium transition-colors ${
                        isCurrentStepValid()
                          ? 'bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white shadow-md'
                          : 'bg-[#C6C7CF] text-[#8A8B95] cursor-not-allowed'
                      }`}
                    >
                      Continuar <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}

                  {etapaAtual === 4 && (
                    <>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white py-3.5 sm:py-4 text-base sm:text-lg rounded-xl font-medium transition-colors shadow-md"
                        disabled={loading || !isCurrentStepValid()}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Criar conta e prosseguir
                          </>
                        )}
                      </Button>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={handlePularVeiculo}
                          disabled={loading}
                          className="text-xs sm:text-sm text-[#8A8B95] hover:text-[#5B2E8C] underline underline-offset-2 transition-colors"
                        >
                          Criar conta sem vincular este veículo
                        </button>
                        <p className="text-xs text-[#C6C7CF] mt-1.5">
                          Você poderá cadastrar veículos depois pelo dashboard
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </form>

              {/* Link para login - apenas na primeira etapa */}
              {etapaAtual === 1 && onLogin && (
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={onLogin}
                    className="w-full py-3 text-base text-[#5B2E8C] hover:text-[#8B5FFF] font-medium transition-colors text-center"
                  >
                    Já tenho cadastro
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}