import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormaPagamento } from '../components/FormaPagamento';
import { action, mockPassagens, mockValorTotal } from './_mocks';

/**
 * Seleção da forma de pagamento (PIX ou cartão de crédito) para as
 * passagens selecionadas.
 */
const meta = {
  title: 'Components/FormaPagamento',
  component: FormaPagamento,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onBack: action('onBack'),
    onPagar: action('onPagar'),
    onPIX: action('onPIX'),
    valorTotal: mockValorTotal,
    debitosSelecionados: mockPassagens,
  },
  argTypes: {
    valorTotal: { control: { type: 'number', min: 0, step: 10 } },
  },
} satisfies Meta<typeof FormaPagamento>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado inicial — 3 passagens selecionadas. */
export const Default: Story = {};

/** Valor alto com uma única passagem. */
export const PagamentoUnico: Story = {
  name: 'Passagem única',
  args: { valorTotal: 12.5, debitosSelecionados: [mockPassagens[0]] },
};
