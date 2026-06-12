import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConsultarNovaPlacaForm } from '../components/ConsultarNovaPlacaForm';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const noop = () => {};

const meta = {
  title: 'Components/ConsultarNovaPlacaForm',
  component: ConsultarNovaPlacaForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  // Defaults para todos os stories (evita erros de args required)
  args: {
    placa: '',
    onPlacaChange: noop,
    onBuscar: noop,
    onAdicionar: noop,
    onFechar: noop,
    consultando: false,
    resultado: null,
    formatCurrency,
  },
} satisfies Meta<typeof ConsultarNovaPlacaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Wrapper com estado local ─────────────────────────────────────

function StatefulForm({ initialResultado, className }: {
  initialResultado?: { success: boolean; quantidade: number; valorTotal: number } | null;
  className?: string;
}) {
  const [placa, setPlaca] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(initialResultado ?? null);

  const handleBuscar = () => {
    setConsultando(true);
    setTimeout(() => {
      setConsultando(false);
      setResultado({ success: true, quantidade: 2, valorTotal: 165.0 });
    }, 1200);
  };

  return (
    <div className={`max-w-xs ${className ?? ''}`}>
      <ConsultarNovaPlacaForm
        placa={placa}
        onPlacaChange={setPlaca}
        onBuscar={handleBuscar}
        onAdicionar={() => alert('Débitos adicionados!')}
        onFechar={() => alert('Formulário fechado')}
        consultando={consultando}
        resultado={resultado}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// ─── Stories ─────────────────────────────────────────────────────

/** Estado inicial — campo vazio, sem consulta */
export const Default: Story = {
  render: () => <StatefulForm />,
};

/** Após consulta com débitos encontrados */
export const ComResultadoSucesso: Story = {
  render: () => (
    <StatefulForm
      initialResultado={{ success: true, quantidade: 3, valorTotal: 247.5 }}
    />
  ),
};

/** Após consulta sem débitos */
export const ComResultadoVazio: Story = {
  render: () => (
    <StatefulForm
      initialResultado={{ success: false, quantidade: 0, valorTotal: 0 }}
    />
  ),
};

/** Uso em Estado 2 — formulário centralizado */
export const Centralizado: Story = {
  name: 'Uso em Estado 2 (centralizado)',
  render: () => (
    <div className="flex justify-center p-8 bg-[#F7F5FB] rounded-xl w-full max-w-md">
      <StatefulForm className="max-w-xs mx-auto" />
    </div>
  ),
};

/** Uso em Estado 3 — formulário inline no card */
export const InCard: Story = {
  name: 'Uso em Estado 3 (dentro do Card)',
  render: () => (
    <div className="border border-[#ECECF1] rounded-xl p-4 w-full max-w-sm bg-white">
      <p className="text-xs font-medium text-[#5B5C68] mb-3">Débitos selecionados</p>
      <div className="border-t border-[#ECECF1] pt-3">
        <ConsultarNovaPlacaForm
          placa="ABC"
          onPlacaChange={noop}
          onBuscar={noop}
          onAdicionar={noop}
          onFechar={noop}
          consultando={false}
          resultado={null}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  ),
};
