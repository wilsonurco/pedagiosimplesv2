import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Search,
  Loader2
} from "lucide-react";

interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  ano: number;
  categoria: string;
  isAtivo: boolean;
  ultimoUso: string;
  totalPendencias: number;
  valorPendente: number;
  totalPago: number;
}

interface VeiculosCadastradosProps {
  onIrParaConsulta?: (placa: string) => void;
  onIrParaPagamentoDireto?: (placa: string) => void;
}

export function VeiculosCadastrados({ onIrParaConsulta, onIrParaPagamentoDireto }: VeiculosCadastradosProps = {}) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState<Veiculo | null>(null);
  const [dialogExclusaoAberto, setDialogExclusaoAberto] = useState(false);
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<Veiculo | null>(null);

  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '',
    marca: '',
    modelo: '',
    cor: '',
    ano: new Date().getFullYear(),
    categoria: ''
  });

  const [consultandoVeiculo, setConsultandoVeiculo] = useState(false);
  const [dadosVeiculoAPI, setDadosVeiculoAPI] = useState<{
    marca: string;
    modelo: string;
    categoria: string;
  } | null>(null);
  const [erroConsultaAPI, setErroConsultaAPI] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPlaca = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  };

  // Consulta automática via API pública simulada - Base ampliada de veículos brasileiros
  const consultarVeiculoPorPlaca = async (placa: string) => {
    setConsultandoVeiculo(true);
    setDadosVeiculoAPI(null);
    
    try {
      // Simular delay realista da API (1-3 segundos)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      // Base expandida de dados simulada - Veículos brasileiros mais comuns
      const baseVeiculos: { [key: string]: { marca: string; modelo: string; categoria: string } } = {
        // Honda
        'ABC1234': { marca: 'Honda', modelo: 'Civic Sedan 2.0', categoria: 'Categoria 2 - Carro de passeio' },
        'HND0001': { marca: 'Honda', modelo: 'City Hatchback', categoria: 'Categoria 2 - Carro de passeio' },
        'HND0002': { marca: 'Honda', modelo: 'HR-V EXL', categoria: 'Categoria 2 - Carro de passeio' },
        'HND0003': { marca: 'Honda', modelo: 'Fit Personal', categoria: 'Categoria 2 - Carro de passeio' },
        'HND0004': { marca: 'Honda', modelo: 'WR-V EXL', categoria: 'Categoria 2 - Carro de passeio' },
        'HND0101': { marca: 'Honda', modelo: 'CB 600F Hornet', categoria: 'Categoria 1 - Moto' },
        'HND0102': { marca: 'Honda', modelo: 'PCX 150', categoria: 'Categoria 1 - Moto' },
        'HND0103': { marca: 'Honda', modelo: 'Biz 125', categoria: 'Categoria 1 - Moto' },
        
        // Toyota
        'DEF5678': { marca: 'Toyota', modelo: 'Corolla Cross XRE', categoria: 'Categoria 2 - Carro de passeio' },
        'TOY0001': { marca: 'Toyota', modelo: 'Corolla Altis', categoria: 'Categoria 2 - Carro de passeio' },
        'TOY0002': { marca: 'Toyota', modelo: 'Yaris Sedan XL', categoria: 'Categoria 2 - Carro de passeio' },
        'TOY0003': { marca: 'Toyota', modelo: 'RAV4 Hybrid', categoria: 'Categoria 2 - Carro de passeio' },
        'TOY0004': { marca: 'Toyota', modelo: 'Hilux Cabine Dupla', categoria: 'Categoria 3 - Caminhonete/Van' },
        'TOY0005': { marca: 'Toyota', modelo: 'SW4 Diamond', categoria: 'Categoria 3 - Caminhonete/Van' },
        
        // Volkswagen
        'GHI9012': { marca: 'Volkswagen', modelo: 'Gol 1.0', categoria: 'Categoria 2 - Carro de passeio' },
        'VW00001': { marca: 'Volkswagen', modelo: 'Polo Highline', categoria: 'Categoria 2 - Carro de passeio' },
        'VW00002': { marca: 'Volkswagen', modelo: 'Virtus Comfortline', categoria: 'Categoria 2 - Carro de passeio' },
        'VW00003': { marca: 'Volkswagen', modelo: 'T-Cross Comfortline', categoria: 'Categoria 2 - Carro de passeio' },
        'VW00004': { marca: 'Volkswagen', modelo: 'Amarok Highline', categoria: 'Categoria 3 - Caminhonete/Van' },
        'VW00005': { marca: 'Volkswagen', modelo: 'Tiguan Allspace', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Ford
        'JKL3456': { marca: 'Ford', modelo: 'EcoSport Titanium', categoria: 'Categoria 2 - Carro de passeio' },
        'FOR0001': { marca: 'Ford', modelo: 'Ka Sedan Titanium', categoria: 'Categoria 2 - Carro de passeio' },
        'FOR0002': { marca: 'Ford', modelo: 'Territory Titanium', categoria: 'Categoria 2 - Carro de passeio' },
        'FOR0003': { marca: 'Ford', modelo: 'Ranger Limited', categoria: 'Categoria 3 - Caminhonete/Van' },
        'FOR0004': { marca: 'Ford', modelo: 'Bronco Sport', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Chevrolet
        'MNO7890': { marca: 'Chevrolet', modelo: 'Onix Plus Premier', categoria: 'Categoria 2 - Carro de passeio' },
        'CHV0001': { marca: 'Chevrolet', modelo: 'Tracker Premier', categoria: 'Categoria 2 - Carro de passeio' },
        'CHV0002': { marca: 'Chevrolet', modelo: 'Spin Activ', categoria: 'Categoria 3 - Caminhonete/Van' },
        'CHV0003': { marca: 'Chevrolet', modelo: 'S10 High Country', categoria: 'Categoria 3 - Caminhonete/Van' },
        'CHV0004': { marca: 'Chevrolet', modelo: 'Equinox Premier', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Motos - Yamaha
        'PQR1234': { marca: 'Yamaha', modelo: 'Fazer 250', categoria: 'Categoria 1 - Moto' },
        'YMH0001': { marca: 'Yamaha', modelo: 'YBR 125 Factor', categoria: 'Categoria 1 - Moto' },
        'YMH0002': { marca: 'Yamaha', modelo: 'MT-03 ABS', categoria: 'Categoria 1 - Moto' },
        'YMH0003': { marca: 'Yamaha', modelo: 'NMAX 160', categoria: 'Categoria 1 - Moto' },
        'YMH0004': { marca: 'Yamaha', modelo: 'Lander 250', categoria: 'Categoria 1 - Moto' },
        
        // Fiat
        'FIA0001': { marca: 'Fiat', modelo: 'Argo Drive', categoria: 'Categoria 2 - Carro de passeio' },
        'FIA0002': { marca: 'Fiat', modelo: 'Cronos Drive', categoria: 'Categoria 2 - Carro de passeio' },
        'FIA0003': { marca: 'Fiat', modelo: 'Pulse Drive', categoria: 'Categoria 2 - Carro de passeio' },
        'FIA0004': { marca: 'Fiat', modelo: 'Toro Ranch', categoria: 'Categoria 3 - Caminhonete/Van' },
        'FIA0005': { marca: 'Fiat', modelo: 'Fastback Turbo', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Jeep
        'JEE0001': { marca: 'Jeep', modelo: 'Compass Limited', categoria: 'Categoria 2 - Carro de passeio' },
        'JEE0002': { marca: 'Jeep', modelo: 'Renegade Sport', categoria: 'Categoria 2 - Carro de passeio' },
        'JEE0003': { marca: 'Jeep', modelo: 'Commander Limited', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Hyundai
        'HYU0001': { marca: 'Hyundai', modelo: 'HB20 Sense', categoria: 'Categoria 2 - Carro de passeio' },
        'HYU0002': { marca: 'Hyundai', modelo: 'Creta Action', categoria: 'Categoria 2 - Carro de passeio' },
        'HYU0003': { marca: 'Hyundai', modelo: 'Tucson Limited', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Nissan
        'NIS0001': { marca: 'Nissan', modelo: 'Versa Advance', categoria: 'Categoria 2 - Carro de passeio' },
        'NIS0002': { marca: 'Nissan', modelo: 'Kicks Advance', categoria: 'Categoria 2 - Carro de passeio' },
        'NIS0003': { marca: 'Nissan', modelo: 'Frontier Attack', categoria: 'Categoria 3 - Caminhonete/Van' },
        
        // Renault
        'REN0001': { marca: 'Renault', modelo: 'Sandero Stepway', categoria: 'Categoria 2 - Carro de passeio' },
        'REN0002': { marca: 'Renault', modelo: 'Kwid Intense', categoria: 'Categoria 2 - Carro de passeio' },
        'REN0003': { marca: 'Renault', modelo: 'Duster Iconic', categoria: 'Categoria 2 - Carro de passeio' },
        
        // Utilitários e Caminhões
        'VWX9012': { marca: 'Mercedes-Benz', modelo: 'Sprinter 415 CDI', categoria: 'Categoria 3 - Caminhonete/Van' },
        'MBZ0001': { marca: 'Mercedes-Benz', modelo: 'Accelo 1016', categoria: 'Categoria 4 - Caminhão 2 eixos' },
        'MBZ0002': { marca: 'Mercedes-Benz', modelo: 'Atego 1719', categoria: 'Categoria 4 - Caminhão 2 eixos' },
        'YZA3456': { marca: 'Iveco', modelo: 'Daily 70C17', categoria: 'Categoria 4 - Caminhão 2 eixos' },
        'IVE0001': { marca: 'Iveco', modelo: 'Tector 170E25', categoria: 'Categoria 4 - Caminhão 2 eixos' },
        'BCD7890': { marca: 'Scania', modelo: 'R 450 A6x2', categoria: 'Categoria 5 - Caminhão 3+ eixos' },
        'SCA0001': { marca: 'Scania', modelo: 'G 410 B6x2', categoria: 'Categoria 5 - Caminhão 3+ eixos' },
        'VOL0001': { marca: 'Volvo', modelo: 'FH 460 I-Shift', categoria: 'Categoria 5 - Caminhão 3+ eixos' },
        'VOL0002': { marca: 'Volvo', modelo: 'VM 270 I-Shift', categoria: 'Categoria 4 - Caminhão 2 eixos' }
      };
      
      const placaSemHifen = placa.replace('-', '');
      const dados = baseVeiculos[placaSemHifen];
      
      if (dados) {
        // Sucesso - Veículo encontrado
        setDadosVeiculoAPI(dados);
        setNovoVeiculo(prev => ({
          ...prev,
          marca: dados.marca,
          modelo: dados.modelo,
          categoria: dados.categoria
        }));
      } else {
        // Veículo não encontrado - Mostrar mensagem explicativa
        setDadosVeiculoAPI(null);
        setErroConsultaAPI('Veículo não encontrado na base de dados. Preencha os campos manualmente.');
        setNovoVeiculo(prev => ({
          ...prev,
          marca: '',
          modelo: '',
          categoria: ''
        }));
      }
    } catch (error) {
      console.error('Erro ao consultar veículo na API:', error);
      // Em caso de erro, mostrar mensagem e limpar os dados
      setDadosVeiculoAPI(null);
      setErroConsultaAPI('Erro temporário na consulta. Tente novamente em alguns instantes.');
      setNovoVeiculo(prev => ({
        ...prev,
        marca: '',
        modelo: '',
        categoria: ''
      }));
    } finally {
      setConsultandoVeiculo(false);
    }
  };

  const veiculosFiltrados = veiculos;

  const handleSalvarVeiculo = () => {
    if (veiculoEditando) {
      // Editando veículo existente
      setVeiculos(prev => prev.map(v => 
        v.id === veiculoEditando.id 
          ? { ...veiculoEditando, ...novoVeiculo }
          : v
      ));
    } else {
      // Adicionando novo veículo
      const novoVeiculoData: Veiculo = {
        id: `vei-${Date.now()}`,
        ...novoVeiculo,
        isAtivo: true,
        ultimoUso: new Date().toISOString().split('T')[0],
        totalPendencias: 0,
        valorPendente: 0.00,
        totalPago: 0
      };

      setVeiculos(prev => [...prev, novoVeiculoData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setNovoVeiculo({
      placa: '',
      marca: '',
      modelo: '',
      cor: '',
      ano: new Date().getFullYear(),
      categoria: ''
    });
    setVeiculoEditando(null);
    setModalAberto(false);
    setConsultandoVeiculo(false);
    setDadosVeiculoAPI(null);
    setErroConsultaAPI('');
  };

  const handleEditarVeiculo = (veiculo: Veiculo) => {
    setVeiculoEditando(veiculo);
    setNovoVeiculo({
      placa: veiculo.placa,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      cor: veiculo.cor,
      ano: veiculo.ano,
      categoria: veiculo.categoria
    });
    setModalAberto(true);
  };

  const handleAbrirDialogExclusao = (veiculo: Veiculo) => {
    setVeiculoParaExcluir(veiculo);
    setDialogExclusaoAberto(true);
  };

  const handleConfirmarExclusao = () => {
    if (veiculoParaExcluir) {
      setVeiculos(prev => prev.filter(v => v.id !== veiculoParaExcluir.id));
      setDialogExclusaoAberto(false);
      setVeiculoParaExcluir(null);
    }
  };

  const handleCancelarExclusao = () => {
    setDialogExclusaoAberto(false);
    setVeiculoParaExcluir(null);
  };

  const getIconeCategoria = (categoria: string) => {
    if (categoria.includes('Moto')) {
      return '🏍️';
    } else if (categoria.includes('Caminhão')) {
      return '🚛';
    } else if (categoria.includes('Caminhonete') || categoria.includes('Van')) {
      return '🚐';
    }
    return '🚗';
  };

  const getCorStatus = (veiculo: Veiculo) => {
    if (veiculo.totalPendencias > 0) {
      return 'border-red-200 bg-red-50';
    }
    return 'border-gray-200 hover:bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas dos veículos */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {/* Card Total de Veículos */}
        <div className="group bg-white hover:bg-gradient-to-br hover:from-[#003566]/5 hover:to-[#003566]/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#003566]/10">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            {/* Ícone */}
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-[#003566] to-[#004080] rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Car className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            
            {/* Valor */}
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-lg sm:text-3xl font-bold text-[#003566] leading-none">
                {veiculos.filter(v => v.isAtivo).length}
              </p>
              <p className="text-xs sm:text-sm text-[#6C757D]/80 leading-tight px-1">
                Veículos
              </p>
            </div>
          </div>
        </div>

        {/* Card Com Pendências */}
        <div className="group bg-white hover:bg-gradient-to-br hover:from-[#FF4757]/5 hover:to-[#FF4757]/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#FF4757]/10">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            {/* Ícone */}
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF4757] to-[#ff3742] rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            
            {/* Valor */}
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-lg sm:text-3xl font-bold text-[#FF4757] leading-none">
                {veiculos.filter(v => v.totalPendencias > 0).length}
              </p>
              <p className="text-xs sm:text-sm text-[#6C757D]/80 leading-tight px-1">
                Pendentes
              </p>
            </div>
          </div>
        </div>

        {/* Card Total Pago */}
        <div className="group bg-white hover:bg-gradient-to-br hover:from-[#28A745]/5 hover:to-[#28A745]/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#28A745]/10">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            {/* Ícone */}
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-[#28A745] to-[#20923a] rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            
            {/* Valor */}
            <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
              <p className="text-sm sm:text-2xl font-bold text-[#28A745] leading-none truncate">
                {formatCurrency(veiculos.reduce((sum, v) => sum + v.totalPago, 0))}
              </p>
              <p className="text-xs sm:text-sm text-[#6C757D]/80 leading-tight px-1">
                Total Pago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de busca e ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Meus Veículos
            </CardTitle>
            <Button onClick={() => setModalAberto(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Veículo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Botão Pagar Todas - Aparece quando há mais de um veículo com pendências */}
            {veiculosFiltrados.filter(v => v.totalPendencias > 0).length > 1 && (
              <div className="bg-gradient-to-r from-[#003566] to-[#004080] rounded-lg p-4 border-2 border-[#00B4D8] shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-[#FFD60A]" />
                    </div>
                    <div className="flex-1 text-white">
                      <h3 className="font-bold text-lg mb-1">
                        {veiculosFiltrados.filter(v => v.totalPendencias > 0).reduce((acc, v) => acc + v.totalPendencias, 0)} pendências em {veiculosFiltrados.filter(v => v.totalPendencias > 0).length} veículos - {formatCurrency(veiculosFiltrados.filter(v => v.totalPendencias > 0).reduce((acc, v) => acc + v.valorPendente, 0))}
                      </h3>
                      <p className="text-sm text-white/90">
                        Quite todas as pendências de uma só vez e economize tempo
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => {
                      const veiculosComPendencias = veiculosFiltrados.filter(v => v.totalPendencias > 0);
                      const placas = veiculosComPendencias.map(v => v.placa);
                      if (onIrParaPagamentoDireto) {
                        // Passar todas as placas como string separada por vírgula
                        onIrParaPagamentoDireto(placas.join(','));
                      }
                    }}
                    className="bg-[#FFD60A] hover:bg-[#e6c109] text-[#000000] font-bold h-12 px-6 whitespace-nowrap shadow-xl hover:shadow-2xl transition-all"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Pagar Todas as Pendências
                  </Button>
                </div>
              </div>
            )}

            {veiculosFiltrados.length > 0 ? (
              veiculosFiltrados.map((veiculo) => (
                <div key={veiculo.id} className={`border rounded-lg p-3 sm:p-4 transition-colors ${getCorStatus(veiculo)}`}>
                  {/* Layout Mobile Otimizado */}
                  <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
                    {/* Header com ícone e informações principais */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#003566]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Car className="h-6 w-6 sm:h-8 sm:w-8 text-[#003566]" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2 sm:space-y-1">
                        {/* Placa e badges */}
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="text-lg sm:text-xl font-bold text-[#000000] leading-tight">{veiculo.placa}</h4>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {veiculo.isPrincipal && (
                              <Badge variant="default" className="absolute top-0 right-0 text-xs bg-[#003566] text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Principal
                              </Badge>
                            )}
                            {veiculo.totalPendencias > 0 && (
                              <Badge variant="destructive" className="text-xs bg-[#FF4757] text-white">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {veiculo.totalPendencias} pendência{veiculo.totalPendencias > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Estatísticas em mobile: empilhadas; desktop: lado a lado */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#6C757D]">Total pago:</span>
                            <span className="font-bold text-[#28A745]">{formatCurrency(veiculo.totalPago)}</span>
                          </div>
                          {veiculo.totalPendencias > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#6C757D]">Pendências:</span>
                              <span className="font-bold text-[#FF4757]">{veiculo.totalPendencias} ({formatCurrency(veiculo.valorPendente)})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:flex-shrink-0">
                      {veiculo.totalPendencias > 0 && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Navegar para a página de pagamento com a placa pré-preenchida
                            if (onIrParaPagamentoDireto) {
                              onIrParaPagamentoDireto(veiculo.placa);
                            } else if (onIrParaConsulta) {
                              onIrParaConsulta(veiculo.placa);
                            } else {
                              window.location.href = `/?placa=${veiculo.placa}`;
                            }
                          }}
                          className="text-xs sm:text-sm h-9 sm:h-8 px-3 sm:px-4 bg-[#003566] hover:bg-[#004080] text-white"
                          title="Ir para pagamento"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Pagar Agora
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAbrirDialogExclusao(veiculo)}
                        className="text-xs sm:text-sm h-9 sm:h-8 px-2 sm:px-3 border-[#FF4757] text-[#FF4757] hover:bg-[#FF4757] hover:text-white"
                        title="Remover veículo"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sm:hidden ml-1">Remover</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum veículo cadastrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Adicione seus veículos para facilitar futuras consultas
                </p>
                <Button onClick={() => setModalAberto(true)}>
                  Adicionar Primeiro Veículo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para adicionar/editar veículo */}
      <Dialog open={modalAberto} onOpenChange={(open) => {
        if (!open) resetForm();
        setModalAberto(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {veiculoEditando ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
            </DialogTitle>
            <DialogDescription>
              {veiculoEditando 
                ? 'Atualize as informações do seu veículo conforme necessário.'
                : 'Preencha as informações do veículo que deseja adicionar à sua conta.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa do Veículo</Label>
              <div className="relative">
                <Input
                  id="placa"
                  placeholder="ABC-1234"
                  value={novoVeiculo.placa}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();
                    // Remove caracteres não alfanuméricos
                    value = value.replace(/[^A-Z0-9]/g, '');
                    
                    // Aplica máscara XXX-9999 para placas modelo antigo (3 letras + 4 números)
                    if (value.length >= 4 && /^[A-Z]{3}[0-9]/.test(value)) {
                      // Formato: ABC-1234
                      value = value.slice(0, 3) + '-' + value.slice(3, 7);
                    }
                    
                    // Limita o tamanho máximo
                    if (value.includes('-')) {
                      value = value.slice(0, 8); // ABC-1234 = 8 caracteres
                    } else {
                      value = value.slice(0, 7); // Máximo 7 caracteres sem hífen
                    }
                    
                    setNovoVeiculo(prev => ({ 
                      ...prev, 
                      placa: value 
                    }));
                    
                    // Limpar mensagens de erro/sucesso quando a placa mudar
                    if (value.length < 7) {
                      setDadosVeiculoAPI(null);
                      setErroConsultaAPI('');
                    }
                  }}
                  maxLength={8}
                  className="text-center font-semibold tracking-wider"
                />
              </div>
              <p className="text-xs text-gray-600">
                Digite apenas a placa do veículo para cadastrar
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Car className="h-4 w-4" />
                <span className="text-sm font-semibold">Simplicidade</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Cadastro simplificado - apenas a placa é necessária para consultar pendências
              </p>
            </div>

            <Button 
              onClick={handleSalvarVeiculo} 
              className="w-full"
              disabled={!novoVeiculo.placa || novoVeiculo.placa.length < 7}
            >
              {veiculoEditando ? 'Salvar Alterações' : 'Adicionar Veículo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={dialogExclusaoAberto} onOpenChange={setDialogExclusaoAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {veiculoParaExcluir && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Placa:
                    </p>
                    <p className="text-2xl font-bold text-gray-900 tracking-wider">
                      {veiculoParaExcluir.placa}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-700">
              Tem certeza que deseja remover este veículo? O histórico de pagamentos associado a este veículo será mantido, mas você não poderá mais consultá-lo diretamente.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelarExclusao}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmarExclusao}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Veículo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}