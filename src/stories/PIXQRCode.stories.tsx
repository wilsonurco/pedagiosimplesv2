import type { Meta, StoryObj } from '@storybook/react-vite';
import { PIXQRCode } from '../components/PIXQRCode';
import { action, mockPassagens, mockValorTotal } from './_mocks';

/**
 * Tela de pagamento via PIX com QR Code, código copia-e-cola e timer.
 *
 * ⚠️ Este componente simula a confirmação automática do pagamento alguns
 * segundos após montar (aguardando → processando → confirmado). Útil para
 * visualizar os três estados do badge de status sem backend.
 */
const meta = {
  title: 'Components/PIXQRCode',
  component: PIXQRCode,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onBack: action('onBack'),
    onPagamentoConfirmado: action('onPagamentoConfirmado'),
    valorTotal: mockValorTotal,
    debitosSelecionados: mockPassagens,
  },
  argTypes: {
    valorTotal: { control: { type: 'number', min: 0, step: 10 } },
  },
} satisfies Meta<typeof PIXQRCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
