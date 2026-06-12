import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Search } from 'lucide-react';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
      description: 'Tipo nativo do input',
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Digite aqui...',
    type: 'text',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" type="email" placeholder="voce@email.com" {...args} />
    </div>
  ),
};

export const Placa: Story = {
  name: 'Placa do veículo',
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="placa">Placa</Label>
      <Input
        id="placa"
        placeholder="ABC-1234"
        className="uppercase tracking-widest font-medium"
        {...args}
      />
    </div>
  ),
};

export const ComIcone: Story = {
  name: 'Com ícone (busca)',
  render: (args) => (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder="Buscar por placa ou protocolo..." {...args} />
    </div>
  ),
};

export const Invalido: Story = {
  name: 'Inválido (aria-invalid)',
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="cpf">CPF</Label>
      <Input id="cpf" aria-invalid defaultValue="000.000" {...args} />
      <p className="text-xs text-destructive">CPF inválido. Verifique os dígitos.</p>
    </div>
  ),
};

export const Desabilitado: Story = {
  args: { disabled: true, defaultValue: 'Campo bloqueado' },
};
