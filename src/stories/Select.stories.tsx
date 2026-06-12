import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pix">PIX</SelectItem>
        <SelectItem value="cartao">Cartão de crédito</SelectItem>
        <SelectItem value="boleto">Boleto</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const ComLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>Método de pagamento</Label>
      <Select defaultValue="pix">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pix">PIX</SelectItem>
          <SelectItem value="cartao">Cartão de crédito</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Agrupado: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a concessionária" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>São Paulo</SelectLabel>
          <SelectItem value="ccr">CCR AutoBAn</SelectItem>
          <SelectItem value="arteris">Arteris</SelectItem>
          <SelectItem value="rota">Rota das Bandeiras</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Outras</SelectLabel>
          <SelectItem value="ecorodovias">EcoRodovias</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Desabilitado: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder="Indisponível" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="x">Opção</SelectItem>
      </SelectContent>
    </Select>
  ),
};
