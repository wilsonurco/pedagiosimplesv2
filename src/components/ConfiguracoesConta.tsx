import { useState } from "react";
import { AlertasInteligentes } from "./AlertasInteligentes";
import { AutomacaoPagamentos } from "./AutomacaoPagamentos";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Edit,
  MapPin,
  Loader2,
  XCircle,
  Zap
} from "lucide-react";

interface ConfiguracoesContaProps {
  dadosUsuario: any;
  onLogout: () => void;
}

export function ConfiguracoesConta({ dadosUsuario, onLogout }: ConfiguracoesContaProps) {
  const [dadosPessoais, setDadosPessoais] = useState({
    nome: dadosUsuario?.nome || '',
    email: dadosUsuario?.email || '',
    telefone: dadosUsuario?.telefone || '',
    cpf: dadosUsuario?.cpf || '',
    cep: dadosUsuario?.cep || '',
    endereco: dadosUsuario?.endereco || '',
    numero: dadosUsuario?.numero || '',
    bairro: dadosUsuario?.bairro || '',
    cidade: dadosUsuario?.cidade || '',
    estado: dadosUsuario?.estado || ''
  });

  const [senhas, setSenhas] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);

  // Estados para validação de e-mail
  const [emailOriginal] = useState(dadosUsuario?.email || '');
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

  const getInitials = (nome: string) => {
    if (!nome) return 'U';
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const [consultandoCEP, setConsultandoCEP] = useState(false);

  // Função para validar e-mail
  const validarEmail = async (email: string) => {
    // Regex avançado para validação de formato
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      setEmailValido(false);
      return;
    }

    setEmailValidando(true);

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
        return;
      }

      // Verificar se o domínio tem formato válido
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        setEmailValido(false);
        return;
      }

      // Domínios comuns
      const commonDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
        'uol.com.br', 'bol.com.br', 'terra.com.br', 'globo.com',
        'live.com', 'icloud.com', 'me.com', 'protonmail.com',
        'company.com', 'empresa.com.br'
      ];

      // Se for um domínio comum, aceitar imediatamente
      if (commonDomains.includes(domain.toLowerCase())) {
        setEmailValido(true);
        return;
      }

      // Para outros domínios, simular uma verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular 90% de sucesso para domínios não conhecidos
      const isValid = Math.random() > 0.1;
      
      if (isValid) {
        setEmailValido(true);
      } else {
        setEmailValido(false);
      }

    } catch (error) {
      setEmailValido(false);
    } finally {
      setEmailValidando(false);
    }
  };

  // Função para lidar com mudança de e-mail
  const handleEmailChange = (email: string) => {
    setDadosPessoais(prev => ({ ...prev, email }));
    
    // Reset estados de validação
    setEmailValido(null);
    setEmailValidando(false);
    setCodigoEnviado(false);
    setCodigoValidacao('');
    setCodigoCorreto('');
    setCodigoValido(null);
    setTempoReenvio(0);
    setModalCodigoAberto(false);
    
    // Limpar timeout anterior
    if (emailTimeout) {
      clearTimeout(emailTimeout);
    }
    
    // Se email estiver vazio ou igual ao original, não validar
    if (!email.trim() || email === emailOriginal) {
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
      setModalCodigoAberto(true);
      
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

  // Função para reenviar código do modal
  const reenviarCodigoDoModal = () => {
    // Gerar novo código
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoCorreto(novoCodigo);
    setCodigoValidacao('');
    
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

  const consultarCEP = async (cep: string) => {
    const cepNumeros = cep.replace(/\D/g, '');
    
    if (cepNumeros.length !== 8) return;

    setConsultandoCEP(true);

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!data.erro) {
        // Preencher automaticamente os campos de endereço
        setDadosPessoais(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado
        }));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('CEP consultation timed out:', error);
      } else {
        console.error('Erro ao consultar CEP:', error);
      }
    } finally {
      setConsultandoCEP(false);
    }
  };

  const handleSalvarPerfil = () => {
    // Validação básica dos campos obrigatórios
    if (!dadosPessoais.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!dadosPessoais.email.trim()) {
      toast.error('E-mail é obrigatório');
      return;
    }

    // Se o e-mail foi alterado, precisa validar com código
    const emailMudou = dadosPessoais.email !== emailOriginal;
    
    if (emailMudou) {
      // Se e-mail mudou mas não foi validado ainda, enviar código
      if (!codigoEnviado && emailValido === true) {
        enviarCodigoValidacao();
        return;
      }
      
      // Se código foi enviado mas não validado ainda
      if (codigoEnviado && codigoValido !== true) {
        toast.error('Por favor, valide o novo e-mail com o código enviado.');
        setModalCodigoAberto(true);
        return;
      }
    }

    toast.success('✓ Alterações salvas com sucesso!', {
      description: 'Suas informações pessoais foram atualizadas.',
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#5B2E8C',
        color: '#ffffff',
        border: '2px solid #8B5FFF',
        fontSize: '16px',
        fontWeight: '500',
      },
    });
    
    setEditandoPerfil(false);
    
    // Reset estados de validação após salvar
    setEmailValido(null);
    setCodigoEnviado(false);
    setCodigoValidacao('');
    setCodigoCorreto('');
    setCodigoValido(null);
  };

  const handleAlterarSenha = () => {
    if (senhas.novaSenha !== senhas.confirmarSenha) {
      toast.error('Senhas não coincidem');
      return;
    }
    if (senhas.novaSenha.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    toast.success('✓ Senha alterada com sucesso!', {
      description: 'Sua senha foi atualizada com segurança.',
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#5B2E8C',
        color: '#ffffff',
        border: '2px solid #8B5FFF',
        fontSize: '16px',
        fontWeight: '500',
      },
    });
    
    setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    setAlterandoSenha(false);
  };

  return (
    <div className="space-y-6">
      {/* Informações da Conta */}
      <Card className="border border-[#DCDDE3]">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-semibold text-[#5B2E8C] flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-5">

          {/* Avatar + nome + badge */}
          <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-[#ECECF1]">
            <Avatar className="h-16 w-16 mb-3">
              <AvatarFallback className="bg-[#5B2E8C]/10 text-[#5B2E8C] text-xl font-bold">
                {getInitials(dadosPessoais.nome)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-bold text-[#1A1B23] mb-2 leading-tight">
              {dadosPessoais.nome}
            </h3>
            <Badge className="bg-[#0E8B5A] hover:bg-[#0E8B5A] text-white text-xs px-3 py-1 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1.5" />
              Verificado
            </Badge>
          </div>

          {/* Grid de dados: label small-caps + valor */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">

            {/* E-mail */}
            <div className="col-span-2">
              <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
                <Mail className="h-3 w-3" />
                E-mail
              </p>
              <p className="text-sm font-medium text-[#1A1B23] truncate">{dadosPessoais.email || '—'}</p>
            </div>

            {/* Telefone */}
            <div>
              <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
                <Phone className="h-3 w-3" />
                Telefone
              </p>
              <p className="text-sm font-medium text-[#1A1B23]">{dadosPessoais.telefone || '—'}</p>
            </div>

            {/* CPF */}
            <div>
              <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
                <User className="h-3 w-3" />
                CPF
              </p>
              <p className="text-sm font-medium text-[#1A1B23]">{dadosPessoais.cpf || '—'}</p>
            </div>

            {/* Localização — só exibe se tiver dado */}
            {(dadosPessoais.cidade || dadosPessoais.estado) && (
              <div className="col-span-2">
                <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" />
                  Localização
                </p>
                <p className="text-sm font-medium text-[#1A1B23]">
                  {[dadosPessoais.cidade, dadosPessoais.estado].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {/* Membro desde */}
            <div className="col-span-2 pt-4 border-t border-[#ECECF1]">
              <p className="text-[10px] font-medium text-[#8A8B95] uppercase tracking-widest leading-none flex items-center gap-1 mb-1">
                <Shield className="h-3 w-3" />
                Membro desde
              </p>
              <p className="text-sm font-medium text-[#1A1B23]">16/10/2024</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dados Pessoais</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setEditandoPerfil(!editandoPerfil)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {editandoPerfil ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={dadosPessoais.nome}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, nome: e.target.value }))}
                disabled={!editandoPerfil}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={dadosPessoais.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  disabled={!editandoPerfil}
                  className={`pr-12 ${
                    dadosPessoais.email !== emailOriginal ? (
                      emailValido === true ? 'border-[#0E8B5A]' : 
                      emailValido === false ? 'border-[#C8324A]' : ''
                    ) : ''
                  }`}
                />
                {dadosPessoais.email !== emailOriginal && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValidando && (
                      <Loader2 className="h-5 w-5 animate-spin text-[#5B2E8C]" />
                    )}
                    {!emailValidando && emailValido === true && !codigoEnviado && (
                      <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                    )}
                    {!emailValidando && codigoValido === true && (
                      <CheckCircle className="h-5 w-5 text-[#0E8B5A]" />
                    )}
                    {!emailValidando && emailValido === false && (
                      <XCircle className="h-5 w-5 text-[#C8324A]" />
                    )}
                  </div>
                )}
              </div>
              {dadosPessoais.email !== emailOriginal && (
                <>
                  {emailValido === true && !codigoEnviado && !emailValidando && (
                    <>
                      <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        E-mail válido
                      </p>
                      <Button
                        type="button"
                        onClick={enviarCodigoValidacao}
                        disabled={emailValidando}
                        className="w-full bg-[#5B2E8C] hover:bg-[#8B5FFF] text-white mt-2"
                      >
                        {emailValidando ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando código...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar código de validação
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {codigoEnviado && codigoValido !== true && (
                    <p className="text-sm text-[#8B5FFF] flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Código enviado! Verifique seu e-mail.
                    </p>
                  )}
                  {codigoValido === true && (
                    <p className="text-sm text-[#0E8B5A] flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      E-mail validado com código
                    </p>
                  )}
                  {emailValidando && (
                    <p className="text-sm text-[#8A8B95] flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verificando e-mail...
                    </p>
                  )}
                  {emailValido === false && (
                    <p className="text-sm text-[#C8324A] flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      E-mail inválido
                    </p>
                  )}
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={dadosPessoais.telefone}
                onChange={(e) => setDadosPessoais(prev => ({ 
                  ...prev, 
                  telefone: formatPhone(e.target.value) 
                }))}
                disabled={!editandoPerfil}
                maxLength={15}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={dadosPessoais.cpf}
                onChange={(e) => setDadosPessoais(prev => ({ 
                  ...prev, 
                  cpf: formatCPF(e.target.value) 
                }))}
                disabled={true} // CPF não pode ser alterado
                maxLength={14}
              />
              <p className="text-xs text-[#8A8B95]">CPF não pode ser alterado por questões de segurança</p>
            </div>
          </div>
          
          {editandoPerfil && (
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSalvarPerfil}>
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditandoPerfil(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setEditandoEndereco(!editandoEndereco)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {editandoEndereco ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  value={dadosPessoais.cep}
                  onChange={(e) => {
                    const cepFormatado = formatCEP(e.target.value);
                    setDadosPessoais(prev => ({ ...prev, cep: cepFormatado }));
                    
                    // Consultar automaticamente quando CEP estiver completo
                    if (cepFormatado.replace(/\D/g, '').length === 8 && editandoEndereco) {
                      consultarCEP(cepFormatado);
                    }
                  }}
                  disabled={!editandoEndereco}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {consultandoCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5B2E8C]"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={dadosPessoais.estado}
                onChange={(e) => setDadosPessoais(prev => ({ 
                  ...prev, 
                  estado: e.target.value.toUpperCase() 
                }))}
                disabled={!editandoEndereco}
                placeholder="SP"
                maxLength={2}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={dadosPessoais.endereco}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, endereco: e.target.value }))}
                disabled={!editandoEndereco}
                placeholder="Rua, Avenida, Travessa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={dadosPessoais.numero}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, numero: e.target.value }))}
                disabled={!editandoEndereco}
                placeholder="Nº"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={dadosPessoais.bairro}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, bairro: e.target.value }))}
                disabled={!editandoEndereco}
                placeholder="Nome do bairro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={dadosPessoais.cidade}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, cidade: e.target.value }))}
                disabled={!editandoEndereco}
                placeholder="Nome da cidade"
              />
            </div>
          </div>

          {editandoEndereco && (
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => {
                  // Validação básica
                  if (!dadosPessoais.cep || !dadosPessoais.endereco || !dadosPessoais.cidade || !dadosPessoais.estado) {
                    toast.error('Por favor, preencha todos os campos obrigatórios');
                    return;
                  }

                  // Simular salvamento
                  toast.success('Endereço atualizado com sucesso!');
                  setEditandoEndereco(false);
                }}
              >
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditandoEndereco(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Segurança
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setAlterandoSenha(!alterandoSenha)}
          >
            <Lock className="h-4 w-4 mr-2" />
            {alterandoSenha ? 'Cancelar' : 'Alterar Senha'}
          </Button>
        </CardHeader>
        <CardContent>
          {alterandoSenha ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={mostrarSenhas.atual ? "text" : "password"}
                    value={senhas.senhaAtual}
                    onChange={(e) => setSenhas(prev => ({ ...prev, senhaAtual: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarSenhas(prev => ({ ...prev, atual: !prev.atual }))}
                  >
                    {mostrarSenhas.atual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={mostrarSenhas.nova ? "text" : "password"}
                    value={senhas.novaSenha}
                    onChange={(e) => setSenhas(prev => ({ ...prev, novaSenha: e.target.value }))}
                    placeholder="Digite sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarSenhas(prev => ({ ...prev, nova: !prev.nova }))}
                  >
                    {mostrarSenhas.nova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={mostrarSenhas.confirmar ? "text" : "password"}
                    value={senhas.confirmarSenha}
                    onChange={(e) => setSenhas(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarSenhas(prev => ({ ...prev, confirmar: !prev.confirmar }))}
                  >
                    {mostrarSenhas.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-lg p-3">
                <h4 className="font-semibold text-[#2E1547] mb-2">Requisitos da senha:</h4>
                <ul className="text-sm text-[#5B2E8C] space-y-1">
                  <li>• Mínimo de 6 caracteres</li>
                  <li>• Recomendado: use letras, números e símbolos</li>
                  <li>• Evite senhas óbvias ou pessoais</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAlterarSenha}>
                  Alterar Senha
                </Button>
                <Button variant="outline" onClick={() => setAlterandoSenha(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações e Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertasInteligentes />
        </CardContent>
      </Card>


      {/* Automação de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automação de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AutomacaoPagamentos />
        </CardContent>
      </Card>

      {/* Modal para Validação do Código de E-mail */}
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
                {dadosPessoais.email}
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
                  placeholder="000000"
                  value={codigoValidacao}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCodigoValidacao(valor);
                    setCodigoValido(null);
                    
                    // Validar automaticamente quando código estiver completo
                    if (valor.length === 6) {
                      setValidandoCodigo(true);
                      
                      setTimeout(() => {
                        const valido = valor === codigoCorreto;
                        setCodigoValido(valido);
                        setValidandoCodigo(false);
                        
                        if (valido) {
                          setEmailValido(true);
                          // Fechar modal após validação bem-sucedida
                          setTimeout(() => setModalCodigoAberto(false), 800);
                        }
                      }, 1000);
                    }
                  }}
                  className={`text-xl py-4 text-center tracking-[0.5rem] font-mono border-2 focus:border-[#5B2E8C] focus:ring-[#5B2E8C] ${
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
              {codigoValido === false && (
                <p className="text-sm text-[#C8324A] text-center flex items-center justify-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Código inválido. Verifique e tente novamente.
                </p>
              )}
              
              {codigoValido === true && (
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