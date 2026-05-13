import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Star,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";

interface CartaoSalvo {
  id: string;
  numero: string;
  bandeira: 'visa' | 'mastercard' | 'elo' | 'amex';
  nomePortador: string;
  validade: string;
  isPrincipal: boolean;
  isAtivo: boolean;
  ultimoUso: string;
  cobrancaAutomatica?: boolean;
}

interface ChavePix {
  id: string;
  tipo: 'cpf' | 'email' | 'telefone' | 'chave-aleatoria';
  valor: string;
  isPrincipal: boolean;
  isAtivo: boolean;
}

export function MetodosPagamento() {
  const [cartoesSalvos, setCartoesSalvos] = useState<CartaoSalvo[]>([
    {
      id: "card-1",
      numero: "**** **** **** 1234",
      bandeira: "visa",
      nomePortador: "JOÃO SILVA",
      validade: "12/28",
      isPrincipal: true,
      isAtivo: true,
      ultimoUso: "2025-01-10",
      cobrancaAutomatica: true
    },
    {
      id: "card-2", 
      numero: "**** **** **** 5678",
      bandeira: "mastercard",
      nomePortador: "JOÃO SILVA",
      validade: "08/27",
      isPrincipal: false,
      isAtivo: true,
      ultimoUso: "2024-12-28",
      cobrancaAutomatica: false
    }
  ]);

  const [chavesPix, setChavesPix] = useState<ChavePix[]>([
    {
      id: "pix-1",
      tipo: "cpf",
      valor: "123.456.789-00",
      isPrincipal: true,
      isAtivo: true
    },
    {
      id: "pix-2",
      tipo: "email", 
      valor: "joao@email.com",
      isPrincipal: false,
      isAtivo: true
    }
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<'cartao' | 'pix'>('cartao');
  const [mostrarCvv, setMostrarCvv] = useState(false);

  const [novoCartao, setNovoCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
    isPrincipal: false,
    cobrancaAutomatica: false
  });

  const [novoPix, setNovoPix] = useState({
    tipo: 'cpf' as 'cpf' | 'email' | 'telefone' | 'chave-aleatoria',
    valor: '',
    isPrincipal: false
  });

  const getBandeiraIcon = (bandeira: string) => {
    // Simulando ícones das bandeiras
    const cores = {
      visa: 'bg-blue-600',
      mastercard: 'bg-[#C8324A]', 
      elo: 'bg-yellow-600',
      amex: 'bg-[#0E8B5A]'
    };
    return cores[bandeira as keyof typeof cores] || 'bg-[#8A8B95]';
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatValidade = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
    return numbers;
  };

  const formatPixValue = (tipo: string, value: string) => {
    switch (tipo) {
      case 'cpf':
        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'telefone':
        return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      default:
        return value;
    }
  };

  const handleSalvarCartao = () => {
    const novoCartaoData: CartaoSalvo = {
      id: `card-${Date.now()}`,
      numero: `**** **** **** ${novoCartao.numero.slice(-4)}`,
      bandeira: 'visa', // Detectar automaticamente baseado no número
      nomePortador: novoCartao.nome.toUpperCase(),
      validade: novoCartao.validade,
      isPrincipal: novoCartao.isPrincipal,
      isAtivo: true,
      ultimoUso: new Date().toISOString().split('T')[0],
      cobrancaAutomatica: novoCartao.cobrancaAutomatica
    };

    if (novoCartao.isPrincipal) {
      setCartoesSalvos(prev => prev.map(c => ({ ...c, isPrincipal: false })));
    }

    // Se ativou cobrança automática, desativar dos outros cartões
    if (novoCartao.cobrancaAutomatica) {
      setCartoesSalvos(prev => prev.map(c => ({ ...c, cobrancaAutomatica: false })));
    }

    setCartoesSalvos(prev => [...prev, novoCartaoData]);
    setNovoCartao({ numero: '', nome: '', validade: '', cvv: '', isPrincipal: false, cobrancaAutomatica: false });
    setModalAberto(false);
  };

  const handleSalvarPix = () => {
    const novoPixData: ChavePix = {
      id: `pix-${Date.now()}`,
      tipo: novoPix.tipo,
      valor: formatPixValue(novoPix.tipo, novoPix.valor),
      isPrincipal: novoPix.isPrincipal,
      isAtivo: true
    };

    if (novoPix.isPrincipal) {
      setChavesPix(prev => prev.map(p => ({ ...p, isPrincipal: false })));
    }

    setChavesPix(prev => [...prev, novoPixData]);
    setNovoPix({ tipo: 'cpf', valor: '', isPrincipal: false });
    setModalAberto(false);
  };

  const handleDefinirPrincipal = (id: string, tipo: 'cartao' | 'pix') => {
    if (tipo === 'cartao') {
      setCartoesSalvos(prev => prev.map(c => ({
        ...c,
        isPrincipal: c.id === id
      })));
    } else {
      setChavesPix(prev => prev.map(p => ({
        ...p,
        isPrincipal: p.id === id
      })));
    }
  };

  const handleRemover = (id: string, tipo: 'cartao' | 'pix') => {
    if (tipo === 'cartao') {
      setCartoesSalvos(prev => prev.filter(c => c.id !== id));
    } else {
      setChavesPix(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleToggleCobrancaAutomatica = (id: string) => {
    setCartoesSalvos(prev => prev.map(c => {
      if (c.id === id) {
        // Se está ativando cobrança automática neste cartão, desativar nos outros
        if (!c.cobrancaAutomatica) {
          prev.forEach(otherCard => {
            if (otherCard.id !== id) {
              otherCard.cobrancaAutomatica = false;
            }
          });
        }
        return { ...c, cobrancaAutomatica: !c.cobrancaAutomatica };
      }
      return c;
    }));
  };

  const abrirModal = (tipo: 'cartao' | 'pix') => {
    setTipoModal(tipo);
    setModalAberto(true);
  };

  return (
    <div className="space-y-6">
      {/* Resumo dos métodos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8A8B95]">Cartões Salvos</p>
                <p className="text-2xl font-bold text-[#5B2E8C]">
                  {cartoesSalvos.filter(c => c.isAtivo).length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-[#5B2E8C]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8A8B95]">Chaves PIX</p>
                <p className="text-2xl font-bold text-[#0E8B5A]">
                  {chavesPix.filter(p => p.isAtivo).length}
                </p>
              </div>
              <QrCode className="h-8 w-8 text-[#0E8B5A]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartões de Crédito */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Cartões de Crédito
          </CardTitle>
          <Button onClick={() => abrirModal('cartao')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Cartão
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartoesSalvos.length > 0 ? (
              cartoesSalvos.map((cartao) => (
                <div key={cartao.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-8 ${getBandeiraIcon(cartao.bandeira)} rounded flex items-center justify-center`}>
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#1A1B23]">{cartao.numero}</p>
                          {cartao.isPrincipal && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                          {cartao.cobrancaAutomatica && (
                            <Badge variant="outline" className="text-xs border-[#C9AEEA] text-[#5B2E8C] bg-[#F4EFFB]">
                              <Zap className="h-3 w-3 mr-1" />
                              Cobrança Automática
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#8A8B95]">{cartao.nomePortador}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-[#8A8B95]">
                            Válido até {cartao.validade} • Último uso: {new Date(cartao.ultimoUso).toLocaleDateString('pt-BR')}
                          </p>
                          {cartao.cobrancaAutomatica && (
                            <p className="text-xs text-[#5B2E8C] font-medium flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Cobrança automática ativa - Protege contra multas futuras
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!cartao.isPrincipal && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDefinirPrincipal(cartao.id, 'cartao')}
                        >
                          Definir Principal
                        </Button>
                      )}
                      
                      <Button 
                        variant={cartao.cobrancaAutomatica ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleCobrancaAutomatica(cartao.id)}
                        className={cartao.cobrancaAutomatica ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        <Zap className="h-4 w-4" />
                        {cartao.cobrancaAutomatica ? "Automático ON" : "Ativar Auto"}
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemover(cartao.id, 'cartao')}
                        className="text-[#C8324A] hover:text-[#A3203B]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-[#8A8B95] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1A1B23] mb-2">
                  Nenhum cartão salvo
                </h3>
                <p className="text-[#8A8B95] mb-4">
                  Adicione um cartão para pagamentos mais rápidos
                </p>
                <Button onClick={() => abrirModal('cartao')}>
                  Adicionar Primeiro Cartão
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold text-[#1A1B23]">Salvamento Automático</h4>
              <p className="text-sm text-[#8A8B95]">
                Salvar automaticamente métodos de pagamento para futuros pagamentos
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold text-[#1A1B23]">Confirmação de Pagamento</h4>
              <p className="text-sm text-[#8A8B95]">
                Solicitar confirmação antes de processar pagamentos
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold text-[#1A1B23]">Notificações de Transação</h4>
              <p className="text-sm text-[#8A8B95]">
                Receber notificações por email sobre pagamentos realizados
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold text-[#1A1B23] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#5B2E8C]" />
                Cobrança Automática
              </h4>
              <p className="text-sm text-[#8A8B95]">
                Permitir cobrança automática para pendências futuras de pedágio
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Modal para adicionar método de pagamento */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              'Adicionar Chave PIX'
            </DialogTitle>
            <DialogDescription>
              'Adicione uma chave PIX para pagamentos rápidos e seguros.'
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {tipoModal === 'cartao' ? (
              // Formulário do cartão
              <>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número do Cartão</Label>
                  <Input
                    id="numero"
                    placeholder="0000 0000 0000 0000"
                    value={novoCartao.numero}
                    onChange={(e) => setNovoCartao(prev => ({ 
                      ...prev, 
                      numero: formatCardNumber(e.target.value) 
                    }))}
                    maxLength={19}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome no Cartão</Label>
                  <Input
                    id="nome"
                    placeholder="NOME COMPLETO"
                    value={novoCartao.nome}
                    onChange={(e) => setNovoCartao(prev => ({ 
                      ...prev, 
                      nome: e.target.value.toUpperCase() 
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validade">Validade</Label>
                    <Input
                      id="validade"
                      placeholder="MM/AA"
                      value={novoCartao.validade}
                      onChange={(e) => setNovoCartao(prev => ({ 
                        ...prev, 
                        validade: formatValidade(e.target.value) 
                      }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="cvv"
                        type={mostrarCvv ? "text" : "password"}
                        placeholder="000"
                        value={novoCartao.cvv}
                        onChange={(e) => setNovoCartao(prev => ({ 
                          ...prev, 
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                        }))}
                        maxLength={4}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setMostrarCvv(!mostrarCvv)}
                      >
                        {mostrarCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="principal-cartao"
                      checked={novoCartao.isPrincipal}
                      onCheckedChange={(checked) => setNovoCartao(prev => ({ 
                        ...prev, 
                        isPrincipal: checked 
                      }))}
                    />
                    <Label htmlFor="principal-cartao" className="text-sm">
                      Definir como cartão principal
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Switch
                      id="cobranca-automatica"
                      checked={novoCartao.cobrancaAutomatica}
                      onCheckedChange={(checked) => setNovoCartao(prev => ({ 
                        ...prev, 
                        cobrancaAutomatica: checked 
                      }))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="cobranca-automatica" className="text-sm flex items-center gap-1">
                        <Zap className="h-3 w-3 text-[#5B2E8C]" />
                        Cobrança automática para passagens futuras
                      </Label>
                      <p className="text-xs text-[#8A8B95] leading-tight">
                        Este cartão será usado automaticamente para quitar pendências de pedágio detectadas no futuro, evitando multas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alerta sobre cobrança automática */}
                {novoCartao.cobrancaAutomatica && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-[#C9AEEA] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#E5D8F5] rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="h-4 w-4 text-[#5B2E8C]" />
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-[#2E1547]">Como funciona a cobrança automática?</h5>
                        <ul className="text-xs text-[#5B2E8C] space-y-1">
                          <li>• Monitoramos automaticamente pendências do seu veículo</li>
                          <li>• Cobramos apenas passagens de pedágio válidas</li>
                          <li>• Você recebe notificação antes e após cada cobrança</li>
                          <li>• Pode cancelar a qualquer momento nas configurações</li>
                          <li>• Evita multas e pontos na CNH automaticamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#F4EFFB] border border-[#C9AEEA] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[#5B2E8C]">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-semibold">Segurança garantida</span>
                  </div>
                  <p className="text-xs text-[#5B2E8C] mt-1">
                    Seus dados são criptografados e nunca compartilhados
                  </p>
                </div>

                <Button 
                  onClick={handleSalvarCartao} 
                  className="w-full"
                  disabled={!novoCartao.numero || !novoCartao.nome || !novoCartao.validade || !novoCartao.cvv}
                >
                  Salvar Cartão
                </Button>
              </>
            ) : (
              // Formulário do PIX
              <>
                <div className="space-y-2">
                  <Label htmlFor="tipo-pix">Tipo de Chave</Label>
                  <select
                    id="tipo-pix"
                    value={novoPix.tipo}
                    onChange={(e) => setNovoPix(prev => ({ 
                      ...prev, 
                      tipo: e.target.value as any,
                      valor: '' 
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Telefone</option>
                    <option value="chave-aleatoria">Chave Aleatória</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-pix">
                    {novoPix.tipo === 'cpf' ? 'CPF' :
                     novoPix.tipo === 'email' ? 'E-mail' :
                     novoPix.tipo === 'telefone' ? 'Telefone' : 'Chave Aleatória'}
                  </Label>
                  <Input
                    id="valor-pix"
                    placeholder={
                      novoPix.tipo === 'cpf' ? '000.000.000-00' :
                      novoPix.tipo === 'email' ? 'seu@email.com' :
                      novoPix.tipo === 'telefone' ? '(11) 99999-9999' : 'Cole sua chave aleatória'
                    }
                    value={novoPix.valor}
                    onChange={(e) => setNovoPix(prev => ({ 
                      ...prev, 
                      valor: e.target.value 
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="principal-pix"
                    checked={novoPix.isPrincipal}
                    onCheckedChange={(checked) => setNovoPix(prev => ({ 
                      ...prev, 
                      isPrincipal: checked 
                    }))}
                  />
                  <Label htmlFor="principal-pix" className="text-sm">
                    Definir como chave principal
                  </Label>
                </div>

                <div className="bg-[#D4F0E2] border border-[#A3D9BE] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[#0A6B45]">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">PIX Instantâneo</span>
                  </div>
                  <p className="text-xs text-[#0A6B45] mt-1">
                    Pagamentos processados em segundos, 24h por dia
                  </p>
                </div>

                <Button 
                  onClick={handleSalvarPix} 
                  className="w-full"
                  disabled={!novoPix.valor}
                >
                  Salvar Chave PIX
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}