import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipoPassagemBadge } from '../components/ui/tipo-passagem-badge';

const meta = {
  title: 'UI/TipoPassagemBadge',
  component: TipoPassagemBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tipo: {
      control: 'radio',
      options: ['praca_fisica', 'portico_free_flow'],
      description: 'Tipo da passagem de pedágio',
    },
  },
  args: { tipo: 'praca_fisica' },
} satisfies Meta<typeof TipoPassagemBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PracaFisica: Story = {
  name: 'Praça física',
  args: { tipo: 'praca_fisica' },
};

export const PorticoFreeFlow: Story = {
  name: 'Pórtico Free Flow',
  args: { tipo: 'portico_free_flow' },
};

export const Ambos: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <TipoPassagemBadge tipo="praca_fisica" />
      <TipoPassagemBadge tipo="portico_free_flow" />
    </div>
  ),
};
