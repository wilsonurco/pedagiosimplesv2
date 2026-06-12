import type { Meta, StoryObj } from '@storybook/react';
import { PagamentoSummary } from '../components/PagamentoSummary';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const noop = () => {};

const meta = {
  title: 'Components/PagamentoSummary',
  component: PagamentoSummary,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onProsseguir: noop,
    formatCurrency,
    valorTotal: 247.5,
    totalPassagens: 3,
    selecionadas: 2,
    variant: 'inline' as const,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['inline', 'sidebar'],
      description: '"inline" = mobile · "sidebar" = desktop sticky',
    },
    valorTotal: { control: { type: 'number', min: 0, step: 10 } },
    totalPassagens: { control: { type: 'number', min: 0 } },
    selecionadas: { control: { type: 'number', min: 0 } },
  },
} satisfies Meta<typeof PagamentoSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Variant: inline (mobile) ─────────────────────────────────────

/** Nenhum débito selecionado — botão desabilitado */
export const InlineSemSelecao: Story = {
  name: 'Inline — Sem seleção (desabilitado)',
  args: { variant: 'inline', valorTotal: 0, totalPassagens: 3, selecionadas: 0 },
};

/** 2 de 3 débitos selecionados */
export const InlineComSelecao: Story = {
  name: 'Inline — Com seleção',
  args: { variant: 'inline', valorTotal: 247.5, totalPassagens: 3, selecionadas: 2 },
};

/** Todos os débitos selecionados */
export const InlineTodosSelec: Story = {
  name: 'Inline — Todos selecionados',
  args: { variant: 'inline', valorTotal: 371.25, totalPassagens: 3, selecionadas: 3 },
};

// ─── Variant: sidebar (desktop) ───────────────────────────────────

/** Sidebar sem seleção */
export const SidebarSemSelecao: Story = {
  name: 'Sidebar — Sem seleção',
  args: { variant: 'sidebar', valorTotal: 0, totalPassagens: 3, selecionadas: 0 },
  decorators: [
    (Story) => (
      <div className="w-72 bg-white rounded-xl border border-[#ECECF1] p-5">
        <Story />
      </div>
    ),
  ],
};

/** Sidebar com 2 selecionados */
export const SidebarComSelecao: Story = {
  name: 'Sidebar — Com seleção',
  args: { variant: 'sidebar', valorTotal: 247.5, totalPassagens: 3, selecionadas: 2 },
  decorators: [
    (Story) => (
      <div className="w-72 bg-white rounded-xl border border-[#ECECF1] p-5">
        <Story />
      </div>
    ),
  ],
};

// ─── Comparação lado a lado ───────────────────────────────────────

/** Comparação das duas variantes lado a lado */
export const ComparacaoVariants: Story = {
  name: 'Comparação: inline vs sidebar',
  render: (args) => (
    <div className="flex flex-col md:flex-row gap-8 items-start p-4">
      <div>
        <p className="text-xs font-semibold text-[#8B5FFF] mb-3 uppercase tracking-wide">
          Variant: inline (mobile)
        </p>
        <div className="max-w-sm border border-[#ECECF1] rounded-xl p-4">
          <PagamentoSummary {...args} variant="inline" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-[#8B5FFF] mb-3 uppercase tracking-wide">
          Variant: sidebar (desktop)
        </p>
        <div className="w-72 border border-[#ECECF1] rounded-xl p-5">
          <PagamentoSummary {...args} variant="sidebar" />
        </div>
      </div>
    </div>
  ),
};
